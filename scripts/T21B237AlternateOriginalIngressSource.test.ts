import {describe,it,expect} from 'vitest';
import {b237OriginalIngressSourceScreen,type B237SourceCandidate}
 from '../src/stage/undertow/B237OriginalIngressSourceScreen';
import {UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES}
 from '../src/stage/undertow/UndertowSpillwayBroadStaticSourceGeometry';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES}
 from '../src/stage/undertow/UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES}
 from '../src/stage/undertow/UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES}
 from '../src/stage/undertow/UndertowSpillwaySourceNativeSupplementGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES}
 from '../src/stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES}
 from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
import {UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES}
 from '../src/stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
import {UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES}
 from '../src/stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import {UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES}
 from '../src/stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
const c:B237SourceCandidate[]=[
 ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES.map(m=>({
  family:'BROAD_STATIC',id:m.id,sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_SOURCE_BATCH2_MESHES.map(m=>({
  family:'PASS18C_BATCH2',id:m.id,sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES.map(m=>({
  family:'PASS18G_REVIEW',id:m.id,sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES.map(m=>({
  family:'PASS18G_SUPPLEMENT',id:m.id,sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES.map(m=>({
  family:'PHASE12C_ORIGINAL_SHA_PINNED',id:m.id,
  sourceComponent:m.sourceComponentKey,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES.map(m=>({
  family:'PHASE12D_ORIGINAL_SHA_PINNED',id:m.id,
  sourceComponent:m.sourceComponentKey,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.map(m=>({
  family:'PHASE9_DOWNFACES',id:m.id,
  sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.map(m=>({
  family:'PHASE7_FRAMES',id:m.id,
  sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 })),
 ...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.map(m=>({
  family:'PHASE8_STATIC_ORIGINAL_FLOAT64',id:m.id,
  sourceComponent:m.sourceComponentId,
  sourceMaterial:m.sourceMaterial,side:m.side,
  originalVertices:m.vertices,
  originalRuntimePromotionAuthorized:m.runtimePromotionAuthorized,
  originalSourceShapeNotGameplayAuthority:true as const
 }))
];
describe('B237 source-only alternate authentic right-low to narrow Slope01 geometry search',()=>{
 it('screens exact original review-only components without altering frozen official geometry',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  const plus=b237OriginalIngressSourceScreen('POSITIVE_Z',
   c.filter(x=>x.side==='POSITIVE_Z'));
  const minus=b237OriginalIngressSourceScreen('NEGATIVE_Z',
   c.filter(x=>x.side==='NEGATIVE_Z'));
  console.log('B237_ORIGINAL_SOURCE_3D_RIGHT_LOW_TO_SLOPE01_CANDIDATES',
   JSON.stringify({positive:plus,negative:minus,
    totalCatalog:c.length,firstFiveCatalogs:Array.from(new Set(c.map(x=>x.family))),
    limitedSourceComponentReview:true,noWeldedInventedFloor:true,
    realCpuOriginalSourceTraversalTested:false,
    officialOriginalStage:'25/17/26/0',crossTeamRoutes:'0/12',
    unrestricted4v4Certified:false,productionAuthorized:false}));
  for(const r of [plus,minus]){
   expect(r.candidateCatalogCount).toBeGreaterThan(25);
   expect(r.candidateRegionCount).toBeGreaterThan(0);
   expect(r.exactSlope01TopY).toBeCloseTo(2.93,3);
   expect(r.originalRightLowContourY).toBe(4.5);
   expect(r.candidateScreenCompleteSourceScan).toBe(false);
   expect(r.candidateScreenCertifiesOriginalRoute).toBe(false);
   expect(r.sanctionedNewFaces).toBe(0);
   expect(r.actualCpuSourceRoutesCertified).toBe('0/12');
   expect(r.productionAuthorized).toBe(false);
   expect(r.bestCandidateRows.every(x=>
    x.originalRuntimePromotionAuthorized===false&&
    x.routeAuthority==='NONE'&&
    x.sourceFaceConnectivityBetweenContactsVerified===false&&
    x.physicalCpuTraversalVerified===false)).toBe(true);
  }
 });
 it('rejects fake source authorization, mislabeled side and duplicate entries',()=>{
  const x=c.find(x=>x.side==='POSITIVE_Z')!;
  expect(()=>b237OriginalIngressSourceScreen('POSITIVE_Z',[
   {...x,originalRuntimePromotionAuthorized:true as false}]))
    .toThrow('B237_NONORIGINAL_OR_UNTRUSTED_SOURCE_CANDIDATE');
  expect(()=>b237OriginalIngressSourceScreen('POSITIVE_Z',[x,x]))
    .toThrow('B237_DUPLICATE_SOURCE_CANDIDATE');
  expect(()=>b237OriginalIngressSourceScreen('NEGATIVE_Z',[x]))
    .toThrow('B237_NONORIGINAL_OR_UNTRUSTED_SOURCE_CANDIDATE');
 });
});
