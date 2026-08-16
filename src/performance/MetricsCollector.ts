/**
 * Metric sample collector and statistical calculator for benchmark scenarios.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { globalVfxPool } from '../core/VfxPool';
import {
  EnvironmentProfile,
  MetricsSample,
  MetricSummary,
} from './PerformanceTypes';

export class MetricsCollector {
  private samples: MetricsSample[] = [];
  private warmupSamples: MetricsSample[] = [];
  private isWarmingUp = true;

  constructor(private readonly engine: Engine) {}

  public startWarmup(): void {
    this.samples = [];
    this.warmupSamples = [];
    this.isWarmingUp = true;
  }

  public endWarmup(): void {
    this.isWarmingUp = false;
  }

  public recordSample(
    frameDurationMs: number,
    extra?: {
      activeMutations?: number;
      visualDecals?: number;
    }
  ): void {
    if (frameDurationMs <= 0 || !Number.isFinite(frameDurationMs)) return;

    const renderer = this.engine.renderer;
    const info = renderer.info;
    const poolStats = globalVfxPool.getStats();
    const liveMetrics = this.engine.getMetrics();

    const sample: MetricsSample = {
      frameDurationMs: parseFloat(frameDurationMs.toFixed(3)),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      lines: info.render.lines,
      points: info.render.points,
      memoryGeometries: info.memory.geometries,
      memoryTextures: info.memory.textures,
      activeParticles: liveMetrics.particlesCount,
      activeLights: poolStats.activeLights,
      activeSpells: liveMetrics.activeSpells,
      activeMutations: extra?.activeMutations ?? 0,
      visualDecals: extra?.visualDecals ?? liveMetrics.decalsCount,
      pooledLights: poolStats.pooledLights,
      totalLights: poolStats.totalLights,
    };

    if (this.isWarmingUp) {
      this.warmupSamples.push(sample);
    } else {
      this.samples.push(sample);
    }
  }

  public getSamples(): MetricsSample[] {
    return [...this.samples];
  }

  public getWarmupSamples(): MetricsSample[] {
    return [...this.warmupSamples];
  }

  public static calculateSummary(values: number[]): MetricSummary {
    if (values.length === 0) {
      return { p50: 0, p95: 0, p99: 0, mean: 0, min: 0, max: 0, fps: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;

    const percentile = (p: number): number => {
      const idx = Math.min(count - 1, Math.max(0, Math.floor((count - 1) * p)));
      return sorted[idx];
    };

    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;
    const p50 = percentile(0.5);
    const p95 = percentile(0.95);
    const p99 = percentile(0.99);
    const min = sorted[0];
    const max = sorted[count - 1];
    const fps = p50 > 0 ? Math.round(1000 / p50) : 0;

    return {
      p50: parseFloat(p50.toFixed(2)),
      p95: parseFloat(p95.toFixed(2)),
      p99: parseFloat(p99.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      fps,
    };
  }

  public static captureEnvironment(renderer?: THREE.WebGLRenderer): EnvironmentProfile {
    let webglRenderer = 'Unknown WebGL';
    let webglVendor = 'Unknown Vendor';

    if (renderer) {
      const gl = renderer.getContext();
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown Vendor';
          webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown Renderer';
        } else {
          webglVendor = gl.getParameter(gl.VENDOR) || 'Unknown Vendor';
          webglRenderer = gl.getParameter(gl.RENDERER) || 'Unknown Renderer';
        }
      }
    }

    const nav = typeof navigator !== 'undefined' ? navigator : { userAgent: 'node', platform: 'node' };
    const win = typeof window !== 'undefined' ? window : { innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 1 };
    const doc = typeof document !== 'undefined' ? document : { visibilityState: 'visible' };

    return {
      os: nav.platform || 'Unknown OS',
      platform: nav.platform || 'Unknown Platform',
      userAgent: nav.userAgent || 'Unknown UserAgent',
      webglRenderer: String(webglRenderer),
      webglVendor: String(webglVendor),
      viewportWidth: win.innerWidth || 1920,
      viewportHeight: win.innerHeight || 1080,
      devicePixelRatio: win.devicePixelRatio || 1,
      threeVersion: `r${THREE.REVISION}`,
      buildCommit: '628aa30',
      buildVersion: '2.4.0',
      visibilityState: doc.visibilityState || 'visible',
    };
  }
}
