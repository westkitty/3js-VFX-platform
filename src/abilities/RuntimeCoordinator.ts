/** Internal browser-VFX runtime coordinator. */
import * as THREE from 'three';
import { AbilityDefinition, AbilityRequest } from '../types';
import { TerrainManager } from '../terrain/TerrainManager';
import { PostProcessingController } from '../core/PostProcessing';
import { AbilityInstance, AbilityPreviewState } from './AbilityInstance';
import { RuntimeSet } from './RuntimeSet';
import { AbilityPreviewController } from './AbilityPreviewController';

export class RuntimeCoordinator {
  private readonly collection = new RuntimeSet();
  private readonly preview: AbilityPreviewController;
  private readonly scene: THREE.Scene;
  private readonly terrain: TerrainManager;
  private readonly postFX: PostProcessingController;

  constructor(scene: THREE.Scene, terrain: TerrainManager, postFX: PostProcessingController) {
    this.preview = new AbilityPreviewController(scene, terrain, postFX, this.collection);
    this.scene = scene;
    this.terrain = terrain;
    this.postFX = postFX;
  }

  public spawn(request: AbilityRequest, definition: AbilityDefinition): AbilityInstance {
    const instance = new AbilityInstance(this.scene, this.terrain, this.postFX, request, definition);
    this.collection.add(instance);
    return instance;
  }

  public spawnPreview(request: AbilityRequest, definition: AbilityDefinition): AbilityInstance { return this.preview.replace(request, definition); }
  public update(dt: number, time: number): void { this.collection.update(dt, time, this.preview.getInstance()); }
  public updatePreviewDefinition(updated: AbilityDefinition): void { this.preview.applyDefinition(updated); }
  public seekPreview(seconds: number): AbilityPreviewState { return this.preview.seek(seconds); }
  public restartPreview(): AbilityPreviewState { return this.preview.restart(); }
  public getPreviewState(): AbilityPreviewState { return this.preview.getState(); }
  public getActiveCount(): number { return this.collection.getActiveCount(); }
  public getTotalParticleCount(): number { return this.collection.getTotalParticleCount(); }
  public clearAll(): void { this.collection.clear(); this.preview.clear(); }
}
