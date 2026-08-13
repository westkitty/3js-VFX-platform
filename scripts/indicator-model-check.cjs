const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aethervfx-indicator-'));

try {
  execFileSync('tsc', [
    'src/indicators/IndicatorModel.ts',
    '--target', 'ES2020',
    '--module', 'CommonJS',
    '--outDir', tempRoot,
    '--skipLibCheck',
  ], { cwd: root, stdio: 'pipe' });

  const model = require(path.join(tempRoot, 'IndicatorModel.js'));
  const base = { range: 10, radius: 3, angle: Math.PI / 2, width: 2 };
  const approx = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

  const line = model.buildIndicatorLocalOutline({ ...base, shape: 'line' });
  assert.deepStrictEqual(line, [[-1, 0], [-1, 10], [1, 10], [1, 0]]);

  const rectangle = model.buildIndicatorLocalOutline({ ...base, shape: 'rectangle' });
  assert.deepStrictEqual(rectangle, line);

  for (const shape of ['zone', 'ring']) {
    const circle = model.buildIndicatorLocalOutline({ ...base, shape });
    assert.strictEqual(circle.length, 48);
    for (const [x, y] of circle) approx(Math.hypot(x, y), 3, 1e-8);
  }

  const cone = model.buildIndicatorLocalOutline({ ...base, shape: 'cone' });
  assert.strictEqual(cone.length, 34);
  assert.deepStrictEqual(cone[0], [0, 0]);
  for (const [x, y] of cone.slice(1)) approx(Math.hypot(x, y), 10, 1e-8);
  approx(cone[1][0], -cone[cone.length - 1][0], 1e-8);
  approx(cone[1][1], cone[cone.length - 1][1], 1e-8);

  const clamped = model.buildIndicatorLocalOutline({ shape: 'line', range: -5, radius: -2, angle: 0, width: 0 });
  assert.deepStrictEqual(clamped, [[-0.025, 0], [-0.025, 0.1], [0.025, 0.1], [0.025, 0]]);

  let state = model.createIndicatorPhaseState();
  let step = model.advanceIndicatorPhase(state, 0.4, 0.5, 0.25);
  assert.strictEqual(step.state.phase, 'warning');
  approx(step.state.elapsed, 0.4);
  approx(step.opacity, 0.9);
  assert.strictEqual(step.enteredCommit, false);

  step = model.advanceIndicatorPhase(step.state, 0.2, 0.5, 0.25);
  assert.strictEqual(step.state.phase, 'commit');
  approx(step.state.elapsed, 0.1);
  assert.strictEqual(step.enteredCommit, true);
  approx(step.opacity, 1);

  step = model.advanceIndicatorPhase(step.state, 0.4, 0.5, 0.25);
  assert.strictEqual(step.state.phase, 'done');
  assert.strictEqual(step.finished, true);
  approx(step.opacity, 0);

  const largeStep = model.advanceIndicatorPhase(model.createIndicatorPhaseState(), 2, 0.5, 0.25);
  assert.strictEqual(largeStep.state.phase, 'done');
  assert.strictEqual(largeStep.finished, true);
  assert.strictEqual(largeStep.enteredCommit, true);

  const negativeStep = model.advanceIndicatorPhase(model.createIndicatorPhaseState(), -5, 0.5, 0.25);
  assert.strictEqual(negativeStep.state.phase, 'warning');
  approx(negativeStep.state.elapsed, 0);

  const zeroDurations = model.advanceIndicatorPhase(model.createIndicatorPhaseState(), 0, 0, 0, 0);
  assert.strictEqual(zeroDurations.state.phase, 'done');
  assert.strictEqual(zeroDurations.finished, true);

  console.log('Indicator model checks: PASS (5 shapes, clamping, deterministic phase timing)');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
