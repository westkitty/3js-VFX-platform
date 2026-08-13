import React from 'react';
import { Grid } from 'lucide-react';
import { Engine } from '../core/Engine';
import { AbilityDefinition, SurfaceHit, WorkbenchMode } from '../types';
import { PresetBar } from './PresetBar';
import { SceneInputLayer } from './SceneInputLayer';

interface Props {
  engine: Engine | null;
  currentMode: WorkbenchMode;
  selectedAbility: AbilityDefinition;
  onSelectAbility: (ability: AbilityDefinition) => void;
  onActivateAbility: (hit: SurfaceHit) => void;
  onDrawPoint?: (hit: SurfaceHit) => void;
  onDrawFinish?: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export const SceneViewport: React.FC<Props> = (props) => (
  <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
    <div id="flash-overlay" className="pointer-events-none absolute inset-0 transition-opacity duration-200 z-20" style={{ opacity: 0 }} />
    <SceneInputLayer engine={props.engine} currentMode={props.currentMode} onSurfacePoint={props.onActivateAbility} onDrawPoint={props.onDrawPoint} onDrawFinish={props.onDrawFinish} />
    <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/80"><button onClick={props.onToggleGrid} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs ${props.showGrid ? 'text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}><Grid className="w-3.5 h-3.5" />Grid</button></div>
    <PresetBar selectedAbility={props.selectedAbility} onSelectAbility={props.onSelectAbility} />
  </div>
);
