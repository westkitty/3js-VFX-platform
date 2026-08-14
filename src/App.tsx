/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Engine } from './core/Engine';
import { TerrainManager } from './terrain/TerrainManager';
import { AbilityManager, type AbilityPreviewState } from './abilities/AbilityRuntime';
import { FreehandCaster } from './drawing/FreehandCaster';
import { SurfaceIndicatorManager, type SurfaceIndicatorConfig } from './indicators/SurfaceIndicatorManager';
import { SurfaceValidationFixture } from './validation/SurfaceValidationFixture';
import { runSurfaceRuntimeValidation, type SurfaceRuntimeValidationReport } from './validation/SurfaceRuntimeValidator';
import { globalAbilityRegistry } from './abilities/AbilityRegistry';
import { SurfaceHit, AbilityDefinition, WorkbenchMode, SurfaceMutationType } from './types';

import { TopNavbar } from './components/TopNavbar';
import { SceneViewport } from './components/SceneViewport';
import { VfxLabPanel } from './components/VfxLabPanel';
import { PresetBuilderPanel } from './components/PresetBuilderPanel';
import { SequenceLabPanel } from './components/SequenceLabPanel';
import { SurfaceLabPanel } from './components/SurfaceLabPanel';
import { IndicatorLabPanel } from './components/IndicatorLabPanel';
import { FreehandPanel } from './components/FreehandPanel';
import { PerformancePanel } from './components/PerformancePanel';
import { PresetsModal } from './components/PresetsModal';

import * as THREE from 'three';

type SurfaceValidationWindow = Window & {
  __AETHERVFX_SURFACE_VALIDATION__?: SurfaceRuntimeValidationReport;
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<Engine | null>(null);
  const terrainRef = useRef<TerrainManager | null>(null);
  const abilityMgrRef = useRef<AbilityManager | null>(null);
  const freehandCasterRef = useRef<FreehandCaster | null>(null);
  const indicatorMgrRef = useRef<SurfaceIndicatorManager | null>(null);

  const [currentMode, setCurrentMode] = useState<WorkbenchMode>('vfx_lab');
  const [selectedAbility, setSelectedAbility] = useState<AbilityDefinition>(globalAbilityRegistry.getAll()[0]);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSpellbookOpen, setIsSpellbookOpen] = useState<boolean>(false);
  const [activeSpellsCount, setActiveSpellsCount] = useState<number>(0);
  const [previewState, setPreviewState] = useState<AbilityPreviewState>({ hasPreview: false, time: 0, duration: 0, phase: 'done' });
  const [surfaceValidationReport, setSurfaceValidationReport] = useState<SurfaceRuntimeValidationReport | null>(null);

  const [terraformTool, setTerraformTool] = useState<'sculpt' | 'mutate'>('mutate');
  const [sculptMode, setSculptMode] = useState<'elevate' | 'depress'>('elevate');
  const [mutationType, setMutationType] = useState<SurfaceMutationType>('scorch');
  const [brushRadius, setBrushRadius] = useState<number>(6);
  const [indicatorConfig, setIndicatorConfig] = useState<SurfaceIndicatorConfig>({
    shape: 'line',
    direction: new THREE.Vector3(0, 0, 1),
    range: 10,
    radius: 5,
    angle: Math.PI / 3,
    width: 2,
    warningDuration: 0.8,
    commitDuration: 0.35,
  });
  const [activeIndicatorCount, setActiveIndicatorCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Engine(containerRef.current);
    engineRef.current = engine;

    const terrain = new TerrainManager(engine.scene);
    terrainRef.current = terrain;

    const search = new URLSearchParams(window.location.search);
    const surfaceAutoTestEnabled = search.get('surfaceAutoTest') === '1';
    const fixtureEnabled = search.get('surfaceFixture') === '1' || surfaceAutoTestEnabled;
    const validationFixture = fixtureEnabled ? new SurfaceValidationFixture(engine.scene) : null;
    engine.surfaceQuery.setPlayableMeshes([
      terrain.getMesh(),
      ...(validationFixture?.getPlayableMeshes() ?? []),
    ]);

    const abilityMgr = new AbilityManager(engine.scene, terrain, engine.postFX);
    abilityMgrRef.current = abilityMgr;

    const freehandCaster = new FreehandCaster(engine.scene, engine.surfaceQuery);
    freehandCasterRef.current = freehandCaster;

    const indicatorMgr = new SurfaceIndicatorManager(engine.scene, engine.surfaceQuery);
    indicatorMgrRef.current = indicatorMgr;

    let previewUiElapsed = 0;
    engine.registerUpdateCallback((dt, time) => {
      terrain.update(time);
      abilityMgr.update(dt, time);
      freehandCaster.update(time);
      indicatorMgr.update(dt);

      engine.updateMetricCounters(
        abilityMgr.getTotalParticleCount(),
        terrain.getDecalCount(),
        abilityMgr.getActiveCount()
      );

      previewUiElapsed += dt;
      if (previewUiElapsed >= 0.05) {
        previewUiElapsed = 0;
        setActiveSpellsCount(abilityMgr.getActiveCount());
        setPreviewState(abilityMgr.getPreviewState());
        setActiveIndicatorCount(indicatorMgr.getActiveCount());
      }
    });

    engine.start();

    // Opt-in runtime validation. It runs after the engine's first scheduled render
    // so renderer.info starts from the normal scene, and it never runs on the
    // default user route.
    const validationFrameId = surfaceAutoTestEnabled && validationFixture
      ? requestAnimationFrame(() => {
          const report = runSurfaceRuntimeValidation(engine, validationFixture, indicatorMgr, freehandCaster);
          setSurfaceValidationReport(report);
          (window as SurfaceValidationWindow).__AETHERVFX_SURFACE_VALIDATION__ = report;
          if (report.passed) console.info('[AetherVFX surface validation] PASS', report);
          else console.error('[AetherVFX surface validation] FAIL', report);
        })
      : null;

    return () => {
      if (validationFrameId !== null) cancelAnimationFrame(validationFrameId);
      if (surfaceAutoTestEnabled) delete (window as SurfaceValidationWindow).__AETHERVFX_SURFACE_VALIDATION__;
      abilityMgr.clearAll();
      freehandCaster.clear();
      indicatorMgr.clear();
      validationFixture?.destroy();
      terrain.destroy();
      engine.destroy();
    };
  }, []);

  const handleSelectAbility = (ability: AbilityDefinition) => {
    setSelectedAbility(ability);
    const manager = abilityMgrRef.current;
    if (manager?.getPreviewState().hasPreview) {
      manager.updatePreviewDefinition(ability);
      setPreviewState(manager.getPreviewState());
    }
  };

  const handleCastPreview = (hit: SurfaceHit) => {
    const manager = abilityMgrRef.current;
    if (!manager) return;

    const origin = new THREE.Vector3(0, 1, 0);
    const target = hit.point.clone();
    const direction = target.clone().sub(origin).normalize();

    manager.castPreview(
      {
        abilityId: selectedAbility.id,
        origin,
        target,
        direction,
        distance: origin.distanceTo(target),
        surface: hit,
        seed: 0xA37E,
      },
      selectedAbility
    );
    setPreviewState(manager.getPreviewState());
  };

  const handleSeekPreview = (seconds: number) => {
    const manager = abilityMgrRef.current;
    if (!manager) return;
    setPreviewState(manager.seekPreview(seconds));
  };

  const handleRestartPreview = () => {
    const manager = abilityMgrRef.current;
    if (!manager) return;
    setPreviewState(manager.restartPreview());
  };

  const handleCastSpell = (hit: SurfaceHit) => {
    if (currentMode === 'telegraphs') {
      const origin = new THREE.Vector3(0, 1, 0);
      const direction = hit.point.clone().sub(origin);
      if (direction.lengthSq() < 1e-8) direction.set(0, 0, 1);
      indicatorMgrRef.current?.show(hit, {
        ...indicatorConfig,
        direction: direction.normalize(),
      });
      return;
    }

    if (currentMode === 'terraformer') {
      if (!terrainRef.current) return;
      if (terraformTool === 'sculpt') {
        const str = sculptMode === 'elevate' ? 0.8 : -0.8;
        terrainRef.current.sculptTerrain(hit.point, brushRadius, str);
      } else {
        terrainRef.current.applyMutation(mutationType, hit.point, brushRadius);
      }
      return;
    }

    if (!abilityMgrRef.current) return;

    const origin = new THREE.Vector3(0, 1, 0);
    const target = hit.point.clone();
    const dir = target.clone().sub(origin).normalize();
    const dist = origin.distanceTo(target);

    abilityMgrRef.current.cast(
      {
        abilityId: selectedAbility.id,
        origin,
        target,
        direction: dir,
        distance: dist,
        surface: hit,
        seed: Math.random(),
      },
      selectedAbility
    );
  };

  const handleDrawPoint = (hit: SurfaceHit) => {
    if (!freehandCasterRef.current) return;
    if (!freehandCasterRef.current.getIsDrawing()) freehandCasterRef.current.startDrawing(hit);
    else freehandCasterRef.current.addPoint(hit);
  };

  const handleDrawFinish = () => {
    if (!freehandCasterRef.current || !abilityMgrRef.current) return;
    const path = freehandCasterRef.current.finishDrawing();
    if (path && path.length >= 2) {
      const origin = path[0];
      const target = path[path.length - 1];

      abilityMgrRef.current.cast(
        {
          abilityId: selectedAbility.id,
          origin,
          target,
          direction: target.clone().sub(origin).normalize(),
          distance: origin.distanceTo(target),
          surface: null,
          path,
          seed: Math.random(),
        },
        selectedAbility
      );
    }
  };

  const handleToggleGrid = () => {
    const next = !showGrid;
    setShowGrid(next);
    terrainRef.current?.setShowGrid(next);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      <TopNavbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenSpellbook={() => setIsSpellbookOpen(true)}
        activeSpellCount={activeSpellsCount}
      />

      <div className="flex-1 relative flex overflow-hidden">
        <div ref={containerRef} className="flex-1 h-full relative">
          <SceneViewport
            engine={engineRef.current}
            currentMode={currentMode}
            selectedAbility={selectedAbility}
            onSelectAbility={handleSelectAbility}
            onActivateAbility={handleCastSpell}
            onDrawPoint={handleDrawPoint}
            onDrawFinish={handleDrawFinish}
            showGrid={showGrid}
            onToggleGrid={handleToggleGrid}
          />
        </div>

        {currentMode === 'vfx_lab' && (
          <VfxLabPanel
            engine={engineRef.current}
            selectedAbility={selectedAbility}
            previewState={previewState}
            onUpdateAbilityParams={handleSelectAbility}
            onTriggerCast={() => {
              const hit = engineRef.current?.surfaceQuery.projectPoint(new THREE.Vector3(0, 0, 0));
              if (hit) handleCastPreview(hit);
            }}
            onSeekPreview={handleSeekPreview}
            onRestartPreview={handleRestartPreview}
          />
        )}

        {currentMode === 'ability_factory' && <PresetBuilderPanel onSelectAbility={handleSelectAbility} />}
        {currentMode === 'macro_lab' && <SequenceLabPanel />}
        {currentMode === 'terraformer' && (
          <SurfaceLabPanel
            activeTool={terraformTool}
            onChangeTool={setTerraformTool}
            sculptMode={sculptMode}
            onChangeSculptMode={setSculptMode}
            mutationType={mutationType}
            onChangeMutationType={setMutationType}
            brushRadius={brushRadius}
            onChangeRadius={setBrushRadius}
            onUndo={() => terrainRef.current?.undo()}
            onReset={() => terrainRef.current?.resetTerrain()}
          />
        )}
        {currentMode === 'telegraphs' && (
          <IndicatorLabPanel
            config={indicatorConfig}
            onChange={setIndicatorConfig}
            onClear={() => {
              indicatorMgrRef.current?.clear();
              setActiveIndicatorCount(0);
            }}
            activeCount={activeIndicatorCount}
          />
        )}
        {currentMode === 'freehand_drawing' && <FreehandPanel />}
        {currentMode === 'perf_lab' && <PerformancePanel engine={engineRef.current} />}
      </div>

      {surfaceValidationReport && (
        <div
          data-aethervfx-surface-validation={surfaceValidationReport.passed ? 'pass' : 'fail'}
          className="pointer-events-none fixed bottom-3 left-3 z-50 w-[min(34rem,calc(100vw-1.5rem))] max-h-[45vh] overflow-hidden rounded-lg border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-2xl backdrop-blur"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <strong className={surfaceValidationReport.passed ? 'text-emerald-300' : 'text-red-300'}>
              Surface runtime validation: {surfaceValidationReport.passed ? 'PASS' : 'FAIL'}
            </strong>
            <span className="font-mono text-[10px] text-slate-500">
              {surfaceValidationReport.checks.filter((check) => check.passed).length}/{surfaceValidationReport.checks.length}
            </span>
          </div>
          <div className="max-h-[35vh] space-y-1 overflow-y-auto font-mono text-[10px]">
            {surfaceValidationReport.checks.map((check) => (
              <div key={check.id} className={check.passed ? 'text-slate-300' : 'text-red-300'}>
                {check.passed ? 'PASS' : 'FAIL'} · {check.label} · {check.detail}
              </div>
            ))}
          </div>
        </div>
      )}

      <PresetsModal
        isOpen={isSpellbookOpen}
        onClose={() => setIsSpellbookOpen(false)}
        onSelectAbility={handleSelectAbility}
      />
    </div>
  );
}
