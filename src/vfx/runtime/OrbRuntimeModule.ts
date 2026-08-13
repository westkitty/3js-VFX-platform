import * as THREE from 'three';
import { AbilityModuleConfig } from '../../types';
import { VolumetricOrb } from '../VolumetricOrb';
import { RuntimeVfxModule, VfxModuleFactoryContext, colorParam, numberParam } from './VfxRuntimeTypes';

export class OrbRuntimeModule implements RuntimeVfxModule {
  public readonly type = 'orb' as const;
  private readonly orb: VolumetricOrb;

  constructor(config: AbilityModuleConfig, context: VfxModuleFactoryContext) {
    this.orb = new VolumetricOrb(context.scene, context.currentPosition, 1);
    this.applyParams(config.params);
  }

  applyParams(params: AbilityModuleConfig['params']): void {
    this.orb.setParameters({
      radius: numberParam(params, 'radius', 1),
      colorCore: colorParam(params, 'colorCore', 0xffaa00),
      colorOuter: colorParam(params, 'colorOuter', 0xff0044),
      noiseScale: numberParam(params, 'noiseScale', 3),
    });
  }

  update(_dt: number, time: number): void { this.orb.update(time); }
  setPosition(position: THREE.Vector3): void { this.orb.mesh.position.copy(position); }
  destroy(): void { this.orb.destroy(); }
}
