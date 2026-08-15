import assert from 'node:assert/strict';
import * as THREE from 'three';
import { TerrainManager } from '../src/terrain/TerrainManager';
import { WorldMarkBridge } from '../src/abilities/WorldMarkBridge';
import type { AbilityDefinition } from '../src/types/index';

const scene = new THREE.Scene();
const terrain = new TerrainManager(scene);

const markDef: AbilityDefinition = {
  id: 'test_scorch',
  name: 'Test Scorch',
  school: 'pyromancy',
  description: 'Test',
  iconName: 'test',
  targeting: { shape: 'zone', range: 10, minRange: 0, radius: 2, angle: 0, surfacePolicy: 'project' },
  timing: { windup: 0, travelSpeed: 0, hold: 0, fade: 0, cooldown: 0 },
  feedback: { cameraShake: 0, flashIntensity: 0, lightColor: '#ffffff', lightRadius: 0 },
  budget: { maxParticles: 0, dynamicLights: 0 },
  modules: [
    { type: 'decal', params: { decalType: 'scorch', radius: 4, duration: 2.0 } }
  ]
};

const bridge = new WorldMarkBridge(terrain);

// 1. Duration calculation & deterministic budget cap (64 max)
for (let i = 0; i < 70; i++) {
  bridge.apply(markDef, new THREE.Vector3(i, 0, 0), 1000 + i, `owner_A`);
}

const anyTerrain = terrain as any;
assert.equal(anyTerrain.activeRegions.length, 64, 'Budget should cap at 64');
assert.ok(anyTerrain.activeRegions[0].createdAt >= 1006, 'Oldest marks should be evicted');

// 2. Pause behavior: if simulation time doesn't advance, marks don't expire
terrain.update(1007.9);
assert.equal(anyTerrain.activeRegions.length, 64, "Marks survive if time hasn't advanced past duration");

// 3. Advancing simulation time past expiration DOES expire it
terrain.update(1072.0); // Oldest marks created at 1006 -> expires at 1008. time=1072 clears everything!
assert.equal(anyTerrain.activeRegions.length, 0, 'Marks should expire and be cleared');

// 4. Owner-specific clear and unrelated owner survival
bridge.apply(markDef, new THREE.Vector3(0,0,0), 2000, 'owner_B');
bridge.apply(markDef, new THREE.Vector3(0,0,0), 2000, 'owner_C');
assert.equal(anyTerrain.activeRegions.length, 2);
terrain.clearByOwner('owner_B');
assert.equal(anyTerrain.activeRegions.length, 1, 'Clear by owner B should spare owner C');
assert.equal(anyTerrain.activeRegions[0].ownerId, 'owner_C');

// 5. Visual fade behavior
bridge.apply(markDef, new THREE.Vector3(0,0,0), 3000, 'owner_D');
terrain.update(3001.0); // 1.0s remaining of 2.0s duration. Fade starts at 0.5s left.
const decalMesh = anyTerrain.activeRegions[0].meshes[0] as THREE.Mesh;
const mat = decalMesh.material as THREE.ShaderMaterial;
assert.ok(mat.uniforms.uFade.value > 0.99, 'Opacity should be 1.0 before fade window');

terrain.update(3001.75); // 0.25s remaining -> fade multiplier should be 0.5
assert.ok(Math.abs(mat.uniforms.uFade.value - 0.5) < 1e-5, 'Opacity should fade proportionally in final 0.5s');

// 6. Infinite/default duration behavior
// If an ability doesn't specify duration, WorldMarkBridge defaults to 10.0
const defaultDef: AbilityDefinition = { ...markDef, modules: [{ type: 'decal', params: { decalType: 'frost', radius: 4 } }] };
bridge.apply(defaultDef, new THREE.Vector3(0,0,0), 4000, 'owner_E');
assert.equal(anyTerrain.activeRegions[1].duration, 10.0, 'Missing duration should default to 10.0s');

terrain.destroy();
console.log('World effects checks: PASS (duration, budgets, expiration, clearByOwner, fade)');
