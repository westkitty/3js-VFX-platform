/**
 * Browser-only visual ribbon primitive; owns no network, file, or external process behavior.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RibbonShader } from '../shaders';

export interface VisualRibbonParameters {
  width?: number;
  opacity?: number;
  noiseFreq?: number;
  noiseAmp?: number;
  colorCore?: THREE.ColorRepresentation;
  colorGlow?: THREE.ColorRepresentation;
}

export class VisualRibbon {
  public mesh: THREE.Mesh;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene, points: THREE.Vector3[], colorCore: THREE.Color, colorGlow: THREE.Color, width: number = 0.5) {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      vertexShader: RibbonShader.vertexShader,
      fragmentShader: RibbonShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uNoiseFreq: { value: 4.0 },
        uNoiseAmp: { value: 0.35 },
        uWidth: { value: width },
        uColorCore: { value: colorCore },
        uColorGlow: { value: colorGlow },
        uOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.updatePoints(points);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);
  }

  public updatePoints(points: THREE.Vector3[]) {
    if (points.length < 2) return;
    const count = points.length;
    const vertices: number[] = [];
    const directions: number[] = [];
    const progress: number[] = [];
    const sides: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      const pt = points[i];
      const pNorm = i / (count - 1);
      let dir = new THREE.Vector3(0, 1, 0);
      if (i < count - 1) dir = points[i + 1].clone().sub(pt).normalize();
      else dir = pt.clone().sub(points[i - 1]).normalize();
      vertices.push(pt.x, pt.y, pt.z);
      directions.push(dir.x, dir.y, dir.z);
      progress.push(pNorm);
      sides.push(-1.0);
      uvs.push(pNorm, 0.0);
      vertices.push(pt.x, pt.y, pt.z);
      directions.push(dir.x, dir.y, dir.z);
      progress.push(pNorm);
      sides.push(1.0);
      uvs.push(pNorm, 1.0);
      if (i < count - 1) {
        const row = i * 2;
        indices.push(row, row + 1, row + 2);
        indices.push(row + 1, row + 3, row + 2);
      }
    }
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute('aDirection', new THREE.Float32BufferAttribute(directions, 3));
    this.geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1));
    this.geometry.setAttribute('aSide', new THREE.Float32BufferAttribute(sides, 1));
    this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry.setIndex(indices);
    this.geometry.computeVertexNormals();
  }

  public setParameters(params: VisualRibbonParameters) {
    if (params.width !== undefined) this.material.uniforms.uWidth.value = params.width;
    if (params.opacity !== undefined) this.material.uniforms.uOpacity.value = params.opacity;
    if (params.noiseFreq !== undefined) this.material.uniforms.uNoiseFreq.value = params.noiseFreq;
    if (params.noiseAmp !== undefined) this.material.uniforms.uNoiseAmp.value = params.noiseAmp;
    if (params.colorCore !== undefined) this.material.uniforms.uColorCore.value.set(params.colorCore);
    if (params.colorGlow !== undefined) this.material.uniforms.uColorGlow.value.set(params.colorGlow);
  }

  public setUniforms(params: VisualRibbonParameters) { this.setParameters(params); }
  public update(time: number) { this.material.uniforms.uTime.value = time; }
  public destroy(scene: THREE.Scene) { scene.remove(this.mesh); this.geometry.dispose(); this.material.dispose(); }
}
