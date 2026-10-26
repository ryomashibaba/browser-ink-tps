/**
 * B233: an explicitly isolated CPU-ownership state machine. The Crowd
 * agent controls approach only on a native original source polygon;
 * after suspension the EXACT SAME B230 Rapier capsule walks the last
 * metres and physically jumps. Crowd may resume only after 18 source
 * grounded ticks and a native verified local NavMesh foot snap.
 *
 * The real production CpuAgentSystem is NOT invoked or modified here.
 * No fake offmesh bridge, Recast teleport, stage/painter/winner promotion.
 */
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../core/PerformanceStats';
import {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import {B230CpuLocalGapQaActuator,type B230LocalGapPlan}
 from './B230CpuLocalGapQaActuator';
import {b231AuditedCrowdRejoin} from './B231CrowdLandingHandoffQa';
import {PLAYER_CHARACTER_PHYSICS as PROFILE} from '../player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as CI688}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';

export type B233Outcome={
 side:B230LocalGapPlan['side'];direction:B230LocalGapPlan['direction'];
 completed:boolean;cause:string;
 initialSourceFootVerified:boolean;
 approachNativeRecastPathReached:boolean;
 approachCrowdActualKccFrames:number;
 approachOriginalSourceFootFrames:number;
 approachActualKccTravelMeters:number;
 preJumpCrowdRemoved:boolean;
 sourceOwnedTakeoff:boolean;oneRealJump:boolean;
 actualRapierAirborne:boolean;realSourceLanding18Ticks:boolean;
 landingNativeCrowdHold:boolean;
 rejoinedCrowdLocalPathReached:boolean;
 resumedCrowdPhysicalKccFrames:number;
 rejoinedPhysicalTravelMeters:number;
 nativeCrossGapRecastConnected:boolean;
 originalStage:'25/17/26/0';
 sourceOnlySandbox:true;originalCpuAgentSystemUsed:false;
 realCpuOpponentRoutesCertified:'0/12';
 officialWinner:'NONE';productionAuthorized:false;
 phases:readonly string[];
};
const sideSuffix=(side:B230LocalGapPlan['side'])=>
 side==='POSITIVE_Z'?'-positive-z':'-negative-z';
function model(x:number,y:number,z:number,side:B230LocalGapPlan['side']):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
const distance=(a:Readonly<{x:number;y:number;z:number}>,
 b:Readonly<{x:number;y:number;z:number}>)=>
 Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function checkStage(s:StageDefinition,nav:boolean,side:B230LocalGapPlan['side']){
 const count=nav?30:27;
 const stageId=nav?'b231-native-crowd-proxy-qa':
  'b230-exact-source-local-cpu-qa';
 if(s.metadata.id!==stageId||s.solids.length!==count||
    s.paintSurfaces.length!==17||s.navigationLinks?.length!==26||
    FROZEN.activationReady!==false||
    s.solids.slice(0,25).some((v,i)=>v!==FROZEN.solids[i])||
    s.paintSurfaces.some((v,i)=>v!==FROZEN.paintSurfaces[i])||
    s.navigationLinks?.some((v,i)=>v!==FROZEN.navigationLinks[i]))
  throw Error('B233_STAGE_OR_AUTHORITY_NOT_ISOLATED');
 const names=nav?
  ['floor-concrete01','slope00-outer','floor-concrete02','slope00-inner','slope01']:
  ['floor-concrete01','slope00-outer'];
 for(let i=0;i<names.length;i++){
  const face=CI688.find(x=>x.id==='underpass-route-'+names[i]+sideSuffix(side));
  const solid=s.solids[25+i];
  if(!face||!solid||solid.id!==(nav?'B231_QA:':'B230_QA:')+face.id||
     solid.triangleMesh!==face.mesh||solid.collisionEnabled!==true||
     solid.navigationEnabled!==nav)
    throw Error('B233_EXACT_CI688_SOURCE_PROVENANCE_FAILED');
 }
}
export function b233RunRealCrowdOwnershipQa(
 sourcePhysics:StageDefinition,sourceNavigation:StageDefinition,
 plan:B230LocalGapPlan
):B233Outcome{
 checkStage(sourcePhysics,false,plan.side);
 checkStage(sourceNavigation,true,plan.side);
 if(!plan.permitPhysicalLocalJump)
  throw Error('B233_PHYSICAL_JUMP_PERMISSION_MISSING');
 const phases:string[]=[];
 const result:B233Outcome={
  side:plan.side,direction:plan.direction,completed:false,cause:'NOT_RUN',
  initialSourceFootVerified:false,approachNativeRecastPathReached:false,
  approachCrowdActualKccFrames:0,approachOriginalSourceFootFrames:0,
  approachActualKccTravelMeters:0,preJumpCrowdRemoved:false,
  sourceOwnedTakeoff:false,oneRealJump:false,actualRapierAirborne:false,
  realSourceLanding18Ticks:false,landingNativeCrowdHold:false,
  rejoinedCrowdLocalPathReached:false,resumedCrowdPhysicalKccFrames:0,
  rejoinedPhysicalTravelMeters:0,nativeCrossGapRecastConnected:false,
  originalStage:'25/17/26/0',sourceOnlySandbox:true,
  originalCpuAgentSystemUsed:false,realCpuOpponentRoutesCertified:'0/12',
  officialWinner:'NONE',productionAuthorized:false,phases
 };
 const fail=(cause:string):B233Outcome=>{
  result.cause=cause;phases.push('BLOCKED:'+cause);return result;
 };
 const kcc=new B230CpuLocalGapQaActuator(sourcePhysics,plan);
 const nav=new RecastStageNavigation(sourceNavigation,new PerformanceStats());
 let snapshot=kcc.snapshot();
 result.initialSourceFootVerified=snapshot.groundSupportedAtSpawn;
 if(!snapshot.groundSupportedAtSpawn)return fail('ORIGINAL_SOURCE_FOOT_MISSING');
 // A physical original gap MUST remain a jump, not a secretly added
 // Recast footpath. This is a genuine native query on the same QA mesh.
 const acrossGap=nav.auditPath(
  new Vec3(...plan.start),new Vec3(...plan.target),.30);
 result.nativeCrossGapRecastConnected=acrossGap.reachedTarget;
 if(acrossGap.reachedTarget||
    acrossGap.endpointErrorMeters<2.5)
  return fail('RECAST_WALK_BRIDGE_MASQUERADING_AS_PHYSICAL_JUMP');
 const prelip=plan.direction==='FLOOR_TO_SLOPE'?
  model(-6,3,22.2,plan.side):
  model(-6,3+(19.5-18.2)/3,18.2,plan.side);
 const startFoot=new Vec3(snapshot.actorPosition[0],
  snapshot.actorPosition[1]-PROFILE.humanFootOffsetMeters,
  snapshot.actorPosition[2]);
 const waypoint=new Vec3(...prelip);
 const projection=nav.auditNavMeshProjection(startFoot);
 const targetProjection=nav.auditNavMeshProjection(waypoint);
 const localPath=nav.auditPath(startFoot,waypoint,.30);
 if(!projection.success||projection.distanceMeters===null||
    projection.distanceMeters>.30||
    !targetProjection.success||targetProjection.distanceMeters===null||
    targetProjection.distanceMeters>.30||!localPath.reachedTarget||
    localPath.startSnapDistanceMeters>.30||
    localPath.endSnapDistanceMeters>.30)
  return fail('CROWD_APPROACH_NOT_ON_EXACT_LOCAL_NAVMESH');
 result.approachNativeRecastPathReached=true;
 phases.push('CROWD_APPROACH');
 const proxy=nav.addAgent(startFoot);
 try{
  const actual=proxy.position();
  if(distance(actual,startFoot)>.30)
   return fail('CROWD_APPROACH_INITIAL_SNAP_UNSUPPORTED');
  proxy.requestMoveTarget(nav.closestPoint(waypoint));
  for(let tick=0;tick<95;tick++){
   nav.fixedUpdate(1/60);
   const native=proxy.position();
   const footBefore=kcc.snapshot().actorPosition;
   const moved=kcc.advanceSourceCrowdApproachQa(native);
   if(!moved.approved)
    return fail('CROWD_TO_SAME_KCC_RUNUP_'+moved.reason);
   result.approachCrowdActualKccFrames++;
   result.approachOriginalSourceFootFrames++;
   const step=Math.hypot(moved.foot[0]-footBefore[0],
    moved.foot[2]-footBefore[2]);
   result.approachActualKccTravelMeters+=step;
   if(distance({x:moved.foot[0],y:moved.foot[1],z:moved.foot[2]},
    waypoint)<.40&&result.approachActualKccTravelMeters>.48)
    break;
  }
 }finally{
  nav.removeAgent(proxy);
  result.preJumpCrowdRemoved=true;
 }
 if(result.approachActualKccTravelMeters<.48||
   result.approachCrowdActualKccFrames<12)
  return fail('NO_GENUINE_CROWD_STEERED_RUNUP');
 phases.push('PHYSICAL_ORIGINAL_SOURCE_TAKEOFF');
 for(let i=0;i<240&&!snapshot.accepted&&snapshot.phase!=='FAILED';i++)
  snapshot=kcc.advance();
 if(!snapshot.accepted)return fail('REAL_PHYSICAL_SOURCE_JUMP_'+snapshot.reason);
 result.sourceOwnedTakeoff=snapshot.launchColliderId?.startsWith(
  'B230_QA:underpass-route-')===true&&snapshot.launchGrounded;
 result.oneRealJump=snapshot.totalLocalJumpCommands===1;
 result.actualRapierAirborne=snapshot.leftGround&&snapshot.landedAfterAirborne;
 result.realSourceLanding18Ticks=snapshot.targetGroundedStreak>=18;
 if(!result.sourceOwnedTakeoff||!result.oneRealJump||
   !result.actualRapierAirborne||!result.realSourceLanding18Ticks)
  return fail('NATIVE_SOURCE_JUMP_PROVENANCE_INCOMPLETE');
 phases.push('PHYSICAL_SOURCE_LANDING');
 const hold=b231AuditedCrowdRejoin(nav,sourceNavigation,
  snapshot,plan.side,plan.direction);
 if(hold.decision!=='QA_CROWD_PROXY_REJOIN')
  return fail('NATIVE_CROWD_REJOIN_'+hold.cause);
 result.landingNativeCrowdHold=true;
 phases.push('LOCAL_CROWD_REJOIN');
 const foot=new Vec3(snapshot.actorPosition[0],
  snapshot.actorPosition[1]-PROFILE.humanFootOffsetMeters,
  snapshot.actorPosition[2]);
 const next=plan.direction==='FLOOR_TO_SLOPE'?
  model(-6,3+(19.5-18.4)/3,18.4,plan.side):
  model(-6,3,22.8,plan.side);
 const nativePath=nav.auditPath(foot,new Vec3(...next),.30);
 if(!nativePath.reachedTarget||nativePath.startSnapDistanceMeters>.30||
   nativePath.endSnapDistanceMeters>.30)
  return fail('POSTJUMP_NATIVE_LOCAL_CROWD_PATH_UNAVAILABLE');
 result.rejoinedCrowdLocalPathReached=true;
 const rejoined=nav.addAgent(foot);
 const landingStart=kcc.snapshot().actorPosition;
 try{
  if(distance(rejoined.position(),foot)>.30)
   return fail('POSTJUMP_CROWD_UNTRUSTED_SNAP');
  rejoined.requestMoveTarget(nav.closestPoint(new Vec3(...next)));
  for(let i=0;i<105;i++){
   nav.fixedUpdate(1/60);
   const steered=kcc.advanceNativeCrowdQa(rejoined.position());
   if(!steered.approved)
    return fail('POSTJUMP_CROWD_KCC_REJECTED_'+steered.reason);
   result.resumedCrowdPhysicalKccFrames++;
   const a=kcc.snapshot().actorPosition;
   result.rejoinedPhysicalTravelMeters=Math.hypot(
    a[0]-landingStart[0],a[2]-landingStart[2]);
   if(result.rejoinedPhysicalTravelMeters>=.45)break;
  }
 }finally{nav.removeAgent(rejoined);}
 if(result.rejoinedPhysicalTravelMeters<.45||
   result.resumedCrowdPhysicalKccFrames<10)
  return fail('POSTJUMP_REAL_CPU_SPEED_TRAVEL_INSUFFICIENT');
 phases.push('CROWD_LOCAL_STEERING_AFTER_JUMP');
 result.completed=true;result.cause='QA_NATIVE_CROWD_TO_KCC_JUMP_TO_CROWD';
 return result;
}
