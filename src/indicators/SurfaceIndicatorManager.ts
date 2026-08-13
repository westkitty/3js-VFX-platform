import * as THREE from 'three';
import { SurfaceHit, TargetingShape } from '../types';
import { SurfaceQuery } from '../core/SurfaceQuery';

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

type IndicatorPhase = 'warning' | 'commit' | 'clear';

class SurfaceIndicator {
  private readonly line: THREE.LineLoop;
  private readonly material: THREE.LineBasicMaterial;
  private elapsed = 0;
  private phase: IndicatorPhase = 'warning';
  private clearElapsed = 0;

  constructor(private readonly scene: THREE.Scene, query: SurfaceQuery, hit: SurfaceHit, config: SurfaceIndicatorConfig) {
    const points = buildProjectedOutline(query, hit, config);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.material = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9, depthWrite: false });
    this.line = new THREE.LineLoop(geometry, this.material);
    this.line.renderOrder = 12;
    this.scene.add(this.line);
  }

  public update(dt: number, config: SurfaceIndicatorConfig): boolean {
    const safeDt = Math.max(0, dt);
    this.elapsed += safeDt;
    if (this.phase === 'warning' && this.elapsed >= Math.max(0, config.warningDuration)) {
      this.phase = 'commit';
      this.elapsed = 0;
      this.material.color.set(0x22d3ee);
      this.material.opacity = 1;
    } else if (this.phase === 'commit' && this.elapsed >= Math.max(0, config.commitDuration)) {
      this.phase = 'clear';
      this.clearElapsed = 0;
    } else if (this.phase === 'clear') {
      this.clearElapsed += safeDt;
      this.material.opacity = Math.max(0, 1 - this.clearElapsed / 0.2);
      if (this.clearElapsed >= 0.2) return true;
    }
    return false;
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

  public clear(): void { this.active.forEach(({ indicator }) => indicator.destroy()); this.active = []; }
  public getActiveCount(): number { return this.active.length; }
}

function buildProjectedOutline(query: SurfaceQuery, hit: SurfaceHit, config: SurfaceIndicatorConfig): THREE.Vector3[] {
  const normal = hit.normal.clone().normalize();
  const projectedDirection = config.direction.clone().addScaledVector(normal, -config.direction.dot(normal));
  const forward = projectedDirection.lengthSq() > 1e-10 ? projectedDirection.normalize() : hit.tangent.clone().normalize();
  const right = new THREE.Vector3().crossVectors(forward, normal).normalize();
  const locals = buildLocalOutline(config);
  return locals.map(([x, y]) => {
    const candidate = hit.point.clone().addScaledVector(right, x).addScaledVector(forward, y);
    const projected = query.projectNear(candidate, normal, Math.max(2, config.radius, config.width, config.range * 0.25));
    const resolved = projected ?? hit;
    return resolved.point.clone().addScaledVector(resolved.normal, 0.035);
  });
}

function buildLocalOutline(config: SurfaceIndicatorConfig): Array<[number, number]> {
  const range = Math.max(0.1, config.range);
  const radius = Math.max(0.1, config.radius);
  const width = Math.max(0.05, config.width);
  if (config.shape === 'zone' || config.shape === 'ring') {
    const points: Array<[number, number]> = [];
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; points.push([Math.cos(a) * radius, Math.sin(a) * radius]); }
    return points;
  }
  if (config.shape === 'cone') {
    const half = Math.max(0.05, Math.min(Math.PI * 0.95, config.angle)) * 0.5;
    const points: Array<[number, number]> = [[0, 0]];
    for (let i = 0; i <= 32; i++) { const a = -half + (i / 32) * half * 2; points.push([Math.sin(a) * range, Math.cos(a) * range]); }
    return points;
  }
  const halfWidth = width * 0.5;
  return [[-halfWidth, 0], [-halfWidth, range], [halfWidth, range], [halfWidth, 0]];
}
