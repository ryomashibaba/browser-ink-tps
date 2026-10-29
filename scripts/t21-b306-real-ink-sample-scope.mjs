/** B306 truthful scope audit: genuine original owned-cell PROJECTION SAMPLES
 * are never equivalent to all rendered ink or representative gameplay. */
export function b306AuditSampleScope(realInk,start,paused){
 if(!realInk||realInk.originalStageAuthority!=='25/17/26/0'||
    !Number.isSafeInteger(realInk.nativeTick)||realInk.nativeTick!==paused.tick||
    realInk.actualHumanShots<1||realInk.actualHumanPaintCells<1||
    !Array.isArray(realInk.sampledProjectedCells)||
    realInk.sampledProjectedCells.length<1||
    realInk.sampledProjectedCells.length!==realInk.paintSampleCount||
    !Array.isArray(start)||start.length!==3||
    !Array.isArray(paused.player?.position)||paused.player.position.length!==3)
  throw Error('B306_UNPROVEN_REAL_INK_SAMPLE_SCOPE');
 const W=1600,H=900,pts=realInk.sampledProjectedCells;
 const valid=pts.filter(s=>Array.isArray(s.screenPx)&&
  s.screenPx.length>=3&&s.screenPx.every(Number.isFinite)&&
  s.insideViewport===true&&s.inFront===true&&
  s.team==='A'&&typeof s.surfaceId==='string'&&s.surfaceId.length>0);
 if(valid.length!==pts.length)throw Error('B306_INVALID_ORIGINAL_PROJECTION');
 const xs=valid.map(s=>s.screenPx[0]),ys=valid.map(s=>s.screenPx[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs);
 const minY=Math.min(...ys),maxY=Math.max(...ys);
 const sourceIds=[...new Set(valid.map(s=>s.surfaceId))].sort();
 const area=(maxX-minX)*(maxY-minY),fraction=area/(W*H);
 const distance=Math.hypot(...paused.player.position.map((v,i)=>v-start[i]));
 if(!Number.isFinite(distance)||!Number.isFinite(fraction))
  throw Error('B306_NONFINITE_NATIVE_SOURCE_TRAVEL_OR_AREA');
 const fovs=[63,76,52].map(fov=>{
  const projectionScale=Math.tan(63*Math.PI/360)/Math.tan(fov*Math.PI/360);
  const w=(maxX-minX)*projectionScale,h=(maxY-minY)*projectionScale;
  return {fovDegrees:fov,projectedSampleEnvelopeAreaPixels:w*h,
   projectedSampleEnvelopeScreenFraction:w*h/(W*H),
   derivedOnlyNotMeasuredFramebuffer:true};
 });
 return {schema:'B306_REAL_NATIVE_PAINT_SAMPLE_SCOPE_NOT_ART_CERTIFICATION',
  source:'25/17/26/0',nativeTick:realInk.nativeTick,
  trueHumanShots:realInk.actualHumanShots,
  trueHumanChangedCells:realInk.actualHumanPaintCells,
  trulySampledOwnerCells:valid.length,distinctSampledPaintSurfaces:sourceIds,
  physicalPlayerMovementMeters:distance,viewport:[W,H],
  baselineOwnerSampleBoundingBox:[minX,minY,maxX,maxY],
  baselineSampleEnvelopeAreaPixels:area,
  baselineSampleEnvelopeScreenFraction:fraction,
  derivedOnlyCameraProjection:fovs,
  shortLocalStudyNotFullSceneReview:fraction<.01&&sourceIds.length<=2,
  sampleEnvelopeNotFilledPaintCoverage:true,
  sampledPositionsNotOcclusionCertification:true,
  cannotExtrapolateSampleToFullMatch:true,
  sourceActorWorldEdited:false,physicalConnectivityCertified:false,
  artAccepted:false,full4v4Certified:false,productionAuthorized:false};
}
