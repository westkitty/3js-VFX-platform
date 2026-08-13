import React from 'react';
import { Mountain, RotateCcw, Undo } from 'lucide-react';
import { SurfaceMutationType } from '../types';

interface Props {
  activeTool: 'sculpt' | 'mutate'; onChangeTool: (tool: 'sculpt' | 'mutate') => void;
  sculptMode: 'elevate' | 'depress'; onChangeSculptMode: (mode: 'elevate' | 'depress') => void;
  mutationType: SurfaceMutationType; onChangeMutationType: (type: SurfaceMutationType) => void;
  brushRadius: number; onChangeRadius: (radius: number) => void; onUndo: () => void; onReset: () => void;
}

export const SurfaceLabPanel: React.FC<Props> = (props) => (
  <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-800"><Mountain className="w-4 h-4 text-emerald-400" /><h2 className="text-sm font-bold">Terraformer</h2></div>
    <div className="grid grid-cols-2 gap-2"><button onClick={() => props.onChangeTool('sculpt')} className={`p-2 rounded border text-xs ${props.activeTool === 'sculpt' ? 'border-emerald-500 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>Sculpt</button><button onClick={() => props.onChangeTool('mutate')} className={`p-2 rounded border text-xs ${props.activeTool === 'mutate' ? 'border-emerald-500 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>Surface Mark</button></div>
    {props.activeTool === 'sculpt' ? <div className="grid grid-cols-2 gap-2"><button onClick={() => props.onChangeSculptMode('elevate')} className="p-2 rounded bg-slate-900 text-xs">Elevate</button><button onClick={() => props.onChangeSculptMode('depress')} className="p-2 rounded bg-slate-900 text-xs">Lower</button></div> : <select value={props.mutationType} onChange={(event) => props.onChangeMutationType(event.target.value as SurfaceMutationType)} className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs"><option value="scorch">Dark mark</option><option value="frost">Frost</option><option value="lava">Warm fissure</option><option value="crystal">Crystal</option><option value="golden_rune">Golden rune</option><option value="void_scar">Violet mark</option></select>}
    <label className="text-[11px] font-mono text-slate-400">BRUSH RADIUS · {props.brushRadius}m<input type="range" min={2} max={15} value={props.brushRadius} onChange={(event) => props.onChangeRadius(parseInt(event.target.value))} className="mt-2 w-full accent-emerald-400" /></label>
    <div className="mt-auto grid grid-cols-2 gap-2"><button onClick={props.onUndo} className="p-2 rounded bg-slate-800 text-xs flex justify-center gap-1"><Undo className="w-3.5 h-3.5" />Undo</button><button onClick={props.onReset} className="p-2 rounded bg-slate-800 text-xs flex justify-center gap-1"><RotateCcw className="w-3.5 h-3.5" />Reset</button></div>
  </div>
);
