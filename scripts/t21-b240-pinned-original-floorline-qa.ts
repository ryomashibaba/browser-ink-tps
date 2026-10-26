/**
 * B240 strict external numeric-source adapter for native Recast diagnosis.
 * The input is regenerated after the full original KiTrix OBJ SHA/size scan.
 * Never widens original polygons, touches the F3 runtime stage, or creates
 * navigation links. The Recast generation variations stay QA-only.
 */
import {readFileSync} from 'node:fs';
import {b235ExactSourceSideQaStage,type B235Side}
 from '../src/stage/undertow/B235ExactOriginalSourceEntryQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';
export type Side=B235Side;
export type V3=readonly [number,number,number];
export interface SourceFace{
 originalFaceIndex:number;
 originalOBJVertexIDs:readonly number[];
 sourceMaterial:string;
 vertices:readonly [V3,V3,V3];
 signedUnitNormalY:number;
 sourceAreaSquareMeters:number;
}
export interface SourceSide{
 sourceObject:string;
 sourceAreaSquareMeters:number;
 sourceMaterial:string;
 triangles:readonly SourceFace[];
 rightLowWitness:{registeredBoundaryWitness:V3;originalTriangleNearestWitness:V3};
 slopeTopWitness:{originalTriangleNearestWitness:V3};
}
export interface SourceSeed{
 version:string;sourceSHA256:string;sourceOnly:boolean;
 productionAuthorized:boolean;originalStage:string;
 opponentRoutesCertified:string;
 sides:Record<Side,SourceSide>;
}
export const B240_SOURCE_PIN=
 'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const SOURCE='Fld_Temple01_group21600_1__FloorLine00';
const EXPECTED:Record<Side,readonly [number,number]>={
 POSITIVE_Z:[37118,37119],
 NEGATIVE_Z:[37112,37113]
};
export function b240ReadPinnedSource():SourceSeed{
 const location=process.env.T21_B239_FACES_OUTPUT;
 if(!location)throw Error('B240_REQUIRES_FRESH_SHA_PINNED_B239_SOURCE_OUTPUT');
 const seed=JSON.parse(readFileSync(location,'utf8')) as SourceSeed;
 if(seed.version!=='B239_EXACT_FLOORLINE_ONLY_SOURCE_FACES_V1'||
    seed.sourceSHA256!==B240_SOURCE_PIN||
    !seed.sourceOnly||seed.productionAuthorized!==false||
    seed.originalStage!=='25/17/26/0'||
    seed.opponentRoutesCertified!=='0/12')
   throw Error('B240_SOURCE_IDENTITY_OR_AUTHORITY_DRIFT');
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const candidate=seed.sides[side];
  if(!candidate||candidate.sourceObject!==SOURCE||
     candidate.triangles.length!==2||
     Math.abs(candidate.sourceAreaSquareMeters-1.52523399523421)>1e-5||
     new Set(candidate.triangles.map(t=>t.sourceMaterial)).size!==1||
     candidate.triangles.some((f,i)=>
       f.originalFaceIndex!==EXPECTED[side][i]||
       Math.abs(f.signedUnitNormalY-.9520354685278074)>1e-6||
       f.vertices.length!==3||
       f.vertices.some(v=>v.length!==3||
        v.some(x=>!Number.isFinite(x)))||
       f.originalOBJVertexIDs.length!==3))
   throw Error('B240_ORIGINAL_FLOORLINE_TRIANGLE_DRIFT_'+side);
  const [a,d]=candidate.triangles;
  if(!a||!d||
   a.originalOBJVertexIDs.filter(id=>d.originalOBJVertexIDs.includes(id)).length!==2)
   throw Error('B240_ORIGINAL_SHARED_EDGE_NOT_FOUND_'+side);
 }
 return seed;
}
export function b240IsolatedOriginalStage(side:Side,c:SourceSide):StageDefinition{
 const stage=b235ExactSourceSideQaStage(side);
 const vertices=c.triangles.flatMap(f=>f.vertices);
 const size=([0,1,2] as const).map(axis=>
  Math.max(...vertices.map(v=>v[axis]))-Math.min(...vertices.map(v=>v[axis]))) as StageVector3;
 const extra:StageSolidDefinition={
  id:'B240_EXACT_SOURCE_FLOORLINE:'+side,
  center:[0,0,0],size,material:'medium',render:false,
  projectileBlocker:false,cameraBlocker:false,
  collisionEnabled:true,navigationEnabled:true,
  triangleMesh:{vertices,indices:[0,1,2,3,4,5]}
 };
 const qa:StageDefinition={
  metadata:{...stage.metadata,id:'b240-isolated-original-floorline-'+side},
  solids:[...stage.solids,extra],
  paintSurfaces:stage.paintSurfaces,navigationLinks:stage.navigationLinks
 };
 if(FROZEN.activationReady!==false||
    FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||
    qa.solids.length!==31||qa.solids[30]!==extra||
    qa.solids.slice(0,25).some((x,i)=>x!==FROZEN.solids[i])||
    qa.paintSurfaces!==FROZEN.paintSurfaces||
    qa.navigationLinks!==FROZEN.navigationLinks)
    throw Error('B240_ISOLATION_FROZEN_25_17_26_VIOLATION');
 return qa;
}
