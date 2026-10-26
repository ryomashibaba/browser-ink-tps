/**
 * B230 exercises the reusable *QA-only* CPU KCC actuator.
 * The actual live CpuAgentSystem/Crowd is intentionally not attached.
 */
import {beforeAll,describe,it,expect} from 'vitest';
import {initializeRapier} from '../src/physics/RapierStagePhysics';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as CI688}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {B230CpuLocalGapQaActuator,
 type B230Side,type B230Direction,type B230LocalGapPlan}
 from '../src/ai/B230CpuLocalGapQaActuator';
import type {StageDefinition,StageVector3,StageSolidDefinition}
 from '../src/stage/StageDefinition';

const ids=['floor-concrete01','slope00-outer'] as const;
function qaStage(side:B230Side):StageDefinition{
 const sourceSolids:StageSolidDefinition[]=ids.map(name=>{
  const source=CI688.find(x=>x.id==='underpass-route-'+name+
   (side==='POSITIVE_Z'?'-positive-z':'-negative-z'));
  if(!source)throw Error('B230_MISSING_CI688_SOURCE');
  const v=source.mesh.vertices;
  const size:StageVector3=[0,1,2].map(axis=>
   Math.max(...v.map(p=>p[axis]!))-Math.min(...v.map(p=>p[axis]!))
  ) as StageVector3;
  return {id:'B230_QA:'+source.id,center:[0,0,0],size,
   render:false,material:'medium',cameraBlocker:false,
   projectileBlocker:false,collisionEnabled:true,
   navigationEnabled:false,triangleMesh:source.mesh};
 });
 return {metadata:{id:'b230-exact-source-local-cpu-qa',
  displayName:'B230 isolated original source CPU physical agent',
  worldBounds:ORIGINAL.worldBounds,teamASpawn:[0,0,0],
  teamBSpawn:[0,0,0],teamASpawnSlots:[[0,0,0]],
  teamBSpawnSlots:[[0,0,0]],tacticalNodes:[],splatZones:[]},
  solids:[...ORIGINAL.solids,...sourceSolids],
  paintSurfaces:ORIGINAL.paintSurfaces,
  navigationLinks:ORIGINAL.navigationLinks};
}
function point(x:number,y:number,z:number,side:B230Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
function plan(side:B230Side,direction:B230Direction,
  permitPhysicalLocalJump:boolean):B230LocalGapPlan{
 return {side,direction,permitPhysicalLocalJump,
  start:direction==='FLOOR_TO_SLOPE'
   ?point(-6,3,23.4,side)
   :point(-6,3+(19.5-17)/3,17,side),
  target:direction==='FLOOR_TO_SLOPE'
   ?point(-6,3+(19.5-19.1)/3,19.1,side)
   :point(-6,3,21.9,side)};
}
function trial(side:B230Side,direction:B230Direction,enabled:boolean){
 const actor=new B230CpuLocalGapQaActuator(
  qaStage(side),plan(side,direction,enabled));
 let snap=actor.snapshot();
 for(let i=0;i<240&&snap.phase!=='FAILED'&&snap.phase!=='SUCCEEDED';i++)
  snap=actor.advance();
 return snap;
}
beforeAll(async()=>initializeRapier());
describe('B230 CPU autonomous takeoff and true Rapier local gap QA',()=>{
 it('runs actual native source launch decision at CPU acceleration on both mirrors',()=>{
  expect(ORIGINAL.solids).toHaveLength(25);
  expect(ORIGINAL.paintSurfaces).toHaveLength(17);
  expect(ORIGINAL.navigationLinks).toHaveLength(26);
  expect(ORIGINAL.activationReady).toBe(false);
  const outcomes=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const)
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const)
    for(const jump of [false,true])
     outcomes.push({side,direction,jump,result:trial(side,direction,jump)});
  console.log('B230_REAL_NATIVE_CPU_LOCAL_JUMP_ACTUATOR',
   JSON.stringify({scope:'27_SOLID_ISOLATED_ORIGINAL_QA',
    cpuAgentSystemUsed:false,crowdRecastUsed:false,
    speed:GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
    acceleration:GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2,
    stage:'25/17/26/0',officialWinner:'NONE',
    productionAuthorized:false,outcomes}));
  expect(outcomes).toHaveLength(8);
  const jumps=outcomes.filter(x=>x.jump).map(x=>x.result);
  const walks=outcomes.filter(x=>!x.jump).map(x=>x.result);
  expect(jumps.every(x=>x.accepted&&x.phase==='SUCCEEDED'&&
   x.totalLocalJumpCommands===1&&x.launchAtTick!==null&&
   x.launchColliderId?.startsWith('B230_QA:underpass-route-')&&
   x.launchGrounded&&x.leftGround&&x.landedAfterAirborne&&
   x.targetGroundedStreak>=18&&x.existing25CollisionIds.length===0&&
   x.teleportsAfterInitialQaSpawn===0)).toBe(true);
  expect(walks.every(x=>!x.accepted&&x.phase==='FAILED'&&
   x.totalLocalJumpCommands===0)).toBe(true);
  expect(outcomes.every(x=>x.result.groundSupportedAtSpawn&&
   x.result.cpuNavigationPathCertified===false&&
   x.result.productionAuthorized===false)).toBe(true);
 },60000);
 it('refuses production, incomplete source, source drift and fake target',()=>{
  const side='POSITIVE_Z';
  const good=qaStage(side);
  const p=plan(side,'FLOOR_TO_SLOPE',true);
  const base={...good,metadata:{...good.metadata,id:'undertow-t21d-partial-connectivity-qa'}};
  expect(()=>new B230CpuLocalGapQaActuator(base,p))
   .toThrow('B230_LIVE_OR_UNTRUSTED_STAGE_REFUSED');
  expect(()=>new B230CpuLocalGapQaActuator(
   {...good,solids:good.solids.slice(0,26)},p))
   .toThrow('B230_LIVE_OR_UNTRUSTED_STAGE_REFUSED');
  const extras=[...good.solids];
  extras[26]={...extras[26]!,navigationEnabled:true};
  expect(()=>new B230CpuLocalGapQaActuator(
   {...good,solids:extras},p))
   .toThrow('B230_NONEXACT_OR_NAV_ENABLED_SOURCE_REFUSED');
  expect(()=>new B230CpuLocalGapQaActuator(good,
   {...p,target:[100,0,100]}))
   .toThrow('B230_NONLOCAL_OR_INVALID_GOAL_REFUSED');
 });
});
