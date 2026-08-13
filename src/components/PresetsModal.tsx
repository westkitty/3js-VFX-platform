import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { AbilityDefinition } from '../types';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';

interface Props { isOpen: boolean; onClose: () => void; onSelectAbility: (ability: AbilityDefinition) => void; }

export const PresetsModal: React.FC<Props> = ({ isOpen, onClose, onSelectAbility }) => {
  if (!isOpen) return null;
  const abilities = globalAbilityRegistry.getAll();
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-400" /><h2 className="text-base font-bold">Preset Library</h2></div><button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button></div>
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2">{abilities.map((ability) => <button key={ability.id} onClick={() => { onSelectAbility(ability); onClose(); }} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-left"><div className="font-semibold text-xs text-cyan-300">{ability.name}</div><p className="text-[11px] text-slate-400 mt-1">{ability.description}</p></button>)}</div>
      </div>
    </div>
  );
};
