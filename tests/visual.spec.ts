/**
 * Deterministic visual regression fixtures for the Phase 6 release gate.
 *
 * These tests never use wall-clock sleeps to choose a visual state. The normal
 * engine RAF loop is stopped, the EngineClock is paused, and every checkpoint
 * is reached by an exact number of fixed simulation steps.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from '@playwright/test';

const MAX_DIFF_PIXEL_RATIO = 0.02;

async function prepareDeterministicScene(page: Page): Promise<void> {
  await page.goto('/?testMode=1&surfaceFixture=1');
  await page.waitForSelector('canvas');
  await page.evaluate(() => {
    const api = (window as any).__AETHERVFX_TEST_API__;
    api.engine.stop();
    api.engine.isPaused = true;
    api.abilityMgr.clearAll();
    api.indicatorMgr.clear();
    api.freehandCaster.clear();
    api.sequenceRuntime.stop();
    api.terrain.resetTerrain();
    api.engine.clock.reset(0);
    api.engine.isPaused = true;
    api.engine.camera.position.set(0, 18, 28);
    api.engine.camera.lookAt(0, 0, 0);
    api.engine.renderer.render(api.engine.scene, api.engine.camera);
  });
}

async function advanceFrames(page: Page, count: number): Promise<void> {
  const advanced = await page.evaluate((frames) => {
    const api = (window as any).__AETHERVFX_TEST_API__;
    let completed = 0;
    for (let i = 0; i < frames; i++) {
      if (api.engine.stepSingleFrame(api.engine.clock.fixedStep)) completed++;
    }
    return completed;
  }, count);
  expect(advanced).toBe(count);
}

async function expectCanvasSnapshot(page: Page, name: string): Promise<void> {
  await expect(page.locator('canvas').first()).toHaveScreenshot(name, {
    maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
  });
}

test.describe('AetherVFX deterministic visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await prepareDeterministicScene(page);
  });

  test('fixture 01 - particle and orb ability', async ({ page }) => {
    const cast = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const def = api.globalAbilityRegistry.get('sample_amber_orb');
      const origin = new THREE.Vector3(-8, 1, -4);
      const target = new THREE.Vector3(5, 0, 3);
      const hit = api.engine.surfaceQuery.projectPoint(target);
      const direction = target.clone().sub(origin).normalize();
      const instance = api.abilityMgr.cast({
        abilityId: def.id,
        origin,
        target,
        direction,
        distance: origin.distanceTo(target),
        surface: hit,
        seed: 0x510001,
      }, def);
      return !!instance;
    });
    expect(cast).toBe(true);
    await advanceFrames(page, 18);
    await expectCanvasSnapshot(page, 'fixture-01-particle-orb.png');
  });

  test('fixture 02 - beam and ribbon ability', async ({ page }) => {
    const cast = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const def = api.globalAbilityRegistry.get('sample_violet_cascade');
      const origin = new THREE.Vector3(0, 1, 0);
      const target = new THREE.Vector3(7, 0, 5);
      const hit = api.engine.surfaceQuery.projectPoint(target);
      const direction = target.clone().sub(origin).normalize();
      return !!api.abilityMgr.cast({
        abilityId: def.id,
        origin,
        target,
        direction,
        distance: origin.distanceTo(target),
        surface: hit,
        seed: 0x520002,
      }, def);
    });
    expect(cast).toBe(true);
    await advanceFrames(page, 8);
    await expectCanvasSnapshot(page, 'fixture-02-beam-ribbon.png');
  });

  test('fixture 03 - semantic sequence checkpoint', async ({ page }) => {
    const started = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      return api.playSequence('seq_elemental_combo').success;
    });
    expect(started).toBe(true);
    await advanceFrames(page, 30);
    await expectCanvasSnapshot(page, 'fixture-03-semantic-sequence.png');
  });

  test('fixture 04 - surface telegraph', async ({ page }) => {
    const shown = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const hit = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(-6, 0, 3));
      if (!hit) return false;
      api.indicatorMgr.show(hit, {
        shape: 'cone',
        direction: new THREE.Vector3(1, 0, -0.2).normalize(),
        range: 13,
        radius: 5,
        angle: Math.PI / 2.8,
        width: 2,
        warningDuration: 20,
        commitDuration: 1,
      });
      return true;
    });
    expect(shown).toBe(true);
    await advanceFrames(page, 1);
    await expectCanvasSnapshot(page, 'fixture-04-telegraph.png');
  });

  test('fixture 05 - canonical freehand path', async ({ page }) => {
    const drawn = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const points = [
        new THREE.Vector3(-10, 0, -5),
        new THREE.Vector3(-5, 0, 3),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(7, 0, 4),
      ];
      const hits = points.map((point: any) => api.engine.surfaceQuery.projectPoint(point));
      if (hits.some((hit: any) => !hit)) return false;
      api.freehandCaster.startDrawing(hits[0]);
      api.freehandCaster.addPoint(hits[1]);
      api.freehandCaster.addPoint(hits[2]);
      api.freehandCaster.addPoint(hits[3]);
      api.freehandCaster.getResampledPath(36);
      return true;
    });
    expect(drawn).toBe(true);
    await advanceFrames(page, 1);
    await expectCanvasSnapshot(page, 'fixture-05-freehand-path.png');
  });

  test('fixture 06 - scorch and rune surface aftermath', async ({ page }) => {
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const left = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(-5, 0, 0));
      const right = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(5, 0, 0));
      if (!left || !right) throw new Error('Terrain projection failed');
      api.terrain.applyMutation('scorch', left.point, 4, 1, 0, 30, undefined, left.surfaceId, left.normal);
      api.terrain.applyMutation('golden_rune', right.point, 4, 1, 0, 30, undefined, right.surfaceId, right.normal);
    });
    await advanceFrames(page, 2);
    await expectCanvasSnapshot(page, 'fixture-06-surface-aftermath.png');
  });

  test('fixture 07 - crystal mutation on irregular ramp', async ({ page }) => {
    const surfaceId = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const hit = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(9, 4, -1));
      if (!hit) throw new Error('Ramp projection failed');
      api.terrain.applyMutation('crystal', hit.point, 3.2, 1, 0, 30, undefined, hit.surfaceId, hit.normal);
      return hit.surfaceId;
    });
    expect(surfaceId).toBe('SurfaceValidationRamp');
    await advanceFrames(page, 2);
    await expectCanvasSnapshot(page, 'fixture-07-crystal-irregular-surface.png');
  });

  test('fixture 08 - data-driven imported ability', async ({ page }) => {
    const result = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const sourceJson = api.globalAbilityRegistry.exportAbilityJson('sample_amber_orb');
      if (!sourceJson) return { imported: false, cast: false };
      const document = JSON.parse(sourceJson);
      document.id = 'visual_factory_imported_orb';
      document.name = 'Visual Factory Imported Orb';
      if (document.modules?.[0]?.params) {
        document.modules[0].params.colorCore = '#ffffff';
        document.modules[0].params.colorOuter = '#22ddff';
      }
      const imported = api.globalAbilityRegistry.importJson(JSON.stringify(document));
      const def = api.globalAbilityRegistry.get(document.id);
      if (!imported.ok || !def) return { imported: false, cast: false };
      const origin = new THREE.Vector3(6, 1, -6);
      const target = new THREE.Vector3(-2, 0, 2);
      const hit = api.engine.surfaceQuery.projectPoint(target);
      const direction = target.clone().sub(origin).normalize();
      const instance = api.abilityMgr.cast({
        abilityId: def.id,
        origin,
        target,
        direction,
        distance: origin.distanceTo(target),
        surface: hit,
        seed: 0x580008,
      }, def);
      return { imported: true, cast: !!instance };
    });
    expect(result.imported).toBe(true);
    expect(result.cast).toBe(true);
    await advanceFrames(page, 18);
    await expectCanvasSnapshot(page, 'fixture-08-data-driven-import.png');
  });
});
