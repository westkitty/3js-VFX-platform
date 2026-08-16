/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from '@playwright/test';

test.describe('AetherVFX Browser & Runtime Test Suite', () => {
  test('Security Boundary: Production mode does NOT expose test APIs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    const testApi = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__);
    const runtimeApi = await page.evaluate(() => (window as any).__RUNTIME__);

    expect(testApi).toBeUndefined();
    expect(runtimeApi).toBeUndefined();
  });

  test('Test Mode Boundary: ?testMode=1 exposes bounded __AETHERVFX_TEST_API__', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    const hasApi = await page.evaluate(() => typeof (window as any).__AETHERVFX_TEST_API__ === 'object');
    expect(hasApi).toBe(true);

    const isEngineReady = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.isEngineReady());
    expect(isEngineReady).toBe(true);
  });

  test('Startup & Canvas: WebGL Canvas initializes with clean console', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');
    await page.waitForTimeout(500);

    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBeGreaterThanOrEqual(1);

    const isReady = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.isEngineReady());
    expect(isReady).toBe(true);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Mode Switching: Switches across Indicator, Cast, Sequence, Terrain, and Freehand modes', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    const modes = ['indicator', 'cast', 'sequence', 'terrain', 'freehand'] as const;

    for (const mode of modes) {
      await page.evaluate((m) => (window as any).__AETHERVFX_TEST_API__.setMode(m), mode);
      await page.waitForTimeout(100);
      const currentMode = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getMode());
      expect(currentMode).toBe(mode);
    }
  });

  test('Ability Casting: Deterministic spell casting triggers active ability lifecycle', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    const initialActive = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getActiveAbilityCount());
    expect(initialActive).toBe(0);

    const castResult = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      return api.castAbility('decl_ember_lance', { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 10 });
    });

    expect(castResult.success).toBe(true);
    expect(castResult.instanceId).toBeDefined();

    const activeCount = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getActiveAbilityCount());
    expect(activeCount).toBeGreaterThan(0);
  });

  test('Terrain Mutations & Undo/Redo: Applies mutation and verifies undo/redo cycle', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    const initialMutations = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getMutationCount());
    expect(initialMutations).toBe(0);

    // Apply crater mutation
    const mutationResult = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      return api.applyTerrainMutation('crater', { x: 0, y: 0, z: 0 }, 4, 1.5);
    });
    expect(mutationResult.success).toBe(true);

    const countAfterApply = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getMutationCount());
    expect(countAfterApply).toBe(1);

    // Undo mutation
    const undoResult = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.undoTerrainMutation());
    expect(undoResult.success).toBe(true);
    expect(undoResult.count).toBe(0);

    // Redo mutation
    const redoResult = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.redoTerrainMutation());
    expect(redoResult.success).toBe(true);
    expect(redoResult.count).toBe(1);
  });

  test('Terrain Mutations Import/Export: Reconciles mutation counters on imported records', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    // Apply two mutations
    await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      api.applyTerrainMutation('crater', { x: -5, y: 0, z: -5 }, 3, 1.0);
      api.applyTerrainMutation('raise', { x: 5, y: 0, z: 5 }, 3, 1.0);
    });

    const exported = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.exportTerrainMutations());
    expect(exported.mutations.length).toBe(2);

    // Clear and import
    await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.clearTerrainMutations());
    const countAfterClear = await page.evaluate(() => (window as any).__AETHERVFX_TEST_API__.getMutationCount());
    expect(countAfterClear).toBe(0);

    const importResult = await page.evaluate((data) => {
      return (window as any).__AETHERVFX_TEST_API__.importTerrainMutations(data);
    }, exported);
    expect(importResult.success).toBe(true);
    expect(importResult.count).toBe(2);

    // Apply a new mutation after import to verify counter reconciliation and no ID collisions
    const newMutationResult = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      return api.applyTerrainMutation('burn', { x: 0, y: 0, z: 0 }, 2, 0.5);
    });
    expect(newMutationResult.success).toBe(true);
    expect(newMutationResult.mutationId).not.toBe('mut_1');
    expect(newMutationResult.mutationId).not.toBe('mut_2');
  });

  test('Sequence Execution: Validates and runs multi-stage ability sequence', async ({ page }) => {
    await page.goto('/?testMode=1');
    await page.waitForSelector('canvas');

    const sequenceResult = await page.evaluate(() => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      return api.playSequence('seq_elemental_combo');
    });

    expect(sequenceResult.success).toBe(true);
  });
});
