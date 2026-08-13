import { AbilityModuleConfig, AbilityRequest } from '../../types';
import { EnergyBeam } from '../EnergyBeam';
import { RuntimeVfxModule, VfxModuleFactoryContext, colorParam, numberParam } from './VfxRuntimeTypes';

export class BeamRuntimeModule implements RuntimeVfxModule {
  public readonly type = 'beam' as const;
  private readonly beam: EnergyBeam;
  private readonly request: AbilityRequest;

  constructor(config: AbilityModuleConfig, context: VfxModuleFactoryContext) {
    this.request = context.request;
    this.beam = new EnergyBeam(context.scene, context.request.origin, context.request.target);
    this.applyParams(config.params);
  }

  applyParams(params: AbilityModuleConfig['params']): void {
    this.beam.setParameters({
      radius: numberParam(params, 'radius', 0.6),
      intensity: numberParam(params, 'intensity', 1.5),
      scrollSpeed: numberParam(params, 'scrollSpeed', 8),
      colorCore: colorParam(params, 'colorCore', 0xffffff),
      colorGlow: colorParam(params, 'colorGlow', 0x00aaff),
    });
    this.beam.updatePosition(this.request.origin, this.request.target);
  }

  update(_dt: number, time: number): void { this.beam.update(time); }
  destroy(): void { this.beam.destroy(); }
}
