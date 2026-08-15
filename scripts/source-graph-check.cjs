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

requireText('src/core/SurfaceFrameModel.ts', ['buildSurfaceFrameTuple', 'buildDirectionalSurfaceFrameTuple', 'mapLocalSurfacePoint']);
requireText('src/core/SurfaceQuery.ts', ['projectAlong(', 'projectNear(', 'buildSurfaceFrameTuple']);
requireText('src/drawing/FreehandCaster.ts', ['SurfaceQuery', 'projectNear(']);
requireText('src/indicators/IndicatorModel.ts', ['buildIndicatorLocalOutline', 'advanceIndicatorPhase']);
requireText('src/indicators/SurfaceIndicatorManager.ts', ['class SurfaceIndicatorManager', 'projectNear(', 'advanceIndicatorPhase', 'buildDirectionalSurfaceFrameTuple']);
requireText('src/validation/SurfaceValidationFixture.ts', ['class SurfaceValidationFixture', 'SurfaceValidationRamp', 'SurfaceValidationStep']);
requireText('src/validation/SurfaceRuntimeValidator.ts', ['runSurfaceRuntimeValidation', 'pointer-ramp', 'pointer-steps', 'indicator-conformance', 'freehand-steps']);
requireText('src/App.tsx', ['SurfaceIndicatorManager', 'new FreehandCaster(engine.scene, engine.surfaceQuery)', 'indicatorMgr.update(dt)', 'surfaceAutoTest', '__AETHERVFX_SURFACE_VALIDATION__']);
// Phase 5: persistent aftermath, mutations, and terraforming architecture
requireText('src/terrain/ResidueManager.ts', ['class ResidueManager', 'uMarkVariant', 'createVisual', 'removeVisual']);
requireText('src/terrain/TerrainDemo.ts', ['class TerrainDemo', 'sculptTerrain', 'applyHeightDelta']);
requireText('src/terrain/TerrainManager.ts', ['class TerrainManager', 'MutationManager', 'ResidueManager', 'TerrainDemo']);
requireText('src/mutation/MutationTypes.ts', ['MUTATION_SCHEMA_CURRENT_VERSION', 'MutationRecord', 'MutationDocument']);
requireText('src/mutation/MutationManager.ts', ['class MutationManager', 'beginTransaction', 'applyMutation', 'undo', 'redo', 'exportJson', 'importJson']);
requireText('src/schema/MutationSchema.ts', ['MUTATION_TYPES', 'MUTATION_RECORD_SCHEMA', 'MUTATION_DOCUMENT_SCHEMA_V1_0']);
requireText('src/schema/MutationValidator.ts', ['validateMutationDocument', 'parseMutationJson']);

// MutationManager and sequence runtime must never own wall-clock timing or unseeded randomness.
const mutationManagerText = fs.readFileSync(path.join(root, 'src/mutation/MutationManager.ts'), 'utf8');
for (const forbidden of ['setTimeout(', 'setInterval(', 'Date.now(', 'performance.now(', 'requestAnimationFrame(', 'Math.random(']) {
  if (mutationManagerText.includes(forbidden)) {
    console.error(`src/mutation/MutationManager.ts must not use ${forbidden}; pure deterministic state`);
    process.exit(1);
  }
}

// The sequence runtime must never own wall-clock timing.
const sequenceRuntimeText = fs.readFileSync(path.join(root, 'src/sequence/SequenceRuntime.ts'), 'utf8');
for (const forbidden of ['setTimeout(', 'setInterval(', 'Date.now(', 'performance.now(', 'requestAnimationFrame(', 'Math.random(']) {
  if (sequenceRuntimeText.includes(forbidden)) {
    console.error(`src/sequence/SequenceRuntime.ts must not use ${forbidden}; EngineClock owns simulation time`);
    process.exit(1);
  }
}

if (missing.length) {
  console.error('Missing relative imports:\n' + missing.join('\n'));
  process.exit(1);
}
if (staleImports.length) {
  console.error('Stale implementation imports:\n' + staleImports.join('\n'));
  process.exit(1);
}

console.log(`Source graph checks: PASS (${files.length} source files)`);
