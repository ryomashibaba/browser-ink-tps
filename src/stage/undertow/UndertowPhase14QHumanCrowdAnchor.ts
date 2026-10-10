import type {CrowdAgent} from 'recast-navigation';
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {StageDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import type {T21QFoot} from './UndertowPhase14QSharedActorCollision';

export interface Phase14QHumanAnchorFrame{
 source:'ACTUAL_RAPIER_PLAYER_FOOT_TO_EIGHTH_RECAST_CROWD_AGENT';
 realHumanFoot:T21QFoot;
 crowdAgentFoot:T21QFoot;
 maxSourceSnapDistanceMeters:number;
 sourceProjectionDistanceMeters:number;
 footToCrowdHorizontalMeters:number;
 cpuAgentTeleported:false;
 playerRapierBodyMoved:false;
 sourceNavmeshModified:false;
 productionAuthorized:false;
}

/**
 * T21-only human-controlled Crowd neighbour, NOT a second player, fake
 * physical collider, source-solid mask, or CPU position correction.
 *
 * Crowd separation can move an "idle" agent by >0.8m without user input.
 * Therefore its position MUST be overwritten from ACTUAL PlayerController
 * KCC position every tick (via CrowdAgent.teleport). Only the Crowd-side
 * human avatar is teleported: real Rapier HUMAN, CPU Crowd agents, original
 * collision meshes, and native navigation remain unmodified.
 *
 * This is a steering *candidate*, NOT proof of CPU↔HUMAN landing safety.
 */
export class UndertowPhase14QHumanCrowdAnchor{
 private readonly agent:CrowdAgent;
 private lastHumanFoot:T21QFoot|null=null;
 private closed=false;
 private readonly maximumProjectionMeters=.26;

 constructor(
   private readonly navigation:RecastStageNavigation,
   stage:StageDefinition,
   enabled:boolean,
   originalRealHumanFoot:T21QFoot
 ){
   if(!enabled||stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
      freeze.activationReady!==false||
      stage.solids!==freeze.solids||
      stage.paintSurfaces!==freeze.paintSurfaces||
      stage.navigationLinks!==freeze.navigationLinks||
      stage.solids.length!==25||
      stage.paintSurfaces.length!==17||
      stage.navigationLinks?.length!==26)
     throw Error('T21_PHASE14Q_HUMAN_CROWD_PRODUCTION_FORBIDDEN');
   const point=this.project(actualRealFoot(originalRealHumanFoot));
   this.agent=navigation.addAgent(point);
   this.agent.resetMoveTarget();
   // This agent is a passive physical-player footprint, never another
   // autonomous bot. The Crowd is allowed to steer CPUs around it.
   this.agent.updateParameters({
     maxAcceleration:0,maxSpeed:0,separationWeight:0
   });
   this.syncActualPlayerFoot(originalRealHumanFoot);
 }

 /** Call after PlayerController.syncAfterPhysics, before CPU Crowd update. */
 syncActualPlayerFoot(foot:T21QFoot):Phase14QHumanAnchorFrame{
   if(this.closed)throw Error('T21_PHASE14Q_HUMAN_CROWD_ANCHOR_DISPOSED');
   const real=actualRealFoot(foot);
   if(this.lastHumanFoot){
     const distance=Math.hypot(real.x-this.lastHumanFoot.x,
       real.y-this.lastHumanFoot.y,real.z-this.lastHumanFoot.z);
     if(distance>GAME_CONFIG.player.humanSpeedMetersPerSecond/60+.12)
       throw Error('T21_PHASE14Q_UNVERIFIED_HUMAN_RAPIER_STEP');
   }
   const projection=this.project(real);
   const before=this.agent.position();
   this.agent.teleport(projection);
   this.agent.resetMoveTarget();
   const after=this.agent.position();
   const mismatch=Math.hypot(after.x-projection.x,after.y-projection.y,
     after.z-projection.z);
   if(mismatch>.065)
     throw Error('T21_PHASE14Q_HUMAN_CROWD_PROXY_TELEPORT_DID_NOT_SYNC');
   this.lastHumanFoot={...real};
   return {
    source:'ACTUAL_RAPIER_PLAYER_FOOT_TO_EIGHTH_RECAST_CROWD_AGENT',
    realHumanFoot:{...real},
    crowdAgentFoot:{x:after.x,y:after.y,z:after.z},
    maxSourceSnapDistanceMeters:this.maximumProjectionMeters,
    sourceProjectionDistanceMeters:Math.hypot(projection.x-real.x,
      projection.y-real.y,projection.z-real.z),
    footToCrowdHorizontalMeters:Math.hypot(after.x-real.x,after.z-real.z),
    cpuAgentTeleported:false,playerRapierBodyMoved:false,
    sourceNavmeshModified:false,productionAuthorized:false
   };
 }
 get rawCrowdPosition():T21QFoot{
   const p=this.agent.position();
   return {x:p.x,y:p.y,z:p.z};
 }
 dispose():void{
   if(this.closed)return;
   this.closed=true;
   this.navigation.removeAgent(this.agent);
   this.lastHumanFoot=null;
 }
 private project(foot:T21QFoot):Vec3{
   const projected=this.navigation.closestPoint(new Vec3(foot.x,foot.y,foot.z));
   const distance=Math.hypot(projected.x-foot.x,projected.y-foot.y,
     projected.z-foot.z);
   if(!Number.isFinite(distance)||distance>this.maximumProjectionMeters)
      throw Error('T21_PHASE14Q_HUMAN_FOOT_OFF_ORIGINAL_NAVMESH');
   return new Vec3(projected.x,projected.y,projected.z);
 }
}

function actualRealFoot(foot:T21QFoot):T21QFoot{
 if(![foot.x,foot.y,foot.z].every(Number.isFinite))
   throw Error('T21_PHASE14Q_NONFINITE_REAL_RAPIER_HUMAN_FOOT');
 return {...foot};
}
