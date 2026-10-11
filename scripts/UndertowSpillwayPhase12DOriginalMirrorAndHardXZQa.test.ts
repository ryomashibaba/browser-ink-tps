import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY as RING} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES} from '../src/stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
type XYZ=readonly[number,number,number];
type SourceFace={originalFaceIndex:number;originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type SourceComponent={sourceComponentKey:string;sourceMaterial:string;originalTriangleCount:number;
 originalSource3DAreaSquareMeters:number;faces:SourceFace[]};
type Source={version:string;originalSourceSHA256:string;components:SourceComponent[];};
type Alternative={sourceComponentKey:string;mirroredCentroidDistanceMeters:number;
  original3DAreaDifferenceSquareMeters:number};
type Unpaired={unpairedOriginalSourceFaceIndex:number;unpairedSourceComponentKey:string;
 originalSourceTriangleCount:number;exactMirroredOriginalSourceComponents:Alternative[];
 closestSameTriangleCountAlternatives:Alternative[];
 mirrorSearchWithinOriginalSameObjectMaterial:boolean;runtimePromotionAuthorized:boolean;
 disposition:string};
type Mirror={version:string;originalSourceSHA256:string;sourceSizeBytes:number;
 originalFamilyTriangleCount:number;originalFamilyVertexIDConnectedComponentCount:number;
 onlyPreviouslyUnpairedOriginalSourceFaceIds:number[];perUnpairedSource:Unpaired[];
 newOriginalSourceComponentsRendered:number;registeredOriginalFullSourceDisplayCount:number;
 reviewOnly:boolean;runtimePromotionAuthorized:boolean;};
const HELD=[26116,28318,60474,61948] as const;
function inside(p:readonly number[]):boolean{
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
function edgeDistance(p:readonly number[]):number{
 let nearest=Infinity;
 for(let i=0;i<RING.length;i++){
   const a=RING[i]!,b=RING[(i+1)%RING.length]!;
   const dx=b[0]-a[0],dz=b[1]-a[1];
   const u=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
   nearest=Math.min(nearest,Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dz));
 }
 return nearest;
}
function points(f:SourceFace):number[][]{
 const [a,b,c]=f.originalProjectTriangleXYZ;
 return [[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
  [(a[0]+b[0])/2,(a[2]+b[2])/2],
  [(a[0]+c[0])/2,(a[2]+c[2])/2],
  [(b[0]+c[0])/2,(b[2]+c[2])/2],
  [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
}
describe('T21 Phase12D original missing symmetry and source hard-XZ boundary evidence',()=>{
 it('does not expand frozen 64 walk / 124 display source inventories or runtime authority',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES).toHaveLength(16);
  expect(UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES).toHaveLength(8);
  expect(RING).toHaveLength(42);
 });
 it('audits the two unmatched original face components and four exactly located outside-XZ original source components',()=>{
  const sp=process.env.T21_PHASE12C_SOURCE_JSON,mp=process.env.T21_PHASE12D_MIRROR_JSON;
  if(!sp&&!mp)return;
  if(!sp||!mp||!existsSync(sp)||!existsSync(mp))
    throw Error('Missing full pinned Temple01 Phase12C and Phase12D source input');
  const source=JSON.parse(readFileSync(sp,'utf8')) as Source;
  const mirror=JSON.parse(readFileSync(mp,'utf8')) as Mirror;
  expect(source.version).toBe('T21_PHASE12C_ORIGINAL_162_TRIANGLE_REGISTERED_MESH_PREFLIGHT_V1');
  expect(mirror).toMatchObject({version:'T21_PHASE12D_FULL_SOURCE_FAMILY_MIRROR_SEARCH_V1',
    originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
    sourceSizeBytes:43263289,onlyPreviouslyUnpairedOriginalSourceFaceIds:[60006,61516],
    registeredOriginalFullSourceDisplayCount:124,newOriginalSourceComponentsRendered:0,
    reviewOnly:true,runtimePromotionAuthorized:false});
  expect(mirror.originalFamilyTriangleCount).toBeGreaterThanOrEqual(46);
  expect(mirror.originalFamilyVertexIDConnectedComponentCount).toBeGreaterThanOrEqual(6);
  expect(mirror.perUnpairedSource.map(x=>x.unpairedOriginalSourceFaceIndex)).toEqual([60006,61516]);
  for(const target of mirror.perUnpairedSource){
    expect(target.mirrorSearchWithinOriginalSameObjectMaterial).toBe(true);
    expect(target.runtimePromotionAuthorized).toBe(false);
    expect(target.unpairedSourceComponentKey).toContain('Fld_Temple01_FloorLine02');
    expect(target.originalSourceTriangleCount).toBe(2);
    expect(new Set(target.exactMirroredOriginalSourceComponents.map(x=>x.sourceComponentKey)).size)
      .toBe(target.exactMirroredOriginalSourceComponents.length);
    expect(target.closestSameTriangleCountAlternatives.length).toBeLessThanOrEqual(5);
    expect(target.disposition).toBe(target.exactMirroredOriginalSourceComponents.length>0?
      'FOUND_ORIGINAL_SOURCE_MIRROR_REQUIRES_NEW_124_AND_HARD_XZ_GATES':
      'HOLD_NO_0POINT2MM_SOURCE_MIRROR_IN_FULL_FAMILY');
  }
  const comps=source.components.filter(x=>HELD.some(id=>x.sourceComponentKey.endsWith('original-minface-'+id)));
  expect(comps).toHaveLength(4);
  const violations=[] as {sourceComponentKey:string;outsideOriginalFaceIds:number[];
    originalTriangles:number;originalProjectYRangeMeters:number[];
    outsidePointCount:number;maxOutsideBoundaryDistanceMeters:number;
    outsideSourceTriangleAreasSquareMeters:number}[];
  for(const c of comps){
    let count=0,max=0,outsideFaceIds:number[]=[];
    let area=0;
    for(const face of c.faces){
      const bad=points(face).filter(p=>!inside(p));
      if(!bad.length)continue;
      count+=bad.length;outsideFaceIds.push(face.originalFaceIndex);
      max=Math.max(max,...bad.map(edgeDistance));
      const [a,b,d]=face.originalProjectTriangleXYZ;
      const cross=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);
      const c2=(b[1]-a[1])*(d[2]-a[2])-(b[2]-a[2])*(d[1]-a[1]);
      const c3=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]);
      area+=Math.hypot(cross,c2,c3)/2;
    }
    expect(count).toBeGreaterThan(0);
    expect(max).toBeGreaterThan(0);
    violations.push({sourceComponentKey:c.sourceComponentKey,outsideOriginalFaceIds:outsideFaceIds,
      originalTriangles:c.originalTriangleCount,
      originalProjectYRangeMeters:[Math.min(...c.faces.flatMap(f=>f.originalProjectTriangleXYZ.map(p=>p[1]))),
        Math.max(...c.faces.flatMap(f=>f.originalProjectTriangleXYZ.map(p=>p[1])))],
      outsidePointCount:count,maxOutsideBoundaryDistanceMeters:max,
      outsideSourceTriangleAreasSquareMeters:area});
  }
  const report={version:'T21_PHASE12D_FROZEN_42_POINT_HARD_XZ_OUTSIDE_COMPONENTS_V1',
   sourceSHA256:mirror.originalSourceSHA256,hardBoundaryVertices:RING.length,
   originalOutsideSourceComponents:4,originalFaceCounts:violations.map(x=>x.originalTriangles),
   originalOutsidePointCount:violations.reduce((s,x)=>s+x.outsidePointCount,0),
   perComponent:violations,mirrorResults:mirror.perUnpairedSource.map(x=>({
    originalFaceIndex:x.unpairedOriginalSourceFaceIndex,
    exactFullFamilyMirrors:x.exactMirroredOriginalSourceComponents.length,
    disposition:x.disposition})),newDisplayedOriginalComponents:0,
   sourceClipOrInferredFillAuthorized:false,gameplayAuthority:'NONE',
   reviewOnly:true,runtimePromotionAuthorized:false};
  const out=process.env.T21_PHASE12D_HARD_XZ_REPORT;
  if(out)writeFileSync(out,JSON.stringify(report,null,2));
  console.log('T21_PHASE12D_HARD_OUTSIDE_SAMPLES',JSON.stringify(
    violations.map(x=>({source:x.sourceComponentKey.split('|').at(-1),
      faces:x.originalTriangles,outside:x.outsidePointCount,
      maxMeters:x.maxOutsideBoundaryDistanceMeters}))));
  expect(report.originalOutsidePointCount).toBeGreaterThanOrEqual(16);
 });
});
