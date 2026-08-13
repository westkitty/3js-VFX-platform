/** Browser-only visual ribbon adapter; owns no network, file, or external process behavior. */
import * as THREE from 'three';
import { AbilityModuleConfig } from '../../types';
import { RibbonStrip } from '../RibbonStrip';
import { RuntimeVfxModule, VfxModuleFactoryContext, colorParam, numberParam } from './VfxRuntimeTypes';

export class RibbonRuntimeModule implements RuntimeVfxModule {
  public readonly type = 'ribbon' as const;
  private readonly ribbon: RibbonStrip;
  private readonly scene: THREE.Scene;

  constructor(config: AbilityModuleConfig, context: VfxModuleFactoryContext) {
    this.scene = context.scene;
    const path = context.request.path || [context.request.origin, context.request.target];
    this.ribbon = new RibbonStrip(
      context.scene,
      path,
      colorParam(config.params, 'colorCore', 0xffffff),
      colorParam(config.params, 'colorGlow', 0x00aaff)
    );
    this.applyParams(config.params);
  }

  applyParams(params: AbilityModuleConfig['params']): void {
    this.ribbon.setParameters({
      width: numberParam(params, 'width', 0.5),
      opacity: numberParam(params, 'opacity', 1),
      noiseFreq: numberParam(params, 'noiseFreq', 4),
      noiseAmp: numberParam(params, 'noiseAmp', 0.35),
      colorCore: colorParam(params, 'colorCore', 0xffffff),
      colorGlow: colorParam(params, 'colorGlow', 0x00aaff),
    });
  }

  update(_dt: number, time: number): void { this.ribbon.update(time); }
  destroy(): void { this.ribbon.destroy(this.scene); }
}
