/**
 * Ajv-backed validation, migration, and document/runtime conversion for
 * declarative abilities.
 *
 * Import never silently accepts malformed data: every path returns either a
 * validated definition or a structured, inspectable error list.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import { AbilityDefinition } from '../types';
import {
  ABILITY_SCHEMA_CURRENT_VERSION,
  ABILITY_SCHEMA_SUPPORTED_VERSIONS,
  ABILITY_SCHEMA_V1_0,
  ABILITY_SCHEMA_V1_1,
} from './AbilitySchema';

/** A versioned, serializable ability document. */
export type AbilityDocument = AbilityDefinition & { schemaVersion: string };

export interface AbilityValidationIssue {
  path: string;
  message: string;
  keyword: string;
}

/**
 * Flat rather than a discriminated union: this project compiles without
 * `strictNullChecks`, where discriminant narrowing does not apply. Callers
 * check `ok` and use `definition`/`issues` accordingly.
 */
export interface AbilityValidationResult {
  ok: boolean;
  definition: AbilityDefinition | null;
  document: AbilityDocument | null;
  migratedFrom: string | null;
  issues: AbilityValidationIssue[];
}

export interface AbilityParseResult {
  ok: boolean;
  results: AbilityValidationResult[];
  issues: AbilityValidationIssue[];
}

// `strict: false` keeps Ajv from rejecting the if/then module-parameter
// branches; validation semantics are unchanged.
const ajv = new Ajv({ allErrors: true, strict: false });

const validators: Record<string, ValidateFunction> = {
  '1.0.0': ajv.compile(ABILITY_SCHEMA_V1_0 as object),
  '1.1.0': ajv.compile(ABILITY_SCHEMA_V1_1 as object),
};

function toIssues(errors: ErrorObject[] | null | undefined): AbilityValidationIssue[] {
  if (!errors || errors.length === 0) return [{ path: '', message: 'unknown validation failure', keyword: 'unknown' }];
  return errors.map((error) => ({
    path: error.instancePath || '(root)',
    message: error.message ?? 'invalid value',
    keyword: error.keyword,
  }));
}

function issue(path: string, message: string, keyword = 'schema'): AbilityValidationIssue[] {
  return [{ path, message, keyword }];
}

function invalid(issues: AbilityValidationIssue[]): AbilityValidationResult {
  return { ok: false, definition: null, document: null, migratedFrom: null, issues };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Migrates a validated 1.0.0 document to the current shape.
 *
 * 1.0.0 has no `iconName` and no `budget`, and names its feedback fields
 * `shake`/`flash`. Defaults are explicit and derived from the document itself
 * rather than guessed at load time.
 */
function migrateV1_0ToV1_1(source: Record<string, unknown>): AbilityDocument {
  const feedback = source.feedback as Record<string, number | string>;
  const modules = source.modules as Array<{ type: string; params: Record<string, unknown> }>;

  const requestedParticles = modules
    .filter((module) => module.type === 'particles')
    .reduce((sum, module) => sum + (typeof module.params.count === 'number' ? module.params.count : 0), 0);

  return {
    schemaVersion: ABILITY_SCHEMA_CURRENT_VERSION,
    id: source.id as string,
    name: source.name as string,
    school: source.school as AbilityDefinition['school'],
    description: source.description as string,
    iconName: 'Sparkles',
    targeting: source.targeting as AbilityDefinition['targeting'],
    timing: source.timing as AbilityDefinition['timing'],
    modules: source.modules as AbilityDefinition['modules'],
    feedback: {
      cameraShake: feedback.shake as number,
      flashIntensity: feedback.flash as number,
      lightColor: feedback.lightColor as string,
      lightRadius: feedback.lightRadius as number,
    },
    budget: {
      maxParticles: Math.min(20000, Math.max(100, Math.ceil(requestedParticles * 1.5))),
      dynamicLights: 1,
    },
  };
}

/** Strips the schema envelope, returning the in-memory runtime shape. */
export function toRuntimeDefinition(document: AbilityDocument): AbilityDefinition {
  const { schemaVersion: _schemaVersion, ...definition } = document;
  return structuredClone(definition) as AbilityDefinition;
}

/** Wraps a runtime definition in the current schema envelope. */
export function toAbilityDocument(definition: AbilityDefinition): AbilityDocument {
  return { schemaVersion: ABILITY_SCHEMA_CURRENT_VERSION, ...structuredClone(definition) };
}

/**
 * Validates a versioned ability document, migrating supported older versions.
 * Unknown or future versions fail clearly rather than being guessed at.
 */
export function validateAbilityDocument(input: unknown): AbilityValidationResult {
  if (!isPlainObject(input)) {
    return invalid(issue('(root)', 'ability document must be a JSON object', 'type'));
  }

  const version = input.schemaVersion;
  if (typeof version !== 'string') {
    return invalid(issue('/schemaVersion', 'missing required string "schemaVersion"', 'required'));
  }

  if (!(ABILITY_SCHEMA_SUPPORTED_VERSIONS as readonly string[]).includes(version)) {
    return invalid(
      issue(
        '/schemaVersion',
        `unsupported ability schema version "${version}"; this build supports ${ABILITY_SCHEMA_SUPPORTED_VERSIONS.join(', ')}`,
        'unsupportedVersion',
      ),
    );
  }

  const validate = validators[version];
  if (!validate(input)) return invalid(toIssues(validate.errors));

  let document = input as unknown as AbilityDocument;
  let migratedFrom: string | null = null;

  if (version !== ABILITY_SCHEMA_CURRENT_VERSION) {
    document = migrateV1_0ToV1_1(input);
    migratedFrom = version;

    // Defensive: a migration must produce a document that passes the current schema.
    const currentValidate = validators[ABILITY_SCHEMA_CURRENT_VERSION];
    if (!currentValidate(document)) {
      return invalid([
        { path: '(migration)', message: `migration from ${version} produced an invalid document`, keyword: 'migration' },
        ...toIssues(currentValidate.errors),
      ]);
    }
  }

  return { ok: true, definition: toRuntimeDefinition(document), document, migratedFrom, issues: [] };
}

/**
 * Validates an unversioned in-memory runtime definition by checking it against
 * the current schema. Used as the registry's admission gate.
 */
export function validateAbilityDefinition(input: unknown): AbilityValidationResult {
  if (!isPlainObject(input)) {
    return invalid(issue('(root)', 'ability definition must be an object', 'type'));
  }
  if ('schemaVersion' in input) return validateAbilityDocument(input);
  return validateAbilityDocument({ schemaVersion: ABILITY_SCHEMA_CURRENT_VERSION, ...input });
}

/** Parses and validates a JSON string holding one document or an array of them. */
export function parseAbilityJson(jsonString: string): AbilityParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return { ok: false, results: [], issues: issue('(json)', error instanceof Error ? error.message : 'invalid JSON', 'parse') };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  if (items.length === 0) return { ok: false, results: [], issues: issue('(json)', 'no ability documents present', 'empty') };
  return { ok: true, results: items.map(validateAbilityDocument), issues: [] };
}

/** Human-readable one-line rendering of structured issues, for UI surfaces. */
export function formatIssues(issues: AbilityValidationIssue[]): string[] {
  return issues.map((entry) => `${entry.path} — ${entry.message}`);
}
