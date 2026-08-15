/**
 * Ability Factory.
 *
 * Authors real `AbilityDefinition` data from bounded controls, validates it
 * against the versioned schema, and registers it only if it passes. The panel
 * is generic over module types: it is driven by MODULE_SPECS, never by
 * individual ability ids.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Upload, Wand2 } from 'lucide-react';
import { AbilityDefinition, AbilityModuleConfig, TargetingShape } from '../types';
import { globalAbilityRegistry } from '../abilities/AbilityRegistry';
import { formatIssues, validateAbilityDefinition } from '../schema/AbilityValidator';
import {
  ABILITY_DECAL_TYPES,
  ABILITY_SCHOOLS,
  ABILITY_SURFACE_POLICIES,
  ABILITY_TARGETING_SHAPES,
} from '../schema/AbilitySchema';

interface Props {
  onSelectAbility: (ability: AbilityDefinition) => void;
}

type ParamValue = number | string;

interface ParamSpec {
  key: string;
  label: string;
  kind: 'number' | 'color' | 'enum';
  min?: number;
  max?: number;
  step?: number;
  options?: readonly string[];
  initial: ParamValue;
}

interface ModuleSpec {
  type: AbilityModuleConfig['type'];
  label: string;
  params: ParamSpec[];
}

/** Bounded, runtime-backed module controls. Adding a module type here is data. */
const MODULE_SPECS: ModuleSpec[] = [
  {
    type: 'orb', label: 'Orb',
    params: [
      { key: 'radius', label: 'radius', kind: 'number', min: 0.1, max: 5, step: 0.05, initial: 0.8 },
      { key: 'colorCore', label: 'colorCore', kind: 'color', initial: '#ffaa00' },
      { key: 'colorOuter', label: 'colorOuter', kind: 'color', initial: '#ff5522' },
    ],
  },
  {
    type: 'beam', label: 'Beam',
    params: [
      { key: 'radius', label: 'radius', kind: 'number', min: 0.1, max: 6, step: 0.05, initial: 0.8 },
      { key: 'colorCore', label: 'colorCore', kind: 'color', initial: '#ffffff' },
      { key: 'colorGlow', label: 'colorGlow', kind: 'color', initial: '#00aaff' },
    ],
  },
  {
    type: 'ribbon', label: 'Ribbon',
    params: [
      { key: 'width', label: 'width', kind: 'number', min: 0.05, max: 4, step: 0.05, initial: 0.7 },
      { key: 'noiseAmp', label: 'noiseAmp', kind: 'number', min: 0, max: 2, step: 0.05, initial: 0.2 },
      { key: 'colorCore', label: 'colorCore', kind: 'color', initial: '#ffffff' },
      { key: 'colorGlow', label: 'colorGlow', kind: 'color', initial: '#55ccff' },
    ],
  },
  {
    type: 'particles', label: 'Particles',
    params: [
      { key: 'count', label: 'count', kind: 'number', min: 0, max: 800, step: 10, initial: 160 },
      { key: 'speed', label: 'speed', kind: 'number', min: -20, max: 30, step: 0.5, initial: 6 },
      { key: 'size', label: 'size', kind: 'number', min: 0.1, max: 4, step: 0.1, initial: 1 },
      { key: 'color', label: 'color', kind: 'color', initial: '#aaddff' },
    ],
  },
  {
    type: 'shockwave', label: 'Shockwave',
    params: [
      { key: 'radius', label: 'radius', kind: 'number', min: 0.5, max: 30, step: 0.5, initial: 8 },
      { key: 'colorPrimary', label: 'colorPrimary', kind: 'color', initial: '#00ffff' },
      { key: 'colorSecondary', label: 'colorSecondary', kind: 'color', initial: '#0044ff' },
    ],
  },
  {
    type: 'decal', label: 'Surface Mark',
    params: [
      { key: 'decalType', label: 'decalType', kind: 'enum', options: ABILITY_DECAL_TYPES, initial: 'scorch' },
      { key: 'radius', label: 'radius', kind: 'number', min: 0.5, max: 20, step: 0.5, initial: 4 },
    ],
  },
];

const SHAPES_WITH_RADIUS: TargetingShape[] = ['zone', 'ring', 'cone'];
const SHAPES_WITH_ANGLE: TargetingShape[] = ['cone'];
const SHAPES_WITH_WIDTH: TargetingShape[] = ['rectangle'];

function initialParams(spec: ModuleSpec): Record<string, ParamValue> {
  return Object.fromEntries(spec.params.map((param) => [param.key, param.initial]));
}

/** Stable id derived from the display name; kept schema-legal by construction. */
function slugify(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const safe = base.length > 0 ? base : 'ability';
  return `factory_${/^[a-z]/.test(safe) ? safe : `a_${safe}`}`.slice(0, 60);
}

const numberOrZero = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const PresetBuilderPanel: React.FC<Props> = ({ onSelectAbility }) => {
  const [name, setName] = useState('Custom VFX Study');
  const [school, setSchool] = useState<AbilityDefinition['school']>('starsilk');
  const [description, setDescription] = useState('Authored in the Ability Factory from validated declarative data.');
  const [shape, setShape] = useState<TargetingShape>('line');
  const [surfacePolicy, setSurfacePolicy] = useState<AbilityDefinition['targeting']['surfacePolicy']>('project');
  const [range, setRange] = useState(20);
  const [radius, setRadius] = useState(5);
  const [angle, setAngle] = useState(1.0472);
  const [width, setWidth] = useState(8);

  const [windup, setWindup] = useState(0.15);
  const [travelSpeed, setTravelSpeed] = useState(18);
  const [hold, setHold] = useState(0.8);
  const [fade, setFade] = useState(0.5);
  const [cooldown, setCooldown] = useState(1);

  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({ ribbon: true, particles: true });
  const [moduleParams, setModuleParams] = useState<Record<string, Record<string, ParamValue>>>(
    () => Object.fromEntries(MODULE_SPECS.map((spec) => [spec.type, initialParams(spec)])),
  );

  const [cameraShake, setCameraShake] = useState(0.1);
  const [flashIntensity, setFlashIntensity] = useState(0.2);
  const [lightColor, setLightColor] = useState('#66ccff');
  const [lightRadius, setLightRadius] = useState(14);
  const [maxParticles, setMaxParticles] = useState(260);
  const [dynamicLights, setDynamicLights] = useState(1);

  const [issues, setIssues] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('idle');
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');

  const draft = useMemo<AbilityDefinition>(() => {
    const modules: AbilityModuleConfig[] = MODULE_SPECS.filter((spec) => enabledModules[spec.type]).map((spec) => ({
      type: spec.type,
      params: { ...moduleParams[spec.type] },
    }));

    return {
      id: slugify(name),
      name: name.trim(),
      school,
      description: description.trim(),
      iconName: 'Sparkles',
      targeting: {
        shape,
        range,
        surfacePolicy,
        ...(SHAPES_WITH_RADIUS.includes(shape) ? { radius } : {}),
        ...(SHAPES_WITH_ANGLE.includes(shape) ? { angle } : {}),
        ...(SHAPES_WITH_WIDTH.includes(shape) ? { width } : {}),
      },
      timing: { windup, travelSpeed, hold, fade, cooldown },
      modules,
      feedback: { cameraShake, flashIntensity, lightColor, lightRadius },
      budget: { maxParticles, dynamicLights },
    };
  }, [
    name, school, description, shape, surfacePolicy, range, radius, angle, width,
    windup, travelSpeed, hold, fade, cooldown, enabledModules, moduleParams,
    cameraShake, flashIntensity, lightColor, lightRadius, maxParticles, dynamicLights,
  ]);

  const setParam = (type: string, key: string, value: ParamValue) => {
    setModuleParams((previous) => ({ ...previous, [type]: { ...previous[type], [key]: value } }));
  };

  const handleRegister = () => {
    const validation = validateAbilityDefinition(draft);
    if (!validation.ok || !validation.definition) {
      setIssues(formatIssues(validation.issues));
      setStatus(`rejected: ${validation.issues.length} issue(s)`);
      return;
    }

    // Re-registering the same authored id is an explicit overwrite.
    const result = globalAbilityRegistry.register(validation.definition, { duplicates: 'replace' });
    if (!result.ok) {
      setIssues(formatIssues(result.issues));
      setStatus(`rejected: ${result.issues.length} issue(s)`);
      return;
    }

    setIssues([]);
    setStatus(`registered: ${result.id}`);
    onSelectAbility(validation.definition);
  };

  const handleExport = () => {
    const validation = validateAbilityDefinition(draft);
    if (!validation.ok || !validation.definition) {
      setIssues(formatIssues(validation.issues));
      setStatus(`rejected: ${validation.issues.length} issue(s)`);
      setExported('');
      return;
    }
    setIssues([]);
    setExported(JSON.stringify(validation.document, null, 2));
    setStatus(`exported: ${validation.definition.id}`);
  };

  const handleImport = () => {
    const result = globalAbilityRegistry.importJson(importText, { duplicates: 'replace' });
    if (!result.ok) {
      const flattened = result.rejected.flatMap((entry) => formatIssues(entry.issues).map((line) => `#${entry.index} ${line}`));
      setIssues(flattened);
      setStatus(`rejected: ${flattened.length} issue(s)`);
      return;
    }

    setIssues([]);
    setStatus(`imported: ${result.registered.join(', ')}`);
    const first = globalAbilityRegistry.get(result.registered[0]);
    if (first) onSelectAbility(first);
  };

  const numberField = (label: string, value: number, onChange: (next: number) => void, min: number, max: number, step: number) => (
    <label key={label} className="block text-[10px] font-mono text-slate-400">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-slate-200">{value}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(event) => onChange(numberOrZero(event.target.value))}
        className="mt-0.5 w-full accent-fuchsia-400 bg-slate-800 h-1 rounded cursor-pointer"
      />
    </label>
  );

  return (
    <div
      data-testid="ability-factory"
      className="w-80 h-full bg-slate-950/90 border-l border-slate-800/80 flex flex-col z-20 text-slate-200"
    >
      <div className="flex items-center gap-2 p-4 pb-3 border-b border-slate-800">
        <Wand2 className="w-4 h-4 text-fuchsia-400" />
        <h2 className="text-sm font-bold">Ability Factory</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <label className="text-[11px] font-mono text-slate-400">
            NAME
            <input
              data-testid="factory-name" value={name} onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
            />
          </label>
          <p className="text-[10px] font-mono text-slate-500" data-testid="factory-id">id: {draft.id}</p>

          <label className="text-[11px] font-mono text-slate-400">
            SCHOOL
            <select
              data-testid="factory-school" value={school}
              onChange={(event) => setSchool(event.target.value as AbilityDefinition['school'])}
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100"
            >
              {ABILITY_SCHOOLS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="text-[11px] font-mono text-slate-400">
            DESCRIPTION
            <textarea
              data-testid="factory-description" value={description} rows={2}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 resize-none"
            />
          </label>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
          <h3 className="text-[11px] font-mono text-cyan-300">TARGETING</h3>
          <select
            data-testid="factory-shape" value={shape}
            onChange={(event) => setShape(event.target.value as TargetingShape)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100"
          >
            {ABILITY_TARGETING_SHAPES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select
            data-testid="factory-surface-policy" value={surfacePolicy}
            onChange={(event) => setSurfacePolicy(event.target.value as AbilityDefinition['targeting']['surfacePolicy'])}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100"
          >
            {ABILITY_SURFACE_POLICIES.map((option) => <option key={option} value={option}>surface: {option}</option>)}
          </select>
          {numberField('range', range, setRange, 0, 60, 1)}
          {SHAPES_WITH_RADIUS.includes(shape) && numberField('radius', radius, setRadius, 0, 30, 0.5)}
          {SHAPES_WITH_ANGLE.includes(shape) && numberField('angle', angle, setAngle, 0, 6.28, 0.01)}
          {SHAPES_WITH_WIDTH.includes(shape) && numberField('width', width, setWidth, 0, 40, 0.5)}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
          <h3 className="text-[11px] font-mono text-cyan-300">TIMING</h3>
          {numberField('windup', windup, setWindup, 0, 3, 0.01)}
          {numberField('travelSpeed', travelSpeed, setTravelSpeed, 0, 80, 1)}
          {numberField('hold', hold, setHold, 0, 5, 0.05)}
          {numberField('fade', fade, setFade, 0, 5, 0.05)}
          {numberField('cooldown', cooldown, setCooldown, 0, 10, 0.1)}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-3">
          <h3 className="text-[11px] font-mono text-cyan-300">VFX MODULES</h3>
          {MODULE_SPECS.map((spec) => (
            <div key={spec.type} className="border-b border-slate-800/70 pb-2 last:border-b-0 last:pb-0">
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox" data-testid={`factory-module-${spec.type}`}
                  checked={Boolean(enabledModules[spec.type])}
                  onChange={(event) => setEnabledModules((previous) => ({ ...previous, [spec.type]: event.target.checked }))}
                  className="accent-fuchsia-500"
                />
                <span>{spec.label}</span>
              </label>

              {enabledModules[spec.type] && (
                <div className="mt-1.5 pl-5 flex flex-col gap-1.5">
                  {spec.params.map((param) => {
                    const value = moduleParams[spec.type][param.key];
                    if (param.kind === 'color') {
                      return (
                        <label key={param.key} className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{param.label}</span>
                          <input
                            type="color" data-testid={`factory-param-${spec.type}-${param.key}`}
                            value={String(value)}
                            onChange={(event) => setParam(spec.type, param.key, event.target.value)}
                            className="h-5 w-10 bg-transparent"
                          />
                        </label>
                      );
                    }
                    if (param.kind === 'enum') {
                      return (
                        <label key={param.key} className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                          <span>{param.label}</span>
                          <select
                            data-testid={`factory-param-${spec.type}-${param.key}`} value={String(value)}
                            onChange={(event) => setParam(spec.type, param.key, event.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[10px] text-slate-100"
                          >
                            {param.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      );
                    }
                    return (
                      <label key={param.key} className="block text-[10px] font-mono text-slate-400">
                        <span className="flex items-center justify-between">
                          <span>{param.label}</span>
                          <span className="text-slate-200">{value}</span>
                        </span>
                        <input
                          type="range" data-testid={`factory-param-${spec.type}-${param.key}`}
                          min={param.min} max={param.max} step={param.step} value={Number(value)}
                          onChange={(event) => setParam(spec.type, param.key, numberOrZero(event.target.value))}
                          className="mt-0.5 w-full accent-fuchsia-400 bg-slate-800 h-1 rounded cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
          <h3 className="text-[11px] font-mono text-cyan-300">FEEDBACK &amp; BUDGET</h3>
          {numberField('cameraShake', cameraShake, setCameraShake, 0, 1, 0.01)}
          {numberField('flashIntensity', flashIntensity, setFlashIntensity, 0, 1, 0.01)}
          <label className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>lightColor</span>
            <input
              type="color" data-testid="factory-light-color" value={lightColor}
              onChange={(event) => setLightColor(event.target.value)} className="h-5 w-10 bg-transparent"
            />
          </label>
          {numberField('lightRadius', lightRadius, setLightRadius, 0, 60, 1)}
          {numberField('maxParticles', maxParticles, setMaxParticles, 0, 2000, 10)}
          {numberField('dynamicLights', dynamicLights, setDynamicLights, 0, 8, 1)}
        </section>

        <section className="flex flex-col gap-2">
          <label className="text-[11px] font-mono text-slate-400">
            IMPORT JSON
            <textarea
              data-testid="factory-import-text" value={importText} rows={3}
              placeholder='{"schemaVersion":"1.1.0", ...}'
              onChange={(event) => setImportText(event.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 font-mono text-[10px] text-slate-100 resize-none"
            />
          </label>
          <button
            data-testid="factory-import" onClick={handleImport}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
          >
            <Upload className="w-3.5 h-3.5" />Import JSON
          </button>

          {exported && (
            <textarea
              data-testid="factory-export-text" readOnly value={exported} rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 font-mono text-[10px] text-emerald-200 resize-none"
            />
          )}
        </section>
      </div>

      <div className="border-t border-slate-800 p-4 flex flex-col gap-2">
        <div
          data-testid="factory-status"
          className={`flex items-start gap-1.5 text-[11px] font-mono ${status.startsWith('rejected') ? 'text-red-300' : 'text-emerald-300'}`}
        >
          {status.startsWith('rejected') ? <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 mt-px shrink-0" />}
          <span>{status}</span>
        </div>

        {issues.length > 0 && (
          <ul data-testid="factory-issues" className="max-h-24 overflow-y-auto rounded border border-red-900/60 bg-red-950/30 p-2 font-mono text-[10px] text-red-300 space-y-0.5">
            {issues.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            data-testid="factory-export" onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />Export
          </button>
          <button
            data-testid="factory-register" onClick={handleRegister}
            className="py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold"
          >
            Validate &amp; Register
          </button>
        </div>
      </div>
    </div>
  );
};
