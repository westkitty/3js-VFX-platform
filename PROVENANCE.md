# AetherVFX Provenance

## Source lineage

AetherVFX began from the public repository:

- `achrefelouafi/LinearAbiltyCastingThreeJS`
- Upstream license: MIT
- Upstream copyright: Copyright (c) 2026 mohamedachrefelouafi

The upstream MIT notice is retained in `LICENSE-MIT`. Subsequent AetherVFX files
and contributions carrying `SPDX-License-Identifier: Apache-2.0` are additional
Apache-2.0-marked work; they do not erase the upstream MIT notice for material
derived from the original project.

## Verified AetherVFX checkpoints

| Phase | Verified checkpoint | Scope |
|---|---|---|
| 1 | `3657aa0615989ac7db28331976133eba80d0965b` | EngineClock, seeded runtime, resource lifecycle |
| 2 | `92668c57cbc0c1d5ba77d9ecda34dfc0d70634f6` | live VFX runtime and seven-mode shell |
| 3 | `4704efd158f237b459d7b2008f06d743f74270c5` | SurfaceQuery, freehand, indicators, browser surface proof |
| 4 | `090c81335105bb2698005d88ec3163df66bede56` | validated data-driven abilities and semantic sequence runtime |
| 5 | `628aa3037fee59054dccd6dc623ca9064dcf4e69` | persistent mutations, residue, save/load, undo/redo, ID reconciliation |

Phase 6 source was first published at
`17d47ebd7ee1570c74ae5fce5e184a40eb04751b`, but post-publication review found
release-gate defects in CI ordering, benchmark timing/baseline identity, visual
fixture determinism/tolerance, and licensing documentation. That commit is
therefore a **Phase 6 implementation checkpoint, not a verified release
checkpoint**.

The repair branch must not promote a new Phase 6 release checkpoint until the
corrected local reference performance baseline, deterministic visual fixtures,
clean static build, and final GitHub Actions workflow all pass.

## Generated artifacts

- `benchmarks/performance/*.json` are generated measurement evidence. A baseline
  is authoritative only when its embedded build/environment identity matches the
  source being evaluated and a separate repeatability record passes.
- `tests/visual.spec.ts-snapshots/*.png` are environment-specific visual golden
  files. They are evidence only for the matching Playwright project/platform.
- `dist/`, `node_modules/`, Playwright reports, and temporary test output are not
  source-of-truth artifacts and must not be committed as release source.
