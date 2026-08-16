/**
 * Performance Lab workbench panel.
 *
 * Exposes live renderer metrics, scenario runner controls, and benchmark results.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gauge, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Engine } from '../core/Engine';
import { TerrainManager } from '../terrain/TerrainManager';
import { AbilityManager } from '../abilities/AbilityRuntime';
import { FreehandCaster } from '../drawing/FreehandCaster';
import { SurfaceIndicatorManager } from '../indicators/SurfaceIndicatorManager';
import { SequenceRuntime } from '../sequence/SequenceRuntime';
import { AbilitySequenceEmitter } from '../sequence/AbilitySequenceEmitter';
import {
  globalPerformanceRegistry,
  PerformanceHarness,
  ScenarioId,
  ScenarioResult,
  MetricsCollector,
} from '../performance';

export interface PerformancePanelProps {
  engine: Engine | null;
  terrain?: TerrainManager | null;
  abilityMgr?: AbilityManager | null;
  freehandCaster?: FreehandCaster | null;
  indicatorMgr?: SurfaceIndicatorManager | null;
  sequenceRuntime?: SequenceRuntime | null;
  sequenceEmitter?: AbilitySequenceEmitter | null;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({
  engine,
  terrain,
  abilityMgr,
  freehandCaster,
  indicatorMgr,
  sequenceRuntime,
  sequenceEmitter,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('idle_baseline');
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<string>('Ready');
  const [lastResult, setLastResult] = useState<ScenarioResult | null>(null);

  const scenarios = globalPerformanceRegistry.getAll();
  const liveMetrics = engine?.getMetrics();
  const env = MetricsCollector.captureEnvironment(engine?.renderer);

  const handleRunScenario = async () => {
    if (!engine || !terrain || !abilityMgr || !freehandCaster || !indicatorMgr || !sequenceRuntime || !sequenceEmitter) {
      setCurrentProgress('Cannot run: runtime context missing');
      return;
    }

    const scenario = globalPerformanceRegistry.get(selectedScenarioId);
    if (!scenario) return;

    setIsRunning(true);
    setCurrentProgress(`Running ${scenario.config.name}...`);

    try {
      const harness = new PerformanceHarness({
        engine,
        terrain,
        abilityMgr,
        freehandCaster,
        indicatorMgr,
        sequenceRuntime,
        sequenceEmitter,
      });

      const result = await harness.runScenario(scenario, { isSmoke: false });
      setLastResult(result);
      setCurrentProgress(`Completed ${scenario.config.name}`);
    } catch (err: any) {
      setCurrentProgress(`Error: ${err?.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      data-testid="performance-panel"
      className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 overflow-y-auto"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold">Performance Lab</h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">
          Build {env.buildCommit}
        </span>
      </div>

      {/* Live Metrics Summary */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
        <h3 className="text-[11px] font-mono text-cyan-300">LIVE RENDERER METRICS</h3>
        {liveMetrics ? (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>FPS: <span className="text-emerald-400">{liveMetrics.fps}</span></div>
            <div>p50: <span className="text-slate-200">{liveMetrics.p50FrameMs}ms</span></div>
            <div>p95: <span className="text-slate-200">{liveMetrics.p95FrameMs}ms</span></div>
            <div>p99: <span className="text-slate-200">{liveMetrics.p99FrameMs}ms</span></div>
            <div>Calls: <span className="text-slate-200">{liveMetrics.drawCalls}</span></div>
            <div>Triangles: <span className="text-slate-200">{liveMetrics.triangles}</span></div>
            <div>Particles: <span className="text-slate-200">{liveMetrics.particlesCount}</span></div>
            <div>Lights: <span className="text-slate-200">{liveMetrics.activeLights}</span></div>
            <div>Spells: <span className="text-slate-200">{liveMetrics.activeSpells}</span></div>
            <div>Decals: <span className="text-slate-200">{liveMetrics.decalsCount}</span></div>
            <div>Geos: <span className="text-slate-200">{liveMetrics.memoryGeometries}</span></div>
            <div>Textures: <span className="text-slate-200">{liveMetrics.memoryTextures}</span></div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Live metrics unavailable</div>
        )}
      </div>

      {/* Scenario Runner */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-3">
        <h3 className="text-[11px] font-mono text-cyan-300">BENCHMARK SCENARIO</h3>
        <select
          data-testid="scenario-select"
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value as ScenarioId)}
          disabled={isRunning}
          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
        >
          {scenarios.map((s) => (
            <option key={s.config.id} value={s.config.id}>
              {s.config.name}
            </option>
          ))}
        </select>

        <button
          data-testid="run-scenario-btn"
          onClick={handleRunScenario}
          disabled={isRunning}
          className="flex items-center justify-center gap-1.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isRunning ? 'Benchmarking...' : 'Run Scenario'}</span>
        </button>

        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Status:</span>
          <span className="text-slate-200 truncate">{currentProgress}</span>
        </div>
      </div>

      {/* Benchmark Result Card */}
      {lastResult && (
        <div data-testid="benchmark-result" className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-semibold text-cyan-300">{lastResult.scenarioName}</span>
            <span className={`flex items-center gap-1 text-[11px] font-mono ${lastResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {lastResult.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {lastResult.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <div>Samples: <span className="text-slate-200">{lastResult.samplesCount}</span></div>
            <div>FPS: <span className="text-emerald-400">{lastResult.frameTimeMs.fps}</span></div>
            <div>p50 Frame: <span className="text-slate-200">{lastResult.frameTimeMs.p50}ms</span></div>
            <div>p95 Frame: <span className="text-slate-200">{lastResult.frameTimeMs.p95}ms</span></div>
            <div>p99 Frame: <span className="text-slate-200">{lastResult.frameTimeMs.p99}ms</span></div>
            <div>Calls (avg): <span className="text-slate-200">{lastResult.drawCalls.mean}</span></div>
            <div>Triangles: <span className="text-slate-200">{lastResult.triangles.mean}</span></div>
            <div>Geos: <span className="text-slate-200">{lastResult.memoryGeometries.mean}</span></div>
            <div>Textures: <span className="text-slate-200">{lastResult.memoryTextures.mean}</span></div>
            <div>Peak Particles: <span className="text-slate-200">{lastResult.peakParticles}</span></div>
            <div>Peak Lights: <span className="text-slate-200">{lastResult.peakLights}</span></div>
            <div>Peak Decals: <span className="text-slate-200">{lastResult.peakDecals}</span></div>
          </div>

          {(lastResult.leakedResources.geometries > 0 || lastResult.leakedResources.textures > 0) && (
            <div className="rounded bg-red-950/40 border border-red-900/60 p-1.5 text-[10px] font-mono text-red-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Resource Leak Detected!</span>
            </div>
          )}
        </div>
      )}

      {/* Environment Profile */}
      <div className="mt-auto pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex flex-col gap-0.5">
        <div>Platform: {env.platform}</div>
        <div>Renderer: {env.webglRenderer.slice(0, 32)}</div>
        <div>Three.js: {env.threeVersion} | DPR: {env.devicePixelRatio}</div>
      </div>
    </div>
  );
};
