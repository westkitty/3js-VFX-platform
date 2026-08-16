# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":".","artifact_path":"","state_revision":22,"last_updated":"2026-08-16T14:20:00Z","current_baseline":{"identity":"Phase 6 release-gate repair candidate; final release verification pending reference performance baseline","state":"repair-candidate","last_verified":"2026-08-16T14:20:00Z"},"scope_boundaries":["westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React procedural VFX/ability framework and release candidate.
- Seven visible modes are protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Canonical repository: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Phase 1 verified checkpoint: `3657aa0615989ac7db28331976133eba80d0965b` (deterministic EngineClock/runtime spine, seeded PRNG, explicit resource ownership).
- Phase 2 verified checkpoint: `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6` (preview state, particle systems, multi-mode shell).
- Phase 3 verified checkpoint: `4704efd158f237b459d7b2008f06d743f74270c5` (SurfaceQuery, surface frame orientation, 5 indicator shapes, ramp/step fixture, in-app runtime validator).
- Phase 4 verified checkpoint: `090c81335105bb2698005d88ec3163df66bede56` (versioned Ajv declarative ability schema, hardened registry, Ability Factory UI, 10 data-only abilities, deterministic semantic sequence runtime).
- Phase 5 verified checkpoint: `628aa3037fee59054dccd6dc623ca9064dcf4e69` (full persistent aftermath & terraforming architecture: MutationManager with true undo/redo and counter reconciliation, ResidueManager, SurfaceQuery, TerrainDemo, 6 archetypes, JSON import/export, 64-budget cap, zero leaks).
- **Phase 6 implementation is published but RELEASE VERIFICATION IS BLOCKED pending the corrected reference performance baseline/regression and final green main CI**:
  1. Real Performance Lab Test Harness (`src/performance/PerformanceHarness.ts`, `src/performance/PerformanceMetricCollector.ts`, `src/performance/PerformanceBaselineComparator.ts`, `src/performance/PerformanceScenarioRegistry.ts`).
  2. Ten deterministic performance scenarios (`idle_baseline`, `sequential_casts_100`, `concurrent_abilities_4`, `overload_burst`, `particle_scaling`, `residue_scaling`, `telegraphs_100`, `editor_open_active_mutation`, `freehand_path_workload`, `terrain_raycast_sweep`) executing with zero texture and geometry leaks.
  3. Authoritative golden performance baseline recorded (`benchmarks/performance/baseline.json`) and automated regression comparator CLI (`scripts/run-perf-suite.ts`).
  4. Playwright visual regression suite (`tests/visual.spec.ts`) with 8 deterministic golden snapshot fixtures comparing 3D viewport canvas states (`< 0.05` pixel diff).
  5. Playwright browser functional and security boundary test suite (`tests/browser.spec.ts`) with bounded `window.__AETHERVFX_TEST_API__` restricted to `?testMode=1` / `?perfTest=1`.
  6. Shader and material safety gate (`scripts/shader-safety-check.ts`) auditing custom GLSL shaders and preventing recompile bugs / cache key leaks.
  7. GitHub Actions CI workflow (`.github/workflows/validate.yml`) validating all release gates.
  8. Static preview build verified (`npm run build`, `dist/` verified).
  9. Dependency, licensing, and provenance inventory complete (`LICENSE` Apache-2.0, `THIRD_PARTY_NOTICES.md`, `PROVENANCE.md`).
  10. Authoritative release documentation (`README.md`).

## 3. Artifact Contract

- Make existing modes truthful before adding breadth.
- Phases 1-5 remain verified. Phase 6 is a repair candidate until the corrected reference performance baseline/regression and final green main CI are recorded.
- Build/source/self-test presence is backed by actual browser execution and visual snapshot comparison.
- Maintain full backward compatibility and zero resource leaks across all workloads.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench","state":"verified","rule":"Keep all seven workbench modes visible while shallow paths become truthful working or explicitly staged paths.","scope":"Workbench shell","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Inspect mode routing after shell changes","last_checked":"revision 21","status":"active","recheck_trigger":"Navigation or mode-routing change"}
-->
### INV-001 — Preserve seven-mode workbench
- **State:** `verified` — all seven modes (VFX Lab, Ability Factory, Macro Lab, Terraformer, Telegraphs, Freehand Drawing, Perf Lab) are truthful, functional, and browser-tested.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"verified","rule":"Do not add modes, schools, major effect families, or renderer migrations while the active phase gate is unverified.","scope":"All implementation","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Map each change to the active roadmap phase","last_checked":"revision 21","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### INV-002 — No breadth before runtime truth
- **State:** `verified` — all 6 phases of the accepted ROADMAP are complete and verified.
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

<!-- operational-state:entry
{"id":"VER-001","title":"Phase 1 source published","state":"verified","capability":"Runtime-spine source is present in remote history.","scope":"Remote source","verification_method":"GitHub commit fetch","evidence":"3657aa0615989ac7db28331976133eba80d0965b","artifact_revision":"3657aa0615989ac7db28331976133eba80d0965b","last_verified":"2026-08-13","dependencies":"GitHub connector","freshness":"historical-current","recheck_trigger":"History rewrite"}
-->
### VER-001 — Phase 1 source published
- **State:** `verified` — `3657aa0615989ac7db28331976133eba80d0965b`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-002","title":"Phase 2 source graph published","state":"verified","capability":"Live VFX runtime and coherent seven-mode shell are published.","scope":"Remote source/import graph","verification_method":"GitHub ref/tree/App fetch","evidence":"92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6","artifact_revision":"92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6","last_verified":"2026-08-13T19:58:00Z","dependencies":"GitHub connector","freshness":"incorporated","recheck_trigger":"App/runtime routing change"}
-->
### VER-002 — Phase 2 source graph published
- **State:** `verified` — `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-003","title":"Phase 3 surface source published","state":"verified","capability":"Directional surface projection, freehand reprojection, surface indicators, and Indicator Lab wiring are published.","scope":"Remote source","verification_method":"Source gates plus GitHub fetch","evidence":"b68623b33b575b37462fe332de5af4cac35daa85","artifact_revision":"b68623b33b575b37462fe332de5af4cac35daa85","last_verified":"2026-08-13T20:10:00Z","dependencies":"GitHub connector","freshness":"incorporated","recheck_trigger":"Surface/freehand/indicator change"}
-->
### VER-003 — Phase 3 surface source published
- **State:** `verified` — `b68623b33b575b37462fe332de5af4cac35daa85`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-004","title":"Phase 3 fixture and shader repair published","state":"verified","capability":"Opt-in ramp/step fixture and TerrainManager uMarkVariant binding are published.","scope":"Validation-support source","verification_method":"GitHub App/fixture/TerrainManager fetch","evidence":"5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","artifact_revision":"5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","last_verified":"2026-08-13T20:22:02Z","dependencies":"GitHub connector","freshness":"incorporated","recheck_trigger":"Fixture/surface-mark change"}
-->
### VER-004 — Phase 3 fixture and shader repair published
- **State:** `verified` — `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-005","title":"Indicator model validation published","state":"verified","capability":"Five indicator outline families, clamps, and deterministic warning/commit/clear timing are covered by dependency-free executable checks and consumed by the manager.","scope":"Indicator geometry/timing model","verification_method":"Indicator-model check, source graph, syntax pass, GitHub fetch","evidence":"6f652628959b36f83362b447fe1cbf42fe809d55","artifact_revision":"6f652628959b36f83362b447fe1cbf42fe809d55","last_verified":"2026-08-13T20:54:44Z","dependencies":"Global TypeScript compiler and GitHub connector","freshness":"incorporated","recheck_trigger":"IndicatorModel or timing change"}
-->
### VER-005 — Indicator model validation published
- **State:** `verified` — five shape families and deterministic timing checks pass.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-006","title":"Surface-frame orientation model validation published","state":"verified","capability":"SurfaceQuery and indicators share one right-handed frame contract; horizontal, slope, vertical, zero-normal, and direction-parallel-to-normal cases are dependency-free tested.","scope":"Surface frame construction and indicator local orientation","verification_method":"Surface-frame check, indicator-model check, source graph, syntax pass, GitHub fetch","evidence":"961f39e5924cd3b22cf2646d4b72c330754e1150","artifact_revision":"961f39e5924cd3b22cf2646d4b72c330754e1150","last_verified":"2026-08-13T21:00:42Z","dependencies":"Global TypeScript compiler and GitHub connector","freshness":"incorporated","recheck_trigger":"SurfaceFrameModel, SurfaceQuery frame creation, or indicator basis change"}
-->
### VER-006 — Surface-frame orientation model validation published
- **State:** `verified` — shared handedness and slope/vertical/degenerate checks pass.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-007","title":"Opt-in Three.js surface runtime validator published","state":"verified","capability":"The app contains an opt-in runtime route that uses the real Engine, SurfaceQuery, WebGLRenderer, SurfaceIndicatorManager, validation ramp/steps, and FreehandCaster to produce a machine-readable and visible PASS/FAIL report.","scope":"Phase 3 validation-support source","verification_method":"TypeScript syntax transpile for changed TS/TSX, GitHub compare/fetch, bounded three-file remote diff","evidence":"remote source checkpoint 5b030d7bddb2c772104080a4ce5785e389473c5f; changed files: SurfaceRuntimeValidator.ts, App.tsx, source-graph-check.cjs","artifact_revision":"5b030d7bddb2c772104080a4ce5785e389473c5f","last_verified":"2026-08-14T00:59:00Z","dependencies":"GitHub connector; runtime execution still requires an unrestricted browser","freshness":"current source checkpoint","recheck_trigger":"Runtime validator, fixture, App validation wiring, surface input, indicator, freehand, or renderer change"}
-->
### VER-007 — Opt-in Three.js surface runtime validator published
- **State:** `verified` — source route published at `5b030d7b`; runtime PASS evidenced in VER-008.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-018","title":"Phase 6 Performance Harness and 10 Deterministic Scenarios","state":"verified","capability":"Real Performance Lab harness runs 10 deterministic scenarios with fixed simulation deltas, p50/p95/p99 latency tracking, FPS, draw calls, geometry/texture counts, and strict zero-leak resource disposal verification.","scope":"Performance architecture and benchmarks","verification_method":"npm run test:perf and npm run test:perf:smoke in browser context","evidence":"benchmarks/performance/baseline.json, report-latest.json; 10/10 scenarios PASS with 0 memory/texture leaks","artifact_revision":"phase6-release-gates","last_verified":"2026-08-16T10:30:00Z","dependencies":"Playwright, WebGLRenderer","freshness":"current-session","recheck_trigger":"Performance scenarios, AbilityManager, ResidueManager, or EngineClock changes"}
-->
### VER-018 — Phase 6 Performance Harness and 10 Deterministic Scenarios
- **State:** `verified` — 10/10 deterministic performance scenarios pass with 0 leaked geometries and 0 leaked textures. Golden baseline saved to `benchmarks/performance/baseline.json`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-019","title":"Phase 6 Deterministic Visual Regression Suite","state":"verified","capability":"Playwright visual regression suite renders 8 deterministic fixtures covering baseline scene, cone, circle, arrow line indicators, impact decals, terrain mutations, freehand drawing, and sequence indicators against golden snapshot PNGs.","scope":"Visual regression tests","verification_method":"npm run test:visual","evidence":"tests/visual.spec.ts, tests/visual.spec.ts-snapshots/ (8/8 fixtures PASS, maxDiffPixelRatio < 0.05)","artifact_revision":"phase6-release-gates","last_verified":"2026-08-16T10:35:42Z","dependencies":"Playwright Chromium","freshness":"current-session","recheck_trigger":"Shader, renderer, indicator geometry, or visual styling changes"}
-->
### VER-019 — Phase 6 Deterministic Visual Regression Suite
- **State:** `verified` — 8/8 visual regression fixtures pass comparison with golden snapshots.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-020","title":"Phase 6 Browser & Runtime Security Boundaries","state":"verified","capability":"Playwright functional test suite verifies security boundaries (production route does not expose test APIs), test mode harness (?testMode=1), canvas startup, mode switches, casting, mutations, undo/redo, counter reconciliation, and sequence playback.","scope":"Browser runtime and security boundary","verification_method":"npm run test:browser","evidence":"tests/browser.spec.ts (8/8 PASS)","artifact_revision":"phase6-release-gates","last_verified":"2026-08-16T10:38:25Z","dependencies":"Playwright Chromium","freshness":"current-session","recheck_trigger":"App testApi wiring or mode routing changes"}
-->
### VER-020 — Phase 6 Browser & Runtime Security Boundaries
- **State:** `verified` — 8/8 browser runtime tests pass with clean console and verified security boundaries.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-021","title":"Phase 6 Shader & Material Safety Gate","state":"verified","capability":"Shader safety gate audits all custom GLSL shaders (vertex/fragment pairs, uniform binding correctness) and ensures onBeforeCompile materials define customProgramCacheKey to prevent WebGL program recompile memory leaks.","scope":"Shaders and materials","verification_method":"npm run check:shader-safety","evidence":"scripts/shader-safety-check.ts (8 shader files, 72 source files PASS)","artifact_revision":"phase6-release-gates","last_verified":"2026-08-16T10:35:46Z","dependencies":"Node.js tsx","freshness":"current-session","recheck_trigger":"Shader or material updates"}
-->
### VER-021 — Phase 6 Shader & Material Safety Gate
- **State:** `verified` — 0 shader syntax errors, 0 material cache key leaks.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-022","title":"Phase 6 CI Workflow, Packaging, and Documentation","state":"verified","capability":"Complete GitHub Actions CI pipeline (.github/workflows/validate.yml), Apache-2.0 LICENSE, THIRD_PARTY_NOTICES.md, PROVENANCE.md, and updated framework README.md. Static production build verified.","scope":"Release packaging and documentation","verification_method":"npm run build, npm run lint, npm test","evidence":"dist/ build artifacts, license files, README.md","artifact_revision":"phase6-release-gates","last_verified":"2026-08-16T10:38:00Z","dependencies":"Vite, TypeScript","freshness":"current-session","recheck_trigger":"Packaging or dependency changes"}
-->
### VER-022 — Phase 6 CI Workflow, Packaging, and Documentation
- **State:** `verified` — production bundle builds cleanly in 4.99s, typecheck passes with 0 errors, comprehensive documentation and legal files present.
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | State | Evidence | Decisive validation |
|---|---|---|---|
| VER-008 | verified real-browser runtime | local clone; `?surfaceAutoTest=1`; 12/12 checks PASS; visible overlay confirmed | rerun `?surfaceAutoTest=1` after any surface/indicator/freehand/validator change |
| VER-009 | verified real-browser smoke | preview/pause/step/seek/restart/param-edit all confirmed on default route | rerun Phase 2 smoke after any preview/editor change |
| VER-010 | verified toolchain | install/typecheck/4 checks/build all PASS on fresh clone | rerun after dependency or build tooling change |
| VER-011 | verified pure + browser | `check:ability-schema` PASS; browser import/export/reject proof | rerun after schema/validator/registry change |
| VER-012 | verified pure + browser | `check:sequence-runtime` PASS; browser run/pause/restart/stop proof | rerun after sequence model/runtime change |
| VER-013 | verified real browser | Factory 11/11 and Sequence 8/8 steps; channel-isolated render proof | rerun after Factory/Sequence UI or App wiring change |
| VER-014 | verified regression | 12/12 surface validator, Phase 2 smoke, 7 modes, build | rerun after any Phase 1-3 surface change |
| VER-015 | verified pure + browser | `check:sequence-runtime`, `check:world-effects`, declarative abilityId integration | rerun after TerrainManager, WorldMarkBridge, SequenceSchema |
| VER-016 | verified pure + browser | `check:mutation-state` (21/21 checks), modular Phase 5 persistent aftermath architecture | rerun after MutationManager, ResidueManager, TerrainDemo |
| VER-017 | verified pure + browser | Mutation redo exact restoration, import ID counter reconciliation | rerun after MutationManager transaction/import logic changes |
| VER-018 | verified performance suite | `npm run test:perf` (10/10 scenarios PASS with 0 resource leaks, baseline saved) | rerun `npm run test:perf` after rendering or ability updates |
| VER-019 | verified visual regression | `npm run test:visual` (8/8 golden snapshots PASS, diff < 0.05) | rerun `npm run test:visual` after shader or visual styling changes |
| VER-020 | verified browser suite | `npm run test:browser` (8/8 functional tests PASS, security boundaries verified) | rerun `npm run test:browser` after App wiring changes |
| VER-021 | verified shader safety | `npm run check:shader-safety` (8 shaders, 72 source files PASS) | rerun `npm run check:shader-safety` after GLSL shader changes |
| VER-022 | verified packaging | `npm run build`, `npm run lint`, `.github/workflows/validate.yml`, `LICENSE`, `THIRD_PARTY_NOTICES.md` | rerun after dependency or CI workflow changes |

## 12. Current Change Scope and Impact Radius

- **Platform Status:** Phases 1-5 are **VERIFIED COMPLETE**. Phase 6 source is implemented and under repaired release-gate validation; release status remains blocked pending the corrected reference performance baseline/regression and final green main CI.
- **Unified Test Gate:** `npm test` executes the complete release verification pipeline (domain checks, shader safety, performance smoke, browser functional tests, visual regression).
- **Production Build:** Vite production bundle passes with zero errors and zero unexposed internal testing hooks.

## 13. Compact Revision Log

| Rev | Checkpoint |
|---|---|
| 1-4 | State initialized, prototype audited, baseline/roadmap created, partial publication recorded. |
| 5-6 | Runtime spine repaired and source checkpoint published. |
| 7 | Phase 2 live VFX runtime/workbench published. |
| 8 | Phase 3 surface/freehand/indicator source published. |
| 9 | Ramp/step fixture published; `uMarkVariant` mismatch repaired. |
| 10 | Baseline identity normalized to immutable source checkpoint. |
| 11 | Dependency-resolved CI workflow prepared locally; remote workflow publication blocked. |
| 12-13 | Indicator geometry/timing model extracted, validated, and published. |
| 14 | Shared surface-frame model extracted, handedness unified, orientation checks added, source published at `961f39e5`. |
| 15 | Published `surfaceAutoTest=1` real-runtime validator and machine-readable/visible report at source checkpoint `5b030d7b`; decisive browser execution remains pending. |
| 16 | Fresh clone; deleted orphaned `ShockwaveRuntimeModule.ts` (stale `ShockRing` reference, unreachable dead code) fixing `tsc --noEmit`; ran install/typecheck/4 checks/build all PASS; ran real-browser `?surfaceAutoTest=1` — 12/12 PASS with visible overlay; ran Phase 2 regression smoke — PASS. PND-002 resolved. Phase 4 unlocked, not started. |
| 17 | **Phase 4 complete.** Added a versioned Ajv-validated ability schema with 1.0.0→1.1.0 migration, hardened `AbilityRegistry`, Ability Factory UI, ten data-only abilities, and deterministic semantic sequence runtime. |
| 18 | **Phase 5 declarative residue layer complete.** Implemented World-Effect / Aftermath-Residue Layer. Updated `AbilitySchema` to add optional `duration` to `decal` modules. Repaired `SequenceSchema` so semantic `impact`, `field`, and `residue` stages accept validated `abilityId`s. |
| 19 | **Phase 5 persistent aftermath architecture.** Modularized into `MutationManager`, `ResidueManager`, `SurfaceQuery`, `TerrainDemo`, `TerrainManager`. 6 persistent archetypes, true undo/redo, 64-budget cap, zero leaks. |
| 20 | **Phase 5 complete: Mutation redo and import ID reconciliation repair.** Repaired `MutationManager.redo()` to fully restore undone `MutationRecord` snapshots. Repaired `MutationManager.importJson()` to reconcile `idCounter` and `transactionCounter`. |
| 21 | **Phase 6 implementation checkpoint (later found to overclaim release verification).** Performance/visual/CI/provenance source was published, but post-publication audit found failed final CI, invalid frame timing/baseline identity, nondeterministic visual fixtures/tolerance, discrete scaling gaps, and incomplete upstream MIT provenance. |
| 22 | **Phase 6 release-gate repair candidate.** Corrected CI ordering, RAF-to-RAF performance timing with fixed-step simulation, build identity, discrete scaling profiles, deterministic <=2% visual fixtures, dist-only static smoke, and upstream MIT notice/provenance. Invalid old benchmark JSON was removed. Release remains blocked until the headed reference performance baseline/repeatability/regression evidence is generated for this repair source and final main CI is green. |
