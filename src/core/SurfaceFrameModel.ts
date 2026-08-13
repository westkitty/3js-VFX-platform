export type Vec3Tuple = readonly [number, number, number];

export interface SurfaceFrameTuple {
  normal: [number, number, number];
  tangent: [number, number, number];
  bitangent: [number, number, number];
}

export interface DirectionalSurfaceFrameTuple {
  normal: [number, number, number];
  forward: [number, number, number];
  right: [number, number, number];
}

const EPSILON = 1e-12;
const WORLD_UP: Vec3Tuple = [0, 1, 0];
const CANDIDATE_AXES: Vec3Tuple[] = [[0, 0, 1], [1, 0, 0], [0, 1, 0]];

export function dot3(a: Vec3Tuple, b: Vec3Tuple): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross3(a: Vec3Tuple, b: Vec3Tuple): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function lengthSq3(value: Vec3Tuple): number {
  return dot3(value, value);
}

export function normalize3(value: Vec3Tuple, fallback: Vec3Tuple = WORLD_UP): [number, number, number] {
  const lengthSq = lengthSq3(value);
  if (lengthSq <= EPSILON) {
    const fallbackLengthSq = lengthSq3(fallback);
    if (fallbackLengthSq <= EPSILON) return [0, 1, 0];
    const inverse = 1 / Math.sqrt(fallbackLengthSq);
    return [fallback[0] * inverse, fallback[1] * inverse, fallback[2] * inverse];
  }
  const inverse = 1 / Math.sqrt(lengthSq);
  return [value[0] * inverse, value[1] * inverse, value[2] * inverse];
}

export function projectOntoPlane3(value: Vec3Tuple, unitNormal: Vec3Tuple): [number, number, number] {
  const amount = dot3(value, unitNormal);
  return [
    value[0] - unitNormal[0] * amount,
    value[1] - unitNormal[1] * amount,
    value[2] - unitNormal[2] * amount,
  ];
}

export function buildSurfaceFrameTuple(normal: Vec3Tuple, preferredForward: Vec3Tuple = [0, 0, 1]): SurfaceFrameTuple {
  const unitNormal = normalize3(normal);
  let tangentCandidate = projectOntoPlane3(preferredForward, unitNormal);

  if (lengthSq3(tangentCandidate) <= EPSILON) {
    const fallbackAxis = [...CANDIDATE_AXES]
      .sort((a, b) => Math.abs(dot3(a, unitNormal)) - Math.abs(dot3(b, unitNormal)))[0];
    tangentCandidate = projectOntoPlane3(fallbackAxis, unitNormal);
  }

  const tangent = normalize3(tangentCandidate, [1, 0, 0]);
  const bitangent = normalize3(cross3(unitNormal, tangent), [1, 0, 0]);
  return { normal: unitNormal, tangent, bitangent };
}

export function buildDirectionalSurfaceFrameTuple(
  normal: Vec3Tuple,
  direction: Vec3Tuple,
  fallbackTangent: Vec3Tuple,
): DirectionalSurfaceFrameTuple {
  const base = buildSurfaceFrameTuple(normal, fallbackTangent);
  const projectedDirection = projectOntoPlane3(direction, base.normal);
  const forward = lengthSq3(projectedDirection) > EPSILON
    ? normalize3(projectedDirection, base.tangent)
    : base.tangent;
  const right = normalize3(cross3(base.normal, forward), base.bitangent);
  return { normal: base.normal, forward, right };
}

export function mapLocalSurfacePoint(
  anchor: Vec3Tuple,
  frame: Pick<DirectionalSurfaceFrameTuple, 'forward' | 'right'>,
  local: readonly [number, number],
): [number, number, number] {
  const [x, y] = local;
  return [
    anchor[0] + frame.right[0] * x + frame.forward[0] * y,
    anchor[1] + frame.right[1] * x + frame.forward[1] * y,
    anchor[2] + frame.right[2] * x + frame.forward[2] * y,
  ];
}
