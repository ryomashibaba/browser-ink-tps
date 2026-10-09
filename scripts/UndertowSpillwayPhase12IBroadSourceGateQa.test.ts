import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import type {StageVector3} from '../src/stage/StageDefinition';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as RING} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES} from '../src/stage/undertow/UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES} from '../src/stage/undertow/UndertowSpillwaySourceNativeSupplementGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES} from '../src/stage/undertow/UndertowSpillwaySourceNativePhase1Geometry';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES} from '../src/stage/undertow/UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayBroadStaticSourceGeometry';
import {UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES} from '../src/stage/undertow/UndertowSpillwayFlankElevationPhase4Geometry';
import {UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES} from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import {UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES} from '../src/stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import {UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import {UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import {UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES} from '../src/stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';

type XYZ=readonly [number,number,number];
type XY=readonly [number,number];
type Face={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type Candidate={sourceComponentKey:string;sourceObject:string;sourceMaterial:string;
 originalMinFace:number;originalMirrorMinFace:number;originalTriangleCount:number;
 original3DAreaSquareMeters:number;originalXYZBounds:number[];originalXYZExtents:number[];
 originalUniqueOBJVertexCount:number;componentFaceAndOriginalOBJVertexIDHash:string;
 faces:Face[];runtimePromotionAuthorized:false;};
type Source={version:string;originalSourceSHA256:string;originalSourceBytes:number;
 originalActiveFaceCount:number;originalCandidateMirrorPairCount:number;
 originalCandidateComponentCount:number;originalCandidateTriangleCount:number;
 candidateSourceMirroredComponents:Candidate[];reviewOnly:true;runtimePromotionAuthorized:false};
type SourceMesh={vertices:readonly StageVector3[]};
const REVIEW124:readonly SourceMesh[]=[
 ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
 ...UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,...UNDERTOW_T21_SOURCE_BATCH2_MESHES,
 ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES,...UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES,
 ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES,...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES,
 ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES,...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES
];
const ALREADY_12:readonly SourceMesh[]=[
 ...UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES
];
const q=(point:readonly number[])=>point.map(x=>Math.round(x*1e7)).join(',');
function bits(v:readonly number[]):string{
 const b=Buffer.alloc(v.length*8);v.forEach((x,i)=>b.writeDoubleLE(x,i*8));return b.toString('hex');
}
function triKey(points:readonly XYZ[],near=false){
 return points.map(x=>near?q(x):bits(x)).sort().join('|');
}
function inside(p:XY):boolean{
 let has=false;
 for(let i=0,j=RING.length-1;i<RING.length;j=i++){
  const a=RING[j]!,b=RING[i]!;
  const cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const dp=(p[0]-a[0])*(p[0]-b[0])+(p[1]-a[1])*(p[1]-b[1]);
  if(Math.abs(cross)<1e-8&&dp<=1e-8)return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&
    p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])has=!has;
 }
 return has;
}
function orient(a:XY,b:XY,c:XY):number{
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
}
function crossesProperly(a:XY,b:XY,c:XY,d:XY):boolean{
 const e=1e-9;
 const x=orient(a,b,c),y=orient(a,b,d),u=orient(c,d,a),v=orient(c,d,b);
 return ((x>e&&y< -e)||(x< -e&&y>e))&&
        ((u>e&&v< -e)||(u< -e&&v>e));
}
function strictlyInsideTriangle(p:XY,tri:readonly XY[]):boolean{
 const [a,b,c]=tri;const s=[orient(a,b,p),orient(b,c,p),orient(c,a,p)];
 return s.every(v=>v>1e-8)||s.every(v=>v< -1e-8);
}
function sampledXZ(t:readonly XYZ[]):XY[]{
 const [a,b,c]=t;
 return [[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
 [(a[0]+b[0])/2,(a[2]+b[2])/2],[(a[0]+c[0])/2,(a[2]+c[2])/2],
 [(b[0]+c[0])/2,(b[2]+c[2])/2],
 [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
}
function xzViolation(t:readonly XYZ[]):{outsideSamples:number;ringCrossings:number;enclosedRingPoints:number}{
 const seven=sampledXZ(t);
 const xyz:XY[]=[seven[0]!,seven[1]!,seven[2]!];
 let crossing=0;
 for(let i=0;i<3;i++){
  const a=xyz[i]!,b=xyz[(i+1)%3]!;
  for(let j=0;j<RING.length;j++)
   if(crossesProperly(a,b,RING[j]!,RING[(j+1)%RING.length]!))crossing++;
 }
 const enclosing=RING.filter(v=>strictlyInsideTriangle(v,xyz)).length;
 return {outsideSamples:seven.filter(x=>!inside(x)).length,
   ringCrossings:crossing,enclosedRingPoints:enclosing};
}
function originalMirror(a:Candidate,b:Candidate):boolean{
 if(a===b||a.sourceMaterial!==b.sourceMaterial||a.originalTriangleCount!==b.originalTriangleCount||
    a.originalUniqueOBJVertexCount!==b.originalUniqueOBJVertexCount||
    Math.abs(a.original3DAreaSquareMeters-b.original3DAreaSquareMeters)>0.0001)return false;
 const unique=(c:Candidate):XYZ[]=>{
  const m=new Map<number,XYZ>();
  for(const f of c.faces)f.originalOBJVertexIds.forEach((id,i)=>m.set(id,f.originalProjectTriangleXYZ[i]!));
  return [...m.values()];
 };
 const aa=unique(a),bb=unique(b);
 if(aa.length!==bb.length)return false;
 const used=new Set<number>();
 for(const p of aa){
  let ix=-1,closest=.0002;
  for(let i=0;i<bb.length;i++){
   if(used.has(i))continue;
   const q=bb[i]!;
   const error=Math.hypot(p[0]+q[0]-0.229368288528164,p[1]-q[1],
     p[2]+q[2]-0.194564295456822);
   if(error<closest){closest=error;ix=i;}
  }
  if(ix<0)return false;used.add(ix);
 }
 return used.size===aa.length;
}
describe('T21 Phase12I full big-original-static source mirror, overlap and hard-XZ gate',()=>{
 it('protects 124 normal, 8+4 opt-in mesh count and nonactivated T20/T21 gameplay',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(REVIEW124).toHaveLength(124);
  expect(ALREADY_12).toHaveLength(12);
  expect(RING).toHaveLength(42);
 });
 it('audits every source candidate against 136 original render components and full triangle/polygon geometry',()=>{
  const path=process.env.T21_PHASE12I_SOURCE_JSON;
  if(!path)return;
  if(!existsSync(path))throw Error('Phase12I original candidate survey missing in pinned CI');
  const s=JSON.parse(readFileSync(path,'utf8')) as Source;
  expect(s).toMatchObject({
   version:'T21_PHASE12I_WHOLE_STATIC_ORIGINAL_COMPONENT_MIRROR_SURVEY_V1',
   originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
   originalSourceBytes:43263289,originalActiveFaceCount:70396,
   reviewOnly:true,runtimePromotionAuthorized:false
  });
  expect(s.originalCandidateComponentCount).toBe(s.originalCandidateMirrorPairCount*2);
  expect(s.candidateSourceMirroredComponents).toHaveLength(s.originalCandidateComponentCount);
  const existing=[...REVIEW124,...ALREADY_12];
  const seenExact=new Set<string>(),seenNear=new Set<string>();
  for(const mesh of existing){
   expect(mesh.vertices.length%3).toBe(0);
   for(let i=0;i<mesh.vertices.length;i+=3){
    const t=mesh.vertices.slice(i,i+3) as XYZ[];
    seenExact.add(triKey(t));seenNear.add(triKey(t,true));
   }
  }
  const lookup=new Map(s.candidateSourceMirroredComponents.map(c=>[c.originalMinFace,c]));
  expect(lookup.size).toBe(s.originalCandidateComponentCount);
  const counts:Record<string,number>={};
  const perComponent=[];
  const usedSourceFaceIDs=new Set<number>();
  let checkedTriangles=0;
  for(const c of s.candidateSourceMirroredComponents){
   const mate=lookup.get(c.originalMirrorMinFace);
   expect(mate).toBeDefined();
   const mirror=originalMirror(c,mate!);
   expect(c.faces).toHaveLength(c.originalTriangleCount);
   expect(c.sourceObject.startsWith('Fld_Temple01_')).toBe(true);
   expect(c.sourceMaterial).not.toContain('StageSide');
   expect(c.runtimePromotionAuthorized).toBe(false);
   let totalOut=0,totalCross=0,totalEnclosed=0,duplicatesExact=0,duplicatesNear=0;
   let sourceArea=0;
   for(const f of c.faces){
    expect(usedSourceFaceIDs.has(f.originalFaceIndex)).toBe(false);
    usedSourceFaceIDs.add(f.originalFaceIndex);
    expect(f.originalOBJVertexIds).toHaveLength(3);
    expect(f.originalProjectTriangleXYZ).toHaveLength(3);
    const t=f.originalProjectTriangleXYZ;
    checkedTriangles++;
    duplicatesExact+=Number(seenExact.has(triKey(t)));
    duplicatesNear+=Number(seenNear.has(triKey(t,true)));
    const [a,b,d]=t;
    const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
    const v=[d[0]-a[0],d[1]-a[1],d[2]-a[2]];
    sourceArea+=Math.hypot(u[1]!*v[2]!-u[2]!*v[1]!,
      u[2]!*v[0]!-u[0]!*v[2]!,u[0]!*v[1]!-u[1]!*v[0]!)/2;
    const xz=xzViolation(t);
    totalOut+=xz.outsideSamples;totalCross+=xz.ringCrossings;totalEnclosed+=xz.enclosedRingPoints;
   }
   expect(sourceArea).toBeCloseTo(c.original3DAreaSquareMeters,7);
   const decision=(!mirror)?'HOLD_MIRROR_NOT_EXACT':
       (totalOut||totalCross||totalEnclosed)?'HOLD_FROZEN_42_XZ_CROSSING':
       (duplicatesExact||duplicatesNear)?'HOLD_EXACT_OR_NEAR_EXISTING_136_SOURCE':
       'SOURCE_ONLY_OPTIONAL_REVIEW_CANDIDATE';
   counts[decision]=(counts[decision]||0)+1;
   perComponent.push({sourceComponentKey:c.sourceComponentKey,
    sourceObject:c.sourceObject,sourceMaterial:c.sourceMaterial,
    originalMinFace:c.originalMinFace,originalMirrorMinFace:c.originalMirrorMinFace,
    originalTriangleCount:c.originalTriangleCount,
    original3DAreaSquareMeters:c.original3DAreaSquareMeters,
    originalXYZBounds:c.originalXYZBounds,
    mirrorFullOriginalVertexIDMultisetMatched:mirror,
    originalHardXZOutsideSampleCount:totalOut,
    originalHardXZProperEdgeCrossings:totalCross,
    originalHardXZBoundaryVerticesEnclosedInTriangleCount:totalEnclosed,
    exactDisplayedTriangleDuplicates:duplicatesExact,
    nearDisplayedTriangleDuplicates:duplicatesNear,
    decision,gameplayAuthority:'NONE',runtimePromotionAuthorized:false});
  }
  expect(checkedTriangles).toBe(s.originalCandidateTriangleCount);
  expect(usedSourceFaceIDs.size).toBe(checkedTriangles);
  const eligible=perComponent.filter(x=>x.decision==='SOURCE_ONLY_OPTIONAL_REVIEW_CANDIDATE');
  const bothEligible=eligible.filter(c=>
    eligible.some(x=>x.originalMinFace===c.originalMirrorMinFace));
  const report={version:'T21_PHASE12I_INDEPENDENT_136_EXISTING_SOURCE_AND_FULL_HARD_XZ_GATE_V1',
    originalSourceSHA256:s.originalSourceSHA256,originalSourceBytes:s.originalSourceBytes,
    frozenOriginalFullSourceMeshes:124,previousOptInOriginalMeshes:12,
    frozenHardXZBoundaryPointCount:RING.length,
    sourceReviewOriginalComponents:s.originalCandidateComponentCount,
    sourceReviewOriginalTriangleCount:checkedTriangles,
    sourceOnlyEligibleCompleteMirroredPairs:bothEligible.length/2,
    sourceOnlyEligibleComponents:bothEligible.length,
    decisionCounts:counts,perComponent,
    sourceOnly:true,gameplayAuthority:'NONE',runtimePromotionAuthorized:false};
  if(process.env.T21_PHASE12I_GATE_REPORT)
    writeFileSync(process.env.T21_PHASE12I_GATE_REPORT,JSON.stringify(report,null,2));
  console.log('T21_PHASE12I_ORIGINAL_BROAD_STRUCTURE_GATE',JSON.stringify({
    totals:report.decisionCounts,verifiedPairs:report.sourceOnlyEligibleCompleteMirroredPairs,
    eligible:bothEligible.map(x=>({originalMinFace:x.originalMinFace,
      mirror:x.originalMirrorMinFace,material:x.sourceMaterial,triangles:x.originalTriangleCount,
      area3D:x.original3DAreaSquareMeters}))}));
  expect(perComponent).toHaveLength(s.originalCandidateComponentCount);
 });
});
