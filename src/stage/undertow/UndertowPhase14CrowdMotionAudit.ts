import {GAME_CONFIG} from '../../config/game/gameConfig';

/**
 * A Recast Crowd off-mesh connection can jump directly to the endpoint.
 * Arrival therefore does NOT establish physically plausible falling motion.
 * This audit records abrupt step changes rather than silently approving
 * a jump that cannot be achieved by human/squid 60Hz physics.
 */
export interface Phase14CrowdFrameMotion {
  travelledMeters:number;
  verticalChangeMeters:number;
  impliedSpeedMetersPerSecond:number;
  maximumContinuousStepMeters:number;
  suspectedInstantTransition:boolean;
}
export function auditPhase14CrowdFrame(
  from:Readonly<{x:number;y:number;z:number}>,
  to:Readonly<{x:number;y:number;z:number}>,
  dtSeconds:number
):Phase14CrowdFrameMotion{
  if(!Number.isFinite(dtSeconds)||dtSeconds<=0||
   ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite))
     throw Error('T21_PHASE14C_INVALID_CROWD_SAMPLE');
  const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
  const travelledMeters=Math.hypot(dx,dy,dz);
  // A physically generous bound: allows full configured horizontal
  // CPU speed PLUS full configured player terminal fall speed per tick
  // PLUS an additional 0.12m integration tolerance.
  const maximumContinuousStepMeters=dtSeconds*Math.hypot(
    GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
    GAME_CONFIG.player.maxFallSpeedMetersPerSecond
  )+.12;
  return {
    travelledMeters,verticalChangeMeters:Math.abs(dy),
    impliedSpeedMetersPerSecond:travelledMeters/dtSeconds,
    maximumContinuousStepMeters,
    suspectedInstantTransition:travelledMeters>maximumContinuousStepMeters
  };
}
