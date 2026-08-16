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

// 14. [Requirement A] Verifies single mutation undo() and redo() with complete record & visual restoration
const tmTx = new TerrainManager(scene);
const createdMut = tmTx.applyMutation('scorch', new THREE.Vector3(1, 0, 2), 2.5, 1.0, 100, 15.0);
const origId = createdMut.id;
const origSeed = createdMut.seed;
assert.equal(tmTx.mutationManager.getActiveCount(), 1);
assert.equal(tmTx.getDecalCount(), 1);

// Undo
const undone = tmTx.undo();
assert.equal(undone, true, 'Undo should succeed');
assert.equal(tmTx.mutationManager.getActiveCount(), 0, 'Undo removes mutation from state');
assert.equal(tmTx.mutationManager.getMutation(origId), undefined, 'Undone mutation must not exist in Map');
assert.equal(tmTx.getDecalCount(), 0, 'Undo removes visual decal');

// Redo
const redone = tmTx.redo();
assert.equal(redone, true, 'Redo should succeed');
assert.equal(tmTx.mutationManager.getActiveCount(), 1, 'Redo restores mutation to state');
assert.equal(tmTx.getDecalCount(), 1, 'Redo restores visual decal');
const restoredMut = tmTx.mutationManager.getMutation(origId);
assert.ok(restoredMut, 'Restored mutation must exist in Map');
assert.equal(restoredMut.id, origId, 'Redo must preserve exact original ID');
assert.equal(restoredMut.seed, origSeed, 'Redo must preserve exact original PRNG seed');
assert.equal(restoredMut.type, 'scorch');
assert.equal(restoredMut.surfaceId, 'terrain_main');
assert.deepEqual(restoredMut.center, [1, 0, 2]);
assert.equal(restoredMut.radius, 2.5);
assert.equal(restoredMut.duration, 15.0);
assert.equal(restoredMut.createdAt, 100);

// 15. [Requirement B] Verifies grouped mutation transaction undo and redo in original order
const tmGroup = new TerrainManager(scene);
const groupTxId = tmGroup.mutationManager.beginTransaction();
const gMut1 = tmGroup.applyMutation('frost', new THREE.Vector3(-2, 0, 0), 2.0);
const gMut2 = tmGroup.applyMutation('crystal', new THREE.Vector3(2, 0, 0), 3.0);
const committed = tmGroup.mutationManager.commitTransaction();
assert.ok(committed, 'Group transaction must commit');
assert.equal(tmGroup.mutationManager.getActiveCount(), 2);
assert.equal(tmGroup.getDecalCount(), 2);

// Undo grouped transaction
tmGroup.undo();
assert.equal(tmGroup.mutationManager.getActiveCount(), 0, 'Grouped undo must remove all added mutations');
assert.equal(tmGroup.getDecalCount(), 0, 'Grouped undo must remove all visual decals');

// Redo grouped transaction
tmGroup.redo();
assert.equal(tmGroup.mutationManager.getActiveCount(), 2, 'Grouped redo must restore all added mutations');
assert.equal(tmGroup.getDecalCount(), 2, 'Grouped redo must restore all visual decals');
const orderedIds = tmGroup.mutationManager.getMutations().map((m) => m.id);
assert.deepEqual(orderedIds, [gMut1.id, gMut2.id], 'Grouped redo must restore mutations in deterministic original order');
assert.equal(tmGroup.mutationManager.getMutation(gMut1.id)?.seed, gMut1.seed);
assert.equal(tmGroup.mutationManager.getMutation(gMut2.id)?.seed, gMut2.seed);

// 16. [Requirement C] Verifies mutation removal transaction undo and redo symmetry
const tmRemove = new TerrainManager(scene);
const stableMut = tmRemove.applyMutation('lava', new THREE.Vector3(0, 0, 0), 3.0);
assert.equal(tmRemove.mutationManager.getActiveCount(), 1);

// Begin transaction and remove
tmRemove.mutationManager.beginTransaction();
tmRemove.mutationManager.removeMutation(stableMut.id);
tmRemove.mutationManager.commitTransaction();
assert.equal(tmRemove.mutationManager.getActiveCount(), 0, 'Mutation must be removed');
assert.equal(tmRemove.getDecalCount(), 0, 'Decal must be removed');

// Undo removal -> restores mutation
tmRemove.undo();
assert.equal(tmRemove.mutationManager.getActiveCount(), 1, 'Undo removal restores mutation');
assert.equal(tmRemove.getDecalCount(), 1, 'Undo removal restores visual decal');
assert.equal(tmRemove.mutationManager.getMutation(stableMut.id)?.id, stableMut.id);

// Redo removal -> removes mutation again
tmRemove.redo();
assert.equal(tmRemove.mutationManager.getActiveCount(), 0, 'Redo removal removes mutation again');
assert.equal(tmRemove.getDecalCount(), 0, 'Redo removal removes visual decal again');

// 17. [Requirement D] Verifies transaction recording and undo/redo of terrain vertex deformation
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
tmSculpt.redo();
const redoneVertexY = posArr[centerIdx * 3 + 1];
assert.ok(Math.abs(deformedVertexY - redoneVertexY) < 1e-6, 'Redo must reapply sculpt height');

// 18. [Requirement E] Verifies import -> new mutation ID continues beyond imported generated numeric suffixes
const tmImportId = new MutationManager();
const docWithHighIds: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    {
      schemaVersion: '1.0.0',
      id: 'mut_scorch_1',
      type: 'scorch',
      surfaceId: 'terrain_main',
      center: [0, 0, 0],
      normal: [0, 1, 0],
      radius: 3,
      intensity: 1.0,
      shape: 'circle',
      createdAt: 0,
      duration: 10,
      seed: 101,
      transactionId: 'tx_12',
    },
    {
      schemaVersion: '1.0.0',
      id: 'mut_crystal_27',
      type: 'crystal',
      surfaceId: 'terrain_main',
      center: [5, 0, 5],
      normal: [0, 1, 0],
      radius: 2,
      intensity: 1.0,
      shape: 'circle',
      createdAt: 0,
      duration: 10,
      seed: 202,
      transactionId: 'tx_terrain_41',
    },
  ],
};
const resHighImport = tmImportId.importJson(JSON.stringify(docWithHighIds));
assert.equal(resHighImport.ok, true, 'Import with high IDs must succeed');
assert.equal(tmImportId.getActiveCount(), 2);
assert.equal(tmImportId.getIdCounter(), 27, 'idCounter must be reconciled to 27');
assert.equal(tmImportId.getTransactionCounter(), 41, 'transactionCounter must be reconciled to 41');

// Create new mutation after import
const newMutAfterImport = tmImportId.applyMutation({ type: 'scorch', center: [10, 0, 10], radius: 2 });
assert.equal(newMutAfterImport.id, 'mut_scorch_28', 'New mutation ID must continue strictly beyond imported max (28 > 27)');
assert.equal(tmImportId.getActiveCount(), 3, 'Active count must increase to 3');
assert.equal(tmImportId.getMutation('mut_scorch_1')?.id, 'mut_scorch_1', 'Imported mut_scorch_1 must remain intact');
assert.equal(tmImportId.getMutation('mut_crystal_27')?.id, 'mut_crystal_27', 'Imported mut_crystal_27 must remain intact');

// 19. [Requirement F] Verifies import -> new transaction ID continues beyond imported transaction suffixes
assert.equal(newMutAfterImport.transactionId, 'tx_42', 'applyMutation auto-transaction must be tx_42 (> 41)');
const newTxId = tmImportId.beginTransaction();
assert.equal(newTxId, 'tx_43', 'Subsequent beginTransaction must be tx_43 (> 41)');
tmImportId.commitTransaction();

// 20. [Requirement G] Verifies merge import (clearExisting: false) uniqueness and counter reconciliation
const tmMerge = new MutationManager();
const initialMut1 = tmMerge.applyMutation({ type: 'scorch', center: [0, 0, 0], radius: 2 }); // mut_scorch_1
const initialMut2 = tmMerge.applyMutation({ type: 'frost', center: [1, 0, 0], radius: 2 }); // mut_frost_2
assert.equal(initialMut1.id, 'mut_scorch_1');
assert.equal(initialMut2.id, 'mut_frost_2');

const mergeDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    {
      schemaVersion: '1.0.0',
      id: 'mut_void_scar_50',
      type: 'void_scar',
      surfaceId: 'terrain_main',
      center: [20, 0, 20],
      normal: [0, 1, 0],
      radius: 4,
      intensity: 1.0,
      shape: 'circle',
      createdAt: 10,
      duration: 20,
      seed: 555,
      transactionId: 'tx_80',
    },
  ],
};
const resMerge = tmMerge.importJson(JSON.stringify(mergeDoc), { clearExisting: false });
assert.equal(resMerge.ok, true, 'Merge import must succeed');
assert.equal(tmMerge.getActiveCount(), 3, 'Merge import must preserve existing and add imported records');
assert.equal(tmMerge.getIdCounter(), 50, 'Merge import must update idCounter to max (50)');
assert.equal(tmMerge.getTransactionCounter(), 80, 'Merge import must update transactionCounter to max (80)');

const postMergeMut = tmMerge.applyMutation({ type: 'lava', center: [30, 0, 30], radius: 3 });
assert.equal(postMergeMut.id, 'mut_lava_51', 'Post-merge mutation ID must be 51');
assert.equal(tmMerge.getActiveCount(), 4);

// 21. [Requirement H] Verifies failed import counter atomicity
const preFailIdCounter = tmMerge.getIdCounter();
const preFailTxCounter = tmMerge.getTransactionCounter();
const preFailActiveCount = tmMerge.getActiveCount();

const badImportJson = JSON.stringify({
  schemaVersion: '1.0.0',
  mutations: [
    {
      schemaVersion: '1.0.0',
      id: 'mut_scorch_9999',
      type: 'unknown_invalid_type', // Invalid type causes validation failure
      surfaceId: 'terrain_main',
      center: [0, 0, 0],
      normal: [0, 1, 0],
      radius: 2,
      intensity: 1,
      shape: 'circle',
      createdAt: 0,
      duration: 10,
      seed: 9999,
      transactionId: 'tx_9999',
    },
  ],
});
const failImportRes = tmMerge.importJson(badImportJson);
assert.equal(failImportRes.ok, false, 'Bad import must fail');
assert.equal(tmMerge.getIdCounter(), preFailIdCounter, 'Failed import must not advance idCounter');
assert.equal(tmMerge.getTransactionCounter(), preFailTxCounter, 'Failed import must not advance transactionCounter');
assert.equal(tmMerge.getActiveCount(), preFailActiveCount, 'Failed import must not change active count');

const postFailMut = tmMerge.applyMutation({ type: 'crystal', center: [40, 0, 40], radius: 2 });
assert.equal(postFailMut.id, 'mut_crystal_52', 'Post-fail mutation ID must continue from 51 -> 52, not 9999');

// 22. [Requirement I] Verifies ordering and Map integrity across import, creation, undo, redo
const tmIntegrity = new TerrainManager(scene);
const exportDoc = tmMerge.exportDocument();
tmIntegrity.mutationManager.importJson(JSON.stringify(exportDoc));
const mBeforeUndo = tmIntegrity.applyMutation('golden_rune', new THREE.Vector3(50, 0, 50), 3);
const countBefore = tmIntegrity.mutationManager.getActiveCount();
const orderBefore = tmIntegrity.mutationManager.getMutations().map((m) => m.id);

tmIntegrity.undo();
const countAfterUndo = tmIntegrity.mutationManager.getActiveCount();
const orderAfterUndo = tmIntegrity.mutationManager.getMutations().map((m) => m.id);
assert.equal(countAfterUndo, countBefore - 1);
assert.equal(orderAfterUndo.includes(mBeforeUndo.id), false, 'Undone ID must not be in ordered list');

tmIntegrity.redo();
const countAfterRedo = tmIntegrity.mutationManager.getActiveCount();
const orderAfterRedo = tmIntegrity.mutationManager.getMutations().map((m) => m.id);
assert.equal(countAfterRedo, countBefore);
assert.deepEqual(orderAfterRedo, orderBefore, 'Redo must restore exact order');
assert.equal(new Set(orderAfterRedo).size, orderAfterRedo.length, 'No duplicates in ordered list');
assert.equal(tmIntegrity.mutationManager.getActiveCount(), orderAfterRedo.length, 'Active count matches order length');

// 23. Verifies JSON state export produces valid schema-compliant string
const tmExport = new TerrainManager(scene);
tmExport.applyMutation('scorch', new THREE.Vector3(1, 0, 2), 3);
tmExport.applyMutation('crystal', new THREE.Vector3(-1, 0, 3), 2.5);
tmExport.applyMutation('golden_rune', new THREE.Vector3(0, 0, 0), 4);
const exportedJson = tmExport.mutationManager.exportJson();
const parseRes = parseMutationJson(exportedJson);
assert.equal(parseRes.ok, true, 'Exported JSON must be valid');
assert.equal(parseRes.document?.mutations.length, 3);

// 24. Verifies JSON state import round-trip restores identical mutation records
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

// 25. Verifies surfaceId resolution against allowed surface IDs
const allowed = new Set(['terrain_main', 'SurfaceValidationRamp']);
const validSurfaceDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    { ...validDoc.mutations[0], id: 'm_valid_surf', surfaceId: 'SurfaceValidationRamp' },
  ],
};
const resAllowed = tmIntegrity.mutationManager.importJson(JSON.stringify(validSurfaceDoc), { allowedSurfaceIds: allowed });
assert.equal(resAllowed.ok, true, 'Allowed surfaceId must pass');

const invalidSurfaceDoc: MutationDocument = {
  schemaVersion: '1.0.0',
  mutations: [
    { ...validDoc.mutations[0], id: 'm_invalid_surf', surfaceId: 'non_existent_surface' },
  ],
};
const resDisallowed = tmIntegrity.mutationManager.importJson(JSON.stringify(invalidSurfaceDoc), { allowedSurfaceIds: allowed });
assert.equal(resDisallowed.ok, false, 'Unallowed surfaceId must fail');

// 26. Verifies irregular-surface frame orientation
const rampNormal = new THREE.Vector3(0, 0.9659, 0.2588).normalize(); // ~15 deg tilt
const rampHitMut = tmIntegrity.applyMutation(
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

console.log('✅ ALL MUTATION STATE & PERSISTENT TERRAFORMING CHECKS PASSED (Requirements A-I Verified)!');
