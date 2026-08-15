/**
 * Demonstration terrain implementation.
 *
 * Owns ONLY the demo terrain mesh, geometry, material, and vertex height deformation.
 * Does NOT own mutation state, visual residue decals/crystals, or global transaction history.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TerrainShader } from '../shaders';
import type { TerrainHeightDelta } from '../mutation/MutationTypes';

export class TerrainDemo {
  public readonly mesh: THREE.Mesh;
  private readonly scene: THREE.Scene;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly originalPositions: Float32Array;
  private readonly currentPositions: Float32Array;

  constructor(scene: THREE.Scene, width = 60, height = 60, segments = 100) {
    this.scene = scene;
    this.geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    this.geometry.rotateX(-Math.PI / 2); // Lay horizontal

    const posAttr = this.geometry.attributes.position;
    this.originalPositions = new Float32Array(posAttr.array.length);
    this.originalPositions.set(posAttr.array);
    this.currentPositions = new Float32Array(posAttr.array.length);
    this.currentPositions.set(posAttr.array);

    this.material = new THREE.ShaderMaterial({
      vertexShader: TerrainShader.vertexShader,
      fragmentShader: TerrainShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(0x181e28) },
        uGridColor: { value: new THREE.Color(0x2a364a) },
        uShowGrid: { value: 1.0 },
      },
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'TerrainMesh';
    this.mesh.userData.surfaceId = 'terrain_main';

    this.scene.add(this.mesh);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setShowGrid(show: boolean): void {
    this.material.uniforms.uShowGrid.value = show ? 1.0 : 0.0;
  }

  public updateTime(time: number): void {
    this.material.uniforms.uTime.value = time;
  }

  /**
   * Deforms vertex heights at center position, returning the exact modified height delta
   * so transactions can record and reverse the geometric change.
   */
  public sculptTerrain(center: THREE.Vector3, radius: number, strength: number): TerrainHeightDelta {
    const pos = this.geometry.attributes.position;
    const array = pos.array as Float32Array;

    const indices: number[] = [];
    const previousHeights: number[] = [];
    const newHeights: number[] = [];

    const radiusSq = radius * radius;

    for (let i = 0; i < pos.count; i++) {
      const vx = array[i * 3];
      const vy = array[i * 3 + 1];
      const vz = array[i * 3 + 2];

      const dx = vx - center.x;
      const dz = vz - center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < radiusSq) {
        const dist = Math.sqrt(distSq);
        const falloff = (1.0 - dist / radius) ** 2;
        const newY = vy + strength * falloff;

        indices.push(i);
        previousHeights.push(vy);
        newHeights.push(newY);

        array[i * 3 + 1] = newY;
      }
    }

    if (indices.length > 0) {
      pos.needsUpdate = true;
      this.geometry.computeVertexNormals();
    }

    return { indices, previousHeights, newHeights };
  }

  /**
   * Applies or reverses a height delta for undo/redo.
   */
  public applyHeightDelta(delta: TerrainHeightDelta, isRevert = false): void {
    const pos = this.geometry.attributes.position;
    const array = pos.array as Float32Array;
    const targets = isRevert ? delta.previousHeights : delta.newHeights;

    for (let k = 0; k < delta.indices.length; k++) {
      const idx = delta.indices[k];
      array[idx * 3 + 1] = targets[k];
    }

    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public resetHeights(): void {
    const pos = this.geometry.attributes.position;
    (pos.array as Float32Array).set(this.originalPositions);
    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public destroy(): void {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
