# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":".","artifact_path":"","state_revision":15,"last_updated":"2026-08-14T00:59:00Z","current_baseline":{"identity":"remote source checkpoint 5b030d7bddb2c772104080a4ce5785e389473c5f; current container has no durable local clone; later documentation commits do not change source identity","state":"current-baseline","last_verified":"2026-08-14T00:59:00Z"},"scope_boundaries":["westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React procedural VFX/ability workbench.
- Seven visible modes are protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Canonical repository: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Remote Phase 3 validation-support source checkpoint: `5b030d7bddb2c772104080a4ce5785e389473c5f`.
- The previous local working directory was lost when the execution container recycled; GitHub is the durable source of truth for this checkpoint.
- `surfaceAutoTest=1` now enables the validation fixture and runs an in-app Three.js runtime validator, exposes `window.__AETHERVFX_SURFACE_VALIDATION__`, and renders a visible PASS/FAIL overlay.
- Phase 3 remains browser-unverified until that route runs in an unrestricted browser and returns PASS. Phase 4 remains gated.

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
- **State:** `verified` — source route published at `5b030d7b`; runtime PASS is not yet claimed.
<!-- /operational-state:entry -->

## 6. Known Not Working

No active source-confirmed Phase 1-3 defect is recorded. The remaining browser acceptance gate is unverified, not inferred fixed.

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
{"id":"UNV-005","title":"Resource cleanup paths","state":"implemented-unverified","capability":"VFX, ability, terrain, indicator, fixture, and teardown cleanup paths exist; the new runtime validator checks freehand scene/GPU geometry recovery when executed.","evidence":"Source plus VfxPool checks and VER-007 route","validation_method":"Run surfaceAutoTest route plus repeated browser lifecycle with renderer.info","recheck_trigger":"Ownership/disposal change"}
-->
### UNV-005 — Resource cleanup paths
- **State:** `implemented-unverified` — runtime validator can now exercise freehand geometry recovery, but has not yet run in an unrestricted browser.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-006","title":"Live VFX preview/editor","state":"implemented-unverified","capability":"Deterministic preview, live module edits, seek/restart, and fixed-step controls are implemented.","evidence":"Phase 2 source checkpoint","validation_method":"Browser preview/edit/replay test","recheck_trigger":"Preview/editor change"}
-->
### UNV-006 — Live VFX preview/editor
- **State:** `implemented-unverified` — needs browser preview/edit/replay proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-007","title":"Surface-aware freehand and indicators","state":"implemented-unverified","capability":"Local-normal projection, freehand reprojection, five indicator shapes, pointer raycast checks, timing, and cleanup validation are implemented; pure contracts are verified and a real-runtime auto-test route is published.","evidence":"Phase 3 source, fixture, VER-005, VER-006, VER-007","validation_method":"Open the app with ?surfaceAutoTest=1 and require window.__AETHERVFX_SURFACE_VALIDATION__.passed === true plus the visible PASS overlay","recheck_trigger":"Surface/freehand/indicator/input/validator change"}
-->
### UNV-007 — Surface-aware freehand and indicators
- **State:** `implemented-unverified` — decisive route is now `?surfaceAutoTest=1`; source existence alone does not close it.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{"id":"UNK-001","title":"Dependency-resolved runtime unverified","state":"unknown","decisive_check":"Run install/typecheck/build and then open ?surfaceAutoTest=1 in an unrestricted browser; require runtime report PASS and perform the Phase 2 preview smoke.","evidence":"Current container has Chromium and global TypeScript but no project node_modules. Machine Chromium policy sets URLBlocklist=[*], blocking file:// and localhost navigation with ERR_BLOCKED_BY_ADMINISTRATOR; outbound sockets/package/CDN access are also unavailable.","last_checked":"revision 15"}
-->
### UNK-001 — Dependency-resolved runtime unverified
- **State:** `unknown` — the current execution environment cannot perform the decisive browser load without bypassing platform policy, which is prohibited.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNK-002","title":"Exact local/remote parity unverified","state":"unknown","decisive_check":"Fresh-clone remote and compare intended paths/hashes after connector-orphan cleanup.","evidence":"The prior local clone was lost on container recycle; connector publication also produced historical local/remote divergence.","last_checked":"revision 15"}
-->
### UNK-002 — Exact local/remote parity unverified
- **State:** `unknown` — GitHub is the current durable source; fresh-clone parity remains the decisive check.
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{"id":"PND-001","title":"Parity cleanup","state":"pending","task":"Remove connector-only orphan files and normalize history when normal Git transport permits.","reason_pending":"Non-blocking to active graph.","dependency":"Normal Git transport/deletion support","priority":"low","validation_needed":"Fresh clone comparison","blocks_completion":false}
-->
### PND-001 — Parity cleanup
- **State:** `pending` — low priority; non-blocking.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-002","title":"Phase 3 browser surface validation","state":"pending","task":"Open ?surfaceAutoTest=1 in an unrestricted browser and require the runtime report to PASS; then smoke the Phase 2 VFX preview/edit/replay path.","reason_pending":"The current container's managed Chromium blocks all navigation and outbound sockets; bypassing that platform policy is out of scope.","dependency":"Normal dependency-resolved browser environment","priority":"next","validation_needed":"WebGL context, ramp/step SurfaceQuery hits, camera-NDC pointer hits, no phantom floor, ten indicator placements across ramp+step, warning/commit/fade cleanup, freehand traversal across four step heights, scene/GPU geometry recovery, Phase 2 smoke","blocks_completion":true}
-->
### PND-002 — Phase 3 browser surface validation
- **State:** `pending` — **next and blocking Phase 3 completion**. Run `?surfaceAutoTest=1`; PASS must be observed, not assumed.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-003","title":"Phase 4 factory/sequence runtime","state":"pending","task":"Implement schema-validated Ability Factory and semantic sequence nodes.","reason_pending":"Phase 3 browser gate is open.","dependency":"PND-002","priority":"later","validation_needed":"Ten declarative abilities plus node tests","blocks_completion":false}
-->
### PND-003 — Phase 4 factory/sequence runtime
- **State:** `pending` — blocked by PND-002.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-004","title":"Publish dependency-resolved CI validation","state":"pending","task":"Publish the local GitHub Actions validation workflow and run install/typecheck/runtime-spine/source-graph/indicator-model/surface-frame/build checks.","reason_pending":"Workflow publication remains blocked by platform safety for .github/workflows paths.","dependency":"Normal Git transport or a connector path that permits workflow publication","priority":"supporting","validation_needed":"Confirm workflow exists remotely and inspect run result","blocks_completion":false}
-->
### PND-004 — Publish dependency-resolved CI validation
- **State:** `pending` — supporting path only; it does not replace PND-002 browser evidence.
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{"id":"DEC-001","title":"Assessment controls development order","state":"requested","rule":"Make existing modes truthful before breadth; follow ROADMAP.md; do not enter Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.","scope":"All AetherVFX work","authority":"Explicit user confirmation","evidence":"Accepted assessment and ROADMAP.md","validation_method":"Map each checkpoint to the roadmap gate","last_checked":"revision 15","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### DEC-001 — Assessment controls development order
- **State:** `requested` — Phase 4 waits on PND-002.
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | State | Evidence | Decisive validation |
|---|---|---|---|
| VER-007 | verified source route | remote `5b030d7b`; bounded 3-file diff; changed-file syntax pass | re-fetch runtime validator/App wiring |
| VER-006 | verified pure model | remote `961f39e5`; surface-frame/model/source/syntax PASS | rerun pure/source checks |
| VER-005 | verified pure model | remote `6f652628`; indicator-model checks | rerun indicator-model/source checks |
| UNV-006 | implemented-unverified | Phase 2 source | browser preview/edit/replay |
| UNV-007 | implemented-unverified | Phase 3 + fixture + pure contracts + runtime auto-test source | `?surfaceAutoTest=1` report PASS |
| UNK-001 | unknown | current browser/package environment blocked | unrestricted install/build/browser smoke |
| UNK-002 | unknown | local clone lost; connector-shaped history | fresh-clone parity |

## 12. Current Change Scope and Impact Radius

- **Allowed next:** execute the published Phase 3 runtime validator in a normal browser and make only evidence-driven Phase 3 repairs.
- **Protected:** Phase 1 timing/shake/resources; Phase 2 preview semantics; Phase 3 projection/frame contracts; seven-mode shell; default route without validation query flags.
- **Mandatory checks after any repair:** indicator model, surface frame, source graph, TS/TSX syntax/typecheck/build when available, `?surfaceAutoTest=1` runtime report, Phase 2 preview smoke, remote source verification.
- **Stop:** no Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.

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
