import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import type {StageVector3} from '../src/stage/StageDefinition';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as RING} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
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
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as M,
 UNDERTOW_T21_PHASE12L_OBJECT_SUMMARY as S} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';

type XYZ=readonly [number,number,number];
type XZ=readonly [number,number];
type OriginalFace={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type Original={minFace:number;mirrorOriginalMinFace:number;
 sourceComponentKey:string;sourceObject:string;sourceMaterial:string;
 sourceTriangleCount:number;originalTriangleArea3DSquareMeters:number;
 originalSourceComponentFaceAndOBJVertexIDHash:string;faces:OriginalFace[]};
type Source={version:string;originalSourceSHA256:string;
 selectedFullSourceComponentCount:number;selectedOriginalTriangleCount:number;
 selectedFullOriginalSourceComponents:Original[]};
type GateEntry={minFace:number;mirrorMinFace:number;
 originalMirrorVertexMultisetMatched:boolean;
 originalHardXZSevenSampleOutsideCount:number;
 originalHardXZRingEdgeProperIntersections:number;
 originalHardXZRingVerticesInsideOriginalTriangles:number;
 exactExistingSourceTriangleDuplicates:number;nearExistingSourceTriangleDuplicates:number;
 decision:string};
type Gate={version:string;originalSourceSHA256:string;existingDefaultSourceMeshes:number;
 alreadyOptionalPreviousSourceMeshes:number;sourceOnlyEligibleComponents:number;
 perComponent:GateEntry[];sourceOnlyEligibleMirrorPairs:number;gameplayAuthority:'NONE'};
const DEFAULT124=[
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
const EXISTING146=[
 ...DEFAULT124,...UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS,
 ...UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS
];
const APPROVED=[42926,43102,43448,43624];
const MX=.229368288528164,MZ=.194564295456822;
function near(v:readonly XYZ[]):string{return v.map(p=>p.map(x=>Math.round(x*1e7)).join(',')).sort().join('|');}
function exact(v:readonly XYZ[]):string{return v.map(p=>{
 const b=Buffer.alloc(24);p.forEach((x,i)=>b.writeDoubleLE(x,i*8));return b.toString('hex');
}).sort().join('|');}
function verts(c:{originalOBJVertexIdTriples:readonly (readonly number[])[];vertices:readonly StageVector3[]}){
 const v=new Map<number,XYZ>();
 c.originalOBJVertexIdTriples.forEach((ids,face)=>ids.forEach((id,i)=>
  v.set(id,c.vertices[face*3+i]! as XYZ)));
 return [...v.values()];
}
function mirrored(a:typeof M[number],b:typeof M[number]):boolean{
 if(a.originalSourceTriangleCount!==b.originalSourceTriangleCount||
  a.sourceMaterial!==b.sourceMaterial)return false;
 const aa=verts(a),bb=verts(b);if(aa.length!==bb.length)return false;
 const used=new Set<number>();
 for(const p of aa){
  const i=bb.findIndex((q,j)=>!used.has(j)&&
   Math.hypot(p[0]+q[0]-MX,p[1]-q[1],p[2]+q[2]-MZ)<.0002);
  if(i<0)return false;used.add(i);
 }
 return used.size===aa.length;
}
function inside([x,z]:XZ):boolean{
 let flag=false;
 for(let i=0,j=RING.length-1;i<RING.length;j=i++){
  const a=RING[j]!,b=RING[i]!;
  const cross=(b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0]);
  const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
  if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])flag=!flag;
 }
 return flag;
}
function orient(a:XZ,b:XZ,c:XZ):number{
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
}
function intersects(a:XZ,b:XZ,c:XZ,d:XZ):boolean{
 const s=orient(a,b,c),t=orient(a,b,d),u=orient(c,d,a),v=orient(c,d,b);
 const e=1e-9;
 return ((s>e&&t< -e)||(s< -e&&t>e))&&((u>e&&v< -e)||(u< -e&&v>e));
}
function strictInside(p:XZ,t:XZ[]):boolean{
 const v=[orient(t[0]!,t[1]!,p),orient(t[1]!,t[2]!,p),orient(t[2]!,t[0]!,p)];
 return v.every(x=>x>1e-8)||v.every(x=>x< -1e-8);
}
function hardXZ(points:readonly XYZ[]):number{
 const [a,b,c]=points;
 const q:XZ[]=points.map(v=>[v[0],v[2]]);
 const sample:XZ[]=[...q,
 [(a[0]+b[0])/2,(a[2]+b[2])/2],
 [(a[0]+c[0])/2,(a[2]+c[2])/2],
 [(b[0]+c[0])/2,(b[2]+c[2])/2],
 [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
 let faults=sample.filter(x=>!inside(x)).length;
 for(let i=0;i<3;i++)for(let j=0;j<RING.length;j++)
  faults+=Number(intersects(q[i]!,q[(i+1)%3]!,RING[j]!,RING[(j+1)%RING.length]!));
 faults+=RING.filter(x=>strictInside(x,q)).length;
 return faults;
}
describe('T21 Phase12L independent 146 existing-source / exact OBJ / frozen hard XZ',()=>{
 it('keeps production, 64/124/146 source inventories, default OFF and gameplay NONE',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(DEFAULT124).toHaveLength(124);
  expect(EXISTING146).toHaveLength(146);
  expect(RING).toHaveLength(42);
  expect(S).toMatchObject({componentCount:4,mirrorPairCount:2,originalTriangleCount:88,
   frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:22,
   defaultVisible:false,reviewOnly:true,runtimePromotionAuthorized:false,
   gameplayAuthority:'NONE',
   originalPackedFloat64FaceVertexIDDigest:'b1bf7357331125993a0f52c644d8da0dd99633b6aec335bf0452391ac35db817'});
  expect(M.map(x=>x.originalMinFace)).toEqual(APPROVED);
  expect(M.every(x=>x.reviewOnly&&!x.runtimePromotionAuthorized&&
   x.gameplayFloorCollisionPaintNavScoringAuthority==='NONE')).toBe(true);
 });
 it('independently rejects source overlap versus all 146 prior meshes and boundary intrusion',()=>{
  const priorNear=new Set<string>(),priorExact=new Set<string>();
  for(const m of EXISTING146){
   for(let i=0;i<m.vertices.length;i+=3){
    const p=m.vertices.slice(i,i+3) as XYZ[];
    priorNear.add(near(p));priorExact.add(exact(p));
   }
  }
  const ownNear=new Set<string>(),ownExact=new Set<string>();
  for(const m of M){
   expect(m.originalGlobalFaceIndices).toHaveLength(22);
   expect(m.originalOBJVertexIdTriples).toHaveLength(22);
   expect(m.vertices).toHaveLength(66);
   for(let i=0;i<m.vertices.length;i+=3){
    const p=m.vertices.slice(i,i+3) as XYZ[];
    const n=near(p),x=exact(p);
    expect(priorNear.has(n)).toBe(false);
    expect(priorExact.has(x)).toBe(false);
    expect(ownNear.has(n)).toBe(false);
    expect(ownExact.has(x)).toBe(false);
    ownNear.add(n);ownExact.add(x);
    expect(hardXZ(p)).toBe(0);
   }
  }
  expect(ownNear.size).toBe(88);
 });
 it('pins every original face/OBJ ID/Float64 XYZ to the independent Phase12J source and gate',()=>{
  const sourcePath=process.env.T21_PHASE12J_SOURCE_JSON;
  const gatePath=process.env.T21_PHASE12J_GATE_REPORT;
  if(!sourcePath&&!gatePath)return; // local isolated unit gate still covers inventory and hard XZ
  if(!sourcePath||!gatePath||!existsSync(sourcePath)||!existsSync(gatePath))
   throw Error('PHASE12L_ORIGINAL_INDEPENDENT_EVIDENCE_MISSING');
  const source=JSON.parse(readFileSync(sourcePath,'utf8')) as Source;
  const gate=JSON.parse(readFileSync(gatePath,'utf8')) as Gate;
  expect(source.version).toBe('T21_PHASE12J_SIX_PILLAR_NEARBY_ORIGINAL_STATIC_PARTS_V1');
  expect(source.originalSourceSHA256).toBe(S.originalSourceSHA256);
  expect(gate.originalSourceSHA256).toBe(S.originalSourceSHA256);
  expect(gate.version).toBe('T21_PHASE12J_INDEPENDENT_142_SOURCE_AND_42_POINT_XZ_GATE_V1');
  expect(gate.existingDefaultSourceMeshes).toBe(124);
  expect(gate.alreadyOptionalPreviousSourceMeshes).toBe(18);
  expect(gate.sourceOnlyEligibleMirrorPairs).toBe(22);
  expect(gate.sourceOnlyEligibleComponents).toBe(44);
  expect(gate.gameplayAuthority).toBe('NONE');
  const originals=new Map(source.selectedFullOriginalSourceComponents.map(c=>[c.minFace,c]));
  const gates=new Map(gate.perComponent.map(c=>[c.minFace,c]));
  const bytes=Buffer.alloc(88*88);let offset=0;
  for(const m of M){
   const src=originals.get(m.originalMinFace),q=gates.get(m.originalMinFace);
   expect(src).toBeDefined();expect(q).toBeDefined();
   expect(src!.sourceComponentKey).toBe(m.sourceComponentId);
   expect(src!.mirrorOriginalMinFace).toBe(m.originalMirrorMinFace);
   expect(src!.sourceMaterial).toBe(m.sourceMaterial);
   expect(src!.sourceObject).toBe(m.sourceObject);
   expect(src!.sourceTriangleCount).toBe(22);
   expect(src!.originalSourceComponentFaceAndOBJVertexIDHash).toBe(m.originalComponentFaceAndOBJVertexIDHash);
   expect(m.originalSource3DAreaSquareMeters).toBeCloseTo(src!.originalTriangleArea3DSquareMeters,9);
   expect(q!.decision).toBe('OPTIONAL_SOURCE_VISUAL_REVIEW_CANDIDATE_ONLY');
   expect(q!.originalMirrorVertexMultisetMatched).toBe(true);
   for(const key of ['originalHardXZSevenSampleOutsideCount',
    'originalHardXZRingEdgeProperIntersections','originalHardXZRingVerticesInsideOriginalTriangles',
    'exactExistingSourceTriangleDuplicates','nearExistingSourceTriangleDuplicates'] as const)
    expect(q![key]).toBe(0);
   const twin=M.find(v=>v.originalMinFace===m.originalMirrorMinFace);
   expect(twin).toBeDefined();expect(mirrored(m,twin!)).toBe(true);
   for(let i=0;i<22;i++){
    const f=src!.faces[i]!;
    expect(m.originalGlobalFaceIndices[i]).toBe(f.originalFaceIndex);
    expect(m.originalOBJVertexIdTriples[i]).toEqual(f.originalOBJVertexIds);
    bytes.writeUInt32LE(f.originalFaceIndex,offset);
    f.originalOBJVertexIds.forEach((id,n)=>bytes.writeUInt32LE(id,offset+4+n*4));
    for(let n=0;n<3;n++)for(let axis=0;axis<3;axis++){
     const a=Buffer.alloc(8),b=Buffer.alloc(8);
     a.writeDoubleLE(m.vertices[i*3+n]![axis]!,0);
     b.writeDoubleLE(f.originalProjectTriangleXYZ[n]![axis]!,0);
     expect(a.equals(b)).toBe(true);
     bytes.writeDoubleLE(m.vertices[i*3+n]![axis]!,offset+16+n*24+axis*8);
    }
    offset+=88;
   }
  }
  expect(offset).toBe(7744);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(S.originalPackedFloat64FaceVertexIDDigest);
 });
 it('keeps Phase12L review and screenshots opt-in, never default five-view freeze',()=>{
  const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
  const captures=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
  expect(app).toContain('this.phase12LOriginalObjectRoot.enabled=false;');
  expect(app).toContain("private focusPhase12LOriginalContext(selected:'CONTEXT'|'OBJECT'):void");
  expect(app).toContain("this.canvas.dataset.t21ReviewPhase12LContext='off';");
  expect(captures).toContain('manifest.phase12LOriginalContextDiagnostics=[];');
  expect(captures).toContain("for(const choice of ['CONTEXT','OBJECT'])");
  expect(captures).toContain('authorizesVisualFreeze:false');
  expect(captures).toContain("const views=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];");
 });
 it('rejects synthetic 2D hard boundary crossings and shape enclosure cases',()=>{
  expect(intersects([0,0],[2,2],[0,2],[2,0])).toBe(true);
  expect(intersects([0,0],[1,0],[2,1],[2,2])).toBe(false);
  expect(strictInside([.2,.2],[[0,0],[2,0],[0,2]])).toBe(true);
  expect(strictInside([3,3],[[0,0],[2,0],[0,2]])).toBe(false);
 });
});
