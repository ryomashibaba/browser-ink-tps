import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {b272AuditIndependentNativeEvidence} from './t21-b272-distinct-native-route-evidence.mjs';
function genuine(){
 const rows=Array.from({length:17},(_,i)=>({
  surfaceId:'UndertowT21D:source-'+i+':paint',
  actualOwnerCells:i===0?115:0,activeFootprintCells:200,
  sampledActiveProbes:1,
  rays:[{nativeWorldMeters:[i,7,66],rayLengthMeters:13,
   originalOpticalTrianglesScanned:57578,
   realPaintedPixelVisibilityCertified:false,
   navEndpointProvesReachability:false,
   opticalHitsBeforeSourcePaint:1,physicalBeforeSourcePaint:false}]
 }));
 const s={schema:'B271_SEVENTEEN_ORIGINAL_FOOTPRINT_OPTICAL_PHYSICAL_REGISTRATION',
  source:'25/17/26/0',originalUvTriangles:57578,
  originalPaintSurfaces:17,originalRapierSolids:25,originalNavLinks:26,
  originalScoreables:0,navEndpointNotPath:true,
  paintedPixelVisibilityNotCertified:true,
  officialOriginalConnectivityUncertified:true,artAccepted:false,
  sourceStageSurfaceRows:rows,nativeOriginalOwnedCells:115,
  nativeOriginalOwnedA:115,nativeOriginalOwnedB:0,
  ownedSurfaces:1,sampledActiveProbeRays:17,viewportSamples:5,
  opticalBeforeCount:17,physicalBeforeCount:0};
 const reg={schema:'B271_REAL_WEBGL2_NATIVE_ALL_17_SOURCE_REGISTRATION',
  context:'REAL_INK',source:'25/17/26/0',genuineOriginalSource:true,
  artAccepted:false,productionAuthorized:false,actualPaintedCells:115,
  report:s};
 const b210={verdict:'B59_GENUINE_NATIVE_180_SECOND_SOURCE_SESSION_COMPLETE',
  required180SecondsOfNativeMatchClock:true,actualNativeSecondsElapsed:180,
  noArtificialQaTickAdvances:true,actualBrowserKeyboardMouse:true,
  b172ContinuousReal180sHumanParticipation:true,
  originalPhysicsTicks:11856,
  sourceAuthority:'25_SOLIDS_17_PAINTABLE_26_LINKS_0_SCOREABLE',
  actualCpuSevenPresent:true,actualCpuSourceRejoined:7,
  humanAcceptedShots:133,realHumanChangedInk:441,
  genuineCpuSourceShots:786,genuineCpuChangedInk:19267,
  naturalOpponentPathsCertified:0,
  b176TrueOriginalHumanLowerAfter180s:false,
  b176NativeRealKccSourceRoute:[],
  officialWinner:'NONE',originalNintendo4v4Certified:false};
 const legs={sourceAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  noSyntheticTickOrPaint:true,actualNativePlayerSegments:[
   {nativeTimeBucket20s:1,trueEndTick:2335,
    actualKccKeyboardMouseLegs:[
     {code:'KeyS',startTick:2257,endTick:2293,
      actualKccMovementMeters:2.637,truePlayerShotDelta:11,
      verifiedOriginalSupportId:'UndertowT21D:spawn-high-positive-z',
      actualRapierBody:[-.13,8.4,68.3]},
     {code:'KeyW',startTick:2293,endTick:2335,
      actualKccMovementMeters:1.594,truePlayerShotDelta:6,
      verifiedOriginalSupportId:'UndertowT21D:spawn-high-positive-z',
      actualRapierBody:[-.13,8.4,66.7]}]}
  ]};
 return [reg,b210,legs];
}
test('genuine 180 seconds proves bounded local physical play, NOT 17 connected paths',()=>{
 const r=b272AuditIndependentNativeEvidence(...genuine());
 assert.equal(r.realNativeOriginalPaintSurfaces,17);
 assert.equal(r.actuallyPaintedOriginalSurfacesB271,1);
 assert.equal(r.realHumanKeyboardMouseKccSegments,2);
 assert.equal(r.distinctNativeSupportIdsObserved,1);
 assert.equal(r.realKeyboardKccTravelMetersSum,4.231);
 assert.equal(r.confirmedContinuousCrossSurfaceOriginalRouteCount,0);
 assert.equal(r.genuineLowerFloorRouteReached,false);
 assert.equal(r.nonScoreableOriginalSurfaceRoutabilityCertified,false);
 assert.equal(r.screenPixelInkVisibilityCertified,false);
 assert.equal(r.artAccepted,false);
});
test('forged paint surface count, mask or samples are rejected',()=>{
 const a=genuine();a[0].report.sourceStageSurfaceRows[1].surfaceId=
  a[0].report.sourceStageSurfaceRows[0].surfaceId;
 assert.throws(()=>b272AuditIndependentNativeEvidence(...a),
  /SOURCE_SURFACE_PROBE_WITNESS/);
});
test('synthetic clocks, fictional support IDs and lower route promotion rejected',()=>{
 const a=genuine();a[1].noArtificialQaTickAdvances=false;
 assert.throws(()=>b272AuditIndependentNativeEvidence(...a),
  /INDEPENDENT_GENUINE_180S_KCC_AUTHORITY/);
 const b=genuine();b[2].actualNativePlayerSegments[0]
  .actualKccKeyboardMouseLegs[0].verifiedOriginalSupportId='';
 assert.throws(()=>b272AuditIndependentNativeEvidence(...b),
  /UNVERIFIED_KCC_NATIVE_WORLD_SEGMENT/);
 const c=genuine();c[1].b176TrueOriginalHumanLowerAfter180s=true;
 assert.throws(()=>b272AuditIndependentNativeEvidence(...c),
  /INDEPENDENT_GENUINE_180S_KCC_AUTHORITY/);
});
test('never treats optical ray crossing as a certified original route',()=>{
 const a=genuine();
 a[0].report.sourceStageSurfaceRows[5].rays[0].navEndpointProvesReachability=true;
 assert.throws(()=>b272AuditIndependentNativeEvidence(...a),
  /SOURCE_SURFACE_PROBE_WITNESS/);
});
