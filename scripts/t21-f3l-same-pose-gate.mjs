/**
 * B490 local-only SOURCE F3L/registered-ground picture pair.
 * Confirms frame consistency, NOT optical alignment or production.
 */
export const B490_CAPTURE_AUTHORITY=Object.freeze({
 originalStage:'25/17/26/0',sourceOnly:true,localOnly:true,
 geometryWrites:0,actorWrites:0,scoreWrites:0,
 visualAlignmentCertified:false,official4v4Certified:false
});
const HOLD=reason=>Object.freeze({status:'HOLD',reason,visualAlignmentCertified:false});
function near(a,b,tolerance){
 return Array.isArray(a)&&Array.isArray(b)&&a.length===3&&b.length===3&&
  a.every((v,i)=>Number.isFinite(v)&&Number.isFinite(b[i])&&
   Math.abs(v-b[i])<=tolerance);
}
const camera=n=>n?.b399NativeCameraClearance?.cameraOpticalWitness;
export function b490ValidateSamePoseFrames(on,off){
 if(!on||!off)return HOLD('MISSING_REAL_SOURCE_SNAPSHOT');
 for(const frame of [on,off]){
  if(frame.originalSourceSolids!==25||frame.originalPaintSurfaces!==17||
     frame.originalSourceNavigationLinks!==26||
     frame.sourceScoreablePromotions!==0||
     frame.productionAuthorized!==false||
     frame.unrestricted4v4Certified!==false)
   return HOLD('ORIGINAL_STAGE_AUTHORITY_DRIFT');
  if(frame.paused!==true||frame.stopReason!==null||
     frame.matchState!=='PLAYING'||frame.player?.mode!=='HUMAN'||
     frame.cpu?.physicalRejoins?.length!==7)
   return HOLD('NOT_FROZEN_LIVE_SEVEN_CPU_WORLD');
  // Use true native KCC foot, not the prior milestone or F3L optical face.
  const foot=frame.b112OriginalHumanGround;
  if(foot?.genuineKccGrounded!==true||
     foot.lastOriginalSourceHitId!==
      'UndertowT21D:right-low-route-ramp-positive-z'||
     !Number.isFinite(foot.lastOriginalSourceGapMeters)||
     Math.abs(foot.lastOriginalSourceGapMeters)>.10)
   return HOLD('REAL_REGISTERED_RAMP_FOOT_NOT_PRESENT');
  if(frame.originalSourceStudyVisible!==false||
     frame.sourceOpticalStructuresVisible!==false||
     frame.fullSource?.enabled!==false||
     frame.environmentF3i?.visible!==false)
   return HOLD('UNREGISTERED_REFERENCE_OVERLAY_VISIBLE');
 }
 if(on.texturedSourceF3l?.status!=='READY'||
    on.texturedSourceF3l?.enabled!==true||
    on.texturedSourceF3l.totalOriginalTriangles!==57578||
    !Number.isSafeInteger(on.texturedSourceF3l.verifiedTextures)||
    on.texturedSourceF3l.verifiedTextures<8||
    on.b29VerifiedSourcePresentation?.selected!=='F3L_ORIGINAL_UV')
  return HOLD('REAL_ORIGINAL_UV_PACK_NOT_VERIFIED_OR_VISIBLE');
 if(off.texturedSourceF3l?.enabled!==false||
    off.b29VerifiedSourcePresentation?.selected!=='F3E_REFERENCE')
  return HOLD('REGISTERED_ONLY_VIEW_NOT_SELECTED');
 if(!Number.isSafeInteger(on.tick)||on.tick<1||on.tick!==off.tick||
    !near(on.player.position,off.player.position,.0001))
  return HOLD('REAL_PLAYER_OR_CLOCK_MOVED');
 if(!near(camera(on)?.realCameraEye,camera(off)?.realCameraEye,.001)||
    !near(camera(on)?.realCameraForward,camera(off)?.realCameraForward,.0001))
  return HOLD('ACTUAL_CAMERA_MOVED');
 return Object.freeze({
  status:'PASS_SAME_POSE_CAPTURE_READY',reason:null,
  nativeTick:on.tick,realPlayerBody:[...on.player.position],
  realCameraEye:[...camera(on).realCameraEye],
  realCameraForward:[...camera(on).realCameraForward],
  genuineCpuCount:7,source:'25/17/26/0',
  unchangedNativeWorld:true,verifiedF3lTriangles:57578,
  visualAlignmentCertified:false,normalWindowsRenderingCertified:false,
  physicalFullRouteCertified:false,officialWinner:'NONE',
  screenshotPairRequiresIndependentVisualReview:true
 });
}
