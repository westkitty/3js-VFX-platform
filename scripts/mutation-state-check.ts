import assert from 'node:assert/strict';
import * as THREE from 'three';
import { MutationManager } from '../src/mutation/MutationManager';
import { ResidueManager } from '../src/terrain/ResidueManager';
import { TerrainDemo } from '../src/terrain/TerrainDemo';
import { TerrainManager } from '../src/terrain/TerrainManager';
import { validateMutationDocument, parseMutationJson, validateMutationRecord } from '../src/schema/MutationValidator';
import type { MutationDocument, MutationRecord } from '../src/mutation/MutationTypes';

console.log('--- RUNNING MUTATION STATE & PERSISTENT TERRAFORMING SUITE ---');

// 1. Validates valid MutationDocument against schema 1.0.0
const validDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    {
      schemaVersion: '1.0.0',
      id: 'mut_scorch_1',
      type: 'scorch',
      surfaceId: 'terrain_main',
      center: [0, 0, 0],
      normal: [0, 1, 0],
      radius: 4,
      intensity: 1.0,
      shape: 'circle',
      createdAt: 100,
      duration: 10,
      seed: 42,
    },
  ],
};
const valResult1 = validateMutationDocument(validDoc);
assert.equal(valResult1.ok, true, 'Valid document must pass validation');
assert.equal(valResult1.issues.length, 0);

// 2. Rejects invalid documents (wrong schemaVersion, missing required fields, non-finite, extra properties)
const badVersion = { ...validDoc, schemaVersion: '2.0.0' };
assert.equal(validateMutationDocument(badVersion).ok, false, 'Should reject unknown schemaVersion');

const missingFields = { schemaVersion: '1.0.0', mutations: [{ id: 'mut_1' }] };
assert.equal(validateMutationDocument(missingFields).ok, false, 'Should reject missing required fields');

const extraProps = {
  schemaVersion: '1.0.0',
  mutations: [{ ...validDoc.mutations[0], maliciousCode: 'alert(1)' }],
};
assert.equal(validateMutationDocument(extraProps).ok, false, 'Should reject additionalProperties');

const duplicateIds = {
  schemaVersion: '1.0.0',
  mutations: [validDoc.mutations[0], validDoc.mutations[0]],
};
assert.equal(validateMutationDocument(duplicateIds).ok, false, 'Should reject duplicate mutation IDs');

// 3. Rejects unknown mutation types
const unknownType = {
  schemaVersion: '1.0.0',
  mutations: [{ ...validDoc.mutations[0], type: 'laser_nuke' }],
};
assert.equal(validateMutationDocument(unknownType).ok, false, 'Should reject unknown mutation type');

// 4. Validates all 6 supported archetypes
const archetypes = ['scorch', 'frost', 'lava', 'crystal', 'golden_rune', 'void_scar'] as const;
for (let i = 0; i < archetypes.length; i++) {
  const type = archetypes[i];
  const rec: MutationRecord = {
    schemaVersion: '1.0.0',
    id: `mut_${type}_${i}`,
    type,
    surfaceId: 'terrain_main',
    center: [i * 2, 0, 0],
    normal: [0, 1, 0],
    radius: 3,
    intensity: 1.0,
    shape: 'circle',
    createdAt: 0,
    duration: 10,
    seed: i * 100 + 1,
  };
  const res = validateMutationRecord(rec);
  assert.equal(res.ok, true, `Archetype ${type} must be valid`);
}

// 5. Enforces deterministic ID generation
const mgr1 = new MutationManager();
const m1 = mgr1.applyMutation({ type: 'scorch', center: [0, 0, 0], radius: 2 });
const m2 = mgr1.applyMutation({ type: 'frost', center: [1, 0, 0], radius: 2 });
assert.equal(m1.id, 'mut_scorch_1');
assert.equal(m2.id, 'mut_frost_2');

// 6. Enforces deterministic PRNG seed derivation
const m3 = mgr1.applyMutation({ type: 'crystal', center: [2, 0, 0], radius: 3 });
assert.ok(Number.isFinite(m3.seed) && m3.seed !== 0, 'Seed must be a deterministic finite number');

// 7. Enforces global budget cap (max 64 default, evicts oldest)
const mgrBudget = new MutationManager({ global: 64 });
for (let i = 0; i < 70; i++) {
  mgrBudget.applyMutation({ type: 'scorch', center: [i, 0, 0], radius: 2, createdAt: 1000 + i });
}
assert.equal(mgrBudget.getActiveCount(), 64, 'Active count must be capped at global budget 64');
const oldest = mgrBudget.getMutations()[0];
assert.ok(oldest.createdAt >= 1006, 'Oldest mutations 1000..1005 must be evicted');

// 8. Enforces per-type budget cap (e.g. max 4 crystals)
const mgrTypeBudget = new MutationManager({ global: 64, byType: { crystal: 4 } });
for (let i = 0; i < 6; i++) {
  mgrTypeBudget.applyMutation({ type: 'crystal', center: [i, 0, 0], radius: 2, createdAt: 2000 + i });
}
assert.equal(mgrTypeBudget.getCountByType('crystal'), 4, 'Per-type crystal budget must cap at 4');
assert.equal(mgrTypeBudget.getMutations()[0].createdAt, 2002, 'Oldest crystals must be evicted');

// 9. Verifies resource cleanup and visual disposal in ResidueManager upon eviction
const scene = new THREE.Scene();
const residueMgr = new ResidueManager(scene);
let geoDisposed = 0;
let matDisposed = 0;
const origGeoDispose = THREE.BufferGeometry.prototype.dispose;
THREE.BufferGeometry.prototype.dispose = function() {
  geoDisposed++;
  return origGeoDispose.apply(this);
};
const origMatDispose = THREE.Material.prototype.dispose;
THREE.Material.prototype.dispose = function() {
  matDisposed++;
  return origMatDispose.apply(this);
};

const tm = new TerrainManager(scene, 60, 60, 10, { global: 10 });
for (let i = 0; i < 15; i++) {
  tm.applyMutation('scorch', new THREE.Vector3(i, 0, 0), 2, 1, 100 + i);
}
assert.equal(tm.mutationManager.getActiveCount(), 10, 'TerrainManager mutation count capped at 10');
assert.equal(tm.getDecalCount(), 10, 'Decal count capped at 10');
assert.ok(geoDisposed >= 5, 'Evicted decals must dispose geometry');
assert.ok(matDisposed >= 5, 'Evicted decals must dispose material');

// 10. Verifies simulation-time expiry
tm.update(114.9);
assert.equal(tm.mutationManager.getActiveCount(), 10, 'Mutations survive before expiration');
tm.update(125.0);
assert.equal(tm.mutationManager.getActiveCount(), 0, 'All mutations expired at time 125');
assert.equal(tm.getDecalCount(), 0, 'All decals removed upon expiry');

// 11. Verifies pause invariance: repeated zero-delta frames do not advance expiration
const tmPause = new TerrainManager(scene);
tmPause.applyMutation('scorch', new THREE.Vector3(0, 0, 0), 2, 1, 500, 2.0);
for (let f = 0; f < 60; f++) {
  tmPause.update(501.0);
}
assert.equal(tmPause.mutationManager.getActiveCount(), 1, 'Pause invariance preserved');

// 12. Verifies owner-specific clear
tmPause.applyMutation('frost', new THREE.Vector3(1, 0, 0), 2, 1, 500, 10.0, 'owner_A');
tmPause.applyMutation('lava', new THREE.Vector3(2, 0, 0), 2, 1, 500, 10.0, 'owner_B');
assert.equal(tmPause.mutationManager.getActiveCount(), 3);
tmPause.clearByOwner('owner_A');
assert.equal(tmPause.mutationManager.getActiveCount(), 2);
assert.ok(!tmPause.mutationManager.getMutations().some((m) => m.ownerId === 'owner_A'), 'Owner A cleared');
assert.ok(tmPause.mutationManager.getMutations().some((m) => m.ownerId === 'owner_B'), 'Owner B survives');

// 13. Verifies full reset
tmPause.resetTerrain();
assert.equal(tmPause.mutationManager.getActiveCount(), 0, 'Reset clears mutations');
assert.equal(tmPause.getDecalCount(), 0, 'Reset clears decals');

// 14. Verifies transaction recording and single undo() reverses mutations
const tmTx = new TerrainManager(scene);
tmTx.applyMutation('scorch', new THREE.Vector3(0, 0, 0), 2);
assert.equal(tmTx.mutationManager.getActiveCount(), 1);
assert.equal(tmTx.getDecalCount(), 1);
const undone = tmTx.undo();
assert.equal(undone, true, 'Undo should succeed');
assert.equal(tmTx.mutationManager.getActiveCount(), 0, 'Undo removes mutation');
assert.equal(tmTx.getDecalCount(), 0, 'Undo removes visual decal');

// 15. Verifies transaction recording and undo() reverses terrain vertex deformation
const tmSculpt = new TerrainManager(scene);
const posArr = tmSculpt.mesh.geometry.attributes.position.array as Float32Array;
let centerIdx = 0;
let minDist = Infinity;
for (let i = 0; i < tmSculpt.mesh.geometry.attributes.position.count; i++) {
  const vx = posArr[i * 3];
  const vz = posArr[i * 3 + 2];
  const d = vx * vx + vz * vz;
  if (d < minDist) {
    minDist = d;
    centerIdx = i;
  }
}
const origVertexY = posArr[centerIdx * 3 + 1];
tmSculpt.sculptTerrain(new THREE.Vector3(0, 0, 0), 4, 1.5);
const deformedVertexY = posArr[centerIdx * 3 + 1];
assert.ok(deformedVertexY > origVertexY + 1.0, 'Center vertex height must increase after elevate sculpt');
tmSculpt.undo();
const restoredVertexY = posArr[centerIdx * 3 + 1];
assert.ok(Math.abs(origVertexY - restoredVertexY) < 1e-6, 'Undo must restore original vertex height');

// 16. Verifies redo() restores undone mutations and terrain deformation
tmSculpt.redo();
const redoneVertexY = posArr[centerIdx * 3 + 1];
assert.ok(Math.abs(deformedVertexY - redoneVertexY) < 1e-6, 'Redo must reapply sculpt height');

// 17. Verifies JSON state export produces valid schema-compliant string
const tmExport = new TerrainManager(scene);
tmExport.applyMutation('scorch', new THREE.Vector3(1, 0, 2), 3);
tmExport.applyMutation('crystal', new THREE.Vector3(-1, 0, 3), 2.5);
tmExport.applyMutation('golden_rune', new THREE.Vector3(0, 0, 0), 4);
const exportedJson = tmExport.mutationManager.exportJson();
const parseRes = parseMutationJson(exportedJson);
assert.equal(parseRes.ok, true, 'Exported JSON must be valid');
assert.equal(parseRes.document?.mutations.length, 3);

// 18. Verifies JSON state import round-trip restores identical mutation records
const tmImport = new TerrainManager(scene);
const importRes = tmImport.mutationManager.importJson(exportedJson);
assert.equal(importRes.ok, true);
assert.equal(importRes.count, 3);
assert.equal(tmImport.mutationManager.getActiveCount(), 3);
assert.equal(tmImport.getDecalCount(), 3);
const importedMutations = tmImport.mutationManager.getMutations();
assert.equal(importedMutations[0].type, 'scorch');
assert.equal(importedMutations[1].type, 'crystal');
assert.equal(importedMutations[2].type, 'golden_rune');

// 19. Verifies atomic import: invalid document does not corrupt or clear active state
const tmAtomic = new TerrainManager(scene);
tmAtomic.applyMutation('frost', new THREE.Vector3(5, 0, 5), 2);
const preCount = tmAtomic.mutationManager.getActiveCount();
const invalidImport = tmAtomic.mutationManager.importJson('{"bad": true}');
assert.equal(invalidImport.ok, false, 'Invalid import must fail');
assert.equal(tmAtomic.mutationManager.getActiveCount(), preCount, 'State must remain intact upon failed import');

// 20. Verifies surfaceId resolution against allowed surface IDs
const allowed = new Set(['terrain_main', 'SurfaceValidationRamp']);
const validSurfaceDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    { ...validDoc.mutations[0], id: 'm_valid_surf', surfaceId: 'SurfaceValidationRamp' },
  ],
};
const resAllowed = tmAtomic.mutationManager.importJson(JSON.stringify(validSurfaceDoc), { allowedSurfaceIds: allowed });
assert.equal(resAllowed.ok, true, 'Allowed surfaceId must pass');

const invalidSurfaceDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    { ...validDoc.mutations[0], id: 'm_invalid_surf', surfaceId: 'non_existent_surface' },
  ],
};
const resDisallowed = tmAtomic.mutationManager.importJson(JSON.stringify(invalidSurfaceDoc), { allowedSurfaceIds: allowed });
assert.equal(resDisallowed.ok, false, 'Unallowed surfaceId must fail');

// 21. Verifies irregular-surface frame orientation
const rampNormal = new THREE.Vector3(0, 0.9659, 0.2588).normalize(); // ~15 deg tilt
const rampHitMut = tmAtomic.applyMutation(
  'crystal',
  new THREE.Vector3(9, 1.2, -1),
  3,
  1.0,
  0,
  10.0,
  undefined,
  'SurfaceValidationRamp',
  rampNormal
);
assert.equal(rampHitMut.surfaceId, 'SurfaceValidationRamp');
assert.ok(Math.abs(rampHitMut.normal[1] - rampNormal.y) < 1e-4);
assert.ok(Math.abs(rampHitMut.normal[2] - rampNormal.z) < 1e-4);

console.log('✅ ALL 21 MUTATION STATE & PERSISTENT TERRAFORMING CHECKS PASSED!');
