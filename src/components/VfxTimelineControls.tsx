import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { AbilityPreviewState } from '../abilities/AbilityRuntime';
import { Engine } from '../core/Engine';

interface VfxTimelineControlsProps {
  engine: Engine | null;
  previewState: AbilityPreviewState;
  onSeekPreview: (seconds: number) => void;
  onRestartPreview: () => void;
}

export const VfxTimelineControls: React.FC<VfxTimelineControlsProps> = ({ engine, previewState, onSeekPreview, onRestartPreview }) => {
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => { setIsPaused(engine?.isPaused ?? false); }, [engine]);
  const timelineMax = Math.max(previewState.duration, 0.1);
  const timelineValue = Math.min(previewState.time, timelineMax);
  const togglePause = () => { if (!engine) return; engine.isPaused = !engine.isPaused; setIsPaused(engine.isPaused); };
  const stepFrame = () => { if (!engine || !engine.isPaused || !previewState.hasPreview) return; engine.stepSingleFrame(); };
  const seek = (seconds: number) => { if (!engine || !previewState.hasPreview) return; engine.isPaused = true; setIsPaused(true); onSeekPreview(seconds); };
  const restart = () => { if (!engine || !previewState.hasPreview) return; engine.isPaused = true; setIsPaused(true); onRestartPreview(); };

  return (
    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>TIMELINE</span>
        <span className="text-cyan-400">{previewState.hasPreview ? `${timelineValue.toFixed(2)} / ${timelineMax.toFixed(2)}s · ${previewState.phase}` : 'cast a preview'}</span>
      </div>
      <input type="range" min={0} max={timelineMax} step={1 / 60} value={timelineValue} disabled={!previewState.hasPreview} onChange={(event) => seek(parseFloat(event.target.value))} className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-40" />
      <div className="grid grid-cols-3 gap-2">
        <button onClick={togglePause} disabled={!engine} className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold border ${isPaused ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'} disabled:opacity-40`}>
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}<span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
        <button onClick={stepFrame} disabled={!isPaused || !previewState.hasPreview} className="flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-semibold bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed"><SkipForward className="w-3.5 h-3.5" /><span>Step</span></button>
        <button onClick={restart} disabled={!previewState.hasPreview} className="flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-semibold bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed"><RotateCcw className="w-3.5 h-3.5" /><span>Restart</span></button>
      </div>
    </div>
  );
};
