/**
 * Versioned JSON Schema for persistent world mutations.
 *
 * Mutations are DATA ONLY: closed objects, bounded primitives, no free-form
 * strings that could carry code, shader source, module specifiers, or URLs.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const IDENTIFIER = { type: 'string', pattern: '^[A-Za-z0-9_\\-\\.:]{1,64}$' } as const;

const VEC3_SCHEMA = {
  type: 'array',
  items: { type: 'number' },
  minItems: 3,
  maxItems: 3,
} as const;

export const MUTATION_TYPES = [
  'scorch',
  'frost',
  'lava',
  'crystal',
  'golden_rune',
  'void_scar',
] as const;

export const MUTATION_RECORD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'id',
    'type',
    'surfaceId',
    'center',
    'normal',
    'radius',
    'intensity',
    'shape',
    'createdAt',
    'duration',
    'seed',
  ],
  properties: {
    schemaVersion: { const: '1.0.0' },
    id: IDENTIFIER,
    type: { type: 'string', enum: MUTATION_TYPES },
    surfaceId: IDENTIFIER,
    center: VEC3_SCHEMA,
    normal: VEC3_SCHEMA,
    radius: { type: 'number', minimum: 0.01, maximum: 200.0 },
    intensity: { type: 'number', minimum: 0.0, maximum: 50.0 },
    shape: { type: 'string', enum: ['circle', 'ribbon', 'path'] },
    points: {
      type: 'array',
      items: VEC3_SCHEMA,
      maxItems: 256,
    },
    createdAt: { type: 'number', minimum: 0 },
    duration: { type: 'number', minimum: 0.05, maximum: 86400 },
    seed: { type: 'number' },
    ownerId: IDENTIFIER,
    transactionId: IDENTIFIER,
    tags: {
      type: 'array',
      items: { type: 'string', maxLength: 64 },
      maxItems: 32,
    },
    params: {
      type: 'object',
      additionalProperties: {
        type: ['number', 'string', 'boolean'],
        maxLength: 64,
      },
    },
  },
} as const;

export const MUTATION_DOCUMENT_SCHEMA_V1_0 = {
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'mutations'],
  properties: {
    schemaVersion: { const: '1.0.0' },
    mutations: {
      type: 'array',
      items: MUTATION_RECORD_SCHEMA,
      maxItems: 512,
    },
  },
} as const;
