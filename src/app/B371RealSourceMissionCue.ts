/**
 * B371: one genuine SOURCE-local player mission, assembled from the existing
 * B183/B186 physical circuit, accepted native shots, human ink and resources.
 * Read-only: never computes official Turf score, collision or enemy hits.
 */
import type {B186CircuitStatus} from './B186RealOriginalSourceCircuit';
export interface B371SourceMissionFrame {
  originalStage:readonly [number,number,number,number];
  genuineSourceShooterSelected:boolean;
  nativeTick:number;
  status:B186CircuitStatus;
  originalSourceLocalClear:boolean;
  realGroundedTravelMeters:number;
  requiredGroundedTravelMeters:number;
  realFreshHumanImpactCells:number;
  requiredFreshHumanImpactCells:number;
  actualHumanImpactEvents:number;
  sourceInkOnly:boolean;
  realAcceptedShots:number;
  actualInkPercent:number;
  playerAlive:boolean;
  matchState:'STAGING'|'PLAYING'|'TIME_UP';
  stopped:boolean;
}
export type B371MissionStep='DROP'|'RAMP'|'PAINT'|'CLEAR'|'HOLD';
export function b371RealSourceMissionCue(x:B371SourceMissionFrame){
  if(x.originalStage.join(',')!=='25,17,26,0'||
     x.genuineSourceShooterSelected!==true||x.sourceInkOnly!==true||
     !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
     !Number.isSafeInteger(x.realAcceptedShots)||x.realAcceptedShots<0||
     !Number.isSafeInteger(x.actualHumanImpactEvents)||x.actualHumanImpactEvents<0||
     ![x.realGroundedTravelMeters,x.requiredGroundedTravelMeters,
       x.realFreshHumanImpactCells,x.requiredFreshHumanImpactCells,
       x.actualInkPercent].every(Number.isFinite)||
     x.realGroundedTravelMeters<0||x.requiredGroundedTravelMeters<=0||
     x.realFreshHumanImpactCells<0||x.requiredFreshHumanImpactCells<=0||
     x.actualInkPercent<0||x.actualInkPercent>100||
     x.originalSourceLocalClear!==(x.status==='REAL_LOCAL_CIRCUIT_CLEAR'))
    return null;
  const step:B371MissionStep=x.stopped||
   x.status==='INVALID_SOURCE_WITNESS'?'HOLD':
   x.status==='REAL_LOCAL_CIRCUIT_CLEAR'?'CLEAR':
   x.status==='PAINT_ON_RAISED'?'PAINT':
   x.status==='MOVE_TO_ORIGINAL_RAISED'?'RAMP':'DROP';
  const progress=step==='CLEAR'?3:step==='PAINT'?3:step==='RAMP'?2:1;
  const limitedGround=Math.min(x.realGroundedTravelMeters,
   x.requiredGroundedTravelMeters);
  const limitedInk=Math.min(x.realFreshHumanImpactCells,
   x.requiredFreshHumanImpactCells);
  const status=step==='CLEAR'?
   'LOCAL CIRCUIT COMPLETE — VERIFIED ORIGINAL DROP + RAMP + INK':
   step==='PAINT'?
   'FIRE AT ORIGINAL PAINTABLE · '+limitedInk+' / '+
    x.requiredFreshHumanImpactCells+' FRESH HUMAN IMPACT CELLS':
   step==='RAMP'?
   'WALK ORIGINAL RAMP · '+limitedGround.toFixed(1)+' / '+
    x.requiredGroundedTravelMeters.toFixed(1)+'m GROUNDED MOVEMENT':
   step==='DROP'?
   'ORIGINAL FIRST DROP · LAND ON REGISTERED LOWER FLOOR':
   'SOURCE CIRCUIT HOLD · VERIFY PHYSICAL EVIDENCE / RESTART';
  const shots=x.realAcceptedShots+' REAL SHOTS';
  const ink=Math.round(x.actualInkPercent)+'% INK';
  const notice=x.matchState==='TIME_UP'?'TIME UP · ':!x.playerAlive?
   'PLAYER SPLATTED · ':x.matchState==='STAGING'?'READY · ':'';
  return {
    step,progress,completed:step==='CLEAR',
    nativeTick:x.nativeTick,
    originalSourceOnly:true as const,
    scoreablePromotions:0 as const,
    crossTeamRouteCertified:false as const,
    officialWinner:'NONE' as const,
    physicalEnemyHitCertified:false as const,
    gameplayWrites:0 as const,
    text:notice+'SOURCE CIRCUIT '+progress+'/3 · '+status+'\n'+
      shots+' · '+ink+' · NON-SCORING SOURCE PRACTICE'+'\n'+
      'NO TURF WINNER · NO CROSS-TEAM PATH',
  };
}
