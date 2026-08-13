/**
 * Browser-only visual orb primitive; owns no network, file, or external process behavior.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VolumetricOrbShader } from '../shaders';

export interface VolumetricOrbParameters {
  radius?: number;
  colorCore?: THREE.ColorRepresentation;
  colorOuter?: THREE.ColorRepresentation;
  noiseScale?: number;
}

export class VolumetricOrb {
  public mesh: THREE.Mesh;
  private geometry: THREE.SphereGeometry;
  private material: THREE.ShaderMaterial;

  constructor(
    private readonly scene: THREE.Scene,
    position: THREE.Vector3,
    radius: number = 1.0,
    colorCoreHex: THREE.ColorRepresentation = 0xffaa00,
    colorOuterHex: THREE.ColorRepresentation = 0xff0044
  ) {
    this.geometry = new THREE.SphereGeometry(1, 32, 32);
    this.material = new THREE.ShaderMaterial({
      vertexShader: VolumetricOrbShader.vertexShader,
      fragmentShader: VolumetricOrbShader.fragmentShader,
      uniforms: {
        uColorCore: { value: new THREE.Color(colorCoreHex) },
        uColorOuter: { value: new THREE.Color(colorOuterHex) },
        uTime: { value: 0 },
        uNoiseScale: { value: 3.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position);
    this.mesh.scale.setScalar(Math.max(0.001, radius));
    this.scene.add(this.mesh);
  }

  public setParameters(params: VolumetricOrbParameters): void {
    if (params.radius !== undefined && Number.isFinite(params.radius)) {
      this.mesh.scale.setScalar(Math.max(0.001, params.radius));
    }
    if (params.colorCore !== undefined) this.material.uniforms.uColorCore.value.set(params.colorCore);
    if (params.colorOuter !== undefined) this.material.uniforms.uColorOuter.value.set(params.colorOuter);
    if (params.noiseScale !== undefined) this.material.uniforms.uNoiseScale.value = params.noiseScale;
  }

  public setScale(scale: number) {
    this.mesh.scale.setScalar(Math.max(0.001, scale));
  }

  public update(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  public destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
