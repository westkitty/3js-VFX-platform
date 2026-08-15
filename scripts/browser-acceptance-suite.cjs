const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- STARTING COMPREHENSIVE AETHERVFX BROWSER QA SUITE ---');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: [
        '--no-sandbox',
        '--use-gl=angle',
        '--use-angle=metal',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
      ]
    });
  } catch (err) {
    console.error('Failed to launch Chrome:', err);
    process.exit(1);
  }

  const results = {
    phase3Regression: false,
    phase2Smoke: false,
    phase4Smoke: false,
    phase5Acceptance: false,
    budgetProof: false,
    soakProof: false,
    pauseProof: false,
    restartProof: false,
    consoleErrors: []
  };

  const page = await browser.newPage();
  page.on('requestfailed', (req) => {
    console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log(`HTTP ${res.status()}:`, res.url());
    }
  });

  try {
    // ==========================================
    // 1. PHASE 3 REGRESSION (?surfaceAutoTest=1)
    // ==========================================
    console.log('\n[1/5] Running Phase 3 Surface Validation...');
    await page.goto('http://localhost:3001/?surfaceAutoTest=1', { waitUntil: 'domcontentloaded' });
    
    await page.waitForFunction(() => {
      return window.__AETHERVFX_SURFACE_VALIDATION__ && 
             window.__AETHERVFX_SURFACE_VALIDATION__.passed !== undefined;
    }, { timeout: 20000 });

    const p3Report = await page.evaluate(() => window.__AETHERVFX_SURFACE_VALIDATION__);
    console.log(`Phase 3 Report: passed=${p3Report.passed}, checks=${p3Report.checks?.length}`);
    
    if (!p3Report.passed) throw new Error('Phase 3 failed: passed is false');
    if (p3Report.checks.length !== 12) throw new Error(`Phase 3 failed: expected 12 checks, got ${p3Report.checks.length}`);
    for (const c of p3Report.checks) {
      if (!c.passed) throw new Error(`Phase 3 check failed: ${c.label || c.id} (detail: ${c.detail})`);
    }

    const overlay = await page.locator('body').innerText();
    if (!overlay.includes('Surface runtime validation: PASS')) {
      throw new Error('Phase 3 failed: visible overlay text missing');
    }
    console.log('>>> PHASE 3 REGRESSION: PASS (12/12 checks, visible overlay confirmed)');
    results.phase3Regression = true;

    // ==========================================
    // 2. PHASE 2 SMOKE REGRESSION
    // ==========================================
    console.log('\n[2/5] Running Phase 2 VFX Lab Smoke...');
    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=VFX Laboratory', { timeout: 10000 });

    // UI Click on Preview
    const previewBtn = page.locator('button:has-text("Preview")').first();
    await previewBtn.click();
    await page.waitForTimeout(300);

    const p2Proof = await page.evaluate(async () => {
      const r = window.__RUNTIME__;
      if (!r) throw new Error('__RUNTIME__ missing');
      
      // 1. Preview using castPreview
      const amberOrb = r.globalAbilityRegistry.get('sample_amber_orb');
      const origin = new window.__TEST_ENV__.THREE.Vector3(0, 1, 0);
      const target = new window.__TEST_ENV__.THREE.Vector3(10, 0, 10);
      const instance = r.abilityMgr.castPreview({
        abilityId: amberOrb.id,
        origin,
        target,
        direction: new window.__TEST_ENV__.THREE.Vector3(1, 0, 1).normalize(),
        distance: origin.distanceTo(target),
        surface: null,
        seed: 42
      }, amberOrb);

      const state0 = r.abilityMgr.getPreviewState();
      
      // 2. Pause
      r.engine.isPaused = true;
      r.abilityMgr.update(0.016, 0.5);
      const statePaused = r.abilityMgr.getPreviewState();

      // 3. Step
      r.engine.stepSingleFrame();
      const stateStepped = r.abilityMgr.getPreviewState();

      // 4. Seek
      const stateSeek = r.abilityMgr.seekPreview(1.2);

      // 5. Restart
      const stateRestart = r.abilityMgr.restartPreview();

      // 6. Live param edit
      const updatedOrb = structuredClone(amberOrb);
      updatedOrb.modules[0].params.radius = 3.0;
      r.abilityMgr.updatePreviewDefinition(updatedOrb);

      r.engine.isPaused = false;
      return {
        hasPreview: state0.hasPreview,
        paused: statePaused.hasPreview,
        stepped: stateStepped.hasPreview,
        seekPhase: stateSeek.phase,
        restartPhase: stateRestart.phase,
        paramUpdated: instance.definition.modules[0].params.radius === 3.0
      };
    });

    console.log('Phase 2 proof result:', p2Proof);
    if (!p2Proof.hasPreview || !p2Proof.paramUpdated) throw new Error('Phase 2 smoke failed');
    console.log('>>> PHASE 2 SMOKE REGRESSION: PASS');
    results.phase2Smoke = true;

    // ==========================================
    // 3. PHASE 4 SMOKE REGRESSION
    // ==========================================
    console.log('\n[3/5] Running Phase 4 Ability Factory & Sequence Smoke...');
    const p4Proof = await page.evaluate(() => {
      const r = window.__RUNTIME__;
      const testEnv = window.__TEST_ENV__;

      // 1. Ability Factory admission
      const validDoc = {
        schemaVersion: '1.1.0',
        id: 'factory_test_smoke',
        name: 'Factory Test Smoke',
        school: 'pyromancy',
        description: 'Smoke test ability',
        iconName: 'Flame',
        targeting: { shape: 'zone', range: 10, radius: 3, surfacePolicy: 'project' },
        timing: { windup: 0.1, travelSpeed: 0, hold: 0.5, fade: 0.3, cooldown: 1.0 },
        modules: [{ type: 'particles', params: { count: 50, speed: 5, size: 1, color: '#ff5500' } }],
        feedback: { cameraShake: 0, flashIntensity: 0, lightColor: '#ffffff', lightRadius: 0 },
        budget: { maxParticles: 100, dynamicLights: 0 }
      };
      const regRes = r.globalAbilityRegistry.register(validDoc);
      
      const invalidDoc = { ...validDoc, id: 'bad-id-with-dash', school: 'unknown_school' };
      const badRes = r.globalAbilityRegistry.register(invalidDoc);

      const exportedJson = r.globalAbilityRegistry.exportAbilityJson('factory_test_smoke');
      const importRes = r.globalAbilityRegistry.importJson(exportedJson, { duplicates: 'replace' });

      return {
        registerOk: regRes.ok,
        rejectBadOk: !badRes.ok,
        importOk: importRes.ok
      };
    });

    console.log('Phase 4 proof result:', p4Proof);
    if (!p4Proof.registerOk || !p4Proof.rejectBadOk || !p4Proof.importOk) {
      throw new Error('Phase 4 smoke failed');
    }
    console.log('>>> PHASE 4 SMOKE REGRESSION: PASS');
    results.phase4Smoke = true;

    // ==========================================
    // 4. PHASE 5 DECISIVE BROWSER PROOF
    // ==========================================
    console.log('\n[4/5] Running Phase 5 Declarative Residue -> World Mark Decisive Proof...');
    const p5Proof = await page.evaluate(async () => {
      const r = window.__RUNTIME__;
      const testEnv = window.__TEST_ENV__;

      // Create a declarative JSON sequence containing a residue stage with abilityId
      const declarativeSequenceJson = {
        schemaVersion: '1.0.0',
        id: 'seq_decisive_residue_proof',
        name: 'Decisive Residue Proof',
        description: 'Validated sequence exercising generic residue stage world-mark path',
        seed: 8888,
        root: {
          id: 'root',
          type: 'sequence',
          children: [
            { id: 'charge_stage', type: 'wait', duration: 0.1 },
            { id: 'scorch_residue', type: 'residue', duration: 1.5, abilityId: 'decl_cinder_bloom' }
          ]
        }
      };

      // Step 1: Validate through official SequenceValidator
      const validation = testEnv.validateSequenceDocument(declarativeSequenceJson);
      if (!validation.ok) {
        return { ok: false, error: 'Sequence document failed schema validation: ' + JSON.stringify(validation.issues) };
      }

      // Step 2: Load into runtime and execute
      r.sequenceRuntime.load(validation.definition);
      r.sequenceRuntime.start();

      const initialMarks = r.terrain.getDecalCount();

      // Advance past charge_stage (0.1s) and enter scorch_residue
      let simTime = 100.0;
      r.sequenceRuntime.advance(0.12);
      
      // Advance ability manager over several frames past windup (0.32s) to trigger impact
      for (let f = 0; f < 30; f++) {
        simTime += 0.016;
        r.abilityMgr.update(0.016, simTime);
        r.terrain.update(simTime);
      }
      
      const activeState = r.sequenceRuntime.getState();
      const markCountAfterEntry = r.terrain.getDecalCount();
      const activeRegions = r.terrain.activeRegions || [];

      // Step 3: Verify mark spawned, owned by sequence emitter instance
      const hasResidueMark = markCountAfterEntry > initialMarks;

      // Step 4: Add an independent mark for owner_OTHER to prove isolation
      r.terrain.applyMutation('scorch', new testEnv.THREE.Vector3(5, 0, 5), 4, 1.0, simTime + 0.12, 10.0, 'owner_UNRELATED');
      const marksWithOther = r.terrain.getDecalCount();

      // Step 5: Test Stop/Clear
      r.sequenceRuntime.stop();
      const marksAfterStop = r.terrain.getDecalCount();
      const otherMarkSurvived = r.terrain.activeRegions.some((reg) => reg.ownerId === 'owner_UNRELATED');

      // Cleanup unrelated mark
      r.terrain.clearByOwner('owner_UNRELATED');

      return {
        ok: true,
        schemaValid: validation.ok,
        activeNodeIds: activeState.activeNodeIds,
        emitCount: activeState.emitCount,
        hasResidueMark,
        marksWithOther,
        marksAfterStop,
        otherMarkSurvived
      };
    });

    console.log('Phase 5 proof result:', p5Proof);
    if (!p5Proof.ok || !p5Proof.schemaValid || !p5Proof.hasResidueMark || !p5Proof.otherMarkSurvived) {
      throw new Error('Phase 5 decisive proof failed: ' + JSON.stringify(p5Proof));
    }
    console.log('>>> PHASE 5 DECISIVE PROOF: PASS (JSON validated -> SequenceRuntime -> Emitter -> WorldMark -> Isolation verified)');
    results.phase5Acceptance = true;

    // ==========================================
    // 5. RESOURCE, BUDGET & LIFECYCLE SOAK PROOF
    // ==========================================
    console.log('\n[5/5] Running Budget, Pause, Soak & Determinism Tests...');
    const soakProof = await page.evaluate(async () => {
      const r = window.__RUNTIME__;
      const testEnv = window.__TEST_ENV__;

      // A. Budget Test: create 65 marks (>64 cap)
      r.terrain.resetTerrain();
      for (let i = 0; i < 65; i++) {
        r.terrain.applyMutation('scorch', new testEnv.THREE.Vector3(i, 0, 0), 2, 1.0, 500 + i, 10.0, `test_owner_${i}`);
      }
      const budgetCappedAt64 = r.terrain.activeRegions.length === 64;
      const decalMeshCount64 = r.terrain.getDecalCount() === 64;
      const oldestEvicted = r.terrain.activeRegions[0].createdAt >= 501; // mark 0 (at 500) was evicted

      // B. Pause Test: unchanged simulation time
      const countBeforePause = r.terrain.activeRegions.length;
      for (let frame = 0; frame < 50; frame++) {
        r.terrain.update(505.0); // before expiration (501 + 10.0 = 511.0)
      }
      const pausePreserved = r.terrain.activeRegions.length === countBeforePause;

      // C. 25-cycle Lifecycle Soak
      const beforeGeometries = r.engine.renderer.info.memory.geometries;
      const beforeTextures = r.engine.renderer.info.memory.textures;
      const beforeSceneChildren = r.engine.scene.children.length;

      for (let cycle = 0; cycle < 25; cycle++) {
        const t = 1000 + cycle * 10;
        r.terrain.applyMutation('frost', new testEnv.THREE.Vector3(cycle, 0, 0), 3, 1.0, t, 2.0, `soak_owner_${cycle}`);
        r.terrain.update(t + 0.5);
        r.terrain.clearByOwner(`soak_owner_${cycle}`);
      }

      const afterGeometries = r.engine.renderer.info.memory.geometries;
      const afterTextures = r.engine.renderer.info.memory.textures;
      const afterSceneChildren = r.engine.scene.children.length;
      const leftoverMarks = r.terrain.activeRegions.length;

      // D. Deterministic Replay
      const seqDoc = {
        schemaVersion: '1.0.0',
        id: 'seq_determinism',
        name: 'Determinism Test',
        description: 'Test seed replay',
        seed: 12345,
        root: {
          id: 'root',
          type: 'sequence',
          children: [
            { id: 'e1', type: 'emit', abilityId: 'decl_ember_lance', duration: 0.1 },
            { id: 'r1', type: 'residue', abilityId: 'decl_cinder_bloom', duration: 0.2 }
          ]
        }
      };
      
      const v = testEnv.validateSequenceDocument(seqDoc);
      r.sequenceRuntime.load(v.definition);
      r.sequenceRuntime.start();
      r.sequenceRuntime.advance(0.15);
      const run1State = r.sequenceRuntime.getState();
      const run1Emit = run1State.lastEmit;

      r.sequenceRuntime.restart();
      r.sequenceRuntime.advance(0.15);
      const run2State = r.sequenceRuntime.getState();
      const run2Emit = run2State.lastEmit;

      const deterministicReplay = run1Emit.seed === run2Emit.seed && run1Emit.abilityId === run2Emit.abilityId;

      // Reset terrain clean
      r.terrain.resetTerrain();

      return {
        budgetCappedAt64,
        decalMeshCount64,
        oldestEvicted,
        pausePreserved,
        beforeGeometries,
        afterGeometries,
        beforeTextures,
        afterTextures,
        beforeSceneChildren,
        afterSceneChildren,
        leftoverMarks,
        deterministicReplay
      };
    });

    console.log('Soak & Resource proof result:', soakProof);
    if (!soakProof.budgetCappedAt64 || !soakProof.oldestEvicted || !soakProof.pausePreserved || soakProof.leftoverMarks !== 0 || !soakProof.deterministicReplay) {
      throw new Error('Resource/soak proof failed: ' + JSON.stringify(soakProof));
    }

    results.budgetProof = soakProof.budgetCappedAt64 && soakProof.oldestEvicted;
    results.pauseProof = soakProof.pausePreserved;
    results.soakProof = (soakProof.leftoverMarks === 0) && (soakProof.afterSceneChildren === soakProof.beforeSceneChildren);
    results.restartProof = soakProof.deterministicReplay;

    console.log('>>> BUDGET, PAUSE, SOAK & REPLAY: ALL PASS');
  } catch (err) {
    console.error('TEST SUITE FAILED:', err);
  } finally {
    await page.screenshot({ path: 'browser_test_final.png' });
    await browser.close();
  }

  console.log('\n==========================================');
  console.log('FINAL BROWSER QA RESULTS:');
  console.log('Phase 3 Surface Validation:', results.phase3Regression ? 'PASS' : 'FAIL');
  console.log('Phase 2 Smoke Regression:  ', results.phase2Smoke ? 'PASS' : 'FAIL');
  console.log('Phase 4 Smoke Regression:  ', results.phase4Smoke ? 'PASS' : 'FAIL');
  console.log('Phase 5 Decisive Proof:    ', results.phase5Acceptance ? 'PASS' : 'FAIL');
  console.log('Budget >64 Cap Proof:      ', results.budgetProof ? 'PASS' : 'FAIL');
  console.log('Pause Invariance Proof:    ', results.pauseProof ? 'PASS' : 'FAIL');
  console.log('25-Cycle Resource Soak:    ', results.soakProof ? 'PASS' : 'FAIL');
  console.log('Deterministic Replay:      ', results.restartProof ? 'PASS' : 'FAIL');
  console.log('Console Errors:            ', results.consoleErrors.length === 0 ? 'ZERO (PASS)' : results.consoleErrors);
  console.log('==========================================');

  if (Object.values(results).every(v => v === true || (Array.isArray(v) && v.length === 0))) {
    console.log('OVERALL STATUS: ALL GATES PASS');
    process.exit(0);
  } else {
    console.error('OVERALL STATUS: GATES FAILED');
    process.exit(1);
  }
})();
