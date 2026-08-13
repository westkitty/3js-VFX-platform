/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceHit } from '../types';

export class SurfaceQuery {
  private readonly raycaster = new THREE.Raycaster();
  private playableMeshes: THREE.Object3D[] = [];

  public setPlayableMeshes(meshes: THREE.Object3D[]) {
    this.playableMeshes = [...meshes];
  }

  public getPlayableMeshes(): readonly THREE.Object3D[] {
    return this.playableMeshes;
  }

  public raycastPointer(ndcMouse: THREE.Vector2, camera: THREE.Camera): SurfaceHit | null {
    this.raycaster.setFromCamera(ndcMouse, camera);
    const hit = this.firstPlayableHit();
    if (hit) return hit;

    // A synthetic floor is only valid when no playable surface has been configured.
    // Once a real surface exists, a miss must remain a miss instead of inventing y=0.
    if (this.playableMeshes.length === 0) {
      const ray = this.raycaster.ray;
      if (Math.abs(ray.direction.y) > 0.0001) {
        const t = -ray.origin.y / ray.direction.y;
        if (t >= 0) return this.createHit(ray.at(t, new THREE.Vector3()), new THREE.Vector3(0, 1, 0), null);
      }
    }
    return null;
  }

  /**
   * Projects a world point onto the configured surface using a global-down probe.
   * The fallback plane is retained only for an empty surface set so callers cannot
   * silently snap off-mesh points to an imaginary floor.
   */
  public projectPoint(point: THREE.Vector3, probeDistance: number = 20): SurfaceHit | null {
    if (this.playableMeshes.length === 0) {
      return this.createHit(new THREE.Vector3(point.x, 0, point.z), new THREE.Vector3(0, 1, 0), null);
    }
    const distance = Math.max(0.01, probeDistance);
    const origin = point.clone().addScaledVector(THREE.Object3D.DEFAULT_UP, distance * 0.5);
    return this.projectAlong(origin, new THREE.Vector3(0, -1, 0), distance);
  }

  /** Raycasts along an arbitrary direction, bounded by maxDistance. */
  public projectAlong(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number = 20): SurfaceHit | null {
    if (this.playableMeshes.length === 0 || direction.lengthSq() < 1e-12) return null;
    this.raycaster.set(origin, direction.clone().normalize());
    const previousFar = this.raycaster.far;
    this.raycaster.far = Math.max(0.01, maxDistance);
    const hit = this.firstPlayableHit();
    this.raycaster.far = previousFar;
    return hit;
  }

  /**
   * Reprojects a point near a known surface. The local normal is tried first so
   * slopes and walls are not flattened to world-up. Global down/up are bounded
   * fallbacks for stepped terrain or an imperfect reference normal.
   */
  public projectNear(point: THREE.Vector3, referenceNormal: THREE.Vector3, probeDistance: number = 3): SurfaceHit | null {
    if (this.playableMeshes.length === 0) return this.projectPoint(point, probeDistance * 2);
    const distance = Math.max(0.05, probeDistance);
    const normal = referenceNormal.lengthSq() > 1e-12 ? referenceNormal.clone().normalize() : new THREE.Vector3(0, 1, 0);
    const local = this.projectAlong(point.clone().addScaledVector(normal, distance), normal.clone().negate(), distance * 2);
    if (local) return local;
    const down = this.projectAlong(point.clone().add(new THREE.Vector3(0, distance, 0)), new THREE.Vector3(0, -1, 0), distance * 2);
    if (down) return down;
    return this.projectAlong(point.clone().add(new THREE.Vector3(0, -distance, 0)), new THREE.Vector3(0, 1, 0), distance * 2);
  }

  private firstPlayableHit(): SurfaceHit | null {
    const intersects = this.raycaster.intersectObjects(this.playableMeshes, true);
    if (intersects.length === 0) return null;
    const first = intersects[0];
    const normal = first.face
      ? first.face.normal.clone().transformDirection(first.object.matrixWorld)
      : new THREE.Vector3(0, 1, 0);
    return this.createHit(first.point.clone(), normal, first.object, first.uv ?? null, first.faceIndex);
  }

  private createHit(point: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D | null, uv: THREE.Vector2 | null = null, faceIndex?: number): SurfaceHit {
    const norm = normal.clone().normalize();
    let preferredForward = new THREE.Vector3(0, 0, 1);
    if (Math.abs(norm.dot(preferredForward)) > 0.9) preferredForward.set(1, 0, 0);
    const tangent = preferredForward.clone().addScaledVector(norm, -preferredForward.dot(norm)).normalize();
    const bitangent = new THREE.Vector3().crossVectors(norm, tangent).normalize();
    return { point, normal: norm, tangent, bitangent, uv, object, faceIndex };
  }
}
