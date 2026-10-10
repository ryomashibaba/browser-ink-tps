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
type V=readonly [number,number,number];
type Witness={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectedTriangleXYZ:V[];observedFiniteSegmentDistanceMeters:number;
 kind:string;spanMeters:number;interiorSpanMeters:number};
type R={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
 originalProjectedXYZ:V[];classification:string;maxPositiveSpanMeters:number;
 maxInteriorSpanMeters:number;touchingOriginalFaceCount:number;
 candidateFacesAfterHalfMeterAABB:number;contactWitnesses:Witness[];
 sourceOnly:boolean;physicalConnectionAuthorized:boolean};
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const length=(a:V)=>Math.sqrt(dot(a,a));
const key=(r:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[]})=>
 r.sourcePartMinFace+':'+r.sourceFace+':'+[...r.originalOBJVertexIds].sort((a,b)=>a-b).join(':');
function bary(p:V,t:V[]):[number,number,number]{
 const [a,b,c]=t,e=sub(b!,a!),f=sub(c!,a!),x=sub(p,a!);
 const ee=dot(e,e),ef=dot(e,f),ff=dot(f,f),pe=dot(x,e),pf=dot(x,f);
 const den=ee*ff-ef*ef;
 if(!(den>1e-16))throw Error('PHASE12W_TRIANGLE_DEGENERATE');
 const v=(ff*pe-ef*pf)/den,w=(ee*pf-ef*pe)/den;
 return [1-v-w,v,w];
}
function clipped(l:V,r:V,margin:number):[number,number]|null{
 let lo=0,hi=1;
 for(let i=0;i<3;i++){
  const d=r[i]-l[i];
  if(Math.abs(d)<1e-15){if(l[i]<margin)return null;continue;}
  const t=(margin-l[i])/d;
  if(d>0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
 }
 return lo>hi+1e-12?null:[Math.max(0,lo),Math.min(1,hi)];
}
function classify(p:V,q:V,tri:V[]){
 const a=tri[0]!,b=tri[1]!,c=tri[2]!;
 const n=cross(sub(b,a),sub(c,a)),nn=length(n);
 if(nn<=1e-12)throw Error('PHASE12W_WITNESS_ZERO_AREA');
 const d0=dot(n,sub(p,a))/nn,d1=dot(n,sub(q,a))/nn;
 if(Math.abs(d0)<=1e-8&&Math.abs(d1)<=1e-8){
  const l=bary(p,tri),r=bary(q,tri),t=clipped(l,r,-1e-9);
  if(!t)return {kind:'NONE',span:0,inside:0};
  const span=Math.max(0,t[1]-t[0])*length(sub(q,p));
  const u=clipped(l,r,1e-9);
  const inside=u?Math.max(0,u[1]-u[0])*length(sub(q,p)):0;
  return {kind:span>1e-6?(inside>1e-6?
   'COPLANAR_FACE_INTERIOR_POSITIVE_SPAN':'COPLANAR_FACE_BOUNDARY_POSITIVE_SPAN'):
   'COPLANAR_POINT_TANGENCY',span,inside};
 }
 if(Math.abs(d0-d1)<1e-15)return {kind:'NONE',span:0,inside:0};
 const t=d0/(d0-d1);
 if(t< -1e-9||t>1+1e-9)return {kind:'NONE',span:0,inside:0};
 const x=p.map((v,i)=>v+t*(q[i]-v)) as unknown as V;
 const bc=bary(x,tri);
 if(Math.min(...bc)< -1e-9)return {kind:'NONE',span:0,inside:0};
 return {kind:t<=1e-9||t>=1-1e-9?'NONCOPLANAR_ENDPOINT_POINT_TOUCH':
    Math.min(...bc)<=1e-9?'NONCOPLANAR_FACE_BOUNDARY_TANGENCY':
    'STRICT_NONCOPLANAR_INTERIOR_PIERCING',span:0,inside:0};
}
describe('T21 Phase12W original complete source 88 coplanar overlap evidence',()=>{
 it('freezes T20 and T21 normal/source-only review geometry',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];expect(all).toHaveLength(22);
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  for(const m of all){expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');}
 });
 it('synthetic: coplanar interior, boundary, point, face piercing, and separated planes',()=>{
  const tri:V[]=[[-1,-1,0],[2,-1,0],[0,2,0]];
  expect(classify([-.2,0,0],[.2,0,0],tri).kind).toBe('COPLANAR_FACE_INTERIOR_POSITIVE_SPAN');
  expect(classify([0,0,-1],[0,0,1],tri).kind).toBe('STRICT_NONCOPLANAR_INTERIOR_PIERCING');
  expect(classify([0,0,-1],[0,0,0],tri).kind).toBe('NONCOPLANAR_ENDPOINT_POINT_TOUCH');
  expect(classify([0,0,.2],[1,0,.2],tri).kind).toBe('NONE');
  const t:V[]=[[0,0,0],[1,0,0],[0,1,0]];
  expect(classify([0,0,0],[1,0,0],t).kind).toBe('COPLANAR_FACE_BOUNDARY_POSITIVE_SPAN');
  expect(classify([-1,0,0],[0,0,0],t).kind).toBe('COPLANAR_POINT_TANGENCY');
 });
 it('crosschecks all 88 original Face/OBJ IDs and recomputes every source witness',()=>{
  const a=process.env.T21_PHASE12W_REPORT_INPUT,b=process.env.T21_PHASE12V_REPORT_INPUT;
  if(!a&&!b){if(process.env.T21_PHASE12W_REQUIRED==='1')throw Error('PHASE12W_WITNESS_INPUT_REQUIRED');return;}
  if(!a||!b||!existsSync(a)||!existsSync(b))throw Error('PHASE12W_WITNESS_OR_V_INPUT_MISSING');
  const w=JSON.parse(readFileSync(a,'utf8')) as {
   version:string;originalSourceSHA256:string;sourceOnly:boolean;reviewOnly:boolean;
   runtimePromotionAuthorized:boolean;physicalWeldOrWalkableFloorProven:boolean;
   originalActiveFacesParsed:number;originalBoundaryEdges:number;phase12VUnresolvedEdges:number;
   unresolvedSourceComponents:number;searchRadiusMeters:number;originalDegenerateFacesSkipped:number;
   exclusiveCounters:Record<string,number>;contactWitnessTypeCounts:Record<string,number>;
   sourceComponentRows:Record<string,number>;rows:R[]};
  const v=JSON.parse(readFileSync(b,'utf8')) as {
   originalSourceSHA256:string;originalActiveFacesParsed:number;originalUnmatchedBoundaryEdges:number;
   rows:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
    originalProjectedXYZ:V[];classification:string}[]};
  expect(w.version).toBe('T21_PHASE12W_FULL_SOURCE_COPLANAR_PROVENANCE_V1');
  expect(w.originalSourceSHA256).toBe(PIN);expect(v.originalSourceSHA256).toBe(PIN);
  expect(w.sourceOnly).toBe(true);expect(w.reviewOnly).toBe(true);
  expect(w.runtimePromotionAuthorized).toBe(false);
  expect(w.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(w.originalActiveFacesParsed).toBe(70396);expect(v.originalActiveFacesParsed).toBe(70396);
  expect(w.originalBoundaryEdges).toBe(524);expect(w.phase12VUnresolvedEdges).toBe(88);
  expect(v.originalUnmatchedBoundaryEdges).toBe(88);expect(w.unresolvedSourceComponents).toBe(8);
  expect(w.searchRadiusMeters).toBe(.5);expect(w.originalDegenerateFacesSkipped).toBe(46);
  expect(w.rows).toHaveLength(88);
  const original=new Map(v.rows.map(x=>[key(x),x])),seen=new Set<string>();
  expect(original.size).toBe(88);
  const kindCount=new Map<string,number>();
  for(const r of w.rows){
   const k=key(r),source=original.get(k);
   expect(source).toBeDefined();expect(seen.has(k)).toBe(false);seen.add(k);
   expect(r.originalProjectedXYZ).toEqual(source!.originalProjectedXYZ);
   expect(source!.classification).toBe('ZERO_DISTANCE_POINT_OR_COPLANAR_CONTACT');
   expect(r.classification).toBe('COPLANAR_FACE_INTERIOR_POSITIVE_SPAN');
   expect(r.maxInteriorSpanMeters).toBeGreaterThan(1e-6);
   expect(r.sourceOnly).toBe(true);expect(r.physicalConnectionAuthorized).toBe(false);
   expect(r.contactWitnesses.length).toBe(r.touchingOriginalFaceCount);
   expect(r.contactWitnesses.length).toBeGreaterThan(0);
   let maxSpan=0,maxInside=0;
   for(const witness of r.contactWitnesses){
    expect(witness.originalFaceIndex).toBeGreaterThanOrEqual(0);
    expect(witness.originalFaceIndex).toBeLessThan(70396);
    expect(witness.originalOBJVertexIds).toHaveLength(3);
    expect(witness.originalProjectedTriangleXYZ).toHaveLength(3);
    expect(witness.observedFiniteSegmentDistanceMeters).toBeLessThanOrEqual(1e-8);
    const check=classify(r.originalProjectedXYZ[0]!,r.originalProjectedXYZ[1]!,
      witness.originalProjectedTriangleXYZ);
    expect(check.kind).toBe(witness.kind);
    expect(check.span).toBeCloseTo(witness.spanMeters,6);
    expect(check.inside).toBeCloseTo(witness.interiorSpanMeters,6);
    kindCount.set(check.kind,(kindCount.get(check.kind)||0)+1);
    maxSpan=Math.max(maxSpan,witness.spanMeters);
    maxInside=Math.max(maxInside,witness.interiorSpanMeters);
   }
   expect(maxSpan).toBeCloseTo(r.maxPositiveSpanMeters,7);
   expect(maxInside).toBeCloseTo(r.maxInteriorSpanMeters,7);
  }
  expect(seen.size).toBe(88);
  expect(w.exclusiveCounters).toMatchObject({COPLANAR_FACE_INTERIOR_POSITIVE_SPAN:88});
  expect(Object.values(w.exclusiveCounters).reduce((a,b)=>a+b,0)).toBe(88);
  for(const [k,v] of kindCount)expect(w.contactWitnessTypeCounts[k]).toBe(v);
  expect(Object.values(w.sourceComponentRows)).toHaveLength(8);
  expect(Object.values(w.sourceComponentRows).every(x=>x===11)).toBe(true);
 });
});
