import React from 'react';
import { Gauge } from 'lucide-react';
import { Engine } from '../core/Engine';

export const PerformancePanel: React.FC<{ engine: Engine | null; perfLab?: unknown }> = ({ engine }) => {
  const metrics = engine?.getMetrics();
  return <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200"><div className="flex items-center gap-2 pb-3 border-b border-slate-800"><Gauge className="w-4 h-4 text-cyan-400" /><h2 className="text-sm font-bold">Performance Lab</h2></div>{metrics ? <div className="grid grid-cols-2 gap-2 text-xs font-mono"><div>FPS {metrics.fps}</div><div>p50 {metrics.p50FrameMs}ms</div><div>Calls {metrics.drawCalls}</div><div>Particles {metrics.particlesCount}</div></div> : <div className="text-xs text-slate-500">Engine metrics unavailable.</div>}<div className="text-[11px] text-slate-400">Live metrics are active; automated browser stress scenarios remain pending validation.</div></div>;
};
