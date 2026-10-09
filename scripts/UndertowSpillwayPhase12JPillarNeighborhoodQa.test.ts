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
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as PILLARS} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';

type XYZ=readonly [number,number,number];
type XZ=readonly [number,number];
type ObjFace={originalFaceIndex:number;originalOBJVertexIds:number[];originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type Candidate={minFace:number;mirrorOriginalMinFace:number;sourceComponentKey:string;
 sourceObject:string;sourceMaterial:string;sourceTriangleCount:number;
 originalOBJUniqueVertexCount:number;sourceProjectXYZBounds:number[];
 originalTriangleArea3DSquareMeters:number;
 closestApprovedPillarMinFace:number;closestOriginalVertexToPillarMeters:number;
 allNearbyApprovedPillars:{minOriginalFace:number;minimumVertexDistanceMeters:number}[];
 originalSourceComponentFaceAndOBJVertexIDHash:string;
 faces:ObjFace[];reviewOnly:true;runtimePromotionAuthorized:false;gameplayAuthority:'NONE'};
type Ledger={version:string;originalSourceSHA256:string;originalSourceBytes:number;
 originalActiveFaceCount:number;approvedPillarOriginalMinFaces:number[];
 approvedPillarComponentCount:number;frozenDefaultReviewSourceMeshes:number;
 previousOptionalReviewSourceMeshes:number;searchOriginalVertexRadiusMeters:number;
 originalNearbyComponentCount:number;originalUniqueMirrorPairsNearPillars:number;
 selectedMirrorPairIds:number[][];selectedFullSourceComponentCount:number;
 selectedOriginalTriangleCount:number;selectedFullOriginalSourceComponents:Candidate[];
 reviewOnly:true;runtimePromotionAuthorized:false;newRenderableComponents:0;
 sourceDoesNotImplyAttachment:true;sourceDoesNotImplyCappedClosedPillar:true;
 sourceNotGameplayCollisionPaintNavOrFloor:true};
type Mesh={vertices:readonly StageVector3[]};
const DEFAULT124:readonly Mesh[]=[
 ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
 ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
 ...UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,
 ...UNDERTOW_T21_SOURCE_BATCH2_MESHES,
 ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES,
 ...UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES,
 ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES,
 ...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES,
 ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES
];
const EXISTING142:readonly Mesh[]=[...DEFAULT124,
 ...UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES,...PILLARS];
const PILLAR_IDS=[12934,12956,13110,13132,13176,13220];
const MIRROR_X=.229368288528164,MIRROR_Z=.194564295456822;
function bytes(p:readonly number[]):string{
 const b=Buffer.alloc(p.length*8);
 p.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b.toString('hex');
}
function exactTri(p:readonly XYZ[]):string{return p.map(bytes).sort().join('|');}
function nearTri(p:readonly XYZ[]):string{
 return p.map(v=>v.map(x=>Math.round(x*1e7)).join(',')).sort().join('|');
}
function inside(p:XZ):boolean{
 let ok=false;
 for(let i=0,j=RING.length-1;i<RING.length;j=i++){
  const a=RING[j]!,b=RING[i]!;
  const cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const dot=(p[0]-a[0])*(p[0]-b[0])+(p[1]-a[1])*(p[1]-b[1]);
  if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&
      p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])ok=!ok;
 }
 return ok;
}
function orient(a:XZ,b:XZ,c:XZ):number{
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
}
function crosses(a:XZ,b:XZ,c:XZ,d:XZ):boolean{
 const e=1e-9,s1=orient(a,b,c),s2=orient(a,b,d),
   t1=orient(c,d,a),t2=orient(c,d,b);
 return ((s1>e&&s2< -e)||(s1< -e&&s2>e))&&
        ((t1>e&&t2< -e)||(t1< -e&&t2>e));
}
function triangleContainsStrictly(p:XZ,t:readonly XZ[]):boolean{
 const x=[orient(t[0]!,t[1]!,p),orient(t[1]!,t[2]!,p),
          orient(t[2]!,t[0]!,p)];
 return x.every(v=>v>1e-8)||x.every(v=>v< -1e-8);
}
function triangleXZChecks(t:readonly XYZ[]){
 const [a,b,c]=t;
 const u=[a,b,c] as const;
 const xz:XZ[]=u.map(v=>[v[0],v[2]]);
 const sampled:XZ[]=[...xz,
   [(a[0]+b[0])/2,(a[2]+b[2])/2],
   [(a[0]+c[0])/2,(a[2]+c[2])/2],
   [(b[0]+c[0])/2,(b[2]+c[2])/2],
   [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
 let crossing=0;
 for(let i=0;i<3;i++)for(let j=0;j<RING.length;j++)
   if(crosses(xz[i]!,xz[(i+1)%3]!,RING[j]!,RING[(j+1)%RING.length]!))crossing++;
 return {outside:sampled.filter(x=>!inside(x)).length,crossing,
   enclosed:RING.filter(p=>triangleContainsStrictly(p,xz)).length};
}
function uniqueVerts(c:Candidate):XYZ[]{
 const v=new Map<number,XYZ>();
 for(const f of c.faces)
   f.originalOBJVertexIds.forEach((id,i)=>v.set(id,f.originalProjectTriangleXYZ[i]!));
 return [...v.values()];
}
function mirror(a:Candidate,b:Candidate):boolean{
 if(a===b||a.sourceMaterial!==b.sourceMaterial||
    a.sourceTriangleCount!==b.sourceTriangleCount||
    a.originalOBJUniqueVertexCount!==b.originalOBJUniqueVertexCount||
    Math.abs(a.originalTriangleArea3DSquareMeters-b.originalTriangleArea3DSquareMeters)>0.0005)
   return false;
 const pa=uniqueVerts(a),pb=uniqueVerts(b);
 if(pa.length!==pb.length)return false;
 const used=new Set<number>();
 for(const v of pa){
   let nearest=-1,error=0.0002;
   for(let i=0;i<pb.length;i++){
     if(used.has(i))continue;
     const w=pb[i]!;
     const distance=Math.hypot(v[0]+w[0]-MIRROR_X,v[1]-w[1],v[2]+w[2]-MIRROR_Z);
     if(distance<error){nearest=i;error=distance;}
   }
   if(nearest<0)return false;
   used.add(nearest);
 }
 return used.size===pa.length;
}
function area(t:readonly XYZ[]):number{
 const [a,b,c]=t;
 const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
 const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
 return Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;
}
function sourceVertexPillarDistance(points:readonly XYZ[]):{face:number,distance:number}{
 let best=Infinity,face=-1;
 for(const pillar of PILLARS){
   for(const a of points)for(const b of pillar.vertices){
     const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
     if(d<best-1e-12||(Math.abs(d-best)<=1e-12&&pillar.originalMinFace<face)){
       best=d;face=pillar.originalMinFace;
     }
   }
 }
 return {face,distance:best};
}
describe('T21 Phase12J independent source pillar neighborhood geometry/provenance safety',()=>{
 it('protects 64/124/142 inventories, 42-point outer boundary and T20 production',()=>{
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
   expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
   expect(DEFAULT124).toHaveLength(124);
   expect(UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES).toHaveLength(8);
   expect(UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES).toHaveLength(4);
   expect(PILLARS).toHaveLength(6);expect(EXISTING142).toHaveLength(142);
   expect(RING).toHaveLength(42);
 });
 it('rejects ungrounded original surface and independently classifies all source triangles',()=>{
   const file=process.env.T21_PHASE12J_SOURCE_JSON;
   if(!file)return;
   if(!existsSync(file))throw Error('Mandatory Phase12J pinned source ledger missing');
   const s=JSON.parse(readFileSync(file,'utf8')) as Ledger;
   expect(s).toMatchObject({
     version:'T21_PHASE12J_SIX_PILLAR_NEARBY_ORIGINAL_STATIC_PARTS_V1',
     originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
     originalSourceBytes:43263289,originalActiveFaceCount:70396,
     approvedPillarOriginalMinFaces:PILLAR_IDS,approvedPillarComponentCount:6,
     frozenDefaultReviewSourceMeshes:124,previousOptionalReviewSourceMeshes:18,
     searchOriginalVertexRadiusMeters:0.85,
     reviewOnly:true,runtimePromotionAuthorized:false,newRenderableComponents:0,
     sourceDoesNotImplyAttachment:true,
     sourceDoesNotImplyCappedClosedPillar:true,
     sourceNotGameplayCollisionPaintNavOrFloor:true
   });
   expect(s.selectedFullSourceComponentCount).toBe(s.selectedMirrorPairIds.length*2);
   expect(s.selectedFullSourceComponentCount).toBeLessThanOrEqual(44);
   expect(s.selectedOriginalTriangleCount).toBeLessThanOrEqual(2000);
   expect(s.selectedFullOriginalSourceComponents).toHaveLength(s.selectedFullSourceComponentCount);
   const existingExact=new Set<string>(),existingNear=new Set<string>();
   for(const c of EXISTING142){
     expect(c.vertices.length%3).toBe(0);
     for(let i=0;i<c.vertices.length;i+=3){
       const t=c.vertices.slice(i,i+3) as XYZ[];
       existingExact.add(exactTri(t));existingNear.add(nearTri(t));
     }
   }
   const lookup=new Map(s.selectedFullOriginalSourceComponents.map(c=>[c.minFace,c]));
   expect(lookup.size).toBe(s.selectedFullSourceComponentCount);
   const faceIds=new Set<number>(),decisions:Record<string,number>={};
   const rows=[];
   let totalFaces=0;
   for(const c of s.selectedFullOriginalSourceComponents){
     const b=lookup.get(c.mirrorOriginalMinFace);
     expect(b).toBeDefined();
     expect(b!.mirrorOriginalMinFace).toBe(c.minFace);
     const matchedMirror=mirror(c,b!);
     expect(c.sourceObject.startsWith('Fld_Temple01_')).toBe(true);
     expect(c.sourceObject).not.toContain('PntSet');
     expect(c.sourceMaterial).not.toContain('StageSide');
     expect(c.reviewOnly).toBe(true);expect(c.runtimePromotionAuthorized).toBe(false);
     expect(c.gameplayAuthority).toBe('NONE');
     expect(c.faces).toHaveLength(c.sourceTriangleCount);
     const unique=uniqueVerts(c);
     expect(unique.length).toBe(c.originalOBJUniqueVertexCount);
     const nearest=sourceVertexPillarDistance(unique);
     expect(nearest.distance).toBeCloseTo(c.closestOriginalVertexToPillarMeters,9);
     expect(nearest.distance).toBeLessThanOrEqual(0.8500000001);
     expect(PILLAR_IDS).toContain(c.closestApprovedPillarMinFace);
     const originalKey=c.sourceObject+'|'+c.sourceMaterial+'|original-minface-'+c.minFace;
     expect(c.sourceComponentKey).toBe(originalKey);
     let outside=0,crossing=0,enclosed=0,duplicates=0,nearDupes=0,areaSum=0;
     for(const f of c.faces){
       totalFaces++;
       expect(faceIds.has(f.originalFaceIndex)).toBe(false);
       faceIds.add(f.originalFaceIndex);
       expect(f.originalOBJVertexIds).toHaveLength(3);
       expect(f.originalProjectTriangleXYZ).toHaveLength(3);
       for(const v of f.originalProjectTriangleXYZ)expect(v.every(Number.isFinite)).toBe(true);
       areaSum+=area(f.originalProjectTriangleXYZ);
       const xz=triangleXZChecks(f.originalProjectTriangleXYZ);
       outside+=xz.outside;crossing+=xz.crossing;enclosed+=xz.enclosed;
       duplicates+=Number(existingExact.has(exactTri(f.originalProjectTriangleXYZ)));
       nearDupes+=Number(existingNear.has(nearTri(f.originalProjectTriangleXYZ)));
     }
     expect(areaSum).toBeCloseTo(c.originalTriangleArea3DSquareMeters,7);
     const decision=!matchedMirror?'HOLD_SOURCE_MIRROR_NOT_EXACT':
      outside||crossing||enclosed?'HOLD_OUTSIDE_OR_CROSSING_FROZEN_42_POINT_XZ':
      duplicates||nearDupes?'HOLD_OVERLAP_EXISTING_142_SOURCE':
      'OPTIONAL_SOURCE_VISUAL_REVIEW_CANDIDATE_ONLY';
     decisions[decision]=(decisions[decision]||0)+1;
     rows.push({minFace:c.minFace,mirrorMinFace:c.mirrorOriginalMinFace,
       sourceObject:c.sourceObject,sourceMaterial:c.sourceMaterial,
       sourceOriginalTriangleCount:c.sourceTriangleCount,
       original3DAreaSquareMeters:areaSum,nearestApprovedPillarMinFace:nearest.face,
       nearestOriginalVertexDistanceMeters:nearest.distance,
       originalMirrorVertexMultisetMatched:matchedMirror,
       originalHardXZSevenSampleOutsideCount:outside,
       originalHardXZRingEdgeProperIntersections:crossing,
       originalHardXZRingVerticesInsideOriginalTriangles:enclosed,
       exactExistingSourceTriangleDuplicates:duplicates,
       nearExistingSourceTriangleDuplicates:nearDupes,decision,
       gameCollisionNavigationPaintAuthority:'NONE',runtimePromotionAuthorized:false});
   }
   expect(faceIds.size).toBe(totalFaces);
   expect(totalFaces).toBe(s.selectedOriginalTriangleCount);
   const approved=rows.filter(c=>c.decision==='OPTIONAL_SOURCE_VISUAL_REVIEW_CANDIDATE_ONLY');
   const paired=approved.filter(c=>approved.some(x=>x.minFace===c.mirrorMinFace));
   const report={version:'T21_PHASE12J_INDEPENDENT_142_SOURCE_AND_42_POINT_XZ_GATE_V1',
     originalSourceSHA256:s.originalSourceSHA256,originalSourceBytes:s.originalSourceBytes,
     originalWholeStageSourceFaces:70396,existingDefaultSourceMeshes:124,
     alreadyOptionalPreviousSourceMeshes:18,sourceReviewedCandidateComponents:rows.length,
     sourceReviewedOriginalTriangles:totalFaces,
     sourceOnlyEligibleMirrorPairs:paired.length/2,
     sourceOnlyEligibleComponents:paired.length,
     perComponent:rows,decisionCounts:decisions,reviewOnly:true,
     runtimePromotionAuthorized:false,gameplayAuthority:'NONE',
     currentlyAddedVisualReviewComponents:0,notSourceGameplayConnectionProof:true};
   if(process.env.T21_PHASE12J_GATE_REPORT)
     writeFileSync(process.env.T21_PHASE12J_GATE_REPORT,JSON.stringify(report,null,2));
   console.log('T21_PHASE12J_INDEPENDENT_ORIGINAL_PILLAR_NEIGHBORHOOD_GATE',
      JSON.stringify({decisions,eligiblePairs:report.sourceOnlyEligibleMirrorPairs,
      originalEligibleFaces:paired.map(x=>x.minFace)}));
   expect(rows).toHaveLength(s.selectedFullSourceComponentCount);
 });
 it('properly detects a synthetic polygon edge crossing outside even if endpoints are within',()=>{
   expect(crosses([0,0],[2,2],[0,2],[2,0])).toBe(true);
   expect(crosses([0,0],[1,0],[2,1],[2,2])).toBe(false);
   expect(triangleContainsStrictly([.3,.3],[[0,0],[2,0],[0,2]])).toBe(true);
   expect(triangleContainsStrictly([4,4],[[0,0],[2,0],[0,2]])).toBe(false);
 });
});
