/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from '@playwright/test';

test.describe('AetherVFX Deterministic Visual Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Set fixed viewport and deterministic test route
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');
    // Ensure engine is ready and reset to clean state
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.setMode('indicator');
      api.clearTerrainMutations();
    });
    await page.waitForTimeout(200);
  });

  test('Visual Fixture 1: Baseline Idle Scene & Terrain', async ({ page }) => {
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fixture-01-idle-scene.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 2: Linear Cone Indicator', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      api.setMode('indicator');
      const hit = {
        point: new THREE.Vector3(0, 0.1, 0),
        normal: new THREE.Vector3(0, 1, 0),
        distance: 10,
        surfaceId: 'terrain_main',
      };
      api.indicatorMgr.show(hit, {
        shape: 'cone',
        radius: 12,
        angle: Math.PI / 3,
        direction: new THREE.Vector3(1, 0, 0),
        range: 12,
        width: 2,
        warningDuration: 5.0,
        commitDuration: 1.0,
      });
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fixture-02-linear-cone-indicator.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 3: Circle Radial Indicator', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      api.setMode('indicator');
      const hit = {
        point: new THREE.Vector3(0, 0.1, 0),
        normal: new THREE.Vector3(0, 1, 0),
        distance: 10,
        surfaceId: 'terrain_main',
      };
      api.indicatorMgr.show(hit, {
        shape: 'circle',
        radius: 8,
        angle: Math.PI / 3,
        direction: new THREE.Vector3(0, 0, 1),
        range: 8,
        width: 2,
        warningDuration: 5.0,
        commitDuration: 1.0,
      });
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fixture-03-circle-indicator.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 4: Arrow Line Indicator', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      api.setMode('indicator');
      const hit = {
        point: new THREE.Vector3(-5, 0.1, -5),
        normal: new THREE.Vector3(0, 1, 0),
        distance: 10,
        surfaceId: 'terrain_main',
      };
      api.indicatorMgr.show(hit, {
        shape: 'line',
        radius: 15,
        angle: Math.PI / 3,
        direction: new THREE.Vector3(1, 0, 1).normalize(),
        range: 15,
        width: 2.5,
        warningDuration: 5.0,
        commitDuration: 1.0,
      });
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fixture-04-arrow-line-indicator.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 5: Impact Decal & Residue', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.setMode('cast');
      api.castAbility('decl_ember_lance', { x: -8, y: 0, z: -8 }, { x: 2, y: 0, z: 2 });
    });
    // Wait for lance to travel and impact terrain
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('fixture-05-impact-residue.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 6: Terrain Crater & Raise Mutation', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.setMode('terrain');
      api.applyTerrainMutation('crater', { x: -4, y: 0, z: 0 }, 5, 2.0);
      api.applyTerrainMutation('raise', { x: 4, y: 0, z: 0 }, 4, 2.0);
    });
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot('fixture-06-terrain-mutations.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 7: Freehand Gesture Drawing', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      api.setMode('freehand');
      const hit1 = { point: new THREE.Vector3(-10, 0.2, -5), normal: new THREE.Vector3(0, 1, 0), distance: 10, surfaceId: 'terrain_main' };
      const hit2 = { point: new THREE.Vector3(-4, 0.2, 2), normal: new THREE.Vector3(0, 1, 0), distance: 10, surfaceId: 'terrain_main' };
      const hit3 = { point: new THREE.Vector3(4, 0.2, -2), normal: new THREE.Vector3(0, 1, 0), distance: 10, surfaceId: 'terrain_main' };
      const hit4 = { point: new THREE.Vector3(10, 0.2, 5), normal: new THREE.Vector3(0, 1, 0), distance: 10, surfaceId: 'terrain_main' };
      api.freehandCaster.startDrawing(hit1);
      api.freehandCaster.addPoint(hit2);
      api.freehandCaster.addPoint(hit3);
      api.freehandCaster.addPoint(hit4);
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('fixture-07-freehand-path.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Visual Fixture 8: Multi-Stage Sequence Indicator', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.setMode('sequence');
      api.playSequence('seq_elemental_combo');
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('fixture-08-sequence-indicator.png', { maxDiffPixelRatio: 0.05 });
  });
});
