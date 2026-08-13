/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceHit } from '../types';
import { VisualRibbon } from '../vfx/VisualRibbon';

export class FreehandCaster {
  private isDrawing: boolean = false;
  private rawPoints: THREE.Vector3[] = [];
  private previewRibbon: VisualRibbon | null = null;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public startDrawing(surfaceHit: SurfaceHit) {
    this.isDrawing = true;
    this.rawPoints = [surfaceHit.point.clone()];

    if (this.previewRibbon) {
      this.previewRibbon.destroy(this.scene);
      this.previewRibbon = null;
    }

    this.previewRibbon = new VisualRibbon(
      this.scene,
      this.rawPoints,
      new THREE.Color(0x00ffff),
      new THREE.Color(0x0044ff),
      0.4
    );
  }

  public addPoint(surfaceHit: SurfaceHit) {
    if (!this.isDrawing) return;

    const last = this.rawPoints[this.rawPoints.length - 1];
    if (!last || last.distanceTo(surfaceHit.point) > 0.4) {
      this.rawPoints.push(surfaceHit.point.clone());

      if (this.previewRibbon && this.rawPoints.length >= 2) {
        this.previewRibbon.updatePoints(this.getResampledPath());
      }
    }
  }

  public finishDrawing(): THREE.Vector3[] | null {
    if (!this.isDrawing) return null;
    this.isDrawing = false;

    const resampled = this.getResampledPath();

    if (this.previewRibbon) {
      this.previewRibbon.destroy(this.scene);
      this.previewRibbon = null;
    }

    if (resampled.length < 2) return null;
    return resampled;
  }

  public getResampledPath(sampleCount: number = 50): THREE.Vector3[] {
    if (this.rawPoints.length < 2) return [...this.rawPoints];

    const curve = new THREE.CatmullRomCurve3(this.rawPoints, false, 'catmullrom', 0.5);
    return curve.getSpacedPoints(sampleCount);
  }

  public update(time: number) {
    if (this.previewRibbon) this.previewRibbon.update(time);
  }

  public getIsDrawing(): boolean { return this.isDrawing; }

  public clear() {
    this.isDrawing = false;
    this.rawPoints = [];
    if (this.previewRibbon) {
      this.previewRibbon.destroy(this.scene);
      this.previewRibbon = null;
    }
  }
}
