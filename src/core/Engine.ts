/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceQuery } from './SurfaceQuery';
import { globalVfxPool } from './VfxPool';
import { PostProcessingController } from './PostProcessing';
import { EngineClock } from './EngineClock';
import { SeededRandom } from './SeededRandom';
import { PerformanceMetrics } from '../types';

export class Engine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public surfaceQuery: SurfaceQuery;
  public postFX: PostProcessingController;
  public readonly clock: EngineClock;
  public readonly rng: SeededRandom;

  // Performance metrics tracking
  private frameTimes: number[] = [];
  private currentMetrics: PerformanceMetrics = {
    fps: 60,
    frameTimeMs: 16.6,
    p50FrameMs: 16.6,
    p95FrameMs: 16.6,
    p99FrameMs: 16.6,
    drawCalls: 0,
    triangles: 0,
    particlesCount: 0,
    activeLights: 0,
    decalsCount: 0,
    activeSpells: 0,
    memoryGeometries: 0,
    memoryTextures: 0,
  };

  private animationFrameId: number | null = null;
  private updateCallbacks: Array<(dt: number, time: number) => void> = [];

  constructor(container: HTMLElement) {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);
    this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 18, 28);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // 4. Runtime services / subsystems
    this.clock = new EngineClock({ fixedStep: 1 / 60, maxDelta: 0.1, timeScale: 1 });
    this.rng = new SeededRandom(0xa37ef00d);
    this.surfaceQuery = new SurfaceQuery();
    this.postFX = new PostProcessingController(this.camera, () => this.rng.next());
    globalVfxPool.init(this.scene);

    // 5. Lighting
    this.setupLighting();

    // 6. Handle Window Resize
    window.addEventListener('resize', this.onResize);
  }

  /** Compatibility facade; EngineClock is the sole simulation-time owner. */
  public get isPaused(): boolean {
    return this.clock.paused;
  }

  public set isPaused(value: boolean) {
    this.clock.setPaused(value);
  }

  public get simulationTime(): number {
    return this.clock.simulationTime;
  }

  public get timeScale(): number {
    return this.clock.timeScale;
  }

  public set timeScale(value: number) {
    this.clock.timeScale = value;
  }

  private setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x283244, 1.2);
    this.scene.add(ambientLight);

    // Main Directional Sun / Moon
    const sunLight = new THREE.DirectionalLight(0xe8f0ff, 2.5);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 30;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Subtle Rim Light
    const rimLight = new THREE.DirectionalLight(0x4466ff, 1.0);
    rimLight.position.set(-20, 10, -20);
    this.scene.add(rimLight);
  }

  public registerUpdateCallback(fn: (dt: number, time: number) => void) {
    this.updateCallbacks.push(fn);
  }

  public unregisterUpdateCallback(fn: (dt: number, time: number) => void) {
    this.updateCallbacks = this.updateCallbacks.filter((cb) => cb !== fn);
  }

  public start() {
    if (this.animationFrameId !== null) return;

    this.clock.start(performance.now());
    const loop = (now: number) => {
      this.animationFrameId = requestAnimationFrame(loop);

      // Capture wall-clock frame duration before the clock advances. This is the
      // real measurement Performance Lab consumes; it must never be recomputed
      // after the timestamp has already been overwritten.
      const frame = this.clock.frame(now);

      if (frame.advanced) {
        for (const cb of this.updateCallbacks) {
          cb(frame.simulationDeltaSeconds, frame.simulationTime);
        }

        // Camera shake is frozen when simulation is paused.
        this.postFX.update(frame.simulationDeltaSeconds);
      }

      this.renderer.render(this.scene, this.camera);
      this.postFX.restoreCameraTransform();

      if (frame.rawFrameDurationMs > 0) {
        this.recordPerformanceMetrics(frame.rawFrameDurationMs);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.postFX.restoreCameraTransform();
  }

  /**
   * Deterministically advances simulation once. The VFX Lab should invoke this
   * while paused so requestAnimationFrame cannot advance the same state too.
   */
  public stepSingleFrame(dt: number = this.clock.fixedStep): boolean {
    if (!this.clock.paused) return false;

    const frame = this.clock.step(dt);
    if (!frame.advanced) return false;

    for (const cb of this.updateCallbacks) {
      cb(frame.simulationDeltaSeconds, frame.simulationTime);
    }
    this.postFX.update(frame.simulationDeltaSeconds);
    this.renderer.render(this.scene, this.camera);
    this.postFX.restoreCameraTransform();
    return true;
  }

  private recordPerformanceMetrics(frameDurationMs: number) {
    if (!Number.isFinite(frameDurationMs) || frameDurationMs <= 0) return;

    this.frameTimes.push(frameDurationMs);
    if (this.frameTimes.length > 120) {
      this.frameTimes.shift();
    }

    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const percentile = (p: number) => {
      if (sorted.length === 0) return 16.6;
      const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
      return sorted[index];
    };

    const p50 = percentile(0.5);
    const p95 = percentile(0.95);
    const p99 = percentile(0.99);

    const info = this.renderer.info;

    this.currentMetrics = {
      fps: Math.round(1000 / Math.max(p50, 0.001)),
      frameTimeMs: parseFloat(p50.toFixed(1)),
      p50FrameMs: parseFloat(p50.toFixed(1)),
      p95FrameMs: parseFloat(p95.toFixed(1)),
      p99FrameMs: parseFloat(p99.toFixed(1)),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      particlesCount: this.currentMetrics.particlesCount,
      activeLights: globalVfxPool.getActiveLightCount(),
      decalsCount: this.currentMetrics.decalsCount,
      activeSpells: this.currentMetrics.activeSpells,
      memoryGeometries: info.memory.geometries,
      memoryTextures: info.memory.textures,
    };
  }

  public updateMetricCounters(particles: number, decals: number, spells: number) {
    this.currentMetrics.particlesCount = particles;
    this.currentMetrics.decalsCount = decals;
    this.currentMetrics.activeSpells = spells;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  private onResize = () => {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;

    this.camera.aspect = parent.clientWidth / parent.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(parent.clientWidth, parent.clientHeight);
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.postFX.dispose();
    globalVfxPool.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.updateCallbacks = [];
  }
}
