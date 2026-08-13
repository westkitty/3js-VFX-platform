/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface VfxPoolStats {
  activeLights: number;
  pooledLights: number;
  totalLights: number;
}

export class VfxPool {
  private lightPool: THREE.PointLight[] = [];
  private activeLights: THREE.PointLight[] = [];
  private scene: THREE.Scene | null = null;
  private readonly prewarmLightCount = 16;

  public init(scene: THREE.Scene) {
    // React development remounts and future scene changes must not duplicate the
    // global pool or leave lights attached to an abandoned scene.
    if (this.scene === scene && this.getTotalLightCount() > 0) return;
    if (this.scene && this.scene !== scene) this.dispose();

    this.scene = scene;
    for (let i = 0; i < this.prewarmLightCount; i++) {
      const light = new THREE.PointLight(0xffffff, 0, 10);
      light.visible = false;
      this.scene.add(light);
      this.lightPool.push(light);
    }
  }

  public acquireLight(
    color: THREE.ColorRepresentation,
    intensity: number,
    distance: number,
    position: THREE.Vector3
  ): THREE.PointLight | null {
    const light = this.lightPool.pop();
    if (!light) return null;

    light.color.set(color);
    light.intensity = intensity;
    light.distance = distance;
    light.position.copy(position);
    light.visible = true;
    this.activeLights.push(light);
    return light;
  }

  public releaseLight(light: THREE.PointLight) {
    const index = this.activeLights.indexOf(light);
    if (index === -1) return;

    this.activeLights.splice(index, 1);
    light.intensity = 0;
    light.visible = false;
    this.lightPool.push(light);
  }

  public getActiveLightCount(): number {
    return this.activeLights.length;
  }

  public getStats(): VfxPoolStats {
    return {
      activeLights: this.activeLights.length,
      pooledLights: this.lightPool.length,
      totalLights: this.getTotalLightCount(),
    };
  }

  public releaseAll() {
    [...this.activeLights].forEach((light) => this.releaseLight(light));
  }

  public dispose() {
    this.releaseAll();

    if (this.scene) {
      for (const light of this.lightPool) {
        this.scene.remove(light);
      }
    }

    this.lightPool = [];
    this.activeLights = [];
    this.scene = null;
  }

  private getTotalLightCount(): number {
    return this.lightPool.length + this.activeLights.length;
  }
}

export const globalVfxPool = new VfxPool();
