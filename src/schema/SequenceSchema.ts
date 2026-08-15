/**
 * Versioned JSON Schema for declarative sequence/macro documents.
 *
 * Like ability documents, sequences are DATA ONLY: closed objects, bounded
 * primitives, no free-form strings that could carry code, shader source,
 * module specifiers, or URLs.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEQUENCE_NODE_TYPES } from '../sequence/SequenceModel';

const IDENTIFIER = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9_]{0,63}$' } as const;

function numberRange(minimum: number, maximum: number) {
  return { type: 'number', minimum, maximum } as const;
}

const CONTAINER_TYPES = ['sequence', 'parallel'] as const;
const STAGE_TYPES = ['impact', 'field', 'residue'] as const;

/** Leaf stages must not carry children; containers must not carry leaf fields. */
const nodeBranches = [
  {
    if: { properties: { type: { enum: CONTAINER_TYPES } }, required: ['type'] },
    then: {
      required: ['children'],
      properties: { abilityId: false, duration: false, distance: false, speed: false },
    },
  },
  {
    if: { properties: { type: { const: 'wait' } }, required: ['type'] },
    then: { required: ['duration'], properties: { children: false, abilityId: false, distance: false, speed: false } },
  },
  {
    if: { properties: { type: { const: 'emit' } }, required: ['type'] },
    then: { required: ['abilityId'], properties: { children: false, distance: false, speed: false } },
  },
  {
    if: { properties: { type: { const: 'travel' } }, required: ['type'] },
    then: {
      properties: { children: false, abilityId: false },
      // Either an explicit duration, or a distance/speed pair to derive one.
      anyOf: [{ required: ['duration'] }, { required: ['distance', 'speed'] }],
    },
  },
  {
    if: { properties: { type: { enum: STAGE_TYPES } }, required: ['type'] },
    then: { required: ['duration'], properties: { children: false, abilityId: false, distance: false, speed: false } },
  },
];

const nodeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'type'],
  properties: {
    id: IDENTIFIER,
    type: { type: 'string', enum: SEQUENCE_NODE_TYPES },
    label: { type: 'string', minLength: 1, maxLength: 80 },
    join: { type: 'string', enum: ['all', 'any'] },
    duration: numberRange(0, 600),
    abilityId: IDENTIFIER,
    distance: numberRange(0, 1000),
    speed: numberRange(0, 500),
    children: { type: 'array', minItems: 1, maxItems: 32, items: { $ref: '#/$defs/node' } },
  },
  allOf: nodeBranches,
};

export const SEQUENCE_SCHEMA_V1_0 = {
  $id: 'https://aethervfx.local/schema/sequence/1.0.0',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'id', 'name', 'description', 'seed', 'root'],
  properties: {
    schemaVersion: { const: '1.0.0' },
    id: IDENTIFIER,
    name: { type: 'string', minLength: 1, maxLength: 80 },
    description: { type: 'string', minLength: 1, maxLength: 400 },
    seed: { type: 'integer', minimum: 0, maximum: 0xffffffff },
    root: { $ref: '#/$defs/node' },
  },
  $defs: { node: nodeSchema },
} as const;
