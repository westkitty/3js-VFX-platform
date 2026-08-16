/**
 * Discrete scaling profiles required by the Phase 6 release contract.
 * The registry still contains ten top-level scenarios; these profiles produce
 * separate 1k/10k/50k particle and 100/500/2000 residue measurements.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VisualParticleField } from '../vfx/VisualParticleField';
import { ResidueManager } from '../terrain/ResidueManager';
import { SurfaceMutationType } from '../types';
import { PerformanceHarness } from './PerformanceHarness';
import { PerformanceContext, PerformanceScenario } from './PerformanceScenario';
import { ScenarioConfig, ScenarioId, ScenarioResult } from './PerformanceTypes';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function profileConfig(id: string, name: string, seed: number): ScenarioConfig {
  return {
    id: id as ScenarioId,
    name,
    description: `Discrete Phase 6 scaling profile: ${name}`,
    warmupFrames: 60,
    measuredFrames: 300,
    seed,
    cameraPosition: [0, 18, 28],
    cameraTarget: [0, 0, 0],
    smokeOverride: { warmupFrames: 10, measuredFrames: 30 },
  };
}

class ParticleProfileScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig;
  private field: VisualParticleField | null = null;

  constructor(private readonly count: number, seed: number) {
    this.config = profileConfig(`particle_scaling_${count}`, `Particle Scaling ${count}`, seed);
  }

  public setup(ctx: PerformanceContext): void {
    this.cleanup(ctx);
    ctx.abilityMgr.clearAll();
    const rand = seededRandom(this.config.seed);
    this.field = new VisualParticleField(ctx.engine.scene, this.count);
    this.field.addBurst(new THREE.Vector3(0, 2, 0), this.count, 0x66ccff, 6, 0, rand);
  }

  public update(_ctx: PerformanceContext, _frameIndex: number, dt: number, time: number): void {
    this.field?.update(dt, time);
  }

  public cleanup(ctx: PerformanceContext): void {
    if (this.field) this.field.destroy(ctx.engine.scene);
    this.field = null;
  }
}

class ResidueProfileScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig;
  private manager: ResidueManager | null = null;
  private records: any[] = [];

  constructor(private readonly count: number, seed: number) {
    this.config = profileConfig(`residue_scaling_${count}`, `Residue Scaling ${count}`, seed);
  }

  public setup(ctx: PerformanceContext): void {
    this.cleanup(ctx);
    this.manager = new ResidueManager(ctx.engine.scene);
    const archetypes: SurfaceMutationType[] = ['scorch', 'frost', 'lava', 'crystal', 'golden_rune', 'void_scar'];

    for (let i = 0; i < this.count; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const radiusFromCenter = Math.sqrt(i / Math.max(1, this.count)) * 25;
      const x = Math.cos(angle) * radiusFromCenter;
      const z = Math.sin(angle) * radiusFromCenter;
      const hit = ctx.engine.surfaceQuery.projectPoint(new THREE.Vector3(x, 0, z));
      const type = archetypes[i % archetypes.length];
      const record = {
        schemaVersion: '1.0.0' as const,
        id: `bench_profile_${this.count}_${i}`,
        type,
        surfaceId: hit?.surfaceId || 'terrain_main',
        center: hit ? [hit.point.x, hit.point.y, hit.point.z] : [x, 0, z],
        normal: hit ? [hit.normal.x, hit.normal.y, hit.normal.z] : [0, 1, 0],
        radius: 1.5 + (i % 5) * 0.5,
        intensity: 1,
        shape: 'circle' as const,
        createdAt: 0,
        duration: 999999,
        seed: this.config.seed + i,
      };
      this.records.push(record);
      this.manager.createVisual(record as any);
    }
  }

  public update(_ctx: PerformanceContext, _frameIndex: number, _dt: number, time: number): void {
    this.manager?.update(time, this.records as any);
  }

  public cleanup(_ctx: PerformanceContext): void {
    this.manager?.clearAll();
    this.manager = null;
    this.records = [];
  }

  public getVisualDecalCount(): number {
    return this.records.length;
  }
}

export class ScalingProfileHarness {
  constructor(private readonly ctx: PerformanceContext) {}

  public async runAll(isSmoke: boolean): Promise<Record<string, ScenarioResult>> {
    const harness = new PerformanceHarness(this.ctx);
    const scenarios: PerformanceScenario[] = [
      new ParticleProfileScenario(1000, 0x51001001),
      new ParticleProfileScenario(10000, 0x51010002),
      new ParticleProfileScenario(50000, 0x51500003),
      new ResidueProfileScenario(100, 0x52000100),
      new ResidueProfileScenario(500, 0x52000500),
      new ResidueProfileScenario(2000, 0x52002000),
    ];

    const results: Record<string, ScenarioResult> = {};
    for (const scenario of scenarios) {
      const result = await harness.runScenario(scenario, { isSmoke });
      results[String(scenario.config.id)] = result;
    }
    return results;
  }
}
