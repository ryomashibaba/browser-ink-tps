import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';

export type Phase14PFoot=readonly [number,number,number];
export interface Phase14PActorFoot{
 id:string;foot:Phase14PFoot;
}
export interface Phase14PActorNearContact{
 id:string;
 horizontalMeters:number;
 verticalFootMeters:number;
 visualProximityThresholdMeters:number;
}
export interface Phase14PActorSeparationAudit{
 source:'ACTUAL_CPU_RENDER_POSES_AND_REAL_PLAYER_RAPIER_FOOT';
 currentPlayerRealFoot:Phase14PFoot;
 cpuCount:number;
 closestCpu:string|null;
 closestHorizontalMeters:number|null;
 nearVisualContacts:readonly Phase14PActorNearContact[];
 possibleHumanCpuVisualOverlap:boolean;
 cpuGroundCollisionProfileInstalled:false;
 sharedDynamicHumanCpuColliderWorld:false;
 humanCpuPhysicalCollisionApproved:false;
}
/**
 * QA observation, NOT a substitute for a genuine dynamic Rapier collision.
 * CPU capsule render width .58m from CpuAgentSystem; its approximate
 * horizontal visual radius is .29m, not a physical body authority.
 * HUMAN radius comes from exactly the production PlayerController profile.
 * Never move, separate, teleport or recast a character based on this ledger.
 */
export function auditPhase14PActorSeparation(
 playerFoot:Phase14PFoot,bots:readonly Phase14PActorFoot[]
):Phase14PActorSeparationAudit{
 if(!playerFoot.every(Number.isFinite))
  throw Error('T21_PHASE14P_PLAYER_SOURCE_FOOT_NONFINITE');
 if(new Set(bots.map(b=>b.id)).size!==bots.length||
    bots.some(b=>!b.id||!b.foot.every(Number.isFinite)))
  throw Error('T21_PHASE14P_CPU_SOURCE_FOOT_NONFINITE_OR_DUPLICATE');
 const radius=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+.29;
 let min=Number.POSITIVE_INFINITY,closest:string|null=null;
 const possible:Phase14PActorNearContact[]=[];
 for(const bot of bots){
  const xz=Math.hypot(bot.foot[0]-playerFoot[0],bot.foot[2]-playerFoot[2]);
  const dy=Math.abs(bot.foot[1]-playerFoot[1]);
  if(xz<min){min=xz;closest=bot.id;}
  // A large vertical difference is not a same-layer overlap even if the
  // top-view footprints coincide during a legitimate source-backed fall.
  if(xz<=radius&&dy<=.95)
   possible.push({id:bot.id,horizontalMeters:xz,
    verticalFootMeters:dy,visualProximityThresholdMeters:radius});
 }
 return {
  source:'ACTUAL_CPU_RENDER_POSES_AND_REAL_PLAYER_RAPIER_FOOT',
  currentPlayerRealFoot:[...playerFoot],
  cpuCount:bots.length,
  closestCpu:closest,
  closestHorizontalMeters:closest===null?null:min,
  nearVisualContacts:possible,
  possibleHumanCpuVisualOverlap:possible.length>0,
  cpuGroundCollisionProfileInstalled:false,
  sharedDynamicHumanCpuColliderWorld:false,
  humanCpuPhysicalCollisionApproved:false
 };
}
