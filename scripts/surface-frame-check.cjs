const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aethervfx-surface-frame-'));

try {
  execFileSync('tsc', [
    'src/core/SurfaceFrameModel.ts',
    '--target', 'ES2020',
    '--module', 'CommonJS',
    '--outDir', tempRoot,
    '--skipLibCheck',
  ], { cwd: root, stdio: 'pipe' });

  const model = require(path.join(tempRoot, 'SurfaceFrameModel.js'));
  const approx = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
  const dot = model.dot3;
  const length = (value) => Math.sqrt(model.lengthSq3(value));
  const assertUnitFrame = (frame) => {
    approx(length(frame.normal), 1);
    approx(length(frame.tangent ?? frame.forward), 1);
    approx(length(frame.bitangent ?? frame.right), 1);
    const forward = frame.tangent ?? frame.forward;
    const right = frame.bitangent ?? frame.right;
    approx(dot(frame.normal, forward), 0, 1e-8);
    approx(dot(frame.normal, right), 0, 1e-8);
    approx(dot(forward, right), 0, 1e-8);
  };

  const horizontal = model.buildSurfaceFrameTuple([0, 1, 0]);
  assertUnitFrame(horizontal);
  assert.deepStrictEqual(horizontal.tangent, [0, 0, 1]);
  assert.deepStrictEqual(horizontal.bitangent, [1, 0, 0]);

  const vertical = model.buildSurfaceFrameTuple([0, 0, 1]);
  assertUnitFrame(vertical);
  approx(dot(vertical.normal, [0, 0, 1]), 1);

  const zero = model.buildSurfaceFrameTuple([0, 0, 0]);
  assertUnitFrame(zero);
  assert.deepStrictEqual(zero.normal, [0, 1, 0]);

  const rampNormal = model.normalize3([Math.sin(Math.PI / 12), Math.cos(Math.PI / 12), 0]);
  const ramp = model.buildDirectionalSurfaceFrameTuple(rampNormal, [0, 0, 1], [0, 0, 1]);
  assertUnitFrame(ramp);
  approx(dot(ramp.normal, ramp.forward), 0, 1e-8);
  approx(dot(ramp.normal, ramp.right), 0, 1e-8);

  const mapped = model.mapLocalSurfacePoint([9, 1.2, -1], ramp, [2, 5]);
  const offset = [mapped[0] - 9, mapped[1] - 1.2, mapped[2] + 1];
  approx(dot(offset, ramp.normal), 0, 1e-8);

  const degenerateDirection = model.buildDirectionalSurfaceFrameTuple([0, 1, 0], [0, 10, 0], [0, 0, 1]);
  assertUnitFrame(degenerateDirection);
  assert.deepStrictEqual(degenerateDirection.forward, [0, 0, 1]);
  assert.deepStrictEqual(degenerateDirection.right, [1, 0, 0]);

  console.log('Surface frame checks: PASS (horizontal, slope, vertical, degenerate direction, handedness)');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
