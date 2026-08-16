/**
 * Clean dist-only release smoke. No Vite dev transforms are available here.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { test, expect } from '@playwright/test';

const MODE_LABELS = [
  'VFX Laboratory',
  'Ability Factory',
  'Macro Sandbox',
  'Terraformer',
  'Telegraph Lab',
  'Freehand Caster',
  'Performance Lab',
];

test('dist boots as static files with all seven modes and no test API', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('canvas').first()).toBeVisible();

  const exposed = await page.evaluate(() => ({
    testApi: typeof (window as any).__AETHERVFX_TEST_API__,
    runtime: typeof (window as any).__RUNTIME__,
  }));
  expect(exposed).toEqual({ testApi: 'undefined', runtime: 'undefined' });

  for (const label of MODE_LABELS) {
    const button = page.getByRole('button', { name: label });
    await expect(button).toBeVisible();
    await button.click();
  }

  expect(failedRequests).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
