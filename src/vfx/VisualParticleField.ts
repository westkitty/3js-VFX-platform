/**
 * Browser-only visual particle primitive; owns no network, file, or external process behavior.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ParticleInstancedShader } from '../shaders';

export type VisualParticleRandomSource = () => number;

export class VisualParticleField {
  public instancedMesh: THREE.InstancedMesh;
  private maxCount: number;
  private activeCount: number = 0;

  private instancePositions: Float32Array;
  private instanceVelocities: Float32Array;
  private instanceColors: Float32Array;
  private instanceSizes: Float32Array;
  private instanceLives: Float32Array;
  private instanceBirthTimes: Float32Array;

  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;

  constructor(scene: THREE.Scene, maxParticles: number = 2000) {
    this.maxCount = maxParticles;
    this.geometry = new THREE.PlaneGeometry(0.2, 0.2);
    this.instancePositions = new Float32Array(maxParticles * 3);
    this.instanceVelocities = new Float32Array(maxParticles * 3);
    this.instanceColors = new Float32Array(maxParticles * 3);
    this.instanceSizes = new Float32Array(maxParticles);
    this.instanceLives = new Float32Array(maxParticles);
    this.instanceBirthTimes = new Float32Array(maxParticles);
    this.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(this.instancePositions, 3));
    this.geometry.setAttribute('instanceVelocity', new THREE.InstancedBufferAttribute(this.instanceVelocities, 3));
    this.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(this.instanceColors, 3));
    this.geometry.setAttribute('instanceSize', new THREE.InstancedBufferAttribute(this.instanceSizes, 1));
    this.geometry.setAttribute('instanceLife', new THREE.InstancedBufferAttribute(this.instanceLives, 1));
    this.geometry.setAttribute('instanceBirthTime', new THREE.InstancedBufferAttribute(this.instanceBirthTimes, 1));
    this.material = new THREE.ShaderMaterial({
      vertexShader: ParticleInstancedShader.vertexShader,
      fragmentShader: ParticleInstancedShader.fragmentShader,
      uniforms: { uTime: { value: 0 }, uSizeMultiplier: { value: 1.0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, maxParticles);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.instancedMesh);
  }

  public setSizeMultiplier(size: number): void {
    this.material.uniforms.uSizeMultiplier.value = Number.isFinite(size) ? Math.max(0, size) : 1;
  }

  public setActiveColor(colorHex: number): void {
    const color = new THREE.Color(colorHex);
    for (let i = 0; i < this.activeCount; i++) {
      this.instanceColors[i * 3] = color.r;
      this.instanceColors[i * 3 + 1] = color.g;
      this.instanceColors[i * 3 + 2] = color.b;
    }
    (this.geometry.getAttribute('instanceColor') as THREE.BufferAttribute).needsUpdate = true;
  }

  public scaleActiveVelocities(scale: number): void {
    if (!Number.isFinite(scale)) return;
    for (let i = 0; i < this.activeCount * 3; i++) this.instanceVelocities[i] *= scale;
    (this.geometry.getAttribute('instanceVelocity') as THREE.BufferAttribute).needsUpdate = true;
  }

  public addBurst(position: THREE.Vector3, count: number, colorHex: number = 0xffaa00, speed: number = 5.0, time: number = 0, random: VisualParticleRandomSource = Math.random) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.maxCount) break;
      const idx = this.activeCount;
      this.instancePositions[idx * 3] = position.x + (random() - 0.5) * 0.5;
      this.instancePositions[idx * 3 + 1] = position.y + (random() - 0.5) * 0.5;
      this.instancePositions[idx * 3 + 2] = position.z + (random() - 0.5) * 0.5;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      const spd = (0.5 + random() * 0.8) * speed;
      this.instanceVelocities[idx * 3] = Math.sin(phi) * Math.cos(theta) * spd;
      this.instanceVelocities[idx * 3 + 1] = Math.cos(phi) * spd + 1.0;
      this.instanceVelocities[idx * 3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;
      this.instanceColors[idx * 3] = col.r;
      this.instanceColors[idx * 3 + 1] = col.g;
      this.instanceColors[idx * 3 + 2] = col.b;
      this.instanceSizes[idx] = 0.8 + random() * 0.6;
      this.instanceLives[idx] = 0.0;
      this.instanceBirthTimes[idx] = time;
      this.activeCount++;
    }
    this.updateAttributes();
  }

  public update(dt: number, time: number) {
    this.material.uniforms.uTime.value = time;
    for (let i = 0; i < this.activeCount; i++) {
      this.instanceLives[i] += dt * 1.5;
      if (this.instanceLives[i] >= 1.0) {
        const last = this.activeCount - 1;
        this.swapParticles(i, last);
        this.activeCount--;
        i--;
      }
    }
    this.updateAttributes();
  }

  private swapParticles(a: number, b: number) {
    for (let k = 0; k < 3; k++) {
      this.instancePositions[a * 3 + k] = this.instancePositions[b * 3 + k];
      this.instanceVelocities[a * 3 + k] = this.instanceVelocities[b * 3 + k];
      this.instanceColors[a * 3 + k] = this.instanceColors[b * 3 + k];
    }
    this.instanceSizes[a] = this.instanceSizes[b];
    this.instanceLives[a] = this.instanceLives[b];
    this.instanceBirthTimes[a] = this.instanceBirthTimes[b];
  }

  private updateAttributes() {
    (this.geometry.getAttribute('instancePosition') as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute('instanceVelocity') as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute('instanceColor') as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute('instanceSize') as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute('instanceLife') as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute('instanceBirthTime') as THREE.BufferAttribute).needsUpdate = true;
    this.instancedMesh.count = this.activeCount;
  }

  public getActiveCount(): number { return this.activeCount; }
  public clear() { this.activeCount = 0; this.instancedMesh.count = 0; }
  public destroy(scene: THREE.Scene) { scene.remove(this.instancedMesh); this.geometry.dispose(); this.material.dispose(); }
}
