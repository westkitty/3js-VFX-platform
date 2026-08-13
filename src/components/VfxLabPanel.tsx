import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';
import { AbilityPreviewState } from '../abilities/AbilityRuntime';
import { Engine } from '../core/Engine';
import { AbilityDefinition } from '../types';
import { VfxModuleControls } from './VfxModuleControls';
import { VfxTimelineControls } from './VfxTimelineControls';

interface VfxLabPanelProps {
  engine: Engine | null;
  selectedAbility: AbilityDefinition;
  previewState?: AbilityPreviewState;
  onUpdateAbilityParams: (updated: AbilityDefinition) => void;
  onTriggerCast: () => void;
  onSeekPreview?: (seconds: number) => void;
  onRestartPreview?: () => void;
}

const EMPTY_PREVIEW: AbilityPreviewState = { hasPreview: false, time: 0, duration: 0, phase: 'done' };

export const VfxLabPanel: React.FC<VfxLabPanelProps> = (props) => (
  <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 overflow-y-auto backdrop-blur-md">
    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
      <div className="flex items-center gap-2"><Sliders className="w-4 h-4 text-cyan-400" /><h2 className="text-sm font-bold text-slate-100">Live VFX Inspector</h2></div>
      <button onClick={props.onTriggerCast} className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20"><Sparkles className="w-3 h-3" /><span>Preview</span></button>
    </div>
    <VfxTimelineControls engine={props.engine} previewState={props.previewState ?? EMPTY_PREVIEW} onSeekPreview={props.onSeekPreview ?? (() => {})} onRestartPreview={props.onRestartPreview ?? (() => {})} />
    <VfxModuleControls selectedAbility={props.selectedAbility} onUpdateAbilityParams={props.onUpdateAbilityParams} />
  </div>
);
