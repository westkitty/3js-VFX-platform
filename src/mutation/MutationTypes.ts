/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SurfaceMutationType } from '../types';

export const MUTATION_SCHEMA_CURRENT_VERSION = '1.0.0';
export const MUTATION_SCHEMA_SUPPORTED_VERSIONS = ['1.0.0'] as const;

export interface MutationRecord {
  schemaVersion: '1.0.0';
  id: string;
  type: SurfaceMutationType;
  surfaceId: string;
  center: [number, number, number];
  normal: [number, number, number];
  radius: number;
  intensity: number;
  shape: 'circle' | 'ribbon' | 'path';
  points?: [number, number, number][];
  createdAt: number;
  duration: number;
  seed: number;
  ownerId?: string;
  transactionId?: string;
  tags?: string[];
  params?: Record<string, number | string | boolean>;
}

export interface MutationDocument {
  schemaVersion: '1.0.0';
  mutations: MutationRecord[];
}

export interface TerrainHeightDelta {
  indices: number[];
  previousHeights: number[];
  newHeights: number[];
}

export interface MutationTransaction {
  id: string;
  timestamp: number;
  addedMutationIds: string[];
  addedMutations: MutationRecord[];
  removedMutations: MutationRecord[];
  terrainDelta?: TerrainHeightDelta;
}

export interface MutationBudgets {
  global: number;
  byType: Partial<Record<SurfaceMutationType, number>>;
}

export const DEFAULT_MUTATION_BUDGETS: MutationBudgets = {
  global: 64,
  byType: {
    scorch: 64,
    frost: 64,
    lava: 32,
    crystal: 16,
    golden_rune: 16,
    void_scar: 16,
  },
};

export interface ApplyMutationInput {
  type: SurfaceMutationType;
  surfaceId?: string;
  center: [number, number, number];
  normal?: [number, number, number];
  radius: number;
  intensity?: number;
  shape?: 'circle' | 'ribbon' | 'path';
  points?: [number, number, number][];
  createdAt?: number;
  duration?: number;
  seed?: number;
  ownerId?: string;
  tags?: string[];
  params?: Record<string, number | string | boolean>;
  terrainDelta?: TerrainHeightDelta;
}
