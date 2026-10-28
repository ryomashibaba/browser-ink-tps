/** B269: original source native 8-actor rear-identity art candidate.
 * Genuine 1600x900 Chrome WebGL2 A/B/A, never source geometry changes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
export async function captureB269RearIdentity(label,
 {evaluate,screenshot,inspect,output}){
 const fail=(x)=>{throw Error('B269_REAL_NATIVE_'+x+'_'+label);};
 const before=await evaluate('window.__t21F3.snapshot()');
 if(before.paused!==true||before.matchState!=='STAGING'||
    before.b268SourceActorComposition?.variant!=='B248_ORIGINAL'||
    !before.b268SourceActorComposition?.requested||
    before.b255SourceActorStudy?.presentation!=='HUMANOID'||
    before.b258NativeCameraComposition?.profile!=='BASELINE'||
    before.b259RasterLayerAudit?.mask!=='BASELINE'||
    before.b260OriginalSourceMaterialAudit?.hiddenMaterial!==null||
    before.originalSourceSolids!==25||before.originalPaintSurfaces!==17||
    before.originalSourceNavigationLinks!==26||
    before.sourceScoreablePromotions!==0)
  fail('PRECONDITION_ORIGINAL_EIGHT_ACTORS');
 const owner=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(owner.source!=='25/17/26/0'||owner.sourceUvTriangles!==57578||
    owner.sourcePaintSurfaces!==17||owner.ownedCells!==owner.ownedA+owner.ownedB||
    (label==='REAL_INK'&&
      (owner.ownedCells===0||owner.samplesInsideViewport===0))||
    (label==='FROZEN'&&owner.ownedCells!==0))
  fail('ORIGINAL_OWNER_PROVENANCE');
 const A=await screenshot('B269_'+label+'_A_B248_ORIGINAL');
 const applied=await evaluate(
  'window.__t21F3.setB268SourceActorComposition("B269_REAR_IDENTITY")');
 if(applied.mode!=='B269_REAR_IDENTITY'||applied.existingNativeActors!==8||
    applied.existingRealActors!==8||applied.realCpuActors!==7||
    applied.source!=='25/17/26/0'||applied.originalUvTriangles!==57578||
    applied.renderOnly!==true||applied.actorPositionsModified!==0||
    applied.originalStage!=='25/17/26/0'||applied.solidsAdded!==0||
    applied.paintSurfacesAdded!==0||applied.navLinksAdded!==0||
    applied.scoreableSurfacesAdded!==0||applied.productionAuthorized!==false)
  fail('SOURCE_ART_INTEGRITY');
 await sleep(260);
 const B=await screenshot('B269_'+label+'_B_REAR_IDENTITY');
 const restore=await evaluate(
  'window.__t21F3.setB268SourceActorComposition("B248_ORIGINAL")');
 if(restore.mode!=='B248_ORIGINAL'||restore.existingNativeActors!==8)
  fail('SOURCE_ACTOR_RESTORATION_DENIED');
 await sleep(260);
 const A2=await screenshot('B269_'+label+'_A2_B248_RESTORED');
 const pixels=inspect(readFileSync(resolve(output,A.name+'.png')),
  readFileSync(resolve(output,B.name+'.png')),
  readFileSync(resolve(output,A2.name+'.png')));
 const after=await evaluate('window.__t21F3.snapshot()');
 const ownerAfter=await evaluate('window.__t21F3.auditB263NativePaintProjection()');
 if(!pixels.appearanceRestored||
    pixels.originalUvRestoration.changedPixels!==0||
    pixels.uvVsFlat.changedPixels<500||
    before.tick!==after.tick||
    JSON.stringify(before.player.position)!==JSON.stringify(after.player.position)||
    after.b268SourceActorComposition?.variant!=='B248_ORIGINAL'||
    after.originalSourceSolids!==25||after.originalPaintSurfaces!==17||
    after.originalSourceNavigationLinks!==26||
    after.sourceScoreablePromotions!==0||
    owner.ownedCells!==ownerAfter.ownedCells||
    JSON.stringify(owner.samples)!==JSON.stringify(ownerAfter.samples))
  fail('SOURCE_INK_OR_FRAME_RESTORE');
 const proof={
  schema:'B269_GENUINE_NATIVE_REAR_READABILITY_ABA',
  context:label,A,B,A2,pixels,nativeOwners:owner,
  nativeActorCount:8,source:'25/17/26/0',
  originalUvTriangles:57578,originalPaintSurfaces:17,
  originalCpuIds:applied.existingCpuActorIds,
  sourceGeometryMutations:0,gameplayActorsMoved:0,
  scoresChanged:0,ownerGridMutations:0,
  genuineFramebuffer:true,
  betterVisualQualityCertified:false,actualPaintPixelsVisibleCertified:false,
  artAccepted:false,unrestrictedOriginal4v4:false,productionAuthorized:false
 };
 writeFileSync(resolve(output,'b269-'+label.toLowerCase()+
  '-real-source-actor-rear-identity-aba.json'),JSON.stringify(proof,null,2));
 console.log('B269_GENUINE_WEBGL2_REAR_IDENTITY_ABA_PASS',JSON.stringify({
  context:label,changedPixels:pixels.uvVsFlat.changedPixels,
  restoredPixels:pixels.originalUvRestoration.changedPixels,
  ownerGridCells:owner.ownedCells,paintedPixelVisibilityUnverified:true,
  artAccepted:false
 }));
 return proof;
}
