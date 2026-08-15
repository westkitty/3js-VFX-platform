/**
 * Ajv-backed validation for persistent mutation documents.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import {
  MUTATION_SCHEMA_CURRENT_VERSION,
  MUTATION_SCHEMA_SUPPORTED_VERSIONS,
  type MutationDocument,
  type MutationRecord,
} from '../mutation/MutationTypes';
import { MUTATION_DOCUMENT_SCHEMA_V1_0, MUTATION_RECORD_SCHEMA } from './MutationSchema';

export interface MutationValidationIssue {
  path: string;
  message: string;
  keyword: string;
}

export interface MutationValidationResult {
  ok: boolean;
  document: MutationDocument | null;
  issues: MutationValidationIssue[];
}

export interface SingleMutationValidationResult {
  ok: boolean;
  record: MutationRecord | null;
  issues: MutationValidationIssue[];
}

const ajv = new Ajv({ allErrors: true, strict: false });

const docValidators: Record<string, ValidateFunction> = {
  '1.0.0': ajv.compile(MUTATION_DOCUMENT_SCHEMA_V1_0 as object),
};

const recordValidator = ajv.compile(MUTATION_RECORD_SCHEMA as object);

function toIssues(errors: ErrorObject[] | null | undefined): MutationValidationIssue[] {
  if (!errors || errors.length === 0) {
    return [{ path: '', message: 'unknown validation failure', keyword: 'unknown' }];
  }
  return errors.map((error) => ({
    path: error.instancePath || '(root)',
    message: error.message ?? 'invalid value',
    keyword: error.keyword,
  }));
}

function issue(path: string, message: string, keyword = 'schema'): MutationValidationIssue[] {
  return [{ path, message, keyword }];
}

export function validateMutationDocument(document: unknown): MutationValidationResult {
  if (!document || typeof document !== 'object') {
    return { ok: false, document: null, issues: issue('(root)', 'document must be a non-null object', 'type') };
  }

  const version = (document as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version !== 'string') {
    return { ok: false, document: null, issues: issue('schemaVersion', 'schemaVersion is required and must be a string', 'required') };
  }

  if (!MUTATION_SCHEMA_SUPPORTED_VERSIONS.includes(version as any)) {
    return {
      ok: false,
      document: null,
      issues: issue('schemaVersion', `unsupported schema version: "${version}". Supported: ${MUTATION_SCHEMA_SUPPORTED_VERSIONS.join(', ')}`, 'enum'),
    };
  }

  const validator = docValidators[version];
  if (!validator(document)) {
    return { ok: false, document: null, issues: toIssues(validator.errors) };
  }

  const typedDoc = document as MutationDocument;

  // Verify ID uniqueness
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  for (const mut of typedDoc.mutations) {
    if (seenIds.has(mut.id)) {
      duplicateIds.push(mut.id);
    }
    seenIds.add(mut.id);
  }

  if (duplicateIds.length > 0) {
    return {
      ok: false,
      document: null,
      issues: issue('mutations', `duplicate mutation id(s): ${duplicateIds.join(', ')}`, 'unique'),
    };
  }

  return { ok: true, document: typedDoc, issues: [] };
}

export function validateMutationRecord(record: unknown): SingleMutationValidationResult {
  if (!record || typeof record !== 'object') {
    return { ok: false, record: null, issues: issue('(root)', 'record must be a non-null object', 'type') };
  }

  if (!recordValidator(record)) {
    return { ok: false, record: null, issues: toIssues(recordValidator.errors) };
  }

  return { ok: true, record: record as MutationRecord, issues: [] };
}

export function parseMutationJson(jsonString: string): MutationValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return {
      ok: false,
      document: null,
      issues: issue('(json)', error instanceof Error ? error.message : 'invalid JSON', 'parse'),
    };
  }
  return validateMutationDocument(parsed);
}

export { MUTATION_SCHEMA_CURRENT_VERSION };
