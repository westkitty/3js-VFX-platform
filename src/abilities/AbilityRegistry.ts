/**
 * Authoritative ability registry.
 *
 * Every admission path — built-ins, the declarative pack, the Ability Factory,
 * and JSON import — passes through schema validation first. Nothing reaches the
 * runtime half-registered, and duplicate ids resolve by an explicit policy
 * rather than by silent overwrite.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AbilityDefinition } from '../types';
import {
  AbilityDocument,
  AbilityValidationIssue,
  parseAbilityJson,
  toAbilityDocument,
  validateAbilityDefinition,
  validateAbilityDocument,
} from '../schema/AbilityValidator';
import { BUILTIN_ABILITIES } from './builtins';
import { DECLARATIVE_ABILITY_PACK } from './declarative';

export { BUILTIN_ABILITIES } from './builtins';

/** What to do when a definition reuses an already-registered id. */
export type DuplicateIdPolicy = 'reject' | 'replace';

export interface AbilityRegisterResult {
  ok: boolean;
  id: string | null;
  issues: AbilityValidationIssue[];
  /** Set when the source document was migrated from an older schema version. */
  migratedFrom: string | null;
  /** True when an existing entry with the same id was replaced. */
  replaced: boolean;
}

export interface AbilityImportResult {
  ok: boolean;
  registered: string[];
  rejected: Array<{ index: number; issues: AbilityValidationIssue[] }>;
}

export interface AbilityRegisterOptions {
  duplicates?: DuplicateIdPolicy;
}

function failure(issues: AbilityValidationIssue[]): AbilityRegisterResult {
  return { ok: false, id: null, issues, migratedFrom: null, replaced: false };
}

export class AbilityRegistry {
  private registry: Map<string, AbilityDefinition> = new Map();
  private loadIssues: Array<{ id: string; issues: AbilityValidationIssue[] }> = [];

  constructor() {
    // Built-ins and the declarative pack are held to the same schema gate as
    // user input. Anything that fails is recorded, never partly registered.
    for (const definition of BUILTIN_ABILITIES) {
      const result = this.register(definition);
      if (!result.ok) this.loadIssues.push({ id: definition.id, issues: result.issues });
    }

    for (const document of DECLARATIVE_ABILITY_PACK) {
      const result = this.registerDocument(document);
      if (!result.ok) {
        const id = typeof (document as { id?: unknown }).id === 'string' ? (document as { id: string }).id : '(unknown)';
        this.loadIssues.push({ id, issues: result.issues });
      }
    }
  }

  /** Non-empty only if a shipped definition failed validation at startup. */
  public getLoadIssues(): Array<{ id: string; issues: AbilityValidationIssue[] }> {
    return this.loadIssues.map((entry) => ({ id: entry.id, issues: [...entry.issues] }));
  }

  /** Registers an in-memory runtime definition after validating it. */
  public register(definition: unknown, options: AbilityRegisterOptions = {}): AbilityRegisterResult {
    const validation = validateAbilityDefinition(definition);
    if (!validation.ok || !validation.definition) return failure(validation.issues);
    return this.commit(validation.definition, validation.migratedFrom, options);
  }

  /** Registers a versioned document, migrating supported older versions. */
  public registerDocument(document: unknown, options: AbilityRegisterOptions = {}): AbilityRegisterResult {
    const validation = validateAbilityDocument(document);
    if (!validation.ok || !validation.definition) return failure(validation.issues);
    return this.commit(validation.definition, validation.migratedFrom, options);
  }

  private commit(
    definition: AbilityDefinition,
    migratedFrom: string | null,
    options: AbilityRegisterOptions,
  ): AbilityRegisterResult {
    const policy = options.duplicates ?? 'reject';
    const existing = this.registry.has(definition.id);

    if (existing && policy === 'reject') {
      return failure([
        {
          path: '/id',
          message: `ability id "${definition.id}" is already registered; pass duplicates:"replace" to overwrite`,
          keyword: 'duplicateId',
        },
      ]);
    }

    this.registry.set(definition.id, definition);
    return { ok: true, id: definition.id, issues: [], migratedFrom, replaced: existing };
  }

  public has(id: string): boolean {
    return this.registry.has(id);
  }

  public get(id: string): AbilityDefinition | undefined {
    return this.registry.get(id);
  }

  public getAll(): AbilityDefinition[] {
    return Array.from(this.registry.values());
  }

  public getIds(): string[] {
    return Array.from(this.registry.keys());
  }

  public getBySchool(school: string): AbilityDefinition[] {
    return this.getAll().filter((ability) => ability.school === school);
  }

  public remove(id: string): boolean {
    return this.registry.delete(id);
  }

  /** Exports every registered ability as schema-conforming documents. */
  public exportJson(): string {
    return JSON.stringify(this.getAll().map(toAbilityDocument), null, 2);
  }

  /** Exports one ability as a schema-conforming document. */
  public exportAbilityJson(id: string): string | null {
    const definition = this.registry.get(id);
    return definition ? JSON.stringify(toAbilityDocument(definition), null, 2) : null;
  }

  /**
   * Imports one document or an array of them.
   *
   * Atomic: if any document fails validation or the duplicate policy, nothing
   * is registered and every failure is reported.
   */
  public importJson(jsonString: string, options: AbilityRegisterOptions = {}): AbilityImportResult {
    const parsed = parseAbilityJson(jsonString);
    if (!parsed.ok) return { ok: false, registered: [], rejected: [{ index: 0, issues: parsed.issues }] };

    const policy = options.duplicates ?? 'reject';
    const rejected: AbilityImportResult['rejected'] = [];
    const accepted: AbilityDefinition[] = [];
    const seenInBatch = new Set<string>();

    parsed.results.forEach((result, index) => {
      if (!result.ok || !result.definition) {
        rejected.push({ index, issues: result.issues });
        return;
      }

      const id = result.definition.id;
      if (seenInBatch.has(id)) {
        rejected.push({
          index,
          issues: [{ path: '/id', message: `duplicate ability id "${id}" within the same import`, keyword: 'duplicateId' }],
        });
        return;
      }
      if (this.registry.has(id) && policy === 'reject') {
        rejected.push({
          index,
          issues: [{ path: '/id', message: `ability id "${id}" is already registered`, keyword: 'duplicateId' }],
        });
        return;
      }

      seenInBatch.add(id);
      accepted.push(result.definition);
    });

    if (rejected.length > 0) return { ok: false, registered: [], rejected };

    for (const definition of accepted) this.registry.set(definition.id, definition);
    return { ok: true, registered: accepted.map((definition) => definition.id), rejected: [] };
  }
}

export const globalAbilityRegistry = new AbilityRegistry();
export type { AbilityDocument, AbilityValidationIssue };
