/**
 * W10-B5: BIDIRECTIONAL read-only underpass frontier diagnosis.
 *
 * Recast paths describe navigation representation, while Rapier stage solids
 * describe collision. Neither independently authorizes original movement.
 * Only the last <=0.9m of each partial native route is rechecked with the
 * original HUMAN capsule/KCC, with floor support checked separately.
 * This is NOT a full route replay, geometry repair, off-mesh link or
 * authorization for combat, scoring, live deployment, or original fidelity.
 */
import {Vec3} from 'playcanvas';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageVector3} from '../StageDefinition';
import {auditPhase14JRapierRejoinStep}
 from './UndertowPhase14JCollisionRejoinGate';
import {auditW10SourceTransition}
 from './UndertowW10SourceTransitionAudit';

export interface W10NativeFrontierKccWitness {
 readonly lastNativeLegOnly:true;
 readonly distanceMeters:number;
 readonly sampleCount:number;
 readonly supportedSampleCount:number;
 readonly unsupportedSampleCount:number;
 readonly kccStepsAttempted:number;
 readonly kccBlockedSteps:number;
 readonly firstBlockedStep:number|null;
 readonly fullNativeTrajectoryReplayed:false;
 readonly certifiedTraversable:false;
}

export interface W10SourceFrontierPairAudit {
 readonly forward:ReturnType<typeof auditW10SourceTransition>;
 readonly reverse:ReturnType<typeof auditW10SourceTransition>;
 readonly forwardTerminalKcc:W10NativeFrontierKccWitness;
 readonly reverseTerminalKcc:W10NativeFrontierKccWitness;
 /** Euclidean gap between two partial path endpoints, NOT a walkable link. */
 readonly nativeTerminalSeparationMeters:number|null;
 readonly straightChordMeters:number;
 readonly firstChordUnsupportedFromStartMeters:number|null;
 readonly firstChordUnsupportedFromEndMeters:number|null;
 readonly anyDirectionUnreached:boolean;
 readonly originalDirectionalityProven:false;
 readonly originalFloorGapRepairAuthorized:false;
 readonly navLinkAuthorized:false;
 readonly scoreablePromotionAuthorized:false;
 readonly fullGameplayCertified:false;
 readonly productionAuthorized:false;
}

function hasOriginalSourceSupport(
 physics:RapierStagePhysics,p:Readonly<{x:number;y:number;z:number}>
):boolean{
 const hit=physics.castStageSegment(new Vec3(p.x,p.y+.65,p.z),
  new Vec3(p.x,p.y-.65,p.z),'ink-projectile');
 return !!hit && Math.abs(hit.point.y-p.y)<=.15;
}

/** Isolated *last-leg* preflight. It never moves any player/CPU or NavMesh. */
function terminalKccWitness(physics:RapierStagePhysics,
 nav:RecastStageNavigation,from:StageVector3,to:StageVector3
):W10NativeFrontierKccWitness{
 const route=nav.auditPath(new Vec3(...from),new Vec3(...to));
 const points=route.nativePathPoints;
 let distanceMeters=0,sampleCount=0,supportedSampleCount=0;
 let unsupportedSampleCount=0,kccStepsAttempted=0,kccBlockedSteps=0;
 let firstBlockedStep:number|null=null;
 if(points.length>=2){
  const end=points[points.length-1]!,previous=points[points.length-2]!;
  const length=Math.hypot(end.x-previous.x,end.y-previous.y,end.z-previous.z);
  if(Number.isFinite(length)&&length>1e-6){
   distanceMeters=Math.min(length,.9);
   // 5cm sampling stays below the actual 60Hz maximum CPU KCC step.
   const steps=Math.ceil(distanceMeters/.05);
   const startFraction=1-distanceMeters/length;
   const sample=(i:number)=>{
    const f=startFraction+(1-startFraction)*i/steps;
    return {x:previous.x+(end.x-previous.x)*f,
     y:previous.y+(end.y-previous.y)*f,
     z:previous.z+(end.z-previous.z)*f};
   };
   let before=sample(0);
   let beforeSupported=hasOriginalSourceSupport(physics,before);
   sampleCount++;if(beforeSupported)supportedSampleCount++;
   else unsupportedSampleCount++;
   for(let i=1;i<=steps;i++){
    const after=sample(i);
    const afterSupported=hasOriginalSourceSupport(physics,after);
    sampleCount++;
    if(afterSupported)supportedSampleCount++;
    else unsupportedSampleCount++;
    if(beforeSupported&&afterSupported){
     const move=auditPhase14JRapierRejoinStep(physics,before,after,1/60);
     kccStepsAttempted++;
     if(!move.approved){
      kccBlockedSteps++;
      if(firstBlockedStep===null)firstBlockedStep=i;
     }
    }
    before=after;beforeSupported=afterSupported;
   }
  }
 }
 return {lastNativeLegOnly:true,distanceMeters,sampleCount,
  supportedSampleCount,unsupportedSampleCount,kccStepsAttempted,
  kccBlockedSteps,firstBlockedStep,
  fullNativeTrajectoryReplayed:false,certifiedTraversable:false};
}

/** Do not infer that the reverse original-game movement is permissible:
 * this runs both *queries* to expose representation asymmetry only. */
export function auditW10SourceFrontierPair(
 physics:RapierStagePhysics,nav:RecastStageNavigation,
 from:StageVector3,to:StageVector3
):W10SourceFrontierPairAudit{
 const forward=auditW10SourceTransition(physics,nav,from,to);
 const reverse=auditW10SourceTransition(physics,nav,to,from);
 const forwardTerminalKcc=terminalKccWitness(physics,nav,from,to);
 const reverseTerminalKcc=terminalKccWitness(physics,nav,to,from);
 const a=forward.nativeTerminal?.point,b=reverse.nativeTerminal?.point;
 const nativeTerminalSeparationMeters=a&&b?Math.hypot(
  a[0]-b[0],a[1]-b[1],a[2]-b[2]):null;
 const straightChordMeters=Math.hypot(
  from[0]-to[0],from[1]-to[1],from[2]-to[2]);
 return {forward,reverse,forwardTerminalKcc,reverseTerminalKcc,
  nativeTerminalSeparationMeters,straightChordMeters,
  firstChordUnsupportedFromStartMeters:
   forward.chord.firstUnsupportedFraction===null?null:
    forward.chord.firstUnsupportedFraction*straightChordMeters,
  firstChordUnsupportedFromEndMeters:
   reverse.chord.firstUnsupportedFraction===null?null:
    reverse.chord.firstUnsupportedFraction*straightChordMeters,
  anyDirectionUnreached:!forward.nativePathReached||!reverse.nativePathReached,
  originalDirectionalityProven:false,originalFloorGapRepairAuthorized:false,
  navLinkAuthorized:false,scoreablePromotionAuthorized:false,
  fullGameplayCertified:false,productionAuthorized:false};
}
