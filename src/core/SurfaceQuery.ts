/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceHit } from '../types';

export class SurfaceQuery {
  private raycaster: THREE.Raycaster;
  private playableMeshes: THREE.Object3D[] = [];

  constructor() {
    this.raycaster = new THREE.Raycaster();
  }

  public setPlayableMeshes(meshes: THREE.Object3D[]) {
    this.playableMeshes = meshes;
  }

  /**
   * Raycast from camera/mouse coordinate into the scene surface
   */
  public raycastPointer(
    ndcMouse: THREE.Vector2,
    camera: THREE.Camera
  ): SurfaceHit | null {
    this.raycaster.setFromCamera(ndcMouse, camera);
    const intersects = this.raycaster.intersectObjects(this.playableMeshes, true);

    if (intersects.length === 0) {
      // Fallback: Raycast against ground plane y = 0
      const ray = this.raycaster.ray;
      if (Math.abs(ray.direction.y) > 0.0001) {
        const t = -ray.origin.y / ray.direction.y;
        if (t >= 0) {
          const hitPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
          return this.createHit(hitPoint, new THREE.Vector3(0, 1, 0), null);
        }
      }
      return null;
    }

    const first = intersects[0];
    const point = first.point;
    const normal = first.face ? first.face.normal.clone().transformDirection(first.object.matrixWorld) : new THREE.Vector3(0, 1, 0);

    return this.createHit(point, normal, first.object, first.uv, first.faceIndex);
  }

  /**
   * Project an arbitrary world point down onto the active playable surface.
   */
  public projectPoint(point: THREE.Vector3): SurfaceHit | null {
    const rayOrigin = point.clone();
    rayOrigin.y += 10.0; // Cast down from above
    const rayDir = new THREE.Vector3(0, -1, 0);

    this.raycaster.set(rayOrigin, rayDir);
    const intersects = this.raycaster.intersectObjects(this.playableMeshes, true);

    if (intersects.length > 0) {
      const first = intersects[0];
      const normal = first.face ? first.face.normal.clone().transformDirection(first.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
      return this.createHit(first.point, normal, first.object, first.uv, first.faceIndex);
    }

    // Default fallback to y = 0
    return this.createHit(
      new THREE.Vector3(point.x, 0, point.z),
      new THREE.Vector3(0, 1, 0),
      null
    );
  }

  /**
   * Constructs a SurfaceHit with calculated Tangent and Bitangent orthonormal frame
   */
  private createHit(
    point: THREE.Vector3,
    normal: THREE.Vector3,
    object: THREE.Object3D | null,
    uv: THREE.Vector2 | null = null,
    faceIndex?: number
  ): SurfaceHit {
    const norm = normal.clone().normalize();

    // Calculate Tangent and Bitangent vectors
    let preferredForward = new THREE.Vector3(0, 0, 1);
    if (Math.abs(norm.dot(preferredForward)) > 0.9) {
      preferredForward = new THREE.Vector3(1, 0, 0);
    }

    const tangent = preferredForward
      .clone()
      .addScaledVector(norm, -preferredForward.dot(norm))
      .normalize();

    const bitangent = new THREE.Vector3().crossVectors(norm, tangent).normalize();

    return {
      point,
      normal: norm,
      tangent,
      bitangent,
      uv,
      object,
      faceIndex
    };
  }
}
