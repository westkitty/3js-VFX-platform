/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Engine } from './core/Engine';
import { TerrainManager } from './terrain/TerrainManager';
import { AbilityManager, type AbilityPreviewState } from './abilities/AbilityRuntime';
import { FreehandCaster } from './drawing/FreehandCaster';
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
  const engineRef = useRef<Engine | null>(null);
  const terrainRef = useRef<TerrainManager | null>(null);
  const abilityMgrRef = useRef<AbilityManager | null>(null);
  const freehandCasterRef = useRef<FreehandCaster | null>(null);

  const [currentMode, setCurrentMode] = useState<WorkbenchMode>('vfx_lab');
  const [selectedAbility, setSelectedAbility] = useState<AbilityDefinition>(globalAbilityRegistry.getAll()[0]);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSpellbookOpen, setIsSpellbookOpen] = useState<boolean>(false);
  const [activeSpellsCount, setActiveSpellsCount] = useState<number>(0);
  const [previewState, setPreviewState] = useState<AbilityPreviewState>({ hasPreview: false, time: 0, duration: 0, phase: 'done' });
  const [terraformTool, setTerraformTool] = useState<'sculpt' | 'mutate'>('mutate');
  const [sculptMode, setSculptMode] = useState<'elevate' | 'depress'>('elevate');
  const [mutationType, setMutationType] = useState<SurfaceMutationType>('scorch');
  const [brushRadius, setBrushRadius] = useState<number>(6);

  useEffect(() => {
    if (!containerRef.current) return;
    const engine = new Engine(containerRef.current);
    const terrain = new TerrainManager(engine.scene);
    const abilityMgr = new AbilityManager(engine.scene, terrain, engine.postFX);
    const freehandCaster = new FreehandCaster(engine.scene);
    engineRef.current = engine;
    terrainRef.current = terrain;
    abilityMgrRef.current = abilityMgr;
    freehandCasterRef.current = freehandCaster;
    engine.surfaceQuery.setPlayableMeshes([terrain.getMesh()]);

    let previewUiElapsed = 0;
    engine.registerUpdateCallback((dt, time) => {
      terrain.update(time);
      abilityMgr.update(dt, time);
      freehandCaster.update(time);
      engine.updateMetricCounters(abilityMgr.getTotalParticleCount(), terrain.getDecalCount(), abilityMgr.getActiveCount());
      previewUiElapsed += dt;
      if (previewUiElapsed >= 0.05) {
        previewUiElapsed = 0;
        setActiveSpellsCount(abilityMgr.getActiveCount());
        setPreviewState(abilityMgr.getPreviewState());
      }
    });
    engine.start();

    return () => {
      abilityMgr.clearAll();
      freehandCaster.clear();
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
    manager.castPreview({ abilityId: selectedAbility.id, origin, target, direction: target.clone().sub(origin).normalize(), distance: origin.distanceTo(target), surface: hit, seed: 0xA37E }, selectedAbility);
    setPreviewState(manager.getPreviewState());
  };

  const handleCastSpell = (hit: SurfaceHit) => {
    if (currentMode === 'terraformer') {
      const terrain = terrainRef.current;
      if (!terrain) return;
      if (terraformTool === 'sculpt') terrain.sculptTerrain(hit.point, brushRadius, sculptMode === 'elevate' ? 0.8 : -0.8);
      else terrain.applyMutation(mutationType, hit.point, brushRadius);
      return;
    }
    const manager = abilityMgrRef.current;
    if (!manager) return;
    const origin = new THREE.Vector3(0, 1, 0);
    const target = hit.point.clone();
    manager.cast({ abilityId: selectedAbility.id, origin, target, direction: target.clone().sub(origin).normalize(), distance: origin.distanceTo(target), surface: hit, seed: Math.random() }, selectedAbility);
  };

  const handleDrawPoint = (hit: SurfaceHit) => {
    const drawing = freehandCasterRef.current;
    if (!drawing) return;
    if (!drawing.getIsDrawing()) drawing.startDrawing(hit); else drawing.addPoint(hit);
  };

  const handleDrawFinish = () => {
    const drawing = freehandCasterRef.current;
    const manager = abilityMgrRef.current;
    if (!drawing || !manager) return;
    const path = drawing.finishDrawing();
    if (!path || path.length < 2) return;
    const origin = path[0];
    const target = path[path.length - 1];
    manager.cast({ abilityId: selectedAbility.id, origin, target, direction: target.clone().sub(origin).normalize(), distance: origin.distanceTo(target), surface: null, path, seed: Math.random() }, selectedAbility);
  };

  const handleToggleGrid = () => {
    const next = !showGrid;
    setShowGrid(next);
    terrainRef.current?.setShowGrid(next);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      <TopNavbar currentMode={currentMode} onSelectMode={setCurrentMode} onOpenSpellbook={() => setIsSpellbookOpen(true)} activeSpellCount={activeSpellsCount} />
      <div className="flex-1 relative flex overflow-hidden">
        <div ref={containerRef} className="flex-1 h-full relative">
          <SceneViewport engine={engineRef.current} currentMode={currentMode} selectedAbility={selectedAbility} onSelectAbility={handleSelectAbility} onActivateAbility={handleCastSpell} onDrawPoint={handleDrawPoint} onDrawFinish={handleDrawFinish} showGrid={showGrid} onToggleGrid={handleToggleGrid} />
        </div>
        {currentMode === 'vfx_lab' && <VfxLabPanel engine={engineRef.current} selectedAbility={selectedAbility} previewState={previewState} onUpdateAbilityParams={handleSelectAbility} onTriggerCast={() => {
          const hit = engineRef.current?.surfaceQuery.projectPoint(new THREE.Vector3(0, 0, 0));
          if (hit) handleCastPreview(hit);
        }} onSeekPreview={(seconds) => { const manager = abilityMgrRef.current; if (manager) setPreviewState(manager.seekPreview(seconds)); }} onRestartPreview={() => { const manager = abilityMgrRef.current; if (manager) setPreviewState(manager.restartPreview()); }} />}
        {currentMode === 'ability_factory' && <PresetBuilderPanel onSelectAbility={handleSelectAbility} />}
        {currentMode === 'macro_lab' && <SequenceLabPanel />}
        {currentMode === 'terraformer' && <SurfaceLabPanel activeTool={terraformTool} onChangeTool={setTerraformTool} sculptMode={sculptMode} onChangeSculptMode={setSculptMode} mutationType={mutationType} onChangeMutationType={setMutationType} brushRadius={brushRadius} onChangeRadius={setBrushRadius} onUndo={() => terrainRef.current?.undo()} onReset={() => terrainRef.current?.resetTerrain()} />}
        {currentMode === 'telegraphs' && <IndicatorLabPanel />}
        {currentMode === 'freehand_drawing' && <FreehandPanel />}
        {currentMode === 'perf_lab' && <PerformancePanel engine={engineRef.current} />}
      </div>
      <PresetsModal isOpen={isSpellbookOpen} onClose={() => setIsSpellbookOpen(false)} onSelectAbility={handleSelectAbility} />
    </div>
  );
}
