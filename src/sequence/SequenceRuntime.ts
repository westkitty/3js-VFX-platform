/**
 * Deterministic semantic sequence interpreter.
 *
 * TIME OWNERSHIP: this runtime never reads wall-clock time and never schedules
 * its own callbacks. It advances only when the caller hands it a simulation
 * delta that EngineClock produced, so pausing the clock pauses the sequence and
 * single-stepping the clock single-steps the sequence.
 *
 * Leftover time is threaded between stages, so advancing by one 32ms step and
 * advancing by two 16ms steps land on identical state.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SeededRandom } from '../core/SeededRandom';
import {
  SequenceDefinition,
  SequenceNode,
  isContainerNode,
  leafDuration,
  nodeDuration,
} from './SequenceModel';

export type SequenceStatus = 'idle' | 'running' | 'complete';

/** Payload handed to the emitter when an `emit` stage begins. */
export interface SequenceEmitEvent {
  abilityId: string;
  nodeId: string;
  /** Deterministically derived from the sequence root seed. */
  seed: number;
  /** Sequence-local elapsed time at which the stage fired. */
  elapsed: number;
}

/**
 * Side-effect boundary. The interpreter stays generic: it knows about stages,
 * not about any particular ability, renderer, or scene object.
 */
export interface SequenceEmitter {
  emit(event: SequenceEmitEvent): void;
  /** Called on stop()/restart() so owned runtime objects are released. */
  cancelAll?(): void;
}

export interface SequenceRuntimeState {
  status: SequenceStatus;
  elapsed: number;
  duration: number;
  activeNodeIds: string[];
  completedNodeIds: string[];
  /** 0..1 progress for every entered node; makes travel/field observable. */
  nodeProgress: Record<string, number>;
  emitCount: number;
  lastEmit: SequenceEmitEvent | null;
}

interface NodeRuntime {
  node: SequenceNode;
  children: NodeRuntime[];
  elapsed: number;
  entered: boolean;
  complete: boolean;
}

function buildRuntimeTree(node: SequenceNode): NodeRuntime {
  return {
    node,
    children: isContainerNode(node) ? node.children.map(buildRuntimeTree) : [],
    elapsed: 0,
    entered: false,
    complete: false,
  };
}

export class SequenceRuntime {
  private definition: SequenceDefinition | null = null;
  private tree: NodeRuntime | null = null;
  private random = new SeededRandom(0);
  private status: SequenceStatus = 'idle';
  private elapsed = 0;
  private duration = 0;
  private emitCount = 0;
  private lastEmit: SequenceEmitEvent | null = null;

  // Frame bookkeeping so a stage entered mid-frame can report its exact
  // sequence-local start time rather than the frame boundary.
  private frameStartElapsed = 0;
  private frameDt = 0;

  constructor(private readonly emitter: SequenceEmitter) {}

  /** Loads a definition and arms it in a deterministic initial state. */
  public load(definition: SequenceDefinition): void {
    this.emitter.cancelAll?.();
    this.definition = definition;
    this.duration = nodeDuration(definition.root);
    this.reset();
  }

  public getDefinition(): SequenceDefinition | null {
    return this.definition;
  }

  /** Rebuilds initial state. Same definition + same seed => same run. */
  public reset(): void {
    if (!this.definition) return;
    this.tree = buildRuntimeTree(this.definition.root);
    this.random.reset(this.definition.seed);
    this.elapsed = 0;
    this.emitCount = 0;
    this.lastEmit = null;
    this.status = 'idle';
  }

  public start(): void {
    if (!this.definition) return;
    this.reset();
    this.status = 'running';
  }

  /** Deterministic restart: clears owned runtime objects, then re-arms. */
  public restart(): void {
    this.emitter.cancelAll?.();
    this.start();
  }

  /** Cancels the run and releases sequence-owned runtime ownership. */
  public stop(): void {
    this.emitter.cancelAll?.();
    this.reset();
  }

  /**
   * Advances by one simulation delta. Returns true while the sequence is still
   * running. A non-positive delta never advances state.
   */
  public advance(dt: number): boolean {
    if (this.status !== 'running' || !this.tree) return false;
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;

    this.frameStartElapsed = this.elapsed;
    this.frameDt = safeDt;

    const leftover = this.advanceNode(this.tree, safeDt);
    this.elapsed += safeDt - (this.tree.complete ? leftover : 0);

    if (this.tree.complete) {
      this.status = 'complete';
      return false;
    }
    return true;
  }

  /**
   * Advances one node and returns the unconsumed remainder of `dt`.
   * A node that does not complete consumes everything and returns 0.
   */
  private advanceNode(runtime: NodeRuntime, dt: number): number {
    if (runtime.complete) return dt;
    if (!runtime.entered) {
      runtime.entered = true;
      // `dt` is what remains of the frame when this stage begins, so the
      // stage's exact sequence-local start time is recoverable.
      this.onEnter(runtime, this.frameStartElapsed + (this.frameDt - dt));
    }

    if (!isContainerNode(runtime.node)) return this.advanceLeaf(runtime, dt);
    if (runtime.node.type === 'sequence') return this.advanceSequence(runtime, dt);
    return this.advanceParallel(runtime, dt);
  }

  private advanceLeaf(runtime: NodeRuntime, dt: number): number {
    const duration = leafDuration(runtime.node);
    runtime.elapsed += dt;

    if (runtime.elapsed >= duration) {
      runtime.complete = true;
      return runtime.elapsed - duration;
    }
    return 0;
  }

  /** Children run in declared order; leftover time flows into the next child. */
  private advanceSequence(runtime: NodeRuntime, dt: number): number {
    let remaining = dt;

    for (const child of runtime.children) {
      if (child.complete) continue;
      remaining = this.advanceNode(child, remaining);
      if (!child.complete) {
        runtime.elapsed += dt;
        return 0;
      }
    }

    runtime.complete = true;
    runtime.elapsed += dt - remaining;
    return remaining;
  }

  /**
   * Children all start together and each receive the same delta.
   * join 'all' finishes with the slowest child; join 'any' with the fastest.
   */
  private advanceParallel(runtime: NodeRuntime, dt: number): number {
    const leftovers: number[] = [];

    for (const child of runtime.children) {
      if (child.complete) {
        leftovers.push(dt);
        continue;
      }
      const leftover = this.advanceNode(child, dt);
      leftovers.push(child.complete ? leftover : 0);
    }

    const join = (runtime.node as { join?: 'all' | 'any' }).join ?? 'all';
    const completedLeftovers = leftovers.filter((_, index) => runtime.children[index].complete);

    if (runtime.children.length === 0) {
      runtime.complete = true;
      return dt;
    }

    if (join === 'any') {
      if (completedLeftovers.length === 0) {
        runtime.elapsed += dt;
        return 0;
      }
      const leftover = Math.max(...completedLeftovers);
      runtime.complete = true;
      runtime.elapsed += dt - leftover;
      return leftover;
    }

    if (!runtime.children.every((child) => child.complete)) {
      runtime.elapsed += dt;
      return 0;
    }
    const leftover = Math.min(...completedLeftovers);
    runtime.complete = true;
    runtime.elapsed += dt - leftover;
    return leftover;
  }

  /** `emit` and side-effect stages with an abilityId trigger the emitter. */
  private onEnter(runtime: NodeRuntime, elapsedAtEntry: number): void {
    if (!('abilityId' in runtime.node) || typeof (runtime.node as any).abilityId !== 'string') return;

    const event: SequenceEmitEvent = {
      abilityId: (runtime.node as any).abilityId,
      nodeId: runtime.node.id,
      seed: Math.floor(this.random.next() * 0xffffffff),
      elapsed: elapsedAtEntry,
    };

    this.emitCount += 1;
    this.lastEmit = event;
    this.emitter.emit(event);
  }

  public getState(): SequenceRuntimeState {
    const activeNodeIds: string[] = [];
    const completedNodeIds: string[] = [];
    const nodeProgress: Record<string, number> = {};

    const walk = (runtime: NodeRuntime) => {
      if (runtime.complete) {
        completedNodeIds.push(runtime.node.id);
        nodeProgress[runtime.node.id] = 1;
      } else if (runtime.entered) {
        activeNodeIds.push(runtime.node.id);
        const total = isContainerNode(runtime.node) ? nodeDuration(runtime.node) : leafDuration(runtime.node);
        nodeProgress[runtime.node.id] = total > 0 ? Math.min(1, runtime.elapsed / total) : 0;
      }
      runtime.children.forEach(walk);
    };

    if (this.tree) walk(this.tree);

    return {
      status: this.status,
      elapsed: this.elapsed,
      duration: this.duration,
      activeNodeIds,
      completedNodeIds,
      nodeProgress,
      emitCount: this.emitCount,
      lastEmit: this.lastEmit,
    };
  }
}
