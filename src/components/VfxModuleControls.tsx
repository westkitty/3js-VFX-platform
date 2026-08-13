import React from 'react';
import { AbilityDefinition } from '../types';
import { cloneAbilityDefinition } from '../abilities/AbilityDefinitionState';
import { globalVfxModuleRegistry } from '../vfx/VfxModuleRegistry';

interface VfxModuleControlsProps {
  selectedAbility: AbilityDefinition;
  onUpdateAbilityParams: (updated: AbilityDefinition) => void;
}

export const VfxModuleControls: React.FC<VfxModuleControlsProps> = ({ selectedAbility, onUpdateAbilityParams }) => {
  const updateParam = (moduleIndex: number, key: string, value: number | string | boolean) => {
    const updated = cloneAbilityDefinition(selectedAbility);
    updated.modules[moduleIndex].params[key] = value;
    onUpdateAbilityParams(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-slate-400 tracking-wider font-mono uppercase">Live Module Parameters</h3>
      {selectedAbility.modules.map((module, moduleIndex) => {
        const runtimeBound = globalVfxModuleRegistry.has(module.type);
        return (
          <div key={`${module.type}-${moduleIndex}`} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 border-b border-slate-800/80 pb-1.5">
              <span className="capitalize">{module.type} Module</span>
              <span className={runtimeBound ? 'text-[10px] font-mono text-emerald-400' : 'text-[10px] font-mono text-amber-400'}>{runtimeBound ? 'Runtime bound' : 'Not live in preview'}</span>
            </div>
            {Object.entries(module.params).map(([key, value]) => {
              if (typeof value === 'number') {
                const isCount = key.includes('count');
                const signed = key === 'speed';
                return (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="flex justify-between text-[11px] font-mono text-slate-400"><span>{key}</span><span className="text-slate-200">{value}</span></span>
                    <input type="range" min={signed ? -30 : 0} max={isCount ? 500 : 30} step={isCount ? 10 : 0.1} value={value} onChange={(event) => updateParam(moduleIndex, key, parseFloat(event.target.value))} className="w-full accent-cyan-400 bg-slate-800 h-1 rounded cursor-pointer" />
                  </label>
                );
              }
              if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
                return (
                  <label key={key} className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{key}</span><span className="flex items-center gap-2 text-slate-200">{value}<input type="color" value={value} onChange={(event) => updateParam(moduleIndex, key, event.target.value)} className="h-6 w-8 rounded border border-slate-700 bg-transparent cursor-pointer" /></span>
                  </label>
                );
              }
              if (typeof value === 'boolean') {
                return <label key={key} className="flex items-center justify-between text-[11px] font-mono text-slate-400"><span>{key}</span><input type="checkbox" checked={value} onChange={(event) => updateParam(moduleIndex, key, event.target.checked)} className="accent-cyan-400" /></label>;
              }
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
};
