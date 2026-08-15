import * as THREE from 'three';
import { AbilityDefinition, AbilityRequest } from '../types';
import { TerrainManager } from '../terrain/TerrainManager';
import { PostProcessingController } from '../core/PostProcessing';
import { AbilityInstance, AbilityPreviewState } from './AbilityInstance';
import { RuntimeSet } from './RuntimeSet';

export class AbilityPreviewController {
  private instance: AbilityInstance | null = null;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly terrain: TerrainManager,
    private readonly postFX: PostProcessingController,
    private readonly collection: RuntimeSet
  ) {}

  public replace(request: AbilityRequest, definition: AbilityDefinition): AbilityInstance {
    if (this.instance) {
      this.instance.cancel();
      this.collection.remove(this.instance);
    }
    this.instance = new AbilityInstance(this.scene, this.terrain, this.postFX, request, definition, { preview: true });
    this.collection.add(this.instance);
    return this.instance;
  }

  public getInstance(): AbilityInstance | null { return this.instance; }
  public applyDefinition(updated: AbilityDefinition): void {
    if (!this.instance || this.instance.definition.id !== updated.id) return;
    this.instance.applyDefinition(updated);
  }
  public seek(seconds: number): AbilityPreviewState { this.instance?.seek(seconds); return this.getState(); }
  public restart(): AbilityPreviewState { this.instance?.restart(); return this.getState(); }
  public getState(): AbilityPreviewState {
    if (!this.instance) return { hasPreview: false, time: 0, duration: 0, phase: 'done' };
    return { hasPreview: true, time: this.instance.totalTime, duration: this.instance.getDuration(), phase: this.instance.phase };
  }
  public clear(): void {
    if (this.instance) this.instance.cancel();
    this.instance = null;
  }
}
