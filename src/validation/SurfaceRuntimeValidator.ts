import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { FreehandCaster } from '../drawing/FreehandCaster';
import { SurfaceIndicatorManager, type SurfaceIndicatorConfig } from '../indicators/SurfaceIndicatorManager';
import { SurfaceHit } from '../types';
import { SurfaceValidationFixture } from './SurfaceValidationFixture';

export interface SurfaceRuntimeValidationCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface SurfaceRuntimeValidationReport {
  passed: boolean;
  generatedAt: string;
  checks: SurfaceRuntimeValidationCheck[];
}

const DOWN = new THREE.Vector3(0, -1, 0);
const UP = new THREE.Vector3(0, 1, 0);
const INDICATOR_SHAPES: SurfaceIndicatorConfig['shape'][] = ['line', 'zone', 'cone', 'ring', 'rectangle'];

export function runSurfaceRuntimeValidation(
  engine: Engine,
  fixture: SurfaceValidationFixture,
  indicatorManager: SurfaceIndicatorManager,
  freehand: FreehandCaster,
): SurfaceRuntimeValidationReport {
  const checks: SurfaceRuntimeValidationCheck[] = [];
  const add = (id: string, label: string, passed: boolean, detail: string) => {
    checks.push({ id, label, passed, detail });
  };

  try {
    engine.scene.updateMatrixWorld(true);
    engine.camera.updateMatrixWorld(true);

    const context = engine.renderer.getContext();
    add('webgl-context', 'WebGL context is active', Boolean(context) && !context.isContextLost(), context ? `contextLost=${context.isContextLost()}` : 'missing context');

    const meshes = [...fixture.getPlayableMeshes()];
    const ramp = meshes.find((mesh) => mesh.name === 'SurfaceValidationRamp') ?? null;
    const steps = meshes
      .filter((mesh) => mesh.name.startsWith('SurfaceValidationStep'))
      .sort((a, b) => a.name.localeCompare(b.name));

    add('fixture-shape', 'Validation fixture exposes one ramp and four steps', Boolean(ramp) && steps.length === 4, `ramp=${Boolean(ramp)} steps=${steps.length}`);
    if (!ramp || steps.length !== 4) return finish(checks);

    const rampHit = hitTopSurface(engine, ramp);
    add('ramp-hit', 'SurfaceQuery hits the sloped ramp', Boolean(rampHit) && rampHit?.object === ramp, rampHit ? `${rampHit.object?.name ?? 'unknown'} y=${rampHit.point.y.toFixed(3)}` : 'no hit');

    if (rampHit) {
      const expectedNormal = new THREE.Vector3(0, 1, 0).transformDirection(ramp.matrixWorld).normalize();
      const normalDot = rampHit.normal.dot(expectedNormal);
      add('ramp-normal', 'Ramp hit normal follows the mesh rotation', normalDot > 0.995, `dot=${normalDot.toFixed(6)}`);

      const ndc = rampHit.point.clone().project(engine.camera);
      const pointerHit = engine.surfaceQuery.raycastPointer(new THREE.Vector2(ndc.x, ndc.y), engine.camera);
      add('pointer-ramp', 'Pointer raycast resolves the ramp through camera NDC', pointerHit?.object === ramp, pointerHit ? pointerHit.object?.name ?? 'unknown' : 'no hit');
    }

    const stepHits = steps.map((step) => hitTopSurface(engine, step));
    const stepHitCount = stepHits.filter((hit, index) => hit?.object === steps[index]).length;
    add('step-hits', 'SurfaceQuery resolves all four stepped top surfaces', stepHitCount === 4, `${stepHitCount}/4`);

    const pointerStepHitCount = stepHits.filter((hit, index) => {
      if (!hit) return false;
      const ndc = hit.point.clone().project(engine.camera);
      return engine.surfaceQuery.raycastPointer(new THREE.Vector2(ndc.x, ndc.y), engine.camera)?.object === steps[index];
    }).length;
    add('pointer-steps', 'Pointer raycast resolves all four steps through camera NDC', pointerStepHitCount === 4, `${pointerStepHitCount}/4`);

    const phantom = engine.surfaceQuery.projectAlong(new THREE.Vector3(100, 20, 100), DOWN, 40);
    add('no-phantom-floor', 'Configured surfaces do not invent a distant y=0 fallback', phantom === null, phantom ? `unexpected=${phantom.object?.name ?? 'surface'}` : 'null as expected');

    if (rampHit && stepHits[2]) {
      validateIndicators(engine, [
        { label: 'ramp', hit: rampHit },
        { label: 'step', hit: stepHits[2] },
      ], indicatorManager, checks, add);
    }

    if (stepHits.every((hit): hit is SurfaceHit => Boolean(hit))) {
      validateFreehand(engine, stepHits as SurfaceHit[], freehand, checks, add);
    } else {
      add('freehand-steps', 'Freehand traverses the stepped surfaces', false, 'one or more step hits were unavailable');
    }
  } catch (error) {
    add('runtime-exception', 'Runtime validation completed without exception', false, error instanceof Error ? `${error.name}: ${error.message}` : String(error));
  } finally {
    indicatorManager.clear();
    freehand.clear();
  }

  return finish(checks);
}

function hitTopSurface(engine: Engine, mesh: THREE.Mesh): SurfaceHit | null {
  const bounds = new THREE.Box3().setFromObject(mesh);
  const center = bounds.getCenter(new THREE.Vector3());
  const height = Math.max(1, bounds.max.y - bounds.min.y);
  const origin = new THREE.Vector3(center.x, bounds.max.y + 2, center.z);
  return engine.surfaceQuery.projectAlong(origin, DOWN, height + 4);
}

function validateIndicators(
  engine: Engine,
  surfaces: Array<{ label: string; hit: SurfaceHit }>,
  manager: SurfaceIndicatorManager,
  checks: SurfaceRuntimeValidationCheck[],
  add: (id: string, label: string, passed: boolean, detail: string) => void,
) {
  const baselineActive = manager.getActiveCount();
  let allConform = true;
  let allCleanup = true;
  let maxDistance = 0;
  let placements = 0;

  for (const surface of surfaces) {
    for (const shape of INDICATOR_SHAPES) {
      const config: SurfaceIndicatorConfig = {
        shape,
        direction: surface.hit.tangent.clone(),
        range: 2,
        radius: 1,
        angle: Math.PI / 3,
        width: 1,
        warningDuration: 0.2,
        commitDuration: 0.1,
      };

      const beforeLines = new Set(findIndicatorLines(engine.scene));
      manager.show(surface.hit, config);
      engine.renderer.render(engine.scene, engine.camera);
      placements += 1;

      const line = findIndicatorLines(engine.scene).find((candidate) => !beforeLines.has(candidate));
      if (!line || manager.getActiveCount() !== baselineActive + 1) {
        allConform = false;
        allCleanup = false;
        manager.clear();
        break;
      }

      const positions = line.geometry.getAttribute('position');
      for (let index = 0; index < positions.count; index++) {
        const point = new THREE.Vector3().fromBufferAttribute(positions as THREE.BufferAttribute, index);
        const projected = engine.surfaceQuery.projectNear(point, surface.hit.normal, 1.5);
        if (!projected) {
          allConform = false;
          maxDistance = Number.POSITIVE_INFINITY;
          break;
        }
        maxDistance = Math.max(maxDistance, point.distanceTo(projected.point));
      }

      if (maxDistance > 0.08) allConform = false;

      manager.update(config.warningDuration + config.commitDuration + 0.21);
      engine.renderer.render(engine.scene, engine.camera);
      const removed = manager.getActiveCount() === baselineActive && !engine.scene.children.includes(line);
      if (!removed) allCleanup = false;
    }
  }

  add('indicator-conformance', 'All five indicator shapes conform on both ramp and step surfaces', allConform, Number.isFinite(maxDistance) ? `placements=${placements} maxDistance=${maxDistance.toFixed(4)}` : `placements=${placements} projection miss`);
  add('indicator-lifecycle', 'All indicator placements complete warning/commit/fade and remove their scene objects', allCleanup, `${placements} placements exercised`);
}

function validateFreehand(
  engine: Engine,
  stepHits: SurfaceHit[],
  freehand: FreehandCaster,
  checks: SurfaceRuntimeValidationCheck[],
  add: (id: string, label: string, passed: boolean, detail: string) => void,
) {
  const sceneChildrenBefore = engine.scene.children.length;
  const geometryBefore = engine.renderer.info.memory.geometries;

  freehand.startDrawing(stepHits[0]);
  for (const hit of stepHits.slice(1)) freehand.addPoint(hit);
  engine.renderer.render(engine.scene, engine.camera);
  const geometryDuring = engine.renderer.info.memory.geometries;

  const path = freehand.finishDrawing();
  engine.renderer.render(engine.scene, engine.camera);
  const geometryAfter = engine.renderer.info.memory.geometries;
  const sceneChildrenAfter = engine.scene.children.length;

  if (!path || path.length < 2) {
    add('freehand-steps', 'Freehand traverses the stepped surfaces', false, 'no finished path');
    add('freehand-cleanup', 'Freehand preview resources are released', false, 'path did not finish');
    return;
  }

  let maxDistance = 0;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let projectionMiss = false;
  for (const point of path) {
    const projected = engine.surfaceQuery.projectNear(point, UP, 4);
    if (!projected) {
      projectionMiss = true;
      break;
    }
    maxDistance = Math.max(maxDistance, point.distanceTo(projected.point));
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const traversesSteps = !projectionMiss && maxDistance <= 0.05 && minY >= 0.45 && maxY - minY >= 1.5;
  add('freehand-steps', 'Freehand resampling stays attached while traversing all stepped heights', traversesSteps, projectionMiss ? 'projection miss' : `points=${path.length} maxDistance=${maxDistance.toFixed(4)} yRange=${(maxY - minY).toFixed(3)}`);

  const resourceRecovered = sceneChildrenAfter === sceneChildrenBefore && geometryDuring >= geometryBefore + 1 && geometryAfter === geometryBefore;
  add('freehand-cleanup', 'Freehand preview scene/GPU geometry returns to baseline after finish', resourceRecovered, `children ${sceneChildrenBefore}->${sceneChildrenAfter}; geometries ${geometryBefore}->${geometryDuring}->${geometryAfter}`);
}

function findIndicatorLines(scene: THREE.Scene): THREE.LineLoop[] {
  return scene.children.filter((child): child is THREE.LineLoop => child.type === 'LineLoop' && child.renderOrder === 12);
}

function finish(checks: SurfaceRuntimeValidationCheck[]): SurfaceRuntimeValidationReport {
  return {
    passed: checks.length > 0 && checks.every((check) => check.passed),
    generatedAt: new Date().toISOString(),
    checks,
  };
}
