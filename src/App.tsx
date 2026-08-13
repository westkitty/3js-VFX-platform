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

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subsystem Refs
  const engineRef = useRef<Engine | null>(null);
  const terrainRef = useRef<TerrainManager | null>(null);
  const abilityMgrRef = useRef<AbilityManager | null>(null);
  const freehandCasterRef = useRef<FreehandCaster | null>(null);
  const indicatorMgrRef = useRef<SurfaceIndicatorManager | null>(null);

  // UI State
  const [currentMode, setCurrentMode] = useState<WorkbenchMode>('vfx_lab');
  const [selectedAbility, setSelectedAbility] = useState<AbilityDefinition>(
    globalAbilityRegistry.getAll()[0]
  );
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSpellbookOpen, setIsSpellbookOpen] = useState<boolean>(false);
  const [activeSpellsCount, setActiveSpellsCount] = useState<number>(0);
  const [previewState, setPreviewState] = useState<AbilityPreviewState>({
    hasPreview: false,
    time: 0,
    duration: 0,
    phase: 'done',
  });

  // Terraformer State
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

  // Initialize 3D Engine & Managers
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Engine
    const engine = new Engine(containerRef.current);
    engineRef.current = engine;

    // 2. Terrain
    const terrain = new TerrainManager(engine.scene);
    terrainRef.current = terrain;
    engine.surfaceQuery.setPlayableMeshes([terrain.getMesh()]);

    // 3. Ability Manager
    const abilityMgr = new AbilityManager(engine.scene, terrain, engine.postFX);
    abilityMgrRef.current = abilityMgr;

    // 4. Freehand drawing
    const freehandCaster = new FreehandCaster(engine.scene, engine.surfaceQuery);
    freehandCasterRef.current = freehandCaster;

    const indicatorMgr = new SurfaceIndicatorManager(engine.scene, engine.surfaceQuery);
    indicatorMgrRef.current = indicatorMgr;

    // Register Render Loop Callback. Keep high-frequency runtime state outside React;
    // only sample preview UI state at a modest cadence.
    let previewUiElapsed = 0;
    engine.registerUpdateCallback((dt, time) => {
      terrain.update(time);
      abilityMgr.update(dt, time);
      freehandCaster.update(time);
      indicatorMgr.update(dt);

      // Update Engine Performance Metrics Counters
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

    return () => {
      abilityMgr.clearAll();
      freehandCaster.clear();
      indicatorMgr.clear();
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
    if (!freehandCasterRef.current.getIsDrawing()) {
      freehandCasterRef.current.startDrawing(hit);
    } else {
      freehandCasterRef.current.addPoint(hit);
    }
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
    if (terrainRef.current) {
      terrainRef.current.setShowGrid(next);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      {/* Top Navigation */}
      <TopNavbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenSpellbook={() => setIsSpellbookOpen(true)}
        activeSpellCount={activeSpellsCount}
      />

      {/* Main Viewport & HUD Layout */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* 3D WebGL Canvas Viewport */}
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

        {/* Right Mode-Specific Inspector Sidebar */}
        {currentMode === 'vfx_lab' && (
          <VfxLabPanel
            engine={engineRef.current}
            selectedAbility={selectedAbility}
            previewState={previewState}
            onUpdateAbilityParams={handleSelectAbility}
            onTriggerCast={() => {
              if (engineRef.current) {
                const hit = engineRef.current.surfaceQuery.projectPoint(new THREE.Vector3(0, 0, 0));
                if (hit) handleCastPreview(hit);
              }
            }}
            onSeekPreview={handleSeekPreview}
            onRestartPreview={handleRestartPreview}
          />
        )}

        {currentMode === 'ability_factory' && (
          <PresetBuilderPanel onSelectAbility={handleSelectAbility} />
        )}

        {currentMode === 'macro_lab' && (
          <SequenceLabPanel />
        )}

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

      {/* Spellbook & Presets Modal */}
      <PresetsModal
        isOpen={isSpellbookOpen}
        onClose={() => setIsSpellbookOpen(false)}
        onSelectAbility={handleSelectAbility}
      />
    </div>
  );
}
