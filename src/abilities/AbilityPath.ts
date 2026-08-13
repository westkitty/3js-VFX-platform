import * as THREE from 'three';
import { AbilityRequest } from '../types';

export function getAbilityTravelDistance(request: AbilityRequest): number {
  if (!request.path || request.path.length < 2) return request.origin.distanceTo(request.target);
  let distance = 0;
  for (let i = 1; i < request.path.length; i++) distance += request.path[i - 1].distanceTo(request.path[i]);
  return distance;
}

export function updateAbilityTravelPosition(request: AbilityRequest, progress: number, output: THREE.Vector3): void {
  const path = request.path;
  if (!path || path.length < 2) {
    output.lerpVectors(request.origin, request.target, progress);
    return;
  }
  const totalDistance = getAbilityTravelDistance(request);
  let remaining = totalDistance * Math.min(Math.max(progress, 0), 1);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const segmentLength = a.distanceTo(b);
    if (remaining <= segmentLength || i === path.length - 1) {
      const t = segmentLength > 0 ? Math.min(remaining / segmentLength, 1) : 0;
      output.lerpVectors(a, b, t);
      return;
    }
    remaining -= segmentLength;
  }
}
