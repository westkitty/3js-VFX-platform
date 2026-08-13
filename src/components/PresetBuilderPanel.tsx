import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { AbilityDefinition } from '../types';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';

interface Props { onSelectAbility: (ability: AbilityDefinition) => void; }

export const PresetBuilderPanel: React.FC<Props> = ({ onSelectAbility }) => {
  const [name, setName] = useState('Custom VFX Study');
  const build = () => {
    const ability: AbilityDefinition = {
      id: `custom_${Date.now()}`,
      name,
      school: 'starsilk',
      description: 'Custom visual preset assembled from the proven ribbon and particle path.',
      iconName: 'Sparkles',
      targeting: { shape: 'line', range: 20, surfacePolicy: 'project' },
      timing: { windup: 0.15, travelSpeed: 18, hold: 0.8, fade: 0.5, cooldown: 1 },
      modules: [
        { type: 'ribbon', params: { width: 0.7, colorCore: '#ffffff', colorGlow: '#55ccff', noiseAmp: 0.2 } },
        { type: 'particles', params: { count: 140, speed: 4, size: 1, color: '#aaddff' } },
      ],
      feedback: { cameraShake: 0.1, flashIntensity: 0.2, lightColor: '#66ccff', lightRadius: 14 },
      budget: { maxParticles: 220, dynamicLights: 1 },
    };
    globalAbilityRegistry.register(ability);
    onSelectAbility(ability);
  };
  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800"><Wand2 className="w-4 h-4 text-fuchsia-400" /><h2 className="text-sm font-bold">Ability Factory</h2></div>
      <label className="text-[11px] font-mono text-slate-400">PRESET NAME<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100" /></label>
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">Current output is intentionally bounded to runtime-bound modules. Arbitrary schema composition remains a later phase.</div>
      <button onClick={build} className="mt-auto py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold">Build Preset</button>
    </div>
  );
};
