# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":".","artifact_path":"","state_revision":23,"last_updated":"2026-08-18T18:30:40Z","current_baseline":{"identity":"Phase 6 release-gate repair candidate; PR CI green; final release verification pending headed reference performance baseline/regression and final main CI","state":"repair-candidate","last_verified":"2026-08-18T18:30:40Z"},"scope_boundaries":["westkitty/3js-VFX-platform"],"linked_parent_state":null}
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
- **Phase 6 implementation is published and PR release-gate CI is green, but FINAL RELEASE VERIFICATION remains blocked pending the headed reference performance baseline/repeatability/regression and final green main CI**:
  1. Real Performance Lab Test Harness (`src/performance/PerformanceHarness.ts`, `src/performance/MetricsCollector.ts`, `src/performance/PerformanceBaseline.ts`, `src/performance/PerformanceScenarioRegistry.ts`).
  2. Ten deterministic performance scenarios (`idle_baseline`, `sequential_casts_100`, `concurrent_abilities_4`, `overload_burst`, `particle_scaling`, `residue_scaling`, `telegraphs_100`, `editor_open_active_mutation`, `freehand_path_workload`, `terrain_raycast_sweep`) plus discrete particle/residue scaling profiles pass the headless CI smoke lifecycle gate with zero raw texture and geometry leaks after renderer-owned lazy resources are initialized before scenario baselines.
  3. Automated performance baseline/regression runner and comparator are implemented (`scripts/run-perf-suite.ts`), but the invalid old baseline was removed. No authoritative headed reference `benchmarks/performance/baseline.json` is currently approved; baseline creation, repeatability, and full regression remain pending.
  4. Playwright visual regression suite (`tests/visual.spec.ts`) has 8 deterministic golden fixtures with <=2% diff tolerance; the Darwin visual gate is green on the current repair candidate.
  5. Playwright browser functional and security boundary test suite (`tests/browser.spec.ts`) has bounded `window.__AETHERVFX_TEST_API__` restricted to `?testMode=1` / `?perfTest=1`; 8/8 browser tests pass on current PR CI.
  6. Shader and material safety gate (`scripts/shader-safety-check.ts`) audits custom GLSL shaders and material cache safety and is green on current PR CI.
  7. GitHub Actions CI workflow (`.github/workflows/validate.yml`) is green on repair-head PR run #9 (`32170579822`) for unit/schema/shader gates, production build, browser tests, performance smoke, static dist smoke, and Darwin visual regression.
  8. Static production build and dist-only boot are verified by `npm run build` plus `npm run test:static` in current PR CI.
  9. Dependency, licensing, and provenance inventory complete (`LICENSE` Apache-2.0, `LICENSE-MIT`, `THIRD_PARTY_NOTICES.md`, `PROVENANCE.md`).
  10. Authoritative release documentation (`README.md`) reflects the repair-candidate release gate.

## 3. Artifact Contract

- Make existing modes truthful before adding breadth.
- Phases 1-5 remain verified. Phase 6 is a repair candidate until the headed reference performance baseline/repeatability/regression and final green main CI are recorded.
- Build/source/self-test presence is backed by actual browser execution and visual snapshot comparison.
- Maintain full backward compatibility and zero resource leaks across all workloads.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench","state":"verified","rule":"Keep all seven workbench modes visible while shallow paths become truthful working or explicitly staged paths.","scope":"Workbench shell","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Inspect mode routing after shell changes","last_checked":"revision 23","status":"active","recheck_trigger":"Navigation or mode-routing change"}
-->
### INV-001 — Preserve seven-mode workbench
- **State:** `verified` — all seven modes (VFX Lab, Ability Factory, Macro Lab, Terraformer, Telegraphs, Freehand Drawing, Perf Lab) are truthful, functional, and browser-tested.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"verified","rule":"Do not add modes, schools, major effect families, or renderer migrations while the active phase gate is unverified.","scope":"All implementation","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Map each change to the active roadmap phase","last_checked":"revision 23","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### INV-002 — No breadth before runtime truth
- **State:** `verified` — breadth remains locked: Phases 1-5 are verified; Phase 6 PR gates are green, but final release verification still requires the headed reference performance baseline/repeatability/regression and final main CI.
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
{"id":"VER-018","title":"Phase 6 Performance Harness Smoke and Lifecycle Gate","state":"verified","capability":"The real Performance Lab harness runs the ten deterministic roadmap scenarios plus discrete scaling profiles with fixed simulation deltas, RAF-to-RAF frame timing, p50/p95/p99 tracking, renderer counters, and strict raw zero-leak lifecycle checks after renderer-owned lazy resources are initialized before baselines.","scope":"Performance harness and CI smoke lifecycle gate","verification_method":"GitHub Actions PR run #9: npm run test:perf:smoke","evidence":"run 32170579822 on repair head da0986a (PR merge build 9f8ef35): renderer prime tex 2->3 before scenario baselines; all real scenarios then 3->3 with 0 leaked textures and 0 leaked geometries; smoke exits normally","artifact_revision":"da0986aef5135d2c82f1f1eebba4e95b23701435","last_verified":"2026-08-18T18:30:35Z","dependencies":"Playwright Chromium, WebGLRenderer","freshness":"current PR CI","recheck_trigger":"PerformanceHarness, performance scenarios, renderer/material path, AbilityManager, ResidueManager, or EngineClock changes"}
-->
### VER-018 — Phase 6 Performance Harness Smoke and Lifecycle Gate
- **State:** `verified` — current PR CI smoke runs all roadmap/scaling workloads with strict raw zero resource-leak deltas and exits normally. The renderer-owned fallback texture is initialized before scenario baselines. **This does not substitute for the still-pending headed reference baseline/repeatability/regression.**
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-019","title":"Phase 6 Deterministic Visual Regression Suite","state":"verified","capability":"Playwright visual regression suite renders 8 deterministic fixtures covering baseline scene, cone, circle, arrow line indicators, impact decals, terrain mutations, freehand drawing, and sequence indicators against golden snapshot PNGs.","scope":"Visual regression tests","verification_method":"Darwin visual regression gate","evidence":"GitHub Actions PR run #9 (32170579822), visual-darwin PASS with reviewed deterministic goldens and <=2% diff tolerance","artifact_revision":"da0986aef5135d2c82f1f1eebba4e95b23701435","last_verified":"2026-08-18","dependencies":"Playwright Chromium on macOS","freshness":"current PR CI","recheck_trigger":"Shader, renderer, indicator geometry, or visual styling changes"}
-->
### VER-019 — Phase 6 Deterministic Visual Regression Suite
- **State:** `verified` — current repair-head Darwin visual regression gate passes all 8 reviewed deterministic fixtures.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-020","title":"Phase 6 Browser & Runtime Security Boundaries","state":"verified","capability":"Playwright functional test suite verifies security boundaries (production route does not expose test APIs), test mode harness (?testMode=1), canvas startup, mode switches, casting, mutations, undo/redo, counter reconciliation, and sequence playback.","scope":"Browser runtime and security boundary","verification_method":"npm run test:browser in GitHub Actions PR run #9","evidence":"run 32170579822: 8/8 browser tests PASS","artifact_revision":"da0986aef5135d2c82f1f1eebba4e95b23701435","last_verified":"2026-08-18T18:23:09Z","dependencies":"Playwright Chromium","freshness":"current PR CI","recheck_trigger":"App testApi wiring or mode routing changes"}
-->
### VER-020 — Phase 6 Browser & Runtime Security Boundaries
- **State:** `verified` — 8/8 browser runtime tests pass on current PR CI with the security boundary intact.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-021","title":"Phase 6 Shader & Material Safety Gate","state":"verified","capability":"Shader safety gate audits all custom GLSL shaders (vertex/fragment pairs, uniform binding correctness) and ensures onBeforeCompile materials define customProgramCacheKey to prevent WebGL program recompile memory leaks.","scope":"Shaders and materials","verification_method":"npm run check:shader-safety in GitHub Actions PR run #9","evidence":"run 32170579822: 8 shader files and 73 source files PASS","artifact_revision":"da0986aef5135d2c82f1f1eebba4e95b23701435","last_verified":"2026-08-18T18:22:43Z","dependencies":"Node.js tsx","freshness":"current PR CI","recheck_trigger":"Shader or material updates"}
-->
### VER-021 — Phase 6 Shader & Material Safety Gate
- **State:** `verified` — current PR CI reports 0 shader/material safety failures.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-022","title":"Phase 6 CI Workflow, Packaging, and Documentation","state":"verified","capability":"The repaired GitHub Actions PR pipeline validates unit/schema/shader gates, production build, browser tests, performance smoke, clean dist-only static boot, and Darwin visual regression; Apache-2.0 and upstream MIT provenance documents are present.","scope":"Release packaging, CI, and documentation","verification_method":"GitHub Actions PR run #9 plus dist-only Playwright smoke","evidence":"run 32170579822: validate SUCCESS, visual-darwin SUCCESS, static.spec.ts 1/1 PASS; LICENSE, LICENSE-MIT, THIRD_PARTY_NOTICES.md, PROVENANCE.md, README.md present","artifact_revision":"da0986aef5135d2c82f1f1eebba4e95b23701435","last_verified":"2026-08-18T18:30:40Z","dependencies":"Vite, TypeScript, Playwright, GitHub Actions","freshness":"current PR CI","recheck_trigger":"Packaging, CI workflow, dependency, or release documentation changes"}
-->
### VER-022 — Phase 6 CI Workflow, Packaging, and Documentation
- **State:** `verified` — repair-head PR CI is fully green, including clean static-dist boot; this verifies the PR gate, not the still-pending headed reference performance baseline or post-merge main CI.
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
| VER-018 | verified PR smoke lifecycle gate | run #9: renderer prime owns one-time 2->3 texture initialization; all real scenarios/profiles then raw 3->3 with 0 leaks; smoke exits normally | create headed reference baseline/repeatability, then run matched full regression; rerun smoke after rendering/lifecycle changes |
| VER-019 | verified visual regression | run #9 Darwin visual gate PASS on 8 reviewed deterministic fixtures, <=2% tolerance | rerun `npm run test:visual` after shader or visual styling changes |
| VER-020 | verified browser suite | run #9 `npm run test:browser` 8/8 PASS, security boundaries verified | rerun `npm run test:browser` after App wiring changes |
| VER-021 | verified shader safety | run #9 `npm run check:shader-safety` PASS (8 shaders, 73 source files) | rerun after GLSL shader/material changes |
| VER-022 | verified PR CI/static packaging | run #9 validate + Darwin SUCCESS; dist-only static smoke 1/1 PASS; licensing/provenance present | headed reference performance proof, then merge and require final main CI green |

## 12. Current Change Scope and Impact Radius

- **Platform Status:** Phases 1-5 are **VERIFIED COMPLETE**. Phase 6 repair-head PR CI is **GREEN**; final release status remains blocked only on the authoritative headed reference performance baseline/repeatability/regression and final green main CI.
- **Test Entry Points:** `npm test` intentionally runs the pure/unit release checks only (`test:unit`). Browser, visual, performance, static, and local full-release paths remain explicit scripts (`test:browser`, `test:visual`, `test:perf`, `test:perf:baseline`, `test:perf:smoke`, `test:static`, `test:release-local`).
- **Production Build:** Vite production bundle and clean dist-only boot pass. Current bundle still emits a non-blocking >500 kB chunk-size warning.

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
| 23 | **Phase 6 PR release gates green.** Repaired benchmark server shutdown and renderer-owned lazy texture accounting without whitelisting leaks: a disposable MeshStandardMaterial/shadow preflight initializes Three.js renderer fallback resources before scenario baselines (`tex 2->3`), then every real roadmap/scaling workload remains raw `3->3` with zero leaks. PR CI run #9 (`32170579822`) passed unit/schema/shader, build, 8/8 browser tests, performance smoke, 1/1 clean static-dist smoke, and Darwin visual regression. Corrected stale claims that a headed golden performance baseline already exists or that `npm test` runs the entire release pipeline. Final release verification still requires headed reference baseline/repeatability/regression and final green main CI. |
