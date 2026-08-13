# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":"/mnt/data/aethervfx_work","artifact_path":"","state_revision":14,"last_updated":"2026-08-13T21:00:42Z","current_baseline":{"identity":"local source 285b01049b83f254aa3640618dc9cd560c243944; remote source checkpoint 961f39e5924cd3b22cf2646d4b72c330754e1150; later documentation commits do not change source identity","state":"current-baseline","last_verified":"2026-08-13T21:00:42Z"},"scope_boundaries":["AetherVFX local repo and westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React procedural VFX/ability workbench.
- Seven visible modes are protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Remote: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Local Phase 3 validation-hardening source: `285b01049b83f254aa3640618dc9cd560c243944`.
- Remote Phase 3 validation-hardening source: `961f39e5924cd3b22cf2646d4b72c330754e1150`.
- Documentation-only descendants do not redefine the source checkpoint.
- Phase 3 is source-complete and has dependency-free geometry/timing/orientation checks, but real Three.js browser validation remains open. Phase 4 is gated.

## 3. Artifact Contract

- Make existing modes truthful before adding breadth.
- Do not enter Phase 4 before the Phase 3 browser gate is resolved or explicitly accepted as a blocker.
- Build/source checks are not substitutes for browser behavior proof.
- Stage, commit, and publish each bounded checkpoint.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench","state":"requested","rule":"Keep all seven workbench modes visible while shallow paths become truthful working or explicitly staged paths.","scope":"Workbench shell","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Inspect mode routing after shell changes","last_checked":"revision 14","status":"active","recheck_trigger":"Navigation or mode-routing change"}
-->
### INV-001 — Preserve seven-mode workbench
- **State:** `requested` — all seven modes remain visible; shallow paths may be staged rather than faked.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"requested","rule":"Do not add modes, schools, major effect families, or renderer migrations while the active phase gate is unverified.","scope":"All implementation","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Map each change to the active roadmap phase","last_checked":"revision 14","status":"active","recheck_trigger":"Explicit user direction change"}
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
{"id":"VER-003","title":"Phase 3 surface source published","state":"verified","capability":"Directional surface projection, freehand reprojection, surface indicators, and Indicator Lab wiring are published.","scope":"Remote source","verification_method":"Local source gates plus GitHub fetch","evidence":"local b09f2ef346707c5a60e3946763684cf07a38bada; remote b68623b33b575b37462fe332de5af4cac35daa85","artifact_revision":"b68623b33b575b37462fe332de5af4cac35daa85","last_verified":"2026-08-13T20:10:00Z","dependencies":"GitHub connector/local tooling","freshness":"incorporated","recheck_trigger":"Surface/freehand/indicator change"}
-->
### VER-003 — Phase 3 surface source published
- **State:** `verified` — local `b09f2ef`; remote `b68623b3`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-004","title":"Phase 3 fixture and shader repair published","state":"verified","capability":"Opt-in ramp/step fixture and TerrainManager uMarkVariant binding are published.","scope":"Validation-support source","verification_method":"GitHub App/fixture/TerrainManager fetch","evidence":"local 9b34bc7be35bda6764229c64a12ca3210c2497e2; remote 5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","artifact_revision":"5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","last_verified":"2026-08-13T20:22:02Z","dependencies":"GitHub connector","freshness":"incorporated","recheck_trigger":"Fixture/surface-mark change"}
-->
### VER-004 — Phase 3 fixture and shader repair published
- **State:** `verified` — local `9b34bc7`; remote `5d7dfb8d`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-005","title":"Indicator model validation published","state":"verified","capability":"Five indicator outline families, clamps, and deterministic warning/commit/clear timing are covered by dependency-free executable checks and consumed by the manager.","scope":"Indicator geometry/timing model","verification_method":"indicator-model check, source graph, syntax pass, GitHub fetch","evidence":"local 3d5b92d46ed85efc0a018cf0a956130e5f09c8f5; remote 6f652628959b36f83362b447fe1cbf42fe809d55","artifact_revision":"6f652628959b36f83362b447fe1cbf42fe809d55","last_verified":"2026-08-13T20:54:44Z","dependencies":"Global TypeScript compiler and GitHub connector","freshness":"incorporated","recheck_trigger":"IndicatorModel or timing change"}
-->
### VER-005 — Indicator model validation published
- **State:** `verified` — five shape families and deterministic timing checks pass.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-006","title":"Surface-frame orientation model validation published","state":"verified","capability":"SurfaceQuery and indicators share one right-handed frame contract; horizontal, 15-degree slope, vertical, zero-normal, and direction-parallel-to-normal cases are dependency-free tested.","scope":"Surface frame construction and indicator local orientation","verification_method":"surface-frame check, indicator-model check, source graph, TS/TSX syntax pass, GitHub ref/source fetch","evidence":"local 285b01049b83f254aa3640618dc9cd560c243944; remote 961f39e5924cd3b22cf2646d4b72c330754e1150; Surface frame checks PASS; Indicator model checks PASS; Source graph PASS 62; TS/TSX syntax PASS 62","artifact_revision":"961f39e5924cd3b22cf2646d4b72c330754e1150","last_verified":"2026-08-13T21:00:42Z","dependencies":"Global TypeScript compiler and GitHub connector","freshness":"current source checkpoint","recheck_trigger":"SurfaceFrameModel, SurfaceQuery frame creation, or indicator basis change"}
-->
### VER-006 — Surface-frame orientation model validation published
- **State:** `verified` — shared handedness and slope/vertical/degenerate frame checks pass; source is published at `961f39e5`.
<!-- /operational-state:entry -->

## 6. Known Not Working

No active source-confirmed Phase 1-3 defect is recorded. Browser-only acceptance gaps remain unverified rather than inferred fixed.

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
{"id":"UNV-005","title":"Resource cleanup paths","state":"implemented-unverified","capability":"VFX, ability, terrain, indicator, fixture, and teardown cleanup paths exist.","evidence":"Source plus VfxPool check","validation_method":"Repeated browser lifecycle with renderer.info","recheck_trigger":"Ownership/disposal change"}
-->
### UNV-005 — Resource cleanup paths
- **State:** `implemented-unverified` — needs repeated browser lifecycle proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-006","title":"Live VFX preview/editor","state":"implemented-unverified","capability":"Deterministic preview, live module edits, seek/restart, and fixed-step controls are implemented.","evidence":"Phase 2 source checkpoint","validation_method":"Browser preview/edit/replay test","recheck_trigger":"Preview/editor change"}
-->
### UNV-006 — Live VFX preview/editor
- **State:** `implemented-unverified` — needs browser preview/edit/replay proof.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-007","title":"Surface-aware freehand and indicators","state":"implemented-unverified","capability":"Local-normal projection, freehand reprojection, and five indicator shapes with timing are implemented; pure geometry/timing/frame contracts are verified.","evidence":"Phase 3 source, fixture, VER-005 and VER-006","validation_method":"Use ?surfaceFixture=1 on ramp/steps in the actual Three.js app","recheck_trigger":"Surface/freehand/indicator/input change"}
-->
### UNV-007 — Surface-aware freehand and indicators
- **State:** `implemented-unverified` — pure contracts are verified; real Three.js surface placement/freehand still needs `?surfaceFixture=1`.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{"id":"UNK-001","title":"Dependency-resolved runtime unverified","state":"unknown","decisive_check":"Install dependencies; run lint, runtime-spine, source-graph, indicator-model, surface-frame, build, then browser smoke.","evidence":"Chromium and global TypeScript exist, but project node_modules is absent; npm install timed out and outbound package/CDN network access is unavailable.","last_checked":"revision 14"}
-->
### UNK-001 — Dependency-resolved runtime unverified
- **State:** `unknown` — decisive check remains dependency-resolved build + browser smoke.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNK-002","title":"Exact local/remote parity unverified","state":"unknown","decisive_check":"Fresh-clone remote and compare intended paths/hashes after connector-orphan cleanup.","evidence":"Connector publication produced different histories and may leave unreferenced shims.","last_checked":"revision 14"}
-->
### UNK-002 — Exact local/remote parity unverified
- **State:** `unknown` — fresh-clone/path-hash comparison required.
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{"id":"PND-001","title":"Parity cleanup","state":"pending","task":"Remove connector-only orphan files and normalize history when transport permits.","reason_pending":"Non-blocking to active graph.","dependency":"Normal Git transport/deletion support","priority":"low","validation_needed":"Fresh clone comparison","blocks_completion":false}
-->
### PND-001 — Parity cleanup
- **State:** `pending` — low priority; non-blocking.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-002","title":"Phase 3 browser surface validation","state":"pending","task":"Run ?surfaceFixture=1 and test all five indicator shapes plus freehand across ramp/steps.","reason_pending":"Actual Three.js/React browser proof is unavailable because project dependencies cannot be installed and outbound package/CDN access is blocked.","dependency":"Dependency-resolved browser environment","priority":"next","validation_needed":"Pointer hits, local orientation, no phantom y=0, timing, cleanup, Phase 2 smoke","blocks_completion":true}
-->
### PND-002 — Phase 3 browser surface validation
- **State:** `pending` — **next and blocking Phase 3 completion**.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-003","title":"Phase 4 factory/sequence runtime","state":"pending","task":"Implement schema-validated Ability Factory and semantic sequence nodes.","reason_pending":"Phase 3 browser gate is open.","dependency":"PND-002","priority":"later","validation_needed":"Ten declarative abilities plus node tests","blocks_completion":false}
-->
### PND-003 — Phase 4 factory/sequence runtime
- **State:** `pending` — blocked by PND-002.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-004","title":"Publish dependency-resolved CI validation","state":"pending","task":"Publish the local GitHub Actions validation workflow and run install/typecheck/runtime-spine/source-graph/indicator-model/surface-frame/build checks.","reason_pending":"Workflow publication is blocked by platform safety for .github/workflows paths.","dependency":"Normal Git transport or a connector path that permits workflow publication","priority":"next-supporting","validation_needed":"Confirm workflow exists remotely and inspect run result","blocks_completion":false}
-->
### PND-004 — Publish dependency-resolved CI validation
- **State:** `pending` — local workflow exists; remote publication did not occur.
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{"id":"DEC-001","title":"Assessment controls development order","state":"requested","rule":"Make existing modes truthful before breadth; follow ROADMAP.md; do not enter Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.","scope":"All AetherVFX work","authority":"Explicit user confirmation","evidence":"Accepted assessment and ROADMAP.md","validation_method":"Map each checkpoint to the roadmap gate","last_checked":"revision 14","status":"active","recheck_trigger":"Explicit user direction change"}
-->
### DEC-001 — Assessment controls development order
- **State:** `requested` — Phase 4 waits on PND-002.
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | State | Evidence | Decisive validation |
|---|---|---|---|
| VER-006 | verified | local `285b010`; remote `961f39e5`; surface-frame/model/source/syntax PASS | rerun pure/source checks + remote fetch |
| VER-005 | verified | local `3d5b92d`; remote `6f652628` | rerun indicator-model/source checks |
| UNV-006 | implemented-unverified | Phase 2 source | browser preview/edit/replay |
| UNV-007 | implemented-unverified | Phase 3 + fixture + pure contracts | `?surfaceFixture=1` browser gate |
| UNK-001 | unknown | dependencies unavailable | install/build + browser smoke |
| UNK-002 | unknown | connector-shaped histories | fresh-clone parity |

## 12. Current Change Scope and Impact Radius

- **Allowed next:** Phase 3 browser validation support and evidence-driven repairs only.
- **Protected:** Phase 1 timing/shake/resources; Phase 2 preview semantics; Phase 3 projection contracts; seven-mode shell.
- **Mandatory checks:** `check:indicator-model`, `check:surface-frame`, source graph, TS/TSX syntax/import graph, browser ramp/steps when dependencies exist, remote source verification after repair.
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
| 11 | Dependency-resolved CI workflow committed locally; remote workflow publication blocked. |
| 12-13 | Indicator geometry/timing model extracted, validated, and published. |
| 14 | Shared surface-frame model extracted, handedness unified, slope/vertical/degenerate orientation checks added, and source published at `961f39e5`. |
