/**
 * Data-only sequence pack. Like the ability pack, these are plain JSON
 * documents that only enter the runtime through the schema validator.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import sequencePack from './sequence-pack.json';

export const DECLARATIVE_SEQUENCE_PACK: unknown[] = sequencePack as unknown[];
