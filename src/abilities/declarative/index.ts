/**
 * Data-only ability pack.
 *
 * These abilities exist purely as validated JSON. Adding another ordinary
 * ability means adding an entry to `ability-pack.json` — no change to App.tsx,
 * input handling, HUD, renderer, the Ability Factory, or any VFX runtime
 * module. The pack is deliberately typed as `unknown` so it can only enter the
 * runtime through the schema validator.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import abilityPack from './ability-pack.json';

export const DECLARATIVE_ABILITY_PACK: unknown[] = abilityPack as unknown[];
