/** B271: truly frozen native source 17-PaintSurface registration witness.
 * This is an original optical-vs-Rapier comparison, NOT 17 gameplay paints.
 */
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export async function captureB271MultiSurface(label,{evaluate,output}){
 const err=(code)=>{throw Error('B271_'+code+'_'+label)};
 const before=await evaluate('window.__t21F3.snapshot()');
 if(!before.paused||before.matchState!=='STAGING'||
  before.originalSourceSolids!==25||before.originalPaintSurfaces!==17||
  before.originalSourceNavigationLinks!==26||before.sourceScoreablePromotions!==0||
  before.b258NativeCameraComposition?.profile!=='BASELINE'||
  before.b259RasterLayerAudit?.mask!=='BASELINE'||
  before.b260OriginalSourceMaterialAudit?.hiddenMaterial!==null||
  before.b255SourceActorStudy?.presentation!=='HUMANOID'||
  !before.b253SourceUvLiveInk?.enabled)
  err('UNVERIFIED_ORIGINAL_PAUSED_17_SURFACES');
 const owned=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 const actual=await evaluate('window.__t21F3.auditB271OriginalMultiSurfaceRegistration()');
 if(actual.schema!=='B271_SEVENTEEN_ORIGINAL_FOOTPRINT_OPTICAL_PHYSICAL_REGISTRATION'||
  actual.source!=='25/17/26/0'||
  actual.originalPaintSurfaces!==17||
  actual.originalRapierSolids!==25||
  actual.originalNavLinks!==26||
  actual.originalScoreables!==0||
  actual.originalUvTriangles!==57578||
  actual.nativeTick!==before.tick||
  actual.nativeOriginalOwnedCells!==owned.ownedCells||
  actual.nativeOriginalOwnedA!==owned.ownedA||
  actual.nativeOriginalOwnedB!==owned.ownedB||
  actual.sourceStageSurfaceRows?.length!==17||
  actual.sampledActiveProbeRays<17||
  actual.sampledActiveProbeRays>51||
  actual.sourceStageSurfaceRows.reduce((n,x)=>n+x.sampledActiveProbes,0)!==
    actual.sampledActiveProbeRays||
  actual.sourceStageSurfaceRows.reduce((n,x)=>n+x.actualOwnerCells,0)!==
    actual.nativeOriginalOwnedCells||
  actual.sourceStageSurfaceRows.some(x=>x.sampledActiveProbes<1||
    x.sampledActiveProbes>3||x.rays.length!==x.sampledActiveProbes)||
  actual.originalNavigationEndpoints!==52||
  actual.navEndpointNotPath!==true||
  actual.paintedPixelVisibilityNotCertified!==true||
  actual.officialOriginalConnectivityUncertified!==true||
  actual.artAccepted!==false||actual.productionAuthorized!==false||
  (label==='FROZEN'&&actual.nativeOriginalOwnedCells!==0)||
  (label==='REAL_INK'&&(
    actual.nativeOriginalOwnedCells<=0||
    actual.ownedSurfaces<=0||
    actual.ownedSurfaces>=17)))
  err('MISSING_UNMODIFIED_ALL_SEVENTEEN_REAL_SOURCE_SURFACES');
 const after=await evaluate('window.__t21F3.snapshot()');
 const ownedAfter=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(after.tick!==before.tick||
  JSON.stringify(after.player.position)!==JSON.stringify(before.player.position)||
  after.originalSourceSolids!==25||after.originalPaintSurfaces!==17||
  after.originalSourceNavigationLinks!==26||after.sourceScoreablePromotions!==0||
  after.b258NativeCameraComposition?.profile!=='BASELINE'||
  after.b259RasterLayerAudit?.mask!=='BASELINE'||
  after.b260OriginalSourceMaterialAudit?.hiddenMaterial!==null||
  JSON.stringify(ownedAfter.perSurface)!==JSON.stringify(owned.perSurface)||
  JSON.stringify(ownedAfter.samples)!==JSON.stringify(owned.samples))
  err('READ_ONLY_NATIVE_WORLD_OR_INK_DRIFT');
 const proof={schema:'B271_REAL_WEBGL2_NATIVE_ALL_17_SOURCE_REGISTRATION',
  context:label,source:'25/17/26/0',
  genuineOriginalSource:true,actualOriginalPaintSurfaceCount:17,
  actualPaintedCells:actual.nativeOriginalOwnedCells,
  originalTouchedPaintSurfaces:actual.ownedSurfaces,
  sampledFootprintProbeRays:actual.sampledActiveProbeRays,
  noMovingActorsOrChangingOwnerGrid:true,
  report:actual,visualArtistPass:false,
  opticalTriangleIsCollider:false,
  navEndpointCertifiesRoute:false,
  actualPaintPixelVisibilityCertified:false,
  originalStageCertificationUnchanged:true,
  artAccepted:false,productionAuthorized:false};
 writeFileSync(resolve(output,
  'b271-'+label.toLowerCase()+'-original-seventeen-surface-registration.json'),
  JSON.stringify(proof,null,2));
 console.log('B271_NATIVE_17_SOURCE_SURFACE_REGISTRATION_PASS',JSON.stringify({
  context:label,surfaces:actual.sourceStageSurfaceRows.length,
  activeProbeRays:actual.sampledActiveProbeRays,
  actualOwnedCells:actual.nativeOriginalOwnedCells,
  distinctPaintedSurfaces:actual.ownedSurfaces,
  opticalBefore:actual.opticalBeforeCount,
  physicalBefore:actual.physicalBeforeCount,
  viewportSamples:actual.viewportSamples,
  realRoutesCertified:0,productionAuthorized:false}));
 return proof;
}
