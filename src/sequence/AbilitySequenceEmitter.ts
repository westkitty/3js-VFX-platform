/**
 * Bridges `emit` stages to the existing ability runtime.
 *
 * The sequence interpreter stays generic; this adapter is the only place that
 * knows a stage turns into a cast. It owns exactly the instances it spawned, so
 * stop/restart releases sequence-owned runtime without touching the VFX Lab
 * preview or anything else in the scene.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AbilityManager } from '../abilities/AbilityRuntime';
import type { AbilityInstance } from '../abilities/AbilityInstance';
import type { AbilityRegistry } from '../abilities/AbilityRegistry';
import type { SurfaceHit } from '../types';
import type { SequenceEmitEvent, SequenceEmitter } from './SequenceRuntime';

export interface SequencePlacement {
  origin: THREE.Vector3;
  target: THREE.Vector3;
  surface: SurfaceHit | null;
}

export type SequencePlacementResolver = (event: SequenceEmitEvent) => SequencePlacement;

export class AbilitySequenceEmitter implements SequenceEmitter {
  private owned: AbilityInstance[] = [];
  private unresolved: string[] = [];

  constructor(
    private readonly manager: AbilityManager,
    private readonly registry: AbilityRegistry,
    private readonly resolvePlacement: SequencePlacementResolver,
  ) {}

  public emit(event: SequenceEmitEvent): void {
    this.owned = this.owned.filter((instance) => instance.phase !== 'done');

    const definition = this.registry.get(event.abilityId);
    if (!definition) {
      // Unresolved targets are surfaced up front by findUnresolvedEmitTargets;
      // recorded here too so a live run can report it.
      if (!this.unresolved.includes(event.abilityId)) this.unresolved.push(event.abilityId);
      return;
    }

    const placement = this.resolvePlacement(event);
    const direction = placement.target.clone().sub(placement.origin);
    if (direction.lengthSq() < 1e-8) direction.set(0, 0, 1);

    const instance = this.manager.cast(
      {
        abilityId: definition.id,
        origin: placement.origin,
        target: placement.target,
        direction: direction.normalize(),
        distance: placement.origin.distanceTo(placement.target),
        surface: placement.surface,
        // Seed comes from the sequence's deterministic stream, never Math.random.
        seed: event.seed,
      },
      definition,
    );

    this.owned.push(instance);
  }

  /** Destroys only the instances this emitter spawned. */
  public cancelAll(): void {
    for (const instance of this.owned) instance.destroy();
    this.owned = [];
    this.unresolved = [];
  }

  public getOwnedCount(): number {
    return this.owned.filter((instance) => instance.phase !== 'done').length;
  }

  public getUnresolvedAbilityIds(): string[] {
    return [...this.unresolved];
  }
}
