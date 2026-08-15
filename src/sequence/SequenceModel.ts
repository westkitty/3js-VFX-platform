/**
 * Semantic model for declarative macro/sequence definitions.
 *
 * Node meaning lives in the runtime interpreter (SequenceRuntime), not in the
 * label: every node type below has distinct scheduling behavior. This module
 * holds only the data shapes and the pure timing math shared by the runtime,
 * the validator, and the designer UI.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SEQUENCE_SCHEMA_CURRENT_VERSION = '1.0.0';
export const SEQUENCE_SCHEMA_SUPPORTED_VERSIONS = ['1.0.0'] as const;

export const SEQUENCE_NODE_TYPES = [
  'sequence', 'parallel', 'wait', 'emit', 'travel', 'impact', 'field', 'residue',
] as const;
export type SequenceNodeType = (typeof SEQUENCE_NODE_TYPES)[number];

/** How a `parallel` node decides it is finished. */
export type ParallelJoin = 'all' | 'any';

export interface SequenceNodeBase {
  id: string;
  type: SequenceNodeType;
  label?: string;
}

export interface SequenceContainerNode extends SequenceNodeBase {
  type: 'sequence' | 'parallel';
  children: SequenceNode[];
  /** Only meaningful for `parallel`; defaults to 'all'. */
  join?: ParallelJoin;
}

export interface SequenceWaitNode extends SequenceNodeBase {
  type: 'wait';
  duration: number;
}

export interface SequenceEmitNode extends SequenceNodeBase {
  type: 'emit';
  /** Registry id resolved at runtime. The engine never hard-codes ability ids. */
  abilityId: string;
  /** Time this stage occupies in the schedule; 0 fires and completes at once. */
  duration?: number;
}

export interface SequenceTravelNode extends SequenceNodeBase {
  type: 'travel';
  /** Either an explicit duration, or distance/speed which derives one. */
  duration?: number;
  distance?: number;
  speed?: number;
}

export interface SequenceStageNode extends SequenceNodeBase {
  type: 'impact' | 'field' | 'residue';
  duration: number;
  /** Optional registry id to spawn a persistent world effect or field when entering this stage. */
  abilityId?: string;
}

export type SequenceNode =
  | SequenceContainerNode
  | SequenceWaitNode
  | SequenceEmitNode
  | SequenceTravelNode
  | SequenceStageNode;

export interface SequenceDefinition {
  schemaVersion: string;
  id: string;
  name: string;
  description: string;
  /** Root seed; every emit derives its seed deterministically from this. */
  seed: number;
  root: SequenceNode;
}

export function isContainerNode(node: SequenceNode): node is SequenceContainerNode {
  return node.type === 'sequence' || node.type === 'parallel';
}

/**
 * Scheduled duration of a single leaf node.
 * `travel` prefers an explicit duration, else derives distance/speed.
 */
export function leafDuration(node: SequenceNode): number {
  switch (node.type) {
    case 'wait':
      return Math.max(0, node.duration);
    case 'emit':
      return Math.max(0, node.duration ?? 0);
    case 'travel': {
      if (typeof node.duration === 'number') return Math.max(0, node.duration);
      const speed = node.speed ?? 0;
      const distance = node.distance ?? 0;
      return speed > 0 ? Math.max(0, distance / speed) : 0;
    }
    case 'impact':
    case 'field':
    case 'residue':
      return Math.max(0, node.duration);
    default:
      return 0;
  }
}

/**
 * Total scheduled duration of a subtree.
 * `sequence` accumulates; `parallel` takes the max (join 'all') or min (join 'any').
 */
export function nodeDuration(node: SequenceNode): number {
  if (!isContainerNode(node)) return leafDuration(node);

  const childDurations = node.children.map(nodeDuration);
  if (childDurations.length === 0) return 0;

  if (node.type === 'sequence') return childDurations.reduce((sum, value) => sum + value, 0);
  return (node.join ?? 'all') === 'any' ? Math.min(...childDurations) : Math.max(...childDurations);
}

/** Flattens a subtree in deterministic depth-first order. */
export function flattenNodes(node: SequenceNode, depth = 0): Array<{ node: SequenceNode; depth: number }> {
  const output: Array<{ node: SequenceNode; depth: number }> = [{ node, depth }];
  if (isContainerNode(node)) {
    for (const child of node.children) output.push(...flattenNodes(child, depth + 1));
  }
  return output;
}

/** Every distinct ability id referenced by `emit` nodes in the subtree. */
export function collectEmitAbilityIds(node: SequenceNode): string[] {
  const ids = new Set<string>();
  for (const entry of flattenNodes(node)) {
    if ('abilityId' in entry.node && typeof entry.node.abilityId === 'string') {
      ids.add(entry.node.abilityId);
    }
  }
  return Array.from(ids);
}
