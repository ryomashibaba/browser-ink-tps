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
  /** B372: actual PlayerResources and B343 native projectile pool, never
   * inferred from source paint cells or fabricated weapon simulation. */
  shooterResources?:{
    inkUnits:number;shotInkCostUnits:number;
    freePhysicalSlots:number;physicalPoolSize:number;
    realDryFireAttempts:number;realPoolRejections:number;
  };
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
  // Completed steps, NOT the current step number: paint is unfinished
  // until B186's original physical impact proof reports CLEAR.
  const progress=step==='CLEAR'?3:step==='PAINT'?2:step==='RAMP'?1:0;
  const resources=x.shooterResources;
  if(resources&&(
     ![resources.inkUnits,resources.shotInkCostUnits].every(Number.isFinite)||
     resources.inkUnits<0||resources.shotInkCostUnits<=0||
     ![resources.freePhysicalSlots,resources.physicalPoolSize,
       resources.realDryFireAttempts,resources.realPoolRejections].every(n=>
        Number.isSafeInteger(n)&&n>=0)||
     resources.physicalPoolSize<=0||
     resources.freePhysicalSlots>resources.physicalPoolSize))return null;
  const resourceState=!resources?'NOT_MEASURED':
   resources.inkUnits+1e-6<resources.shotInkCostUnits?'LOW_INK':
   resources.freePhysicalSlots===0?'PHYSICAL_POOL_FULL':
   'INK_AND_SLOT_AVAILABLE';
  const resourceText=resourceState==='LOW_INK'?
   'LOW INK FOR SHOT · REFILL':
   resourceState==='PHYSICAL_POOL_FULL'?
   'REAL PROJECTILE SLOTS BUSY · WAIT':
   resourceState==='INK_AND_SLOT_AVAILABLE'?
   'INK + PHYSICAL SHOT SLOT AVAILABLE':
   'NATIVE SHOOTER RESOURCES NOT MEASURED';
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
    step,progress,completed:step==='CLEAR',resourceState,
    actualFreePhysicalSlots:resources?.freePhysicalSlots??null,
    observedDryFireAttempts:resources?.realDryFireAttempts??null,
    observedPoolRejections:resources?.realPoolRejections??null,
    nativeTick:x.nativeTick,
    originalSourceOnly:true as const,
    scoreablePromotions:0 as const,
    crossTeamRouteCertified:false as const,
    officialWinner:'NONE' as const,
    physicalEnemyHitCertified:false as const,
    gameplayWrites:0 as const,
    text:notice+'SOURCE CIRCUIT '+progress+'/3 · '+status+'\n'+
      shots+' · '+ink+' · '+resourceText+'\n'+
      'NON-SCORING SOURCE PRACTICE · NO TURF WINNER · NO CROSS-TEAM PATH',
  };
}
