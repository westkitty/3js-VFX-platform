import * as THREE from 'three';
import { AbilityModuleConfig } from '../../types';
import { ParticleEmitter } from '../ParticleEmitter';
import { RuntimeVfxModule, VfxModuleFactoryContext, RandomSource, colorParam, numberParam } from './VfxRuntimeTypes';

export class ParticleRuntimeModule implements RuntimeVfxModule {
  public readonly type = 'particles' as const;
  private readonly emitter: ParticleEmitter;
  private readonly scene: THREE.Scene;
  private readonly random: RandomSource;
  private params: AbilityModuleConfig['params'];

  constructor(config: AbilityModuleConfig, context: VfxModuleFactoryContext) {
    this.scene = context.scene;
    this.emitter = new ParticleEmitter(context.scene, context.maxParticles);
    this.random = context.random;
    this.params = { ...config.params };
    this.applyParams(config.params);
  }

  applyParams(params: AbilityModuleConfig['params']): void {
    const previousSpeed = numberParam(this.params, 'speed', 6);
    Object.assign(this.params, params);
    const nextSpeed = numberParam(this.params, 'speed', 6);
    this.emitter.setSizeMultiplier(numberParam(this.params, 'size', 1));
    this.emitter.setActiveColor(colorParam(this.params, 'color', 0xffaa00).getHex());
    if (previousSpeed !== nextSpeed && Math.abs(previousSpeed) > 1e-8) {
      this.emitter.scaleActiveVelocities(nextSpeed / previousSpeed);
    }
  }

  update(dt: number, time: number): void { this.emitter.update(dt, time); }
  triggerImpact(position: THREE.Vector3, time: number): void {
    const color = colorParam(this.params, 'color', 0xffaa00);
    this.emitter.emitBurst(
      position,
      Math.max(0, Math.floor(numberParam(this.params, 'count', 150))),
      color.getHex(),
      numberParam(this.params, 'speed', 6),
      time,
      this.random
    );
  }
  getParticleCount(): number { return this.emitter.getActiveCount(); }
  destroy(): void { this.emitter.destroy(this.scene); }
}
