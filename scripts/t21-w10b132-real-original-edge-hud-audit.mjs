/**
 * B132: independent fail-closed audit of same-tab real Chrome state + DOM.
 * Read-only proof of in-play warnings, not physics safety or 4v4.
 */
const sources=new Set([
 'UndertowT21D:spawn-high-positive-z',
 'UndertowT21D:first-drop-landing-positive-z',
 'UndertowT21D:right-low-team-a'
]);
export function auditB132RealBrowserEdgeWitness(samples){
 if(!Array.isArray(samples)||samples.length<2)
  return {passed:false,reason:'TOO_FEW_REAL_SAMPLES',visibleOriginalSupportIds:[]};
 let failures=[],visible=new Set(),matched=[];
 let previousTick=-1;
 for(const s of samples){
  if(!Number.isSafeInteger(s.actualNativeTick)||
    s.actualNativeTick<previousTick)
   failures.push('INVALID_NATIVE_TICK');
  previousTick=s.actualNativeTick;
  // Native source drift invalidates each individual witness too: an
  // earlier good sample cannot launder a later invalid one into matches.
  const sourceTrusted=JSON.stringify(s.sourceAuthority)==='[25,17,26,0]'&&
   s.originalUnrestricted4v4===false&&s.production===false&&s.stop===null;
  if(!sourceTrusted)failures.push('SOURCE_AUTHORITY_OR_STOP');
  const w=s.snapshotWarning,d=s.dom;
  const qualifies=sourceTrusted&&!!w&&!!d&&
   s.matchState==='PLAYING'&&s.actualKccGrounded===true&&
   sources.has(s.actualOriginalRapierSolid)&&
   w.showCaution===true&&
   ['EDGE_RISK','NEAR_EDGE'].includes(w.severity)&&
   w.severity===d.severity&&d.visible===true&&
   w.source===s.actualOriginalRapierSolid&&
   w.nativeTick===s.actualNativeTick&&
   Number.isFinite(w.distance)&&w.distance>=0&&w.distance<1.20&&
   Number.isSafeInteger(d.nativeTick)&&
   d.nativeTick<=s.actualNativeTick&&
   s.actualNativeTick-d.nativeTick<=8&&
   Number.isFinite(d.distance)&&Math.abs(d.distance-w.distance)<=.25&&
   d.text?.includes('WATCH YOUR STEP')&&
   d.officialScoreable==='0'&&d.original4v4==='false'&&
   d.floorHole==='false'&&w.playerPhysicsModified===false&&
   w.originalGeometryModified===false;
  if(qualifies){visible.add(s.actualOriginalRapierSolid);matched.push({
   stage:s.stage,nativeTick:s.actualNativeTick,
   actualGroundedOriginalSupport:s.actualOriginalRapierSolid,
   distance:w.distance,domTick:d.nativeTick
  });}
 }
 const passed=failures.length===0&&matched.length>0;
 return {schema:'W10_B132_REAL_SOURCE_DOM_EDGE_WARNING_AUDIT_V1',
  passed,reason:passed?'NATIVE_CHROME_EDGE_WARNING_OBSERVED':
   failures.length?failures.join(','):'NO_VERIFIED_VISIBLE_NATIVE_WARNING',
  visibleOriginalSupportIds:[...visible],matches:matched,
  originalSourceAuthority:[25,17,26,0],syntheticNativeTicks:0,
  actorPositionWrites:0,originalFloorHoleCertified:false,
  formal4v4Certified:false,officialTurfScoringAuthorized:false};
}
