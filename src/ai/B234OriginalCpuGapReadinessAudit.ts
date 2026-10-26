/**
 * B234 REAL CpuAgentSystem -> original 25-solid gap readiness gate.
 * Source-only F3 opt-in readout on the actual 7 CPU objects and the
 * actual shared Rapier and native Recast stages. Never moves an actor.
 *
 * Deliberately BLOCKS B233 physical gap actuator adoption until the
 * genuine source collider registrations AND valid CPU navigation exist.
 */
import {Vec3} from 'playcanvas';
import {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';

export interface B234NativeCpu {
 id:string;foot:Readonly<{x:number;y:number;z:number}>;
 lifeState:'ACTIVE'|'SPLATTED';mobilityState:string;
 crowdPosition:Readonly<{x:number;y:number;z:number}>|null;
}
export interface B234CpuGapReadiness {
 enabled:true;sampledNativeFrames:number;
 actualSevenCpuIds:readonly string[];
 realCpuObjectsAudited:number;nativeCrowdAgentsPresent:number;
 actualPhysicalCpuPositions:ReadonlyArray<Readonly<{
  id:string;foot:readonly[number,number,number];
  nativeCrowdFoot:readonly[number,number,number]|null;
  realRegisteredSupportId:string|null;
  mobilityState:string;lifeState:string;
  distanceToClosestUnregisteredGapAnchorMeters:number;
 }>>;
 anchors:ReadonlyArray<Readonly<{
  side:'POSITIVE_Z'|'NEGATIVE_Z';name:string;
  actualOriginal25ColliderId:string|null;
  directlySupportedByFrozenSource:boolean;
  nearestOriginalRecastMeters:number|null;
  navDirectlySupported:boolean;
 }>>;
 authenticGapAnchorSupports:number;
 realCrowdWithPhysicalCpuActors:boolean;
 physicallyAuthorizedOriginalGapJumps:0;
 handoffAuthorized:false;
 blockingReason:'B234_SOURCE_CI688_FACES_NOT_REGISTERED_IN_ORIGINAL_25';
 actorsTeleported:0;extraOriginalCollisionSolids:0;newOffmeshLinks:0;
 actualStage:'25/17/26/0';officialWinner:'NONE';productionAuthorized:false;
 originalOpponentRoutesCertified:'0/12';
}
const ids=['A1','A2','A3','B1','B2','B3','B4'] as const;
function coord(x:number,y:number,z:number,side:'POSITIVE_Z'|'NEGATIVE_Z'){
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return new Vec3(px,y-3,pz);
}
const anchors=(['POSITIVE_Z','NEGATIVE_Z'] as const).flatMap(side=>([
 {name:'floor-concrete01',point:coord(-6,3,21.9,side),side},
 {name:'slope00-outer',point:coord(-6,3+(19.5-19.1)/3,19.1,side),side},
 {name:'floor-concrete02',point:coord(-6,4.5,14.30,side),side},
 {name:'slope00-inner',point:coord(-12.05,3+(10.15-6)/3,10.15,side),side}
]));
export class B234OriginalCpuGapReadinessAudit {
 private frames=0;
 private current:B234CpuGapReadiness|null=null;
 constructor(private readonly stage:StageDefinition,
  private readonly physics:RapierStagePhysics,
  private readonly nav:RecastStageNavigation){
  if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     ORIGINAL.activationReady!==false||
     stage.solids!==ORIGINAL.solids||
     stage.paintSurfaces!==ORIGINAL.paintSurfaces||
     stage.navigationLinks!==ORIGINAL.navigationLinks||
     stage.solids.length!==25||stage.paintSurfaces.length!==17||
     stage.navigationLinks?.length!==26||
     stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
   throw Error('B234_FROZEN_STAGE_AND_UNSCORED_QA_REQUIRED');
 }
 observeActualSevenCpu(bots:readonly B234NativeCpu[]):B234CpuGapReadiness{
  if(bots.length!==7||new Set(bots.map(b=>b.id)).size!==7||
     !ids.every(id=>bots.some(b=>b.id===id))||
     bots.some(b=>![b.foot.x,b.foot.y,b.foot.z].every(Number.isFinite)||
      b.crowdPosition&&![b.crowdPosition.x,b.crowdPosition.y,
       b.crowdPosition.z].every(Number.isFinite)))
   throw Error('B234_ACTUAL_NATIVE_SEVEN_CPU_PROVENANCE_REQUIRED');
  this.frames++;
  // Direct physical foot rays at the B226 real human path anchors,
  // NOT an invented second stage or a text-only "missing floor" claim.
  if(this.frames===1||this.frames%60===0){
   const source=anchors.map(a=>{
    const body=new Vec3(a.point.x,
     a.point.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.06,a.point.z);
    const hit=this.physics.castCharacterFootSupport(
     body,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
    const projection=this.nav.auditNavMeshProjection(a.point);
    return {side:a.side,name:a.name,
     actualOriginal25ColliderId:hit?.solidId??null,
     directlySupportedByFrozenSource:hit!==null&&
      Math.abs(hit.point.y-a.point.y)<.12,
     nearestOriginalRecastMeters:projection.distanceMeters,
     navDirectlySupported:projection.success&&
      projection.distanceMeters!==null&&projection.distanceMeters<=.30};
   });
   const supported=source.filter(x=>x.directlySupportedByFrozenSource).length;
   // If any of these exact original 8 positions is suddenly supported,
   // the frozen baseline changed. Re-authorize from source data, never
   // assume that the missing CI688 route became an authentic CPU path.
   if(supported!==0||source.some(x=>x.navDirectlySupported))
    throw Error('B234_ORIGINAL_PHYSICAL_OR_NAV_BASELINE_DRIFT');
   this.current={
    enabled:true,sampledNativeFrames:this.frames,actualSevenCpuIds:[...ids],
    realCpuObjectsAudited:bots.length,
    nativeCrowdAgentsPresent:bots.filter(b=>b.crowdPosition!==null).length,
    actualPhysicalCpuPositions:[],
    anchors:source,authenticGapAnchorSupports:supported,
    realCrowdWithPhysicalCpuActors:false,physicallyAuthorizedOriginalGapJumps:0,
    handoffAuthorized:false,
    blockingReason:'B234_SOURCE_CI688_FACES_NOT_REGISTERED_IN_ORIGINAL_25',
    actorsTeleported:0,extraOriginalCollisionSolids:0,newOffmeshLinks:0,
    actualStage:'25/17/26/0',officialWinner:'NONE',
    productionAuthorized:false,originalOpponentRoutesCertified:'0/12'
   };
  }
  if(!this.current)throw Error('B234_NATIVE_AUDIT_NOT_INITIALIZED');
  const positions=bots.map(bot=>{
   const foot=bot.foot;
   const ray=this.physics.castCharacterFootSupport(
    new Vec3(foot.x,foot.y+
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.06,foot.z),
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
   return {id:bot.id,foot:[foot.x,foot.y,foot.z] as [number,number,number],
    nativeCrowdFoot:bot.crowdPosition?[
     bot.crowdPosition.x,bot.crowdPosition.y,bot.crowdPosition.z
    ] as [number,number,number]:null,
    realRegisteredSupportId:ray?.solidId??null,
    mobilityState:bot.mobilityState,lifeState:bot.lifeState,
    distanceToClosestUnregisteredGapAnchorMeters:Math.min(...anchors.map(a=>
     Math.hypot(foot.x-a.point.x,foot.z-a.point.z)))};
  });
  this.current={...this.current,sampledNativeFrames:this.frames,
   actualPhysicalCpuPositions:positions,
   realCrowdWithPhysicalCpuActors:
    bots.some(b=>b.lifeState==='ACTIVE'&&b.crowdPosition!==null)};
  return this.current;
 }
 snapshot():B234CpuGapReadiness|null{return this.current;}
}
