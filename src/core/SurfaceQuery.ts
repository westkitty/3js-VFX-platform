/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SurfaceHit } from '../types';
import { buildSurfaceFrameTuple } from './SurfaceFrameModel';

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

    if (this.playableMeshes.length === 0) {
      const ray = this.raycaster.ray;
      if (Math.abs(ray.direction.y) > 0.0001) {
        const t = -ray.origin.y / ray.direction.y;
        if (t >= 0) return this.createHit(ray.at(t, new THREE.Vector3()), new THREE.Vector3(0, 1, 0), null);
      }
    }
    return null;
  }

  public projectPoint(point: THREE.Vector3, probeDistance: number = 20): SurfaceHit | null {
    if (this.playableMeshes.length === 0) {
      return this.createHit(new THREE.Vector3(point.x, 0, point.z), new THREE.Vector3(0, 1, 0), null);
    }
    const distance = Math.max(0.01, probeDistance);
    const origin = point.clone().addScaledVector(THREE.Object3D.DEFAULT_UP, distance * 0.5);
    return this.projectAlong(origin, new THREE.Vector3(0, -1, 0), distance);
  }

  public projectAlong(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number = 20): SurfaceHit | null {
    if (this.playableMeshes.length === 0 || direction.lengthSq() < 1e-12) return null;
    this.raycaster.set(origin, direction.clone().normalize());
    const previousFar = this.raycaster.far;
    this.raycaster.far = Math.max(0.01, maxDistance);
    const hit = this.firstPlayableHit();
    this.raycaster.far = previousFar;
    return hit;
  }

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

  public getSurfaceMesh(surfaceId: string): THREE.Object3D | null {
    for (const mesh of this.playableMeshes) {
      const id = this.resolveObjectId(mesh);
      if (id === surfaceId) return mesh;
    }
    return null;
  }

  public resolveObjectId(object: THREE.Object3D | null): string {
    if (!object) return 'surface_default';
    if (typeof object.userData?.surfaceId === 'string' && object.userData.surfaceId.length > 0) {
      return object.userData.surfaceId;
    }
    if (object.name && object.name.length > 0) {
      return object.name;
    }
    return `surface_${object.id}`;
  }

  private createHit(point: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D | null, uv: THREE.Vector2 | null = null, faceIndex?: number): SurfaceHit {
    const frame = buildSurfaceFrameTuple([normal.x, normal.y, normal.z]);
    const norm = new THREE.Vector3(...frame.normal);
    const tangent = new THREE.Vector3(...frame.tangent);
    const bitangent = new THREE.Vector3(...frame.bitangent);
    const surfaceId = this.resolveObjectId(object);
    return { point, normal: norm, tangent, bitangent, uv, object, faceIndex, surfaceId };
  }
}
