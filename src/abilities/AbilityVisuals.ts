/** Browser-only visual module and light ownership for one ability instance. */
import * as THREE from 'three';
import { AbilityDefinition, AbilityRequest } from '../types';
import { globalVfxPool } from '../core/VfxPool';
import { SeededRandom } from '../core/SeededRandom';
import { RuntimeVfxModule, globalVfxModuleRegistry } from '../vfx/VfxModuleRegistry';

export class AbilityVisuals {
  private modules: Array<{ configIndex: number; runtime: RuntimeVfxModule }> = [];
  private activeLight: THREE.PointLight | null = null;
  constructor(private readonly scene: THREE.Scene, private readonly request: AbilityRequest, private readonly definition: AbilityDefinition, private readonly random: SeededRandom, initialPosition: THREE.Vector3) { this.initialize(initialPosition); }
  public initialize(position: THREE.Vector3): void {
    this.modules = [];
    for (let configIndex = 0; configIndex < this.definition.modules.length; configIndex++) {
      const config = this.definition.modules[configIndex];
      const runtime = globalVfxModuleRegistry.create(config, { scene: this.scene, request: this.request, currentPosition: position, maxParticles: this.definition.budget.maxParticles, random: () => this.random.next() });
      if (runtime) this.modules.push({ configIndex, runtime });
    }
    if (this.definition.budget.dynamicLights > 0) this.activeLight = globalVfxPool.acquireLight(this.definition.feedback.lightColor, 2, this.definition.feedback.lightRadius, position);
  }
  public reset(position: THREE.Vector3): void { this.destroy(); this.initialize(position); }
  public update(dt: number, time: number): void { for (const { runtime } of this.modules) runtime.update(dt, time); }
  public updatePosition(position: THREE.Vector3): void { for (const { runtime } of this.modules) runtime.setPosition?.(position); if (this.activeLight) this.activeLight.position.copy(position); }
  public setImpactProgress(progress: number): void { for (const { runtime } of this.modules) runtime.setProgress?.(progress); }
  public emitImpact(position: THREE.Vector3, time: number): void { for (const { runtime } of this.modules) runtime.triggerImpact?.(position, time); }
  public applyDefinition(): void { this.modules.forEach(({ configIndex, runtime }) => runtime.applyParams(this.definition.modules[configIndex].params)); if (this.activeLight) { this.activeLight.color.set(this.definition.feedback.lightColor); this.activeLight.distance = this.definition.feedback.lightRadius; } }
  public setFadeProgress(progress: number): void { if (this.activeLight) this.activeLight.intensity = Math.max(0, progress * 3); }
  public getParticleCount(): number { return this.modules.reduce((sum, entry) => sum + (entry.runtime.getParticleCount?.() ?? 0), 0); }
  public destroy(): void { for (const { runtime } of this.modules) runtime.destroy(); this.modules = []; if (this.activeLight) { globalVfxPool.releaseLight(this.activeLight); this.activeLight = null; } }
}
