/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AbilityDefinition } from '../types';
import { BUILTIN_ABILITIES } from './builtins';

export { BUILTIN_ABILITIES } from './builtins';

export class AbilityRegistry {
  private registry: Map<string, AbilityDefinition> = new Map();

  constructor() { BUILTIN_ABILITIES.forEach((definition) => this.register(definition)); }
  public register(definition: AbilityDefinition) { this.registry.set(definition.id, definition); }
  public get(id: string): AbilityDefinition | undefined { return this.registry.get(id); }
  public getAll(): AbilityDefinition[] { return Array.from(this.registry.values()); }
  public getBySchool(school: string): AbilityDefinition[] { return this.getAll().filter((ability) => ability.school === school); }
  public exportJson(): string { return JSON.stringify(this.getAll(), null, 2); }
  public importJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) data.forEach((definition) => this.register(definition));
      else if (data?.id) this.register(data);
      return true;
    } catch {
      return false;
    }
  }
}

export const globalAbilityRegistry = new AbilityRegistry();
