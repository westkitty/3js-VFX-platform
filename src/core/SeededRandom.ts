/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Small deterministic PRNG for repeatable runtime/test effects. */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 0x6d2b79f5) {
    this.state = SeededRandom.normalizeSeed(seed);
  }

  public reset(seed: number): void {
    this.state = SeededRandom.normalizeSeed(seed);
  }

  public next(): number {
    // Mulberry32. Returns [0, 1).
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  public signed(magnitude = 1): number {
    return (this.next() * 2 - 1) * magnitude;
  }

  private static normalizeSeed(seed: number): number {
    if (!Number.isFinite(seed)) return 0x6d2b79f5;

    // Cast-request seeds are often normalized floats. Preserve useful entropy.
    const normalized = Math.abs(seed) < 1 ? Math.floor(Math.abs(seed) * 0xffffffff) : Math.floor(seed);
    return (normalized >>> 0) || 0x6d2b79f5;
  }
}
