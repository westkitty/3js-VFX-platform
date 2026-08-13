const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (extensions.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...extensions.map((ext) => base + ext),
    ...extensions.map((ext) => path.join(base, 'index' + ext)),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

const files = walk(src);
const missing = [];
const staleImports = [];
const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.[^'"]+)['"]/g;
const stalePathPattern = /(?:RibbonStrip|ParticleEmitter|ShockRing)(?:\.tsx?|\/|['"])/;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importPattern.exec(text))) {
    const specifier = match[1];
    if (!resolveRelative(file, specifier)) missing.push(`${path.relative(root, file)} -> ${specifier}`);
    if (stalePathPattern.test(specifier)) staleImports.push(`${path.relative(root, file)} -> ${specifier}`);
  }
}

function requireText(relativePath, needles) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${relativePath}`);
  const text = fs.readFileSync(full, 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) throw new Error(`${relativePath} missing required marker: ${needle}`);
  }
}

requireText('src/core/SurfaceQuery.ts', ['projectAlong(', 'projectNear(']);
requireText('src/drawing/FreehandCaster.ts', ['SurfaceQuery', 'projectNear(']);
requireText('src/indicators/SurfaceIndicatorManager.ts', ['class SurfaceIndicatorManager', 'projectNear(']);
requireText('src/validation/SurfaceValidationFixture.ts', ['class SurfaceValidationFixture', 'SurfaceValidationRamp', 'SurfaceValidationStep']);
requireText('src/App.tsx', ['SurfaceIndicatorManager', 'new FreehandCaster(engine.scene, engine.surfaceQuery)', 'indicatorMgr.update(dt)', 'surfaceFixture']);
requireText('src/terrain/TerrainManager.ts', ['uMarkVariant']);

if (missing.length) {
  console.error('Missing relative imports:\n' + missing.join('\n'));
  process.exit(1);
}
if (staleImports.length) {
  console.error('Stale implementation imports:\n' + staleImports.join('\n'));
  process.exit(1);
}

console.log(`Source graph checks: PASS (${files.length} source files)`);
