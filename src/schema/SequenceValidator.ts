/**
 * Ajv-backed validation for declarative sequence documents.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import {
  SEQUENCE_SCHEMA_CURRENT_VERSION,
  SEQUENCE_SCHEMA_SUPPORTED_VERSIONS,
  SequenceDefinition,
  collectEmitAbilityIds,
} from '../sequence/SequenceModel';
import { SEQUENCE_SCHEMA_V1_0 } from './SequenceSchema';
import type { AbilityValidationIssue } from './AbilityValidator';

export type SequenceValidationIssue = AbilityValidationIssue;

/** Flat for the same reason as AbilityValidationResult: no strictNullChecks. */
export interface SequenceValidationResult {
  ok: boolean;
  definition: SequenceDefinition | null;
  issues: SequenceValidationIssue[];
}

function invalid(issues: SequenceValidationIssue[]): SequenceValidationResult {
  return { ok: false, definition: null, issues };
}

const ajv = new Ajv({ allErrors: true, strict: false });

const validators: Record<string, ValidateFunction> = {
  '1.0.0': ajv.compile(SEQUENCE_SCHEMA_V1_0 as object),
};

function toIssues(errors: ErrorObject[] | null | undefined): SequenceValidationIssue[] {
  if (!errors || errors.length === 0) return [{ path: '', message: 'unknown validation failure', keyword: 'unknown' }];
  return errors.map((error) => ({
    path: error.instancePath || '(root)',
    message: error.message ?? 'invalid value',
    keyword: error.keyword,
  }));
}

function issue(path: string, message: string, keyword = 'schema'): SequenceValidationIssue[] {
  return [{ path, message, keyword }];
}

/** Node ids must be unique so runtime state can be addressed unambiguously. */
function findDuplicateNodeIds(definition: SequenceDefinition): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  const walk = (node: SequenceDefinition['root']) => {
    if (seen.has(node.id)) duplicates.add(node.id);
    seen.add(node.id);
    if (node.type === 'sequence' || node.type === 'parallel') node.children.forEach(walk);
  };

  walk(definition.root);
  return Array.from(duplicates);
}

export function validateSequenceDocument(input: unknown): SequenceValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return invalid(issue('(root)', 'sequence document must be a JSON object', 'type'));
  }

  const version = (input as Record<string, unknown>).schemaVersion;
  if (typeof version !== 'string') {
    return invalid(issue('/schemaVersion', 'missing required string "schemaVersion"', 'required'));
  }

  if (!(SEQUENCE_SCHEMA_SUPPORTED_VERSIONS as readonly string[]).includes(version)) {
    return invalid(
      issue(
        '/schemaVersion',
        `unsupported sequence schema version "${version}"; this build supports ${SEQUENCE_SCHEMA_SUPPORTED_VERSIONS.join(', ')}`,
        'unsupportedVersion',
      ),
    );
  }

  const validate = validators[version];
  if (!validate(input)) return invalid(toIssues(validate.errors));

  const definition = structuredClone(input) as SequenceDefinition;
  const duplicates = findDuplicateNodeIds(definition);
  if (duplicates.length > 0) {
    return invalid(issue('/root', `duplicate node ids: ${duplicates.join(', ')}`, 'uniqueNodeIds'));
  }

  return { ok: true, definition, issues: [] };
}

export function parseSequenceJson(jsonString: string): SequenceValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return invalid(issue('(json)', error instanceof Error ? error.message : 'invalid JSON', 'parse'));
  }
  return validateSequenceDocument(parsed);
}

/**
 * Reports `emit` targets that are not present in the supplied registry id set.
 * Kept separate from schema validation so the engine stays free of ability ids.
 */
export function findUnresolvedEmitTargets(definition: SequenceDefinition, knownAbilityIds: Iterable<string>): string[] {
  const known = new Set(knownAbilityIds);
  return collectEmitAbilityIds(definition.root).filter((id) => !known.has(id));
}

export { SEQUENCE_SCHEMA_CURRENT_VERSION };
