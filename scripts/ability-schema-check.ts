/**
 * Phase 4 checks for the declarative ability schema, validation, migration,
 * registry policy, and the data-only ability pack.
 *
 * Pure/dependency-resolved: no WebGLRenderer and no DOM.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AbilityRegistry } from '../src/abilities/AbilityRegistry';
import { DECLARATIVE_ABILITY_PACK } from '../src/abilities/declarative';
import { BUILTIN_ABILITIES } from '../src/abilities/builtins';
import {
  parseAbilityJson,
  toAbilityDocument,
  validateAbilityDefinition,
  validateAbilityDocument,
} from '../src/schema/AbilityValidator';
import { ABILITY_SCHEMA_CURRENT_VERSION } from '../src/schema/AbilitySchema';
import { AbilityDefinition } from '../src/types';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function validDefinition(overrides: Partial<AbilityDefinition> = {}): AbilityDefinition {
  return {
    id: 'check_valid_ability',
    name: 'Check Valid Ability',
    school: 'starsilk',
    description: 'A minimal valid ability used by the schema checks.',
    iconName: 'Sparkles',
    targeting: { shape: 'line', range: 20, surfacePolicy: 'project' },
    timing: { windup: 0.1, travelSpeed: 18, hold: 0.5, fade: 0.4, cooldown: 1 },
    modules: [
      { type: 'ribbon', params: { width: 0.7, colorCore: '#ffffff', colorGlow: '#55ccff', noiseAmp: 0.2 } },
      { type: 'particles', params: { count: 140, speed: 4, size: 1, color: '#aaddff' } },
    ],
    feedback: { cameraShake: 0.1, flashIntensity: 0.2, lightColor: '#66ccff', lightRadius: 14 },
    budget: { maxParticles: 220, dynamicLights: 1 },
    ...overrides,
  };
}

function checkValidDefinitionAccepted() {
  const result = validateAbilityDefinition(validDefinition());
  assert.equal(result.ok, true, 'a well-formed definition must validate');
  assert.ok(result.ok && result.definition.id === 'check_valid_ability');

  for (const builtin of BUILTIN_ABILITIES) {
    const builtinResult = validateAbilityDefinition(builtin);
    assert.equal(builtinResult.ok, true, `builtin ${builtin.id} must remain valid`);
  }
}

function checkMalformedRejected() {
  const cases: Array<[string, unknown]> = [
    ['not an object', 42],
    ['null', null],
    ['array', []],
    ['missing name', { ...validDefinition(), name: undefined }],
    ['empty modules', validDefinition({ modules: [] })],
    ['unknown school', { ...validDefinition(), school: 'chronomancy' }],
    ['unknown targeting shape', { ...validDefinition(), targeting: { shape: 'spiral', range: 10, surfacePolicy: 'project' } }],
    ['negative windup', validDefinition({ timing: { windup: -1, travelSpeed: 1, hold: 1, fade: 1, cooldown: 1 } })],
    ['bad colour', validDefinition({ feedback: { cameraShake: 0.1, flashIntensity: 0.2, lightColor: 'red', lightRadius: 14 } })],
    ['non-integer particle budget', validDefinition({ budget: { maxParticles: 12.5, dynamicLights: 1 } })],
    ['id with punctuation', { ...validDefinition(), id: 'bad id!' }],
  ];

  for (const [label, value] of cases) {
    const result = validateAbilityDefinition(value);
    assert.equal(result.ok, false, `malformed case "${label}" must be rejected`);
    assert.ok(!result.ok && result.issues.length > 0, `case "${label}" must report structured issues`);
  }
}

/** JSON must never be able to carry executable payloads or extra channels. */
function checkCodeInjectionRejected() {
  const cases: Array<[string, unknown]> = [
    ['extra top-level property', { ...validDefinition(), onCast: 'alert(1)' }],
    ['function-valued field', { ...validDefinition(), description: undefined, onImpact: '() => fetch("http://x")' }],
    ['unknown module param', validDefinition({ modules: [{ type: 'orb', params: { radius: 1, shaderSource: 'void main(){}' } }] })],
    ['module import specifier', validDefinition({ modules: [{ type: 'orb', params: { radius: 1 }, preset: '../../evil.js' }] })],
    ['url in colour field', validDefinition({ modules: [{ type: 'orb', params: { radius: 1, colorCore: 'https://example.com/x.png' } }] })],
    ['unknown module type', validDefinition({ modules: [{ type: 'script', params: {} } as never] })],
  ];

  for (const [label, value] of cases) {
    const result = validateAbilityDefinition(value);
    assert.equal(result.ok, false, `injection case "${label}" must be rejected`);
  }
}

function checkUnsupportedVersionRejected() {
  const future = { ...toAbilityDocument(validDefinition()), schemaVersion: '2.0.0' };
  const result = validateAbilityDocument(future);
  assert.equal(result.ok, false, 'a future schema version must fail');
  assert.ok(!result.ok && result.issues[0].keyword === 'unsupportedVersion');
  assert.ok(!result.ok && result.issues[0].message.includes('2.0.0'));

  const missing = { ...validDefinition() } as Record<string, unknown>;
  const missingResult = validateAbilityDocument(missing);
  assert.equal(missingResult.ok, false, 'a document without schemaVersion must fail');
}

function checkLegacyMigration() {
  const legacy = {
    schemaVersion: '1.0.0',
    id: 'legacy_ability',
    name: 'Legacy Ability',
    school: 'cryomancy',
    description: 'A 1.0.0 document that must migrate forward.',
    targeting: { shape: 'line', range: 15, surfacePolicy: 'project' },
    timing: { windup: 0.2, travelSpeed: 12, hold: 0.4, fade: 0.3, cooldown: 1 },
    modules: [{ type: 'particles', params: { count: 200, speed: 5, size: 1, color: '#aaeeff' } }],
    feedback: { shake: 0.3, flash: 0.4, lightColor: '#00ddff', lightRadius: 12 },
  };

  const result = validateAbilityDocument(legacy);
  assert.equal(result.ok, true, '1.0.0 documents must migrate, not fail');
  assert.ok(result.ok);
  assert.equal(result.migratedFrom, '1.0.0');
  assert.equal(result.document.schemaVersion, ABILITY_SCHEMA_CURRENT_VERSION);

  // Renamed feedback fields carried across.
  assert.equal(result.definition.feedback.cameraShake, 0.3);
  assert.equal(result.definition.feedback.flashIntensity, 0.4);
  // Defaults introduced by 1.1.0 are filled explicitly, not guessed at use time.
  assert.equal(result.definition.iconName, 'Sparkles');
  assert.equal(result.definition.budget.maxParticles, 300);
  assert.equal(result.definition.budget.dynamicLights, 1);

  // A 1.0.0 document that is malformed for its own version still fails.
  const badLegacy = { ...legacy, feedback: { shake: 0.3, flash: 0.4, lightColor: 'blue', lightRadius: 12 } };
  assert.equal(validateAbilityDocument(badLegacy).ok, false);
}

function checkInvalidModuleConfiguration() {
  const cases: Array<[string, unknown]> = [
    ['particle count out of range', validDefinition({ modules: [{ type: 'particles', params: { count: 99999, speed: 4, size: 1, color: '#ffffff' } }] })],
    ['fractional particle count', validDefinition({ modules: [{ type: 'particles', params: { count: 10.5, speed: 4, size: 1, color: '#ffffff' } }] })],
    ['decal without type', validDefinition({ modules: [{ type: 'decal', params: { radius: 3 } }] })],
    ['unknown decal type', validDefinition({ modules: [{ type: 'decal', params: { decalType: 'plasma', radius: 3 } }] })],
    ['orb radius zero', validDefinition({ modules: [{ type: 'orb', params: { radius: 0 } }] })],
    ['ribbon opacity above one', validDefinition({ modules: [{ type: 'ribbon', params: { width: 1, opacity: 4 } }] })],
    ['missing params object', validDefinition({ modules: [{ type: 'orb' } as never] })],
  ];

  for (const [label, value] of cases) {
    assert.equal(validateAbilityDefinition(value).ok, false, `module case "${label}" must be rejected`);
  }

  // Negative particle speed stays legal: it is how inward pull is expressed.
  assert.equal(
    validateAbilityDefinition(validDefinition({ modules: [{ type: 'particles', params: { count: 100, speed: -6, size: 1, color: '#ffffff' } }] })).ok,
    true,
    'negative particle speed must remain valid',
  );
}

function checkRoundTrip() {
  const registry = new AbilityRegistry();
  const definition = validDefinition({ id: 'round_trip_ability' });

  assert.equal(registry.register(definition).ok, true);

  const exported = registry.exportAbilityJson('round_trip_ability');
  assert.ok(exported, 'export must produce JSON');

  const parsed = JSON.parse(exported);
  assert.equal(parsed.schemaVersion, ABILITY_SCHEMA_CURRENT_VERSION, 'export must be schema-conforming');

  // Re-importing the exported document must validate and reproduce the definition.
  const reparsed = parseAbilityJson(exported);
  assert.equal(reparsed.ok, true);
  assert.ok(reparsed.ok && reparsed.results[0].ok);

  const fresh = new AbilityRegistry();
  const importResult = fresh.importJson(exported);
  assert.equal(importResult.ok, true, 'round-trip import must succeed');
  assert.deepEqual(importResult.registered, ['round_trip_ability']);
  assert.deepEqual(fresh.get('round_trip_ability'), definition, 'round trip must preserve the definition');

  // Whole-registry export round-trips too.
  const all = registry.exportJson();
  const allImport = new AbilityRegistry().importJson(all, { duplicates: 'replace' });
  assert.equal(allImport.ok, true, 'full registry export must re-import');
}

function checkDuplicatePolicy() {
  const registry = new AbilityRegistry();
  const definition = validDefinition({ id: 'dup_ability' });

  assert.equal(registry.register(definition).ok, true);

  const rejected = registry.register(definition);
  assert.equal(rejected.ok, false, 'default duplicate policy must reject');
  assert.equal(rejected.issues[0].keyword, 'duplicateId');

  const replaced = registry.register(validDefinition({ id: 'dup_ability', name: 'Replaced' }), { duplicates: 'replace' });
  assert.equal(replaced.ok, true, 'explicit replace policy must succeed');
  assert.equal(replaced.replaced, true);
  assert.equal(registry.get('dup_ability')?.name, 'Replaced');

  // Duplicates inside a single import batch are rejected.
  const batch = JSON.stringify([toAbilityDocument(validDefinition({ id: 'batch_dup' })), toAbilityDocument(validDefinition({ id: 'batch_dup' }))]);
  const batchResult = registry.importJson(batch);
  assert.equal(batchResult.ok, false, 'duplicate ids inside one import must be rejected');
  assert.equal(registry.has('batch_dup'), false, 'a rejected batch must register nothing');
}

/** A failed import must leave the registry untouched. */
function checkImportIsAtomic() {
  const registry = new AbilityRegistry();
  const good = toAbilityDocument(validDefinition({ id: 'atomic_good' }));
  const bad = { ...toAbilityDocument(validDefinition({ id: 'atomic_bad' })), school: 'chronomancy' };

  const result = registry.importJson(JSON.stringify([good, bad]));
  assert.equal(result.ok, false);
  assert.equal(registry.has('atomic_good'), false, 'no partial registration is allowed');
  assert.equal(result.rejected.length, 1);
  assert.equal(result.rejected[0].index, 1);

  assert.equal(registry.importJson('{ not json').ok, false, 'invalid JSON must be rejected safely');
}

function checkDeclarativePack() {
  assert.ok(DECLARATIVE_ABILITY_PACK.length >= 10, 'at least ten declarative abilities are required');

  const ids = new Set<string>();
  for (const document of DECLARATIVE_ABILITY_PACK) {
    const result = validateAbilityDocument(document);
    const id = (document as { id?: string }).id ?? '(unknown)';
    assert.equal(result.ok, true, `declarative ability ${id} must validate: ${!result.ok ? JSON.stringify(result.issues) : ''}`);
    assert.ok(result.ok && !ids.has(result.definition.id), `declarative ability ids must be unique (${id})`);
    if (result.ok) ids.add(result.definition.id);
  }

  const registry = new AbilityRegistry();
  assert.deepEqual(registry.getLoadIssues(), [], 'shipped abilities must load without issues');
  for (const id of ids) {
    assert.ok(registry.has(id), `registry must expose declarative ability ${id}`);
  }
  assert.equal(registry.getAll().length, BUILTIN_ABILITIES.length + DECLARATIVE_ABILITY_PACK.length);
}

/**
 * The data-only claim: no shipped declarative ability id may appear in App,
 * input, HUD, renderer, factory, or VFX runtime source.
 */
function checkNoAbilitySpecificBranching() {
  const declarativeIds = DECLARATIVE_ABILITY_PACK.map((document) => (document as { id: string }).id);

  const scanned: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // The pack itself and the sequence pack are data, not branching logic.
        if (full.includes(path.join('abilities', 'declarative'))) continue;
        if (full.includes(path.join('sequence', 'builtins'))) continue;
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      scanned.push(full);
    }
  };
  walk(path.join(root, 'src'));

  for (const file of scanned) {
    const text = fs.readFileSync(file, 'utf8');
    for (const id of declarativeIds) {
      assert.ok(
        !text.includes(id),
        `${path.relative(root, file)} references declarative ability id "${id}"; abilities must stay data-only`,
      );
    }
  }
  assert.ok(scanned.length > 0, 'source scan must actually read files');
}

checkValidDefinitionAccepted();
checkMalformedRejected();
checkCodeInjectionRejected();
checkUnsupportedVersionRejected();
checkLegacyMigration();
checkInvalidModuleConfiguration();
checkRoundTrip();
checkDuplicatePolicy();
checkImportIsAtomic();
checkDeclarativePack();
checkNoAbilitySpecificBranching();

console.log('Ability schema checks: PASS (validation, injection rejection, migration, round-trip, duplicate policy, atomic import, 10 data-only abilities)');
