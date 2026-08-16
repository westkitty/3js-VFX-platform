import * as THREE from 'three';
import { SurfaceHit, TargetingShape } from '../types';
import { SurfaceQuery } from '../core/SurfaceQuery';
import { buildDirectionalSurfaceFrameTuple, mapLocalSurfacePoint } from '../core/SurfaceFrameModel';
import {
  advanceIndicatorPhase,
  buildIndicatorLocalOutline,
  createIndicatorPhaseState,
  type IndicatorPhaseState,
} from './IndicatorModel';

export interface SurfaceIndicatorConfig {
  shape: Exclude<TargetingShape, 'path'>;
  direction: THREE.Vector3;
  range: number;
  radius: number;
  angle: number;
  width: number;
  warningDuration: number;
  commitDuration: number;
}

class SurfaceIndicator {
  private readonly line: THREE.LineLoop;
  private readonly material: THREE.LineBasicMaterial;
  private phaseState: IndicatorPhaseState = createIndicatorPhaseState();

  constructor(private readonly scene: THREE.Scene, query: SurfaceQuery, hit: SurfaceHit, config: SurfaceIndicatorConfig) {
    const points = buildProjectedOutline(query, hit, config);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.material = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9, depthWrite: false });
    this.line = new THREE.LineLoop(geometry, this.material);
    this.line.renderOrder = 12;
    this.scene.add(this.line);
  }

  public update(dt: number, config: SurfaceIndicatorConfig): boolean {
    const next = advanceIndicatorPhase(this.phaseState, dt, config.warningDuration, config.commitDuration);
    this.phaseState = next.state;
    if (next.enteredCommit) this.material.color.set(0x22d3ee);
    this.material.opacity = next.opacity;
    return next.finished;
  }

  public destroy() {
    this.scene.remove(this.line);
    this.line.geometry.dispose();
    this.material.dispose();
  }
}

export class SurfaceIndicatorManager {
  private active: Array<{ indicator: SurfaceIndicator; config: SurfaceIndicatorConfig }> = [];
  constructor(private readonly scene: THREE.Scene, private readonly query: SurfaceQuery) {}

  public show(hit: SurfaceHit, config: SurfaceIndicatorConfig): void {
    const copy: SurfaceIndicatorConfig = { ...config, direction: config.direction.clone() };
    this.active.push({ indicator: new SurfaceIndicator(this.scene, this.query, hit, copy), config: copy });
  }

  public update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const entry = this.active[i];
      if (entry.indicator.update(dt, entry.config)) {
        entry.indicator.destroy();
        this.active.splice(i, 1);
      }
    }
  }

  public clear(): void {
    this.active.forEach(({ indicator }) => indicator.destroy());
    this.active = [];
  }

  public getActiveCount(): number { return this.active.length; }
}

function buildProjectedOutline(query: SurfaceQuery, hit: SurfaceHit, config: SurfaceIndicatorConfig): THREE.Vector3[] {
  const tangentTuple: [number, number, number] = hit.tangent
    ? [hit.tangent.x, hit.tangent.y, hit.tangent.z]
    : [1, 0, 0];
  const frame = buildDirectionalSurfaceFrameTuple(
    [hit.normal.x, hit.normal.y, hit.normal.z],
    [config.direction.x, config.direction.y, config.direction.z],
    tangentTuple,
  );
  const normal = new THREE.Vector3(...frame.normal);
  const locals = buildIndicatorLocalOutline(config);

  return locals.map((local) => {
    const mapped = mapLocalSurfacePoint(
      [hit.point.x, hit.point.y, hit.point.z],
      frame,
      local,
    );
    const candidate = new THREE.Vector3(...mapped);
    const projected = query.projectNear(candidate, normal, Math.max(2, config.radius, config.width, config.range * 0.25));
    const resolved = projected ?? hit;
    return resolved.point.clone().addScaledVector(resolved.normal, 0.035);
  });
}
