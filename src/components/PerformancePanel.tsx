import React from 'react';
import { Gauge } from 'lucide-react';
import { Engine } from '../core/Engine';

interface Props { engine: Engine | null; }

export const PerformancePanel: React.FC<Props> = ({ engine }) => {
  const metrics = engine?.getMetrics();
  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800"><Gauge className="w-4 h-4 text-cyan-400" /><h2 className="text-sm font-bold">Performance Lab</h2></div>
      {metrics ? <div className="grid grid-cols-2 gap-2 text-xs font-mono"><Metric label="FPS" value={metrics.fps} /><Metric label="p50 ms" value={metrics.p50FrameMs} /><Metric label="Draw calls" value={metrics.drawCalls} /><Metric label="Particles" value={metrics.particlesCount} /></div> : <div className="text-xs text-slate-500">Engine metrics unavailable.</div>}
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-[11px] text-slate-400">Live metrics use the repaired frame-duration path. Automated stress scenarios remain unverified until the dependency-resolved browser harness is available.</div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5"><div className="text-[10px] text-slate-500">{label}</div><div className="text-cyan-300 text-lg font-bold">{value}</div></div>;
