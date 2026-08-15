/**
 * Visual aftermath and persistent mark manager.
 *
 * Owns ONLY visual representations (decals, crystal meshes, GPU materials, shaders).
 * Does NOT own mutation authority or transaction history.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceMutationType } from '../types';
import type { MutationRecord } from '../mutation/MutationTypes';
import { SurfaceDecalShader } from '../shaders';
import { SeededRandom } from '../core/SeededRandom';
import { buildSurfaceFrameTuple } from '../core/SurfaceFrameModel';

const UP = new THREE.Vector3(0, 1, 0);

export class ResidueManager {
  private readonly scene: THREE.Scene;
  public readonly decalsGroup = new THREE.Group();
  public readonly crystalsGroup = new THREE.Group();

  private readonly visualMap = new Map<string, THREE.Mesh[]>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.decalsGroup.name = 'ResidueDecalsGroup';
    this.crystalsGroup.name = 'ResidueCrystalsGroup';

    this.scene.add(this.decalsGroup);
    this.scene.add(this.crystalsGroup);
  }

  public createVisual(mutation: MutationRecord): THREE.Mesh[] {
    // Clean up any existing visual for this ID first
    this.removeVisual(mutation.id);

    const meshes: THREE.Mesh[] = [];

    // 1. Create surface decal mesh conforming to the local surface normal
    const decalMesh = this.createDecalMesh(mutation);
    this.decalsGroup.add(decalMesh);
    meshes.push(decalMesh);

    // 2. If type is crystal, spawn 3D crystal clusters oriented along surface normal
    if (mutation.type === 'crystal') {
      const crystals = this.spawnCrystalCluster(mutation);
      for (const c of crystals) {
        this.crystalsGroup.add(c);
        meshes.push(c);
      }
    }

    this.visualMap.set(mutation.id, meshes);
    return meshes;
  }

  public removeVisual(mutationId: string): void {
    const meshes = this.visualMap.get(mutationId);
    if (!meshes) return;

    for (const mesh of meshes) {
      if (mesh.parent) mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) mat.dispose();
    }

    this.visualMap.delete(mutationId);
  }

  public update(time: number, mutations: Iterable<MutationRecord>): void {
    // Update global shader time uniforms
    for (const child of this.decalsGroup.children) {
      if (child instanceof THREE.Mesh && child.material && (child.material as THREE.ShaderMaterial).uniforms?.uTime) {
        (child.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      }
    }

    // Update fade multiplier for each active mutation
    for (const mutation of mutations) {
      const meshes = this.visualMap.get(mutation.id);
      if (!meshes) continue;

      const timeLeft = mutation.createdAt + mutation.duration - time;
      const fadeMultiplier = Math.max(0.0, Math.min(1.0, timeLeft / 0.5));
      const currentFade = mutation.intensity * fadeMultiplier;

      for (const mesh of meshes) {
        if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms?.uFade) {
          (mesh.material as THREE.ShaderMaterial).uniforms.uFade.value = currentFade;
        }
      }
    }
  }

  public getDecalCount(): number {
    return this.decalsGroup.children.length;
  }

  public getCrystalCount(): number {
    return this.crystalsGroup.children.length;
  }

  public getVisualMeshes(mutationId: string): THREE.Mesh[] {
    return this.visualMap.get(mutationId) ?? [];
  }

  public getTotalVisualCount(): number {
    let count = 0;
    for (const list of this.visualMap.values()) count += list.length;
    return count;
  }

  public clearAll(): void {
    for (const id of Array.from(this.visualMap.keys())) {
      this.removeVisual(id);
    }
    this.visualMap.clear();

    this.disposeGroupChildren(this.decalsGroup);
    this.disposeGroupChildren(this.crystalsGroup);
  }

  public destroy(): void {
    this.clearAll();
    this.scene.remove(this.decalsGroup);
    this.scene.remove(this.crystalsGroup);
  }

  private createDecalMesh(mutation: MutationRecord): THREE.Mesh {
    const typeEnum =
      mutation.type === 'scorch'
        ? 0
        : mutation.type === 'frost'
        ? 1
        : mutation.type === 'lava'
        ? 2
        : mutation.type === 'golden_rune'
        ? 3
        : 4; // void_scar / other

    let colorHex = 0xff3300;
    if (mutation.type === 'frost') colorHex = 0x88e0ff;
    if (mutation.type === 'scorch') colorHex = 0x221111;
    if (mutation.type === 'void_scar') colorHex = 0xaa22ff;
    if (mutation.type === 'golden_rune') colorHex = 0xffcc33;
    if (mutation.type === 'crystal') colorHex = 0x33e0ff;

    const planeGeo = new THREE.PlaneGeometry(mutation.radius * 2, mutation.radius * 2);
    planeGeo.rotateX(-Math.PI / 2); // default lies horizontal with normal (0,1,0)

    const decalMat = new THREE.ShaderMaterial({
      vertexShader: SurfaceDecalShader.vertexShader,
      fragmentShader: SurfaceDecalShader.fragmentShader,
      uniforms: {
        uMarkVariant: { value: typeEnum },
        uColor: { value: new THREE.Color(colorHex) },
        uFade: { value: mutation.intensity },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });

    const decalMesh = new THREE.Mesh(planeGeo, decalMat);
    const center = new THREE.Vector3(...mutation.center);
    const normal = new THREE.Vector3(...mutation.normal).normalize();

    // Position slightly along normal to avoid z-fighting on any surface angle
    decalMesh.position.copy(center).addScaledVector(normal, 0.03);

    // Rotate plane to align with surface normal
    if (normal.distanceTo(UP) > 1e-4) {
      decalMesh.quaternion.setFromUnitVectors(UP, normal);
    }

    return decalMesh;
  }

  private spawnCrystalCluster(mutation: MutationRecord): THREE.Mesh[] {
    const rng = new SeededRandom(mutation.seed);
    const count = Math.floor(5 + rng.range(0, 8));
    const crystalGeo = new THREE.ConeGeometry(0.3, 1.8, 5);

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x33e0ff,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0088cc,
      emissiveIntensity: 0.6,
    });

    const center = new THREE.Vector3(...mutation.center);
    const normal = new THREE.Vector3(...mutation.normal).normalize();
    const frame = buildSurfaceFrameTuple([normal.x, normal.y, normal.z]);
    const tangent = new THREE.Vector3(...frame.tangent);
    const bitangent = new THREE.Vector3(...frame.bitangent);

    // Base quaternion aligning cone axis (0,1,0) to surface normal
    const baseQuat = new THREE.Quaternion();
    if (normal.distanceTo(UP) > 1e-4) {
      baseQuat.setFromUnitVectors(UP, normal);
    }

    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < count; i++) {
      const angle = rng.range(0, Math.PI * 2);
      const r = rng.range(0, mutation.radius * 0.7);
      const u = Math.cos(angle) * r;
      const v = Math.sin(angle) * r;

      const crystalPos = center.clone().addScaledVector(tangent, u).addScaledVector(bitangent, v);

      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.copy(crystalPos);

      crystal.scale.set(
        0.5 + rng.range(0, 0.8),
        0.8 + rng.range(0, 1.2),
        0.5 + rng.range(0, 0.8)
      );

      // Local perturbation
      const tiltX = rng.range(-0.25, 0.25);
      const tiltZ = rng.range(-0.25, 0.25);
      const spin = rng.range(0, Math.PI * 2);

      const localQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, spin, tiltZ));
      crystal.quaternion.copy(baseQuat).multiply(localQuat);

      crystal.castShadow = true;
      meshes.push(crystal);
    }
    return meshes;
  }

  private disposeGroupChildren(group: THREE.Group): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    for (const child of group.children) {
      child.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
        for (const mat of meshMaterials) materials.add(mat);
      });
    }

    group.clear();
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  }
}
