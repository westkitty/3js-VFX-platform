# AetherVFX Platform Provenance & Architecture Audit

## 1. Architectural Origin & Core Mission

AetherVFX is an open-source, deterministic 3D Ability Casting & VFX Platform built on top of Three.js and React. Its mission is to provide game developers, technical artists, and engine architects with a mathematically exact, declarative, reproducible foundation for casting indicators, trajectory simulations, area-of-effect shaders, persistent aftermath residues, terrain deformation, and multi-stage spell sequences.

---

## 2. Phase-by-Phase Provenance & Checkpoints

### Phase 1: Deterministic Engine Core & Clock Spine
- **Commit Checkpoint**: `4ebcda8` -> `090c813`
- **Responsibilities**:
  - `EngineClock` with fixed timestep simulation accumulator (`step(dt)`).
  - Seeded deterministic pseudorandom number generator (`SeededRandom`).
  - Strict resource tracking and explicit ownership model (`VfxPool`).
  - Deterministic camera shake simulation (`CameraShake`).

### Phase 2: Indicator & Aiming Mathematics
- **Responsibilities**:
  - Continuous trajectory projections: Line, Cone, Circle, Ring, Sector/Arc, Arrow.
  - Surface conforming telegraph meshes with normal alignment and dynamic range bounds.
  - Interactive aiming controls and multi-mode targeting states.

### Phase 3: Declarative Ability Schema & Runtime Pipeline
- **Responsibilities**:
  - Validated JSON/TypeScript schema (`AbilityDefinition`, `TimingModel`, `VisualSequenceNode`).
  - Stage execution state machine: `windup` -> `travel` -> `impact` -> `field` -> `residue`.
  - Reusable particle burst pipelines, beam ribbon emitters, and projectile ballistics.

### Phase 4: Freehand Spline & Multi-Segment Casting
- **Responsibilities**:
  - Interactive freehand gesture recording and Catmull-Rom spline resampling.
  - Segment projection onto complex 3D meshes via `SurfaceQuery`.
  - Multi-node ability sequences with stage linking and branch execution.

### Phase 5: Persistent Aftermath, Terrain Deformation & Surface Authority
- **Commit Checkpoints**: `7da8fc7` -> `c0640a9` -> `628aa30`
- **Responsibilities**:
  - `MutationManager`: Deterministic terrain vertex deformation (craters, elevation, smoothing, scorching) with full command-pattern undo/redo and monotonic counter reconciliation on persistence import.
  - `ResidueManager`: Scorch marks, decals, visual aftermath nodes with budget capping and fading.
  - `SurfaceQuery`: Spatial projection, normal alignment, and multi-mesh collision authority.
  - `TerrainDemo`: Irregular demonstration surface featuring slopes, steps, and dynamic displacement shaders.

### Phase 6: Performance Lab, Visual Regression & Release Gates
- **Responsibilities**:
  - Ten deterministic performance scenarios covering idle baseline, sequential bursts, concurrency, residue scaling, telegraph overload, active terrain mutations, freehand spline resampling, and spatial raycast sweeps.
  - Statistical distribution profiling (`p50`, `p95`, `p99`, `mean`, `fps`) with relative regression gates.
  - Three.js WebGL resource lifecycle leak detection (geometries and textures).
  - Shader safety static verification (division-by-zero guards, clamped `pow()` exponents, custom program cache keys).
  - Local Playwright browser automation and visual regression snapshots.
  - Apache-2.0 licensing, third-party attribution, and CI workflows.

---

## 3. Dependency Inventory & Pruning Verification

All non-essential runtime and development dependencies (e.g. backend servers, unneeded animation libraries, AI logic stubs) have been pruned from `package.json`. The remaining dependencies represent the minimal viable set required to build, test, and render AetherVFX:

- `three`: WebGL rendering engine
- `react` & `react-dom`: Declarative UI and inspection panels
- `lucide-react`: Lightweight icon elements
- `vite`: Fast module bundler and dev server
- `tailwindcss`: Utility styling
- `vitest`: Unit and schema test runner
- `@playwright/test` & `playwright`: Headless browser automation and visual regression engine
