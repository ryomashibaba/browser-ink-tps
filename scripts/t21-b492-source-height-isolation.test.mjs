import {describe,it} from 'node:test';
import {equal,throws,deepStrictEqual} from 'node:assert/strict';
import {auditB492LandingHeightMismatch as audit} from './t21-b492-source-height-isolation.mjs';
const SRC='25/17/26/0',LAND='UndertowT21D:first-drop-landing-negative-z',
 RAMP='UndertowT21D:right-low-route-ramp-negative-z';
function fixture(){
 const t0=800.5;
 const d={schema:'B451_REAL_B2_B4_ORIGINAL_CONTACT_GAP_CLASSIFICATION_V2',
  originalSource:SRC,verdict:'PASS_REAL_FIRST_DENIAL_TELEMETRY_NOT_ROUTE_APPROVAL',
  browserOrigin:t0,actorWrites:0,geometryWrites:0,clockWrites:0,scoreWrites:0,perCpu:{}};
 const t={schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1',
  source:SRC,browserWorldOrigin:t0,actorWrites:0,
  originalSourceGeometryWrites:0,nativeClockWrites:0,scoreWrites:0,
  originalPathAuthorizationChanged:false,continuousCapsuleContactCertified:false,
  rows:{}};
 const i={schema:'B454_INDEPENDENT_REAL_B2_B4_60HZ_SOURCE_FOOT_V1',
  source:SRC,browserWorldOrigin:t0,realSevenCpu:true,
  actorWrites:0,originalGeometryWrites:0,gameplayClockWrites:0,
  scoreWrites:0,naturalCrossTeamRouteCertified:false,B2B4:{}};
 const top={schema:'B487_TRUE_ORIGINAL_NATIVE_CROSS_TEAM_TOPOLOGY_V1',
  source:SRC,totalOriginalNativePathQueries:16,nativePathReportedPairs:0,
  nativeCredibleEndpointPairs:0};
 const gap={schema:'B488_ORIGINAL_CROSS_TEAM_GAP_AUTHORITY_DECISION_V1',
  originalSource:SRC,currentNativeReportedPaths:0,currentNativeCredibleEndpointPairs:0,
  verdict:'HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING'};
 for(const id of ['B2','B4']){
  t.rows[id]=Array.from({length:600},(_,k)=>({id,tick:k+1,
   foot:[k*.02,3.1,-52],mode:'GROUND',life:'ACTIVE',rejoined:true,
   registeredOriginalHit:true,
   originalRapierSolidId:k>=400?RAMP:LAND,
   absFootToRapierY:k>=450&&k<454?.27:.1,
   withinUnchanged025m:!(k>=450&&k<454)}));
  i.B2B4[id]={nativeTickCount:600,firstNativeTick:1,
   missingNativeTicks:0,originalRapierRegisteredSamples:600,
   atMostUnchanged025mStaticGapSamples:596,
   originalGoalReachabilityGranted:false,
   fullyContinuousCapsuleContactCertified:false,
   closestSameWorldActualFootToDeniedNativeRecast:{
    nativeTick:1,physicalFoot:[0,3.1,-52],
    rejectedNativePathXYZ:[.01,3.26,-52],horizontalMeters:.01,
    physicalStaticSolidId:LAND,physicalStaticFootGapMeters:.1,
    rejectedRecastPointGapMeters:.26}};
  d.perCpu[id]={deniedIntermediateOriginalSupport:1,
   rejectedOriginalRoutes:[{firstDenied:{
    cause:'NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',
    hitSolidId:LAND,xyz:[.01,3.26,-52],verticalGapMeters:.26}}]};
 }
 return [d,t,i,top,gap];
}
describe('B492: original same-world local native path height vs 60Hz actual foot',()=>{
 it('is a witness, never a route/collision/score authorization',()=>{
  const v=audit(...fixture());
  equal(v.firstDenialsTotal,2);
  equal(v.actors.B2.uncertainRampFrames,4);
  equal(v.actors.B4.physicalTraceFrames,600);
  equal(v.authorizedCrossTeamPaths,0);
  equal(v.continuousSweptCapsuleRouteCertified,false);
  deepStrictEqual(Object.keys(v.actors),['B2','B4']);
 });
 it('rejects wrong world, authored geometry, fake cross-team path',()=>{
  for(const mutate of [
   v=>v[1].browserWorldOrigin=999,
   v=>v[0].geometryWrites=1,
   v=>v[3].nativePathReportedPairs=1,
   v=>v[4].currentNativeReportedPaths=1,
   v=>v[2].naturalCrossTeamRouteCertified=true
  ]){const f=fixture();mutate(f);throws(()=>audit(...f),/B492_SOURCE_PROVENANCE_HOLD/);}
 });
 it('cannot relax the original strict 0.25m denial',()=>{
  const f=fixture();f[0].perCpu.B2.rejectedOriginalRoutes[0].firstDenied.verticalGapMeters=.249;
  throws(()=>audit(...f),/B492_SOURCE_PROVENANCE_HOLD/);
 });
 it('does not call a missing Rapier floor a height-only mismatch',()=>{
  const f=fixture();f[0].perCpu.B4.rejectedOriginalRoutes[0].firstDenied.hitSolidId=null;
  throws(()=>audit(...f),/B492_SOURCE_PROVENANCE_HOLD/);
 });
 it('rejects invented actor translation and non-ramp 0.25m exceptions',()=>{
  const f=fixture();f[1].rows.B2[450].foot=[50,3.1,-52];
  throws(()=>audit(...f),/B492_SOURCE_PROVENANCE_HOLD/);
  const g=fixture();g[1].rows.B4[450].originalRapierSolidId=LAND;
  throws(()=>audit(...g),/B492_SOURCE_PROVENANCE_HOLD/);
 });
});
