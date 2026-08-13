import { AbilityModuleConfig } from '../types';
import { BeamRuntimeModule } from './runtime/BeamRuntimeModule';
import { OrbRuntimeModule } from './runtime/OrbRuntimeModule';
import { ParticleRuntimeModule } from './runtime/ParticleRuntimeModule';
import { RibbonRuntimeModule } from './runtime/RibbonRuntimeModule';
import { ShockwaveRuntimeModule } from './runtime/ShockwaveRuntimeModule';
import { RuntimeVfxModule, VfxModuleFactory, VfxModuleFactoryContext } from './runtime/VfxRuntimeTypes';

export type { RuntimeVfxModule, VfxModuleFactoryContext } from './runtime/VfxRuntimeTypes';

export class VfxModuleRegistry {
  private readonly factories = new Map<AbilityModuleConfig['type'], VfxModuleFactory>();

  public register(type: AbilityModuleConfig['type'], factory: VfxModuleFactory): void {
    this.factories.set(type, factory);
  }

  public has(type: AbilityModuleConfig['type']): boolean { return this.factories.has(type); }

  public create(config: AbilityModuleConfig, context: VfxModuleFactoryContext): RuntimeVfxModule | null {
    const factory = this.factories.get(config.type);
    return factory ? factory(config, context) : null;
  }

  public getRegisteredTypes(): AbilityModuleConfig['type'][] { return Array.from(this.factories.keys()); }
}

export const globalVfxModuleRegistry = new VfxModuleRegistry();
globalVfxModuleRegistry.register('orb', (config, context) => new OrbRuntimeModule(config, context));
globalVfxModuleRegistry.register('beam', (config, context) => new BeamRuntimeModule(config, context));
globalVfxModuleRegistry.register('shockwave', (config, context) => new ShockwaveRuntimeModule(config, context));
globalVfxModuleRegistry.register('ribbon', (config, context) => new RibbonRuntimeModule(config, context));
globalVfxModuleRegistry.register('particles', (config, context) => new ParticleRuntimeModule(config, context));
