/**
 * Phase 4 checks for the semantic sequence runtime.
 *
 * Proves node meaning comes from scheduling behavior, that time ownership stays
 * with the caller-supplied simulation delta, and that determinism, pause,
 * restart, and cancellation hold. Pure: no WebGLRenderer and no DOM.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SequenceRuntime, type SequenceEmitEvent, type SequenceEmitter } from '../src/sequence/SequenceRuntime';
import { nodeDuration, type SequenceDefinition } from '../src/sequence/SequenceModel';
import { DECLARATIVE_SEQUENCE_PACK } from '../src/sequence/builtins';
import { findUnresolvedEmitTargets, validateSequenceDocument } from '../src/schema/SequenceValidator';
import { AbilityRegistry } from '../src/abilities/AbilityRegistry';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const STEP = 1 / 60;

class RecordingEmitter implements SequenceEmitter {
  public events: SequenceEmitEvent[] = [];
  public cancels = 0;

  emit(event: SequenceEmitEvent): void {
    this.events.push({ ...event });
  }

  cancelAll(): void {
    this.cancels += 1;
    this.events = [];
  }
}

function definition(root: SequenceDefinition['root'], seed = 12345): SequenceDefinition {
  return { schemaVersion: '1.0.0', id: 'test_sequence', name: 'Test', description: 'Test sequence.', seed, root };
}

/** Advances in fixed steps until complete or the budget runs out. */
function runToCompletion(runtime: SequenceRuntime, step = STEP, maxSteps = 10000): number {
  let steps = 0;
  while (runtime.getState().status === 'running' && steps < maxSteps) {
    runtime.advance(step);
    steps += 1;
  }
  return steps;
}

function checkSequenceOrdering() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);

  runtime.load(
    definition({
      id: 'root', type: 'sequence',
      children: [
        { id: 'a', type: 'emit', abilityId: 'first', duration: 0 },
        { id: 'w', type: 'wait', duration: 0.5 },
        { id: 'b', type: 'emit', abilityId: 'second', duration: 0 },
        { id: 'w2', type: 'wait', duration: 0.25 },
        { id: 'c', type: 'emit', abilityId: 'third', duration: 0 },
      ],
    }),
  );

  runtime.start();
  runToCompletion(runtime);

  assert.deepEqual(
    emitter.events.map((event) => event.abilityId),
    ['first', 'second', 'third'],
    'sequence children must run in declared order',
  );

  // Ordering is by schedule, not by array position alone: the middle emit must
  // not fire until its preceding wait has elapsed.
  assert.ok(Math.abs(emitter.events[1].elapsed - 0.5) < 1e-9, 'second emit must fire at 0.5s');
  assert.ok(Math.abs(emitter.events[2].elapsed - 0.75) < 1e-9, 'third emit must fire at 0.75s');
}

function checkWaitTiming() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(definition({ id: 'root', type: 'sequence', children: [{ id: 'w', type: 'wait', duration: 1 }] }));
  runtime.start();

  // A wait advances nothing until its duration expires.
  for (let i = 0; i < 59; i++) runtime.advance(STEP);
  assert.equal(runtime.getState().status, 'running', 'wait must still be running before its duration elapses');

  runtime.advance(STEP);
  assert.equal(runtime.getState().status, 'complete', 'wait must complete exactly at its duration');
  assert.ok(Math.abs(runtime.getState().elapsed - 1) < 1e-9);
}

function checkParallelSemantics() {
  const emitterAll = new RecordingEmitter();
  const runtimeAll = new SequenceRuntime(emitterAll);
  runtimeAll.load(
    definition({
      id: 'root', type: 'parallel', join: 'all',
      children: [
        { id: 'short', type: 'field', duration: 0.5 },
        { id: 'long', type: 'field', duration: 1.5 },
      ],
    }),
  );
  runtimeAll.start();

  // Both children start together.
  runtimeAll.advance(STEP);
  const early = runtimeAll.getState();
  assert.ok(early.activeNodeIds.includes('short') && early.activeNodeIds.includes('long'), 'parallel children must start together');

  runToCompletion(runtimeAll);
  assert.ok(Math.abs(runtimeAll.getState().elapsed - 1.5) < 1e-9, "join 'all' must finish with the slowest child");

  const emitterAny = new RecordingEmitter();
  const runtimeAny = new SequenceRuntime(emitterAny);
  runtimeAny.load(
    definition({
      id: 'root', type: 'parallel', join: 'any',
      children: [
        { id: 'short', type: 'field', duration: 0.5 },
        { id: 'long', type: 'field', duration: 1.5 },
      ],
    }),
  );
  runtimeAny.start();
  runToCompletion(runtimeAny);
  assert.ok(Math.abs(runtimeAny.getState().elapsed - 0.5) < 1e-9, "join 'any' must finish with the fastest child");

  // Parallel emits fire together, not sequentially.
  const emitterBoth = new RecordingEmitter();
  const runtimeBoth = new SequenceRuntime(emitterBoth);
  runtimeBoth.load(
    definition({
      id: 'root', type: 'parallel',
      children: [
        { id: 'e1', type: 'emit', abilityId: 'alpha', duration: 0.4 },
        { id: 'e2', type: 'emit', abilityId: 'beta', duration: 0.4 },
      ],
    }),
  );
  runtimeBoth.start();
  runtimeBoth.advance(STEP);
  assert.equal(emitterBoth.events.length, 2, 'parallel emits must both fire on entry');
  assert.equal(emitterBoth.events[0].elapsed, 0);
  assert.equal(emitterBoth.events[1].elapsed, 0);
}

function checkTravelSemantics() {
  // Derived from distance/speed.
  const derived = new SequenceRuntime(new RecordingEmitter());
  derived.load(definition({ id: 'root', type: 'travel', distance: 24, speed: 60 }));
  assert.ok(Math.abs(nodeDuration(derived.getDefinition()!.root) - 0.4) < 1e-9, 'travel must derive duration from distance/speed');
  derived.start();
  runToCompletion(derived);
  assert.ok(Math.abs(derived.getState().elapsed - 0.4) < 1e-9, 'travel must occupy its derived duration');

  // Explicit duration wins.
  const explicit = new SequenceRuntime(new RecordingEmitter());
  explicit.load(definition({ id: 'root', type: 'travel', duration: 0.75, distance: 10, speed: 5 }));
  assert.ok(Math.abs(nodeDuration(explicit.getDefinition()!.root) - 0.75) < 1e-9, 'explicit travel duration must win');

  // Travel progress is observable mid-flight.
  explicit.start();
  explicit.advance(0.375);
  const progress = explicit.getState().nodeProgress.root;
  assert.ok(Math.abs(progress - 0.5) < 1e-6, `travel must report progress (got ${progress})`);

  // Zero speed with no duration is instantaneous rather than infinite.
  const degenerate = new SequenceRuntime(new RecordingEmitter());
  degenerate.load(definition({ id: 'root', type: 'travel', distance: 10, speed: 0 }));
  degenerate.start();
  degenerate.advance(STEP);
  assert.equal(degenerate.getState().status, 'complete', 'zero-speed travel must not hang');
}

function checkStageDurations() {
  for (const type of ['impact', 'field', 'residue'] as const) {
    const runtime = new SequenceRuntime(new RecordingEmitter());
    runtime.load(definition({ id: 'root', type, duration: 0.9 }));
    runtime.start();

    runtime.advance(0.45);
    assert.equal(runtime.getState().status, 'running', `${type} must hold for its duration`);
    assert.ok(Math.abs(runtime.getState().nodeProgress.root - 0.5) < 1e-6, `${type} must report progress`);

    runToCompletion(runtime);
    assert.ok(Math.abs(runtime.getState().elapsed - 0.9) < 1e-9, `${type} must complete at its duration`);
  }
}

function checkEmitSemantics() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(
    definition({
      id: 'root', type: 'sequence',
      children: [
        { id: 'w', type: 'wait', duration: 0.2 },
        { id: 'e', type: 'emit', abilityId: 'decl_arc_lash', duration: 0.3 },
      ],
    }),
  );

  runtime.start();
  assert.equal(emitter.events.length, 0, 'emit must not fire before its stage is reached');

  runToCompletion(runtime);
  assert.equal(emitter.events.length, 1, 'emit must fire exactly once');
  assert.equal(emitter.events[0].abilityId, 'decl_arc_lash');
  assert.equal(emitter.events[0].nodeId, 'e');
  assert.ok(Math.abs(emitter.events[0].elapsed - 0.2) < 1e-9, 'emit must fire when its stage begins');
  assert.ok(Math.abs(runtime.getState().elapsed - 0.5) < 1e-9, 'emit duration must occupy schedule time');
  assert.equal(runtime.getState().emitCount, 1);
}

function checkDeterminism() {
  const build = () => {
    const emitter = new RecordingEmitter();
    const runtime = new SequenceRuntime(emitter);
    runtime.load(
      definition({
        id: 'root', type: 'sequence',
        children: [
          { id: 'e1', type: 'emit', abilityId: 'alpha', duration: 0.1 },
          { id: 'e2', type: 'emit', abilityId: 'beta', duration: 0.1 },
          { id: 'e3', type: 'emit', abilityId: 'gamma', duration: 0.1 },
        ],
      }),
      );
    runtime.start();
    runToCompletion(runtime);
    return emitter.events;
  };

  const first = build();
  const second = build();
  assert.deepEqual(first, second, 'identical definition and seed must produce identical runs');
  assert.ok(first.every((event) => Number.isInteger(event.seed)), 'derived seeds must be integers');
  assert.equal(new Set(first.map((event) => event.seed)).size, first.length, 'each emit must get its own derived seed');

  // A different root seed must produce a different derived stream.
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(
    definition(
      {
        id: 'root', type: 'sequence',
        children: [
          { id: 'e1', type: 'emit', abilityId: 'alpha', duration: 0.1 },
          { id: 'e2', type: 'emit', abilityId: 'beta', duration: 0.1 },
          { id: 'e3', type: 'emit', abilityId: 'gamma', duration: 0.1 },
        ],
      },
      999,
    ),
  );
  runtime.start();
  runToCompletion(runtime);
  assert.notDeepEqual(emitter.events.map((e) => e.seed), first.map((e) => e.seed), 'a different seed must change the stream');
}

/**
 * Frame-rate independence: the same simulated time produces the same state
 * whether delivered as many small steps or a few coarse ones.
 */
function checkFixedStepProgression() {
  const build = (step: number) => {
    const emitter = new RecordingEmitter();
    const runtime = new SequenceRuntime(emitter);
    runtime.load(
      definition({
        id: 'root', type: 'sequence',
        children: [
          { id: 'w1', type: 'wait', duration: 0.5 },
          { id: 'e1', type: 'emit', abilityId: 'alpha', duration: 0 },
          { id: 'w2', type: 'wait', duration: 0.5 },
          { id: 'e2', type: 'emit', abilityId: 'beta', duration: 0 },
        ],
      }),
    );
    runtime.start();
    for (let elapsed = 0; elapsed < 1; elapsed += step) runtime.advance(step);
    return { events: emitter.events, state: runtime.getState() };
  };

  const fine = build(1 / 240);
  const coarse = build(1 / 15);

  assert.deepEqual(
    fine.events.map((event) => event.abilityId),
    coarse.events.map((event) => event.abilityId),
    'step size must not change which stages ran',
  );
  for (let i = 0; i < fine.events.length; i++) {
    assert.ok(
      Math.abs(fine.events[i].elapsed - coarse.events[i].elapsed) < 1e-9,
      'leftover time must be threaded so stage start times are step-size independent',
    );
  }
  assert.equal(fine.state.status, coarse.state.status);
}

/** Pause is modelled by the clock withholding delta; the runtime must not self-advance. */
function checkPause() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(
    definition({
      id: 'root', type: 'sequence',
      children: [
        { id: 'w', type: 'wait', duration: 1 },
        { id: 'e', type: 'emit', abilityId: 'alpha', duration: 0 },
      ],
    }),
  );
  runtime.start();
  runtime.advance(0.5);

  const paused = runtime.getState();
  // EngineClock delivers 0 while paused.
  for (let i = 0; i < 120; i++) runtime.advance(0);

  const stillPaused = runtime.getState();
  assert.equal(stillPaused.elapsed, paused.elapsed, 'zero-delta frames must not advance the sequence');
  assert.equal(stillPaused.status, 'running');
  assert.equal(emitter.events.length, 0, 'no stage may fire while paused');

  // Negative or non-finite deltas are also inert.
  runtime.advance(-5);
  runtime.advance(Number.NaN);
  assert.equal(runtime.getState().elapsed, paused.elapsed, 'invalid deltas must not advance the sequence');

  runtime.advance(0.5);
  assert.equal(emitter.events.length, 1, 'resuming must continue from the paused state');
}

function checkRestart() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(
    definition({
      id: 'root', type: 'sequence',
      children: [
        { id: 'e', type: 'emit', abilityId: 'alpha', duration: 0 },
        { id: 'w', type: 'wait', duration: 1 },
      ],
    }),
  );

  runtime.start();
  runtime.advance(0.6);
  const midway = runtime.getState();
  assert.ok(midway.elapsed > 0);

  runtime.restart();
  const afterRestart = runtime.getState();
  assert.equal(afterRestart.elapsed, 0, 'restart must reset elapsed time');
  assert.equal(afterRestart.emitCount, 0, 'restart must reset emit accounting');
  assert.equal(afterRestart.completedNodeIds.length, 0, 'restart must clear completed stages');
  assert.equal(afterRestart.status, 'running');
  assert.ok(emitter.cancels >= 1, 'restart must release owned runtime');

  // The restarted run reproduces the original stream exactly.
  runToCompletion(runtime);
  const firstRunSeeds = emitter.events.map((event) => event.seed);

  runtime.restart();
  runToCompletion(runtime);
  assert.deepEqual(emitter.events.map((event) => event.seed), firstRunSeeds, 'restart must reconstruct deterministic state');
}

function checkCancellation() {
  const emitter = new RecordingEmitter();
  const runtime = new SequenceRuntime(emitter);
  runtime.load(
    definition({
      id: 'root', type: 'sequence',
      children: [
        { id: 'e', type: 'emit', abilityId: 'alpha', duration: 0 },
        { id: 'w', type: 'wait', duration: 2 },
      ],
    }),
  );

  runtime.start();
  runtime.advance(0.5);
  const cancelsBefore = emitter.cancels;

  runtime.stop();
  const stopped = runtime.getState();
  assert.equal(stopped.status, 'idle', 'stop must return the runtime to idle');
  assert.equal(stopped.elapsed, 0);
  assert.equal(stopped.activeNodeIds.length, 0, 'stop must leave no active stages');
  assert.equal(emitter.cancels, cancelsBefore + 1, 'stop must release owned runtime exactly once');

  // A stopped runtime does not advance.
  runtime.advance(1);
  assert.equal(runtime.getState().elapsed, 0, 'a stopped sequence must not advance');
}

function checkShippedSequencePack() {
  const registry = new AbilityRegistry();
  assert.ok(DECLARATIVE_SEQUENCE_PACK.length >= 1, 'at least one shipped sequence is required');

  let sawAllRequiredTypes = false;

  for (const document of DECLARATIVE_SEQUENCE_PACK) {
    const result = validateSequenceDocument(document);
    const id = (document as { id?: string }).id ?? '(unknown)';
    assert.equal(result.ok, true, `sequence ${id} must validate: ${!result.ok ? JSON.stringify(result.issues) : ''}`);
    if (!result.ok) continue;

    const unresolved = findUnresolvedEmitTargets(result.definition, registry.getIds());
    assert.deepEqual(unresolved, [], `sequence ${id} must only emit registered abilities`);

    const types = new Set<string>();
    const walk = (node: SequenceDefinition['root']) => {
      types.add(node.type);
      if (node.type === 'sequence' || node.type === 'parallel') node.children.forEach(walk);
    };
    walk(result.definition.root);

    if (['sequence', 'parallel', 'wait', 'emit', 'travel', 'impact', 'field', 'residue'].every((type) => types.has(type))) {
      sawAllRequiredTypes = true;

      // The representative sequence actually runs to completion.
      const emitter = new RecordingEmitter();
      const runtime = new SequenceRuntime(emitter);
      runtime.load(result.definition);
      runtime.start();
      runToCompletion(runtime);
      assert.equal(runtime.getState().status, 'complete', `sequence ${id} must run to completion`);
      assert.ok(emitter.events.length >= 2, `sequence ${id} must emit through the ability path`);
    }
  }

  assert.ok(sawAllRequiredTypes, 'the shipped pack must include a sequence exercising every node type');
}

function checkSequenceValidationRejections() {
  const base = {
    schemaVersion: '1.0.0', id: 'bad_seq', name: 'Bad', description: 'Bad sequence.', seed: 1,
    root: { id: 'r', type: 'sequence', children: [{ id: 'w', type: 'wait', duration: 1 }] },
  };

  assert.equal(validateSequenceDocument({ ...base, schemaVersion: '9.9.9' }).ok, false, 'unknown sequence version must fail');
  assert.equal(validateSequenceDocument({ ...base, root: { id: 'r', type: 'wait' } }).ok, false, 'wait without duration must fail');
  assert.equal(validateSequenceDocument({ ...base, root: { id: 'r', type: 'emit' } }).ok, false, 'emit without abilityId must fail');
  assert.equal(
    validateSequenceDocument({ ...base, root: { id: 'r', type: 'travel', distance: 10 } }).ok,
    false,
    'travel needs a duration or a distance/speed pair',
  );
  assert.equal(
    validateSequenceDocument({ ...base, root: { id: 'r', type: 'wait', duration: 1, children: [] } }).ok,
    false,
    'a leaf stage must not carry children',
  );
  assert.equal(
    validateSequenceDocument({ ...base, root: { id: 'r', type: 'sequence', children: [{ id: 'r', type: 'wait', duration: 1 }] } }).ok,
    false,
    'duplicate node ids must fail',
  );
  assert.equal(
    validateSequenceDocument({ ...base, onTick: 'alert(1)' }).ok,
    false,
    'unknown top-level properties must be rejected',
  );
  assert.equal(validateSequenceDocument({ ...base, root: { id: 'r', type: 'launch', duration: 1 } }).ok, false, 'unknown node types must fail');
}

/**
 * The runtime must own no wall-clock timing. This is a source-level guarantee,
 * not just a behavioural one.
 */
function checkNoWallClockTimers() {
  const forbidden = [/\bsetTimeout\s*\(/, /\bsetInterval\s*\(/, /\bDate\.now\s*\(/, /\bperformance\.now\s*\(/, /\brequestAnimationFrame\s*\(/, /\bMath\.random\s*\(/];

  const files = [
    path.join(root, 'src/sequence/SequenceRuntime.ts'),
    path.join(root, 'src/sequence/SequenceModel.ts'),
    path.join(root, 'src/sequence/AbilitySequenceEmitter.ts'),
  ];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      assert.ok(
        !pattern.test(text),
        `${path.relative(root, file)} must not depend on ${pattern.source}; simulation time is EngineClock's`,
      );
    }
  }
}

checkSequenceOrdering();
checkWaitTiming();
checkParallelSemantics();
checkTravelSemantics();
checkStageDurations();
checkEmitSemantics();
checkDeterminism();
checkFixedStepProgression();
checkPause();
checkRestart();
checkCancellation();
checkShippedSequencePack();
checkSequenceValidationRejections();
checkNoWallClockTimers();

console.log('Sequence runtime checks: PASS (ordering, parallel join all/any, wait, emit, travel, impact/field/residue, determinism, fixed-step, pause, restart, cancel, no wall-clock timers)');
