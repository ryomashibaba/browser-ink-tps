import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import type {StageVector3} from '../src/stage/StageDefinition';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as OUTER} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES as SAMPLE} from '../src/stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
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
type XYZ=readonly [number,number,number];
type Face={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type Component={sourceComponentKey:string;sourceObject:string;sourceMaterial:string;
 originalTriangleCount:number;originalSource3DAreaSquareMeters:number;
 originalComponentFaceAndOBJVertexIDHash:string;originalYRangeMeters:[number,number];
 faces:Face[];gameplayAuthority:'NONE';runtimePromotionAuthorized:false};
type Payload={version:string;originalSourceSHA256:string;sourceSizeBytes:number;
 sourceComponentCount:number;originalTriangleCount:number;staticSourceMaterialFamilies:number;
 original3DAreaSquareMeters:number;existingRegisteredFullSourceMeshes:number;
 newRegisteredFullSourceMeshes:number;components:Component[];reviewOnly:true;
 runtimePromotionAuthorized:false};
type SourceMesh={id:string;sourceComponentId:string;sourceMaterial:string;
 vertices:readonly StageVector3[]};
const DISPLAYED:readonly SourceMesh[]=[
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
function bit3(point:readonly number[]):string{
 const b=Buffer.alloc(24);point.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b.toString('hex');
}
function exactTriangle(t:readonly XYZ[]):string{return t.map(bit3).sort().join('/');}
function nearTriangle(t:readonly XYZ[]):string{
 return t.map(v=>v.map(x=>Math.round(x*1e7)).join(':')).sort().join('/');
}
function inside(p:readonly number[]):boolean{
 let ok=false;
 for(let i=0,j=OUTER.length-1;i<OUTER.length;j=i++){
  const a=OUTER[j]!,b=OUTER[i]!;
  const cross=(b[0]-a[0])*(p[1]!-a[1])-(b[1]-a[1])*(p[0]!-a[0]);
  const dot=(p[0]!-a[0])*(p[0]!-b[0])+(p[1]!-a[1])*(p[1]!-b[1]);
  if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]!-a[1])/(b[1]-a[1])+a[0])ok=!ok;
 }
 return ok;
}
function samples(tri:readonly XYZ[]):number[][]{
 const [a,b,c]=tri;
 return [[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
 [(a[0]+b[0])/2,(a[2]+b[2])/2],[(a[0]+c[0])/2,(a[2]+c[2])/2],
 [(b[0]+c[0])/2,(b[2]+c[2])/2],
 [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
}
function mirrors(a:Component,b:Component):boolean{
 if(a.originalTriangleCount!==b.originalTriangleCount||
    a.sourceMaterial!==b.sourceMaterial||
    Math.abs(a.originalSource3DAreaSquareMeters-b.originalSource3DAreaSquareMeters)>0.0001||
    a.originalYRangeMeters.some((v,i)=>Math.abs(v-b.originalYRangeMeters[i]!)>0.0002))return false;
 const aa=a.faces.flatMap(x=>x.originalProjectTriangleXYZ);
 const bb=b.faces.flatMap(x=>x.originalProjectTriangleXYZ);
 if(aa.length!==bb.length)return false;
 const used=new Set<number>();
 for(const p of aa){
  let found=-1,best=0.0002;
  for(let i=0;i<bb.length;i++){
   if(used.has(i))continue;const q=bb[i]!;
   const d=Math.hypot(p[0]+q[0]-0.229368288528164,p[1]-q[1],
     p[2]+q[2]-0.194564295456822);
   if(d<best){best=d;found=i;}
  }
  if(found===-1)return false;
  used.add(found);
 }
 return true;
}
describe('T21 Phase12C: all 124 existing source meshes vs 162 pinned OBJ triangle candidates',()=>{
 it('preserves original 64/124 source lists and nonactivated gameplay',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(DISPLAYED).toHaveLength(124);
  expect(new Set(DISPLAYED.map(x=>x.sourceComponentId)).size).toBe(124);
  expect(SAMPLE).toHaveLength(16);
 });
 it('independently classifies 16 full original mesh components with exact/near overlap and 7-point hard-XZ tests',()=>{
  const path=process.env.T21_PHASE12C_SOURCE_JSON;
  if(!path)return; // only CI has original source
  if(!existsSync(path))throw Error('T21_PHASE12C_SOURCE_JSON_NOT_FOUND');
  const data=JSON.parse(readFileSync(path,'utf8')) as Payload;
  expect(data).toMatchObject({
   version:'T21_PHASE12C_ORIGINAL_162_TRIANGLE_REGISTERED_MESH_PREFLIGHT_V1',
   originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
   sourceSizeBytes:43263289,sourceComponentCount:16,originalTriangleCount:162,
   staticSourceMaterialFamilies:5,existingRegisteredFullSourceMeshes:124,
   newRegisteredFullSourceMeshes:0,reviewOnly:true,runtimePromotionAuthorized:false
  });
  expect(data.components).toHaveLength(16);
  expect(data.original3DAreaSquareMeters).toBeCloseTo(76.116856,3);
  const exact=new Map<string,Set<string>>(),near=new Map<string,Set<string>>();
  for(const displayed of DISPLAYED){
   expect(displayed.vertices.length%3).toBe(0);
   for(let i=0;i<displayed.vertices.length;i+=3){
    const tri=displayed.vertices.slice(i,i+3) as XYZ[];
    for(const [map,key] of [[exact,exactTriangle(tri)],[near,nearTriangle(tri)]] as const){
     if(!map.has(key))map.set(key,new Set());
     map.get(key)!.add(displayed.sourceComponentId);
    }
   }
  }
  const faceIds=new Set<number>();
  const rows=[] as {sourceComponentKey:string;sourceMaterial:string;sourceTriangles:number;
   exactSourceTriangleOverlaps:number;nearSourceTriangleOverlaps:number;
   outsideHardXZSamples:number;overlappedRegisteredMeshIds:string[];
   mirrorCandidateKeys:string[];centroidZ:number;decision:string}[];
  for(const comp of data.components){
   expect(comp.gameplayAuthority).toBe('NONE');expect(comp.runtimePromotionAuthorized).toBe(false);
   expect(comp.faces).toHaveLength(comp.originalTriangleCount);
   expect(comp.originalComponentFaceAndOBJVertexIDHash).toMatch(/^[0-9a-f]{64}$/);
   let exactHits=0,nearHits=0,outside=0,z=0,n=0;
   const overlaps=new Set<string>();
   for(const f of comp.faces){
    expect(faceIds.has(f.originalFaceIndex)).toBe(false);
    faceIds.add(f.originalFaceIndex);
    const t=f.originalProjectTriangleXYZ;
    expect(t).toHaveLength(3);expect(f.originalOBJVertexIds).toHaveLength(3);
    const e=exact.get(exactTriangle(t)),q=near.get(nearTriangle(t));
    if(e){exactHits++;e.forEach(v=>overlaps.add(v));}
    if(q){nearHits++;q.forEach(v=>overlaps.add(v));}
    outside+=samples(t).filter(p=>!inside(p)).length;
    for(const v of t){z+=v[2];n++;}
    const original=SAMPLE.find(x=>x.originalFaceIndex===f.originalFaceIndex);
    if(original){
     expect(f.originalOBJVertexIds).toEqual(original.originalFaceOBJVertexIds);
     for(let i=0;i<3;i++)expect(bit3(t[i]!)).toBe(bit3(original.vertices[i]!));
    }
   }
   rows.push({sourceComponentKey:comp.sourceComponentKey,sourceMaterial:comp.sourceMaterial,
    sourceTriangles:comp.originalTriangleCount,exactSourceTriangleOverlaps:exactHits,
    nearSourceTriangleOverlaps:nearHits,outsideHardXZSamples:outside,
    overlappedRegisteredMeshIds:[...overlaps].sort(),mirrorCandidateKeys:[],centroidZ:z/n,
    decision:'PENDING_MIRROR'});
  }
  expect(faceIds.size).toBe(162);
  for(let i=0;i<rows.length;i++){
   const row=rows[i]!;
   for(let j=0;j<rows.length;j++){
    if(i!==j&&mirrors(data.components[i]!,data.components[j]!))
      row.mirrorCandidateKeys.push(data.components[j]!.sourceComponentKey);
   }
   row.decision=row.outsideHardXZSamples>0?'HOLD_OUTSIDE_HARD_XZ':
    row.nearSourceTriangleOverlaps>0||row.exactSourceTriangleOverlaps>0?
      'HOLD_OVERLAP_EXISTING_REGISTERED_124':
    row.mirrorCandidateKeys.length!==1?'HOLD_MIRROR_UNVERIFIED_OR_AMBIGUOUS':
      'SOURCE_ONLY_OPT_IN_REVIEW_CANDIDATE';
  }
  const decisions:Record<string,number>={};
  for(const r of rows)decisions[r.decision]=(decisions[r.decision]||0)+1;
  const report={version:'T21_PHASE12C_REGISTERED124_EXACT_TRIANGLE_OVERLAP_GATE_V1',
    originalSourceSHA256:data.originalSourceSHA256,
    registeredExistingOriginalDisplayMeshCount:DISPLAYED.length,
    existingDisplayedTriangleCount:DISPLAYED.reduce((s,m)=>s+m.vertices.length/3,0),
    candidateSourceComponents:16,candidateSourceTriangles:162,
    perComponent:rows,decisionCounts:decisions,
    gameplayAuthority:'NONE',reviewOnly:true,runtimePromotionAuthorized:false};
  if(process.env.T21_PHASE12C_GATE_REPORT)
   writeFileSync(process.env.T21_PHASE12C_GATE_REPORT,JSON.stringify(report,null,2));
  console.log('T21_PHASE12C_124_DISPLAY_MESH_GATE',JSON.stringify(decisions));
  console.log('T21_PHASE12C_GATES',rows.map(x=>({
   family:x.sourceMaterial.replace('Fld_Temple01_',''),
   source:x.sourceComponentKey.split('|').at(-1),
   triangles:x.sourceTriangles,exact:x.exactSourceTriangleOverlaps,
   near:x.nearSourceTriangleOverlaps,hardOut:x.outsideHardXZSamples,
   mirrors:x.mirrorCandidateKeys.length,decision:x.decision})));
  expect(rows).toHaveLength(16);
  expect(new Set(rows.map(x=>x.sourceComponentKey)).size).toBe(16);
 });
});
