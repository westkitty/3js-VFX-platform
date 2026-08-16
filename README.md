# AetherVFX — Deterministic 3D WebGL Ability & VFX Platform

**AetherVFX** is a production-ready, deterministic 3D spell-casting, targeting telegraph, persistent world mutation, and visual effects (VFX) framework built on Three.js, React, and TypeScript.

---

## 🌟 Core Architecture & Systems

AetherVFX provides a layered, decoupled game engine architecture with explicit resource ownership and deterministic time progression:

1. **Deterministic Runtime Spine (`src/core/Engine.ts`, `src/core/EngineClock.ts`)**:
   - Simulation time is completely decoupled from wall-clock rendering.
   - Stepped frame advances yield identical state across headless benchmark suites and interactive viewports.
   - Seeded deterministic PRNG (`src/core/SeededRandom.ts`) controls all particle spread, sequence bearings, and visual jitter.

2. **Surface & Terrain Geometry Authority (`src/core/SurfaceQuery.ts`, `src/core/SurfaceFrameModel.ts`)**:
   - Raycasting, projection, and local surface-normal orientation.
   - Conformal frame mapping guarantees targeting telegraphs and ground decals conform cleanly to horizontal, sloped, and uneven terrain geometry.

3. **Targeting Indicators & Telegraphs (`src/indicators/`)**:
   - Deterministic procedural outlines for 5 geometric archetypes: `circle`, `cone`, `line`, `ring`, and `arrow`.
   - Multi-phase telegraph animation lifecycle (`warning` -> `commit` -> `active`).

4. **Data-Driven Ability Schema & Runtime (`src/abilities/`, `src/schema/AbilitySchema.ts`)**:
   - JSON-declarative ability definitions validated against strict JSON Schemas.
   - Zero hardcoded logic: spells configure particle count, projectile speed, trajectory arcs, impact bursts, and area-of-effect fields purely through data.

5. **Semantic Multi-Stage Sequence Engine (`src/sequence/`)**:
   - Declarative composition of complex combos (`emit`, `travel`, `impact`, `field`, `residue`, `wait`, `parallel`, `sequence`).
   - Integrated semantic link: sequence nodes trigger registered ability IDs directly through the global registry.

6. **Persistent Aftermath & Terraforming (`src/mutation/`, `src/terrain/`)**:
   - Authoritative world-state mutations (`scorch`, `frost`, `lava`, `crystal`, `void_scar`, `golden_rune`).
   - Real-time vertex height deformation (`TerrainDemo`) paired with visual decals and props (`ResidueManager`).
   - Atomic transactions, true undo/redo history, budget caps, schema-validated JSON import/export, and ID counter reconciliation.

7. **Deterministic Performance Lab (`src/performance/`, `benchmarks/performance/`)**:
   - Headless and browser-executed benchmark harness with 10 deterministic workload scenarios.
   - Automated baseline comparison, p50/p95/p99 latency tracking, draw call and triangle metrics, and zero-leak WebGL resource enforcement.

8. **Visual Regression Fixture Suite (`tests/visual.spec.ts`)**:
   - 8 deterministic visual fixtures verified with pixel-level Playwright snapshot comparisons.

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/westkitty/3js-VFX-platform.git
cd 3js-VFX-platform
npm install
```

### Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Release Testing

AetherVFX enforces strict quality, safety, and performance gates across the entire platform.

### Run Unified Test Suite
```bash
npm test
```

### Individual Quality & Release Gates

| Command | Description |
| :--- | :--- |
| `npm run check:runtime-spine` | Verifies EngineClock determinism, time decoupling, and pause invariance. |
| `npm run check:source-graph` | Audits module dependency boundaries and circular import prevention. |
| `npm run check:indicator-model` | Validates telegraph geometry calculations, clamping, and phase progression. |
| `npm run check:surface-frame` | Asserts surface tangent frame calculations across normal topologies. |
| `npm run check:ability-schema` | Validates ability JSON schemas, injection guards, and atomic migrations. |
| `npm run check:sequence-runtime` | Tests sequence ordering, parallel branching, time-budgeted execution, and determinism. |
| `npm run check:world-effects` | Audits residue lifecycle, expiration, budget capping, and texture cleanup. |
| `npm run check:mutation-state` | Tests mutation transactions, undo/redo parity, terrain deformation, and counter reconciliation. |
| `npm run check:shader-safety` | Audits custom GLSL shaders and prevents runtime recompilations / cache key leaks. |
| `npm run test:perf:smoke` | Fast smoke test of all 10 deterministic performance scenarios with leak checks. |
| `npm run test:perf` | Authoritative performance suite with baseline regression comparison. |
| `npm run test:browser` | Playwright browser functional and security boundary test suite. |
| `npm run test:visual` | Playwright visual regression suite comparing 8 golden snapshot fixtures. |
| `npm run lint` | TypeScript typecheck (`tsc --noEmit`). |
| `npm run build` | Production bundle build via Vite. |

---

## 📊 Deterministic Performance Scenarios

The performance harness executes 10 reproducible scenarios under fixed simulation deltas:

1. `idle_baseline`: Empty baseline scene evaluation.
2. `sequential_casts_100`: High-frequency sequential ability casting.
3. `concurrent_abilities_4`: 4 simultaneous overlapping spells.
4. `overload_burst`: Heavy multi-entity particle burst stress test.
5. `particle_scaling`: Large-scale particle system simulation.
6. `residue_scaling`: Maximum budget aftermath residue and decal rendering.
7. `telegraphs_100`: 100 concurrent surface-conforming targeting indicators.
8. `editor_open_active_mutation`: Interactive mutation and sculpting state under active rendering.
9. `freehand_path_workload`: Continuous Catmull-Rom spline stroke generation and surface projection.
10. `terrain_raycast_sweep`: Intensive surface query raycast sweeping across deformed terrain.

---

## 🔒 Security & Safe Runtime Boundaries

- In production builds (`/`), internal engine instances and testing APIs are completely unexposed.
- Bounded test APIs (`window.__AETHERVFX_TEST_API__`) are gated strictly behind explicit test routes (`?testMode=1` / `?perfTest=1`).

---

## 📄 License & Attribution

- Source code licensed under [Apache-2.0](LICENSE).
- Third-party open-source components and licensing attributions are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- Architecture origin and phased development provenance are tracked in [PROVENANCE.md](PROVENANCE.md).
