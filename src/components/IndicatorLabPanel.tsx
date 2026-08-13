import React from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { SurfaceIndicatorConfig } from '../indicators/SurfaceIndicatorManager';

interface Props {
  config: SurfaceIndicatorConfig;
  onChange: (config: SurfaceIndicatorConfig) => void;
  onClear: () => void;
  activeCount: number;
}

export const IndicatorLabPanel: React.FC<Props> = ({ config, onChange, onClear, activeCount }) => {
  const set = <K extends keyof SurfaceIndicatorConfig>(key: K, value: SurfaceIndicatorConfig[K]) => onChange({ ...config, [key]: value });
  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /><h2 className="text-sm font-bold">Telegraph Lab</h2></div><span className="text-[10px] font-mono text-cyan-300">{activeCount} ACTIVE</span></div>
      <label className="text-[11px] font-mono text-slate-400">SHAPE<select value={config.shape} onChange={(event) => set('shape', event.target.value as SurfaceIndicatorConfig['shape'])} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs"><option value="line">Line</option><option value="zone">Zone</option><option value="cone">Cone</option><option value="ring">Ring</option><option value="rectangle">Rectangle</option></select></label>
      <Slider label="RANGE" value={config.range} min={1} max={30} step={0.5} onChange={(value) => set('range', value)} />
      <Slider label="RADIUS" value={config.radius} min={0.5} max={15} step={0.5} onChange={(value) => set('radius', value)} />
      <Slider label="WIDTH" value={config.width} min={0.25} max={10} step={0.25} onChange={(value) => set('width', value)} />
      <Slider label="ANGLE" value={Math.round(config.angle * 180 / Math.PI)} min={10} max={160} step={5} suffix="°" onChange={(value) => set('angle', value * Math.PI / 180)} />
      <Slider label="WARNING" value={config.warningDuration} min={0} max={3} step={0.1} suffix="s" onChange={(value) => set('warningDuration', value)} />
      <Slider label="COMMIT" value={config.commitDuration} min={0.1} max={3} step={0.1} suffix="s" onChange={(value) => set('commitDuration', value)} />
      <p className="text-[11px] text-slate-400 leading-relaxed">Click the scene to place an outline. Vertices are reprojected against the local surface instead of being forced onto y=0.</p>
      <button onClick={onClear} className="mt-auto flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs"><Trash2 className="w-3.5 h-3.5" />Clear Indicators</button>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void }> = ({ label, value, min, max, step, suffix = '', onChange }) => <label className="text-[11px] font-mono text-slate-400">{label} · {Number.isInteger(step) ? value : value.toFixed(1)}{suffix}<input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-amber-400" /></label>;
