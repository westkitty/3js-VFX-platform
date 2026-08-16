/**
 * Registry and definitions of the ten deterministic performance benchmark scenarios.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';
import { VisualParticleField } from '../vfx/VisualParticleField';
import { ResidueManager } from '../terrain/ResidueManager';
import { SurfaceHit, SurfaceMutationType } from '../types';
import { PerformanceContext, PerformanceScenario } from './PerformanceScenario';
import { ScenarioConfig, ScenarioId } from './PerformanceTypes';

// ---------------------------------------------------------------------------
// 1. IDLE BASELINE
// ---------------------------------------------------------------------------
export class IdleBaselineScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'idle_baseline',
    name: 'Idle Baseline',
    description: 'Measures steady-state frame timing and renderer overhead with no active casts or workloads.',
    warmupFrames: 300,
    measuredFrames: 1800,
    seed: 0x1d1e001,
    cameraPosition: [0, 18, 28],
    cameraTarget: [0, 0, 0],
    smokeOverride: { warmupFrames: 30, measuredFrames: 120 },
  };

  public setup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.indicatorMgr.clear();
    ctx.freehandCaster.clear();
    ctx.terrain.mutationManager.reset();
    ctx.engine.camera.position.set(0, 18, 28);
    ctx.engine.camera.lookAt(0, 0, 0);
  }

  public update(): void {
    // Idle frame pass
  }

  public cleanup(): void {
    // Clean
  }
}

// ---------------------------------------------------------------------------
// 2. 100 SEQUENTIAL CASTS
// ---------------------------------------------------------------------------
export class SequentialCastsScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'sequential_casts_100',
    name: '100 Sequential Casts',
    description: 'Sequentially executes 100 registered abilities through the live runtime and verifies full cleanup.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x5e90002,
    smokeOverride: { warmupFrames: 60, measuredFrames: 120 },
  };

  private castCount = 0;
  private readonly maxCasts = 100;
  private abilityIds: string[] = [];

  public setup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
    this.castCount = 0;
    this.abilityIds = globalAbilityRegistry.getAll().map((a) => a.id);
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    if (this.castCount >= this.maxCasts) return;

    // Cast an ability every 6 frames or when no spells are active
    if (frameIndex % 6 === 0 || ctx.abilityMgr.getActiveCount() === 0) {
      const abilityId = this.abilityIds[this.castCount % this.abilityIds.length] || 'sample_amber_orb';
      const def = globalAbilityRegistry.get(abilityId);
      if (!def) return;

      const angle = (this.castCount * 36 * Math.PI) / 180;
      const dist = 6 + (this.castCount % 5) * 2;
      const targetPoint = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      const hit = ctx.engine.surfaceQuery.projectPoint(targetPoint);
      const origin = new THREE.Vector3(0, 1, 0);
      const target = hit ? hit.point.clone() : targetPoint;
      const direction = target.clone().sub(origin).normalize();

      ctx.abilityMgr.cast(
        {
          abilityId,
          origin,
          target,
          direction,
          distance: origin.distanceTo(target),
          surface: hit,
          seed: this.config.seed + this.castCount,
        },
        def
      );
      this.castCount++;
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
  }
}

// ---------------------------------------------------------------------------
// 3. FOUR CONCURRENT ABILITIES
// ---------------------------------------------------------------------------
export class ConcurrentAbilitiesScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'concurrent_abilities_4',
    name: 'Four Concurrent Abilities',
    description: 'Sustains four simultaneous ability instances across four quadrants and measures peak throughput.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x4c00003,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private readonly activeSlots = 4;
  private readonly testAbilities = [
    'sample_amber_orb',
    'sample_solar_column',
    'sample_frost_trace',
    'sample_violet_cascade',
  ];

  public setup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    const active = ctx.abilityMgr.getActiveCount();
    if (active < this.activeSlots) {
      const needed = this.activeSlots - active;
      for (let i = 0; i < needed; i++) {
        const slotIdx = (active + i) % this.activeSlots;
        const abilityId = this.testAbilities[slotIdx % this.testAbilities.length];
        const def = globalAbilityRegistry.get(abilityId) || globalAbilityRegistry.getAll()[0];
        if (!def) continue;

        const angle = (slotIdx * Math.PI) / 2 + Math.PI / 4;
        const targetPos = new THREE.Vector3(Math.cos(angle) * 10, 0, Math.sin(angle) * 10);
        const hit = ctx.engine.surfaceQuery.projectPoint(targetPos);
        const origin = new THREE.Vector3(0, 1, 0);
        const target = hit ? hit.point.clone() : targetPos;
        const direction = target.clone().sub(origin).normalize();

        ctx.abilityMgr.cast(
          {
            abilityId: def.id,
            origin,
            target,
            direction,
            distance: origin.distanceTo(target),
            surface: hit,
            seed: this.config.seed + frameIndex * 10 + i,
          },
          def
        );
      }
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
  }
}

// ---------------------------------------------------------------------------
// 4. OVERLOAD BURST (20 CONCURRENT ABILITIES)
// ---------------------------------------------------------------------------
export class OverloadBurstScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'overload_burst',
    name: 'Overload Burst',
    description: 'Stresses the renderer with 20 simultaneous active ability instances and particle fields.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x07e0004,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private readonly targetCount = 20;

  public setup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    const active = ctx.abilityMgr.getActiveCount();
    if (active < this.targetCount) {
      const needed = this.targetCount - active;
      const allDefs = globalAbilityRegistry.getAll();
      for (let i = 0; i < needed; i++) {
        const def = allDefs[(active + i) % allDefs.length];
        if (!def) continue;

        const angle = ((active + i) * (2 * Math.PI)) / this.targetCount;
        const dist = 4 + ((active + i) % 4) * 3;
        const targetPos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        const hit = ctx.engine.surfaceQuery.projectPoint(targetPos);
        const origin = new THREE.Vector3(0, 1, 0);
        const target = hit ? hit.point.clone() : targetPos;
        const direction = target.clone().sub(origin).normalize();

        ctx.abilityMgr.cast(
          {
            abilityId: def.id,
            origin,
            target,
            direction,
            distance: origin.distanceTo(target),
            surface: hit,
            seed: this.config.seed + frameIndex * 100 + i,
          },
          def
        );
      }
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    ctx.terrain.resetTerrain();
  }
}

// ---------------------------------------------------------------------------
// 5. PARTICLE SCALING (1k, 10k, 50k particles)
// ---------------------------------------------------------------------------
export class ParticleScalingScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'particle_scaling',
    name: 'Particle Scaling (1k - 50k)',
    description: 'Benchmarks instanced particle rendering at scales of 1k, 10k, and 50k active simulation motes.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x9a47005,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private particleFields: VisualParticleField[] = [];

  public setup(ctx: PerformanceContext): void {
    this.cleanup(ctx);

    // Create 1k, 10k, and 39k particle systems = 50,000 total particles
    const configs = [
      { count: 1000, color: 0xffaa00, speed: 8, radius: 10 },
      { count: 10000, color: 0x00ccff, speed: 6, radius: 15 },
      { count: 39000, color: 0xaa44ff, speed: 5, radius: 20 },
    ];

    for (const c of configs) {
      const field = new VisualParticleField(ctx.engine.scene, c.count);
      const pos = new THREE.Vector3(0, 2, 0);
      field.addBurst(pos, c.count, c.color, c.speed, 0, () => ctx.engine.rng.next());
      this.particleFields.push(field);
    }
  }

  public update(_ctx: PerformanceContext, _frameIndex: number, dt: number, time: number): void {
    for (const field of this.particleFields) {
      field.update(dt, time);
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    for (const field of this.particleFields) {
      field.destroy(ctx.engine.scene);
    }
    this.particleFields = [];
  }
}

// ---------------------------------------------------------------------------
// 6. RESIDUE SCALING (100, 500, 2000 surface marks)
// ---------------------------------------------------------------------------
export class ResidueScalingScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'residue_scaling',
    name: 'Residue Scaling (100 - 2k Marks)',
    description: 'Tests decal shader rendering and GPU surface projection scaling across 2,000 persistent marks.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x4e51006,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private testResidueManager: ResidueManager | null = null;
  private markCount = 0;
  private records: any[] = [];

  public setup(ctx: PerformanceContext): void {
    this.cleanup(ctx);
    this.testResidueManager = new ResidueManager(ctx.engine.scene);
    this.markCount = 0;
    this.records = [];

    const archetypes: SurfaceMutationType[] = ['scorch', 'frost', 'lava', 'crystal', 'golden_rune', 'void_scar'];
    const totalMarks = 2000;

    for (let i = 0; i < totalMarks; i++) {
      const angle = (i * 137.5 * Math.PI) / 180; // Fibonacci spiral
      const r = Math.sqrt(i / totalMarks) * 25;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const hit = ctx.engine.surfaceQuery.projectPoint(new THREE.Vector3(x, 0, z));
      const center: [number, number, number] = hit ? [hit.point.x, hit.point.y, hit.point.z] : [x, 0, z];
      const normal: [number, number, number] = hit ? [hit.normal.x, hit.normal.y, hit.normal.z] : [0, 1, 0];
      const type = archetypes[i % archetypes.length];

      const record = {
        schemaVersion: '1.0.0' as const,
        id: `bench_res_${i}`,
        type,
        surfaceId: hit?.surfaceId || 'terrain_main',
        center,
        normal,
        radius: 1.5 + (i % 5) * 0.5,
        intensity: 1.0,
        shape: 'circle' as const,
        createdAt: 0,
        duration: 999999,
        seed: this.config.seed + i,
      };

      this.records.push(record);
      this.testResidueManager.createVisual(record);
      this.markCount++;
    }
  }

  public update(_ctx: PerformanceContext, _frameIndex: number, _dt: number, time: number): void {
    this.testResidueManager?.update(time, this.records);
  }

  public cleanup(ctx: PerformanceContext): void {
    if (this.testResidueManager) {
      this.testResidueManager.clearAll();
      this.testResidueManager = null;
    }
    this.records = [];
    this.markCount = 0;
  }

  public getVisualDecalCount(): number {
    return this.markCount;
  }
}

// ---------------------------------------------------------------------------
// 7. 100 TELEGRAPHS
// ---------------------------------------------------------------------------
export class Telegraphs100Scenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'telegraphs_100',
    name: '100 Surface Telegraphs',
    description: 'Renders 100 surface-projected telegraph outlines (lines, cones, zones, rings, rectangles).',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x7e1e007,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private spawned = false;

  public setup(ctx: PerformanceContext): void {
    ctx.indicatorMgr.clear();
    this.spawned = false;
  }

  public update(ctx: PerformanceContext): void {
    if (!this.spawned) {
      const shapes = ['line', 'zone', 'cone', 'ring', 'rectangle'] as const;
      const count = 100;

      for (let i = 0; i < count; i++) {
        const shape = shapes[i % shapes.length];
        const angle = (i * (360 / count) * Math.PI) / 180;
        const dist = 3 + (i % 6) * 3.5;
        const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        const hit: SurfaceHit = ctx.engine.surfaceQuery.projectPoint(pos) || {
          point: pos,
          normal: new THREE.Vector3(0, 1, 0),
          tangent: new THREE.Vector3(1, 0, 0),
          bitangent: new THREE.Vector3(0, 0, 1),
          uv: new THREE.Vector2(0.5, 0.5),
          object: null,
        };

        const dir = pos.clone().sub(new THREE.Vector3(0, 0, 0)).normalize();
        if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);

        ctx.indicatorMgr.show(hit, {
          shape,
          direction: dir,
          range: 8,
          radius: 3,
          angle: Math.PI / 3,
          width: 2,
          warningDuration: 99999, // keep active for entire benchmark duration
          commitDuration: 99999,
        });
      }
      this.spawned = true;
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.indicatorMgr.clear();
    this.spawned = false;
  }
}

// ---------------------------------------------------------------------------
// 8. EDITOR OPEN + ACTIVE MUTATION
// ---------------------------------------------------------------------------
export class EditorOpenActiveMutationScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'editor_open_active_mutation',
    name: 'Editor Open + Live Parameter Mutation',
    description: 'Measures runtime parameter reconciliation overhead under continuous live property edits.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0xed17008,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  private baseDef = globalAbilityRegistry.getAll()[0];

  public setup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
    this.baseDef = globalAbilityRegistry.getAll()[0];
    const origin = new THREE.Vector3(0, 1, 0);
    const target = new THREE.Vector3(0, 0, 8);
    const hit = ctx.engine.surfaceQuery.projectPoint(target);

    ctx.abilityMgr.castPreview(
      {
        abilityId: this.baseDef.id,
        origin,
        target,
        direction: new THREE.Vector3(0, 0, 1),
        distance: 8,
        surface: hit,
        seed: this.config.seed,
      },
      this.baseDef
    );
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    if (frameIndex % 5 === 0) {
      // Deterministically mutate live parameters
      const mutated = JSON.parse(JSON.stringify(this.baseDef));
      const factor = Math.sin(frameIndex * 0.1);
      mutated.timing.windup = Math.max(0.05, 0.2 + factor * 0.1);
      mutated.feedback.cameraShake = Math.max(0, 0.2 + factor * 0.15);

      if (mutated.modules[0]?.params?.radius !== undefined) {
        mutated.modules[0].params.radius = Math.max(0.2, 0.8 + factor * 0.5);
      }
      if (mutated.modules[1]?.params?.count !== undefined) {
        mutated.modules[1].params.count = Math.floor(100 + factor * 50);
      }

      ctx.abilityMgr.updatePreviewDefinition(mutated);
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.abilityMgr.clearAll();
  }
}

// ---------------------------------------------------------------------------
// 9. FREEHAND PATH WORKLOAD
// ---------------------------------------------------------------------------
export class FreehandPathWorkloadScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'freehand_path_workload',
    name: 'Freehand Path Workload',
    description: 'Continuously builds, resamples with Catmull-Rom, and projects canonical freehand drawing paths.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0xf4ee009,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  public setup(ctx: PerformanceContext): void {
    ctx.freehandCaster.clear();
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    // Simulate a realistic continuous user freehand drawing stroke over 30 frames
    const cycleFrame = frameIndex % 30;
    const p1 = new THREE.Vector3(-10, 0, -10);
    const p2 = new THREE.Vector3(-5 + Math.sin(frameIndex * 0.05) * 3, 0, -2);
    const p3 = new THREE.Vector3(5 + Math.cos(frameIndex * 0.05) * 3, 0, 2);
    const p4 = new THREE.Vector3(10, 0, 10);

    if (cycleFrame === 0) {
      const hit = ctx.engine.surfaceQuery.projectPoint(p1);
      if (hit) ctx.freehandCaster.startDrawing(hit);
    } else if (cycleFrame === 10) {
      const hit = ctx.engine.surfaceQuery.projectPoint(p2);
      if (hit) ctx.freehandCaster.addPoint(hit);
    } else if (cycleFrame === 20) {
      const hit = ctx.engine.surfaceQuery.projectPoint(p3);
      if (hit) ctx.freehandCaster.addPoint(hit);
    } else if (cycleFrame === 29) {
      const hit = ctx.engine.surfaceQuery.projectPoint(p4);
      if (hit) {
        ctx.freehandCaster.addPoint(hit);
        ctx.freehandCaster.getResampledPath(30);
        ctx.freehandCaster.finishDrawing();
      }
    }
  }

  public cleanup(ctx: PerformanceContext): void {
    ctx.freehandCaster.clear();
  }
}

// ---------------------------------------------------------------------------
// 10. TERRAIN / SURFACE RAYCAST SWEEP
// ---------------------------------------------------------------------------
export class TerrainRaycastSweepScenario implements PerformanceScenario {
  public readonly config: ScenarioConfig = {
    id: 'terrain_raycast_sweep',
    name: 'Terrain & Irregular Surface Raycast Sweep',
    description: 'Executes 50 spatial SurfaceQuery point and normal projections per frame across slopes and steps.',
    warmupFrames: 60,
    measuredFrames: 600,
    seed: 0x5ee9010,
    smokeOverride: { warmupFrames: 20, measuredFrames: 100 },
  };

  public setup(): void {
    // Standard setup
  }

  public update(ctx: PerformanceContext, frameIndex: number): void {
    const sweepCount = 50;
    const query = ctx.engine.surfaceQuery;

    for (let i = 0; i < sweepCount; i++) {
      const u = (i / sweepCount) * Math.PI * 2 + frameIndex * 0.02;
      const r = 5 + (i % 10) * 2;
      const x = Math.cos(u) * r;
      const z = Math.sin(u) * r;
      const pt = new THREE.Vector3(x, 0, z);

      query.projectPoint(pt);
      query.projectNear(pt, new THREE.Vector3(0, 1, 0), 4);
    }
  }

  public cleanup(): void {
    // Done
  }
}

// ---------------------------------------------------------------------------
// REGISTRY
// ---------------------------------------------------------------------------
export class PerformanceScenarioRegistry {
  private scenarios: Map<ScenarioId, PerformanceScenario> = new Map();

  constructor() {
    this.register(new IdleBaselineScenario());
    this.register(new SequentialCastsScenario());
    this.register(new ConcurrentAbilitiesScenario());
    this.register(new OverloadBurstScenario());
    this.register(new ParticleScalingScenario());
    this.register(new ResidueScalingScenario());
    this.register(new Telegraphs100Scenario());
    this.register(new EditorOpenActiveMutationScenario());
    this.register(new FreehandPathWorkloadScenario());
    this.register(new TerrainRaycastSweepScenario());
  }

  public register(scenario: PerformanceScenario): void {
    this.scenarios.set(scenario.config.id, scenario);
  }

  public get(id: ScenarioId): PerformanceScenario | undefined {
    return this.scenarios.get(id);
  }

  public getAll(): PerformanceScenario[] {
    return Array.from(this.scenarios.values());
  }

  public getIds(): ScenarioId[] {
    return Array.from(this.scenarios.keys());
  }
}

export const globalPerformanceRegistry = new PerformanceScenarioRegistry();
