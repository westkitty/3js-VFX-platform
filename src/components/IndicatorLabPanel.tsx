import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const IndicatorLabPanel: React.FC = () => (
  <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-800"><ShieldAlert className="w-4 h-4 text-amber-400" /><h2 className="text-sm font-bold">Telegraph Lab</h2></div>
    <p className="text-xs text-slate-400 leading-relaxed">Surface-aware indicator geometry and timing remain scheduled for Phase 3.</p>
    <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-[11px] text-amber-200">Pending: slope-aware line, zone, cone, ring, and rectangle indicators.</div>
  </div>
);
