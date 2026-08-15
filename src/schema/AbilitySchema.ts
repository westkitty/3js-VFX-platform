/**
 * Versioned JSON Schema for declarative ability documents.
 *
 * Ability documents are DATA ONLY. The schema deliberately closes every object
 * (`additionalProperties: false`) and restricts every leaf to a bounded
 * primitive so a definition can never smuggle executable code, shader source,
 * module specifiers, or URLs into the runtime.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ABILITY_SCHEMA_CURRENT_VERSION = '1.1.0';

/** Versions this build can load. Anything else must fail loudly. */
export const ABILITY_SCHEMA_SUPPORTED_VERSIONS = ['1.0.0', '1.1.0'] as const;
export type AbilitySchemaVersion = (typeof ABILITY_SCHEMA_SUPPORTED_VERSIONS)[number];

export const ABILITY_SCHOOLS = ['pyromancy', 'cryomancy', 'stormcraft', 'void', 'earth', 'starsilk'] as const;
export const ABILITY_TARGETING_SHAPES = ['line', 'zone', 'path', 'cone', 'ring', 'rectangle'] as const;
export const ABILITY_SURFACE_POLICIES = ['project', 'follow', 'plane'] as const;
export const ABILITY_MODULE_TYPES = [
  'ribbon', 'beam', 'shockwave', 'particles', 'orb', 'decal', 'telegraph', 'sound', 'light',
] as const;
export const ABILITY_DECAL_TYPES = ['scorch', 'frost', 'lava', 'crystal', 'void_scar', 'golden_rune'] as const;

const HEX_COLOR = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' } as const;
const IDENTIFIER = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9_]{0,63}$' } as const;
const ICON_NAME = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9]{0,31}$' } as const;

function numberRange(minimum: number, maximum: number) {
  return { type: 'number', minimum, maximum } as const;
}

/**
 * Parameter shapes for each module type. Keys mirror what the registered
 * runtime modules actually read, so validation stays honest about the engine.
 */
const MODULE_PARAM_SCHEMAS: Record<string, unknown> = {
  orb: {
    type: 'object', additionalProperties: false,
    properties: {
      radius: numberRange(0.01, 50), noiseScale: numberRange(0, 50),
      colorCore: HEX_COLOR, colorOuter: HEX_COLOR,
    },
  },
  beam: {
    type: 'object', additionalProperties: false,
    properties: {
      radius: numberRange(0.01, 50), intensity: numberRange(0, 20), scrollSpeed: numberRange(-100, 100),
      colorCore: HEX_COLOR, colorGlow: HEX_COLOR,
    },
  },
  shockwave: {
    type: 'object', additionalProperties: false,
    properties: {
      radius: numberRange(0.01, 100), ringWidth: numberRange(0, 5), fillAlpha: numberRange(0, 1),
      colorPrimary: HEX_COLOR, colorSecondary: HEX_COLOR,
    },
  },
  ribbon: {
    type: 'object', additionalProperties: false,
    properties: {
      width: numberRange(0.01, 20), opacity: numberRange(0, 1),
      noiseFreq: numberRange(0, 50), noiseAmp: numberRange(0, 10),
      colorCore: HEX_COLOR, colorGlow: HEX_COLOR,
    },
  },
  particles: {
    type: 'object', additionalProperties: false,
    properties: {
      // Negative speed is meaningful: it pulls motes inward (void singularity).
      count: { type: 'integer', minimum: 0, maximum: 5000 },
      speed: numberRange(-100, 100), size: numberRange(0.01, 20), color: HEX_COLOR,
    },
  },
  decal: {
    type: 'object', additionalProperties: false,
    properties: { decalType: { type: 'string', enum: ABILITY_DECAL_TYPES }, radius: numberRange(0.01, 100) },
    required: ['decalType'],
  },
  telegraph: {
    type: 'object', additionalProperties: false,
    properties: {
      shape: { type: 'string', enum: ABILITY_TARGETING_SHAPES },
      range: numberRange(0, 200), radius: numberRange(0, 100),
      angle: numberRange(0, Math.PI * 2), width: numberRange(0, 100),
      warningDuration: numberRange(0, 30), commitDuration: numberRange(0, 30),
    },
  },
  sound: {
    type: 'object', additionalProperties: false,
    properties: { cue: IDENTIFIER, volume: numberRange(0, 1), pitch: numberRange(0.01, 4) },
  },
  light: {
    type: 'object', additionalProperties: false,
    properties: { color: HEX_COLOR, intensity: numberRange(0, 50), radius: numberRange(0, 200) },
  },
};

/** One `if/then` branch per module type, so params are checked against their own shape. */
const moduleParamBranches = ABILITY_MODULE_TYPES.map((type) => ({
  if: { properties: { type: { const: type } }, required: ['type'] },
  then: { properties: { params: MODULE_PARAM_SCHEMAS[type] } },
}));

const moduleSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'params'],
  properties: {
    type: { type: 'string', enum: ABILITY_MODULE_TYPES },
    preset: IDENTIFIER,
    params: { type: 'object' },
  },
  allOf: moduleParamBranches,
};

const timingSchema = {
  type: 'object', additionalProperties: false,
  required: ['windup', 'travelSpeed', 'hold', 'fade', 'cooldown'],
  properties: {
    windup: numberRange(0, 60), travelSpeed: numberRange(0, 500),
    hold: numberRange(0, 120), fade: numberRange(0, 60), cooldown: numberRange(0, 600),
  },
};

const targetingSchema = {
  type: 'object', additionalProperties: false,
  required: ['shape', 'range', 'surfacePolicy'],
  properties: {
    shape: { type: 'string', enum: ABILITY_TARGETING_SHAPES },
    range: numberRange(0, 500),
    minRange: numberRange(0, 500),
    radius: numberRange(0, 200),
    angle: numberRange(0, Math.PI * 2),
    width: numberRange(0, 200),
    surfacePolicy: { type: 'string', enum: ABILITY_SURFACE_POLICIES },
  },
};

const budgetSchema = {
  type: 'object', additionalProperties: false,
  required: ['maxParticles', 'dynamicLights'],
  properties: {
    maxParticles: { type: 'integer', minimum: 0, maximum: 20000 },
    dynamicLights: { type: 'integer', minimum: 0, maximum: 16 },
  },
};

/** Current document shape. */
export const ABILITY_SCHEMA_V1_1 = {
  $id: 'https://aethervfx.local/schema/ability/1.1.0',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'id', 'name', 'school', 'description', 'iconName', 'targeting', 'timing', 'modules', 'feedback', 'budget'],
  properties: {
    schemaVersion: { const: '1.1.0' },
    id: IDENTIFIER,
    name: { type: 'string', minLength: 1, maxLength: 80 },
    school: { type: 'string', enum: ABILITY_SCHOOLS },
    description: { type: 'string', minLength: 1, maxLength: 400 },
    iconName: ICON_NAME,
    targeting: targetingSchema,
    timing: timingSchema,
    modules: { type: 'array', minItems: 1, maxItems: 12, items: moduleSchema },
    feedback: {
      type: 'object', additionalProperties: false,
      required: ['cameraShake', 'flashIntensity', 'lightColor', 'lightRadius'],
      properties: {
        cameraShake: numberRange(0, 5), flashIntensity: numberRange(0, 5),
        lightColor: HEX_COLOR, lightRadius: numberRange(0, 200),
      },
    },
    budget: budgetSchema,
  },
} as const;

/**
 * Legacy document shape. 1.0.0 predates `iconName`/`budget` and used shorter
 * feedback keys. It is accepted only through an explicit migration.
 */
export const ABILITY_SCHEMA_V1_0 = {
  $id: 'https://aethervfx.local/schema/ability/1.0.0',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'id', 'name', 'school', 'description', 'targeting', 'timing', 'modules', 'feedback'],
  properties: {
    schemaVersion: { const: '1.0.0' },
    id: IDENTIFIER,
    name: { type: 'string', minLength: 1, maxLength: 80 },
    school: { type: 'string', enum: ABILITY_SCHOOLS },
    description: { type: 'string', minLength: 1, maxLength: 400 },
    targeting: targetingSchema,
    timing: timingSchema,
    modules: { type: 'array', minItems: 1, maxItems: 12, items: moduleSchema },
    feedback: {
      type: 'object', additionalProperties: false,
      required: ['shake', 'flash', 'lightColor', 'lightRadius'],
      properties: {
        shake: numberRange(0, 5), flash: numberRange(0, 5),
        lightColor: HEX_COLOR, lightRadius: numberRange(0, 200),
      },
    },
  },
} as const;
