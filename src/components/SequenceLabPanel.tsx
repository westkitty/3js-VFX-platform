/**
 * Sequence Designer.
 *
 * Loads validated sequence documents, shows their semantic stage tree with live
 * runtime state, and drives run/restart/stop. Progression itself belongs to
 * SequenceRuntime under EngineClock; this panel only issues commands and
 * renders the state it is given.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Layers3, Play, RotateCcw, Square, Upload } from 'lucide-react';
import { flattenNodes, leafDuration, nodeDuration, type SequenceDefinition } from '../sequence/SequenceModel';
import type { SequenceRuntimeState } from '../sequence/SequenceRuntime';
import { formatIssues } from '../schema/AbilityValidator';
import { findUnresolvedEmitTargets, parseSequenceJson } from '../schema/SequenceValidator';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';

interface Props {
  definitions: SequenceDefinition[];
  selectedId: string | null;
  runtimeState: SequenceRuntimeState;
  ownedInstanceCount: number;
  onSelectSequence: (id: string) => void;
  onRun: () => void;
  onRestart: () => void;
  onStop: () => void;
  onImportSequence: (definition: SequenceDefinition) => void;
}

const NODE_TONE: Record<string, string> = {
  sequence: 'text-slate-300',
  parallel: 'text-indigo-300',
  wait: 'text-slate-400',
  emit: 'text-fuchsia-300',
  travel: 'text-cyan-300',
  impact: 'text-amber-300',
  field: 'text-emerald-300',
  residue: 'text-violet-300',
};

export const SequenceLabPanel: React.FC<Props> = ({
  definitions, selectedId, runtimeState, ownedInstanceCount,
  onSelectSequence, onRun, onRestart, onStop, onImportSequence,
}) => {
  const [importText, setImportText] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');

  const selected = useMemo(
    () => definitions.find((definition) => definition.id === selectedId) ?? null,
    [definitions, selectedId],
  );

  const nodes = useMemo(() => (selected ? flattenNodes(selected.root) : []), [selected]);

  const unresolved = useMemo(
    () => (selected ? findUnresolvedEmitTargets(selected, globalAbilityRegistry.getIds()) : []),
    [selected],
  );

  const handleImport = () => {
    const result = parseSequenceJson(importText);
    if (!result.ok || !result.definition) {
      setIssues(formatIssues(result.issues));
      setStatus(`rejected: ${result.issues.length} issue(s)`);
      return;
    }

    const missing = findUnresolvedEmitTargets(result.definition, globalAbilityRegistry.getIds());
    if (missing.length > 0) {
      setIssues([`unknown emit target(s): ${missing.join(', ')}`]);
      setStatus('rejected: 1 issue(s)');
      return;
    }

    setIssues([]);
    setStatus(`imported: ${result.definition.id}`);
    onImportSequence(result.definition);
  };

  const handleExport = () => {
    if (!selected) return;
    setImportText(JSON.stringify(selected, null, 2));
    setStatus(`exported: ${selected.id}`);
    setIssues([]);
  };

  const progressPercent = runtimeState.duration > 0
    ? Math.min(100, (runtimeState.elapsed / runtimeState.duration) * 100)
    : 0;

  return (
    <div data-testid="sequence-lab" className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 flex flex-col z-20 text-slate-200">
      <div className="flex items-center gap-2 p-4 pb-3 border-b border-slate-800">
        <Layers3 className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-bold text-slate-100">Sequence Designer</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <label className="text-[11px] font-mono text-slate-400">
          SEQUENCE
          <select
            data-testid="sequence-select" value={selectedId ?? ''}
            onChange={(event) => onSelectSequence(event.target.value)}
            className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100"
          >
            {definitions.map((definition) => (
              <option key={definition.id} value={definition.id}>{definition.name}</option>
            ))}
          </select>
        </label>

        {selected && (
          <p className="text-[10px] text-slate-500 leading-relaxed">{selected.description}</p>
        )}

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">RUNTIME</span>
            <span data-testid="sequence-status" className="text-cyan-300">{runtimeState.status}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>elapsed</span>
            <span data-testid="sequence-elapsed" className="text-slate-200">
              {runtimeState.elapsed.toFixed(2)} / {runtimeState.duration.toFixed(2)}s
            </span>
          </div>
          <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-400 transition-[width] duration-75" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>emits</span>
            <span data-testid="sequence-emits" className="text-slate-200">{runtimeState.emitCount}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>owned instances</span>
            <span data-testid="sequence-owned" className="text-slate-200">{ownedInstanceCount}</span>
          </div>
        </div>

        {unresolved.length > 0 && (
          <p data-testid="sequence-unresolved" className="rounded border border-amber-900/60 bg-amber-950/30 p-2 font-mono text-[10px] text-amber-300">
            unknown emit target(s): {unresolved.join(', ')}
          </p>
        )}

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <h3 className="mb-2 text-[11px] font-mono text-cyan-300">SEMANTIC STAGES</h3>
          <ul data-testid="sequence-nodes" className="space-y-0.5 font-mono text-[10px]">
            {nodes.map(({ node, depth }) => {
              const isActive = runtimeState.activeNodeIds.includes(node.id);
              const isComplete = runtimeState.completedNodeIds.includes(node.id);
              const duration = node.type === 'sequence' || node.type === 'parallel'
                ? nodeDuration(node)
                : leafDuration(node);

              return (
                <li
                  key={node.id}
                  data-testid={`sequence-node-${node.id}`}
                  data-node-state={isComplete ? 'complete' : isActive ? 'active' : 'pending'}
                  style={{ paddingLeft: `${depth * 10}px` }}
                  className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 ${
                    isActive ? 'bg-indigo-500/20 ring-1 ring-indigo-400/40' : isComplete ? 'opacity-50' : ''
                  }`}
                >
                  <span className="truncate">
                    <span className={NODE_TONE[node.type] ?? 'text-slate-300'}>{node.type}</span>
                    <span className="text-slate-500"> · {node.label ?? node.id}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">{duration.toFixed(2)}s</span>
                </li>
              );
            })}
          </ul>
        </div>

        <section className="flex flex-col gap-2">
          <label className="text-[11px] font-mono text-slate-400">
            SEQUENCE JSON
            <textarea
              data-testid="sequence-json" value={importText} rows={4}
              placeholder='{"schemaVersion":"1.0.0", ...}'
              onChange={(event) => setImportText(event.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 font-mono text-[10px] text-slate-100 resize-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              data-testid="sequence-export" onClick={handleExport}
              className="py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              Export
            </button>
            <button
              data-testid="sequence-import" onClick={handleImport}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />Import
            </button>
          </div>
        </section>
      </div>

      <div className="border-t border-slate-800 p-4 flex flex-col gap-2">
        <div
          data-testid="sequence-message"
          className={`flex items-start gap-1.5 text-[11px] font-mono ${status.startsWith('rejected') ? 'text-red-300' : 'text-emerald-300'}`}
        >
          {status.startsWith('rejected') ? <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 mt-px shrink-0" />}
          <span>{status}</span>
        </div>

        {issues.length > 0 && (
          <ul data-testid="sequence-issues" className="max-h-20 overflow-y-auto rounded border border-red-900/60 bg-red-950/30 p-2 font-mono text-[10px] text-red-300 space-y-0.5">
            {issues.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            data-testid="sequence-run" onClick={onRun} disabled={!selected}
            className="flex items-center justify-center gap-1.5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5" />Run
          </button>
          <button
            data-testid="sequence-restart" onClick={onRestart} disabled={!selected}
            className="flex items-center justify-center gap-1.5 py-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />Restart
          </button>
          <button
            data-testid="sequence-stop" onClick={onStop} disabled={!selected}
            className="flex items-center justify-center gap-1.5 py-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold"
          >
            <Square className="w-3.5 h-3.5" />Stop
          </button>
        </div>
      </div>
    </div>
  );
};
