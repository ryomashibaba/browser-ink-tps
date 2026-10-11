import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const LABELS=['PARTIAL_COLLINEAR_EDGE_OVERLAP','STRICT_TRIANGLE_INTERIOR_PIERCE',
 'ZERO_DISTANCE_POINT_OR_COPLANAR_CONTACT','NEAR_WITHIN_HALF_METER','NONE_WITHIN_HALF_METER'] as const;
type P=readonly [number,number,number];
type W={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectedTriangleXYZ:P[];distanceMeters:number;collinearOverlapMeters:number;
 strictTriangleInteriorPiercing:boolean};
type R={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
 originalProjectedXYZ:P[];classification:string;hasPartialCollinearOverlap:boolean;
 hasStrictTriangleInteriorPiercing:boolean;nearestDistanceMeters:number|null;
 originalTrianglesTestedAfterBBox:number;witnessesFirst5:W[];
 partialOverlapProof:{originalFaceIndex:number;overlapMeters:number}|null;
 interiorPiercingProof:{originalFaceIndex:number}|null;sourceOnly:boolean;gameplayAuthority:string};
const edge=(ids:readonly number[])=>[...ids].sort((a,b)=>a-b).join(':');
const key=(r:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[]})=>
 r.sourcePartMinFace+':'+r.sourceFace+':'+edge(r.originalOBJVertexIds);
const sub=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:P,b:P):P=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const length=(a:P)=>Math.sqrt(dot(a,a));
function overlap(p:P,q:P,a:P,b:P):number{
 const d=sub(q,p),e=sub(b,a),L=length(d),R=length(e);
 if(L<=1e-8||R<=1e-8)return 0;
 if(length(cross(d,e))>1e-8*L*R)return 0;
 if(length(cross(d,sub(a,p)))>1e-8*L||length(cross(d,sub(b,p)))>1e-8*L)return 0;
 const t=[dot(sub(a,p),d)/(L*L),dot(sub(b,p),d)/(L*L)].sort((x,y)=>x-y);
 return Math.max(0,Math.min(1,t[1]!)-Math.max(0,t[0]!))*L;
}
function pierce(p:P,q:P,t:P[]):boolean{
 const [a,b,c]=t,d=sub(q,p),e1=sub(b!,a!),e2=sub(c!,a!);
 const h=cross(d,e2),det=dot(e1,h);
 if(Math.abs(det)<1e-12)return false;
 const inv=1/det,s=sub(p,a!),u=inv*dot(s,h);
 if(u<=1e-9||u>=1-1e-9)return false;
 const v=inv*dot(d,cross(s,e1));
 if(v<=1e-9||u+v>=1-1e-9)return false;
 const tparam=inv*dot(e2,cross(s,e1));
 return tparam>1e-9&&tparam<1-1e-9;
}
describe('T21 Phase12V bounded 88 original-source boundary/triangle evidence',()=>{
 it('preserves T20 and all T21 source-only freeze constraints',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];
  expect(all).toHaveLength(22);
  expect(all.reduce((s,p)=>s+p.originalSourceTriangleCount,0)).toBe(488);
  for(const x of all){expect(x.reviewOnly).toBe(true);
   expect(x.runtimePromotionAuthorized).toBe(false);
   expect(x.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');}
 });
 it('synthetically separates collinear overlap from parallel separation and strict piercing',()=>{
  expect(overlap([0,0,0],[2,0,0],[1,0,0],[3,0,0])).toBeCloseTo(1,7);
  expect(overlap([0,0,0],[2,0,0],[1,1,0],[3,1,0])).toBe(0);
  const t:P[]=[[-1,-1,0],[1,-1,0],[0,1,0]];
  expect(pierce([0,0,-1],[0,0,1],t)).toBe(true);
  expect(pierce([2,2,-1],[2,2,1],t)).toBe(false);
 });
 it('checks all 88 original targets against U source and source-only witness geometry',()=>{
  const vPath=process.env.T21_PHASE12V_REPORT_INPUT,uPath=process.env.T21_PHASE12U_REPORT_INPUT;
  if(!vPath&&!uPath){
   if(process.env.T21_PHASE12V_REQUIRED==='1')throw Error('PHASE12V_SOURCE_GATE_REQUIRED');
   return;
  }
  if(!vPath||!uPath||!existsSync(vPath)||!existsSync(uPath))
   throw Error('PHASE12V_U_OR_V_EVIDENCE_MISSING');
  const v=JSON.parse(readFileSync(vPath,'utf8')) as {
   version:string;originalSourceSHA256:string;originalActiveFacesParsed:number;sourceOnly:boolean;
   reviewOnly:boolean;runtimePromotionAuthorized:boolean;physicalWeldOrWalkableFloorProven:boolean;
   gameplayCollisionPaintNavScoringAuthority:string;originalUnmatchedBoundaryEdges:number;
   originalPartsWithUnmatchedBoundary:number;sourceOriginalWholeBoundaryEdges:number;
   searchRadiusMeters:number;originalTrianglesTestedAfterBBox:number;
   counters:Record<string,number>;perPart:{minFace:number;counts:Record<string,number>}[];
   rows:R[]};
  const u=JSON.parse(readFileSync(uPath,'utf8')) as {
   originalSourceSHA256:string;originalActiveFacesParsed:number;sourceOriginalBoundaryEdges:number;
   rows:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
    originalProjectedXYZ:P[];wholeOriginalClassification:string}[]};
  expect(v.version).toBe('T21_PHASE12V_PINNED_ORIGINAL_88_PARTIAL_EDGE_AND_TRIANGLE_NEIGHBORS_V1');
  expect(v.originalSourceSHA256).toBe(PIN);expect(u.originalSourceSHA256).toBe(PIN);
  expect(v.originalActiveFacesParsed).toBe(70396);expect(u.originalActiveFacesParsed).toBe(70396);
  expect(v.originalUnmatchedBoundaryEdges).toBe(88);
  expect(v.originalPartsWithUnmatchedBoundary).toBe(8);
  expect(v.sourceOriginalWholeBoundaryEdges).toBe(524);
  expect(u.sourceOriginalBoundaryEdges).toBe(524);
  expect(v.searchRadiusMeters).toBe(.5);
  expect(v.sourceOnly).toBe(true);expect(v.reviewOnly).toBe(true);
  expect(v.runtimePromotionAuthorized).toBe(false);
  expect(v.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(v.gameplayCollisionPaintNavScoringAuthority).toBe('NONE');
  const prior=u.rows.filter(r=>r.wholeOriginalClassification==='NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES');
  expect(prior).toHaveLength(88);expect(v.rows).toHaveLength(88);
  expect(v.perPart).toHaveLength(8);
  const source=new Map(prior.map(x=>[key(x),x])),seen=new Set<string>(),counts=new Map<string,number>();
  let examined=0;
  for(const r of v.rows){
   expect(r.sourceOnly).toBe(true);expect(r.gameplayAuthority).toBe('NONE');
   const k=key(r),p=source.get(k);
   expect(p).toBeDefined();expect(seen.has(k)).toBe(false);seen.add(k);
   expect(r.originalProjectedXYZ).toEqual(p!.originalProjectedXYZ);
   expect(LABELS).toContain(r.classification);
   counts.set(r.classification,(counts.get(r.classification)||0)+1);
   examined+=r.originalTrianglesTestedAfterBBox;
   expect(r.originalTrianglesTestedAfterBBox).toBeGreaterThanOrEqual(0);
   expect(r.witnessesFirst5.length).toBeLessThanOrEqual(5);
   if(r.classification==='NONE_WITHIN_HALF_METER'){
    expect(r.nearestDistanceMeters).toBeNull();expect(r.witnessesFirst5).toHaveLength(0);
   }else{
    expect(r.nearestDistanceMeters).not.toBeNull();
    expect(r.nearestDistanceMeters!).toBeGreaterThanOrEqual(0);
    expect(r.nearestDistanceMeters!).toBeLessThanOrEqual(.500000001);
    expect(r.witnessesFirst5.length).toBeGreaterThan(0);
    expect(r.witnessesFirst5[0]!.distanceMeters).toBeCloseTo(r.nearestDistanceMeters!,7);
   }
   if(r.hasPartialCollinearOverlap){
    expect(r.classification).toBe('PARTIAL_COLLINEAR_EDGE_OVERLAP');
    expect(r.partialOverlapProof!.overlapMeters).toBeGreaterThan(0);
   }else expect(r.partialOverlapProof).toBeNull();
   if(r.classification==='STRICT_TRIANGLE_INTERIOR_PIERCE'){
    expect(r.hasStrictTriangleInteriorPiercing).toBe(true);
    expect(r.interiorPiercingProof).not.toBeNull();
   }
   if(r.classification==='NEAR_WITHIN_HALF_METER')
    expect(r.nearestDistanceMeters!).toBeGreaterThan(1e-8);
   if(r.classification==='ZERO_DISTANCE_POINT_OR_COPLANAR_CONTACT')
    expect(r.nearestDistanceMeters!).toBeLessThanOrEqual(1e-8);
   let last=-1;
   for(const w of r.witnessesFirst5){
    expect(w.originalFaceIndex).toBeGreaterThanOrEqual(0);
    expect(w.originalFaceIndex).toBeLessThan(70396);
    expect(w.originalOBJVertexIds).toHaveLength(3);
    expect(w.originalProjectedTriangleXYZ).toHaveLength(3);
    expect(w.originalProjectedTriangleXYZ.every(p=>p.length===3&&p.every(Number.isFinite))).toBe(true);
    expect(w.distanceMeters).toBeGreaterThanOrEqual(0);
    expect(w.distanceMeters).toBeLessThanOrEqual(.500000001);
    expect(w.distanceMeters+1e-8).toBeGreaterThanOrEqual(last);last=w.distanceMeters;
    const verts=w.originalProjectedTriangleXYZ;
    const expected=Math.max(...[0,1,2].map(i=>overlap(r.originalProjectedXYZ[0]!,
      r.originalProjectedXYZ[1]!,verts[i]!,verts[(i+1)%3]!)));
    expect(w.collinearOverlapMeters).toBeCloseTo(expected,6);
    expect(w.strictTriangleInteriorPiercing).toBe(pierce(
     r.originalProjectedXYZ[0]!,r.originalProjectedXYZ[1]!,verts));
   }
  }
  expect(seen.size).toBe(88);expect(examined).toBe(v.originalTrianglesTestedAfterBBox);
  for(const label of LABELS)expect(v.counters[label]||0).toBe(counts.get(label)||0);
  expect(LABELS.reduce((n,s)=>n+(v.counters[s]||0),0)).toBe(88);
  const parts=new Set(v.perPart.map(x=>x.minFace));expect(parts.size).toBe(8);
  for(const r of v.rows)expect(parts.has(r.sourcePartMinFace)).toBe(true);
  for(const item of v.perPart)expect(Object.values(item.counts).reduce((n,x)=>n+x,0))
   .toBe(v.rows.filter(x=>x.sourcePartMinFace===item.minFace).length);
 });
});
