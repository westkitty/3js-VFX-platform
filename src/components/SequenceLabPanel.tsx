import React from 'react';
import { Layers3 } from 'lucide-react';

export const SequenceLabPanel: React.FC = () => (
  <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
      <Layers3 className="w-4 h-4 text-indigo-400" />
      <h2 className="text-sm font-bold text-slate-100">Sequence Designer</h2>
    </div>
    <p className="text-xs text-slate-400">Sequence composition is planned for a later project phase.</p>
  </div>
);
