/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type RandomSource = () => number;

/**
 * Runtime feedback controller.
 *
 * Camera shake is a transient render offset: it is applied immediately before
 * a render and removed immediately after so it can never become authoritative
 * camera state or accumulate drift across frames.
 */
export class PostProcessingController {
  private camera: THREE.PerspectiveCamera;
  private shakeIntensity = 0;
  private shakeDecay = 5.0; // Decay speed per sec
  private flashOverlay: HTMLElement | null = null;
  private flashTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private appliedShakeOffset = new THREE.Vector3();
  private random: RandomSource;

  constructor(camera: THREE.PerspectiveCamera, random: RandomSource = Math.random) {
    this.camera = camera;
    this.random = random;
  }

  public triggerShake(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, Math.max(0, intensity));
  }

  public triggerFlash(colorHex: string = '#ffffff', durationMs: number = 200) {
    if (!this.flashOverlay) {
      this.flashOverlay = document.getElementById('flash-overlay');
    }
    if (!this.flashOverlay) return;

    if (this.flashTimeoutId !== null) {
      clearTimeout(this.flashTimeoutId);
    }

    this.flashOverlay.style.backgroundColor = colorHex;
    this.flashOverlay.style.opacity = '0.6';
    this.flashTimeoutId = setTimeout(() => {
      if (this.flashOverlay) {
        this.flashOverlay.style.opacity = '0';
      }
      this.flashTimeoutId = null;
    }, Math.max(0, durationMs));
  }

  /**
   * Apply one transient shake sample. Engine must call restoreCameraTransform()
   * after rendering the frame.
   */
  public update(deltaTime: number) {
    // Defensive restore in case a caller forgot to restore after a prior frame.
    this.restoreCameraTransform();

    if (this.shakeIntensity <= 0.001) {
      this.shakeIntensity = 0;
      return;
    }

    const halfIntensity = this.shakeIntensity * 0.5;
    this.appliedShakeOffset.set(
      (this.random() * 2 - 1) * halfIntensity,
      (this.random() * 2 - 1) * halfIntensity,
      (this.random() * 2 - 1) * halfIntensity
    );
    this.camera.position.add(this.appliedShakeOffset);
    this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * Math.max(0, deltaTime));
  }

  /** Remove only the offset owned by this controller. */
  public restoreCameraTransform() {
    if (this.appliedShakeOffset.lengthSq() === 0) return;
    this.camera.position.sub(this.appliedShakeOffset);
    this.appliedShakeOffset.set(0, 0, 0);
  }

  /**
   * Kept for compatibility with the previous API. The authoritative camera
   * transform is whatever the camera has after our transient offset is removed.
   */
  public updateBasePosition() {
    this.restoreCameraTransform();
  }

  public dispose() {
    this.restoreCameraTransform();
    this.shakeIntensity = 0;

    if (this.flashTimeoutId !== null) {
      clearTimeout(this.flashTimeoutId);
      this.flashTimeoutId = null;
    }
    if (this.flashOverlay) {
      this.flashOverlay.style.opacity = '0';
    }
    this.flashOverlay = null;
  }
}
