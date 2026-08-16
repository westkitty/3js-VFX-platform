/**
 * Benchmark runner and execution harness for deterministic performance scenarios.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { MetricsCollector } from './MetricsCollector';
import { PerformanceContext, PerformanceScenario } from './PerformanceScenario';
import { globalPerformanceRegistry } from './PerformanceScenarioRegistry';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';
import {
  PerformanceReport,
  ScenarioId,
  ScenarioResult,
} from './PerformanceTypes';

export interface HarnessRunOptions {
  isSmoke?: boolean;
  onProgress?: (scenarioId: ScenarioId, completed: number, total: number) => void;
  onScenarioComplete?: (result: ScenarioResult) => void;
}

export class PerformanceHarness {
  constructor(private readonly ctx: PerformanceContext) {}

  /**
   * Executes a single performance scenario through real animation frames.
   */
  public async runScenario(
    scenario: PerformanceScenario,
    options: HarnessRunOptions = {}
  ): Promise<ScenarioResult> {
    const config = scenario.config;
    const isSmoke = options.isSmoke ?? false;
    const warmupFrames = isSmoke && config.smokeOverride ? config.smokeOverride.warmupFrames : (config.warmupFrames ?? 30);
    const measuredFrames = isSmoke && config.smokeOverride ? config.smokeOverride.measuredFrames : (config.measuredFrames ?? 300);

    // Setup scenario
    await scenario.setup(this.ctx);
    this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Snapshot pre-run baseline resource counts to check for leaks
    const preGeometries = this.ctx.engine.renderer.info.memory.geometries;
    const preTextures = this.ctx.engine.renderer.info.memory.textures;

    const collector = new MetricsCollector(this.ctx.engine);
    collector.startWarmup();

    let frameIndex = 0;
    let lastTime = performance.now();

    // Warm-up phase
    for (let i = 0; i < warmupFrames; i++) {
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastTime) / 1000);
      lastTime = now;

      this.ctx.engine.clock.step(dt);
      const simTime = this.ctx.engine.simulationTime;
      scenario.update(this.ctx, frameIndex, dt, simTime);
      this.ctx.abilityMgr.update(dt, simTime);
      this.ctx.terrain.update(simTime);
      this.ctx.indicatorMgr.update(dt);
      this.ctx.freehandCaster.update(simTime);
      this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);

      const frameDuration = performance.now() - now;
      collector.recordSample(frameDuration, {
        activeMutations: scenario.getActiveMutationCount?.(this.ctx),
        visualDecals: scenario.getVisualDecalCount?.(this.ctx),
      });

      frameIndex++;
      // Yield to browser execution frame
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    collector.endWarmup();

    // Snapshot pre-run baseline resource counts after warm-up phase (all lazy WebGL buffers/textures warm)
    const baselineGeometries = this.ctx.engine.renderer.info.memory.geometries;
    const baselineTextures = this.ctx.engine.renderer.info.memory.textures;

    // Measurement phase
    for (let i = 0; i < measuredFrames; i++) {
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastTime) / 1000);
      lastTime = now;

      this.ctx.engine.clock.step(dt);
      const simTime = this.ctx.engine.simulationTime;
      scenario.update(this.ctx, frameIndex, dt, simTime);
      this.ctx.abilityMgr.update(dt, simTime);
      this.ctx.terrain.update(simTime);
      this.ctx.indicatorMgr.update(dt);
      this.ctx.freehandCaster.update(simTime);
      this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);

      const frameDuration = performance.now() - now;
      collector.recordSample(frameDuration, {
        activeMutations: scenario.getActiveMutationCount?.(this.ctx),
        visualDecals: scenario.getVisualDecalCount?.(this.ctx),
      });

      frameIndex++;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    // Cleanup scenario
    await scenario.cleanup(this.ctx);

    // Symmetrical render flush to ensure WebGL renderer memory info counters reflect disposals
    this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
    await new Promise((resolve) => requestAnimationFrame(resolve));

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

    const lastSample = samples[samples.length - 1];
    const poolUsage = {
      active: lastSample?.activeLights ?? 0,
      pooled: lastSample?.pooledLights ?? 0,
      total: lastSample?.totalLights ?? 0,
    };

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
      poolUsage,
      leakedResources: { geometries: leakedGeometries, textures: leakedTextures, objects: 0 },
      timestamp: new Date().toISOString(),
      passed: leakedGeometries === 0 && leakedTextures === 0,
    };

    options.onScenarioComplete?.(result);
    return result;
  }

  /**
   * Executes the full matrix of all 10 registered performance scenarios.
   */
  public async runAll(options: HarnessRunOptions = {}): Promise<PerformanceReport> {
    const scenarios = globalPerformanceRegistry.getAll();
    const results: Record<string, ScenarioResult> = {};
    const environment = MetricsCollector.captureEnvironment(this.ctx.engine.renderer);

    // Global harness pre-warm
    this.ctx.engine.postFX?.triggerShake?.(0.01);
    this.ctx.engine.renderer.render(this.ctx.engine.scene, this.ctx.engine.camera);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      options.onProgress?.(scenario.config.id, i + 1, scenarios.length);
      const res = await this.runScenario(scenario, options);
      results[scenario.config.id] = res;
    }

    return {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      environment,
      results: results as Record<ScenarioId, ScenarioResult>,
    };
  }
}
