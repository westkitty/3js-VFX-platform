# Third-Party and Upstream Notices

This file records **direct** project dependencies and the upstream source from
which AetherVFX was derived. Transitive npm dependency license metadata remains
available in `package-lock.json`.

## Upstream source — LinearAbiltyCastingThreeJS

- Repository: `achrefelouafi/LinearAbiltyCastingThreeJS`
- Upstream license: **MIT**
- Upstream copyright: **Copyright (c) 2026 mohamedachrefelouafi**

The upstream MIT notice is preserved verbatim in `LICENSE-MIT`.
AetherVFX's later Apache-2.0-marked contributions do not replace that upstream
notice for derived material.

## Direct runtime dependencies

Versions below are the manifest constraints in `package.json`; the lockfile is
the authority for the exact installed package graph.

| Package | Manifest version | License family |
|---|---:|---|
| `three` | `^0.185.1` | MIT |
| `react` | `^19.0.1` | MIT |
| `react-dom` | `^19.0.1` | MIT |
| `lucide-react` | `^0.546.0` | ISC |
| `ajv` | `^8.20.0` | MIT |
| `vite` | `^6.2.3` | MIT |
| `@vitejs/plugin-react` | `^5.0.4` | MIT |
| `tailwindcss` | `^4.1.14` | MIT |
| `@tailwindcss/vite` | `^4.1.14` | MIT |
| `@types/three` | `^0.185.4` | MIT |

## Direct development dependencies

| Package | Manifest version | License family |
|---|---:|---|
| `@playwright/test` | `^1.62.1` | Apache-2.0 |
| `playwright` | `^1.62.1` | Apache-2.0 |
| `typescript` | `~5.8.2` | Apache-2.0 |
| `tsx` | `^4.21.0` | MIT |
| `esbuild` | `^0.25.0` | MIT |
| `autoprefixer` | `^10.4.21` | MIT |
| `@types/node` | `^22.14.0` | MIT |

There is **no Vitest dependency** in the current manifest. Historical notices
that listed Vitest or older React/Three/Vite/Tailwind versions were stale and
have been removed.

This notice is an inventory, not legal advice. For redistribution, preserve
applicable license files/notices and verify the lockfile package graph used for
the release being distributed.
