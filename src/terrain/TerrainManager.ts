/**
 * Facade coordinating persistent mutations, visual aftermath residues, and demo terrain deformation.
 *
 * Responsibilities are strictly delegated:
 * - MutationManager: authoritative world-state, budgets, transactions, save/load, replay
 * - ResidueManager: visual representation, decals, crystals, shaders, GPU disposal
 * - TerrainDemo: demo terrain mesh and vertex deformation
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceMutationType, TerrainMutationRegion } from '../types';
import { MutationManager } from '../mutation/MutationManager';
import { ResidueManager } from './ResidueManager';
import { TerrainDemo } from './TerrainDemo';
import type { MutationBudgets, MutationRecord } from '../mutation/MutationTypes';

export class TerrainManager {
  public readonly mutationManager: MutationManager;
  public readonly residueManager: ResidueManager;
  public readonly terrainDemo: TerrainDemo;

  public mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, width = 60, height = 60, segments = 100, budgets?: Partial<MutationBudgets>) {
    this.terrainDemo = new TerrainDemo(scene, width, height, segments);
    this.mesh = this.terrainDemo.getMesh();

    this.residueManager = new ResidueManager(scene);
    this.mutationManager = new MutationManager(budgets);

    // Sync mutation state changes to visual residues and terrain deformation
    this.mutationManager.subscribe('onMutationAdded', (mut: MutationRecord) => {
      this.residueManager.createVisual(mut);
    });

    this.mutationManager.subscribe('onMutationRemoved', (mut: MutationRecord) => {
      this.residueManager.removeVisual(mut.id);
    });

    this.mutationManager.subscribe('onReset', () => {
      this.residueManager.clearAll();
    });

    this.mutationManager.subscribe('onTerrainDelta', (delta, isRevert) => {
      this.terrainDemo.applyHeightDelta(delta, isRevert);
    });
  }

  public getMesh(): THREE.Mesh {
    return this.terrainDemo.getMesh();
  }

  public setShowGrid(show: boolean): void {
    this.terrainDemo.setShowGrid(show);
  }

  /**
   * Backward-compatible getter providing a live view of active mutation regions.
   */
  public get activeRegions(): TerrainMutationRegion[] {
    const mutations = this.mutationManager.getMutations();
    return mutations.map((m) => ({
      id: m.id,
      type: m.type,
      center: new THREE.Vector3(...m.center),
      radius: m.radius,
      intensity: m.intensity,
      shape: m.shape,
      createdAt: m.createdAt,
      duration: m.duration,
      ownerId: m.ownerId,
      meshes: this.residueManager.getVisualMeshes(m.id),
    }));
  }

  /**
   * Applies vertex sculpting on the demo terrain and tracks it in mutation transactions.
   */
  public sculptTerrain(center: THREE.Vector3, radius: number, strength: number): void {
    const delta = this.terrainDemo.sculptTerrain(center, radius, strength);
    this.mutationManager.recordTerrainDelta(delta);
  }

  /**
   * Authoritative surface mutation application.
   */
  public applyMutation(
    type: SurfaceMutationType,
    center: THREE.Vector3,
    radius: number,
    intensity = 1.0,
    time = 0,
    duration = 10.0,
    ownerId?: string,
    surfaceId = 'terrain_main',
    normal?: THREE.Vector3
  ): MutationRecord {
    // Slight terrain depression for lava and scorch on the demo terrain mesh
    let delta = undefined;
    if (surfaceId === 'terrain_main' || surfaceId === 'TerrainMesh') {
      if (type === 'lava') {
        delta = this.terrainDemo.sculptTerrain(center, radius * 0.8, -0.4 * intensity);
      } else if (type === 'scorch') {
        delta = this.terrainDemo.sculptTerrain(center, radius * 0.6, -0.2 * intensity);
      }
    }

    const norm = normal ? normal.clone().normalize() : new THREE.Vector3(0, 1, 0);

    return this.mutationManager.applyMutation({
      type,
      surfaceId,
      center: [center.x, center.y, center.z],
      normal: [norm.x, norm.y, norm.z],
      radius,
      intensity,
      createdAt: time,
      duration,
      ownerId,
      terrainDelta: delta,
    });
  }

  public update(time: number): void {
    this.terrainDemo.updateTime(time);
    this.mutationManager.update(time);
    this.residueManager.update(time, this.mutationManager.getMutations());
  }

  public undo(): boolean {
    return this.mutationManager.undo();
  }

  public redo(): boolean {
    return this.mutationManager.redo();
  }

  public resetTerrain(): void {
    this.terrainDemo.resetHeights();
    this.mutationManager.reset();
    this.residueManager.clearAll();
  }

  public getDecalCount(): number {
    return this.residueManager.getDecalCount();
  }

  public clearByOwner(ownerId: string): void {
    this.mutationManager.clearByOwner(ownerId);
  }

  public destroy(): void {
    this.mutationManager.reset();
    this.residueManager.destroy();
    this.terrainDemo.destroy();
  }
}
