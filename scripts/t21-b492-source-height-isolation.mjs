#!/usr/bin/env node
/** Read-only same-Chromium-world B450/B454/B487/B488 original height audit. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const SOURCE='25/17/26/0';
const LANDING='UndertowT21D:first-drop-landing-negative-z';
const RAMP='UndertowT21D:right-low-route-ramp-negative-z';
const ids=['B2','B4'];
const finite3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const n6=x=>Number(x.toFixed(6));
const hold=why=>{throw Error('B492_SOURCE_PROVENANCE_HOLD_'+why);};
export function auditB492LandingHeightMismatch(d,t,i,top,gap){
 if(d?.schema!=='B451_REAL_B2_B4_ORIGINAL_CONTACT_GAP_CLASSIFICATION_V2'||
    d.originalSource!==SOURCE||
    d.verdict!=='PASS_REAL_FIRST_DENIAL_TELEMETRY_NOT_ROUTE_APPROVAL'||
    t?.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
    i?.schema!=='B454_INDEPENDENT_REAL_B2_B4_60HZ_SOURCE_FOOT_V1'||
    t.source!==SOURCE||i.source!==SOURCE||
    !i.realSevenCpu||!Number.isFinite(d.browserOrigin)||
    d.browserOrigin!==t.browserWorldOrigin||
    d.browserOrigin!==i.browserWorldOrigin||
    top?.schema!=='B487_TRUE_ORIGINAL_NATIVE_CROSS_TEAM_TOPOLOGY_V1'||
    top.source!==SOURCE||top.totalOriginalNativePathQueries!==16||
    top.nativePathReportedPairs!==0||top.nativeCredibleEndpointPairs!==0||
    gap?.schema!=='B488_ORIGINAL_CROSS_TEAM_GAP_AUTHORITY_DECISION_V1'||
    gap.originalSource!==SOURCE||gap.currentNativeReportedPaths!==0||
    gap.currentNativeCredibleEndpointPairs!==0||
    gap.verdict!=='HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING'||
    d.actorWrites!==0||d.geometryWrites!==0||
    d.clockWrites!==0||d.scoreWrites!==0||
    t.actorWrites!==0||t.originalSourceGeometryWrites!==0||
    t.nativeClockWrites!==0||t.scoreWrites!==0||
    i.actorWrites!==0||i.originalGeometryWrites!==0||
    i.gameplayClockWrites!==0||i.scoreWrites!==0||
    t.originalPathAuthorizationChanged!==false||
    t.continuousCapsuleContactCertified!==false||
    i.naturalCrossTeamRouteCertified!==false)
   hold('WORLD_OR_AUTHORITY');
 let total=0;
 const actors={};
 for(const id of ids){
  const actor=d.perCpu?.[id],rows=t.rows?.[id];
  const summary=i.B2B4?.[id],near=summary?.closestSameWorldActualFootToDeniedNativeRecast;
  if(!actor||!Array.isArray(rows)||rows.length<600||
     summary?.nativeTickCount!==rows.length||
     summary.missingNativeTicks!==0||
     summary.originalRapierRegisteredSamples!==rows.length||
     summary.originalGoalReachabilityGranted!==false||
     summary.fullyContinuousCapsuleContactCertified!==false||
     !finite3(near?.physicalFoot)||!finite3(near?.rejectedNativePathXYZ)||
     near.physicalStaticSolidId!==LANDING||
     !Number.isSafeInteger(near.nativeTick)||
     !Number.isFinite(near.horizontalMeters)||near.horizontalMeters>=.05||
     !Number.isFinite(near.physicalStaticFootGapMeters)||
     near.physicalStaticFootGapMeters>.25||
     !Number.isFinite(near.rejectedRecastPointGapMeters)||
     near.rejectedRecastPointGapMeters<=.25||
     Math.abs(Math.hypot(near.physicalFoot[0]-near.rejectedNativePathXYZ[0],
      near.physicalFoot[2]-near.rejectedNativePathXYZ[2])-near.horizontalMeters)>.00001||
     !rows.some(x=>x.tick===near.nativeTick&&
       Math.hypot(x.foot[0]-near.physicalFoot[0],
        x.foot[2]-near.physicalFoot[2])<.00001))
    hold('PHYSICAL_WITNESS_'+id);
  const rejects=actor.rejectedOriginalRoutes;
  if(!Array.isArray(rejects)||rejects.length<1||
     rejects.length!==actor.deniedIntermediateOriginalSupport||
     rejects.some(x=>x.firstDenied?.cause!=='NATIVE_PATH_RAPIER_HEIGHT_MISMATCH'||
       x.firstDenied.hitSolidId!==LANDING||
       !finite3(x.firstDenied.xyz)||
       !Number.isFinite(x.firstDenied.verticalGapMeters)||
       x.firstDenied.verticalGapMeters<=.25||
       x.firstDenied.verticalGapMeters>.40))
    hold('NATIVE_FIRST_DENIAL_'+id);
  const uncertain=rows.filter(x=>!x.withinUnchanged025m);
  const good=rows.length-uncertain.length;
  if(uncertain.length<1||uncertain.length>=rows.length||
     good!==summary.atMostUnchanged025mStaticGapSamples||
     uncertain.some(x=>x.originalRapierSolidId!==RAMP||
       x.mode!=='GROUND'||x.life!=='ACTIVE'||
       x.registeredOriginalHit!==true||
       !Number.isFinite(x.absFootToRapierY)||x.absFootToRapierY<=.25)||
     rows.some((x,k)=>!Number.isSafeInteger(x.tick)||
       x.tick!==summary.firstNativeTick+k||x.id!==id||
       x.rejoined!==true||x.mode!=='GROUND'||x.life!=='ACTIVE'||
       x.registeredOriginalHit!==true||!finite3(x.foot)||
       (k>0&&Math.hypot(x.foot[0]-rows[k-1].foot[0],
        x.foot[2]-rows[k-1].foot[2])>.08)))
    hold('FULL_RATE_RAPIER_FOOT_'+id);
  const yDifference=Math.abs(near.rejectedNativePathXYZ[1]-near.physicalFoot[1]);
  if(yDifference<.10||yDifference>.20)
    hold('NONLOCAL_Y_'+id);
  actors[id]={
   rejectedPaths:rejects.length,
   firstRejectedRapierSolidId:LANDING,
   firstRejectedGapMinMeters:n6(Math.min(...rejects.map(x=>x.firstDenied.verticalGapMeters))),
   firstRejectedGapMaxMeters:n6(Math.max(...rejects.map(x=>x.firstDenied.verticalGapMeters))),
   physicalTraceFrames:rows.length,
   physicallyRegisteredFrames:summary.originalRapierRegisteredSamples,
   within025mFrames:good,
   uncertainRampFrames:uncertain.length,
   uncertainRampNativeTicks:uncertain.map(x=>x.tick),
   maxRampStaticFootGapMeters:n6(Math.max(...uncertain.map(x=>x.absFootToRapierY))),
   nearestPhysicalToRejectedPathXZ:n6(near.horizontalMeters),
   nearestPhysicalFootGapMeters:n6(near.physicalStaticFootGapMeters),
   rejectedNativePathGapAtSameXZ:n6(near.rejectedRecastPointGapMeters),
   footVsNativePathYDifference:n6(yDifference),
   continuousSweptCapsuleRouteCertified:false
  };
  total+=rejects.length;
 }
 return {schema:'B492_GENUINE_NATIVE_LOCAL_HEIGHT_DISCREPANCY_V1',
  evidenceRunId:43140584988,source:SOURCE,
  sameOriginalChromiumWorld:true,firstDenialsTotal:total,actors,
  localRecastHeightMismatchObserved:true,
  original72CollisionFlagsProven:false,
  centralMissingGeometrySolved:false,
  continuousSweptCapsuleRouteCertified:false,
  authorizedCrossTeamPaths:0,
  originalSource:'25/17/26/0',
  scoreablePromotions:0,actorWrites:0,physicsWrites:0,
  navigationWrites:0,sourceGeometryWrites:0,
  nextGate:'Same-size real capsule swept landing-to-ramp traversal and original 7.2 Turf collision semantics required',
  verdict:'LOCAL_RECAST_Y_MISMATCH_WITNESSED_ROUTE_STILL_HOLD'};
}
if(process.argv[1]?.endsWith('t21-b492-source-height-isolation.mjs')){
 const dir=process.argv[2],output=process.argv[3];
 if(!dir||!output)hold('INPUT_OUTPUT_REQUIRED');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const report=auditB492LandingHeightMismatch(
  read('b450-first-original-gap-report.json'),
  read('b454-native-b2-b4-physical-60hz.json'),
  read('b454-independent-real-original-60hz-foot.json'),
  read('b487-real-original-16-cross-team-route-audit.json'),
  read('b488-real-original-f4-gap-authority-hold.json'));
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log('B492_READ_ONLY_RECAST_RAPIER_HEIGHT_WITNESS_PASS',
  JSON.stringify(report));
}
