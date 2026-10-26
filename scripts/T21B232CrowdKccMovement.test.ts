/**
 * B232 real moving native Recast Crowd proposals vetted by the SAME B230
 * physical Rapier KCC actor, after the full original jump/landing.
 * No real CpuAgentSystem instantiation; no offmesh links or stage promotion.
 */
import {beforeAll,describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {RapierStagePhysics,initializeRapier} from '../src/physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../src/navigation/RecastStageNavigation';
import {B230CpuLocalGapQaActuator,
 type B230Side,type B230Direction,type B230LocalGapPlan}
 from '../src/ai/B230CpuLocalGapQaActuator';
import {b231AuditedCrowdRejoin} from '../src/ai/B231CrowdLandingHandoffQa';
import {PLAYER_CHARACTER_PHYSICS as PROFILE}
 from '../src/player/PlayerCharacterPhysics';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as ORIGINAL_FACES}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';

function point(x:number,y:number,z:number,side:B230Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
function stage(side:B230Side,nav:boolean):StageDefinition{
 const names=nav?
 ['floor-concrete01','slope00-outer','floor-concrete02','slope00-inner','slope01']:
 ['floor-concrete01','slope00-outer'];
 const extra:StageSolidDefinition[]=names.map(name=>{
  const id='underpass-route-'+name+
   (side==='POSITIVE_Z'?'-positive-z':'-negative-z');
  const face=ORIGINAL_FACES.find(f=>f.id===id);
  if(!face)throw Error('B232_MISSING_EXACT_SOURCE_FACE');
  const v=face.mesh.vertices;
  const size:StageVector3=[
   Math.max(...v.map(p=>p[0]))-Math.min(...v.map(p=>p[0])),
   Math.max(...v.map(p=>p[1]))-Math.min(...v.map(p=>p[1])),
   Math.max(...v.map(p=>p[2]))-Math.min(...v.map(p=>p[2]))];
  return {id:(nav?'B231_QA:':'B230_QA:')+face.id,
   center:[0,0,0],size,material:'medium',render:false,
   projectileBlocker:false,cameraBlocker:false,
   collisionEnabled:true,navigationEnabled:nav,triangleMesh:face.mesh};
 });
 return {metadata:{id:nav?'b231-native-crowd-proxy-qa':
  'b230-exact-source-local-cpu-qa',
  displayName:'B232 isolated real native Recast / Rapier QA',
  worldBounds:ORIGINAL.worldBounds,teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
  teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
  tacticalNodes:[],splatZones:[]},
  solids:[...ORIGINAL.solids,...extra],
  paintSurfaces:ORIGINAL.paintSurfaces,navigationLinks:ORIGINAL.navigationLinks};
}
function plan(side:B230Side,direction:B230Direction):B230LocalGapPlan{
 return {side,direction,permitPhysicalLocalJump:true,
 start:direction==='FLOOR_TO_SLOPE'?point(-6,3,23.4,side):
  point(-6,3+(19.5-17)/3,17,side),
 target:direction==='FLOOR_TO_SLOPE'?point(-6,3+(19.5-19.1)/3,19.1,side):
  point(-6,3,21.9,side)};
}
beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B232 native Crowd movement on true original supported physical actor',()=>{
 it('measures Crowd request -> actual same-body KCC movement for both mirrored source destinations',()=>{
  expect(ORIGINAL.solids).toHaveLength(25);
  expect(ORIGINAL.paintSurfaces).toHaveLength(17);
  expect(ORIGINAL.navigationLinks).toHaveLength(26);
  expect(ORIGINAL.activationReady).toBe(false);
  const records=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const navWorld=stage(side,true);
   const nav=new RecastStageNavigation(navWorld,new PerformanceStats());
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const){
    const kcc=new B230CpuLocalGapQaActuator(stage(side,false),plan(side,direction));
    let landing=kcc.snapshot();
    for(let i=0;i<240&&!landing.accepted&&landing.phase!=='FAILED';i++)
     landing=kcc.advance();
    if(!landing.accepted)throw Error('B232_CPU_SPEED_ORIGINAL_JUMP_WAS_NOT_PHYSICALLY_PROVEN');
    const hold=b231AuditedCrowdRejoin(nav,navWorld,landing,side,direction);
    const body=landing.actorPosition;
    const startFoot=new Vec3(body[0],body[1]-PROFILE.humanFootOffsetMeters,body[2]);
    const goal=direction==='FLOOR_TO_SLOPE'?
     point(-6,3+(19.5-18.4)/3,18.4,side):
     point(-6,3,22.8,side);
    const startNative=nav.auditNavMeshProjection(startFoot);
    const destinationNative=nav.auditNavMeshProjection(new Vec3(...goal));
    const localNativePath=nav.auditPath(startFoot,new Vec3(...goal),.30);
    const proxy=nav.addAgent(startFoot);
    const beforeProxy=proxy.position();
    const initialSnap=Math.hypot(beforeProxy.x-startFoot.x,
     beforeProxy.y-startFoot.y,beforeProxy.z-startFoot.z);
    const observations=[];
    let requestAccepted=false;
    try{
     const g=nav.closestPoint(new Vec3(...goal));
     proxy.requestMoveTarget(g);
     requestAccepted=true;
     for(let i=0;i<100;i++){
      nav.fixedUpdate(1/60);
      const candidate=proxy.position();
      const step=kcc.advanceNativeCrowdQa(candidate);
      const after=kcc.snapshot();
      observations.push({tick:i+1,agent:[candidate.x,candidate.y,candidate.z],
       actualFoot:step.actualFoot,sourceFootId:step.sourceFootId,
       movedMeters:step.actualDeltaXZ,driftMeters:step.driftMeters,
       approved:step.approved,reason:step.reason,
       nativeKccSteps:step.actualKccStepCount});
      if(!step.approved)break;
      if(Math.hypot(candidate.x-g.x,candidate.z-g.z)<.22&&
        Math.hypot(step.actualFoot[0]-g.x,step.actualFoot[2]-g.z)<.25)
       break;
     }
    }finally{nav.removeAgent(proxy);}
    const initial=landing.actorPosition,final=kcc.snapshot().actorPosition;
    const displacement=Math.hypot(final[0]-initial[0],final[2]-initial[2]);
    const last=observations.at(-1);
    records.push({side,direction,original25StillFrozen:true,
     nativeSourceProjection:startNative,destinationProjection:destinationNative,
     path: {querySuccess:localNativePath.querySuccess,
      reachedTarget:localNativePath.reachedTarget,
      endError:localNativePath.endpointErrorMeters,
      startSnap:localNativePath.startSnapDistanceMeters,
      endSnap:localNativePath.endSnapDistanceMeters},
     firstHold:hold.decision,
     nativeCrowdRequestMade:requestAccepted,initialNativeCrowdSnap:initialSnap,
     nativeCrowdFrames:observations.length,
     physicallyApprovedFrames:observations.filter(x=>x.approved).length,
     realPhysicalSameKccDisplacementMeters:displacement,
     physicallyRemainedOnSource:observations.every(x=>x.approved),
     finalFootSolid:last?.sourceFootId??null,
     maxDrift:Math.max(...observations.map(x=>x.driftMeters)),
     firstFailure:observations.find(x=>!x.approved)??null,
     firstFive:observations.slice(0,5),lastFive:observations.slice(-5),
     liveCpuAgentSystemInstantiated:false,
     crossTeamRoutesCertified:'0/12'});
   }
  }
  console.log('B232_REAL_NATIVE_CROWD_REQUEST_RAPIER_KCC_STEERING',
   JSON.stringify({records,qaOnly:true,frozenStage:'25/17/26/0',
    originalStageModified:false,extraOffmeshLinks:0,
    sourceRenderCpuActorsInstantiated:false,officialWinner:'NONE',
    releaseAuthorized:false,cpuCrossTeamRoutes:'0/12'}));
  expect(records).toHaveLength(4);
  expect(records.every(x=>x.firstHold==='QA_CROWD_PROXY_REJOIN'&&
   x.nativeCrowdRequestMade&&x.initialNativeCrowdSnap<=.3&&
   x.nativeCrowdFrames>0&&x.liveCpuAgentSystemInstantiated===false)).toBe(true);
  // First B232 run #40307853903 measured 4/4 genuine moving Crowd
  // requests physically accepted by the SAME already-landed Rapier body.
  // Promotion to a strict QA regression, NOT live CPU route authority.
  expect(records.every(x=>
    x.nativeSourceProjection.success===true&&
    x.nativeSourceProjection.distanceMeters!==null&&
    x.nativeSourceProjection.distanceMeters<=.30&&
    x.destinationProjection.success===true&&
    x.destinationProjection.distanceMeters!==null&&
    x.destinationProjection.distanceMeters<=.30&&
    x.path.reachedTarget&&x.path.endError<=.30&&
    x.path.startSnap<=.30&&x.path.endSnap<=.30&&
    x.firstHold==='QA_CROWD_PROXY_REJOIN'&&
    x.nativeCrowdFrames>=15&&
    x.physicallyApprovedFrames===x.nativeCrowdFrames&&
    x.physicallyRemainedOnSource&&x.firstFailure===null&&
    x.realPhysicalSameKccDisplacementMeters>=.45&&
    x.realPhysicalSameKccDisplacementMeters<=1.0&&
    x.maxDrift<.25&&
    x.firstFive.every(s=>s.approved&&s.nativeKccSteps>0)&&
    x.finalFootSolid?.startsWith('B230_QA:underpass-route-')&&
    x.liveCpuAgentSystemInstantiated===false)).toBe(true);
  console.log('B232_MOVING_NATIVE_CROWD_SAME_RAPIER_KCC_4_OF_4_PASS',
   JSON.stringify({genuineLocalCrowdRequests:4,
    physicallyVerifiedMovingSameB230Body:4,
    minimumRealMovementMeters:.45,
    maxAcceptableCrowdRapierDriftMeters:.25,
    liveCpuAgentSystemTested:false,
    trueSourceGapRecastStillDisconnected:true,
    original25SolidsUnchanged:true,
    cpuOpposingRoutesCertified:'0/12',
    productionAuthorized:false,officialWinner:'NONE'}));
 },120000);
 it('refuses nonfinite and remote Crowd commands without moving the physically landed body',()=>{
  const records=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   for(const kind of ['NONFINITE','REMOTE'] as const){
    const actor=new B230CpuLocalGapQaActuator(
     stage(side,false),plan(side,'FLOOR_TO_SLOPE'));
    let snapshot=actor.snapshot();
    for(let i=0;i<240&&!snapshot.accepted&&snapshot.phase!=='FAILED';i++)
     snapshot=actor.advance();
    expect(snapshot.accepted).toBe(true);
    const original=Array.from(snapshot.actorPosition);
    const footY=snapshot.actorPosition[1]-PROFILE.humanFootOffsetMeters;
    const proposal=kind==='NONFINITE'
     ?{x:NaN,y:footY,z:snapshot.actorPosition[2]}
     :{x:snapshot.actorPosition[0]+10,y:footY,z:snapshot.actorPosition[2]};
    const result=actor.advanceNativeCrowdQa(proposal);
    const afterward=actor.snapshot();
    expect(result.approved).toBe(false);
    expect(result.reason).toBe(kind==='NONFINITE'
     ?'B232_CROWD_NONFINITE_PROPOSAL':'B232_UNTRUSTED_CROWD_DISPLACEMENT');
    expect(afterward.phase).toBe('FAILED');
    expect(afterward.actorPosition).toEqual(original);
    expect(afterward.teleportsAfterInitialQaSpawn).toBe(0);
    expect(afterward.totalLocalJumpCommands).toBe(1);
    records.push({side,kind,reason:result.reason,noActorMovement:true});
   }
  }
  console.log('B232_UNTRUSTED_CROWD_COMMANDS_REJECTED',
   JSON.stringify({records,originalPhysicalActorNeverTeleported:true,
    releaseAuthority:false}));
  expect(records).toHaveLength(4);
 },120000);
});
