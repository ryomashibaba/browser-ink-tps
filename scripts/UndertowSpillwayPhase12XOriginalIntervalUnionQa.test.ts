import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';

// Original Float64 source evidence only: no OBJ-ID weld, collision, nav, paint or floors.
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const GAP=1e-8,RECHECK=3e-7;
type V=readonly [number,number,number];
type FaceWitness={originalFaceIndex:number;originalOBJVertexIds:number[];sourceObject:string;
 sourceMaterial:string;originalProjectedTriangleXYZ:V[];kind:string;
 interval?:[number,number];spanMeters:number;interiorSpanMeters:number;
 observedFiniteSegmentDistanceMeters:number};
type SourceRow={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
 originalProjectedXYZ:V[];classification:string;physicalConnectionAuthorized:boolean;
 contactWitnesses:FaceWitness[]};
const subtract=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const size=(v:V)=>Math.sqrt(dot(v,v));
const normalizedIds=(ids:readonly number[])=>[...ids].sort((a,b)=>a-b).join(':');
function sourceKey(x:SourceRow){return x.sourcePartMinFace+':'+x.sourceFace+':'+normalizedIds(x.originalOBJVertexIds);}
// Independent from W's Gram-matrix code: project into the dominant triangle plane.
function sourceClip(p:V,q:V,t:V[]):[number,number]|null{
 const [a,b,c]=t;
 const n=cross(subtract(b!,a!),subtract(c!,a!)),nl=size(n);
 if(!(nl>1e-12))throw Error('PHASE12X_DEGENERATE_SOURCE_NORMAL');
 for(const x of [p,q])if(Math.abs(dot(n,subtract(x,a!))/nl)>1e-8)
  throw Error('PHASE12X_SOURCE_WITNESS_NOT_COPLANAR');
 const discard=[0,1,2].sort((j,k)=>Math.abs(n[k])-Math.abs(n[j]))[0]!;
 const dims=[0,1,2].filter(i=>i!==discard);
 const two=(x:V)=>[x[dims[0]!],x[dims[1]!]] as const;
 const [aa,bb,cc,pp,qq]=[a!,b!,c!,p,q].map(two);
 const area=(u:readonly number[],v:readonly number[],w:readonly number[])=>
  (v[0]-u[0])*(w[1]-u[1])-(v[1]-u[1])*(w[0]-u[0]);
 const D=area(aa,bb,cc);
 if(Math.abs(D)<=1e-12)throw Error('PHASE12X_BAD_PROJECTED_SOURCE_TRIANGLE');
 const bary=(v:readonly number[])=>[area(bb,cc,v)/D,area(cc,aa,v)/D,area(aa,bb,v)/D];
 const left=bary(pp),right=bary(qq);
 let lo=0,hi=1;
 for(let k=0;k<3;k++){
  const change=right[k]!-left[k]!;
  if(Math.abs(change)<1e-15){
   if(left[k]!< -1e-9)return null;
   continue;
  }
  const limit=(-1e-9-left[k]!)/change;
  if(change>0)lo=Math.max(lo,limit);
  else hi=Math.min(hi,limit);
 }
 return lo>hi+1e-12?null:[Math.max(0,lo),Math.min(1,hi)];
}
function joinIntervals(rows:readonly {from:number;to:number}[],tol=GAP){
 let cursor=0,covered=0,overlap=0;
 const gaps:[number,number][]=[];
 for(const x of [...rows].sort((a,b)=>a.from-b.from||a.to-b.to)){
  const a=x.from,b=x.to;
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b>1||a>b)
   throw Error('PHASE12X_INVALID_ORIGINAL_SOURCE_INTERVAL');
  if(a>cursor+tol)gaps.push([cursor,a]);
  overlap+=Math.max(0,Math.min(cursor,b)-a);
  covered+=Math.max(0,b-Math.max(a,cursor));
  cursor=Math.max(cursor,b);
 }
 if(cursor<1-tol)gaps.push([cursor,1]);
 return {noGap:gaps.length===0,gaps,coveredFraction:Math.min(1,covered),overlapFraction:overlap};
}
describe('T21 Phase12X bounded original Face-ID interval union and gap rejection',()=>{
 it('freezes production T20 and T21 124/64/42, all optional original source-only review patches',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];expect(all).toHaveLength(22);
  expect(all.reduce((a,x)=>a+x.originalSourceTriangleCount,0)).toBe(488);
  for(const m of all){expect(m.reviewOnly).toBe(true);
   expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');}
 });
 it('synthetic negative: actual gap, bad interval, overlapping and adjacent ranges',()=>{
  expect(joinIntervals([{from:0,to:.4},{from:.4,to:1}]).noGap).toBe(true);
  expect(joinIntervals([{from:0,to:.4},{from:.4+2e-9,to:1}]).noGap).toBe(true);
  expect(joinIntervals([{from:0,to:.4},{from:.4+2e-5,to:1}]).noGap).toBe(false);
  expect(joinIntervals([{from:0,to:.6},{from:.5,to:1}]).overlapFraction).toBeCloseTo(.1,8);
  expect(joinIntervals([{from:0,to:.8}]).noGap).toBe(false);
  expect(()=>joinIntervals([{from:.9,to:.1}])).toThrow();
  const t:V[]=[[-1,-1,0],[2,-1,0],[0,2,0]];
  expect(sourceClip([-.2,0,0],[.2,0,0],t)).toEqual([0,1]);
 });
 it('source 88/88: independent geometric intervals, mirrored Face-ID provenance, save JSON',()=>{
  const wpath=process.env.T21_PHASE12W_REPORT_INPUT;
  const spath=process.env.T21_PHASE12S_REPORT_INPUT;
  const out=process.env.T21_PHASE12X_REPORT;
  if(!wpath&&!spath&&!out){
   if(process.env.T21_PHASE12X_REQUIRED==='1')throw Error('PHASE12X_DEDICATED_SOURCE_GATE_REQUIRED');
   return;
  }
  if(!wpath||!spath||!out||![wpath,spath].every(existsSync))
   throw Error('PHASE12X_PINNED_SOURCE_EVIDENCE_MISSING');
  const w=JSON.parse(readFileSync(wpath,'utf8')) as {
   version:string;originalSourceSHA256:string;originalActiveFacesParsed:number;
   originalBoundaryEdges:number;phase12VUnresolvedEdges:number;runtimePromotionAuthorized:boolean;
   physicalWeldOrWalkableFloorProven:boolean;rows:SourceRow[]};
  const s=JSON.parse(readFileSync(spath,'utf8')) as {
   originalSourceSHA256:string;originalComponents:number;originalFaces:number;
   originalOBJBoundaryEdges:number;originalClosedBoundaryLoops:number;
   summaries:{minFace:number;mirrorMinFace:number;sourceFaceCount:number}[]};
  expect([w.originalSourceSHA256,s.originalSourceSHA256]).toEqual([PIN,PIN]);
  expect(w.version).toBe('T21_PHASE12W_FULL_SOURCE_COPLANAR_PROVENANCE_V1');
  expect(w.originalActiveFacesParsed).toBe(70396);
  expect(w.originalBoundaryEdges).toBe(524);expect(w.phase12VUnresolvedEdges).toBe(88);
  expect(w.runtimePromotionAuthorized).toBe(false);
  expect(w.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(s.originalComponents).toBe(22);expect(s.originalFaces).toBe(488);
  expect(s.originalOBJBoundaryEdges).toBe(524);expect(s.originalClosedBoundaryLoops).toBe(22);
  expect(w.rows).toHaveLength(88);
  const owner=new Map(s.summaries.map(z=>[z.minFace,z]));
  const originalSet=new Set<string>(),rows=[] as {
   sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
   originalProjectedXYZ:V[];lengthMeters:number;coveringFaceCount:number;
   sourceCoveringFaces:{originalFaceIndex:number;originalOBJVertexIds:number[];
    sourceObject:string;sourceMaterial:string;startFraction:number;
    endFraction:number;spanMeters:number}[];
   noGap:boolean;gapIntervals:[number,number][];overlapFraction:number;
   coveredFraction:number;physicalConnectionAuthorized:false}[];
  const distinctFaces=new Set<number>();let single=0,double=0;
  for(const r of w.rows){
   expect(r.classification).toBe('COPLANAR_FACE_INTERIOR_POSITIVE_SPAN');
   expect(r.physicalConnectionAuthorized).toBe(false);
   expect(owner.get(r.sourcePartMinFace)?.sourceFaceCount).toBe(22);
   const k=sourceKey(r);expect(originalSet.has(k)).toBe(false);originalSet.add(k);
   const length=size(subtract(r.originalProjectedXYZ[1]!,r.originalProjectedXYZ[0]!));
   expect(length).toBeGreaterThan(1e-6);
   const included=[] as {originalFaceIndex:number;originalOBJVertexIds:number[];
    sourceObject:string;sourceMaterial:string;startFraction:number;endFraction:number;spanMeters:number}[];
   for(const face of r.contactWitnesses){
    expect(face.originalFaceIndex).toBeGreaterThanOrEqual(0);
    expect(face.originalFaceIndex).toBeLessThan(70396);
    expect(face.originalFaceIndex).not.toBe(r.sourceFace);
    expect(face.sourceObject).toBe('Fld_Temple01_CellingBase_1__PillarOld00');
    expect(face.sourceMaterial).toBe('Fld_Temple01_PillarOld00');
    expect(face.originalOBJVertexIds).toHaveLength(3);
    if(face.kind!=='COPLANAR_FACE_INTERIOR_POSITIVE_SPAN')continue;
    expect(face.observedFiniteSegmentDistanceMeters).toBeLessThanOrEqual(1e-8);
    const segment=sourceClip(r.originalProjectedXYZ[0]!,r.originalProjectedXYZ[1]!,
      face.originalProjectedTriangleXYZ);
    expect(segment).not.toBeNull();
    expect(face.interval).toBeDefined();
    expect(Math.abs(segment![0]-face.interval![0])).toBeLessThan(3e-7);
    expect(Math.abs(segment![1]-face.interval![1])).toBeLessThan(3e-7);
    expect(Math.abs((segment![1]-segment![0])*length-face.spanMeters)).toBeLessThan(1e-6);
    expect(r.originalOBJVertexIds.filter(id=>face.originalOBJVertexIds.includes(id)).length).toBeLessThan(2);
    included.push({originalFaceIndex:face.originalFaceIndex,originalOBJVertexIds:face.originalOBJVertexIds,
     sourceObject:face.sourceObject,sourceMaterial:face.sourceMaterial,
     startFraction:Number(segment![0].toFixed(12)),endFraction:Number(segment![1].toFixed(12)),
     spanMeters:Number(((segment![1]-segment![0])*length).toFixed(9))});
    distinctFaces.add(face.originalFaceIndex);
   }
   expect(included.length).toBeGreaterThan(0);
   const joined=joinIntervals(included.map(x=>({from:x.startFraction,to:x.endFraction})));
   expect(joined.noGap).toBe(true);expect(joined.gaps).toHaveLength(0);
   expect([1,2]).toContain(included.length);
   if(included.length===1)single++;else double++;
   rows.push({sourcePartMinFace:r.sourcePartMinFace,sourceFace:r.sourceFace,
    originalOBJVertexIds:r.originalOBJVertexIds,originalProjectedXYZ:r.originalProjectedXYZ,
    lengthMeters:Number(length.toFixed(9)),coveringFaceCount:included.length,
    sourceCoveringFaces:included.sort((a,b)=>a.startFraction-b.startFraction||a.originalFaceIndex-b.originalFaceIndex),
    noGap:joined.noGap,gapIntervals:joined.gaps,
    overlapFraction:Number(joined.overlapFraction.toFixed(12)),
    coveredFraction:Number(joined.coveredFraction.toFixed(12)),
    physicalConnectionAuthorized:false});
  }
  expect(originalSet.size).toBe(88);expect(single).toBe(80);expect(double).toBe(8);
  expect(distinctFaces.size).toBe(8);
  const byPart=new Map<number,typeof rows>();
  for(const row of rows){const q=byPart.get(row.sourcePartMinFace)||[];q.push(row);byPart.set(row.sourcePartMinFace,q);}
  expect(byPart.size).toBe(8);
  for(const [part,items] of byPart){
   expect(items).toHaveLength(11);
   const mirror=owner.get(part)?.mirrorMinFace;
   expect(mirror).toBeDefined();
   const paired=byPart.get(mirror!);
   expect(paired).toHaveLength(11);
   const signature=(items:typeof rows)=>items.map(r=>[r.sourceFace-r.sourcePartMinFace,
    r.coveringFaceCount,Number(r.noGap)]).sort((a,b)=>a[0]!-b[0]!);
   expect(signature(items)).toEqual(signature(paired!));
  }
  const data={version:'T21_PHASE12X_PINNED_ORIGINAL_FACE_INTERVAL_UNION_V1',
   originalSourceSHA256:PIN,sourceOnly:true,reviewOnly:true,
   runtimePromotionAuthorized:false,physicalWeldOrWalkableFloorProven:false,
   gameplayCollisionPaintNavScoringAuthority:'NONE',sourceScannedFacesUpstream:70396,
   originalFullOBJRescannedInPhase12X:false,originalOpenBoundaryEdgesUpstream:524,
   edgesIndependentlyRechecked:88,originalSourceComponents:8,gapToleranceFraction:GAP,
   singleFaceFullCoverageEdges:single,twoFaceUnionCoverageEdges:double,edgesWithGap:0,
   mirroredComponentChecks:8,distinctCoveringOriginalFaceIds:distinctFaces.size,rows};
  writeFileSync(out,JSON.stringify(data,null,2));
  console.log('T21_PHASE12X_ORIGINAL_INTERVAL_SOURCE_COVERAGE',JSON.stringify({
   edges:88,single,twoFace:double,distinctOriginalFaces:distinctFaces.size,mirrorChecks:8}));
 });
});
