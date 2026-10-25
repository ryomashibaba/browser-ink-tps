import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

// Scope is exactly the QA branch's historical app-edit Actions fanout.
const legacy=[
 "t21-w10b14-real-chrome.yml",
 "t21-w10b15-trusted-input.yml",
 "t21-w10b21-render-ab.yml",
 "t21-w10b51-native-tick-boundary.yml",
 "t21-w10b54-full-practice.yml",
 "t21-w10b56-switchback.yml",
 "t21-w10b57-paint-relay.yml",
 "t21-w10b64-cpu-ink-aim-ab.yml",
 "t21-w10b68-normal-preview-180s.yml",
 "t21-w10b69-manual-preview-toggle.yml",
 "t21-w10b70-owner-180s-comparison.yml",
 "t21-w10b86-source-combat-gate.yml",
 "t21-w10b96-parked-human-detour.yml",
 "t21-w10b99-second-human-lane.yml",
 "t21-w10b100-third-human-lane.yml",
 "t21-w10b107-real-brief-contact.yml",
 "t21-w10b124-real-raised-right-low-continuation.yml",
 "t21-w10b59-full-native-session.yml",
 "t21-f3g-whole-source.yml"
];
const retained=[
 't21-w10b75-live-source-ink-hud.yml',
 't21-f4e103w-qa.yml',
 't21-w10b112-real-human-floor.yml',
 't21-w10b120-genuine-original-touchdown.yml'
];
const read=name=>readFileSync(resolve('.github/workflows',name),'utf8');
const appTriggerLines=s=>s.split('\n').filter(line=>
 /^\s*-\s*(['"])src\/app\/UndertowF3PlayablePreviewApp\.ts\1\s*$/.test(line));
test('B131: 19 historical one-off suites retain manual dispatch and domain triggers',()=>{
 assert.equal(legacy.length,19);
 assert.equal(new Set(legacy).size,19);
 for(const name of legacy){
  const s=read(name);
  assert.ok(s.includes('  workflow_dispatch:'),name+' manual fallback');
  assert.ok(s.includes('    paths:'),name+' push path gating');
  assert.equal(appTriggerLines(s).length,0,name+' must not rerun on every app edit');
  assert.ok(s.split('\n').some(line=>
   /^\s*-\s*(['"])(src\/|scripts\/|tools\/)\S+\1\s*$/.test(line)),
   name+' has a remaining code/script domain path');
  assert.ok(!s.split('\n').some(line=>
   line.trim()===`- '.github/workflows/${name}'`||
   line.trim()===`- ".github/workflows/${name}"`),
   name+' workflow edits should not immediately spawn an expensive historical run');
 }
});
test('B178: generic CPU changes use B64 source-ink validation, not obsolete Chrome fanout',()=>{
 const common="- 'src/ai/CpuAgentSystem.ts'";
 const b64=read('t21-w10b64-cpu-ink-aim-ab.yml');
 assert.ok(b64.includes(common),'retain the real native 130s comparison');
 for(const name of [
  't21-w10b14-real-chrome.yml',
  't21-w10b15-trusted-input.yml',
  't21-w10b86-source-combat-gate.yml'
 ]){
  assert.ok(!read(name).includes(common),
   'historical '+name+' is still manually dispatchable, not on every CPU change');
 }
});

test('B173: shared real CDP driver changes do NOT fan out legacy browser workflows',()=>{
 for(const name of legacy.filter(name=>name!=='t21-w10b59-full-native-session.yml')){
  const s=read(name);
  assert.ok(!s.includes("- 'scripts/t21-f3-browser-smoke.mjs'")&&
   !s.includes('- "scripts/t21-f3-browser-smoke.mjs"'),
   'shared source driver must not auto-trigger historical '+name);
 }
 const b50=read('t21-w10b50-independent-lane.yml');
 assert.ok(!b50.includes("- 'scripts/t21-f3-browser-smoke.mjs'"));
 const full=read('t21-w10b59-full-native-session.yml');
 assert.ok(full.includes("- 'scripts/t21-f3-browser-smoke.mjs'"),
  'real 180s end-to-end test remains the ONE shared driver owner');
 assert.ok(full.includes("T21_B172_ACTIVE_180S: '1'"));
});

test('B131: four important gates still run on preview app integration change',()=>{
 assert.equal(retained.length,4);
 for(const name of retained){
  const s=read(name);
  assert.equal(appTriggerLines(s).length,1,name+' needs genuine app trigger');
  assert.ok(s.includes('workflow_dispatch:'),name+' manually runnable');
 }
 const b75=read(retained[0]);
 assert.ok(b75.includes('npm run build -- --base=/browser-ink-tps/'));
 assert.ok(b75.includes('UndertowF3OriginalEdgeGuidance.test.ts'));
 assert.ok(b75.includes('W10B130OriginalFlatEdge.test.ts'));
 assert.ok(b75.includes("- 'src/app/W10B130OriginalFlatEdge.ts'"));
 assert.ok(b75.includes("- 'src/app/UndertowF3OriginalEdgeGuidance.ts'"));
 assert.ok(b75.includes('t21-w10b131-trigger-matrix.test.mjs'));
 assert.ok(b75.includes('matrix:'));
 assert.ok(b75.includes('aim: [FIXED, SWEEP]'));
 assert.ok(b75.includes('node scripts/t21-w10b75-live-native-ink-hud.mjs'));
 const physical=read(retained[2])+read(retained[3]);
 assert.ok(physical.includes('node scripts/t21-w10b112-genuine-human-floor-walk.mjs'));
 assert.ok(physical.includes('W10B112HumanGroundLedger.test.ts'));
 assert.ok(physical.includes('W10B120OriginalSourceBoundary.test.ts'));
});
test('B131: code-space static gate is independent from official Turf results',()=>{
 const b75=read(retained[0]);
 assert.ok(!b75.includes('productionAuthorized: true'));
 assert.ok(!b75.includes('unrestricted4v4Certified: true'));
 assert.ok(b75.includes('permissions:\n  contents: read'));
});

test('B144: original SourceTraffic changes use consolidated B75 instead of five old Chrome runners',()=>{
 const shared="- 'src/app/UndertowF3SourceTraffic.ts'";
 const b75=read('t21-w10b75-live-source-ink-hud.yml');
 assert.ok(b75.includes(shared));
 assert.ok(b75.includes('UndertowF3SourceTraffic.test.ts'));
 for(const name of [
  't21-w10b15-trusted-input.yml',
  't21-w10b96-parked-human-detour.yml',
  't21-w10b99-second-human-lane.yml',
  't21-w10b100-third-human-lane.yml',
  't21-f4e103w-qa.yml'
 ]){
  const s=read(name);
  assert.ok(!s.split('\n').some(line=>line.trim()===shared));
  assert.ok(s.includes('  workflow_dispatch:'),'keep manual '+name);
 }
});
