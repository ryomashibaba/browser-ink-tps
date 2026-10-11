import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';

const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const EXPECTED_USED=new Set([13154,13198,63834,63858,
  42926,43102,43448,43624,
  44184,44228,44294,44360,44382,44426,44448,44492]);
const meshes=[...I,...K,...L,...M];
type Face={originalProjectTriangleXYZ:[number,number,number][];};
type Candidate={minFace:number;mirrorOriginalMinFace:number;sourceTriangleCount:number;
 sourceObject:string;sourceMaterial:string;faces:Face[];reviewOnly:boolean;
 runtimePromotionAuthorized:boolean;gameplayAuthority:string};
type Ledger={originalSourceSHA256:string;selectedFullSourceComponentCount:number;
 selectedOriginalTriangleCount:number;selectedFullOriginalSourceComponents:Candidate[];
 reviewOnly:boolean;runtimePromotionAuthorized:boolean;newRenderableComponents:number};
type Gate={originalSourceSHA256:string;sourceOnlyEligibleComponents:number;
 sourceOnlyEligibleMirrorPairs:number;perComponent:{
 minFace:number;mirrorMinFace:number;decision:string;
 originalMirrorVertexMultisetMatched:boolean}[]};
function family(v:Candidate):string{
 const xyz=v.faces.flatMap(f=>f.originalProjectTriangleXYZ);
 const lo=Math.min(...xyz.map(p=>p[1])),hi=Math.max(...xyz.map(p=>p[1]));
 const y=(x:number)=>Math.round(x*1e4)/1e4;
 const name=v.sourceObject.endsWith('__Pillar00')?'Pillar00':
   v.sourceObject.endsWith('__PillarObject01')?'PillarObject01':'OTHER';
 return name+':'+y(lo)+'..'+y(hi);
}
describe('T21 Phase12N exact-original mirror-half optics and 28 unused source candidates',()=>{
 it('freezes T20/T21 and checks all 22 source-only original parts have an EXACT mirror-half split',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);
  expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(meshes).toHaveLength(22);
  for(const side of ['LEFT','RIGHT']){
   const selected=meshes.filter(m=>{
    const x=m.vertices.reduce((v,p)=>v+p[0],0)/m.vertices.length;
    expect(Math.abs(x)).toBeGreaterThan(.5);
    return side==='LEFT'?x<0:x>0;
   });
   expect(selected).toHaveLength(11);
   const prior=[...I,...K,...L].filter(m=>selected.includes(m));
   const details=M.filter(m=>selected.includes(m));
   expect(prior).toHaveLength(7);
   expect(details).toHaveLength(4);
   expect(prior.reduce((s,m)=>s+m.vertices.length/3,0)).toBe(156);
   expect(details.reduce((s,m)=>s+m.vertices.length/3,0)).toBe(88);
   expect(selected.reduce((s,m)=>s+m.vertices.length/3,0)).toBe(244);
   // Both WITH and BASE camera views must derive their target solely from
   // these SAME 11 source vertices; even BASE never discards detail extents.
  }
  expect(meshes.every(m=>m.reviewOnly&&!m.runtimePromotionAuthorized)).toBe(true);
 });
 it('pins UI mode names, OFF normal presets, provenance-only display and same-camera capture QA',()=>{
  const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
  const capture=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
  const gate=readFileSync('scripts/t21-review-phase12n-mirror-gate.mjs','utf8');
  expect(app).toContain("private focusPhase12NMirrorInspection(side:'LEFT'|'RIGHT',withDetail:boolean):void");
  expect(app).toContain("this.canvas.dataset.t21ReviewPhase12NSide='off';");
  expect(app).toContain("this.canvas.dataset.t21ReviewPhase12NCameraKey='off';");
  expect(app).toContain("this.canvas.dataset.t21ReviewPreset='PHASE12N_LOCKED_ORIGINAL_MIRROR_SIDE_ONLY';");
  for(const x of ['LEFT_BASE','LEFT_WITH','RIGHT_BASE','RIGHT_WITH']){
   expect(app).toContain('data-review-phase12n-inspect="'+x+'"');
  }
  expect(capture).toContain("manifest.phase12NMirrorComparisonDiagnostics=[];");
  expect(capture).toContain("for(const side of ['LEFT','RIGHT'])");
  expect(capture).toContain("for(const detail of ['BASE','WITH'])");
  expect(capture).toContain('T21_PHASE12N_CAMERA_MISMATCH_BETWEEN_BASE_AND_WITH_');
  expect(gate).toContain("fail('CAMERA_CHANGED_WITHIN_'+side)");
  expect(gate).toContain("fail('DUPLICATE_OR_WRONG_HASH_'+expected)");
  expect(capture).toContain("const views=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];");
 });
 it('classifies, but DOES NOT RENDER, all 28 remaining Phase12J original mirror candidates',()=>{
  const source=process.env.T21_PHASE12J_SOURCE_JSON;
  const report=process.env.T21_PHASE12J_GATE_REPORT;
  if(!source&&!report)return;
  if(!source||!report||!existsSync(source)||!existsSync(report))
   throw Error('PHASE12N_PINNED_ORIGINAL_JSON_OR_GATE_MISSING');
  const j=JSON.parse(readFileSync(source,'utf8')) as Ledger;
  const g=JSON.parse(readFileSync(report,'utf8')) as Gate;
  expect(j.originalSourceSHA256).toBe(PIN);
  expect(g.originalSourceSHA256).toBe(PIN);
  expect(j.selectedFullSourceComponentCount).toBe(44);
  expect(j.selectedOriginalTriangleCount).toBe(972);
  expect(j.reviewOnly).toBe(true);
  expect(j.runtimePromotionAuthorized).toBe(false);
  expect(j.newRenderableComponents).toBe(0);
  expect(g.sourceOnlyEligibleComponents).toBe(44);
  expect(g.sourceOnlyEligibleMirrorPairs).toBe(22);
  const selected=j.selectedFullOriginalSourceComponents;
  const sourceByFace=new Map(selected.map(x=>[x.minFace,x]));
  expect(sourceByFace.size).toBe(44);
  for(const mesh of [...K,...L,...M])expect(sourceByFace.has(mesh.originalMinFace)).toBe(true);
  const remaining=selected.filter(x=>!EXPECTED_USED.has(x.minFace));
  expect(remaining).toHaveLength(28);
  const counts=new Map<string,number>();
  const eligibility=new Map(g.perComponent.map(x=>[x.minFace,x]));
  for(const item of remaining){
   const twin=sourceByFace.get(item.mirrorOriginalMinFace);
   expect(twin).toBeDefined();
   expect(twin!.mirrorOriginalMinFace).toBe(item.minFace);
   expect(EXPECTED_USED.has(twin!.minFace)).toBe(false);
   expect(item.reviewOnly).toBe(true);
   expect(item.runtimePromotionAuthorized).toBe(false);
   expect(item.gameplayAuthority).toBe('NONE');
   expect(item.sourceTriangleCount).toBe(22);
   const q=eligibility.get(item.minFace);
   expect(q?.decision).toBe('OPTIONAL_SOURCE_VISUAL_REVIEW_CANDIDATE_ONLY');
   expect(q?.originalMirrorVertexMultisetMatched).toBe(true);
   const key=family(item);
   counts.set(key,(counts.get(key)||0)+1);
  }
  expect([...counts.entries()].sort()).toEqual([
   ['Pillar00:21.4..21.8',4],['Pillar00:21.8..21.8',4],
   ['Pillar00:21.8..22.3',4],['Pillar00:22.3..22.3',4],
   ['PillarObject01:25.1..25.1',4],
   ['PillarObject01:26.2..26.2',4],
   ['PillarObject01:26.2..26.7',4]
  ]);
  expect(remaining.reduce((s,x)=>s+x.sourceTriangleCount,0)).toBe(616);
 });
});
