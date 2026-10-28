/** B281 genuine native-source safety: observe airborne Rapier HUMAN versus
 * nonphysical eighth Recast Crowd steering avatar in saved Chrome snapshots.
 * No game state mutation, synthetic time, fake floor, agent placement or input.
 */
export const B281_SOURCE='25/17/26/0';
const HIGH='UndertowT21D:spawn-high-positive-z';
const FIRST_DROP='UndertowT21D:first-drop-landing-positive-z';
export function b281AuditNativeAirborneProxyAndLowerSource(samples){
 if(!Array.isArray(samples)||samples.length<2||samples.length>9)
  throw Error('B281_INVALID_NATIVE_KCC_SAMPLES');
 const frames=samples.map((s,index)=>{
  const native=s?.b112OriginalHumanGround,crowd=s?.humanCrowd,
   actors=s?.cpuContinuity?.actors;
  if(s?.stopReason||s?.paused!==false||
     !Number.isSafeInteger(s?.tick)||s.tick<1||
     s?.originalSourceSolids!==25||
     s?.originalPaintSurfaces!==17||
     s?.originalSourceNavigationLinks!==26||
     s?.sourceScoreablePromotions!==0||
     s?.productionAuthorized!==false||
     s?.unrestricted4v4Certified!==false||
     native?.enabled!==true||
     !Array.isArray(s?.player?.position)||
     s.player.position.length!==3||
     !s.player.position.every(Number.isFinite)||
     !crowd||crowd.sourceNavmeshChanged!==false||
     crowd.playerFootMoved!==false||crowd.fakeHumanPhysicalActors!==0||
     !Array.isArray(actors)||actors.length!==7||
     !actors.every(x=>typeof x?.id==='string')||
     (index>0&&s.tick<=samples[index-1].tick))
   throw Error('B281_GENUINE_ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING');
  const rapierAirborne=native.genuineKccGrounded===false;
  const proxyUnsafe=rapierAirborne&&crowd.active===true;
  return {
   tick:s.tick,sourceId:native.lastOriginalSourceHitId??null,
   genuineGrounded:native.genuineKccGrounded===true,
   rapierAirborne,
   eighthPassiveCrowdActive:crowd.active===true,
   airborneProxyUnsafe:proxyUnsafe,
   passiveProxyExcludedNativeTicks:crowd.airborneOrUnverifiableTicks,
   nativeSevenCpuIdCount:actors.length,
   originalBody:s.player.position.slice(),
   noFakeCpuOrHumanGeometry:true
  };
 });
 if(frames.some(x=>x.airborneProxyUnsafe))
  throw Error('B281_NATIVE_AIRBORNE_EIGHTH_RECAST_PROXY_UNSAFE');
 if(frames[0].sourceId!==HIGH||!frames[0].genuineGrounded)
  throw Error('B281_ORIGINAL_HIGH_SOURCE_START_MISSING');
 if(!frames.some(x=>x.rapierAirborne))
  throw Error('B281_NO_OBSERVED_REAL_RAPIER_AIRBORNE_TRANSITION');
 const end=frames.at(-1);
 if(end.sourceId!==FIRST_DROP||end.genuineGrounded!==true)
  throw Error('B281_ORIGINAL_FIRST_DROP_LANDING_NOT_GENUINELY_GROUNDED');
 if(!Number.isFinite(end.originalBody[1])||
    end.originalBody[1]<3.65||end.originalBody[1]>4.2)
  throw Error('B281_FIRST_DROP_ORIGINAL_Y_BAND_NOT_PROVEN');
 return {
  schema:'B281_REAL_RAPIER_AIRBORNE_PASSIVE_CROWD_SAFE',
  status:'ORIGINAL_FIRST_DROP_KCC_AND_AIRBORNE_PROXY_OBSERVED',
  genuineNativeSampleCount:frames.length,
  realRapierAirborneSamples:frames.filter(x=>x.rapierAirborne).length,
  realAirborneSamplesWithPassiveProxy:0,
  verifiedGenuineFirstDropLandingTick:end.tick,
  verifiedOriginalLandingSourceId:end.sourceId,
  originalLandBody:[...end.originalBody],
  nativeSevenCpuIdCount:7,
  sampleWitnesses:frames,source:B281_SOURCE,
  actualCpuHumanSteeringAtLandingCertified:false,
  centralUnderpassConnected:false,unrestricted4v4Certified:false,
  scoreableOriginalSource:0,artAccepted:false,
  productionAuthorized:false
 };
}
