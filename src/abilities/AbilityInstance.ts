/** Browser-only lifecycle coordinator for one visual ability instance. */
import * as THREE from 'three';
import { AbilityDefinition, AbilityRequest, AbilityLifecyclePhase } from '../types';
import { TerrainManager } from '../terrain/TerrainManager';
import { PostProcessingController } from '../core/PostProcessing';
import { SeededRandom } from '../core/SeededRandom';
import { cloneAbilityDefinition, hasSameModuleShape, mutateAbilityDefinition } from './AbilityDefinitionState';
import { getAbilityTravelDistance, updateAbilityTravelPosition } from './AbilityPath';
import { AbilityVisuals } from './AbilityVisuals';
import { WorldMarkBridge } from './WorldMarkBridge';

const IMPACT_DURATION = 0.3;
export interface AbilityInstanceOptions { preview?: boolean; }
export interface AbilityPreviewState { hasPreview: boolean; time: number; duration: number; phase: AbilityLifecyclePhase; }

export class AbilityInstance {
  public id: string;
  public definition: AbilityDefinition;
  public request: AbilityRequest;
  public phase: AbilityLifecyclePhase = 'windup';
  public phaseTime = 0;
  public totalTime = 0;
  private lastGlobalTime = 0;
  private currentPosition: THREE.Vector3;
  private travelProgress = 0;
  private destroyed = false;
  private readonly preview: boolean;
  private readonly random: SeededRandom;
  private readonly vfx: AbilityVisuals;
  private readonly worldMarks: WorldMarkBridge;

  constructor(private readonly scene: THREE.Scene, private readonly terrain: TerrainManager, private readonly postFX: PostProcessingController, request: AbilityRequest, definition: AbilityDefinition, options: AbilityInstanceOptions = {}) {
    this.id = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.request = request;
    this.definition = cloneAbilityDefinition(definition);
    this.preview = options.preview ?? false;
    this.random = new SeededRandom(request.seed);
    this.currentPosition = request.origin.clone();
    this.worldMarks = new WorldMarkBridge(this.terrain);
    this.vfx = new AbilityVisuals(this.scene, this.request, this.definition, this.random, this.currentPosition);
  }

  private resetForReplay(): void {
    this.phase = 'windup'; this.phaseTime = 0; this.totalTime = 0; this.travelProgress = 0;
    this.currentPosition.copy(this.request.origin); this.destroyed = false;
    this.random.reset(this.request.seed); this.vfx.reset(this.currentPosition);
  }

  public update(dt: number, _globalTime: number): boolean {
    if (this.destroyed) return true;
    this.lastGlobalTime = _globalTime;
    const safeDt = Math.max(0, dt);
    this.phaseTime += safeDt; this.totalTime += safeDt; this.vfx.update(safeDt, this.totalTime);
    switch (this.phase) {
      case 'windup': if (this.phaseTime >= this.definition.timing.windup) this.enterPhase('travel'); break;
      case 'travel': this.updateTravel(safeDt); break;
      case 'impact': this.vfx.setImpactProgress(Math.min(this.phaseTime / IMPACT_DURATION, 1)); if (this.phaseTime >= IMPACT_DURATION) this.enterPhase('hold'); break;
      case 'hold': if (this.phaseTime >= this.definition.timing.hold) this.enterPhase('fade'); break;
      case 'fade': {
        const progress = 1 - this.phaseTime / Math.max(this.definition.timing.fade, 0.001);
        this.vfx.setFadeProgress(progress);
        if (this.phaseTime >= this.definition.timing.fade) { this.phase = 'done'; this.destroy(); return true; }
        break;
      }
      case 'done': return true;
    }
    return false;
  }

  private enterPhase(phase: AbilityLifecyclePhase): void { this.phase = phase; this.phaseTime = 0; }
  private updateTravel(dt: number): void {
    if (this.definition.timing.travelSpeed <= 0) { this.currentPosition.copy(this.request.target); this.vfx.updatePosition(this.currentPosition); this.enterImpact(); return; }
    const totalDistance = Math.max(getAbilityTravelDistance(this.request), 0.001);
    this.travelProgress += (this.definition.timing.travelSpeed * dt) / totalDistance;
    if (this.travelProgress >= 1) { this.currentPosition.copy(this.request.target); this.vfx.updatePosition(this.currentPosition); this.enterImpact(); return; }
    updateAbilityTravelPosition(this.request, this.travelProgress, this.currentPosition);
    this.vfx.updatePosition(this.currentPosition);
  }

  private enterImpact(): void {
    if (!this.preview) {
      if (this.definition.feedback.cameraShake > 0) this.postFX.triggerShake(this.definition.feedback.cameraShake);
      if (this.definition.feedback.flashIntensity > 0) this.postFX.triggerFlash('#ffffff', 150);
    }
    this.vfx.emitImpact(this.currentPosition, this.totalTime);
    if (!this.preview) this.worldMarks.apply(this.definition, this.currentPosition, this.lastGlobalTime, this.id, this.request.surface?.surfaceId, this.request.surface?.normal);
    this.enterPhase('impact');
  }

  public applyDefinition(updated: AbilityDefinition): void {
    if (!hasSameModuleShape(this.definition, updated)) { this.definition = cloneAbilityDefinition(updated); this.resetForReplay(); return; }
    mutateAbilityDefinition(this.definition, updated); this.vfx.applyDefinition();
  }

  public seek(targetSeconds: number, fixedStep = 1 / 60): number {
    if (!this.preview) return this.totalTime;
    const clamped = Math.min(Math.max(targetSeconds, 0), this.getDuration());
    this.resetForReplay(); let remaining = clamped; const step = Math.max(0.001, fixedStep);
    while (remaining > 1e-8 && this.phase !== 'done') { const frame = Math.min(step, remaining); this.update(frame, this.totalTime + frame); remaining -= frame; }
    return this.totalTime;
  }

  public restart(): void { if (this.preview) this.resetForReplay(); }
  public getDuration(): number {
    const travel = this.definition.timing.travelSpeed > 0 ? getAbilityTravelDistance(this.request) / this.definition.timing.travelSpeed : 0;
    return this.definition.timing.windup + travel + IMPACT_DURATION + this.definition.timing.hold + this.definition.timing.fade;
  }
  public getParticleCount(): number { return this.vfx.getParticleCount(); }
  public isPreviewInstance(): boolean { return this.preview; }
  public destroy(): void { if (this.destroyed) return; this.destroyed = true; this.vfx.destroy(); }
  public cancel(): void {
    if (!this.preview) this.worldMarks.clear(this.id);
    this.destroy();
  }
}
