/** B265 real Chromium WebGL2 original METAL visibility A-B-A.
 * Uses the B260 protected source renderer and the B263 ownerGrid projection;
 * this does NOT remove a gameplay collider, alter ink, or grant art approval. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

export async function captureB265WallMetalAba(label,
 {evaluate,screenshot,inspect,output}){
 const fail=(message)=>{throw Error('B265_'+message+'_'+label);};
 const before=await evaluate('window.__t21F3.snapshot()');
 if(!before.paused||before.matchState!=='STAGING'||
    before.b260OriginalSourceMaterialAudit.hiddenMaterial!==null||
    !before.b263RealInkProjectionAudit.requested||
    !before.b260OriginalSourceMaterialAudit.requested||
    !before.b253SourceUvLiveInk.enabled||
    before.b259RasterLayerAudit.mask!=='BASELINE'||
    before.b262SourceQaFocusAudit.active||
    before.originalSourceSolids!==25||before.originalPaintSurfaces!==17||
    before.originalSourceNavigationLinks!==26||
    before.sourceScoreablePromotions!==0||
    before.b258NativeCameraComposition.profile!=='BASELINE')
  fail('UNVERIFIED_ORIGINAL_SOURCE_CAMERA_AND_MATERIAL_BASELINE');
 const original=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(original.nativeTick!==before.tick||
    original.source!=='25/17/26/0'||
    original.ownedCells!==original.ownedA+original.ownedB||
    original.samplesInsideViewport>original.sampledCells||
    original.sourcePaintSurfaces!==17||
    original.sourceUvTriangles!==57578||
    (label==='REAL_INK'&&
      (original.ownedCells===0||original.samplesInsideViewport===0)))
  fail('NATIVE_OWNER_PROJECTION_DRIFT');
 const A=await screenshot('B265_'+label+'_A_ORIGINAL_METAL_PRESENT');
 const raw=readFileSync(resolve(output,A.name+'.png'));
 const changed=await evaluate('window.__t21F3.setB260SourceMaterialHidden('+
  '"Fld_Temple01_WallMetal00")');
 if(changed.hiddenMaterial!=='Fld_Temple01_WallMetal00'||
    changed.materialKind!=='METAL'||changed.hiddenTriangles<1||
    changed.exactSourceMaterialIdentityVerified!==true||
    changed.source!=='25/17/26/0'||changed.originalUvTriangles!==57578||
    changed.actualPaintDisplayGroups!==17||
    changed.materialBytesChanged!==0||
    changed.originalTrianglesModified!==0||
    changed.stageSolidsModified!==0||
    changed.paintableSurfacesModified!==0||
    changed.navLinksModified!==0||
    changed.scoreableSurfacesModified!==0||
    changed.actorTransformsModified!==0||
    changed.productionAuthorized!==false||changed.artAccepted!==false)
  fail('PINNED_SOURCE_METAL_DRAW_TOGGLE_IDENTITY_FAILURE');
 await sleep(240);
 const B=await screenshot('B265_'+label+'_B_ORIGINAL_METAL_HIDDEN');
 const back=await evaluate('window.__t21F3.setB260SourceMaterialHidden(null)');
 if(back.hiddenMaterial!==null||
    back.originalVisibleGroups!==back.sourceMaterialGroups)
  fail('SOURCE_METAL_VISIBILITY_NOT_RESTORED');
 await sleep(240);
 const A2=await screenshot('B265_'+label+'_A2_RESTORED_METAL');
 const pixels=inspect(raw,
  readFileSync(resolve(output,B.name+'.png')),
  readFileSync(resolve(output,A2.name+'.png')));
 const after=await evaluate('window.__t21F3.snapshot()');
 const nativeAfter=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(!pixels.appearanceRestored||
    pixels.originalUvRestoration.maxChannelDelta>1||
    after.tick!==before.tick||
    JSON.stringify(after.player.position)!==
      JSON.stringify(before.player.position)||
    after.originalSourceSolids!==25||after.originalPaintSurfaces!==17||
    after.originalSourceNavigationLinks!==26||
    after.sourceScoreablePromotions!==0||
    after.b259RasterLayerAudit.mask!=='BASELINE'||
    after.b260OriginalSourceMaterialAudit.hiddenMaterial!==null||
    JSON.stringify(nativeAfter.samples)!==JSON.stringify(original.samples)||
    nativeAfter.ownedCells!==original.ownedCells)
  fail('SOURCE_METAL_ABA_INK_OR_WORLD_DRIFT');
 const report={schema:'B265_GENUINE_PINNED_METAL_SOURCE_ABA',
  label,A,B,A2,pixels,nativeOwnerGridProjection:original,
  metalMaterial:changed,source:'25/17/26/0',sourceUvTriangles:57578,
  noPaintShaderOrMaterialOpacityChange:true,
  opticalVisibilityOnly:true,
  sourceRayOcclusionIsNotProvenOpaque:true,
  actualInkPixelsCertified:false,
  artAccepted:false,unrestricted4v4Certified:false,
  productionAuthorized:false};
 writeFileSync(resolve(output,'b265-'+label.toLowerCase()+
   '-original-source-metal-aba.json'),JSON.stringify(report,null,2));
 console.log('B265_REAL_WEBGL2_ORIGINAL_METAL_ABA_PASS',JSON.stringify({
  context:label,originalMetalTriangles:changed.hiddenTriangles,
  changedPixels:pixels.uvVsFlat.changedPixels,
  changedRatio:pixels.uvVsFlat.ratio,
  restorationPixels:pixels.originalUvRestoration.changedPixels,
  ownedCells:original.ownedCells,
  sampledOnscreen:original.samplesInsideViewport,
  frameBufferInkCertified:false,artAccepted:false
 }));
 return report;
}
