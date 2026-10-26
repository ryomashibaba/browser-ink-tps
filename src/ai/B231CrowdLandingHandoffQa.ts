/**
 * B231: QA-only handoff candidate, real native Crowd proxy following an
 * independently successful original-mesh B230 Rapier KCC landing.
 * NO CpuAgentSystem injection, no actor teleport and NO offmesh bridge.
 * The native Crowd is a separate steering PROXY, not the physical actor.
 */
import {Vec3} from 'playcanvas';
import type {B230NativeSnapshot,B230Side,B230Direction}
 from './B230CpuLocalGapQaActuator';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as ORIGINAL_FACES}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';

export type B231Decision='BLOCKED'|'QA_CROWD_PROXY_REJOIN';
export interface B231CrowdLandingQaResult {
 decision:B231Decision;
 cause:string;
 side:B230Side;
 direction:B230Direction;
 physicalLandingSourceId:string|null;
 nativeNearestMeters:number|null;
 initialCrowdSnappedMeters:number|null;
 finalCrowdDistanceFromRealLandingMeters:number|null;
 nativeCrowdFrames:number;
 nativeCrowdFootPositions:readonly [number,number,number][];
 actualPhysicalActorMovedByCrowd:false;
 liveCpuAgentSystemUsed:false;
 frozenStageCounts:'25/17/26/0';
 sourceSideSourceFaces:5;
 noOffmeshConnectionsAdded:true;
 originalNavigationLinksStill26:true;
 originalOpposingRoutes:'0/12';
 productionAuthorized:false;
 releaseAuthorized:false;
 officialWinner:'NONE';
}
function sourceId(side:B230Side,kind:string){
 return 'B230_QA:underpass-route-'+kind+
 (side==='POSITIVE_Z'?'-positive-z':'-negative-z');
}
export function b231AuditedCrowdRejoin(
 nav:RecastStageNavigation,navStage:StageDefinition,
 physical:B230NativeSnapshot,
 side:B230Side,direction:B230Direction
):B231CrowdLandingQaResult {
 const base={
  side,direction,
  physicalLandingSourceId:physical.latestFootColliderId,
  nativeNearestMeters:null as number|null,
  initialCrowdSnappedMeters:null as number|null,
  finalCrowdDistanceFromRealLandingMeters:null as number|null,
  nativeCrowdFrames:0,
  nativeCrowdFootPositions:[] as [number,number,number][],
  actualPhysicalActorMovedByCrowd:false as const,
  liveCpuAgentSystemUsed:false as const,
  frozenStageCounts:'25/17/26/0' as const,
  sourceSideSourceFaces:5 as const,
  noOffmeshConnectionsAdded:true as const,
  originalNavigationLinksStill26:true as const,
  originalOpposingRoutes:'0/12' as const,
  productionAuthorized:false as const,
  releaseAuthorized:false as const,
  officialWinner:'NONE' as const
 };
 const blocked=(cause:string):B231CrowdLandingQaResult=>
  ({...base,decision:'BLOCKED',cause});
 const expectedLanding=sourceId(side,
  direction==='FLOOR_TO_SLOPE'?'slope00-outer':'floor-concrete01');
 // Strict geometry and authority; never use this class for any live stage.
 if(navStage.metadata.id!=='b231-native-crowd-proxy-qa'||
    navStage.solids.length!==30||
    navStage.paintSurfaces.length!==17||
    navStage.navigationLinks?.length!==26||
    navStage.solids.slice(0,25).some((s,i)=>s!==FROZEN.solids[i])||
    navStage.paintSurfaces.some((s,i)=>s!==FROZEN.paintSurfaces[i])||
    navStage.navigationLinks?.some((s,i)=>s!==FROZEN.navigationLinks[i])||
    FROZEN.solids.length!==25||FROZEN.activationReady!==false)
   return blocked('UNTRUSTED_NAV_SCENE');
 const expectedFaces=ORIGINAL_FACES.filter(x=>x.side===side);
 if(expectedFaces.length!==5||
   navStage.solids.slice(25).some(s=>{
    const original=expectedFaces.find(x=>'B231_QA:'+x.id===s.id);
    return !original||s.triangleMesh!==original.mesh||
     s.navigationEnabled!==true||s.collisionEnabled!==true;
   }))
  return blocked('SOURCE_FACE_PROVENANCE_DRIFT');
 if(!physical.accepted||physical.phase!=='SUCCEEDED'||
    physical.teleportsAfterInitialQaSpawn!==0||
    physical.scene!=='27_SOLIDS_25_FROZEN_PLUS_2_EXACT_SOURCE'||
    physical.totalLocalJumpCommands!==1||
    physical.targetGroundedStreak<18||
    physical.existing25CollisionIds.length!==0||
    !physical.leftGround||!physical.landedAfterAirborne||
    !physical.currentlyGrounded||
    physical.latestFootColliderId!==expectedLanding)
  return blocked('PHYSICAL_LANDING_NOT_AUTHORIZED');
 if(!physical.actorPosition.every(Number.isFinite))
  return blocked('NONFINITE_PHYSICAL_FOOT');
 // The actor position in B230 is the true Rapier capsule center. Native
 // Crowd position is a ground FOOT. Never use actor center for Recast snap.
 const foot=new Vec3(
  physical.actorPosition[0],
  physical.actorPosition[1]-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
  physical.actorPosition[2]);
 const projection=nav.auditNavMeshProjection(foot);
 if(!projection.success||projection.distanceMeters===null||
    projection.distanceMeters>.30)
  return {...blocked('NATIVE_RECAST_PROJECTION_NOT_DIRECT'),
   nativeNearestMeters:projection.distanceMeters};
 const agent=nav.addAgent(foot);
 try{
  const first=agent.position();
  const snapped=Math.hypot(first.x-foot.x,first.y-foot.y,first.z-foot.z);
  if(!Number.isFinite(snapped)||snapped>.30)
   return {...blocked('CROWD_PROXY_TELEPORT_DISTANCE_REFUSED'),
    nativeNearestMeters:projection.distanceMeters,
    initialCrowdSnappedMeters:snapped};
  // A freshly created proxy from the exact actual KCC landing is held
  // stationary for 24 native 60 Hz Crowd updates. That proves a genuine
  // Crowd agent can exist here without silently drifting off the landing;
  // it does NOT prove CPU steering, connected full routes or identical actor.
  agent.resetMoveTarget();
  const tracks:[number,number,number][]=[];
  for(let i=0;i<24;i++){
   nav.fixedUpdate(1/60);
   const p=agent.position();
   const dist=Math.hypot(p.x-foot.x,p.y-foot.y,p.z-foot.z);
   tracks.push([p.x,p.y,p.z]);
   if(!Number.isFinite(dist)||dist>.30)
    return {...blocked('NATIVE_CROWD_PROXY_DRIFT'),
     nativeNearestMeters:projection.distanceMeters,
     initialCrowdSnappedMeters:snapped,
     nativeCrowdFrames:i+1,nativeCrowdFootPositions:tracks,
     finalCrowdDistanceFromRealLandingMeters:dist};
  }
  const end=agent.position();
  return {...base,
   decision:'QA_CROWD_PROXY_REJOIN',
   cause:'EXACT_PHYSICAL_SOURCE_LANDING_NATIVE_LOCAL_CROWD_HOLD_ONLY',
   nativeNearestMeters:projection.distanceMeters,
   initialCrowdSnappedMeters:snapped,
   finalCrowdDistanceFromRealLandingMeters:
    Math.hypot(end.x-foot.x,end.y-foot.y,end.z-foot.z),
   nativeCrowdFrames:24,nativeCrowdFootPositions:tracks};
 }finally{
  nav.removeAgent(agent);
 }
}
