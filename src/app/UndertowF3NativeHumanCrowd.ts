/**
 * F3C opt-in live human Crowd presence. Only the actual grounded source-
 * supported Rapier player's FOOT is projected as a passive steering
 * neighbour. If the human jumps/offmesh/respawns, the eighth native Crowd
 * neighbour is removed (never invent a NavMesh path in mid-air).
 * This affects native CPU avoidance, NOT Rapier authority or a CPU foot.
 */
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import type {CpuHumanCrowdFootAuthority} from '../ai/CpuAgentSystem';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {StageDefinition} from '../stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14QHumanCrowdAnchor}
 from '../stage/undertow/UndertowPhase14QHumanCrowdAnchor';
import type {B118NativeCrowdDriftWitness}
 from '../stage/undertow/UndertowPhase14QRealCrowdDriftWitness';

type Foot=Readonly<{x:number;y:number;z:number}>;
export class UndertowF3NativeHumanCrowd implements CpuHumanCrowdFootAuthority{
 private anchor:UndertowPhase14QHumanCrowdAnchor|null=null;
 private previous:Foot|null=null;
 private lastFoot:Foot|null=null;
 private b118Witness:B118NativeCrowdDriftWitness|null=null;
 readonly sourceOnly=true;
 attaches=0;
 detaches=0;
 private excluded=0;
 constructor(
  private readonly nav:RecastStageNavigation,
  private readonly stage:StageDefinition
 ){
  if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    frozen.activationReady!==false||
    stage.solids!==frozen.solids||
    stage.paintSurfaces!==frozen.paintSurfaces||
    stage.navigationLinks!==frozen.navigationLinks)
   throw Error('T21_F3C_HUMAN_NATIVE_CROWD_NONPRODUCTION_ONLY');
 }
 syncActualPlayerFoot(foot:Foot){
  if(![foot.x,foot.y,foot.z].every(Number.isFinite))
   throw Error('T21_F3C_HUMAN_NONFINITE_PHYSICAL_FOOT');
  const native=this.nav.closestPoint(new Vec3(foot.x,foot.y,foot.z));
  const snap=Math.hypot(native.x-foot.x,native.y-foot.y,native.z-foot.z);
  const sourceSupported=Number.isFinite(snap)&&snap<=.22;
  const boundedStep=!this.previous||Math.hypot(
   foot.x-this.previous.x,foot.y-this.previous.y,
   foot.z-this.previous.z) <=
    GAME_CONFIG.player.humanSpeedMetersPerSecond/60+.12;
  // One F3 frame after a jump or explicit respawn may move beyond a
  // normal grounded KCC stride; invalidate only the proxy, not physics.
  if(!sourceSupported||!boundedStep){
   this.suspend();
   this.excluded++;
  }else{
   if(!this.anchor){
    this.anchor=new UndertowPhase14QHumanCrowdAnchor(
     this.nav,this.stage,true,foot);
    this.attaches++;
   }else this.anchor.syncActualPlayerFoot(foot);
  }
  this.previous={...foot};
  this.lastFoot=this.anchor?{...foot}:null;
 }
 sealAfterCrowdUpdate(foot:Foot){
  if(!this.anchor)return;
  if(!this.lastFoot||Math.hypot(
   foot.x-this.lastFoot.x,foot.y-this.lastFoot.y,
   foot.z-this.lastFoot.z)>1e-5)
   throw Error('T21_F3C_HUMAN_PROXY_REAL_FOOT_DRIFT');
  // Preserve the measured pre/post actual Recast tick even if the
  // original strict >2m safety fence throws before a restoration.
  try{this.anchor.sealAfterCrowdUpdate(foot);}
  finally{this.b118Witness=this.anchor.lastB118RealCrowdWitness;}
 }
 private suspend(){
  if(this.anchor){this.anchor.dispose();this.anchor=null;this.detaches++;}
  this.lastFoot=null;
 }
 get snapshot(){
  return {active:!!this.anchor,attaches:this.attaches,
   detaches:this.detaches,airborneOrUnverifiableTicks:this.excluded,
   b118LastRealCrowdDriftWitness:this.b118Witness,
   fakeHumanPhysicalActors:0,playerFootMoved:false,
   sourceNavmeshChanged:false,productionAuthorized:false};
 }
 dispose(){this.suspend();this.previous=null;}
}
