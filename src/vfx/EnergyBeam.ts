/**
 * Browser-only visual beam primitive; owns no network, file, or external process behavior.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BeamShader } from '../shaders';

export interface EnergyBeamParameters {
  radius?: number;
  intensity?: number;
  scrollSpeed?: number;
  colorCore?: THREE.ColorRepresentation;
  colorGlow?: THREE.ColorRepresentation;
}

export class EnergyBeam {
  public mesh: THREE.Mesh;
  private geometry: THREE.CylinderGeometry;
  private material: THREE.ShaderMaterial;
  private radius = 0.6;

  constructor(
    private readonly scene: THREE.Scene,
    startPos: THREE.Vector3,
    endPos: THREE.Vector3,
    radius: number = 0.6,
    colorCoreHex: THREE.ColorRepresentation = 0xffffff,
    colorGlowHex: THREE.ColorRepresentation = 0x00aaff
  ) {
    // Unit-length cylinder. Positioning owns beam length so distance is applied
    // exactly once rather than being baked into geometry and multiplied again.
    this.geometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
    this.geometry.rotateX(Math.PI / 2); // Orient local cylinder axis along Z.

    this.material = new THREE.ShaderMaterial({
      vertexShader: BeamShader.vertexShader,
      fragmentShader: BeamShader.fragmentShader,
      uniforms: {
        uColorCore: { value: new THREE.Color(colorCoreHex) },
        uColorGlow: { value: new THREE.Color(colorGlowHex) },
        uTime: { value: 0 },
        uScrollSpeed: { value: 8.0 },
        uIntensity: { value: 1.5 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.radius = Math.max(0.001, radius);
    this.updatePosition(startPos, endPos);
    this.scene.add(this.mesh);
  }

  public updatePosition(startPos: THREE.Vector3, endPos: THREE.Vector3) {
    const distance = Math.max(0.001, startPos.distanceTo(endPos));
    const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);

    this.mesh.position.copy(midPoint);
    this.mesh.lookAt(endPos);
    this.mesh.scale.set(this.radius, this.radius, distance);
  }

  public setParameters(params: EnergyBeamParameters): void {
    if (params.radius !== undefined && Number.isFinite(params.radius)) {
      this.radius = Math.max(0.001, params.radius);
      this.mesh.scale.x = this.radius;
      this.mesh.scale.y = this.radius;
    }
    if (params.intensity !== undefined) this.material.uniforms.uIntensity.value = params.intensity;
    if (params.scrollSpeed !== undefined) this.material.uniforms.uScrollSpeed.value = params.scrollSpeed;
    if (params.colorCore !== undefined) this.material.uniforms.uColorCore.value.set(params.colorCore);
    if (params.colorGlow !== undefined) this.material.uniforms.uColorGlow.value.set(params.colorGlow);
  }

  public setIntensity(intensity: number) {
    this.setParameters({ intensity });
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
