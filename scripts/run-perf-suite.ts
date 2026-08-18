/**
 * Phase 6 performance benchmark runner.
 *
 * - Starts its own project-local Vite server when needed.
 * - Uses headed Chromium for authoritative local runs and headless Chromium for smoke/CI.
 * - Runs the ten roadmap scenarios plus discrete particle/residue scaling profiles.
 * - Enforces compatible-environment baseline comparisons.
 * - Creates a baseline only after two stable same-environment runs (one optional third run).
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright';
import { PerformanceBaseline } from '../src/performance/PerformanceBaseline';
import type { PerformanceReport } from '../src/performance/PerformanceTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BENCHMARKS_DIR = path.join(ROOT, 'benchmarks', 'performance');
const isSmoke = process.argv.includes('--smoke');
const isUpdateBaseline = process.argv.includes('--update-baseline') || process.argv.includes('--save-baseline');
const forceHeadless = process.argv.includes('--headless');
const port = 3001;
const baseUrl = `http://127.0.0.1:${port}`;
const testUrl = `${baseUrl}/?testMode=1&perfTest=1`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function serverResponds(): Promise<boolean> {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureDevServer(): Promise<ChildProcess | null> {
  if (await serverResponds()) return null;

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCommand, ['run', 'dev', '--', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DISABLE_HMR: 'true' },
    detached: process.platform !== 'win32',
  });

  let stderr = '';
  child.stderr?.on('data', (chunk) => { stderr += String(chunk); });

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Vite benchmark server exited early (${child.exitCode}): ${stderr.slice(-2000)}`);
    }
    if (await serverResponds()) return child;
    await sleep(250);
  }

  await stopServer(child);
  throw new Error(`Timed out waiting for benchmark server at ${baseUrl}: ${stderr.slice(-2000)}`);
}

function waitForExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.off('exit', onExit);
      resolve(value);
    };
    const onExit = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);
    child.once('exit', onExit);
  });
}

function signalServerTree(child: ChildProcess, signal: NodeJS.Signals): void {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform !== 'win32' && child.pid) {
      // ensureDevServer starts npm detached so its shell/Vite descendants share
      // this dedicated process group. Signal the whole group, not just npm.
      process.kill(-child.pid, signal);
    } else {
      child.kill(signal);
    }
  } catch (error: any) {
    if (error?.code !== 'ESRCH') throw error;
  }
}

async function stopServer(child: ChildProcess | null): Promise<void> {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  signalServerTree(child, 'SIGTERM');
  if (await waitForExit(child, 3000)) return;
  signalServerTree(child, 'SIGKILL');
  await waitForExit(child, 3000);
}

function printReport(report: any): boolean {
  console.log(`Environment Profile:`);
  console.log(`  Platform:        ${report.environment.platform}`);
  console.log(`  Renderer:        ${report.environment.webglRenderer}`);
  console.log(`  Viewport:        ${report.environment.viewportWidth}x${report.environment.viewportHeight} @ DPR ${report.environment.devicePixelRatio}`);
  console.log(`  Three.js:        ${report.environment.threeVersion}`);
  console.log(`  Build Commit:    ${report.environment.buildCommit}`);
  console.log(`  Visibility:      ${report.environment.visibilityState}\n`);

  console.log('-----------------------------------------------------------------------------------------------------------------');
  console.log('| Scenario/Profile               | Samples | p50 (ms) | p95 (ms) | p99 (ms) | FPS | Calls | Geos | Texs | Leaks | Status |');
  console.log('-----------------------------------------------------------------------------------------------------------------');

  let allPassed = true;
  for (const [id, result] of Object.entries(report.results) as [string, any][]) {
    const leaks = result.leakedResources.geometries + result.leakedResources.textures;
    const status = result.passed && leaks === 0 ? 'PASS' : 'FAIL';
    if (status === 'FAIL') allPassed = false;
    const pad = (value: string | number, width: number) => String(value).padEnd(width);
    console.log(
      `| ${pad(id, 30)} | ${pad(result.samplesCount, 7)} | ${pad(result.frameTimeMs.p50, 8)} | ${pad(result.frameTimeMs.p95, 8)} | ${pad(result.frameTimeMs.p99, 8)} | ${pad(result.frameTimeMs.fps, 3)} | ${pad(result.drawCalls.mean, 5)} | ${pad(result.memoryGeometries.mean, 4)} | ${pad(result.memoryTextures.mean, 4)} | ${pad(leaks, 5)} | ${pad(status, 6)} |`
    );
  }
  console.log('-----------------------------------------------------------------------------------------------------------------\n');
  return allPassed;
}

function p95DeltaPct(a: number, b: number): number {
  if (a <= 0 && b <= 0) return 0;
  const base = Math.max(0.001, Math.min(a, b));
  return Math.abs(a - b) / base * 100;
}

function repeatabilityScore(a: any, b: any): { maxP95DeltaPct: number; worstId: string } {
  const env = PerformanceBaseline.isEnvironmentCompatible(a.environment, b.environment);
  if (!env.compatible) return { maxP95DeltaPct: Infinity, worstId: env.reasons.join('; ') };

  let maxP95DeltaPct = 0;
  let worstId = '';
  const ids = new Set([...Object.keys(a.results), ...Object.keys(b.results)]);
  for (const id of ids) {
    const left = a.results[id];
    const right = b.results[id];
    if (!left || !right) return { maxP95DeltaPct: Infinity, worstId: `missing ${id}` };
    const delta = p95DeltaPct(left.frameTimeMs.p95, right.frameTimeMs.p95);
    if (delta > maxP95DeltaPct) {
      maxP95DeltaPct = delta;
      worstId = id;
    }
  }
  return { maxP95DeltaPct, worstId };
}

async function runBrowserReport(browser: Browser): Promise<any> {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.text().includes('[ResourceCheck')) console.log(`[Browser] ${msg.text()}`);
  });

  try {
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    const hasApi = await page.evaluate(() => typeof (window as any).__AETHERVFX_TEST_API__ === 'object');
    if (!hasApi) throw new Error('Bounded test API was not exposed on the performance test route');

    const bundle = await page.evaluate(async (smoke) => {
      const api = (window as any).__AETHERVFX_TEST_API__;
      const context = {
        engine: api.engine,
        terrain: api.terrain,
        abilityMgr: api.abilityMgr,
        freehandCaster: api.freehandCaster,
        indicatorMgr: api.indicatorMgr,
        sequenceRuntime: api.sequenceRuntime,
        sequenceEmitter: api.sequenceEmitter,
      };
      const performanceHarnessPath = '/src/performance/PerformanceHarness.ts';
      const scalingHarnessPath = '/src/performance/ScalingProfileHarness.ts';
      const { PerformanceHarness } = await import(/* @vite-ignore */ performanceHarnessPath);
      const { ScalingProfileHarness } = await import(/* @vite-ignore */ scalingHarnessPath);
      const report = await new PerformanceHarness(context).runAll({ isSmoke: smoke });
      const scalingProfiles = await new ScalingProfileHarness(context).runAll(smoke);
      return { report, scalingProfiles };
    }, isSmoke);

    Object.assign(bundle.report.results, bundle.scalingProfiles);
    if (consoleErrors.length > 0) {
      throw new Error(`Unexpected browser console errors: ${consoleErrors.join(' | ')}`);
    }
    return bundle.report;
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(BENCHMARKS_DIR, { recursive: true });
  const server = await ensureDevServer();
  const headless = isSmoke || forceHeadless || process.env.CI === 'true';

  console.log(`\n======================================================`);
  console.log(`   AETHERVFX PERFORMANCE BENCHMARK`);
  console.log(`   Mode: ${isSmoke ? 'SMOKE' : isUpdateBaseline ? 'BASELINE CREATION' : 'FULL REGRESSION'}`);
  console.log(`   Browser: ${headless ? 'headless Chromium' : 'headed Chromium'}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  try {
    const first = await runBrowserReport(browser);
    let allPassed = printReport(first);

    if (!isSmoke && first.environment.visibilityState !== 'visible') {
      console.error(`Authoritative performance run requires visibilityState=visible; observed ${first.environment.visibilityState}`);
      allPassed = false;
    }

    if (isSmoke) {
      fs.writeFileSync(path.join(BENCHMARKS_DIR, 'report-smoke.json'), JSON.stringify(first, null, 2));
      if (!allPassed) process.exitCode = 1;
      return;
    }

    const baselinePath = path.join(BENCHMARKS_DIR, 'baseline.json');
    const latestPath = path.join(BENCHMARKS_DIR, 'report-latest.json');

    if (isUpdateBaseline) {
      const second = await runBrowserReport(browser);
      let candidates = [first, second];
      let bestPair: [any, any] = [first, second];
      let bestScore = repeatabilityScore(first, second);

      if (bestScore.maxP95DeltaPct > 10) {
        console.warn(`Repeatability exceeded 10% at ${bestScore.worstId}; running one bounded third pass.`);
        const third = await runBrowserReport(browser);
        candidates = [first, second, third];
        const pairs: Array<[any, any]> = [[first, second], [first, third], [second, third]];
        for (const pair of pairs) {
          const score = repeatabilityScore(pair[0], pair[1]);
          if (score.maxP95DeltaPct < bestScore.maxP95DeltaPct) {
            bestScore = score;
            bestPair = pair;
          }
        }
      }

      const repeatability = {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        runCount: candidates.length,
        maxP95DeltaPct: Number(bestScore.maxP95DeltaPct.toFixed(2)),
        worstScenario: bestScore.worstId,
        passed: Number.isFinite(bestScore.maxP95DeltaPct) && bestScore.maxP95DeltaPct <= 10,
        buildCommit: bestPair[1].environment.buildCommit,
      };
      fs.writeFileSync(path.join(BENCHMARKS_DIR, 'baseline-repeatability.json'), JSON.stringify(repeatability, null, 2));

      if (!repeatability.passed) {
        console.error(`Baseline unstable: max p95 delta ${repeatability.maxP95DeltaPct}% at ${repeatability.worstScenario}`);
        process.exitCode = 1;
        return;
      }

      fs.writeFileSync(baselinePath, JSON.stringify(bestPair[1], null, 2));
      fs.writeFileSync(latestPath, JSON.stringify(bestPair[1], null, 2));
      console.log(`Baseline saved after repeatability PASS (${repeatability.maxP95DeltaPct}% max p95 delta).`);
      return;
    }

    fs.writeFileSync(latestPath, JSON.stringify(first, null, 2));
    if (!fs.existsSync(baselinePath)) {
      console.error('No approved performance baseline exists. Run npm run test:perf:baseline in the reference environment first.');
      process.exitCode = 1;
      return;
    }

    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as PerformanceReport;
    const comparison = PerformanceBaseline.compare(first as PerformanceReport, baseline);
    fs.writeFileSync(path.join(BENCHMARKS_DIR, 'comparison-latest.json'), JSON.stringify(comparison, null, 2));

    if (!comparison.environmentCompatible) {
      console.error('Performance baseline environment mismatch. Refusing to label this a regression pass.');
      for (const result of Object.values(comparison.comparisons)) {
        for (const reason of result.mismatchReasons) console.error(`  - ${reason}`);
        break;
      }
      allPassed = false;
    }
    if (!comparison.overallPassed) {
      console.error('Performance regression threshold violations detected.');
      for (const [id, result] of Object.entries(comparison.comparisons)) {
        if (!result.passed) console.error(`  - ${id}: ${result.violations.join(', ')}`);
      }
      allPassed = false;
    }

    if (!allPassed) process.exitCode = 1;
  } finally {
    await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error('Fatal error during performance suite execution:', error);
  process.exitCode = 1;
});