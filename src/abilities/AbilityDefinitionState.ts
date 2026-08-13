import { AbilityDefinition } from '../types';

export function cloneAbilityDefinition(definition: AbilityDefinition): AbilityDefinition {
  return {
    ...definition,
    targeting: { ...definition.targeting },
    timing: { ...definition.timing },
    modules: definition.modules.map((module) => ({ ...module, params: { ...module.params } })),
    feedback: { ...definition.feedback },
    budget: { ...definition.budget },
  };
}

export function hasSameModuleShape(a: AbilityDefinition, b: AbilityDefinition): boolean {
  return a.modules.length === b.modules.length && a.modules.every((module, index) => module.type === b.modules[index]?.type);
}

export function mutateAbilityDefinition(target: AbilityDefinition, source: AbilityDefinition): void {
  target.name = source.name;
  target.school = source.school;
  target.description = source.description;
  target.iconName = source.iconName;
  Object.assign(target.targeting, source.targeting);
  Object.assign(target.timing, source.timing);
  Object.assign(target.feedback, source.feedback);
  Object.assign(target.budget, source.budget);
  for (let i = 0; i < source.modules.length; i++) {
    const incoming = source.modules[i];
    const current = target.modules[i];
    current.preset = incoming.preset;
    Object.assign(current.params, incoming.params);
    for (const key of Object.keys(current.params)) {
      if (!(key in incoming.params)) delete current.params[key];
    }
  }
}
