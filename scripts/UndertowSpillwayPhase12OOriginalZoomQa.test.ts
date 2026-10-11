import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as RING} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as PARTS} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
const MIRROR_X=.229368288528164,MIRROR_Z=.194564295456822;
const SHA='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
function zoom(side:'LEFT'|'RIGHT'){
 const pieces=PARTS.filter(p=>{
  const x=p.vertices.reduce((s,v)=>s+v[0],0)/p.vertices.length;
  if(!Number.isFinite(x)||Math.abs(x)<.5)throw Error('ambiguous mirror component');
  return side==='LEFT'?x<0:x>0;
 });
 expect(pieces).toHaveLength(4);
 const vertices=pieces.flatMap(p=>p.vertices);
 const low=([0,1,2] as const).map(i=>Math.min(...vertices.map(p=>p[i])));
 const high=([0,1,2] as const).map(i=>Math.max(...vertices.map(p=>p[i])));
 return {pieces,low,high,
   center:low.map((n,i)=>(n+high[i]!)/2),
   distance:Math.max(13.5,Math.max(high[0]!-low[0]!,high[2]!-low[2]!)*1.28)};
}
describe('T21 Phase12O source-only rim/band high-magnification optics',()=>{
 it('keeps canonical T20 production, T21 inactive, 64-source and frozen 42-ring',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(RING).toHaveLength(42);
  expect([...I,...K,...L,...PARTS]).toHaveLength(22);
  expect(PARTS).toHaveLength(8);
  expect(PARTS.every(p=>p.reviewOnly&&!p.runtimePromotionAuthorized&&
    p.gameplayFloorCollisionPaintNavScoringAuthority==='NONE')).toBe(true);
 });
 it('focuses BOTH Y25.1 to25.6 original mirror rims/bands with symmetric tight camera',()=>{
  const left=zoom('LEFT'),right=zoom('RIGHT');
  for(const x of [left,right]){
   expect(x.pieces.filter(p=>p.reviewGroup==='RIM')).toHaveLength(2);
   expect(x.pieces.filter(p=>p.reviewGroup==='BAND')).toHaveLength(2);
   expect(x.low[1]).toBeCloseTo(25.1,9);
   expect(x.high[1]).toBeCloseTo(25.6,9);
   expect(x.distance).toBeGreaterThanOrEqual(13.5);
   expect(x.distance).toBeLessThan(24);
   expect(x.pieces.reduce((s,p)=>s+p.originalSourceTriangleCount,0)).toBe(88);
  }
  expect(left.center[0]!+right.center[0]!).toBeCloseTo(MIRROR_X,5);
  expect(left.center[2]!+right.center[2]!).toBeCloseTo(MIRROR_Z,5);
  expect(left.center[1]).toBeCloseTo(right.center[1]!,9);
  expect(left.distance).toBeCloseTo(right.distance,6);
  expect(left.distance).toBeLessThan(43.251650/1.5);
 });
 it('asserts ALL FOUR opt-in zoom variants, fixed camera, preserve same originals',()=>{
  const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
  const shot=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
  const gate=readFileSync('scripts/t21-review-phase12o-zoom-gate.mjs','utf8');
  expect(app).toContain("private focusPhase12OOriginalDetailZoom(side:'LEFT'|'RIGHT',withDetail:boolean):void");
  expect(app).toContain("this.focusPhase12NMirrorInspection(side,withDetail);");
  expect(app).toContain("this.canvas.dataset.t21ReviewPhase12OZoomSide='off';");
  expect(app).toContain("this.canvas.dataset.t21ReviewPreset='PHASE12O_PINNED_ORIGINAL_DETAIL_ZOOM_ONLY';");
  for(const mode of ['LEFT_BASE','LEFT_WITH','RIGHT_BASE','RIGHT_WITH']){
   expect(app).toContain('data-review-phase12o-zoom="'+mode+'"');
  }
  expect(app).toContain("Math.abs(lo[1]!-25.1)>1e-7");
  expect(app).toContain("Math.abs(hi[1]!-25.6)>1e-7");
  expect(shot).toContain("manifest.phase12OOriginalDetailZoomDiagnostics=[];");
  expect(shot).toContain('T21_PHASE12O_BASE_WITH_ZOOM_CAMERA_CHANGED_');
  expect(gate).toContain("z.changed<b.changed*1.5");
  expect(gate).toContain("CAMERA_NOT_GENUINELY_MAGNIFIED_");
  expect(gate).toContain("INCREASED_REAL_DETAIL_VISIBILITY_NOT_PROVEN_");
  expect(shot).toContain("const views=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];");
  expect(shot).toContain(SHA);
 });
});
