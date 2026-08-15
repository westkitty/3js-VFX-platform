/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface SurfaceHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  tangent: THREE.Vector3;
  bitangent: THREE.Vector3;
  uv: THREE.Vector2 | null;
  object: THREE.Object3D | null;
  faceIndex?: number;
  surfaceId?: string;
}

export type AbilityLifecyclePhase = 'windup' | 'travel' | 'impact' | 'hold' | 'fade' | 'done';
export type TargetingShape = 'line' | 'zone' | 'path' | 'cone' | 'ring' | 'rectangle';

export interface CastRequest {
  abilityId: string;
  origin: THREE.Vector3;
  target: THREE.Vector3;
  direction: THREE.Vector3;
  distance: number;
  surface: SurfaceHit | null;
  path?: THREE.Vector3[];
  seed: number;
  customParams?: Record<string, number | string | boolean>;
}

export type AbilityRequest = CastRequest;

export interface AbilityTiming {
  windup: number;
  travelSpeed: number;
  hold: number;
  fade: number;
  cooldown: number;
}

export interface AbilityModuleConfig {
  type: 'ribbon' | 'beam' | 'shockwave' | 'particles' | 'orb' | 'decal' | 'telegraph' | 'sound' | 'light';
  preset?: string;
  params: Record<string, number | string | boolean>;
}

export interface AbilityDefinition {
  id: string;
  name: string;
  school: 'pyromancy' | 'cryomancy' | 'stormcraft' | 'void' | 'earth' | 'starsilk';
  description: string;
  iconName: string;
  targeting: {
    shape: TargetingShape;
    range: number;
    minRange?: number;
    radius?: number;
    angle?: number;
    surfacePolicy: 'project' | 'follow' | 'plane';
  };
  timing: AbilityTiming;
  modules: AbilityModuleConfig[];
  feedback: {
    cameraShake: number;
    flashIntensity: number;
    lightColor: string;
    lightRadius: number;
  };
  budget: {
    maxParticles: number;
    dynamicLights: number;
  };
}

export type MacroNodeType = 'emit' | 'travel' | 'impact' | 'field' | 'residue' | 'parallel';
export interface MacroNode {
  id: string;
  type: MacroNodeType;
  label: string;
  duration: number;
  delay?: number;
  moduleType: string;
  params: Record<string, number | string | boolean>;
  children?: MacroNode[];
}
export interface MacroDefinition {
  id: string;
  name: string;
  description: string;
  school: string;
  sequence: MacroNode[];
}

export type SurfaceMutationType = 'scorch' | 'frost' | 'lava' | 'crystal' | 'void_scar' | 'golden_rune';
export interface TerrainMutationRegion {
  id: string;
  type: SurfaceMutationType;
  center: THREE.Vector3;
  radius: number;
  intensity: number;
  shape: 'circle' | 'ribbon' | 'path';
  points?: THREE.Vector3[];
  createdAt: number;
  duration: number;
  ownerId?: string;
  meshes: THREE.Mesh[];
}

export type TelegraphState = 'reveal' | 'warning' | 'commit' | 'impact' | 'clear';
export interface TelegraphConfig {
  id: string;
  shape: TargetingShape;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  range: number;
  radius?: number;
  angle?: number;
  width?: number;
  warningDuration: number;
  commitDuration: number;
  state: TelegraphState;
  startTime: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  p50FrameMs: number;
  p95FrameMs: number;
  p99FrameMs: number;
  drawCalls: number;
  triangles: number;
  particlesCount: number;
  activeLights: number;
  decalsCount: number;
  activeSpells: number;
  memoryGeometries: number;
  memoryTextures: number;
}

export type WorkbenchMode = 'vfx_lab' | 'ability_factory' | 'macro_lab' | 'terraformer' | 'telegraphs' | 'freehand_drawing' | 'perf_lab';
