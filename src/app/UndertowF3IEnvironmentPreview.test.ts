import {describe,it,expect} from 'vitest';
import {auditF3iEnvironmentManifest,type F3iEnvironmentManifest}
 from './UndertowF3IEnvironmentPreview';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
function sample():F3iEnvironmentManifest{
 return {schema:'T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1',
  sourceSHA256:T21_F3G_SOURCE_SHA256,verifiedAgainstPinnedSource:true,
  coordinateSpace:'ORIGINAL_OBJ_UNREGISTERED',
  stagePlayableAuthority:'NONE',productionAuthorization:false,
  stageCollisionSolidsAdded:0,navigationLinksAdded:0,
  scoreableSurfacesAdded:0,inferredFloorOrRouteAdded:0,
  actorPlacementRecovered:false,environmentStageRegistrationRecovered:false,
  traversalAuthorityRecovered:false,
  backgroundTriangleCount:2,backgroundObjectCount:1,
  backgroundFaceCount:3,backgroundExcludedFaces:1,
  actorObjectCount:1,actorFaceCount:2,actorTriangles:2,
  largestUnplacedActors:[{name:'FldObj_Temple01_A',faces:2,triangles:2,
   min:[-2,0,0],max:[3,1,4]}],
  previewBin:{file:'f3i-environment-obj-space.bin',bytes:72,sha256:'0'.repeat(64)}
 };
}
describe('F3I separate environmental visual gate',()=>{
 it('keeps candidate backgrounds and actor inventory non-authoritative',()=>{
  expect(auditF3iEnvironmentManifest(sample())).toEqual({
   sourceOnly:true,candidateTriangles:2,
   actorObjectsAwaitingPlacement:1,stageSolidsAdded:0,scoreableSurfacesAdded:0});
 });
 it('refuses any forged actor placement, transformed stage, or mesh count',()=>{
  expect(()=>auditF3iEnvironmentManifest({...sample(),
   actorPlacementRecovered:true as unknown as false})).toThrow();
  expect(()=>auditF3iEnvironmentManifest({...sample(),
   coordinateSpace:'WORLD' as F3iEnvironmentManifest['coordinateSpace']})).toThrow();
  expect(()=>auditF3iEnvironmentManifest({...sample(),
   previewBin:{...sample().previewBin,bytes:73}})).toThrow();
  expect(()=>auditF3iEnvironmentManifest({...sample(),
   stageCollisionSolidsAdded:1 as unknown as 0})).toThrow();
 });
});
