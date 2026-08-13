/**
 * Focused deterministic checks for the Phase 1 runtime-spine contract.
 * Runs without creating a WebGLRenderer or browser DOM.
 */

import assert from 'node:assert/strict';
import * as THREE from 'three';
import { EngineClock } from '../src/core/EngineClock';
import { PostProcessingController } from '../src/core/PostProcessing';
import { SeededRandom } from '../src/core/SeededRandom';
import { VfxPool } from '../src/core/VfxPool';

function checkClock() {
  const clock = new EngineClock({ fixedStep: 1 / 60, maxDelta: 0.1 });
  clock.start(1000);

  const frame = clock.frame(1016.6667);
  assert.ok(Math.abs(frame.rawFrameDurationMs - 16.6667) < 1e-6);
  assert.ok(Math.abs(frame.simulationDeltaSeconds - 0.0166667) < 1e-6);

  const beforePause = clock.simulationTime;
  clock.setPaused(true);
  const pausedFrame = clock.frame(1033.3334);
  assert.equal(pausedFrame.advanced, false);
  assert.equal(clock.simulationTime, beforePause);

  const stepped = clock.step();
  assert.equal(stepped.advanced, true);
  assert.ok(Math.abs(clock.simulationTime - (beforePause + 1 / 60)) < 1e-9);
}

function checkSeededRandom() {
  const a = new SeededRandom(123456);
  const b = new SeededRandom(123456);
  assert.deepEqual([a.next(), a.next(), a.next()], [b.next(), b.next(), b.next()]);
}

function checkCameraShakeRestoration() {
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(5, 6, 7);
  const expected = camera.position.clone();

  const samples = [1, 0, 0.75];
  let sampleIndex = 0;
  const post = new PostProcessingController(camera, () => samples[(sampleIndex++) % samples.length]);

  for (let i = 0; i < 100; i++) {
    post.triggerShake(0.5);
    post.update(1 / 60);
    post.restoreCameraTransform();
    assert.ok(camera.position.equals(expected));
  }

  post.dispose();
  assert.ok(camera.position.equals(expected));
}

function checkVfxPoolLifecycle() {
  const scene = new THREE.Scene();
  const pool = new VfxPool();

  pool.init(scene);
  assert.deepEqual(pool.getStats(), { activeLights: 0, pooledLights: 16, totalLights: 16 });

  // Initialization against the same scene must be idempotent.
  pool.init(scene);
  assert.deepEqual(pool.getStats(), { activeLights: 0, pooledLights: 16, totalLights: 16 });

  const light = pool.acquireLight(0xffffff, 2, 5, new THREE.Vector3(1, 2, 3));
  assert.ok(light);
  assert.deepEqual(pool.getStats(), { activeLights: 1, pooledLights: 15, totalLights: 16 });

  pool.releaseLight(light);
  assert.deepEqual(pool.getStats(), { activeLights: 0, pooledLights: 16, totalLights: 16 });

  pool.dispose();
  assert.deepEqual(pool.getStats(), { activeLights: 0, pooledLights: 0, totalLights: 0 });
}

checkClock();
checkSeededRandom();
checkCameraShakeRestoration();
checkVfxPoolLifecycle();

console.log('Runtime spine checks: PASS');
