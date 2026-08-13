import React, { useEffect } from 'react';
import { AbilityDefinition } from '../types';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';

interface Props { selectedAbility: AbilityDefinition; onSelectAbility: (ability: AbilityDefinition) => void; }

export const PresetBar: React.FC<Props> = ({ selectedAbility, onSelectAbility }) => {
  const abilities = globalAbilityRegistry.getAll();
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < abilities.length) onSelectAbility(abilities[index]);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [abilities, onSelectAbility]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-slate-950/85 p-2 rounded-xl border border-slate-800/90">
      {abilities.map((ability, index) => <button key={ability.id} onClick={() => onSelectAbility(ability)} title={ability.name} className={`relative min-w-12 h-12 px-2 rounded-lg border text-[10px] ${selectedAbility.id === ability.id ? 'bg-cyan-900/60 border-cyan-400 text-cyan-100' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}><span className="absolute top-1 left-1 text-[9px]">{index + 1}</span><span>{ability.name}</span></button>)}
    </div>
  );
};
