/**
 * Performance baseline persistence and relative regression comparator.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaselineComparisonReport,
  DEFAULT_REGRESSION_THRESHOLDS,
  EnvironmentProfile,
  PerformanceReport,
  RegressionThresholds,
  ScenarioComparison,
  ScenarioId,
  ScenarioResult,
} from './PerformanceTypes';

export class PerformanceBaseline {
  /**
   * Checks whether two environments are compatible for baseline performance comparison.
   */
  public static isEnvironmentCompatible(
    a: EnvironmentProfile,
    b: EnvironmentProfile
  ): { compatible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (a.platform !== b.platform) {
      reasons.push(`Platform mismatch: "${a.platform}" vs "${b.platform}"`);
    }
    if (a.devicePixelRatio !== b.devicePixelRatio) {
      reasons.push(`DPR mismatch: ${a.devicePixelRatio} vs ${b.devicePixelRatio}`);
    }
    if (a.viewportWidth !== b.viewportWidth || a.viewportHeight !== b.viewportHeight) {
      reasons.push(`Viewport mismatch: ${a.viewportWidth}x${a.viewportHeight} vs ${b.viewportWidth}x${b.viewportHeight}`);
    }
    if (a.webglRenderer !== b.webglRenderer) {
      reasons.push(`WebGL Renderer mismatch: "${a.webglRenderer}" vs "${b.webglRenderer}"`);
    }

    return {
      compatible: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Compares a current performance report against a baseline.
   */
  public static compare(
    currentReport: PerformanceReport,
    baselineReport: PerformanceReport,
    thresholds: RegressionThresholds = DEFAULT_REGRESSION_THRESHOLDS
  ): BaselineComparisonReport {
    const envCheck = this.isEnvironmentCompatible(
      currentReport.environment,
      baselineReport.environment
    );

    const comparisons: Record<string, ScenarioComparison> = {};
    let overallPassed = true;

    for (const [id, currentResult] of Object.entries(currentReport.results)) {
      const scenarioId = id as ScenarioId;
      const baselineResult: ScenarioResult | undefined = baselineReport.results[scenarioId];

      if (!baselineResult) {
        comparisons[scenarioId] = {
          scenarioId,
          compatible: envCheck.compatible,
          mismatchReasons: ['No matching scenario in baseline report'],
          p95DeltaPct: 0,
          drawCallsDeltaPct: 0,
          geometriesDeltaPct: 0,
          texturesDeltaPct: 0,
          passed: currentResult.passed,
          violations: currentResult.passed ? [] : ['Scenario failed execution'],
        };
        if (!currentResult.passed) overallPassed = false;
        continue;
      }

      const calcPct = (curr: number, base: number): number => {
        if (base <= 0) return curr === 0 ? 0 : 100;
        return parseFloat((((curr - base) / base) * 100).toFixed(2));
      };

      const p95Delta = calcPct(currentResult.frameTimeMs.p95, baselineResult.frameTimeMs.p95);
      const drawCallsDelta = calcPct(currentResult.drawCalls.mean, baselineResult.drawCalls.mean);
      const geosDelta = calcPct(currentResult.memoryGeometries.mean, baselineResult.memoryGeometries.mean);
      const texsDelta = calcPct(currentResult.memoryTextures.mean, baselineResult.memoryTextures.mean);

      const violations: string[] = [];

      if (!currentResult.passed) {
        violations.push('Scenario failed during execution');
      }

      if (currentResult.leakedResources.geometries > 0 || currentResult.leakedResources.textures > 0) {
        violations.push(
          `Resource leak: ${currentResult.leakedResources.geometries} geos, ${currentResult.leakedResources.textures} textures`
        );
      }

      // Check regression thresholds if environment is compatible
      if (envCheck.compatible) {
        if (p95Delta > thresholds.p95MaxIncreasePct) {
          violations.push(`p95 frame time exceeded threshold: +${p95Delta}% (limit +${thresholds.p95MaxIncreasePct}%)`);
        }
        if (drawCallsDelta > thresholds.drawCallsMaxIncreasePct) {
          violations.push(`Draw calls exceeded threshold: +${drawCallsDelta}% (limit +${thresholds.drawCallsMaxIncreasePct}%)`);
        }
        if (geosDelta > thresholds.geometriesMaxIncreasePct) {
          violations.push(`Geometries exceeded threshold: +${geosDelta}% (limit +${thresholds.geometriesMaxIncreasePct}%)`);
        }
        if (texsDelta > thresholds.texturesMaxIncreasePct) {
          violations.push(`Textures exceeded threshold: +${texsDelta}% (limit +${thresholds.texturesMaxIncreasePct}%)`);
        }
      }

      const passed = violations.length === 0;
      if (!passed) overallPassed = false;

      comparisons[scenarioId] = {
        scenarioId,
        compatible: envCheck.compatible,
        mismatchReasons: envCheck.reasons,
        p95DeltaPct: p95Delta,
        drawCallsDeltaPct: drawCallsDelta,
        geometriesDeltaPct: geosDelta,
        texturesDeltaPct: texsDelta,
        passed,
        violations,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      overallPassed,
      environmentCompatible: envCheck.compatible,
      comparisons: comparisons as Record<ScenarioId, ScenarioComparison>,
    };
  }
}
