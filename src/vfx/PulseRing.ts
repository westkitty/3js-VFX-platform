/**
 * Browser-only visual ring primitive; owns no network, file, or external process behavior.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ShockRingShader } from '../shaders';

export interface PulseRingParameters {
  maxRadius?: number;
  ringWidth?: number;
  fillAlpha?: number;
  colorPrimary?: THREE.ColorRepresentation;
  colorSecondary?: THREE.ColorRepresentation;
}

export class PulseRing {
  public mesh: THREE.Mesh;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private maxRadius: number;
  private currentProgress: number = 0;

  constructor(
    private readonly scene: THREE.Scene,
    position: THREE.Vector3,
    maxRadius: number = 8.0,
    colorPrimaryHex: THREE.ColorRepresentation = 0x00ffff,
    colorSecondaryHex: THREE.ColorRepresentation = 0x0044ff
  ) {
    this.maxRadius = Math.max(0.001, maxRadius);
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.geometry.rotateX(-Math.PI / 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: ShockRingShader.vertexShader,
      fragmentShader: ShockRingShader.fragmentShader,
      uniforms: {
        uColorPrimary: { value: new THREE.Color(colorPrimaryHex) },
        uColorSecondary: { value: new THREE.Color(colorSecondaryHex) },
        uRadius: { value: 0.0 },
        uRingWidth: { value: 0.08 },
        uTime: { value: 0 },
        uFillAlpha: { value: 0.3 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.05;
    this.mesh.scale.setScalar(this.maxRadius);
    this.scene.add(this.mesh);
  }

  public setParameters(params: PulseRingParameters): void {
    if (params.maxRadius !== undefined && Number.isFinite(params.maxRadius)) {
      this.maxRadius = Math.max(0.001, params.maxRadius);
      this.mesh.scale.setScalar(this.maxRadius);
    }
    if (params.ringWidth !== undefined) this.material.uniforms.uRingWidth.value = params.ringWidth;
    if (params.fillAlpha !== undefined) this.material.uniforms.uFillAlpha.value = params.fillAlpha;
    if (params.colorPrimary !== undefined) this.material.uniforms.uColorPrimary.value.set(params.colorPrimary);
    if (params.colorSecondary !== undefined) this.material.uniforms.uColorSecondary.value.set(params.colorSecondary);
  }

  public setProgress(progress: number) {
    this.currentProgress = Math.min(Math.max(progress, 0.0), 1.0);
    this.material.uniforms.uRadius.value = this.currentProgress;
  }

  public update(time: number) { this.material.uniforms.uTime.value = time; }
  public destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
