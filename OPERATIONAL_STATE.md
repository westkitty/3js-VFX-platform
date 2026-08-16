# Operational State: AetherVFX

<!-- operational-state:metadata
{"schema_version":1,"project_id":"aethervfx","project_name":"AetherVFX Ability and Procedural VFX Engine","project_root":".","artifact_path":"","state_revision":20,"last_updated":"2026-08-16T08:45:00Z","current_baseline":{"identity":"local clone of origin/main plus Phase 5 persistent aftermath repair (mutation redo and import counter reconciliation)","state":"current-baseline","last_verified":"2026-08-16T08:45:00Z"},"scope_boundaries":["westkitty/3js-VFX-platform"],"linked_parent_state":null}
-->

## 1. Project Identity and Scope

- Vanilla Three.js + React procedural VFX/ability workbench.
- Seven visible modes are protected: VFX Lab, Ability Factory, Macro/Sequence, Terraformer, Telegraph/Indicator, Freehand, Performance.
- Canonical repository: `westkitty/3js-VFX-platform`.

## 2. Current Baseline

- Phase 3 verified checkpoint: `4704efd158f237b459d7b2008f06d743f74270c5`.
- Revision 17 implements Phase 4: versioned Ajv-validated declarative ability schema, hardened registry, real Ability Factory, ten data-only abilities, and deterministic semantic sequence runtime with working Sequence Designer.
- Revision 18 implements Phase 5 declarative residue world-effect integration and budget lifecycle.
- Revision 19 implements the full accepted Phase 5: Persistent Aftermath and Terraforming architecture (`MutationManager`, `ResidueManager`, `SurfaceQuery`, `TerrainDemo`, `TerrainManager`).
- Revision 20 completes the Phase 5 correctness repairs:
  1. Full mutation redo restoration: `MutationManager.redo()` restores exact `MutationRecord` snapshots (ID, seed, type, lifetime, surfaceId) in deterministic order and notifies `ResidueManager` for synchronous visual realization, with full symmetry for removal transactions.
  2. Import counter reconciliation: `importJson()` determines max numeric suffixes for mutation IDs (`mut_<type>_<N>`) and transaction IDs (`tx_<N>`, `tx_terrain_<N>`), advancing internal counters beyond imported records to prevent ID collisions, while maintaining complete counter atomicity on invalid imports.
  3. Verified across all 10 pure node checks, build, and enhanced browser acceptance suite (Requirements A-I, explicit mutation undo/redo assertions, post-import ID uniqueness).
- `surfaceAutoTest=1` enables the validation fixture and runs the in-app Three.js runtime validator, exposes `window.__AETHERVFX_SURFACE_VALIDATION__`, and renders a visible PASS/FAIL overlay (12/12 passing).
- **Phase 3 browser surface validation remains VERIFIED** (VER-008).
- **Phase 5 full persistent aftermath architecture is COMPLETE and browser-verified** (VER-017). Phase 6 was not started.

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

<!-- operational-state:entry
{"id":"VER-011","title":"Phase 4 declarative ability schema, validation, and migration","state":"verified","capability":"Ability documents are versioned JSON validated by Ajv. Import validates and migrates; malformed, unsupported-version, and code-bearing documents are rejected with structured errors. Export produces schema-conforming JSON and round-trips. The registry is the authoritative admission gate with an explicit duplicate policy and atomic import.","scope":"src/schema/AbilitySchema.ts, src/schema/AbilityValidator.ts, src/abilities/AbilityRegistry.ts","verification_method":"npm run check:ability-schema (dependency-resolved, no DOM/WebGL) plus browser import/export proof","evidence":"check:ability-schema PASS. Covers: valid definition accepted (incl. all 7 builtins); 10 malformed cases rejected; 6 code-injection cases rejected (extra top-level property, injected handler field, unknown module param, module import specifier, URL in colour field, unknown module type); schemaVersion 2.0.0 rejected as unsupportedVersion; 1.0.0 -> 1.1.0 migration verified field-by-field (shake->cameraShake 0.3, flash->flashIntensity 0.4, iconName default, budget.maxParticles derived 300); 7 invalid module configurations rejected while negative particle speed stays legal; export/import round-trip preserves the definition exactly (deepEqual); duplicate id rejected by default and replaced only on explicit duplicates:'replace'; failed batch import registers nothing (atomic)","artifact_revision":"revision 17","last_verified":"2026-08-15T14:45:00Z","dependencies":"ajv ^8.20.0","freshness":"current","recheck_trigger":"Schema, validator, migration, or registry change"}
-->
### VER-011 — Phase 4 declarative ability schema, validation, and migration
- **State:** `verified` — `check:ability-schema` PASS; JSON is data-only and cannot carry executable payloads.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-012","title":"Phase 4 semantic sequence runtime","state":"verified","capability":"Eight semantic node types (sequence, parallel, wait, emit, travel, impact, field, residue) whose meaning comes from scheduling behavior. Deterministic, seeded, driven solely by EngineClock simulation deltas, with leftover-time threading for frame-rate independence.","scope":"src/sequence/SequenceModel.ts, src/sequence/SequenceRuntime.ts, src/sequence/AbilitySequenceEmitter.ts, src/schema/SequenceSchema.ts, src/schema/SequenceValidator.ts","verification_method":"npm run check:sequence-runtime (pure) plus real-browser run","evidence":"check:sequence-runtime PASS. Covers: sequence ordering by schedule (emits at 0.00/0.50/0.75s, not array position); wait holds exactly its duration; parallel children start together, join 'all' finishes with the slowest (1.5s) and join 'any' with the fastest (0.5s); parallel emits fire together at elapsed 0; travel derives duration from distance/speed (24/60=0.4s), explicit duration wins, progress observable mid-flight, zero-speed does not hang; impact/field/residue each hold their duration and report progress; identical definition+seed reproduces an identical run and each emit gets a distinct derived seed while a different root seed changes the stream; 1/240 and 1/15 step sizes produce identical stage start times; zero/negative/NaN deltas never advance state; restart resets elapsed, emit count and completed stages and reproduces the seed stream; stop returns to idle, releases owned runtime exactly once and refuses to advance; the shipped pack validates, only emits registered ability ids, and runs to completion; 8 sequence-validation rejection cases including an injected onTick property; source scan proves SequenceRuntime/SequenceModel/AbilitySequenceEmitter contain no setTimeout, setInterval, Date.now, performance.now, requestAnimationFrame or Math.random","artifact_revision":"revision 17","last_verified":"2026-08-15T14:45:00Z","dependencies":"EngineClock","freshness":"current","recheck_trigger":"Sequence model, runtime, emitter, or schema change"}
-->
### VER-012 — Phase 4 semantic sequence runtime
- **State:** `verified` — `check:sequence-runtime` PASS; no wall-clock timing anywhere in the sequence engine.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-013","title":"Phase 4 browser acceptance","state":"verified","capability":"Ability Factory and Sequence Designer were exercised in a real Chromium browser against the real Three.js runtime.","scope":"Browser acceptance","verification_method":"Interactive browser session on a local Vite dev server (localhost:4310), Claude Browser tool","evidence":"ABILITY FACTORY: opened Ability Factory; authored 'Browser Proof Lance' from UI controls (name, school=stormcraft, shape=cone which revealed the conditional angle control), id derived as factory_browser_proof_lance; status 'registered: factory_browser_proof_lance'; the ability appeared in the preset bar and its modules rendered in the Live VFX Inspector as 'Runtime bound'; preview cast through the existing runtime (timeline 0.00/1.81s, phases windup->travel->impact->hold->fade). PARAMETER PROOF: at a fixed seek position (t=0.30) the rendered framebuffer was sampled via gl.readPixels; particles colour #ff0000 raised only the R channel (4.142 -> 4.539 and 5.147 across two runs, lit pixels 4237/14281) while G stayed at baseline 5.461; particles colour #00ff00 raised only the G channel (5.461 -> 5.856, lit 4244) while R stayed at baseline 4.142 - the elevated channel tracks the parameter, proving the change reaches the real render and is not UI-only. EXPORT/IMPORT: export produced a 972-char schemaVersion 1.1.0 document; re-importing it returned 'imported: factory_custom_vfx_study' with no issues. REJECTION: importing a document with an unknown school, a 'javascript:alert(1)' colour and an injected onCast field was visibly rejected with 'rejected: 4 issue(s)' listing '(root) must NOT have additional properties', '/school must be equal to one of the allowed values' and '/modules/0/params/colorCore must match pattern', and nothing was registered. SEQUENCE: opened Macro Sandbox; seq_storm_opening loaded with all 9 stages (sequence, wait, emit, travel, impact, parallel, field, emit, residue), duration 3.30s, no unresolved emit targets; Run progressed wait(0.40)->emit(fired, emits 1, owned 1)->travel->impact->parallel; the parallel node and BOTH children were simultaneously active with emits 2 and owned 2; the 0.50s emit child completed while the 1.20s field child continued (join 'all'); parallel finished at exactly 2.50s and residue began; completion at exactly 3.30/3.30s with 9/9 stages complete. PAUSE: pausing EngineClock froze sequence elapsed at 0.81/3.30s across multiple rendered frames with the active stage unchanged; resuming continued to 1.02s. RESTART: reset to 0.00s, 0 complete, 0 emits, 0 owned. STOP: from elapsed 0.57 with 1 emit and 1 owned instance, stop returned status idle, elapsed 0.00, owned 0, all stages pending, and the scene's Active badge cleared - no orphan sequence-owned runtime. Zero console errors throughout; the only console output was a pre-existing THREE PCFSoftShadowMap deprecation warning.","artifact_revision":"revision 17","last_verified":"2026-08-15T14:45:00Z","dependencies":"unrestricted browser","freshness":"current","recheck_trigger":"Factory UI, Sequence UI, App wiring, or runtime change"}
-->
### VER-013 — Phase 4 browser acceptance
- **State:** `verified` — Factory (11/11 steps) and Sequence (8/8 steps) proofs completed in a real browser with zero console errors.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{"id":"VER-014","title":"Phase 1-3 regression gates hold on Phase 4 source","state":"verified","capability":"Phase 4 did not regress any protected earlier-phase behavior.","scope":"Regression","verification_method":"Re-ran every prior gate plus the browser routes against the Phase 4 tree","evidence":"?surfaceAutoTest=1 returned window.__AETHERVFX_SURFACE_VALIDATION__.passed === true with 12/12 checks and the visible 'Surface runtime validation: PASS' overlay (data-aethervfx-surface-validation='pass'). Phase 2 VFX Lab smoke on the default route with the builtin Amber Orb: preview cast (0.00/1.55s windup); pause froze the timeline and relabelled the control to Resume; Step advanced the paused preview (0.02 -> 0.07s; the readout is throttled to 0.05s granularity) while the engine stayed paused; seek to 1.20s changed the phase to 'fade'; Restart returned to 0.00/1.55s 'windup'; live parameter edit proven by VER-013's channel test. All seven workbench modes present and named: VFX Laboratory, Ability Factory, Macro Sandbox, Terraformer, Telegraph Lab, Freehand Caster, Performance Lab. 19 abilities registered (7 builtin + 10 declarative + 2 factory-authored). npm run lint clean; check:runtime-spine, check:indicator-model, check:surface-frame, check:source-graph all PASS; vite build succeeded.","artifact_revision":"revision 17","last_verified":"2026-08-15T14:45:00Z","dependencies":"none","freshness":"current","recheck_trigger":"Any Phase 1-3 surface change"}
-->
### VER-014 — Phase 1-3 regression gates hold on Phase 4 source
- **State:** `verified` — surface validator still 12/12, Phase 2 smoke passes, seven-mode shell intact.
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
{"id":"UNV-004","title":"Deterministic runtime services","state":"partially-verified","capability":"EngineClock fixed-step/pause and SeededRandom are implemented.","evidence":"check:runtime-spine plus revision 17: pausing EngineClock froze the sequence runtime across multiple rendered frames and resuming continued it (VER-013); Step advanced the paused VFX preview (VER-014); check:sequence-runtime proves step-size-independent progression and reproducible seed streams (VER-012).","validation_method":"Dependency-resolved checks plus browser pause/step","recheck_trigger":"Clock/RNG change"}
-->
### UNV-004 — Deterministic runtime services
- **State:** `partially-verified` — clock pause/step and seeded determinism proven in browser and pure checks; a dedicated timeScale/long-run soak is still unverified.
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
{"id":"PND-003","title":"Phase 4 factory/sequence runtime","state":"resolved","task":"Implement schema-validated Ability Factory and semantic sequence nodes.","reason_pending":"Completed in revision 17. See VER-011 (schema/validation/migration), VER-012 (semantic sequence runtime), VER-013 (browser acceptance).","dependency":"PND-002 (resolved)","priority":"done","validation_needed":"Ten declarative abilities plus node tests - delivered and passing","blocks_completion":false}
-->
### PND-003 — Phase 4 factory/sequence runtime
- **State:** `resolved` — implemented and browser-verified in revision 17.
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
| VER-011 | verified pure + browser | `check:ability-schema` PASS; browser import/export/reject proof | rerun after schema/validator/registry change |
| VER-012 | verified pure + browser | `check:sequence-runtime` PASS; browser run/pause/restart/stop proof | rerun after sequence model/runtime change |
| VER-013 | verified real browser | Factory 11/11 and Sequence 8/8 steps; channel-isolated render proof | rerun after Factory/Sequence UI or App wiring change |
| VER-014 | verified regression | 12/12 surface validator, Phase 2 smoke, 7 modes, build | rerun after any Phase 1-3 surface change |
| VER-015 | verified pure + browser | `check:sequence-runtime`, `check:world-effects`, and `scripts/browser-acceptance-suite.cjs` PASS; validated declarative sequences with `impact`/`field`/`residue` stages containing `abilityId` emit world-marks on terrain via `AbilitySequenceEmitter` and `WorldMarkBridge`; budget capped at 64 with oldest eviction and resource disposal; pause invariance verified; 25-cycle soak shows 0 memory/mesh leaks; Phase 3 (12/12), Phase 2, and Phase 4 smoke pass with zero console errors. | rerun after TerrainManager, WorldMarkBridge, SequenceSchema, or sequence emitter changes |
| VER-016 | verified pure + browser | `check:mutation-state` (21/21 checks) and `scripts/browser-acceptance-suite.cjs` (6/6 stages) PASS; modular Phase 5 persistent aftermath architecture completed: `MutationManager` (world-state authority, transactions, undo/redo, budgets, serialization), `ResidueManager` (visual aftermath, decals, seeded crystals, GPU disposal), `SurfaceQuery` (`surfaceId` resolution, surface frames), `TerrainDemo` (mesh ownership, height deformation), and `TerrainManager` (compatibility facade). 6 persistent archetypes (`scorch`, `frost`, `lava`, `crystal`, `golden_rune`, `void_scar`), Ajv schema `1.0.0`, atomic import/export, true undo/redo reversing mutations and terrain height deltas, irregular ramp/step placement, 64-budget cap, pause invariance, 25-cycle soak with 0 leaks. | rerun after MutationManager, ResidueManager, TerrainDemo, or MutationSchema changes |
| VER-017 | verified pure + browser | `check:mutation-state` (Requirements A-I) and `scripts/browser-acceptance-suite.cjs` (6/6 stages) PASS; Phase 5 correctness repairs completed: (1) `MutationManager.redo()` restores exact snapshot `MutationRecord`s with original IDs, seeds, and parameters, synchronously recreating visual decals/crystals in `ResidueManager`, with full undo/redo symmetry for removal transactions; (2) `importJson()` performs deterministic counter reconciliation on `idCounter` (`mut_<type>_<N>`) and `transactionCounter` (`tx_<N>`, `tx_terrain_<N>`), preventing ID collisions for subsequent mutations/transactions, while preserving complete counter atomicity on invalid imports; (3) all 10 checks and full browser QA verified with 0 console errors. | rerun after MutationManager transaction/import logic changes |

## 12. Current Change Scope and Impact Radius

- **Allowed next:** Phase 6 per ROADMAP.md. It is explicitly **not** started in revision 20.
- **Protected:** Phase 1 timing/shake/resources; Phase 2 preview semantics; Phase 3 projection/frame contracts and the 12-check surface validator; Phase 4 schema/registry/sequence runtime; Phase 5 persistent aftermath and mutation authority; seven-mode shell; default route without validation query flags; EngineClock as sole simulation-time owner.
- **Mandatory checks after any repair:** lint/typecheck, runtime-spine, indicator-model, surface-frame, source-graph, ability-schema, sequence-runtime, world-effects, mutation-state, production build, `?surfaceAutoTest=1` runtime report, Phase 2 preview smoke, Phase 4 Sequence smoke, Phase 5 browser proofs — all run and passing as of revision 20.
- **Stop:** Phase 6 not started.

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
| 17 | **Phase 4 complete.** Added a versioned Ajv-validated ability schema with 1.0.0→1.1.0 migration, hardened `AbilityRegistry` (validated admission, explicit duplicate policy, atomic import, inspectable errors), a real Ability Factory UI (author/validate/register/preview/export/import/reject), ten data-only abilities in `ability-pack.json`, and a deterministic semantic sequence runtime (sequence/parallel/wait/emit/travel/impact/field/residue) driven solely by EngineClock with a working Sequence Designer. Added `check:ability-schema` and `check:sequence-runtime`. Enabled `resolveJsonModule`; added `.gitignore` and committed the npm lockfile. All eight gates plus both browser proofs PASS; Phase 1-3 regressions clean (surface validator still 12/12). PND-003 resolved. Phase 5 not started. |
| 18 | **Phase 5 declarative residue layer complete.** Implemented World-Effect / Aftermath-Residue Layer. Updated `AbilitySchema` to add optional `duration` to `decal` modules. Modified `TerrainManager` to accept durations, enforce a deterministic 64-decal budget cap with oldest eviction and GPU resource disposal, and process lifecycle updates with opacity fadeouts on expiration. Repaired `SequenceSchema` so semantic `impact`, `field`, and `residue` stages accept validated `abilityId`s, unlocking the complete generic declarative sequence $\to$ world-effect pipeline. |
| 19 | **Phase 5 persistent aftermath architecture.** Fully separated responsibilities into `MutationManager` (authoritative pure world-state, deterministic IDs/PRNG seeds, transactions with true undo/redo, global 64 and per-type budgets, simulation-time lifecycle, JSON export/import), `ResidueManager` (visual aftermath realization, decals, seeded crystal cluster meshes, shader uniforms, surface-normal alignment, GPU resource disposal), `SurfaceQuery` (geometry authority with stable `surfaceId` on `SurfaceHit`), `TerrainDemo` (demo terrain mesh ownership, vertex deformation, height deltas), and `TerrainManager` (backward-compatible facade). Implemented 6 archetypes (`scorch`, `frost`, `lava`, `crystal`, `golden_rune`, `void_scar`). Added Ajv schema `1.0.0` (`MutationSchema.ts`, `MutationValidator.ts`). Added `check:mutation-state` (21/21 checks passing). Verified with full browser acceptance suite (`scripts/browser-acceptance-suite.cjs`) covering all 6 phases with 0 console errors and 0 leaks. |
| 20 | **Phase 5 complete: Mutation redo and import ID reconciliation repair.** Repaired `MutationManager.redo()` to fully restore undone `MutationRecord` snapshots (ID, seed, type, duration, surfaceId) in original addition order, firing `onMutationAdded` to recreate visual decals/crystals in `ResidueManager`, and maintaining symmetrical undo/redo for removal transactions. Repaired `MutationManager.importJson()` to reconcile `idCounter` and `transactionCounter` against max numeric suffixes (`mut_<type>_<N>`, `tx_<N>`, `tx_terrain_<N>`), preventing ID collisions for new records created post-import, and maintaining strict counter atomicity on invalid imports. Verified with expanded `check:mutation-state` (Requirements A-I), `check:world-effects`, all 10 pure checks/build, and full browser acceptance suite (with explicit mutation undo/redo and post-import ID uniqueness assertions) passing with 0 console errors. Phase 6 remains NOT STARTED. |
