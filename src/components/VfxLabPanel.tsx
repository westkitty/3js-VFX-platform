/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Engine } from '../core/Engine';
import { AbilityDefinition } from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Sliders, 
  RotateCcw, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface VfxLabPanelProps {
  engine: Engine | null;
  selectedAbility: AbilityDefinition;
  onUpdateAbilityParams: (updated: AbilityDefinition) => void;
  onTriggerCast: () => void;
}

export const VfxLabPanel: React.FC<VfxLabPanelProps> = ({
  engine,
  selectedAbility,
  onUpdateAbilityParams,
  onTriggerCast,
}) => {
  const [timelinePos, setTimelinePos] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const togglePause = () => {
    if (!engine) return;
    engine.isPaused = !engine.isPaused;
    setIsPaused(engine.isPaused);
  };

  const stepFrame = () => {
    if (!engine || !engine.isPaused) return;
    engine.stepSingleFrame();
  };

  const handleSliderChange = (modIdx: number, paramKey: string, val: number) => {
    const newDef = JSON.parse(JSON.stringify(selectedAbility)) as AbilityDefinition;
    newDef.modules[modIdx].params[paramKey] = val;
    onUpdateAbilityParams(newDef);
  };

  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 overflow-y-auto backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100">Live VFX Inspector</h2>
        </div>
        <button
          onClick={onTriggerCast}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20"
        >
          <Sparkles className="w-3 h-3" />
          <span>Cast Now</span>
        </button>
      </div>

      {/* Timeline Controls */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>TIMELINE SCRUBBER</span>
          <span className="text-cyan-400">{timelinePos.toFixed(2)}s</span>
        </div>

        <input
          type="range"
          min={0}
          max={3.0}
          step={0.05}
          value={timelinePos}
          onChange={(e) => setTimelinePos(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={togglePause}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold border ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={stepFrame}
            disabled={!isPaused}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-semibold ${
              isPaused
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step 1 Frame</span>
          </button>
        </div>
      </div>

      {/* Live Parameter Editor Modules */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider font-mono uppercase">
          Shader & Module Parameters
        </h3>

        {selectedAbility.modules.map((mod, modIdx) => (
          <div key={modIdx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 border-b border-slate-800/80 pb-1.5">
              <span className="capitalize">{mod.type} Module</span>
              <span className="text-[10px] font-mono text-slate-500">Schema v1</span>
            </div>

            {Object.entries(mod.params).map(([paramKey, paramVal]) => {
              if (typeof paramVal === 'number') {
                return (
                  <div key={paramKey} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{paramKey}</span>
                      <span className="text-slate-200">{paramVal}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={paramKey.includes('count') ? 500 : 30}
                      step={paramKey.includes('count') ? 10 : 0.1}
                      value={paramVal}
                      onChange={(e) => handleSliderChange(modIdx, paramKey, parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 h-1 rounded cursor-pointer"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
