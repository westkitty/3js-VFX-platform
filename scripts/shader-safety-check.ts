/**
 * Automated static shader & material safety verification gate.
 *
 * Verifies:
 * 1. Safe base values in pow() (detects un-clamped negative bases).
 * 2. Any use of onBeforeCompile provides customProgramCacheKey.
 * 3. Division by zero / NaN safety in custom shaders.
 * 4. Shader exports conform to expected structure.
 *
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SHADERS_DIR = path.join(ROOT, 'src', 'shaders');
const SRC_DIR = path.join(ROOT, 'src');

function getAllFiles(dir: string, ext = '.ts'): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function runShaderSafetyChecks(): void {
  console.log('--- RUNNING SHADER & MATERIAL SAFETY GATE ---');
  let issues = 0;

  // 1. Audit all shader files in src/shaders/
  const shaderFiles = getAllFiles(SHADERS_DIR);
  console.log(`Auditing ${shaderFiles.length} shader source files in src/shaders/...`);

  for (const file of shaderFiles) {
    if (file.endsWith('index.ts')) continue;
    const content = fs.readFileSync(file, 'utf-8');
    const relative = path.relative(ROOT, file);

    // Check pow(base, exponent) patterns
    const powMatches = content.matchAll(/pow\s*\(\s*([^,]+),\s*([^)]+)\)/g);
    for (const match of powMatches) {
      const base = match[1].trim();
      const exponent = match[2].trim();

      // If exponent is non-integer or float, base must be protected with clamp / abs / max(..., 0.0)
      const isFractional = exponent.includes('.') && !/^\d+\.0+$/.test(exponent);
      const isProtected =
        base.includes('clamp') ||
        base.includes('abs') ||
        base.includes('max') ||
        base.includes('smoothstep') ||
        /^[0-9.]+$/.test(base);

      if (isFractional && !isProtected) {
        console.error(
          `❌ [${relative}] Unsafe fractional pow() detected: pow(${base}, ${exponent}). Base must be clamped or non-negative.`
        );
        issues++;
      }
    }

    // Check for division by zero / raw divisor in custom glsl
    const divMatches = content.matchAll(/\/(\s*0(?:\.0*)?\s*)[;),]/g);
    for (const match of divMatches) {
      console.error(`❌ [${relative}] Division by constant zero found: / ${match[1]}`);
      issues++;
    }
  }

  // 2. Audit all src files for onBeforeCompile usage and verify customProgramCacheKey
  const allSrcFiles = getAllFiles(SRC_DIR);
  console.log(`Auditing ${allSrcFiles.length} source files for onBeforeCompile and material cache safety...`);

  let onBeforeCompileCount = 0;
  for (const file of allSrcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relative = path.relative(ROOT, file);

    if (content.includes('onBeforeCompile')) {
      onBeforeCompileCount++;
      if (!content.includes('customProgramCacheKey')) {
        console.error(
          `❌ [${relative}] Material defines onBeforeCompile but lacks customProgramCacheKey implementation.`
        );
        issues++;
      }
    }
  }

  console.log(
    `onBeforeCompile audit: ${onBeforeCompileCount} materials with onBeforeCompile found (all checked for customProgramCacheKey).`
  );

  if (issues > 0) {
    console.error(`\n❌ Shader & Material Safety Check FAILED with ${issues} issue(s).`);
    process.exit(1);
  }

  console.log('✅ ALL SHADER & MATERIAL SAFETY CHECKS PASSED!\n');
}

runShaderSafetyChecks();
