/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TerrainMutationRegion, SurfaceMutationType } from '../types';
import { TerrainShader, SurfaceDecalShader } from '../shaders';

export class TerrainManager {
  public mesh: THREE.Mesh;
  private scene: THREE.Scene;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private originalPositions: Float32Array;
  private currentPositions: Float32Array;

  // Active decal decals & crystal growth objects
  private decalsGroup: THREE.Group = new THREE.Group();
  private crystalsGroup: THREE.Group = new THREE.Group();

  private activeRegions: TerrainMutationRegion[] = [];
  private undoStack: Array<{ positions: Float32Array; regions: TerrainMutationRegion[] }> = [];

  constructor(scene: THREE.Scene, width: number = 60, height: number = 60, segments: number = 100) {
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

    scene.add(this.mesh);
    scene.add(this.decalsGroup);
    scene.add(this.crystalsGroup);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setShowGrid(show: boolean) {
    this.material.uniforms.uShowGrid.value = show ? 1.0 : 0.0;
  }

  /**
   * Sculpts vertex heights at center position
   */
  public sculptTerrain(center: THREE.Vector3, radius: number, strength: number) {
    this.saveStateForUndo();

    const pos = this.geometry.attributes.position;
    const array = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const vx = array[i * 3];
      const vy = array[i * 3 + 1];
      const vz = array[i * 3 + 2];

      const dx = vx - center.x;
      const dz = vz - center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const falloff = (1.0 - dist / radius) ** 2;
        array[i * 3 + 1] += strength * falloff;
      }
    }

    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  /**
   * Applies surface mutation (scorch, frost, lava, crystal, rune)
   */
  public applyMutation(
    type: SurfaceMutationType,
    center: THREE.Vector3,
    radius: number,
    intensity: number = 1.0
  ) {
    const region: TerrainMutationRegion = {
      id: `region_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      center: center.clone(),
      radius,
      intensity,
      shape: 'circle',
      createdAt: performance.now(),
    };

    this.activeRegions.push(region);

    // Create ground decal visual mesh
    this.createDecalMesh(region);

    // If type is crystal, spawn procedural crystal clusters
    if (type === 'crystal') {
      this.spawnCrystalCluster(center, radius);
    } else if (type === 'lava') {
      // Lower ground slightly for lava fissure
      this.sculptTerrain(center, radius * 0.8, -0.4 * intensity);
    } else if (type === 'scorch') {
      // Slight blast indentation
      this.sculptTerrain(center, radius * 0.6, -0.2 * intensity);
    }
  }

  private createDecalMesh(region: TerrainMutationRegion) {
    const typeEnum = region.type === 'scorch' ? 0 : region.type === 'frost' ? 1 : region.type === 'lava' ? 2 : 3;

    const planeGeo = new THREE.PlaneGeometry(region.radius * 2, region.radius * 2);
    planeGeo.rotateX(-Math.PI / 2);

    let colorHex = 0xff3300;
    if (region.type === 'frost') colorHex = 0x88e0ff;
    if (region.type === 'scorch') colorHex = 0x221111;
    if (region.type === 'void_scar') colorHex = 0xaa22ff;
    if (region.type === 'golden_rune') colorHex = 0xffcc33;

    const decalMat = new THREE.ShaderMaterial({
      vertexShader: SurfaceDecalShader.vertexShader,
      fragmentShader: SurfaceDecalShader.fragmentShader,
      uniforms: {
        uDecalType: { value: typeEnum },
        uColor: { value: new THREE.Color(colorHex) },
        uFade: { value: region.intensity },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });

    const decalMesh = new THREE.Mesh(planeGeo, decalMat);
    decalMesh.position.copy(region.center);
    decalMesh.position.y += 0.03; // slightly offset from terrain surface to avoid z-fighting

    this.decalsGroup.add(decalMesh);
  }

  private spawnCrystalCluster(center: THREE.Vector3, radius: number) {
    const count = Math.floor(5 + Math.random() * 8);
    const crystalGeo = new THREE.ConeGeometry(0.3, 1.8, 5);

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x33e0ff,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0088cc,
      emissiveIntensity: 0.6,
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.7;
      const x = center.x + Math.cos(angle) * r;
      const z = center.z + Math.sin(angle) * r;

      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(x, center.y, z);
      crystal.scale.set(
        0.5 + Math.random() * 0.8,
        0.8 + Math.random() * 1.2,
        0.5 + Math.random() * 0.8
      );
      crystal.rotation.set(
        (Math.random() - 0.5) * 0.5,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.5
      );
      crystal.castShadow = true;

      this.crystalsGroup.add(crystal);
    }
  }

  public update(time: number) {
    this.material.uniforms.uTime.value = time;

    // Update time uniforms on decals
    this.decalsGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material.uniforms?.uTime) {
        child.material.uniforms.uTime.value = time;
      }
    });
  }

  private saveStateForUndo() {
    const pos = this.geometry.attributes.position;
    const copy = new Float32Array(pos.array.length);
    copy.set(pos.array);
    this.undoStack.push({
      positions: copy,
      regions: [...this.activeRegions],
    });
    if (this.undoStack.length > 20) this.undoStack.shift();
  }

  public undo() {
    if (this.undoStack.length === 0) return;
    const state = this.undoStack.pop()!;
    const pos = this.geometry.attributes.position;
    (pos.array as Float32Array).set(state.positions);
    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public resetTerrain() {
    this.saveStateForUndo();
    const pos = this.geometry.attributes.position;
    (pos.array as Float32Array).set(this.originalPositions);
    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();

    // Clear decals & crystals and release their GPU resources.
    this.disposeGroupChildren(this.decalsGroup);
    this.disposeGroupChildren(this.crystalsGroup);
    this.activeRegions = [];
  }

  public getDecalCount(): number {
    return this.decalsGroup.children.length;
  }

  public destroy() {
    this.disposeGroupChildren(this.decalsGroup);
    this.disposeGroupChildren(this.crystalsGroup);

    this.scene.remove(this.mesh);
    this.scene.remove(this.decalsGroup);
    this.scene.remove(this.crystalsGroup);

    this.geometry.dispose();
    this.material.dispose();
    this.activeRegions = [];
    this.undoStack = [];
  }

  private disposeGroupChildren(group: THREE.Group) {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    for (const child of group.children) {
      child.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
        meshMaterials.forEach((material) => materials.add(material));
      });
    }

    group.clear();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }
}
