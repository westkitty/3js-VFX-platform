/**
 * Performance benchmarking types and report schema.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScenarioId =
  | 'idle_baseline'
  | 'sequential_casts_100'
  | 'concurrent_abilities_4'
  | 'overload_burst'
  | 'particle_scaling'
  | 'residue_scaling'
  | 'telegraphs_100'
  | 'editor_open_active_mutation'
  | 'freehand_path_workload'
  | 'terrain_raycast_sweep';

export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  description: string;
  warmupFrames: number;
  measuredFrames: number;
  seed: number;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  smokeOverride?: {
    warmupFrames: number;
    measuredFrames: number;
  };
}

export interface MetricsSample {
  frameDurationMs: number;
  drawCalls: number;
  triangles: number;
  lines: number;
  points: number;
  memoryGeometries: number;
  memoryTextures: number;
  activeParticles: number;
  activeLights: number;
  activeSpells: number;
  activeMutations: number;
  visualDecals: number;
  pooledLights: number;
  totalLights: number;
}

export interface MetricSummary {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  fps: number;
}

export interface EnvironmentProfile {
  os: string;
  platform: string;
  userAgent: string;
  webglRenderer: string;
  webglVendor: string;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  threeVersion: string;
  buildCommit: string;
  buildVersion: string;
  visibilityState: string;
}

export interface ScenarioResult {
  scenarioId: ScenarioId;
  scenarioName: string;
  config: ScenarioConfig;
  environment: EnvironmentProfile;
  samplesCount: number;
  warmupCount: number;
  frameTimeMs: MetricSummary;
  drawCalls: MetricSummary;
  triangles: MetricSummary;
  memoryGeometries: MetricSummary;
  memoryTextures: MetricSummary;
  peakParticles: number;
  peakLights: number;
  peakSpells: number;
  peakMutations: number;
  peakDecals: number;
  poolUsage: { active: number; pooled: number; total: number };
  leakedResources: { geometries: number; textures: number; objects: number };
  timestamp: string;
  passed: boolean;
  notes?: string;
}

export interface PerformanceReport {
  schemaVersion: '1.0.0';
  generatedAt: string;
  environment: EnvironmentProfile;
  results: Record<ScenarioId, ScenarioResult>;
}

export interface RegressionThresholds {
  p95MaxIncreasePct: number;
  drawCallsMaxIncreasePct: number;
  geometriesMaxIncreasePct: number;
  texturesMaxIncreasePct: number;
  allowResourceLeaks: boolean;
}

export const DEFAULT_REGRESSION_THRESHOLDS: RegressionThresholds = {
  p95MaxIncreasePct: 15.0,
  drawCallsMaxIncreasePct: 15.0,
  geometriesMaxIncreasePct: 15.0,
  texturesMaxIncreasePct: 15.0,
  allowResourceLeaks: false,
};

export interface ScenarioComparison {
  scenarioId: ScenarioId;
  compatible: boolean;
  mismatchReasons: string[];
  p95DeltaPct: number;
  drawCallsDeltaPct: number;
  geometriesDeltaPct: number;
  texturesDeltaPct: number;
  passed: boolean;
  violations: string[];
}

export interface BaselineComparisonReport {
  timestamp: string;
  overallPassed: boolean;
  environmentCompatible: boolean;
  comparisons: Record<ScenarioId, ScenarioComparison>;
}
