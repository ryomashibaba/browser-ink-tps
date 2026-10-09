import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import type {StageVector3} from '../src/stage/StageDefinition';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as OUTER} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
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
type XYZ=readonly[number,number,number];
type OriginalFace={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type OriginalComp={minOriginalFaceIndex:number;sourceComponentKey:string;
  originalSourceTriangleCount:number;originalProjectYRangeMeters:number[];
  originalSource3DAreaSquareMeters:number;faces:OriginalFace[];
  gameplayAuthority:string;runtimePromotionAuthorized:boolean};
type Recovered={version:string;sourceSHA256:string;sourceSizeBytes:number;
 completeOriginalSourceComponentCount:number;originalTriangleCount:number;
 mirrorPairs:{originalFaceIndexA:number;originalFaceIndexB:number}[];
 originalComponents:OriginalComp[];reviewOnly:boolean;runtimePromotionAuthorized:boolean;
 addedSceneSourceMeshes:number};
type Mesh={sourceComponentId:string;vertices:readonly StageVector3[]};
const REGISTERED:readonly Mesh[]=[
 ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
 ...UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,...UNDERTOW_T21_SOURCE_BATCH2_MESHES,
 ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES,...UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES,
 ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES,...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES,
 ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES,...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES,
 ...UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES,
 ...UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES.map(c=>({
    sourceComponentId:c.sourceComponentKey,vertices:c.vertices
 }))
];
function bytes(v:readonly number[]):string{
 const b=Buffer.alloc(v.length*8);v.forEach((x,i)=>b.writeDoubleLE(x,i*8));
 return b.toString('hex');
}
function triKey(t:readonly XYZ[]):string{return t.map(bytes).sort().join('/');}
function nearKey(t:readonly XYZ[]):string{return t.map(v=>v.map(x=>Math.round(x*1e7)).join(':')).sort().join('/');}
function inside(p:readonly number[]):boolean{
 let ok=false;
 for(let i=0,j=OUTER.length-1;i<OUTER.length;j=i++){
  const a=OUTER[j]!,b=OUTER[i]!;
  const cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const dot=(p[0]-a[0])*(p[0]-b[0])+(p[1]-a[1])*(p[1]-b[1]);
  if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&
    p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])ok=!ok;
 }
 return ok;
}
function samples(t:readonly XYZ[]):number[][]{
 const [a,b,c]=t;
 return [[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
 [(a[0]+b[0])/2,(a[2]+b[2])/2],[(a[0]+c[0])/2,(a[2]+c[2])/2],
 [(b[0]+c[0])/2,(b[2]+c[2])/2],
 [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
}
function mirror(a:OriginalComp,b:OriginalComp):boolean{
 if(a.originalSourceTriangleCount!==b.originalSourceTriangleCount||
    a.originalProjectYRangeMeters.some((v,i)=>Math.abs(v-b.originalProjectYRangeMeters[i]!)>0.0002)||
    Math.abs(a.originalSource3DAreaSquareMeters-b.originalSource3DAreaSquareMeters)>0.0001)
   return false;
 const A=a.faces.flatMap(f=>f.originalProjectTriangleXYZ),B=b.faces.flatMap(f=>f.originalProjectTriangleXYZ);
 const used=new Set<number>();
 for(const p of A){
  let ix=-1,dist=0.0002;
  for(let i=0;i<B.length;i++){
   if(used.has(i))continue;const q=B[i]!;
   const d=Math.hypot(p[0]+q[0]-0.229368288528164,p[1]-q[1],
     p[2]+q[2]-0.194564295456822);
   if(d<dist){dist=d;ix=i;}
  }
  if(ix<0)return false;used.add(ix);
 }
 return true;
}
describe('T21 Phase12D recovered real source mirrors optional-review gate',()=>{
 it('keeps the 124 existing default source meshes and all gameplay unmodified',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(REGISTERED).toHaveLength(132); // 124 default, 8 Phase12C opt-in
  expect(UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES).toHaveLength(8);
  expect(OUTER).toHaveLength(42);
 });
 it('byte-compares four full original candidates against every existing 124+8 and 42-point hard outline',()=>{
  const input=process.env.T21_PHASE12D_RECOVERED_JSON;
  if(!input)return;
  if(!existsSync(input))throw Error('T21_PHASE12D_RECOVERED_JSON_MISSING');
  const o=JSON.parse(readFileSync(input,'utf8')) as Recovered;
  expect(o).toMatchObject({
    version:'T21_PHASE12D_FOUR_RECOVERED_EXACT_SOURCE_TRIANGLE_SETS_V1',
    sourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
    sourceSizeBytes:43263289,completeOriginalSourceComponentCount:4,originalTriangleCount:8,
    addedSceneSourceMeshes:0,reviewOnly:true,runtimePromotionAuthorized:false
  });
  const registeredExact=new Set<string>(),registeredNear=new Set<string>();
  for(const mesh of REGISTERED)for(let i=0;i<mesh.vertices.length;i+=3){
   const tri=mesh.vertices.slice(i,i+3) as XYZ[];
   registeredExact.add(triKey(tri));registeredNear.add(nearKey(tri));
  }
  expect(o.originalComponents).toHaveLength(4);
  expect(o.mirrorPairs).toEqual([
    {originalFaceIndexA:60006,originalFaceIndexB:61728},
    {originalFaceIndexA:61516,originalFaceIndexB:62086}
  ]);
  const uniqueFaces=new Set<number>();
  const result=[] as {sourceComponentKey:string;originalTriangleCount:number;
    duplicatedExactOriginalTriangles:number;duplicatedNearOriginalTriangles:number;
    outsideHardXZSamples:number;originalMirrorPartner:string;eligibleForSourceOnlyDisplay:boolean}[];
  for(const c of o.originalComponents){
   expect(c.originalSourceTriangleCount).toBe(2);
   expect(c.faces).toHaveLength(2);
   expect(c.gameplayAuthority).toBe('NONE');expect(c.runtimePromotionAuthorized).toBe(false);
   let duplicates=0,near=0,outside=0;
   for(const f of c.faces){
    expect(uniqueFaces.has(f.originalFaceIndex)).toBe(false);
    uniqueFaces.add(f.originalFaceIndex);
    const t=f.originalProjectTriangleXYZ;
    if(registeredExact.has(triKey(t)))duplicates++;
    if(registeredNear.has(nearKey(t)))near++;
    outside+=samples(t).filter(x=>!inside(x)).length;
   }
   const partners=o.originalComponents.filter(x=>x!==c&&mirror(c,x));
   result.push({sourceComponentKey:c.sourceComponentKey,originalTriangleCount:c.originalSourceTriangleCount,
     duplicatedExactOriginalTriangles:duplicates,duplicatedNearOriginalTriangles:near,
     outsideHardXZSamples:outside,originalMirrorPartner:partners.length===1?partners[0]!.sourceComponentKey:'NONE',
     eligibleForSourceOnlyDisplay:duplicates===0&&near===0&&outside===0&&partners.length===1});
  }
  const report={version:'T21_PHASE12D_RECOVERED_FOUR_ORIGINAL_SOURCE_RENDER_GATE_V1',
    originalSourceSHA256:o.sourceSHA256,existingDefaultSourceMeshCount:124,
    existingOtherOptInSourceMeshCount:8,
    recoveredSourceMeshes:4,recoveredOriginalTriangleCount:8,
    eligibleSourceOnlyComponents:result.filter(c=>c.eligibleForSourceOnlyDisplay).length,
    perComponent:result,addedDefaultSceneSourceMeshes:0,gameplayAuthority:'NONE',
    reviewOnly:true,runtimePromotionAuthorized:false
  };
  if(process.env.T21_PHASE12D_RECOVERED_GATE_REPORT)
    writeFileSync(process.env.T21_PHASE12D_RECOVERED_GATE_REPORT,JSON.stringify(report,null,2));
  console.log('T21_PHASE12D_RECOVERED_SOURCE_GATE',JSON.stringify(report));
  expect(uniqueFaces.size).toBe(8);
  expect(result).toHaveLength(4);
 });
});
