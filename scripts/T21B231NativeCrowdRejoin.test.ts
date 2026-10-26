import {beforeAll,describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {initializeRapier} from '../src/physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../src/navigation/RecastStageNavigation';
import {B230CpuLocalGapQaActuator,type B230Side,
 type B230Direction,type B230LocalGapPlan}
 from '../src/ai/B230CpuLocalGapQaActuator';
import {b231AuditedCrowdRejoin} from '../src/ai/B231CrowdLandingHandoffQa';
import {PLAYER_CHARACTER_PHYSICS as PROFILE}
 from '../src/player/PlayerCharacterPhysics';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as CI688}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageVector3,StageSolidDefinition}
 from '../src/stage/StageDefinition';

const positive='POSITIVE_Z' as const;
function point(x:number,y:number,z:number,side:B230Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side===positive?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
function qa(side:B230Side,navigation:boolean):StageDefinition{
 const names=navigation?
  ['floor-concrete01','slope00-outer','floor-concrete02','slope00-inner','slope01']:
  ['floor-concrete01','slope00-outer'];
 const extra:StageSolidDefinition[]=names.map(name=>{
  const face=CI688.find(x=>x.id==='underpass-route-'+name+
   (side===positive?'-positive-z':'-negative-z'));
  if(!face)throw Error('B231_MISSING_EXACT_SOURCE_FACE');
  const v=face.mesh.vertices;
  const size:StageVector3=[
   Math.max(...v.map(x=>x[0]))-Math.min(...v.map(x=>x[0])),
   Math.max(...v.map(x=>x[1]))-Math.min(...v.map(x=>x[1])),
   Math.max(...v.map(x=>x[2]))-Math.min(...v.map(x=>x[2]))
  ];
  return {id:(navigation?'B231_QA:':'B230_QA:')+face.id,
   center:[0,0,0],size,render:false,material:'medium',
   cameraBlocker:false,projectileBlocker:false,
   collisionEnabled:true,navigationEnabled:navigation,
   triangleMesh:face.mesh};
 });
 return {metadata:{id:navigation?'b231-native-crowd-proxy-qa':
   'b230-exact-source-local-cpu-qa',
   displayName:'B231 source only isolated real Crowd',worldBounds:FROZEN.worldBounds,
   teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
   teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
   tacticalNodes:[],splatZones:[]},
  solids:[...FROZEN.solids,...extra],
  paintSurfaces:FROZEN.paintSurfaces,
  navigationLinks:FROZEN.navigationLinks};
}
function plan(side:B230Side,direction:B230Direction):B230LocalGapPlan{
 return {side,direction,permitPhysicalLocalJump:true,
  start:direction==='FLOOR_TO_SLOPE'?point(-6,3,23.4,side):
   point(-6,3+(19.5-17)/3,17,side),
  target:direction==='FLOOR_TO_SLOPE'?
   point(-6,3+(19.5-19.1)/3,19.1,side):
   point(-6,3,21.9,side)};
}
beforeAll(async()=>{
 await initializeRapier();
 await initializeRecastNavigation();
});
describe('B231 genuine Crowd proxy rejoin after independently proven KCC landing',()=>{
 it('checks all four true KCC landings against native Recast 25 and 30, no teleport authority',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  const records=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const navigationStage=qa(side,true);
   const nav=new RecastStageNavigation(navigationStage,new PerformanceStats());
   const frozen=new RecastStageNavigation({
    metadata:{...navigationStage.metadata,id:'b231-frozen-25-navigation'},
    solids:FROZEN.solids,paintSurfaces:FROZEN.paintSurfaces,
    navigationLinks:FROZEN.navigationLinks},new PerformanceStats());
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const){
    const p=plan(side,direction);
    const actor=new B230CpuLocalGapQaActuator(qa(side,false),p);
    let physical=actor.snapshot();
    for(let i=0;i<240&&physical.phase!=='SUCCEEDED'&&physical.phase!=='FAILED';i++)
     physical=actor.advance();
    expect(physical.accepted).toBe(true);
    const foot=new Vec3(physical.actorPosition[0],
     physical.actorPosition[1]-PROFILE.humanFootOffsetMeters,
     physical.actorPosition[2]);
    const frozenNativeProjection=frozen.auditNavMeshProjection(foot);
    const frozenGate=b231AuditedCrowdRejoin(
     frozen,{
      metadata:{...navigationStage.metadata,id:'b231-original25'},
      solids:FROZEN.solids,paintSurfaces:FROZEN.paintSurfaces,
      navigationLinks:FROZEN.navigationLinks
     },physical,side,direction);
    const labGate=b231AuditedCrowdRejoin(
     nav,navigationStage,physical,side,direction);
    const lip=nav.auditPath(
     new Vec3(p.start[0],p.start[1],p.start[2]),foot,.30);
    const altered={...physical,accepted:false as boolean};
    const forgedGate=b231AuditedCrowdRejoin(
     nav,navigationStage,altered,side,direction);
    records.push({side,direction,
     realKccStable:physical.accepted,
     original25Projection:frozenNativeProjection,
     original25FrozenGate:frozenGate.decision,
     actual27PhysicalPlus30NavCrowdLab:labGate,
     directAcrossGapNativePath:{
      startSnapMeters:lip.startSnapDistanceMeters,
      endSnapMeters:lip.endSnapDistanceMeters,
      reachedTarget:lip.reachedTarget,
      endpointError:lip.endpointErrorMeters
     },
     forgedPhysicalWasBlocked:forgedGate.decision==='BLOCKED',
     originalCpuRouteCertified:false});
   }
  }
  console.log('B231_NATIVE_CROWD_POST_PHYSICS_REJOIN_EVIDENCE',
   JSON.stringify({original25:'25/17/26/0',qa30NavmeshesPerSide:1,
    authenticPhysicalSource:'B230_27_SOLID_NATIVE_KCC',
    realNativeRecastCrowdUsed:true,
    actualCpuAgentSystemInstantiated:false,
    bothWorldsRemainIsolated:true,realCpuRoutesCertified:'0/12',
    productionAuthorized:false,
    sourceQaOnly:true,records}));
  expect(records).toHaveLength(4);
  expect(records.every(x=>x.forgedPhysicalWasBlocked&&
   x.original25FrozenGate==='BLOCKED')).toBe(true);
  // The initial B231 pilot is diagnostic: don't claim rejoin until
  // genuine native projection, Crowd add and 24-frame hold are observed.
 },120000);
});
