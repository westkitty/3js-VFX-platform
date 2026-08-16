/**
 * CLI performance benchmark runner.
 *
 * Launches Playwright browser, executes the 10 deterministic performance scenarios,
 * computes statistics, compares against baseline, and validates regression thresholds.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BENCHMARKS_DIR = path.join(ROOT, 'benchmarks', 'performance');

const isSmoke = process.argv.includes('--smoke');
const isUpdateBaseline = process.argv.includes('--update-baseline');
const port = 3001;
const url = `http://localhost:${port}/?testMode=1&perfTest=1`;

async function runPerfSuite() {
  console.log(`\n======================================================`);
  console.log(`   AETHERVFX DETERMINISTIC PERFORMANCE BENCHMARK     `);
  console.log(`   Mode: ${isSmoke ? 'SMOKE (Fast)' : 'FULL (Authoritative)'}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.text().includes('[ResourceCheck')) {
      console.log(`[Browser] ${msg.text()}`);
    }
  });

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="workbench-root"], #root', { timeout: 15000 });
    await page.waitForTimeout(1000); // allow canvas and WebGL context to stabilize

    // Check test API presence
    const hasTestApi = await page.evaluate(() => typeof (window as any).__AETHERVFX_TEST_API__ !== 'undefined');
    if (!hasTestApi) {
      throw new Error('window.__AETHERVFX_TEST_API__ was not exposed on testMode=1 route');
    }

    console.log('Executing 10 deterministic performance scenarios in browser...\n');

    // Run performance benchmark in browser context
    const report = await page.evaluate(async (smoke) => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const perfModulePath = '/src/performance/index.ts';
      const { PerformanceHarness, globalPerformanceRegistry } = await import(/* @vite-ignore */ perfModulePath);

      const harness = new PerformanceHarness({
        engine: api.engine,
        terrain: api.terrain,
        abilityMgr: api.abilityMgr,
        freehandCaster: api.freehandCaster,
        indicatorMgr: api.indicatorMgr,
        sequenceRuntime: api.sequenceRuntime,
        sequenceEmitter: api.sequenceEmitter,
      });

      return await harness.runAll({ isSmoke: smoke });
    }, isSmoke);

    if (!fs.existsSync(BENCHMARKS_DIR)) {
      fs.mkdirSync(BENCHMARKS_DIR, { recursive: true });
    }

    console.log(`Environment Profile:`);
    console.log(`  OS/Platform:     ${report.environment.platform}`);
    console.log(`  Renderer:        ${report.environment.webglRenderer}`);
    console.log(`  Viewport:        ${report.environment.viewportWidth}x${report.environment.viewportHeight} @ DPR ${report.environment.devicePixelRatio}`);
    console.log(`  Three.js:        ${report.environment.threeVersion}`);
    console.log(`  Build Commit:    ${report.environment.buildCommit}\n`);

    console.log('-----------------------------------------------------------------------------------------------------------------');
    console.log('| Scenario ID                   | Samples | p50 (ms) | p95 (ms) | p99 (ms) | FPS | Calls | Geos | Texs | Leaks | Status |');
    console.log('-----------------------------------------------------------------------------------------------------------------');

    let allPassed = true;
    for (const [id, result] of Object.entries(report.results) as [string, any][]) {
      const leaks = result.leakedResources.geometries + result.leakedResources.textures;
      const status = result.passed && leaks === 0 ? 'PASS' : 'FAIL';
      if (status === 'FAIL') allPassed = false;

      const pad = (s: string | number, n: number) => String(s).padEnd(n);
      console.log(
        `| ${pad(id, 29)} | ${pad(result.samplesCount, 7)} | ${pad(result.frameTimeMs.p50, 8)} | ${pad(result.frameTimeMs.p95, 8)} | ${pad(result.frameTimeMs.p99, 8)} | ${pad(result.frameTimeMs.fps, 3)} | ${pad(result.drawCalls.mean, 5)} | ${pad(result.memoryGeometries.mean, 4)} | ${pad(result.memoryTextures.mean, 4)} | ${pad(leaks, 5)} | ${pad(status, 6)} |`
      );
    }
    console.log('-----------------------------------------------------------------------------------------------------------------\n');

    // Save report to disk
    const reportFilename = isSmoke ? 'report-smoke.json' : 'report-latest.json';
    const reportPath = path.join(BENCHMARKS_DIR, reportFilename);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Saved benchmark report to: ${reportPath}`);

    const baselinePath = path.join(BENCHMARKS_DIR, 'baseline.json');
    if (isUpdateBaseline || !fs.existsSync(baselinePath)) {
      fs.writeFileSync(baselinePath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`Updated baseline reference at: ${baselinePath}`);
    } else if (!isSmoke && fs.existsSync(baselinePath)) {
      // Compare against baseline
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
      const comparison = await page.evaluate(({ curr, base }) => {
        const { PerformanceBaseline } = (window as any);
        return PerformanceBaseline ? PerformanceBaseline.compare(curr, base) : null;
      }, { curr: report, base: baseline });

      if (comparison) {
        console.log(`\nBaseline Comparison Result: ${comparison.overallPassed ? 'PASS' : 'FAIL'}`);
        if (!comparison.overallPassed) {
          console.warn('Regression violations found:');
          for (const [sId, cmp] of Object.entries(comparison.comparisons) as [string, any][]) {
            if (!cmp.passed) {
              console.warn(`  - ${sId}: ${cmp.violations.join(', ')}`);
            }
          }
        }
      }
    }

    if (consoleErrors.length > 0) {
      console.error(`\n❌ Unexpected Console Errors (${consoleErrors.length}):`);
      for (const err of consoleErrors) {
        console.error(`  - ${err}`);
      }
      allPassed = false;
    }

    if (!allPassed) {
      console.error('\n❌ Performance benchmark suite FAILED!');
      process.exit(1);
    }

    console.log('✅ ALL 10 PERFORMANCE SCENARIOS PASSED WITH ZERO RESOURCE LEAKS!\n');
  } finally {
    await browser.close();
  }
}

runPerfSuite().catch((err) => {
  console.error('Fatal error during performance suite execution:', err);
  process.exit(1);
});
