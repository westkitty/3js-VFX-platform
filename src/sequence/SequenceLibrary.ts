/**
 * Validated view over the shipped sequence pack.
 *
 * Keeps document loading and validation out of the React shell: App consumes
 * definitions that already passed the schema gate.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateSequenceDocument } from '../schema/SequenceValidator';
import type { AbilityValidationIssue } from '../schema/AbilityValidator';
import { DECLARATIVE_SEQUENCE_PACK } from './builtins';
import type { SequenceDefinition } from './SequenceModel';

export interface SequenceLibrary {
  definitions: SequenceDefinition[];
  issues: Array<{ id: string; issues: AbilityValidationIssue[] }>;
}

export function loadSequenceLibrary(): SequenceLibrary {
  const definitions: SequenceDefinition[] = [];
  const issues: SequenceLibrary['issues'] = [];

  for (const document of DECLARATIVE_SEQUENCE_PACK) {
    const result = validateSequenceDocument(document);
    if (result.ok && result.definition) {
      definitions.push(result.definition);
      continue;
    }
    const id = typeof (document as { id?: unknown }).id === 'string' ? (document as { id: string }).id : '(unknown)';
    issues.push({ id, issues: result.issues });
  }

  return { definitions, issues };
}

/** Replaces or appends a definition by id, preserving order. */
export function upsertSequence(definitions: SequenceDefinition[], next: SequenceDefinition): SequenceDefinition[] {
  const index = definitions.findIndex((definition) => definition.id === next.id);
  if (index === -1) return [...definitions, next];

  const copy = [...definitions];
  copy[index] = next;
  return copy;
}
