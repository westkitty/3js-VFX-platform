import React, { useState } from 'react';
import { Download, Mountain, Redo, RotateCcw, Undo, Upload } from 'lucide-react';
import { SurfaceMutationType } from '../types';

interface Props {
  activeTool: 'sculpt' | 'mutate';
  onChangeTool: (tool: 'sculpt' | 'mutate') => void;
  sculptMode: 'elevate' | 'depress';
  onChangeSculptMode: (mode: 'elevate' | 'depress') => void;
  mutationType: SurfaceMutationType;
  onChangeMutationType: (type: SurfaceMutationType) => void;
  brushRadius: number;
  onChangeRadius: (radius: number) => void;
  onUndo: () => void;
  onRedo?: () => void;
  onReset: () => void;
  onExportJson?: () => string;
  onImportJson?: (json: string) => boolean | { ok: boolean; count?: number; error?: string };
  activeMutationCount?: number;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const SurfaceLabPanel: React.FC<Props> = (props) => {
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExport = () => {
    if (props.onExportJson) {
      const exported = props.onExportJson();
      setJsonText(exported);
      setShowJsonDialog(true);
      setStatusMessage('Exported state ready to copy/save.');
    }
  };

  const handleImport = () => {
    if (props.onImportJson && jsonText) {
      const res = props.onImportJson(jsonText);
      if (typeof res === 'object') {
        if (res.ok) {
          setStatusMessage(`Successfully imported ${res.count ?? 0} mutations.`);
          setTimeout(() => setShowJsonDialog(false), 800);
        } else {
          setStatusMessage(`Import failed: ${res.error}`);
        }
      } else if (res) {
        setStatusMessage('Successfully imported mutations.');
        setTimeout(() => setShowJsonDialog(false), 800);
      } else {
        setStatusMessage('Import failed. Please check JSON format.');
      }
    }
  };

  return (
    <div className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 p-4 flex flex-col gap-4 z-20 text-slate-200 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold">Terraformer</h2>
        </div>
        {props.activeMutationCount !== undefined && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-400">
            {props.activeMutationCount} / 64 marks
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => props.onChangeTool('sculpt')}
          className={`p-2 rounded border text-xs font-medium transition-colors ${
            props.activeTool === 'sculpt'
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Sculpt
        </button>
        <button
          onClick={() => props.onChangeTool('mutate')}
          className={`p-2 rounded border text-xs font-medium transition-colors ${
            props.activeTool === 'mutate'
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Surface Mark
        </button>
      </div>

      {props.activeTool === 'sculpt' ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => props.onChangeSculptMode('elevate')}
            className={`p-2 rounded text-xs font-medium border ${
              props.sculptMode === 'elevate'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Elevate
          </button>
          <button
            onClick={() => props.onChangeSculptMode('depress')}
            className={`p-2 rounded text-xs font-medium border ${
              props.sculptMode === 'depress'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Lower
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-slate-400">MUTATION ARCHETYPE</label>
          <select
            value={props.mutationType}
            onChange={(event) => props.onChangeMutationType(event.target.value as SurfaceMutationType)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="scorch">Scorch Mark (Charred blast)</option>
            <option value="frost">Frost Patch (Ice crystals)</option>
            <option value="lava">Lava Fissure (Molten glow)</option>
            <option value="crystal">Crystal Cluster (3D Spikes)</option>
            <option value="golden_rune">Golden Rune (Ward sigil)</option>
            <option value="void_scar">Void Scar (Abyssal rift)</option>
          </select>
        </div>
      )}

      <label className="text-[11px] font-mono text-slate-400 flex flex-col gap-1">
        <span>BRUSH RADIUS · {props.brushRadius}m</span>
        <input
          type="range"
          min={2}
          max={15}
          value={props.brushRadius}
          onChange={(event) => props.onChangeRadius(parseInt(event.target.value, 10))}
          className="mt-1 w-full accent-emerald-400"
        />
      </label>

      {/* Snapshot / JSON Persistence Actions */}
      <div className="p-3 bg-slate-900/60 rounded border border-slate-800 flex flex-col gap-2">
        <span className="text-[11px] font-mono text-slate-400">PERSISTENCE & REPLAY</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center justify-center gap-1 text-slate-200 border border-slate-700"
          >
            <Download className="w-3 h-3 text-emerald-400" /> Export JSON
          </button>
          <button
            onClick={() => {
              setShowJsonDialog(true);
              setStatusMessage('Paste mutation document JSON below:');
            }}
            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center justify-center gap-1 text-slate-200 border border-slate-700"
          >
            <Upload className="w-3 h-3 text-emerald-400" /> Import JSON
          </button>
        </div>
      </div>

      {showJsonDialog && (
        <div className="p-3 bg-slate-900 rounded border border-emerald-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-300">MUTATION DOCUMENT JSON</span>
            <button
              onClick={() => setShowJsonDialog(false)}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <textarea
            rows={5}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"schemaVersion": "1.0.0", "mutations": [...] }'
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          {statusMessage && <div className="text-[10px] text-slate-400 font-mono">{statusMessage}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="flex-1 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium"
            >
              Load Document
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={props.onUndo}
            disabled={props.canUndo === false}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center justify-center gap-1 border border-slate-700"
          >
            <Undo className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={props.onRedo}
            disabled={props.canRedo === false}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center justify-center gap-1 border border-slate-700"
          >
            <Redo className="w-3.5 h-3.5" /> Redo
          </button>
        </div>
        <button
          onClick={props.onReset}
          className="p-2 rounded bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/60 text-xs font-medium flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset World State
        </button>
      </div>
    </div>
  );
};
