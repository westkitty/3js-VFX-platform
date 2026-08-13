/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceHit } from '../types';
import { SurfaceQuery } from '../core/SurfaceQuery';
import { VisualRibbon } from '../vfx/VisualRibbon';

export class FreehandCaster {
  private isDrawing = false;
  private rawPoints: THREE.Vector3[] = [];
  private rawNormals: THREE.Vector3[] = [];
  private previewRibbon: VisualRibbon | null = null;

  constructor(private readonly scene: THREE.Scene, private readonly surfaceQuery?: SurfaceQuery) {}

  public startDrawing(surfaceHit: SurfaceHit) {
    this.isDrawing = true;
    this.rawPoints = [surfaceHit.point.clone()];
    this.rawNormals = [surfaceHit.normal.clone()];
    this.previewRibbon?.destroy(this.scene);
    this.previewRibbon = new VisualRibbon(this.scene, this.rawPoints, new THREE.Color(0x00ffff), new THREE.Color(0x0044ff), 0.4);
  }

  public addPoint(surfaceHit: SurfaceHit) {
    if (!this.isDrawing) return;
    const last = this.rawPoints[this.rawPoints.length - 1];
    if (last && last.distanceTo(surfaceHit.point) <= 0.4) return;
    this.rawPoints.push(surfaceHit.point.clone());
    this.rawNormals.push(surfaceHit.normal.clone());
    if (this.previewRibbon && this.rawPoints.length >= 2) this.previewRibbon.updatePoints(this.getResampledPath());
  }

  public finishDrawing(): THREE.Vector3[] | null {
    if (!this.isDrawing) return null;
    this.isDrawing = false;
    const resampled = this.getResampledPath();
    this.previewRibbon?.destroy(this.scene);
    this.previewRibbon = null;
    return resampled.length >= 2 ? resampled : null;
  }

  /** Catmull-Rom smoothing followed by surface reprojection. */
  public getResampledPath(sampleCount: number = 50): THREE.Vector3[] {
    if (this.rawPoints.length < 2) return this.rawPoints.map((point) => point.clone());
    const curve = new THREE.CatmullRomCurve3(this.rawPoints, false, 'catmullrom', 0.5);
    const samples = curve.getSpacedPoints(Math.max(2, sampleCount));
    if (!this.surfaceQuery) return samples;

    return samples.map((point, index) => {
      const sourceIndex = Math.min(this.rawNormals.length - 1, Math.round((index / Math.max(samples.length - 1, 1)) * (this.rawNormals.length - 1)));
      const normal = this.rawNormals[sourceIndex] ?? new THREE.Vector3(0, 1, 0);
      return this.surfaceQuery!.projectNear(point, normal, 4)?.point.clone() ?? point;
    });
  }

  public update(time: number) { this.previewRibbon?.update(time); }
  public getIsDrawing(): boolean { return this.isDrawing; }
  public clear() {
    this.isDrawing = false;
    this.rawPoints = [];
    this.rawNormals = [];
    this.previewRibbon?.destroy(this.scene);
    this.previewRibbon = null;
  }
}
