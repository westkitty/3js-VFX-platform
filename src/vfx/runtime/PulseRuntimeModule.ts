import { AbilityModuleConfig } from '../../types';
import { PulseRing } from '../PulseRing';
import { RuntimeVfxModule, VfxModuleFactoryContext, colorParam, numberParam } from './VfxRuntimeTypes';

export class PulseRuntimeModule implements RuntimeVfxModule {
  public readonly type = 'shockwave' as const;
  private readonly ring: PulseRing;

  constructor(config: AbilityModuleConfig, context: VfxModuleFactoryContext) {
    this.ring = new PulseRing(context.scene, context.request.target, 1);
    this.applyParams(config.params);
  }

  applyParams(params: AbilityModuleConfig['params']): void {
    this.ring.setParameters({
      maxRadius: numberParam(params, 'radius', 6),
      ringWidth: numberParam(params, 'ringWidth', 0.08),
      fillAlpha: numberParam(params, 'fillAlpha', 0.3),
      colorPrimary: colorParam(params, 'colorPrimary', 0x00ffff),
      colorSecondary: colorParam(params, 'colorSecondary', 0x0044ff),
    });
  }

  update(_dt: number, time: number): void { this.ring.update(time); }
  setProgress(progress: number): void { this.ring.setProgress(progress); }
  destroy(): void { this.ring.destroy(); }
}
