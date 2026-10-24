#!/usr/bin/env node
/** W10-B149: exact-handle, every-60Hz-game-frame native human/A1 clearance.
 * Validate read-only evidence from BOTH actual Chrome 7CPU source trials
 * after independent B147 physical approach and B148 station proof.
 * The shared-world Rapier body is authoritative; no synthetic physics. */
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const hold=why=>{throw Error('B149_EXACT_NATIVE_RAPIER_KCC_'+why);};
const number=n=>typeof n==='number'&&Number.isFinite(n);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function auditB149ActualNativePair(ally,fixed,b147,b148){
 if(ally?.variant!=='ALLY_RALLY'||fixed?.variant!=='FIXED_DEFAULT'||
    b147?.result!=='SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED'||
    b147.schema!=='W10_B147_REAL_NATIVE_PHYSICAL_ALLY_APPROACH_AUDIT_V1'||
    b148?.result!=='REAL_ORIGINAL_A1_NEAR_PLAYER_STABLE_SAMPLED'||
    b148.schema!=='W10_B148_NATIVE_2M_TEAMMATE_STATION_V1'||
    b148.fullOriginal4v4Certified!==false||
    b147.realOriginalActorRelocations!==0||
    ally.originalSource!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    fixed.originalSource!==ally.originalSource||
    ally.originalOppositeSideNaturalPaths!=='0/12'||
    fixed.originalOppositeSideNaturalPaths!=='0/12'||
    ally.cpuFootRelocations!==0||fixed.cpuFootRelocations!==0||
    ally.originalPhysicalCpuRejoins?.length!==7||
    fixed.originalPhysicalCpuRejoins?.length!==7||
    ally.productionAuthorized!==false||fixed.productionAuthorized!==false||
    ally.formalOriginal4v4Certified!==false||
    fixed.formalOriginal4v4Certified!==false||
    fixed.finalNativePatrol?.b137ApprovedNativeRallies!==0||
    !(ally.finalNativePatrol?.b137ApprovedNativeRallies>0))
  hold('WRONG_AUTHORITY_OR_NO_REAL_PHYSICAL_SUCCESS');
 const a=ally.b149ActualNativeHumanA1Contact;
 const f=fixed.b149ActualNativeHumanA1Contact;
 const valid=t=>t?.enabled===true&&
    t.source==='ACTUAL_PLAYER_KCC_AND_REAL_A1_SHARED_RAPIER_COLLIDER'&&
    t.nearFramesSourceOnly===true&&t.actorPositionWritten===false&&
    t.continuousBetweenFrameContactCertified===false&&
    t.fullOriginal4v4Certified===false&&
    integer(t.actualNearNativeFrames)&&integer(t.actualNativeKccA1Contacts)&&
    integer(t.observedCapsuleOverlapFrames)&&
    integer(t.originalGroundedNearFrames)&&
    integer(t.originalSourceSupportFailuresNear)&&
    integer(t.sharedActorPoseDesyncNear);
 if(!valid(a)||!valid(f))hold('MISSING_EXACT_SHARED_RAPIER_CONTACT_TRACE');
 if(a.actualNearNativeFrames<240||
    !integer(a.firstNearNativeTick)||
    !integer(a.lastNearNativeTick)||
    a.lastNearNativeTick-a.firstNearNativeTick<300||
    a.lastNearNativeTick>ally.endNativeTick||
    a.actualNearNativeFrames>a.lastNearNativeTick-a.firstNearNativeTick+1||
    a.originalGroundedNearFrames!==a.actualNearNativeFrames||
    a.originalSourceSupportFailuresNear!==0||
    a.sharedActorPoseDesyncNear!==0||
    a.actualNativeKccA1Contacts!==0||
    a.observedCapsuleOverlapFrames!==0||
    !number(a.minimumRealPairDistanceMeters)||
    !number(a.minimumPositiveRadialCapsuleClearanceMeters)||
    a.minimumRealPairDistanceMeters<1.6||
    a.minimumPositiveRadialCapsuleClearanceMeters<.8||
    a.minimumRealPairDistanceMeters>b148.minRealHumanA1SeparationMeters+.05||
    a.minimumRealPairDistanceMeters>b148.maxRealHumanA1SeparationMeters)
  hold('UNSAFE_OR_TOO_SHORT_ACTUAL_60HZ_A1_STATION');
 if(f.actualNativeKccA1Contacts<0||f.observedCapsuleOverlapFrames!==0||
    f.originalSourceSupportFailuresNear!==0||
    f.sharedActorPoseDesyncNear!==0||
    f.originalGroundedNearFrames!==f.actualNearNativeFrames)
  hold('FIXED_PHYSICAL_BASELINE_CONTAMINATED');
 return {
  schema:'W10_B149_EXACT_RAPIER_PLAYER_A1_60HZ_CONTACT_AUDIT_V1',
  result:'SCOPED_NATIVE_SOURCE_A1_60HZ_SEPARATION_OBSERVED',
  realNativeOriginalSourceOnly:true,
  nativeA1NearHumanTotalFrames:a.actualNearNativeFrames,
  firstNativeNearTick:a.firstNearNativeTick,
  lastNativeNearTick:a.lastNearNativeTick,
  realNativeNearTimeSpanTicks:
   a.lastNearNativeTick-a.firstNearNativeTick,
  minimumFrameObservedHumanA1DistanceMeters:
   a.minimumRealPairDistanceMeters,
  minimumFrameObservedRadiusSumClearanceMeters:
   a.minimumPositiveRadialCapsuleClearanceMeters,
  exactPlayerKccContactsWithActualA1RapierCollider:
   a.actualNativeKccA1Contacts,
  realNativeCapsuleOverlapFrames:a.observedCapsuleOverlapFrames,
  verifiedGroundedOriginalFloorFrames:a.originalGroundedNearFrames,
  sharedActorRapierBodyDesyncFrames:a.sharedActorPoseDesyncNear,
  baselineUnmodifiedFixedAllyGoals:fixed.finalNativePatrol.b137ApprovedNativeRallies,
  sourceOriginal25Solids17Paint26Links0Scoreable:true,
  sameTickActorCollisionSource:'ACTUAL_RAPIER_HANDLES_NOT_DYNAMIC_OWNER_LABEL',
  framewiseReadOnlyContactObservation:true,
  betweenSampleSweptContactCertified:false,
  fullCpuHumanAvoidanceCertified:false,
  complete4v4TurfCertified:false,productionAuthorized:false
 };
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 if(process.argv.length!==7)
  hold('USAGE_ALLY_FIXED_B147_PROOF_B148_PROOF_OUTPUT');
 const [ally,fixed,b147,b148]=process.argv.slice(2,6).map(x=>
  JSON.parse(readFileSync(x,'utf8')));
 const out=auditB149ActualNativePair(ally,fixed,b147,b148);
 writeFileSync(process.argv[6],JSON.stringify(out,null,2));
 console.log('B149_ACTUAL_RAPIER_PLAYER_A1_CONTACT',JSON.stringify(out));
}
