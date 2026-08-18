/**
 * Project-local browser acceptance gate for the protected Phase 1-6 user paths.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from '@playwright/test';

async function gotoTestMode(page: Page, fixture = false): Promise<string[]> {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  await page.goto(fixture ? '/?testMode=1&surfaceFixture=1' : '/?testMode=1');
  await page.waitForSelector('canvas');
  return consoleErrors;
}

async function enterDeterministicMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    const api = (window as any).__AETHERVFX_TEST_API__;
    api.engine.stop();
    api.engine.isPaused = true;
    api.engine.clock.reset(0);
    api.engine.isPaused = true;
  });
}

async function stepFrames(page: Page, frames: number): Promise<number> {
  return page.evaluate((count) => {
    const api = (window as any).__AETHERVFX_TEST_API__;
    let advanced = 0;
    for (let i = 0; i < count; i++) {
      if (api.engine.stepSingleFrame(api.engine.clock.fixedStep)) advanced++;
    }
    return advanced;
  }, frames);
}

test.describe('AetherVFX browser and runtime release gate', () => {
  test('production route hides test-only runtime APIs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    const exposure = await page.evaluate(() => ({
      testApi: typeof (window as any).__AETHERVFX_TEST_API__,
      runtime: typeof (window as any).__RUNTIME__,
    }));
    expect(exposure).toEqual({ testApi: 'undefined', runtime: 'undefined' });
  });

  test('startup is clean and all seven workbench modes are reachable', async ({ page }) => {
    const consoleErrors = await gotoTestMode(page);
    const labels = [
      'VFX Laboratory',
      'Ability Factory',
      'Macro Sandbox',
      'Terraformer',
      'Telegraph Lab',
      'Freehand Caster',
      'Performance Lab',
    ];
    for (const label of labels) {
      await page.getByRole('button', { name: label }).click();
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
    expect(await page.locator('canvas').count()).toBeGreaterThan(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('deterministic preview pause, step, seek, restart, and live mutation work', async ({ page }) => {
    await gotoTestMode(page);
    await enterDeterministicMode(page);
    const setup = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const def = api.globalAbilityRegistry.get('sample_amber_orb');
      const origin = new THREE.Vector3(0, 1, 0);
      const target = new THREE.Vector3(8, 0, 5);
      const hit = api.engine.surfaceQuery.projectPoint(target);
      api.abilityMgr.castPreview({
        abilityId: def.id,
        origin,
        target,
        direction: target.clone().sub(origin).normalize(),
        distance: origin.distanceTo(target),
        surface: hit,
        seed: 0x123456,
      }, def);
      return api.abilityMgr.getPreviewState();
    });
    expect(setup.hasPreview).toBe(true);

    expect(await stepFrames(page, 6)).toBe(6);
    const stepped = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.abilityMgr.getPreviewState());
    expect(stepped.time).toBeGreaterThan(0);

    const frozen = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const before = api.engine.simulationTime;
      api.engine.clock.frame(performance.now() + 1000);
      return { before, after: api.engine.simulationTime };
    });
    expect(frozen.after).toBe(frozen.before);

    const edited = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const current = api.globalAbilityRegistry.get('sample_amber_orb');
      const clone = JSON.parse(JSON.stringify(current));
      clone.modules[0].params.radius = 1.4;
      api.abilityMgr.updatePreviewDefinition(clone);
      const seek = api.abilityMgr.seekPreview(0.2);
      const restart = api.abilityMgr.restartPreview();
      return { seek: seek.time, restart: restart.time, hasPreview: restart.hasPreview };
    });
    expect(edited.seek).toBeGreaterThanOrEqual(0.19);
    expect(edited.restart).toBe(0);
    expect(edited.hasPreview).toBe(true);
  });

  test('ability JSON export/import and deterministic casting remain functional', async ({ page }) => {
    await gotoTestMode(page);
    await enterDeterministicMode(page);
    const proof = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const exported = api.globalAbilityRegistry.exportAbilityJson('sample_frost_trace');
      if (!exported) return { ok: false };
      const document = JSON.parse(exported);
      document.id = 'browser_imported_frost_trace';
      document.name = 'Browser Imported Frost Trace';
      const imported = api.globalAbilityRegistry.importJson(JSON.stringify(document));
      const first = api.castAbility(document.id, { x: -4, y: 1, z: -4 }, { x: 4, y: 0, z: 4 });
      return { ok: imported.ok && first.success, id: document.id };
    });
    expect(proof.ok).toBe(true);
    expect(await stepFrames(page, 12)).toBe(12);
    const active = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getActiveAbilityCount());
    expect(active).toBeGreaterThan(0);
  });

  test('sequence run, deterministic step, restart, and stop release ownership', async ({ page }) => {
    await gotoTestMode(page);
    await enterDeterministicMode(page);
    const started = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.playSequence('seq_elemental_combo').success);
    expect(started).toBe(true);
    expect(await stepFrames(page, 12)).toBe(12);
    const running = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.sequenceRuntime.getState());
    expect(running.status).not.toBe('idle');
    const states = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.sequenceRuntime.restart();
      const restarted = api.sequenceRuntime.getState();
      api.sequenceRuntime.stop();
      return { restarted, stopped: api.sequenceRuntime.getState(), owned: api.sequenceEmitter.getOwnedCount() };
    });
    expect(states.restarted.elapsed).toBe(0);
    expect(states.stopped.status).toBe('idle');
    expect(states.owned).toBe(0);
  });

  test('mutation save/load, undo/redo, declarative residue, and irregular surfaces work', async ({ page }) => {
    const consoleErrors = await gotoTestMode(page, true);
    await enterDeterministicMode(page);
    const proof = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      api.terrain.resetTerrain();
      const baseHit = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(0, 0, 0));
      const rampHit = api.engine.surfaceQuery.projectPoint(new THREE.Vector3(9, 4, -1));
      if (!baseHit || !rampHit) return { ok: false };

      const first = api.terrain.applyMutation('scorch', baseHit.point, 3, 1, 0, 30, 'browser-owner', baseHit.surfaceId, baseHit.normal);
      const ramp = api.terrain.applyMutation('crystal', rampHit.point, 3, 1, 0, 30, 'browser-owner', rampHit.surfaceId, rampHit.normal);
      const exported = api.terrain.mutationManager.exportJson();
      const beforeUndo = api.terrain.mutationManager.getActiveCount();
      api.terrain.undo();
      const afterUndo = api.terrain.mutationManager.getActiveCount();
      api.terrain.redo();
      const afterRedo = api.terrain.mutationManager.getActiveCount();
      api.terrain.resetTerrain();
      const imported = api.terrain.mutationManager.importJson(exported);
      const afterImport = api.terrain.mutationManager.getActiveCount();

      const sequence = api.sequenceDefinitions.find((item: any) => JSON.stringify(item).includes('residue'));
      if (sequence) {
        api.sequenceRuntime.load(sequence);
        api.sequenceRuntime.start();
      }
      return {
        ok: imported.ok,
        firstId: first.id,
        rampSurface: ramp.surfaceId,
        beforeUndo,
        afterUndo,
        afterRedo,
        afterImport,
        hasResidueSequence: !!sequence,
      };
    });
    expect(proof.ok).toBe(true);
    expect(proof.rampSurface).toBe('SurfaceValidationRamp');
    expect(proof.afterUndo).toBe(proof.beforeUndo - 1);
    expect(proof.afterRedo).toBe(proof.beforeUndo);
    expect(proof.afterImport).toBeGreaterThanOrEqual(2);
    if (proof.hasResidueSequence) expect(await stepFrames(page, 24)).toBe(24);
    expect(consoleErrors).toHaveLength(0);
  });

  test('freehand and telegraph lifecycle clean up owned resources', async ({ page }) => {
    await gotoTestMode(page, true);
    await enterDeterministicMode(page);
    const proof = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const THREE = api.THREE;
      const points = [
        new THREE.Vector3(-8, 0, -5),
        new THREE.Vector3(-3, 0, 2),
        new THREE.Vector3(4, 0, -1),
        new THREE.Vector3(8, 0, 5),
      ];
      const hits = points.map((p: any) => api.engine.surfaceQuery.projectPoint(p));
      if (hits.some((hit: any) => !hit)) return { ok: false };
      api.freehandCaster.startDrawing(hits[0]);
      api.freehandCaster.addPoint(hits[1]);
      api.freehandCaster.addPoint(hits[2]);
      api.freehandCaster.addPoint(hits[3]);
      const resampled = api.freehandCaster.getResampledPath(30);

      api.indicatorMgr.show(hits[2], {
        shape: 'ring',
        direction: new THREE.Vector3(1, 0, 0),
        range: 8,
        radius: 4,
        angle: Math.PI / 3,
        width: 2,
        warningDuration: 20,
        commitDuration: 1,
      });
      const before = { indicators: api.indicatorMgr.getActiveCount(), samples: resampled.length };
      api.indicatorMgr.clear();
      api.freehandCaster.clear();
      return { ok: true, before, indicatorsAfter: api.indicatorMgr.getActiveCount() };
    });
    expect(proof.ok).toBe(true);
    expect(proof.before.indicators).toBeGreaterThan(0);
    expect(proof.before.samples).toBeGreaterThan(4);
    expect(proof.indicatorsAfter).toBe(0);
  });

  test('performance harness browser smoke collects real frame intervals and recovers resources', async ({ page }) => {
    await gotoTestMode(page);
    const result = await page.evaluate(async () => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const performanceHarnessPath = '/src/performance/PerformanceHarness.ts';
      const performanceRegistryPath = '/src/performance/PerformanceScenarioRegistry.ts';
      const { PerformanceHarness } = await import(/* @vite-ignore */ performanceHarnessPath);
      const { globalPerformanceRegistry } = await import(/* @vite-ignore */ performanceRegistryPath);
      const scenario = globalPerformanceRegistry.get('idle_baseline');
      const harness = new PerformanceHarness({
        engine: api.engine,
        terrain: api.terrain,
        abilityMgr: api.abilityMgr,
        freehandCaster: api.freehandCaster,
        indicatorMgr: api.indicatorMgr,
        sequenceRuntime: api.sequenceRuntime,
        sequenceEmitter: api.sequenceEmitter,
      });
      return harness.runScenario(scenario, { isSmoke: true });
    });
    expect(result.samplesCount).toBe(120);
    expect(result.frameTimeMs.p50).toBeGreaterThan(1);
    expect(result.frameTimeMs.p50).toBeLessThan(100);
    expect(result.leakedResources.geometries).toBe(0);
    expect(result.leakedResources.textures).toBe(0);
    expect(result.passed).toBe(true);
  });
});
