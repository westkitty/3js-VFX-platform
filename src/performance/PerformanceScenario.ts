/**
 * Performance Scenario base interfaces and context definition.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Engine } from '../core/Engine';
import { TerrainManager } from '../terrain/TerrainManager';
import { AbilityManager } from '../abilities/AbilityRuntime';
import { FreehandCaster } from '../drawing/FreehandCaster';
import { SurfaceIndicatorManager } from '../indicators/SurfaceIndicatorManager';
import { SequenceRuntime } from '../sequence/SequenceRuntime';
import { AbilitySequenceEmitter } from '../sequence/AbilitySequenceEmitter';
import { SurfaceValidationFixture } from '../validation/SurfaceValidationFixture';
import { ScenarioConfig, ScenarioId } from './PerformanceTypes';

export interface PerformanceContext {
  engine: Engine;
  terrain: TerrainManager;
  abilityMgr: AbilityManager;
  freehandCaster: FreehandCaster;
  indicatorMgr: SurfaceIndicatorManager;
  sequenceRuntime: SequenceRuntime;
  sequenceEmitter: AbilitySequenceEmitter;
  validationFixture?: SurfaceValidationFixture | null;
}

export interface PerformanceScenario {
  readonly config: ScenarioConfig;
  setup(ctx: PerformanceContext): Promise<void> | void;
  update(ctx: PerformanceContext, frameIndex: number, dt: number, time: number): void;
  cleanup(ctx: PerformanceContext): Promise<void> | void;
  getActiveMutationCount?(ctx: PerformanceContext): number;
  getVisualDecalCount?(ctx: PerformanceContext): number;
}
