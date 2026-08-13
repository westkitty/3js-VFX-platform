import React from 'react';
import { Pencil } from 'lucide-react';

export const FreehandPanel: React.FC = () => (
  <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 overflow-y-auto backdrop-blur-md">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
      <Pencil className="w-4 h-4 text-cyan-400" />
      <h2 className="text-sm font-bold text-slate-100">Freehand Drawing</h2>
    </div>
    <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
      Drag across the 3D surface to create a smoothed Catmull-Rom path with uniform arc-length sampling.
    </div>
  </div>
);
