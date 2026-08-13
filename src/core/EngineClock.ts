/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EngineClockFrame {
  rawFrameDurationMs: number;
  rawDeltaSeconds: number;
  simulationDeltaSeconds: number;
  simulationTime: number;
  advanced: boolean;
}

export interface EngineClockOptions {
  fixedStep?: number;
  maxDelta?: number;
  timeScale?: number;
}

/**
 * Owns simulation time independently from requestAnimationFrame wall time.
 * Normal rendering may use a capped variable delta while deterministic editor/tests
 * advance through step() using a fixed increment.
 */
export class EngineClock {
  public readonly fixedStep: number;
  public readonly maxDelta: number;

  private lastWallTimeMs: number | null = null;
  private _simulationTime = 0;
  private _timeScale: number;
  private _paused = false;

  constructor(options: EngineClockOptions = {}) {
    this.fixedStep = options.fixedStep ?? 1 / 60;
    this.maxDelta = options.maxDelta ?? 0.1;
    this._timeScale = options.timeScale ?? 1;
  }

  public start(nowMs: number): void {
    this.lastWallTimeMs = nowMs;
  }

  public frame(nowMs: number): EngineClockFrame {
    if (this.lastWallTimeMs === null) {
      this.lastWallTimeMs = nowMs;
      return {
        rawFrameDurationMs: 0,
        rawDeltaSeconds: 0,
        simulationDeltaSeconds: 0,
        simulationTime: this._simulationTime,
        advanced: false,
      };
    }

    const rawFrameDurationMs = Math.max(0, nowMs - this.lastWallTimeMs);
    this.lastWallTimeMs = nowMs;

    const rawDeltaSeconds = rawFrameDurationMs / 1000;
    if (this._paused) {
      return {
        rawFrameDurationMs,
        rawDeltaSeconds,
        simulationDeltaSeconds: 0,
        simulationTime: this._simulationTime,
        advanced: false,
      };
    }

    const simulationDeltaSeconds = Math.min(rawDeltaSeconds, this.maxDelta) * this._timeScale;
    this._simulationTime += simulationDeltaSeconds;

    return {
      rawFrameDurationMs,
      rawDeltaSeconds,
      simulationDeltaSeconds,
      simulationTime: this._simulationTime,
      advanced: simulationDeltaSeconds > 0,
    };
  }

  /** Advance exactly one deterministic simulation increment. */
  public step(stepSeconds: number = this.fixedStep): EngineClockFrame {
    const simulationDeltaSeconds = Math.max(0, stepSeconds) * this._timeScale;
    this._simulationTime += simulationDeltaSeconds;

    return {
      rawFrameDurationMs: 0,
      rawDeltaSeconds: 0,
      simulationDeltaSeconds,
      simulationTime: this._simulationTime,
      advanced: simulationDeltaSeconds > 0,
    };
  }

  public setPaused(paused: boolean): void {
    this._paused = paused;
  }

  public get paused(): boolean {
    return this._paused;
  }

  public set timeScale(value: number) {
    this._timeScale = Number.isFinite(value) ? Math.max(0, value) : 1;
  }

  public get timeScale(): number {
    return this._timeScale;
  }

  public get simulationTime(): number {
    return this._simulationTime;
  }

  public reset(simulationTime = 0): void {
    this._simulationTime = Math.max(0, simulationTime);
    this.lastWallTimeMs = null;
  }
}
