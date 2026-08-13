# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":"/mnt/data/aethervfx_work","artifact_path":"","state_revision":11,"last_updated":"2026-08-13T20:35:23Z","current_baseline":{"identity":"local source 9b34bc7be35bda6764229c64a12ca3210c2497e2; remote source checkpoint 5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2; later documentation commits do not change source identity","state":"current-baseline","last_verified":"2026-08-13T20:24:13Z"},"scope_boundaries":["AetherVFX local repo and westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React VFX/ability workbench.
- Seven visible modes remain protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Remote: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Local Phase 3 source: `9b34bc7be35bda6764229c64a12ca3210c2497e2`.
- Remote Phase 3 source: `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`.
- Documentation-only descendants do not redefine the source checkpoint.
- Phase 3 is source-complete but browser-unverified; Phase 4 is gated.

## 3. Artifact Contract

- Make existing modes truthful before adding breadth.
- Do not enter Phase 4 before the Phase 3 browser gate is resolved or explicitly accepted as a blocker.
- Source/build evidence is not browser-behavior proof.
- Stage, commit, and publish bounded checkpoints.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench","state":"requested","rule":"Keep all seven modes visible while shallow paths become truthful working or staged paths.","scope":"Workbench shell","authority":"Accepted assessment","evidence":"ROADMAP.md","validation_method":"Inspect mode routing","last_checked":"revision 10","status":"active","recheck_trigger":"Navigation change"}
-->
### INV-001 — Preserve seven-mode workbench
- **State:** `requested` — all seven modes remain visible; shallow paths may be staged rather than faked.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"requested","rule":"Do not add modes, schools, effect families, or renderer migrations while the active gate is unverified.","scope":"All implementation","authority":"Accepted assessment","evidence":"ROADMAP.md","validation_method":"Map work to current phase","last_checked":"revision 10","status":"active","recheck_trigger":"Explicit direction change"}
-->
### INV-002 — No breadth before runtime truth
- **State:** `requested` — current phase gates control scope.
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

<!-- operational-state:entry
{"id":"VER-001","title":"Phase 1 source published","state":"verified","capability":"Runtime-spine source exists in remote history.","scope":"Remote source","verification_method":"GitHub commit fetch","evidence":"3657aa0615989ac7db28331976133eba80d0965b","artifact_revision":"3657aa0615989ac7db28331976133eba80d0965b","last_verified":"2026-08-13","dependencies":"GitHub connector","freshness":"historical-current","recheck_trigger":"History rewrite"}
-->
### VER-001 — Phase 1 source published
- **State:** `verified` — `3657aa0615989ac7db28331976133eba80d0965b`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-002","title":"Phase 2 source graph published","state":"verified","capability":"Live VFX runtime and coherent seven-mode shell are in remote history.","scope":"Remote source/import graph","verification_method":"GitHub ref/tree/App fetch","evidence":"92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6","artifact_revision":"92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6","last_verified":"2026-08-13T19:58:00Z","dependencies":"GitHub connector","freshness":"incorporated","recheck_trigger":"App/runtime routing change"}
-->
### VER-002 — Phase 2 source graph published
- **State:** `verified` — `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-003","title":"Phase 3 surface source published","state":"verified","capability":"Directional projection, freehand reprojection, surface indicators, and Indicator Lab wiring are published.","scope":"Remote source","verification_method":"Local gates plus GitHub fetch","evidence":"local b09f2ef346707c5a60e3946763684cf07a38bada; remote b68623b33b575b37462fe332de5af4cac35daa85","artifact_revision":"b68623b33b575b37462fe332de5af4cac35daa85","last_verified":"2026-08-13T20:10:00Z","dependencies":"GitHub connector/local tooling","freshness":"incorporated","recheck_trigger":"Surface/freehand/indicator change"}
-->
### VER-003 — Phase 3 surface source published
- **State:** `verified` — local `b09f2ef`; remote `b68623b3`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-004","title":"Phase 3 fixture and shader repair published","state":"verified","capability":"Opt-in ramp/step fixture and TerrainManager uMarkVariant binding are published.","scope":"Validation-support source","verification_method":"GitHub App/fixture/TerrainManager fetch","evidence":"local 9b34bc7be35bda6764229c64a12ca3210c2497e2; remote 5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","artifact_revision":"5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","last_verified":"2026-08-13T20:22:02Z","dependencies":"GitHub connector","freshness":"current source","recheck_trigger":"Fixture/surface mark change"}
-->
### VER-004 — Phase 3 fixture and shader repair published
- **State:** `verified` — local `9b34bc7`; remote `5d7dfb8d`.
<!-- /operational-state:entry -->

## 6. Known Not Working

No active source-confirmed Phase 1-3 defect is recorded. Browser acceptance gaps remain unverified rather than inferred fixed.

## 7. Implemented but Unverified

<!-- operational-state:entry
{"id":"UNV-002","title":"Frame timing repair","state":"implemented-unverified","capability":"Measured frame duration feeds performance metrics.","evidence":"Phase 1 source/focused checks","validation_method":"Browser artificial-load metrics","recheck_trigger":"Frame loop change"}
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
{"id":"UNV-007","title":"Surface-aware freehand and indicators","state":"implemented-unverified","capability":"Local-normal projection, freehand reprojection, and five indicator shapes with timing are implemented.","evidence":"Phase 3 source plus fixture","validation_method":"Use ?surfaceFixture=1 on ramp/steps","recheck_trigger":"Surface/freehand/indicator/input change"}
-->
### UNV-007 — Surface-aware freehand and indicators
- **State:** `implemented-unverified` — run `?surfaceFixture=1` browser gate.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{"id":"UNK-001","title":"Dependency-resolved runtime unverified","state":"unknown","decisive_check":"Install dependencies; run lint, runtime-spine, source-graph, build, then browser smoke.","evidence":"Current container lacks frontend dependencies.","last_checked":"revision 10"}
-->
### UNK-001 — Dependency-resolved runtime unverified
- **State:** `unknown` — decisive check is dependency-resolved build + browser smoke.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNK-002","title":"Exact local/remote parity unverified","state":"unknown","decisive_check":"Fresh-clone remote and compare intended paths/hashes after connector-orphan cleanup.","evidence":"Connector produced different histories and may leave unreferenced shims.","last_checked":"revision 10"}
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
{"id":"PND-002","title":"Phase 3 browser surface validation","state":"pending","task":"Run ?surfaceFixture=1 and test all five indicator shapes plus freehand across ramp/steps.","reason_pending":"Browser proof unavailable here.","dependency":"Dependency-resolved browser environment","priority":"next","validation_needed":"Pointer hits, local orientation, no phantom y=0, timing, cleanup, Phase 2 smoke","blocks_completion":true}
-->
### PND-002 — Phase 3 browser surface validation
- **State:** `pending` — **next and blocking Phase 3 completion**.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-003","title":"Phase 4 factory/sequence runtime","state":"pending","task":"Implement schema-validated Ability Factory and semantic sequence nodes.","reason_pending":"Phase 3 gate open.","dependency":"PND-002","priority":"later","validation_needed":"Ten declarative abilities plus node tests","blocks_completion":false}
-->
### PND-003 — Phase 4 factory/sequence runtime
- **State:** `pending` — blocked by PND-002.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-004","title":"Publish dependency-resolved CI validation","state":"pending","task":"Publish the local GitHub Actions validation workflow and run install/typecheck/runtime-spine/source-graph/build checks.","reason_pending":"The workflow is committed locally but platform safety blocked two contents writes and one Git-tree fallback before GitHub accepted the workflow file.","dependency":"Normal Git transport or a future connector path that permits workflow publication","priority":"next-supporting","validation_needed":"Confirm workflow exists on remote, inspect run result, and separate compiler/build failures from browser-only gaps","blocks_completion":false}
-->
### PND-004 — Publish dependency-resolved CI validation
- **State:** `pending` — local workflow commit `11bf7937ffda65a0fc882fa9ecfd454d52606765`; remote publication did not occur.
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{"id":"DEC-001","title":"Assessment controls development order","state":"requested","rule":"Make existing modes truthful before breadth; follow ROADMAP.md; do not enter Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.","scope":"All AetherVFX work","authority":"Explicit user confirmation","evidence":"Accepted assessment/roadmap","validation_method":"Map checkpoint to roadmap gate","last_checked":"revision 10","status":"active","recheck_trigger":"Explicit direction change"}
-->
### DEC-001 — Assessment controls development order
- **State:** `requested` — Phase 4 waits on PND-002.
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | State | Evidence | Decisive validation |
|---|---|---|---|
| VER-004 | verified | local `9b34bc7`; remote `5d7dfb8d` | source re-fetch |
| UNV-006 | implemented-unverified | Phase 2 source | browser preview/edit/replay |
| UNV-007 | implemented-unverified | Phase 3 + fixture | `?surfaceFixture=1` browser gate |
| UNK-001 | unknown | dependencies unavailable | build + browser smoke |
| UNK-002 | unknown | connector-shaped histories | fresh-clone parity |

## 12. Current Change Scope and Impact Radius

- **Allowed next:** Phase 3 browser validation support and evidence-driven repairs only.
- **Protected:** Phase 1 timing/shake/resources; Phase 2 preview semantics; Phase 3 projection contracts; seven-mode shell.
- **Mandatory:** source graph, TS/TSX syntax/import graph, browser ramp/steps when dependencies exist, remote source verification after repair.
- **Stop:** no Phase 4 before PND-002 is resolved or explicitly accepted as a blocker.

## 13. Compact Revision Log

| Rev | Checkpoint |
|---|---|
| 1-4 | State initialized, prototype audited, local baseline/roadmap created, partial remote publication recorded. |
| 5-6 | Runtime spine repaired, focused checks passed, source checkpoint published. |
| 7 | Phase 2 live VFX runtime/workbench published. |
| 8 | Phase 3 surface/freehand/indicator source published. |
| 9 | Ramp/step fixture published; `uMarkVariant` mismatch repaired. |
| 10 | Baseline identity normalized to immutable source checkpoint; active control plane compacted without changing active IDs or gates. |
| 11 | Dependency-resolved CI workflow committed locally; remote workflow publication blocked by platform safety and recorded as pending. |
