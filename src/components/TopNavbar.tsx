/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkbenchMode } from '../types';
import { Sparkles, Wand2, Layers3, Mountain, ShieldAlert, Pencil, Gauge, BookOpen } from 'lucide-react';

interface TopNavbarProps {
  currentMode: WorkbenchMode;
  onSelectMode: (mode: WorkbenchMode) => void;
  onOpenSpellbook: () => void;
  activeSpellCount: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentMode, onSelectMode, onOpenSpellbook, activeSpellCount }) => {
  const modes: { id: WorkbenchMode; label: string; icon: React.ReactNode }[] = [
    { id: 'vfx_lab', label: 'VFX Laboratory', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'ability_factory', label: 'Ability Factory', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'macro_lab', label: 'Macro Sandbox', icon: <Layers3 className="w-4 h-4" /> },
    { id: 'terraformer', label: 'Terraformer', icon: <Mountain className="w-4 h-4" /> },
    { id: 'telegraphs', label: 'Telegraph Lab', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'freehand_drawing', label: 'Freehand Caster', icon: <Pencil className="w-4 h-4" /> },
    { id: 'perf_lab', label: 'Performance Lab', icon: <Gauge className="w-4 h-4" /> },
  ];
  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none text-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/20"><div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center"><Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /></div></div>
        <div><h1 className="text-sm font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">AETHER VFX</h1><p className="text-[10px] text-slate-400 font-mono tracking-tight">Procedural Ability Engine v2.4</p></div>
      </div>
      <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
        {modes.map((mode) => <button key={mode.id} onClick={() => onSelectMode(mode.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currentMode === mode.id ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>{mode.icon}<span>{mode.label}</span></button>)}
      </nav>
      <div className="xl:hidden flex items-center"><select value={currentMode} onChange={(event) => onSelectMode(event.target.value as WorkbenchMode)} className="bg-slate-900 text-xs border border-slate-700 rounded-md px-2 py-1 text-cyan-300 font-medium">{modes.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}</select></div>
      <div className="flex items-center gap-3">
        {activeSpellCount > 0 && <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /><span>{activeSpellCount} Active</span></div>}
        <button onClick={onOpenSpellbook} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20"><BookOpen className="w-3.5 h-3.5" /><span>Presets</span></button>
      </div>
    </header>
  );
};
