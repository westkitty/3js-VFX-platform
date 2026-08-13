import * as THREE from 'three';
import { AbilityModuleConfig, AbilityRequest } from '../../types';

export type RandomSource = () => number;

export interface RuntimeVfxModule {
  readonly type: AbilityModuleConfig['type'];
  applyParams(params: AbilityModuleConfig['params']): void;
  update(dt: number, time: number): void;
  setPosition?(position: THREE.Vector3): void;
  setProgress?(progress: number): void;
  triggerImpact?(position: THREE.Vector3, time: number): void;
  getParticleCount?(): number;
  destroy(): void;
}

export interface VfxModuleFactoryContext {
  scene: THREE.Scene;
  request: AbilityRequest;
  currentPosition: THREE.Vector3;
  maxParticles: number;
  random: RandomSource;
}

export type VfxModuleFactory = (
  config: AbilityModuleConfig,
  context: VfxModuleFactoryContext
) => RuntimeVfxModule;

export function numberParam(
  params: AbilityModuleConfig['params'],
  key: string,
  fallback: number
): number {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function colorParam(
  params: AbilityModuleConfig['params'],
  key: string,
  fallback: THREE.ColorRepresentation
): THREE.Color {
  const value = params[key];
  if (typeof value === 'number' || typeof value === 'string') {
    try {
      return new THREE.Color(value);
    } catch {
      return new THREE.Color(fallback);
    }
  }
  return new THREE.Color(fallback);
}
