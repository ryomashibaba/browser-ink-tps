import {describe,it,expect} from 'vitest';
import {auditF3kGalleryManifest,type F3kGalleryManifest}
 from './UndertowF3KFamilyGallery';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
function fixture():F3kGalleryManifest{
 return {schema:'T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1',
 sourceSHA256:T21_F3G_SOURCE_SHA256,verifiedAgainstPinnedSource:true,
 sourceGeometrySpace:'ORIGINAL_OBJ_LOCAL_UNPLACED',
 viewerPlacement:'ISOLATED_NORMALIZED_SHOWCASE',
 stagePlayableAuthority:'NONE',productionAuthorization:false,
 instanceMatricesRecovered:false,actorPlacementRecovered:false,
 stageCollisionSolidsAdded:0,navigationLinksAdded:0,
 scoreableSurfacesAdded:0,inferredFloorOrRouteAdded:0,
 components:[{family:'BridgeMetal00',representativeObject:'FldObj_Temple01_Set__BridgeMetal00',
 originalTriangles:3,min:[-1,-2,0],max:[3,2,4],file:'f3k-family-01.bin',
 bytes:108,sha256:'a'.repeat(64)}]};
}
describe('F3K isolated original mesh gallery safety',()=>{
 it('accepts pinned original-local visual-only content',()=>{
  expect(auditF3kGalleryManifest(fixture())).toEqual({
   sourceOnly:true,componentCount:1,totalOriginalTriangles:3,physicalStageEdits:0});
 });
 it('rejects counterfeit actor placements, stage authorizations or hashes',()=>{
  expect(()=>auditF3kGalleryManifest({...fixture(),
   actorPlacementRecovered:true as unknown as false})).toThrow();
  expect(()=>auditF3kGalleryManifest({...fixture(),
   stageCollisionSolidsAdded:1 as unknown as 0})).toThrow();
  expect(()=>auditF3kGalleryManifest({...fixture(),
   components:[{...fixture().components[0]!,file:'../../unsafe.bin'}]})).toThrow();
  expect(()=>auditF3kGalleryManifest({...fixture(),
   components:[{...fixture().components[0]!,bytes:99}]})).toThrow();
 });
});