/**
 * Benchmark runner and execution harness for deterministic performance scenarios.
 *
 * Simulation advances at a fixed EngineClock step. Performance samples measure
 * actual requestAnimationFrame-to-requestAnimationFrame wall time, not synchronous
 * CPU submission time around renderer.render().
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricsCollector } from './MetricsCollector';
import { PerformanceContext, PerformanceScenario } from './PerformanceScenario';
import { globalPerformanceRegistry } from './PerformanceScenarioRegistry';
import {
  PerformanceReport,
  ScenarioId,
  ScenarioResult,
} from './PerformanceTypes';

export interface HarnessRunOptions {
  isSmoke?: boolean;
  manageEngineLoop?: boolean;
  onProgress?: (scenarioId: ScenarioId, completed: number, total: number) => void;
  onScenarioComplete?: (result: ScenarioResult) => void;
}

function nextAnimationFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export class PerformanceHarness {
  constructor(private readonly ctx: PerformanceContext) {}

  private advanceScenarioFrame(scenario: PerformanceScenario, frameIndex: number): void {
    const dt = this.ctx.engine.clock.fixedStep;
    const frame = this.ctx.engine.clock.step(dt);
    const simTime = frame.simulationTime;

    scenario.update(this.ctx, frameIndex, dt, simTime);
    this.ctx.abilityMgr.update(dt, simTime);
    this.ctx.terrain.update(simTime);
    this.ctx.indicatorMgr.update(dt);
    this.ctx.freehandCaster.update(simTime);
    this.ctx.sequenceRuntime.advance(dt);
    this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
  }

  private recordFrame(collector: MetricsCollector, scenario: PerformanceScenario, frameDurationMs: number): void {
    collector.recordSample(frameDurationMs, {
      activeParticles: this.ctx.abilityMgr.getTotalParticleCount(),
      activeSpells: this.ctx.abilityMgr.getActiveCount(),
      activeMutations: scenario.getActiveMutationCount?.(this.ctx) ?? this.ctx.terrain.mutationManager.getActiveCount(),
      visualDecals: scenario.getVisualDecalCount?.(this.ctx) ?? this.ctx.terrain.getDecalCount(),
    });
  }

  /** Executes one scenario with fixed simulation semantics and real rendered frame intervals. */
  public async runScenario(
    scenario: PerformanceScenario,
    options: HarnessRunOptions = {}
  ): Promise<ScenarioResult> {
    const config = scenario.config;
    const isSmoke = options.isSmoke ?? false;
    const warmupFrames = isSmoke && config.smokeOverride ? config.smokeOverride.warmupFrames : (config.warmupFrames ?? 30);
    const measuredFrames = isSmoke && config.smokeOverride ? config.smokeOverride.measuredFrames : (config.measuredFrames ?? 300);
    const manageEngineLoop = options.manageEngineLoop ?? true;

    if (manageEngineLoop) this.ctx.engine.stop();

    try {
      await scenario.setup(this.ctx);
      this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
      await nextAnimationFrame();

      const collector = new MetricsCollector(this.ctx.engine);
      collector.startWarmup();
      let frameIndex = 0;

      // Warm up all lazy GPU/program/resource paths before establishing leak baseline.
      let previousTimestamp = await nextAnimationFrame();
      for (let i = 0; i < warmupFrames; i++) {
        this.advanceScenarioFrame(scenario, frameIndex++);
        const currentTimestamp = await nextAnimationFrame();
        this.recordFrame(collector, scenario, currentTimestamp - previousTimestamp);
        previousTimestamp = currentTimestamp;
      }
      collector.endWarmup();

      const baselineGeometries = this.ctx.engine.renderer.info.memory.geometries;
      const baselineTextures = this.ctx.engine.renderer.info.memory.textures;

      // Start measurement on a fresh RAF boundary. Every sample is a complete
      // browser frame interval including simulation/update/render work and scheduling.
      previousTimestamp = await nextAnimationFrame();
      for (let i = 0; i < measuredFrames; i++) {
        this.advanceScenarioFrame(scenario, frameIndex++);
        const currentTimestamp = await nextAnimationFrame();
        this.recordFrame(collector, scenario, currentTimestamp - previousTimestamp);
        previousTimestamp = currentTimestamp;
      }

      await scenario.cleanup(this.ctx);
      this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
      await nextAnimationFrame();

      const postGeometries = this.ctx.engine.renderer.info.memory.geometries;
      const postTextures = this.ctx.engine.renderer.info.memory.textures;
      const leakedGeometries = Math.max(0, postGeometries - baselineGeometries);
      const leakedTextures = Math.max(0, postTextures - baselineTextures);

      console.log(
        `[ResourceCheck: ${config.id}] baseGeos=${baselineGeometries} -> postGeos=${postGeometries} (delta=${postGeometries - baselineGeometries}), baseTex=${baselineTextures} -> postTex=${postTextures} (delta=${postTextures - baselineTextures})`
      );

      const samples = collector.getSamples();
      const frameTimes = samples.map((s) => s.frameDurationMs);
      const drawCalls = samples.map((s) => s.drawCalls);
      const triangles = samples.map((s) => s.triangles);
      const memoryGeos = samples.map((s) => s.memoryGeometries);
      const memoryTexs = samples.map((s) => s.memoryTextures);

      const peakParticles = Math.max(0, ...samples.map((s) => s.activeParticles));
      const peakLights = Math.max(0, ...samples.map((s) => s.activeLights));
      const peakSpells = Math.max(0, ...samples.map((s) => s.activeSpells));
      const peakMutations = Math.max(0, ...samples.map((s) => s.activeMutations));
      const peakDecals = Math.max(0, ...samples.map((s) => s.visualDecals));
      const peakPool = samples.reduce(
        (acc, sample) => ({
          active: Math.max(acc.active, sample.activeLights),
          pooled: Math.max(acc.pooled, sample.pooledLights),
          total: Math.max(acc.total, sample.totalLights),
        }),
        { active: 0, pooled: 0, total: 0 }
      );

      const environment = MetricsCollector.captureEnvironment(this.ctx.engine.renderer);
      const result: ScenarioResult = {
        scenarioId: config.id,
        scenarioName: config.name,
        config,
        environment,
        samplesCount: samples.length,
        warmupCount: warmupFrames,
        frameTimeMs: MetricsCollector.calculateSummary(frameTimes),
        drawCalls: MetricsCollector.calculateSummary(drawCalls),
        triangles: MetricsCollector.calculateSummary(triangles),
        memoryGeometries: MetricsCollector.calculateSummary(memoryGeos),
        memoryTextures: MetricsCollector.calculateSummary(memoryTexs),
        peakParticles,
        peakLights,
        peakSpells,
        peakMutations,
        peakDecals,
        poolUsage: peakPool,
        leakedResources: { geometries: leakedGeometries, textures: leakedTextures, objects: 0 },
        timestamp: new Date().toISOString(),
        passed: samples.length === measuredFrames && leakedGeometries === 0 && leakedTextures === 0,
      };

      options.onScenarioComplete?.(result);
      return result;
    } finally {
      // Cleanup again is required to be idempotent; it protects a failed scenario
      // from contaminating later runs.
      try {
        await scenario.cleanup(this.ctx);
      } finally {
        if (manageEngineLoop) this.ctx.engine.start();
      }
    }
  }

  /** Executes the ten registered roadmap scenarios from one stopped engine loop. */
  public async runAll(options: HarnessRunOptions = {}): Promise<PerformanceReport> {
    const scenarios = globalPerformanceRegistry.getAll();
    const results: Record<string, ScenarioResult> = {};
    this.ctx.engine.stop();

    try {
      this.ctx.engine.postFX?.triggerShake?.(0.01);
      this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
      await nextAnimationFrame();

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        options.onProgress?.(scenario.config.id, i + 1, scenarios.length);
        const result = await this.runScenario(scenario, { ...options, manageEngineLoop: false });
        results[scenario.config.id] = result;
      }

      return {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        environment: MetricsCollector.captureEnvironment(this.ctx.engine.renderer),
        results: results as Record<ScenarioId, ScenarioResult>,
      };
    } finally {
      this.ctx.engine.start();
    }
  }
}
