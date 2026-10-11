import {describe,it,expect} from 'vitest';
import {auditF3gPackManifest,f3hSourceMaterialStyle,T21_F3G_SOURCE_SHA256}
 from './UndertowF3GWholeSourcePreview';
describe('F3G whole-original source pack source authority',()=>{
 const group=(kind:'FLOOR'|'SLOPE'|'GLASS')=>({
  kind,file:'original-'+kind.toLowerCase()+'.bin',
  triangles:10,bytes:360,sha256:'a'.repeat(64)
 });
 const valid=()=>({
  schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1' as const,
  sourceSHA256:T21_F3G_SOURCE_SHA256,
  verifiedAgainstPinnedSource:true,
  includedOriginalTriangles:1600,
  groups:[{...group('FLOOR'),triangles:1580,bytes:1580*36},
   group('SLOPE'),group('GLASS')],
  stagePlayableAuthority:'NONE' as const,
  stageCollisionSolidsAdded:0 as const,stagePaintSurfacesAdded:0 as const,
  navigationLinksAdded:0 as const,scoreableSurfacesAdded:0 as const,
  inferredFloorOrRouteAdded:0 as const,productionAuthorization:false as const
 });
 it('solid depth write and safe source floor review modes',()=>{
  expect(f3hSourceMaterialStyle('FLOOR','SOLID')).toEqual(
   {opacity:1,depthWrite:true,opaque:true});
  expect(f3hSourceMaterialStyle('GLASS','SOLID').opaque).toBe(false);
  expect(f3hSourceMaterialStyle('SUPPORT','TRAVERSAL').opacity).toBeLessThan(.3);
  expect(f3hSourceMaterialStyle('FLOOR','TRAVERSAL').depthWrite).toBe(true);
  expect(f3hSourceMaterialStyle('FLOOR','X_RAY').depthWrite).toBe(false);
 });
 it('requires exact pinned original hash and all non-gameplay flags',()=>{
  expect(auditF3gPackManifest(valid()).sourceTriangles).toBe(1600);
  expect(()=>auditF3gPackManifest({...valid(),sourceSHA256:'0'.repeat(64)}))
   .toThrow('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
  expect(()=>auditF3gPackManifest({...valid(),navigationLinksAdded:1 as 0}))
   .toThrow('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
  const coverage={staticObjectCount:2,unplacedFldObjFaceCount:4,
   skippedFldBgFaceCount:3,regionTriangles:{positiveZ:800,core:400,negativeZ:400},
   actorPlacementRecovered:false as const,traversalAuthorityRecovered:false as const};
  expect(auditF3gPackManifest({...valid(),coverage}).sourceTriangles).toBe(1600);
  expect(()=>auditF3gPackManifest({...valid(),coverage:{...coverage,
   actorPlacementRecovered:true as unknown as false}})).toThrow('T21_F3H_SOURCE_COVERAGE_UNTRUSTED');
  expect(()=>auditF3gPackManifest({...valid(),includedOriginalTriangles:1599}))
   .toThrow('T21_F3G_UNVERIFIED_GROUP_TRIANGLE_TOTAL');
 });
});
