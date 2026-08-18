# AetherVFX — Deterministic Three.js Ability & Procedural VFX Framework

AetherVFX is a Three.js + React + TypeScript workbench for deterministic ability
casting, procedural VFX, targeting telegraphs, surface-aware freehand paths,
semantic multi-stage sequences, persistent aftermath, and terrain mutation.

The seven protected workbench modes are:

1. VFX Laboratory
2. Ability Factory
3. Macro Sandbox
4. Terraformer
5. Telegraph Lab
6. Freehand Caster
7. Performance Lab

## Current release status

Phases 1–5 are verified checkpoints. Phase 6 adds performance measurement,
visual regression, project-local Playwright tests, static-release checks, CI,
and provenance gates. **Do not call a commit release-verified merely because the
Phase 6 source exists.** Release status is governed by `OPERATIONAL_STATE.md` and
requires a passing reference performance baseline, deterministic visual goldens,
clean static build proof, and green final CI.

## Requirements

- Node.js 20 is the CI reference runtime.
- npm with the committed `package-lock.json`.
- Chromium installed through Playwright for browser tests:

```bash
npm ci
npx playwright install chromium
```

On Linux CI, `npx playwright install --with-deps chromium` installs system
browser dependencies as well.

## Development

```bash
npm run dev
```

Default development route: `http://localhost:3000/`.

The default route does not expose the test API. Test-only routes such as
`?testMode=1`, `?surfaceFixture=1`, and `?perfTest=1` exist solely for automated
validation.

## Validation commands

```bash
npm run test:unit
npm run build
npm run test:browser
npm run test:visual
npm run test:perf:smoke
npm run test:static
```

`npm test` intentionally aliases the pure/unit-style gate. Browser installation
is an explicit prerequisite rather than a hidden side effect of `npm test`.

### Pure/static checks

- `npm run lint`
- `npm run check:runtime-spine`
- `npm run check:source-graph`
- `npm run check:indicator-model`
- `npm run check:surface-frame`
- `npm run check:ability-schema`
- `npm run check:sequence-runtime`
- `npm run check:world-effects`
- `npm run check:mutation-state`
- `npm run check:shader-safety`

### Browser and visual checks

- `npm run test:browser` — protected runtime/user-path regression suite.
- `npm run test:visual` — deterministic fixed-step visual snapshots.
- `npm run test:visual:update` — intentionally regenerates the current platform's
  visual goldens; review the resulting image diff before accepting it.
- `npm run test:static` — builds must already exist; serves **only `dist/`** with
  a plain static HTTP server and checks startup, all seven modes, test-API
  absence, console errors, and failed requests.

Visual fixtures use exact EngineClock steps, not wall-clock sleeps. The maximum
allowed pixel-diff ratio is 0.02.

## Performance gate

`npm run test:perf:smoke` is a headless semantic/lifecycle smoke test suitable
for CI. It is **not** the authoritative hardware performance baseline.

The local reference performance workflow is:

```bash
npm run test:perf:baseline
npm run test:perf
```

`test:perf:baseline` runs headed Chromium in the reference environment, records
two independent full runs, performs one bounded third run only if repeatability
exceeds 10%, and writes `baseline-repeatability.json` only when the selected pair
is stable. `test:perf` then performs an independent same-environment regression
run and enforces the relative thresholds.

The benchmark records actual requestAnimationFrame-to-requestAnimationFrame wall
time while simulation advances through fixed EngineClock steps. It also records
renderer/resource counts and six discrete scaling profiles in addition to the ten
roadmap scenarios:

- particles: 1,000 / 10,000 / 50,000
- residues: 100 / 500 / 2,000

Performance reports include viewport, DPR, browser/user agent, WebGL renderer,
Three.js revision, and the source commit injected by Vite at build/dev startup.
Incompatible environments are reported as mismatches, not regressions.

## Static production build

```bash
npm run build
python3 -m http.server 4173 --directory dist
```

The decisive static check is `npm run test:static`, which opens the `dist/`
output through a plain HTTP server rather than Vite's development transforms.

## Architecture anchors

- `src/core/EngineClock.ts` — simulation-time authority.
- `src/core/SeededRandom.ts` — deterministic random source.
- `src/abilities/AbilityRegistry.ts` — validated ability identity/admission.
- `src/sequence/` — deterministic semantic sequence runtime.
- `src/core/SurfaceQuery.ts` — surface geometry authority.
- `src/mutation/MutationManager.ts` — persistent mutation state/transactions.
- `src/terrain/ResidueManager.ts` — visual aftermath ownership/disposal.
- `src/performance/` — benchmark metrics, scenarios, scaling profiles, baseline comparison.

## Licensing and provenance

This project is derived from MIT-licensed `achrefelouafi/LinearAbiltyCastingThreeJS`.
The upstream MIT notice is preserved in `LICENSE-MIT`. AetherVFX files/contributions
with Apache-2.0 SPDX headers are additionally marked Apache-2.0. See:

- `LICENSE` (Apache-2.0 text for Apache-marked contributions)
- `LICENSE-MIT` (preserved upstream MIT notice)
- `THIRD_PARTY_NOTICES.md`
- `PROVENANCE.md`

Those files preserve the upstream notice instead of incorrectly relabeling the
upstream project as Apache-only.
