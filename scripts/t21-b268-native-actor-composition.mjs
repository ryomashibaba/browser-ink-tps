/** B268: exact existing-eight-actor display-only real Chrome A-B-A.
 * This is a research hypothesis; native frame improvement is NOT assumed. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

export async function captureB268ActorComposition(label,
 {evaluate,screenshot,inspect,output}){
 const fail=(tag,detail='')=>{throw Error('B268_'+tag+'_'+label+detail);};
 const pre=await evaluate('window.__t21F3.snapshot()');
 if(!pre.paused||pre.matchState!=='STAGING'||
    pre.b268SourceActorComposition?.requested!==true||
    pre.b268SourceActorComposition?.variant!=='B248_ORIGINAL'||
    pre.b255SourceActorStudy?.presentation!=='HUMANOID'||
    pre.b258NativeCameraComposition?.profile!=='BASELINE'||
    pre.b259RasterLayerAudit?.mask!=='BASELINE'||
    pre.b260OriginalSourceMaterialAudit?.hiddenMaterial!==null||
    !pre.texturedSourceF3l?.enabled||
    pre.originalSourceSolids!==25||pre.originalPaintSurfaces!==17||
    pre.originalSourceNavigationLinks!==26||
    pre.sourceScoreablePromotions!==0)
  fail('SOURCE_REVIEW_BASELINE_NOT_AUTHORIZED');
 const ownerBefore=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(ownerBefore.source!=='25/17/26/0'||
    ownerBefore.sourceUvTriangles!==57578||
    ownerBefore.sourcePaintSurfaces!==17||
    ownerBefore.ownedCells!==ownerBefore.ownedA+ownerBefore.ownedB||
    (label==='REAL_INK'&&
      (ownerBefore.ownedCells===0||ownerBefore.samplesInsideViewport===0))||
    (label==='FROZEN'&&ownerBefore.ownedCells!==0))
  fail('OWNER_GRID_SOURCE_DRIFT');
 const A=await screenshot('B268_'+label+'_A_EXISTING_ACTORS');
 const selected=await evaluate(
  'window.__t21F3.setB268SourceActorComposition("B268_COMPACT")');
 if(selected.mode!=='B268_COMPACT'||selected.existingNativeActors!==8||
    selected.existingRealActors!==8||selected.realCpuActors!==7||
    selected.originalStage!=='25/17/26/0'||
    selected.originalUvTriangles!==57578||
    selected.renderOnly!==true||
    selected.sourceOpticalMeshesModified!==0||
    selected.solidsAdded!==0||selected.paintSurfacesAdded!==0||
    selected.navLinksAdded!==0||selected.scoreableSurfacesAdded!==0||
    selected.actorPositionsModified!==0||selected.artAccepted!==false||
    selected.productionAuthorized!==false)
  fail('ORIGINAL_NATIVE_ACTOR_BOUNDARY');
 await sleep(270);
 const B=await screenshot('B268_'+label+'_B_COMPACT_RESEARCH');
 const reverted=await evaluate(
  'window.__t21F3.setB268SourceActorComposition("B248_ORIGINAL")');
 if(reverted.mode!=='B248_ORIGINAL'||
    reverted.existingNativeActors!==8||
    reverted.actorPositionsModified!==0)fail('ACTOR_VISUAL_RESTORE_API');
 await sleep(270);
 const A2=await screenshot('B268_'+label+'_A2_ACTOR_RESTORED');
 const pixel=inspect(
  readFileSync(resolve(output,A.name+'.png')),
  readFileSync(resolve(output,B.name+'.png')),
  readFileSync(resolve(output,A2.name+'.png')));
 const post=await evaluate('window.__t21F3.snapshot()');
 const ownerAfter=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(!pixel.appearanceRestored||
    pixel.originalUvRestoration.changedPixels!==0||
    pixel.uvVsFlat.changedPixels<500||
    pixel.uvVsFlat.changedByAtLeastEight<200||
    pre.tick!==post.tick||
    JSON.stringify(pre.player.position)!==JSON.stringify(post.player.position)||
    post.b268SourceActorComposition?.variant!=='B248_ORIGINAL'||
    post.originalSourceSolids!==25||post.originalPaintSurfaces!==17||
    post.originalSourceNavigationLinks!==26||
    post.sourceScoreablePromotions!==0||
    ownerBefore.ownedCells!==ownerAfter.ownedCells||
    JSON.stringify(ownerBefore.samples)!==JSON.stringify(ownerAfter.samples))
  fail('GENUINE_SOURCE_ACTOR_ABA_PIXEL_OR_OWNERSHIP_DRIFT',
   JSON.stringify({changed:pixel.uvVsFlat,
    restored:pixel.originalUvRestoration}));
 const report={
  schema:'B268_REAL_NATIVE_EIGHT_ACTOR_COMPOSITION_ABA',
  context:label,A,B,A2,pixels:pixel,
  verifiedNativeActorIds:selected.existingCpuActorIds,
  originalHumanAndCpuActors:8,
  nativeOwnedPaintCells:ownerBefore.ownedCells,
  nativeOnscreenOwnedSampleCenters:ownerBefore.samplesInsideViewport,
  originalUvTriangles:57578,originalStage:'25/17/26/0',
  renderOnly:true,actorPositionChanges:0,originalMeshMutations:0,
  realPaintGridChanged:0,originalScoringMutations:0,
  improvesArtCertified:false,actualRenderedInkPixelsCertified:false,
  artAccepted:false,unrestricted4v4Certified:false,
  productionAuthorized:false
 };
 writeFileSync(resolve(output,'b268-'+label.toLowerCase()+'-native-actor-composition-aba.json'),
  JSON.stringify(report,null,2));
 console.log('B268_REAL_WEBGL2_SOURCE_ACTOR_RESTORED_PASS',JSON.stringify({
  context:label,changedPixels:pixel.uvVsFlat.changedPixels,
  restoredPixels:pixel.originalUvRestoration.changedPixels,
  nativePaintCells:ownerBefore.ownedCells,artAccepted:false
 }));
 return report;
}
