/** Browser-only bridge from completed visual abilities to persistent surface marks. */
import * as THREE from 'three';
import { AbilityDefinition } from '../types';
import { TerrainManager } from '../terrain/TerrainManager';

export class WorldMarkBridge {
  constructor(private readonly terrain: TerrainManager) {}
  public apply(definition: AbilityDefinition, position: THREE.Vector3): void {
    const mark = definition.modules.find((module) => module.type === 'decal');
    if (!mark) return;
    const markType = mark.params.decalType;
    if (typeof markType !== 'string') return;
    const radius = typeof mark.params.radius === 'number' ? mark.params.radius : 4;
    this.terrain.applyMutation(markType as any, position, radius);
  }
}
