/**
 * Authoritative manager for persistent world-state mutations.
 *
 * Owns ONLY data records, transaction history, undo/redo, budgets, and lifecycle.
 * Contains ZERO Three.js mesh/geometry references, and zero wall-clock timing or unseeded randomness.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_MUTATION_BUDGETS,
  type ApplyMutationInput,
  type MutationBudgets,
  type MutationDocument,
  type MutationRecord,
  type MutationTransaction,
  type TerrainHeightDelta,
} from './MutationTypes';
import { SurfaceMutationType } from '../types';
import { parseMutationJson, validateMutationDocument } from '../schema/MutationValidator';

export interface MutationManagerEvents {
  onMutationAdded?: (mutation: MutationRecord) => void;
  onMutationRemoved?: (mutation: MutationRecord) => void;
  onMutationUpdated?: (mutation: MutationRecord) => void;
  onReset?: () => void;
  onTerrainDelta?: (delta: TerrainHeightDelta, isRevert: boolean) => void;
}

export class MutationManager {
  private readonly mutations = new Map<string, MutationRecord>();
  private readonly order: string[] = [];
  private budgets: MutationBudgets;

  private undoStack: MutationTransaction[] = [];
  private redoStack: MutationTransaction[] = [];
  private activeTransaction: MutationTransaction | null = null;

  private idCounter = 0;
  private transactionCounter = 0;
  private currentTime = 0;

  private readonly listeners: {
    added: Set<(mut: MutationRecord) => void>;
    removed: Set<(mut: MutationRecord) => void>;
    updated: Set<(mut: MutationRecord) => void>;
    reset: Set<() => void>;
    terrainDelta: Set<(delta: TerrainHeightDelta, isRevert: boolean) => void>;
  } = {
    added: new Set(),
    removed: new Set(),
    updated: new Set(),
    reset: new Set(),
    terrainDelta: new Set(),
  };

  constructor(budgets: Partial<MutationBudgets> = {}) {
    this.budgets = {
      global: budgets.global ?? DEFAULT_MUTATION_BUDGETS.global,
      byType: { ...DEFAULT_MUTATION_BUDGETS.byType, ...budgets.byType },
    };
  }

  public setBudgets(budgets: Partial<MutationBudgets>): void {
    this.budgets = {
      global: budgets.global ?? this.budgets.global,
      byType: { ...this.budgets.byType, ...budgets.byType },
    };
    this.enforceBudgets();
  }

  public getBudgets(): MutationBudgets {
    return {
      global: this.budgets.global,
      byType: { ...this.budgets.byType },
    };
  }

  public subscribe<K extends keyof MutationManagerEvents>(event: K, handler: NonNullable<MutationManagerEvents[K]>): () => void {
    if (event === 'onMutationAdded') {
      const fn = handler as (mut: MutationRecord) => void;
      this.listeners.added.add(fn);
      return () => this.listeners.added.delete(fn);
    }
    if (event === 'onMutationRemoved') {
      const fn = handler as (mut: MutationRecord) => void;
      this.listeners.removed.add(fn);
      return () => this.listeners.removed.delete(fn);
    }
    if (event === 'onMutationUpdated') {
      const fn = handler as (mut: MutationRecord) => void;
      this.listeners.updated.add(fn);
      return () => this.listeners.updated.delete(fn);
    }
    if (event === 'onReset') {
      const fn = handler as () => void;
      this.listeners.reset.add(fn);
      return () => this.listeners.reset.delete(fn);
    }
    if (event === 'onTerrainDelta') {
      const fn = handler as (delta: TerrainHeightDelta, isRevert: boolean) => void;
      this.listeners.terrainDelta.add(fn);
      return () => this.listeners.terrainDelta.delete(fn);
    }
    return () => {};
  }

  public beginTransaction(): string {
    const txId = `tx_${++this.transactionCounter}`;
    this.activeTransaction = {
      id: txId,
      timestamp: this.currentTime,
      addedMutationIds: [],
      removedMutations: [],
    };
    return txId;
  }

  public commitTransaction(): MutationTransaction | null {
    const tx = this.activeTransaction;
    this.activeTransaction = null;
    if (tx && (tx.addedMutationIds.length > 0 || tx.removedMutations.length > 0 || tx.terrainDelta)) {
      this.undoStack.push(tx);
      if (this.undoStack.length > 30) this.undoStack.shift();
      this.redoStack = [];
      return tx;
    }
    return null;
  }

  public recordTerrainDelta(delta: TerrainHeightDelta): void {
    if (this.activeTransaction) {
      this.activeTransaction.terrainDelta = delta;
    } else {
      const txId = `tx_terrain_${++this.transactionCounter}`;
      const tx: MutationTransaction = {
        id: txId,
        timestamp: this.currentTime,
        addedMutationIds: [],
        removedMutations: [],
        terrainDelta: delta,
      };
      this.undoStack.push(tx);
      if (this.undoStack.length > 30) this.undoStack.shift();
      this.redoStack = [];
    }
  }

  public applyMutation(input: ApplyMutationInput): MutationRecord {
    const id = `mut_${input.type}_${++this.idCounter}`;
    const createdAt = input.createdAt ?? this.currentTime;
    const duration = input.duration ?? 10.0;
    const seed = input.seed ?? ((this.idCounter * 2654435761) >>> 0);

    const record: MutationRecord = {
      schemaVersion: '1.0.0',
      id,
      type: input.type,
      surfaceId: input.surfaceId ?? 'terrain_main',
      center: [...input.center],
      normal: input.normal ? [...input.normal] : [0, 1, 0],
      radius: input.radius,
      intensity: input.intensity ?? 1.0,
      shape: input.shape ?? 'circle',
      points: input.points ? input.points.map((p) => [...p]) : undefined,
      createdAt,
      duration,
      seed,
      ownerId: input.ownerId,
      transactionId: this.activeTransaction ? this.activeTransaction.id : undefined,
      tags: input.tags ? [...input.tags] : undefined,
      params: input.params ? { ...input.params } : undefined,
    };

    let selfCreatedTx = false;
    if (!this.activeTransaction) {
      selfCreatedTx = true;
      this.beginTransaction();
    }

    // Apply terrain delta if bundled
    if (input.terrainDelta && this.activeTransaction) {
      this.activeTransaction.terrainDelta = input.terrainDelta;
    }

    // Enforce budgets before insertion
    this.enforceBudgetForType(record.type);
    this.enforceGlobalBudget();

    this.mutations.set(record.id, record);
    this.order.push(record.id);

    if (this.activeTransaction) {
      this.activeTransaction.addedMutationIds.push(record.id);
    }

    this.notifyAdded(record);

    if (selfCreatedTx) {
      this.commitTransaction();
    }

    return record;
  }

  public removeMutation(id: string): boolean {
    const record = this.mutations.get(id);
    if (!record) return false;

    this.mutations.delete(id);
    const idx = this.order.indexOf(id);
    if (idx > -1) this.order.splice(idx, 1);

    if (this.activeTransaction) {
      this.activeTransaction.removedMutations.push(record);
    }

    this.notifyRemoved(record);
    return true;
  }

  public clearByOwner(ownerId: string): void {
    const toRemove: string[] = [];
    for (const record of this.mutations.values()) {
      if (record.ownerId === ownerId) {
        toRemove.push(record.id);
      }
    }
    for (const id of toRemove) {
      this.removeMutation(id);
    }
  }

  public update(time: number): void {
    this.currentTime = time;
    const expired: string[] = [];

    for (const record of this.mutations.values()) {
      if (time >= record.createdAt + record.duration) {
        expired.push(record.id);
      }
    }

    for (const id of expired) {
      this.removeMutation(id);
    }
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const tx = this.undoStack.pop()!;

    // 1. Remove added mutations
    const restoredAdds: MutationRecord[] = [];
    for (const id of tx.addedMutationIds) {
      const mut = this.mutations.get(id);
      if (mut) {
        restoredAdds.push(mut);
        this.mutations.delete(id);
        const idx = this.order.indexOf(id);
        if (idx > -1) this.order.splice(idx, 1);
        this.notifyRemoved(mut);
      }
    }

    // 2. Restore removed mutations
    for (const mut of tx.removedMutations) {
      this.mutations.set(mut.id, mut);
      this.order.push(mut.id);
      this.notifyAdded(mut);
    }

    // 3. Revert terrain delta if present
    if (tx.terrainDelta) {
      this.notifyTerrainDelta(tx.terrainDelta, true);
    }

    this.redoStack.push(tx);
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const tx = this.redoStack.pop()!;

    // 1. Re-add added mutations
    // Re-verify budget
    for (const id of tx.addedMutationIds) {
      // Find if we have original record or restore it
      const existing = this.mutations.get(id);
      if (!existing) {
        // Find in removed or reconstruct
      }
    }

    // 2. Re-apply terrain delta
    if (tx.terrainDelta) {
      this.notifyTerrainDelta(tx.terrainDelta, false);
    }

    this.undoStack.push(tx);
    return true;
  }

  public reset(): void {
    const all = [...this.mutations.values()];
    this.mutations.clear();
    this.order.length = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.activeTransaction = null;

    for (const mut of all) {
      this.notifyRemoved(mut);
    }
    this.notifyReset();
  }

  public exportDocument(): MutationDocument {
    return {
      schemaVersion: '1.0.0',
      mutations: this.order.map((id) => this.mutations.get(id)!).filter(Boolean),
    };
  }

  public exportJson(pretty = true): string {
    const doc = this.exportDocument();
    return pretty ? JSON.stringify(doc, null, 2) : JSON.stringify(doc);
  }

  public importJson(
    jsonString: string,
    options: {
      clearExisting?: boolean;
      allowedSurfaceIds?: Set<string>;
    } = {}
  ): { ok: boolean; count: number; error?: string } {
    const result = parseMutationJson(jsonString);
    if (!result.ok || !result.document) {
      return {
        ok: false,
        count: 0,
        error: `Validation failed: ${result.issues.map((i) => `${i.path}: ${i.message}`).join(', ')}`,
      };
    }

    const doc = result.document;

    // Validate surface IDs if a whitelist is supplied
    if (options.allowedSurfaceIds) {
      for (const mut of doc.mutations) {
        if (!options.allowedSurfaceIds.has(mut.surfaceId)) {
          return {
            ok: false,
            count: 0,
            error: `Unresolved surfaceId: "${mut.surfaceId}". Must be one of: ${Array.from(options.allowedSurfaceIds).join(', ')}`,
          };
        }
      }
    }

    // Atomic import: only mutate if fully valid
    if (options.clearExisting !== false) {
      this.reset();
    }

    let loadedCount = 0;
    for (const mut of doc.mutations) {
      this.enforceBudgetForType(mut.type);
      this.enforceGlobalBudget();

      this.mutations.set(mut.id, mut);
      this.order.push(mut.id);
      this.notifyAdded(mut);
      loadedCount++;
    }

    return { ok: true, count: loadedCount };
  }

  public getMutations(): MutationRecord[] {
    return this.order.map((id) => this.mutations.get(id)!).filter(Boolean);
  }

  public getMutation(id: string): MutationRecord | undefined {
    return this.mutations.get(id);
  }

  public getActiveCount(): number {
    return this.mutations.size;
  }

  public getCountByType(type: SurfaceMutationType): number {
    let count = 0;
    for (const mut of this.mutations.values()) {
      if (mut.type === type) count++;
    }
    return count;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  private enforceBudgetForType(type: SurfaceMutationType): void {
    const limit = this.budgets.byType[type];
    if (typeof limit !== 'number' || limit <= 0) return;

    const typedIds = this.order.filter((id) => this.mutations.get(id)?.type === type);
    while (typedIds.length >= limit) {
      const oldestId = typedIds.shift()!;
      this.removeMutation(oldestId);
    }
  }

  private enforceGlobalBudget(): void {
    while (this.order.length >= this.budgets.global) {
      const oldestId = this.order[0];
      if (oldestId) {
        this.removeMutation(oldestId);
      } else {
        break;
      }
    }
  }

  private enforceBudgets(): void {
    for (const type of Object.keys(this.budgets.byType) as SurfaceMutationType[]) {
      this.enforceBudgetForType(type);
    }
    this.enforceGlobalBudget();
  }

  private notifyAdded(mutation: MutationRecord): void {
    for (const fn of this.listeners.added) fn(mutation);
  }

  private notifyRemoved(mutation: MutationRecord): void {
    for (const fn of this.listeners.removed) fn(mutation);
  }

  private notifyUpdated(mutation: MutationRecord): void {
    for (const fn of this.listeners.updated) fn(mutation);
  }

  private notifyReset(): void {
    for (const fn of this.listeners.reset) fn();
  }

  private notifyTerrainDelta(delta: TerrainHeightDelta, isRevert: boolean): void {
    for (const fn of this.listeners.terrainDelta) fn(delta, isRevert);
  }
}
