# Operational State: AetherVFX Ability and Procedural VFX Engine

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "aethervfx",
  "project_name": "AetherVFX Ability and Procedural VFX Engine",
  "project_root": "/mnt/data/aethervfx_work",
  "artifact_path": "",
  "state_revision": 9,
  "last_updated": "2026-08-13T20:22:02Z",
  "current_baseline": {
    "identity": "local Phase 3 validation-fixture commit 9b34bc7be35bda6764229c64a12ca3210c2497e2; remote main 5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2",
    "state": "current-baseline",
    "last_verified": "2026-08-13T20:22:02Z"
  },
  "scope_boundaries": [
    "Repository rooted at /mnt/data/aethervfx_work and remote westkitty/3js-VFX-platform"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

- **Project ID:** `aethervfx`
- **Purpose:** Advance the broad AetherVFX prototype into a reusable, validated Three.js VFX/ability platform without adding breadth before existing modes are truthful.
- **Project type:** Vanilla Three.js + React browser VFX workbench.
- **Primary root:** `/mnt/data/aethervfx_work`
- **Remote:** `westkitty/3js-VFX-platform`
- **Governed scope:** Engine/runtime, VFX modules, surface/freehand/indicator systems, seven-mode workbench shell, validation and publication state.

## 2. Current Baseline

- **Primary artifact:** `westkitty/3js-VFX-platform` plus local repository `/mnt/data/aethervfx_work`.
- **Baseline state:** Phase 3 surface-aware source checkpoint published; dependency-resolved browser runtime remains unverified.
- **Source identity:** Local Phase 3 validation-fixture code `9b34bc7be35bda6764229c64a12ca3210c2497e2`; remote `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`.
- **Active user route:** Seven-mode workbench. VFX Lab is wired to the live preview runtime. Telegraph/Indicator now has a source-complete surface-aware implementation. Sequence/Macro remains explicitly staged.
- **Last verified:** 2026-08-13T20:22:02Z via local source checks plus GitHub ref/file verification for `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`.

## 3. Artifact Contract

- Preserve one coherent browser workbench with seven visible modes: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Do not add new modes, ability schools, or large effect families until the active roadmap phase passes its validation gates.
- Runtime claims require appropriate browser proof; source presence or compilation alone is not sufficient.
- Stage, commit, and publish each bounded implementation checkpoint.

## 4. Active Invariants

<!-- operational-state:entry
{"id":"INV-001","title":"Preserve seven-mode workbench shape","state":"requested","rule":"Keep the seven-mode AetherVFX workbench visible while replacing shallow implementations with truthful staged or working paths.","scope":"Workbench navigation and phase implementations","authority":"Accepted project assessment","evidence":"User confirmation and ROADMAP.md","validation_method":"Inspect navigation and mode routing after each shell change","last_checked":"2026-08-13","status":"active","recheck_trigger":"Any workbench navigation or phase-routing change"}
-->
### INV-001 — Preserve seven-mode workbench shape
- **State:** `requested`
- **Rule:** Keep the seven-mode AetherVFX workbench visible while replacing shallow implementations with truthful staged or working paths.
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"INV-002","title":"No breadth before runtime truth","state":"requested","rule":"Do not add new abilities, schools, tabs, or renderer migrations while the current roadmap phase has failed or unverified mandatory gates.","scope":"All implementation work","authority":"Accepted project assessment","evidence":"ROADMAP.md","validation_method":"Map each implementation slice to the current roadmap phase","last_checked":"2026-08-13","status":"active","recheck_trigger":"User explicitly changes project direction"}
-->
### INV-002 — No breadth before runtime truth
- **State:** `requested`
- **Rule:** Do not add new abilities, schools, tabs, or renderer migrations while the current roadmap phase has failed or unverified mandatory gates.
- **Status:** active
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

<!-- operational-state:entry
{"id":"VER-001","title":"Runtime-spine subset publication verified","state":"verified","capability":"Phase 1 runtime-spine source was published on GitHub and incorporated into later main history.","scope":"Remote source publication","verification_method":"Fetched commit/tree from GitHub","evidence":"Commit 3657aa0615989ac7db28331976133eba80d0965b","artifact_revision":"3657aa0615989ac7db28331976133eba80d0965b","last_verified":"2026-08-13","dependencies":"GitHub connector","freshness":"historical-current","recheck_trigger":"History rewrite"}
-->
### VER-001 — Runtime-spine subset publication verified
- **State:** `verified`
- **Capability:** Phase 1 runtime-spine source was published on GitHub and incorporated into later main history.
- **Evidence:** `3657aa0615989ac7db28331976133eba80d0965b`
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-002","title":"Phase 2 workbench source graph is published coherently","state":"verified","capability":"Remote main contains the Phase 2 ability/VFX runtime plus a workbench App that imports only accepted live/staged shell modules.","scope":"Remote source publication and import-graph coherence","verification_method":"Fetched main ref, commit, recursive tree, and App source","evidence":"Remote main 92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6; tree 317fdae1e6c187018d6d6b88cb6e4eed29f1ea0d; App blob ba98532f5e5ab00d833e03a35a76d16d334fff41","artifact_revision":"92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6","last_verified":"2026-08-13T19:58:00Z","dependencies":"GitHub connector","freshness":"current","recheck_trigger":"Any remote App/runtime routing change"}
-->
### VER-002 — Phase 2 workbench source graph is published coherently
- **State:** `verified`
- **Capability:** Remote `main` contains the Phase 2 ability/VFX runtime plus a workbench App that imports only accepted live/staged shell modules.
- **Evidence:** Remote `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`, tree `317fdae1e6c187018d6d6b88cb6e4eed29f1ea0d`, App blob `ba98532f5e5ab00d833e03a35a76d16d334fff41`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-003","title":"Phase 3 surface source checkpoint is published","state":"verified","capability":"Remote main contains directional surface projection, freehand surface reprojection, surface-conforming indicator geometry, live Indicator Lab wiring, and the offline source-graph gate.","scope":"Remote Phase 3 source publication","verification_method":"Fetched GitHub main ref and Phase 3 commit diff after fast-forward","evidence":"Remote main b68623b33b575b37462fe332de5af4cac35daa85; local code b09f2ef346707c5a60e3946763684cf07a38bada; source graph PASS 59 source files; TS/TSX syntax PASS 60 files","artifact_revision":"b68623b33b575b37462fe332de5af4cac35daa85","last_verified":"2026-08-13T20:10:00Z","dependencies":"GitHub connector and local source tooling","freshness":"current","recheck_trigger":"SurfaceQuery, freehand, indicator, App routing, or remote history change"}
-->
### VER-003 — Phase 3 surface source checkpoint is published
- **State:** `verified`
- **Capability:** Remote `main` contains the Phase 3 directional projection, freehand reprojection, surface-aware indicator system, live panel wiring, and source-graph gate.
- **Evidence:** Remote `b68623b33b575b37462fe332de5af4cac35daa85`; local code `b09f2ef346707c5a60e3946763684cf07a38bada`.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-004","title":"Phase 3 validation fixture and shader-uniform repair are published","state":"verified","capability":"Remote main contains an opt-in ramp/step validation fixture wired through the playable surface set and TerrainManager now supplies the surface-mark shader's uMarkVariant uniform.","scope":"Phase 3 validation support source publication","verification_method":"Fetched GitHub main ref, published App fixture wiring, fixture source, and TerrainManager uniform block","evidence":"Remote main 5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2; local code 9b34bc7be35bda6764229c64a12ca3210c2497e2","artifact_revision":"5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2","last_verified":"2026-08-13T20:22:02Z","dependencies":"GitHub connector","freshness":"current","recheck_trigger":"Validation fixture, App surface registration, TerrainManager surface marks, or remote history change"}
-->
### VER-004 — Phase 3 validation fixture and shader-uniform repair are published
- **State:** `verified`
- **Capability:** `?surfaceFixture=1` source wiring, ramp/step geometry, and the `uMarkVariant` TerrainManager repair are present on remote `main`.
- **Evidence:** Remote `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`; local `9b34bc7be35bda6764229c64a12ca3210c2497e2`.
<!-- /operational-state:entry -->

## 6. Known Not Working

No currently active source-confirmed Phase 1/2 failure remains in this section. Browser-only acceptance criteria are recorded as unverified/unknown below rather than falsely classified as fixed.

## 7. Implemented but Unverified

<!-- operational-state:entry
{"id":"UNV-002","title":"Performance frame timing repair implemented","state":"implemented-unverified","capability":"EngineClock captures wall-clock frame duration before timestamp mutation and PerformanceMetrics receives measured samples.","evidence":"Local Phase 1 commit 529f356 and focused clock checks","last_checked":"2026-08-13","validation_method":"Browser artificial-load test must change p50/p95/p99 and FPS","recheck_trigger":"Performance or frame-loop change"}
-->
### UNV-002 — Performance frame timing repair implemented
- **State:** `implemented-unverified`
- **Capability:** EngineClock captures real frame durations before timestamp mutation and feeds measured samples to performance metrics.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-003","title":"Camera shake drift repair implemented","state":"implemented-unverified","capability":"Shake is applied as a transient camera offset and restored after rendering/stepping.","evidence":"Phase 1 source and 100-cycle focused restoration check","last_checked":"2026-08-13","validation_method":"Browser camera-control integration test","recheck_trigger":"Camera or post-processing change"}
-->
### UNV-003 — Camera shake drift repair implemented
- **State:** `implemented-unverified`
- **Capability:** Shake is applied as a transient camera offset and restored after rendering/stepping.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-004","title":"Deterministic runtime-spine services implemented","state":"implemented-unverified","capability":"EngineClock owns pause/fixed-step simulation timing and SeededRandom provides repeatable PRNG state.","evidence":"Phase 1 focused executable checks","last_checked":"2026-08-13","validation_method":"Run runtime-spine checks with installed dependencies and exercise pause/step in browser","recheck_trigger":"Clock, pause/step, or RNG change"}
-->
### UNV-004 — Deterministic runtime-spine services implemented
- **State:** `implemented-unverified`
- **Capability:** `EngineClock` owns pause/fixed-step simulation timing and `SeededRandom` provides repeatable PRNG state.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-005","title":"Runtime resource cleanup paths strengthened","state":"implemented-unverified","capability":"VFX pool, ability destruction, terrain-generated resources, and app teardown have explicit cleanup paths.","evidence":"Phase 1 source and focused VfxPool lifecycle check","last_checked":"2026-08-13","validation_method":"Repeated browser spawn/clear/unmount with renderer.info and pool stats","recheck_trigger":"VFX, terrain residue, or lifecycle ownership change"}
-->
### UNV-005 — Runtime resource cleanup paths strengthened
- **State:** `implemented-unverified`
- **Capability:** VFX pool, ability destruction, terrain-generated resources, and app teardown have explicit cleanup paths.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-006","title":"Live VFX preview and editor semantics implemented","state":"implemented-unverified","capability":"VFX Lab uses a deterministic preview instance, runtime-bound module parameter updates, seek/restart replay, and fixed-step frame controls rather than a decorative local timeline.","evidence":"Published Phase 2 lifecycle/modules/UI/App on remote main 92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6; local 36-file syntax/import graph check passes","last_checked":"2026-08-13","validation_method":"Browser cast-preview, pause, step, seek, restart, live-edit, repeat-seed checkpoint test","recheck_trigger":"VFX preview, lifecycle, module registry, or editor change"}
-->
### UNV-006 — Live VFX preview and editor semantics implemented
- **State:** `implemented-unverified`
- **Capability:** VFX Lab uses a deterministic preview instance, runtime-bound module parameter updates, seek/restart replay, and fixed-step frame controls rather than a decorative local timeline.
- **Evidence:** Remote `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`; local source check: 36 TS/TSX files, zero syntax diagnostics, zero missing relative imports.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNV-007","title":"Surface-aware freehand and indicator behavior implemented","state":"implemented-unverified","capability":"SurfaceQuery supports bounded arbitrary-direction/local-normal projection; freehand Catmull-Rom samples reproject to the local surface; Indicator Lab builds line/zone/cone/ring/rectangle outlines reprojected onto nearby surface geometry with warning/commit/fade timing.","evidence":"Local b09f2ef346707c5a60e3946763684cf07a38bada; remote b68623b33b575b37462fe332de5af4cac35daa85; source graph PASS; TS/TSX syntax PASS","last_checked":"2026-08-13T20:10:00Z","validation_method":"Run sloped and stepped browser scene: place each outline shape, draw a freehand path across surface transitions, verify no phantom y=0 snapping and correct local orientation/timing","recheck_trigger":"SurfaceQuery, terrain geometry, freehand sampling, indicator geometry, or scene input changes"}
-->
### UNV-007 — Surface-aware freehand and indicator behavior implemented
- **State:** `implemented-unverified`
- **Capability:** Local-normal projection, freehand surface reprojection, and five indicator outline shapes with warning/commit/fade timing are implemented and published.
- **Required validation:** Real browser slope/step scene proof.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{"id":"UNK-001","title":"Dependency-resolved build and browser runtime are unverified","state":"unknown","decisive_check":"Install declared dependencies, run npm run lint, npm run check:runtime-spine, npm run build, then browser-smoke all seven modes.","evidence":"Network package installation is unavailable in this runtime; local source check reports zero syntax diagnostics and zero missing relative imports across 36 TS/TSX files.","last_checked":"2026-08-13"}
-->
### UNK-001 — Dependency-resolved build and browser runtime are unverified
- **State:** `unknown`
- **Decisive Check:** Install dependencies, run lint/runtime-spine/build, then browser-smoke all seven modes.
- **Evidence:** Network package installation is unavailable here; source graph checks pass.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"UNK-002","title":"Exact local/remote byte parity remains unverified","state":"unknown","decisive_check":"With normal Git transport, fresh-clone remote main and compare intended tracked paths/hashes after removing connector-only orphan compatibility files.","evidence":"Remote main is source-coherent but local and remote histories differ because the connector required bounded Git-data publication and blocked deletion of at least one unreferenced compatibility shim.","last_checked":"2026-08-13"}
-->
### UNK-002 — Exact local/remote byte parity remains unverified
- **State:** `unknown`
- **Decisive Check:** With normal Git transport, fresh-clone remote main and compare intended tracked paths/hashes after removing connector-only orphan compatibility files.
- **Evidence:** Remote main is source-coherent; exact local/remote history parity is not claimed.
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{"id":"PND-001","title":"Normalize repository parity cleanup","state":"pending","task":"Normalize local/remote parity and remove connector-only orphan compatibility files when transport permits.","reason_pending":"Remote main is already source-coherent; only exact cleanup remains.","dependency":"Normal Git transport or connector deletion path","priority":"low","validation_needed":"Fresh clone/fetch plus path/hash comparison","blocks_completion":false}
-->
### PND-001 — Normalize repository parity cleanup
- **State:** `pending`
- **Blocks Completion:** No
- **Priority:** low
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-002","title":"Phase 3 browser surface validation","state":"pending","task":"Run the published Phase 3 browser surface gate using ?surfaceFixture=1 and minimally repair only observed failures.","reason_pending":"Source implementation and publication are complete, but WebGL interaction proof is unavailable in the current dependency-less runtime.","dependency":"Dependency-resolved browser environment; validation geometry is already available through ?surfaceFixture=1","priority":"next","validation_needed":"Place line/zone/cone/ring/rectangle indicators on slopes and steps; draw freehand across surface transitions; verify no phantom y=0 fallback, local orientation, timing states, disposal, and no Phase 2 regression","blocks_completion":true}
-->
### PND-002 — Phase 3 browser surface validation
- **State:** `pending`
- **Priority:** next
- **Task:** Open the workbench with `?surfaceFixture=1` and browser-validate all five indicator shapes plus freehand transitions before Phase 4.
- **Blocks Completion:** Yes, for closing Phase 3.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"PND-003","title":"Phase 4 factory and sequence runtime","state":"pending","task":"Implement schema-validated Ability Factory and semantic sequence/macro nodes.","reason_pending":"Sequence mode is intentionally a design preview; the shallow runner was removed.","dependency":"Stable declarative module/schema contract after Phase 3","priority":"later","validation_needed":"At least ten declarative abilities without custom runtime classes plus sequence-node behavior tests","blocks_completion":false}
-->
### PND-003 — Phase 4 factory and sequence runtime
- **State:** `pending`
- **Priority:** later
- **Task:** Implement schema-validated factory and semantic sequence/macro nodes.
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{"id":"DEC-001","title":"Accepted product assessment controls development order","state":"requested","rule":"Treat AetherVFX as a broad prototype whose existing modes must be made truthful before adding breadth; follow ROADMAP.md phase order.","scope":"All forward AetherVFX work","authority":"Explicit user confirmation","evidence":"User accepted assessment on 2026-08-13 and ROADMAP.md","validation_method":"Map each implementation checkpoint to roadmap gates","last_checked":"2026-08-13","status":"active","recheck_trigger":"User explicitly changes project direction"}
-->
### DEC-001 — Accepted product assessment controls development order
- **State:** `requested`
- **Rule:** Existing modes become truthful before new breadth is added; follow `ROADMAP.md` phase order.
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim or behavior | State | Evidence | Validation method | Artifact/revision | Last checked | Recheck trigger |
|---|---|---|---|---|---|---|---|
| VER-002 | Phase 2 source graph is published coherently | verified | GitHub ref/commit/tree/App fetch | Re-fetch main + App imports | remote `92668c57` | 2026-08-13 | Remote routing change |
| VER-003 | Phase 3 source checkpoint is published | verified | Local source gates + GitHub main/commit fetch | Re-fetch remote main and changed source | local `b09f2ef`; remote `b68623b3` | 2026-08-13 | Surface/freehand/indicator/App change |
| VER-004 | Phase 3 validation fixture is published | verified | GitHub ref + App/fixture/TerrainManager fetch | Re-fetch validation support files | local `9b34bc7`; remote `5d7dfb8d` | 2026-08-13 | Validation fixture or surface-mark change |
| UNV-006 | Live VFX preview/editor semantics implemented | implemented-unverified | Phase 2 source graph + syntax/import checks | Browser preview/edit/replay path | remote `92668c57` incorporated into current main | 2026-08-13 | VFX lifecycle/editor change |
| UNV-007 | Surface-aware freehand/indicator behavior implemented | implemented-unverified | Source graph PASS 59; syntax PASS 60 | Browser slope/step placement and drawing | local `b09f2ef`; remote `b68623b3` | 2026-08-13 | Surface-query/indicator/freehand change |
| UNK-001 | Dependency-resolved browser runtime | unknown | Dependency install unavailable | npm checks + browser smoke | current | 2026-08-13 | Dependencies available |

## 12. Current Change Scope and Impact Radius

- **Allowed to change next:** Phase 3 browser validation fixtures, representative slope/step scene support, and only the minimal repairs proven necessary by that validation.
- **Must remain unchanged:** Phase 1 timing/shake/resource repairs; Phase 2 live preview semantics; Phase 3 published projection contracts; seven-mode workbench shape.
- **Potentially affected behavior:** Surface projection/orientation, freehand reprojection, indicator geometry/timing/disposal, terrain interaction, scene input.
- **Mandatory checks:** `check:source-graph`; TS/TSX syntax/import graph; browser slope/step path when dependencies are available; remote ref/commit verification after any repair.
- **Stop condition:** Do not begin Phase 4 until the representative browser surface path is proven or the missing environment is explicitly carried as the blocker.
- **Repair class:** Phase 3 validation/repair only.

## 13. Compact Revision Log

### Revision 1 — 2026-08-13T16:30:42Z

- **Artifact/source identity:** `Not yet established`
- **State deltas:** Initialized operational state.
- **New evidence:** None.
- **Validation not performed:** All behavioral validation remains pending unless explicitly recorded above.

### Revision 2 — 2026-08-13T16:34:50Z

- **Artifact/source identity:** uploaded aethervfx---ability-&-procedural-vfx-engine.zip extracted 2026-08-13
- **State deltas:** Updated metadata: current_baseline; Added UNV-001 to 7. Implemented but Unverified; Added BRK-001 to 6. Known Not Working; Added BRK-002 to 6. Known Not Working; Added BRK-003 to 6. Known Not Working; Added UNK-001 to 8. Unknown or Evidence-Stale State
- **New evidence:** Static Three.js health audit completed over 31 source files; TypeScript/TSX syntax transpilation completed for 30 files with zero syntax diagnostics; Manual source inspection compared implementation against the two supplied research reports
- **Newly verified behavior:** None.
- **Newly known failure:** BRK-001; BRK-002; BRK-003
- **Superseded rule:** None.
- **Validation not performed:** Dependency-resolved TypeScript typecheck; Vite production build; Browser runtime smoke test; Visual regression and performance validation
- **Reason for broad revalidation:** Not applicable.
- **Summary:** Establish uploaded ZIP as the audit baseline and record source-confirmed gaps against the research plan

### Revision 3 — 2026-08-13T16:44:05Z

- **Artifact/source identity:** local git commit 76dbe13e318d63b15b2faeeae367be9d2176233c
- **State deltas:** Updated metadata: current_baseline; Added DEC-001 to 10. Active Decisions, Defaults, and Prohibitions; Added PND-001 to 9. Pending Work
- **New evidence:** User explicitly confirmed the prior assessment is correct; ROADMAP.md created from the accepted assessment and research plan; All 44 project files staged and committed locally as 76dbe13e318d63b15b2faeeae367be9d2176233c; GitHub connector write blocked twice before GitHub accepted any commit; Direct git push failed because the runtime could not resolve github.com
- **Newly verified behavior:** None.
- **Newly known failure:** None.
- **Superseded rule:** None.
- **Validation not performed:** Remote GitHub commit verification; Dependency install/typecheck/build/browser runtime
- **Reason for broad revalidation:** Not applicable.
- **Summary:** Record local Git baseline, accepted assessment, forward roadmap, and blocked GitHub push

### Revision 4 — 2026-08-13T16:52:04Z

- **Artifact/source identity:** local git branch main before final state commit
- **State deltas:** Updated PND-001 in 9. Pending Work; Added UNK-002 to 8. Unknown or Evidence-Stale State
- **New evidence:** GitHub main was directly fetched after publication attempts and contains only README.md and index.html; README.md remote root commit is ac13dd56af9ed3f2ab9e01782db663b1a98fc01c; index.html was committed remotely in 109aa1690471e969e915620fff6fd42d745c8c68; AetherVFX identity, Bible, and Project Bible index entry were successfully committed to westkitty/ChatGPT_Bible_Repo
- **Newly verified behavior:** None.
- **Newly known failure:** None.
- **Superseded rule:** None.
- **Validation not performed:** Full remote source-tree parity because publication did not complete; Dependency install/typecheck/build/browser runtime
- **Reason for broad revalidation:** Not applicable.
- **Summary:** Record verified partial GitHub publication and durable Project Bible creation

### Revision 5 — 2026-08-13T17:03:10Z

- **Artifact/source identity:** local git commit 529f356
- **State deltas:** Updated metadata: current_baseline; Moved BRK-001 from 6. Known Not Working to 7. Implemented but Unverified as UNV-002; Moved BRK-003 from 6. Known Not Working to 7. Implemented but Unverified as UNV-003; Added UNV-004 to 7. Implemented but Unverified; Added UNV-005 to 7. Implemented but Unverified; Updated UNK-001 in 8. Unknown or Evidence-Stale State
- **New evidence:** Commit 529f356 repairs Engine frame-duration capture and centralizes simulation time in EngineClock; SeededRandom added and injected into camera-shake sampling; PostProcessingController now applies transient shake offsets and restores the camera after every render; VfxPool initialization/disposal is explicit and idempotent; AbilityInstance destruction is idempotent; app teardown clears active ability/telegraph/freehand/terrain resources; All 32 TypeScript/TSX source files transpiled with zero syntax diagnostics; Focused executable runtime-spine checks passed for clock/pause/step, seeded RNG, 100 shake/restore cycles, and VFX pool lifecycle; npm install timed out and npm run lint fails at dependency resolution because node_modules is unavailable
- **Newly verified behavior:** None.
- **Newly known failure:** None.
- **Superseded rule:** None.
- **Validation not performed:** Dependency-resolved TypeScript typecheck; Vite production build; Browser smoke test; Performance Lab artificial-load browser validation; renderer.info resource-recovery validation
- **Reason for broad revalidation:** Not applicable.
- **Summary:** Record first runtime-spine repair packet and bounded validation

### Revision 6 — 2026-08-13T17:18:39Z

- **Artifact/source identity:** local code 529f356 / local state 6c9ab50 / remote commit 3657aa0615989ac7db28331976133eba80d0965b
- **State deltas:** Updated metadata: current_baseline; Added VER-001 to 5. Verified Working Behavior; Updated UNK-002 in 8. Unknown or Evidence-Stale State; Updated PND-001 in 9. Pending Work
- **New evidence:** GitHub main advanced to 3657aa0615989ac7db28331976133eba80d0965b.; Remote tree f020ce0667562177db9340969aba29336fd5d928 contains hash-matched runtime-spine files including Engine.ts, EngineClock.ts, PostProcessing.ts, SeededRandom.ts, VfxPool.ts, TerrainManager.ts, App.tsx, VfxLabPanel.tsx, package.json and runtime-spine-check.ts.; GitHub connector refused exact AbilityRuntime.ts and other parts of the pre-existing baseline; direct git transport remains network-blocked.
- **Newly verified behavior:** VER-001
- **Newly known failure:** None.
- **Superseded rule:** None.
- **Validation not performed:** Full remote parity is not established.; Dependency-resolved build and browser smoke testing remain unavailable.
- **Reason for broad revalidation:** Not applicable.
- **Summary:** Record runtime-spine remote publication and remaining parity blocker

### Revision 7 — 2026-08-13T19:58:00Z

- **Artifact/source identity:** local `12bc967e39476fa5b3479fd9e90c09f77368b319`; remote `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`
- **State deltas:** Added VER-002 and UNV-006; retired the prior VFX-Lab known-broken classification into implemented-unverified; revised parity and pending work; opened bounded Phase 3 scope.
- **New evidence:** GitHub main fast-forwarded to `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6`; recursive tree `317fdae1e6c187018d6d6b88cb6e4eed29f1ea0d`; App blob `ba98532f5e5ab00d833e03a35a76d16d334fff41`; local reconciliation checked 36 TS/TSX files with zero syntax diagnostics and zero missing relative imports; `git diff --check` clean.
- **Newly verified behavior:** Remote source publication and source-graph coherence only.
- **Newly known failure:** None.
- **Validation not performed:** Dependency-resolved typecheck/build; browser rendering/interaction smoke; visual determinism proof; target-device performance/lifecycle proof.
- **Summary:** Close the Phase 2 source/publication checkpoint truthfully and prepare the Phase 3 surface/freehand/indicator implementation slice.

### Revision 8 — 2026-08-13T20:10:00Z

- **Artifact/source identity:** local Phase 3 code `b09f2ef346707c5a60e3946763684cf07a38bada`; remote `b68623b33b575b37462fe332de5af4cac35daa85`.
- **State deltas:** Added VER-003 and UNV-007; converted PND-002 from implementation work to browser validation; advanced the current baseline to Phase 3.
- **New evidence:** `node scripts/source-graph-check.cjs` PASS across 59 source files; TypeScript/TSX syntax transpile PASS across 60 files; `git diff --check` clean; GitHub `main` fast-forward verified at `b68623b33b575b37462fe332de5af4cac35daa85`; commit diff confirms SurfaceQuery, FreehandCaster, SurfaceIndicatorManager, IndicatorLabPanel, App wiring, and the source-graph script.
- **Newly verified behavior:** Phase 3 source publication only.
- **Newly implemented but unverified behavior:** Directional/local-normal projection, freehand surface reprojection, and surface-aware timed indicator outlines.
- **Validation not performed:** Dependency-resolved typecheck/build; WebGL/browser slope-step interaction; visual orientation/timing proof; target-device performance/resource proof.
- **Summary:** Publish the bounded Phase 3 surface-aware implementation while withholding behavioral completion until the representative browser scene is available.

### Revision 9 — 2026-08-13T20:22:02Z

- **Artifact/source identity:** local validation-fixture code `9b34bc7be35bda6764229c64a12ca3210c2497e2`; remote `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`.
- **State deltas:** Added VER-004; made the Phase 3 browser gate executable through `?surfaceFixture=1`; retained Phase 3 behavior as implemented-unverified.
- **New evidence:** Source graph PASS across 60 source files; TS/TSX syntax PASS across 60 files; GitHub main ref verified at `5d7dfb8d663b7a32ed137989a71d6cd1ad4fd5d2`; published App imports/enables `SurfaceValidationFixture`; fixture contains one ramp and four stepped meshes; published TerrainManager now supplies `uMarkVariant`.
- **Newly verified behavior:** Validation-support source publication and shader-uniform source correction only.
- **Newly known failure repaired:** TerrainManager/SurfaceMarkShader uniform-name mismatch (`uDecalType` vs `uMarkVariant`).
- **Validation not performed:** Actual browser rendering, pointer hits on the ramp/steps, all five indicator placements, freehand transitions, production build, dependency-resolved typecheck.
- **Summary:** Prepare the real Phase 3 browser gate without claiming it has run.
