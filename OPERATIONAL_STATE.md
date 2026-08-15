# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":".","artifact_path":"","state_revision":16,"last_updated":"2026-08-15T01:20:00Z","current_baseline":{"identity":"fresh durable local clone of origin/main at 5b030d7bddb2c772104080a4ce5785e389473c5f (HEAD c4bcafb); repaired by deleting orphaned src/vfx/runtime/ShockwaveRuntimeModule.ts, then dependency-resolved install/typecheck/checks/build and a real-browser ?surfaceAutoTest=1 run were completed against this clone before committing","state":"current-baseline","last_verified":"2026-08-15T01:20:00Z"},"scope_boundaries":["westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React procedural VFX/ability workbench.
- Seven visible modes are protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Canonical repository: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Remote Phase 3 validation-support source checkpoint: `5b030d7bddb2c772104080a4ce5785e389473c5f` (HEAD `c4bcafb` at clone time).
- A fresh durable local clone of `origin/main` was made for this revision. `npm install`, `tsc --noEmit`, all four `check:*` scripts, and `vite build` were run against it.
- One pre-existing defect was found and repaired: `src/vfx/runtime/ShockwaveRuntimeModule.ts` was dead/orphaned source importing a `ShockRing` class that no longer exists (renamed to `PulseRing`); it was never registered in `VfxModuleRegistry` (which wires the `shockwave` type to `PulseRuntimeModule`) and was not reachable from any import graph. It broke `tsc --noEmit`, and `scripts/source-graph-check.cjs` already treats the `ShockRing` name as a stale-path pattern. The file was deleted; no other source changed.
- `surfaceAutoTest=1` enables the validation fixture and runs an in-app Three.js runtime validator, exposes `window.__AETHERVFX_SURFACE_VALIDATION__`, and renders a visible PASS/FAIL overlay.
- **Phase 3 browser surface validation is now VERIFIED.** The route was run in a real Chromium browser against a local Vite dev server and returned `passed: true` on all 12 checks, with the visible "Surface runtime validation: PASS" overlay confirmed. See VER-008. Phase 4 is now unlocked per DEC-001/PND-002, but Phase 4 work was explicitly not started in this revision.

## 3. Artifact Contract

- Make existing modes truthful before adding breadth.
- Do not enter Phase 4 before the Phase 3 browser gate is resolved or explicitly accepted as a blocker.
- Build/source/self-test presence is not a substitute for actually running the browser route.
- Publish each bounded source checkpoint and preserve verified Phase 1-3 behavior.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench","state":"requested","rule":"Keep all seven workbench modes visible while shallow paths become truthful working or explicitly staged paths.","scope":"Workbench shell","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Inspect mode routing after shell changes","last_checked":"revision 15","status":"active","recheck_trigger":"Navigation or mode-routing change"}
-->
### INV-001 — Preserve seven-mode workbench
- **State:** `requested` — all seven modes remain visible; staged modes must not masquerade as complete.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"requested","rule":"Do not add modes, schools, major effect families, or renderer migrations while the active phase gate is unverified.","scope":"All implementation","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Map each change to the active roadmap phase","last_checked":"revision 15","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### INV-002 — No breadth before runtime truth
- **State:** `requested` — current phase gates control scope.
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
- **State:** `verified` — source route published at `5b030d7b`; runtime PASS is now claimed and evidenced below (VER-008).
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-008","title":"Phase 3 browser surface runtime validation PASS","state":"verified","capability":"Real Engine/SurfaceQuery/WebGLRenderer/SurfaceIndicatorManager/FreehandCaster executed in a live Chromium browser against a local Vite dev server (localhost:3001) via the ?surfaceAutoTest=1 route; window.__AETHERVFX_SURFACE_VALIDATION__.passed === true with 12/12 checks passing, and the visible \"Surface runtime validation: PASS\" overlay was confirmed on the rendered page.","scope":"Phase 3 validation-support runtime","verification_method":"Interactive browser execution (Claude Browser tool) after npm install/typecheck/checks/build all passed","evidence":"report generatedAt=2026-08-15T01:17:14.074Z; checks: webgl-context PASS, fixture-shape PASS(ramp=true steps=4), ramp-hit PASS, ramp-normal PASS(dot=1.000000), pointer-ramp PASS, step-hits PASS(4/4), pointer-steps PASS(4/4), no-phantom-floor PASS, indicator-conformance PASS(placements=10 maxDistance=0.0350), indicator-lifecycle PASS(10 placements), freehand-steps PASS(points=51 maxDistance=0.0000 yRange=1.950), freehand-cleanup PASS(children 23->23; geometries 6->7->6); zero console errors","artifact_revision":"local clone at c4bcafb plus deletion of ShockwaveRuntimeModule.ts","dependencies":"dependency-resolved Node/npm environment and an unrestricted browser, both now available (resolves UNK-001)","freshness":"current","recheck_trigger":"Runtime validator, fixture, App validation wiring, surface input, indicator, freehand, or renderer change"}
-->
### VER-008 — Phase 3 browser surface runtime validation PASS
- **State:** `verified` — real-browser `?surfaceAutoTest=1` run returned `passed: true`, 12/12 checks, visible PASS overlay confirmed, zero console errors.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-009","title":"Phase 2 regression smoke PASS","state":"verified","capability":"VFX Lab preview cast, pause, single-frame step while paused, seek/scrub, restart, and live parameter edit all confirmed on the default route (no query flags), with the seven-mode workbench shell intact.","scope":"Phase 2 live VFX preview/editor","verification_method":"Interactive browser smoke test on http://localhost:3001/ after the surface runtime validator passed","evidence":"Preview: 'Amber Orb' cast, timeline advanced (0.25/1.55s -> impact); Pause: button changed to Resume, timeline froze at 0.55/1.55s * hold; Step: advanced paused timeline to 0.6167s; Seek: scrubbing to 1.20s changed phase label hold->fade, confirming actual state change not just a slider redraw; Restart: reset to 0.00/1.55s * windup; Parameter edit: Orb radius 0.8->3 applied immediately under 'Runtime bound' label; zero console errors observed throughout","dependencies":"local dev server","freshness":"current","recheck_trigger":"Preview/editor change"}
-->
### VER-009 — Phase 2 regression smoke PASS
- **State:** `verified` — preview/pause/step/seek/restart/live-param-edit all confirmed working with no console errors.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-010","title":"Dependency-resolved install/typecheck/checks/build PASS","state":"verified","capability":"npm install, tsc --noEmit, all four check:* scripts, and vite build all succeed against a fresh local clone.","scope":"Full dependency-resolved toolchain","verification_method":"npm run lint; npm run check:runtime-spine; npm run check:indicator-model; npm run check:surface-frame; npm run check:source-graph; npm run build","evidence":"npm install: 221 packages added, 0 vulnerabilities; tsc --noEmit: clean after deleting orphaned ShockwaveRuntimeModule.ts; check:runtime-spine PASS; check:indicator-model PASS (5 shapes, clamping, deterministic phase timing); check:surface-frame PASS (horizontal, slope, vertical, degenerate direction, handedness); check:source-graph PASS (66 source files); vite build succeeded, dist/ produced (820.30 kB main bundle, chunk-size warning only, not a failure)","dependencies":"local Node/npm environment (resolves UNK-001)","freshness":"current","recheck_trigger":"Dependency, build tooling, or source-graph change"}
-->
### VER-010 — Dependency-resolved install/typecheck/checks/build PASS
- **State:** `verified` — install, typecheck, all four repo checks, and production build all pass on a fresh clone.
<!-- /operational-state:entry -->

## 6. Known Not Working

No active source-confirmed Phase 1-3 defect is recorded. `src/vfx/runtime/ShockwaveRuntimeModule.ts` (orphaned dead file, unreachable from any import graph, referencing a since-renamed `ShockRing` class) previously broke `tsc --noEmit`; it was deleted in revision 16 (see VER-010). The browser acceptance gate that remained open through revision 15 is now closed — see VER-008.

## 7. Implemented but Unverified

<!-- operational-state:entry
{"id":"UNV-002","title":"Frame timing repair","state":"implemented-unverified","capability":"Measured frame duration feeds performance metrics.","evidence":"Phase 1 source/focused checks","validation_method":"Browser artificial-load metrics","recheck_trigger":"Frame-loop change"}
-->
### UNV-002 — Frame timing repair
- **State:** `implemented-unverified` — needs browser artificial-load proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-003","title":"Camera shake restoration","state":"implemented-unverified","capability":"Shake offset is transient and restored.","evidence":"Source plus 100-cycle check","validation_method":"Browser camera integration","recheck_trigger":"Camera/post-processing change"}
-->
### UNV-003 — Camera shake restoration
- **State:** `implemented-unverified` — needs browser camera proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-004","title":"Deterministic runtime services","state":"implemented-unverified","capability":"EngineClock fixed-step/pause and SeededRandom are implemented.","evidence":"Focused checks","validation_method":"Dependency-resolved checks plus browser pause/step","recheck_trigger":"Clock/RNG change"}
-->
### UNV-004 — Deterministic runtime services
- **State:** `implemented-unverified` — needs dependency-resolved/browser proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-005","title":"Resource cleanup paths","state":"partially-verified","capability":"VFX, ability, terrain, indicator, fixture, and teardown cleanup paths exist; the runtime validator checks freehand scene/GPU geometry recovery and indicator lifecycle cleanup.","evidence":"VER-008: freehand-cleanup PASS (children 23->23; geometries 6->7->6), indicator-lifecycle PASS (10 placements, all removed)","validation_method":"Ran surfaceAutoTest route once; single-pass lifecycle confirmed, repeated-cycle/renderer.info stress soak not yet performed","recheck_trigger":"Ownership/disposal change"}
-->
### UNV-005 — Resource cleanup paths
- **State:** `partially-verified` — single-pass freehand and indicator cleanup confirmed via VER-008; a repeated-cycle stress soak remains unverified.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-006","title":"Live VFX preview/editor","state":"verified","capability":"Deterministic preview, live module edits, seek/restart, and fixed-step controls are implemented and confirmed working.","evidence":"VER-009 Phase 2 regression smoke PASS","validation_method":"Browser preview/edit/replay test","recheck_trigger":"Preview/editor change"}
-->
### UNV-006 — Live VFX preview/editor
- **State:** `verified` — see VER-009.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-007","title":"Surface-aware freehand and indicators","state":"verified","capability":"Local-normal projection, freehand reprojection, five indicator shapes, pointer raycast checks, timing, and cleanup validation are implemented and confirmed in a real browser runtime.","evidence":"Phase 3 source, fixture, VER-005, VER-006, VER-007, VER-008","validation_method":"Opened the app with ?surfaceAutoTest=1; window.__AETHERVFX_SURFACE_VALIDATION__.passed === true (12/12) plus the visible PASS overlay, both confirmed","recheck_trigger":"Surface/freehand/indicator/input/validator change"}
-->
### UNV-007 — Surface-aware freehand and indicators
- **State:** `verified` — decisive `?surfaceAutoTest=1` route run and confirmed PASS; see VER-008.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{"id":"UNK-001","title":"Dependency-resolved runtime unverified","state":"resolved","decisive_check":"Run install/typecheck/build and then open ?surfaceAutoTest=1 in an unrestricted browser; require runtime report PASS and perform the Phase 2 preview smoke.","evidence":"Revision 16: this environment had normal outbound network/package access and an unrestricted browser. See VER-008, VER-009, VER-010.","last_checked":"revision 16"}
-->
### UNK-001 — Dependency-resolved runtime unverified
- **State:** `resolved` — a normal dependency-resolved/unrestricted-browser environment was available in revision 16; see VER-008/VER-009/VER-010.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNK-002","title":"Exact local/remote parity unverified","state":"partially-resolved","decisive_check":"Fresh-clone remote and compare intended paths/hashes after connector-orphan cleanup.","evidence":"A fresh clone of origin/main (c4bcafb) was made in revision 16 and matched remote exactly prior to the local repair described in VER-010. Ongoing parity after this revision's push is established by the push itself, not independently re-verified.","last_checked":"revision 16"}
-->
### UNK-002 — Exact local/remote parity unverified
- **State:** `partially-resolved` — a fresh clone matched remote exactly before this revision's repair commit; PND-001 connector-orphan cleanup remains open.
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{"id":"PND-001","title":"Parity cleanup","state":"pending","task":"Remove connector-only orphan files and normalize history when normal Git transport permits.","reason_pending":"Non-blocking to active graph.","dependency":"Normal Git transport/deletion support","priority":"low","validation_needed":"Fresh clone comparison","blocks_completion":false}
-->
### PND-001 — Parity cleanup
- **State:** `pending` — low priority; non-blocking.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-002","title":"Phase 3 browser surface validation","state":"resolved","task":"Open ?surfaceAutoTest=1 in an unrestricted browser and require the runtime report to PASS; then smoke the Phase 2 VFX preview/edit/replay path.","reason_pending":"Resolved in revision 16 — see VER-008 (runtime PASS) and VER-009 (Phase 2 smoke PASS).","dependency":"Normal dependency-resolved browser environment","priority":"done","validation_needed":"WebGL context, ramp/step SurfaceQuery hits, camera-NDC pointer hits, no phantom floor, ten indicator placements across ramp+step, warning/commit/fade cleanup, freehand traversal across four step heights, scene/GPU geometry recovery, Phase 2 smoke — all confirmed","blocks_completion":false}
-->
### PND-002 — Phase 3 browser surface validation
- **State:** `resolved` — `?surfaceAutoTest=1` returned PASS (12/12) with the visible overlay confirmed; Phase 2 smoke also passed. See VER-008, VER-009.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-003","title":"Phase 4 factory/sequence runtime","state":"pending","task":"Implement schema-validated Ability Factory and semantic sequence nodes.","reason_pending":"Unlocked as of revision 16 (PND-002 resolved) but intentionally not started in this revision, per explicit instruction to stop at Phase 3 validation.","dependency":"PND-002 (resolved)","priority":"later","validation_needed":"Ten declarative abilities plus node tests","blocks_completion":false}
-->
### PND-003 — Phase 4 factory/sequence runtime
- **State:** `pending` — unlocked (PND-002 resolved) but explicitly not started in revision 16.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-004","title":"Publish dependency-resolved CI validation","state":"pending","task":"Publish the local GitHub Actions validation workflow and run install/typecheck/runtime-spine/source-graph/indicator-model/surface-frame/build checks.","reason_pending":"Workflow publication remains blocked by platform safety for .github/workflows paths.","dependency":"Normal Git transport or a connector path that permits workflow publication","priority":"supporting","validation_needed":"Confirm workflow exists remotely and inspect run result","blocks_completion":false}
-->
### PND-004 — Publish dependency-resolved CI validation
- **State:** `pending` — supporting path only; it does not replace PND-002 browser evidence.
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{"id":"DEC-001","title":"Assessment controls development order","state":"requested","rule":"Make existing modes truthful before breadth; follow ROADMAP.md; do not enter Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.","scope":"All AetherVFX work","authority":"Explicit user confirmation","evidence":"Accepted assessment and ROADMAP.md; PND-002 resolved in revision 16 (VER-008, VER-009)","validation_method":"Map each checkpoint to the roadmap gate","last_checked":"revision 16","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### DEC-001 — Assessment controls development order
- **State:** `requested` — PND-002 is resolved, so Phase 4 is unlocked; it was explicitly not started in revision 16.
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | State | Evidence | Decisive validation |
|---|---|---|---|
| VER-008 | verified real-browser runtime | local clone; `?surfaceAutoTest=1`; 12/12 checks PASS; visible overlay confirmed | rerun `?surfaceAutoTest=1` after any surface/indicator/freehand/validator change |
| VER-009 | verified real-browser smoke | preview/pause/step/seek/restart/param-edit all confirmed on default route | rerun Phase 2 smoke after any preview/editor change |
| VER-010 | verified toolchain | install/typecheck/4 checks/build all PASS on fresh clone | rerun after dependency or build tooling change |
| VER-007 | verified source route | remote `5b030d7b`; bounded 3-file diff; changed-file syntax pass | re-fetch runtime validator/App wiring |
| VER-006 | verified pure model | remote `961f39e5`; surface-frame/model/source/syntax PASS | rerun pure/source checks |
| VER-005 | verified pure model | remote `6f652628`; indicator-model checks | rerun indicator-model/source checks |
| UNV-006 | verified | VER-009 | browser preview/edit/replay — done |
| UNV-007 | verified | VER-008 | `?surfaceAutoTest=1` report PASS — done |
| UNK-001 | resolved | VER-008/009/010 | unrestricted install/build/browser smoke — done |
| UNK-002 | partially-resolved | fresh clone matched remote before repair commit | ongoing parity re-check after future divergence |

## 12. Current Change Scope and Impact Radius

- **Allowed next:** Phase 4 is unlocked (PND-002 resolved) but was not started in revision 16. Any future work should follow ROADMAP.md and PND-003.
- **Protected:** Phase 1 timing/shake/resources; Phase 2 preview semantics (re-confirmed by VER-009); Phase 3 projection/frame contracts; seven-mode shell (re-confirmed visible in revision 16 smoke test); default route without validation query flags (re-confirmed it does not run the validator).
- **Mandatory checks after any repair:** indicator model, surface frame, source graph, TS/TSX syntax/typecheck/build, `?surfaceAutoTest=1` runtime report, Phase 2 preview smoke, remote source verification — all run and passing as of revision 16.
- **Stop:** Phase 4 was intentionally not started in this revision, per explicit instruction, even though it is now unlocked.

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
