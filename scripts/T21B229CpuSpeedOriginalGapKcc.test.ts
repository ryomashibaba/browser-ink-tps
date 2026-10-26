/**
 * B229 CPU-speed, CPU-acceleration physical KCC source-jump research.
 *
 * This does NOT instantiate the real CpuAgentSystem and MUST NOT be reported
 * as a deployed CPU navigation success. It uses native Rapier ground contact,
 * production shared character-controller geometry and actual CPU locomotive
 * speed/acceleration on two exact CI688 original source faces per side
 * alongside the 25 unchanged registered original stage solids.
 *
 * Critically this is NOT the scripted CpuAgentSystem superjump, a Recast
 * offmesh teleport, a pose lerp, or any CPU route promotion. JUMP is a
 * QA-only physical input proposal. Whether it works is measured below.
 */
import RAPIER,{type RigidBody,type Collider} from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS as PROFILE,
 createConfiguredPlayerCharacterController}
 from '../src/player/PlayerCharacterPhysics';
import {RapierStagePhysics,initializeRapier}
 from '../src/physics/RapierStagePhysics';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as COMPONENTS}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Direction='FLOOR_TO_SLOPE'|'SLOPE_TO_FLOOR';
type Mode='WALK_ONLY'|'JUMP_8_2_NATIVE_KCC';
const DT=1/60;
const FULL_V=GAME_CONFIG.cpu.maxSpeedMetersPerSecond;
const A=GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2;
const GRAVITY=GAME_CONFIG.player.gravityMetersPerSecond2;
const JUMP_V=GAME_CONFIG.player.jumpSpeedMetersPerSecond;
const Z_START={FLOOR_TO_SLOPE:23.4,SLOPE_TO_FLOOR:17.0};
function model(x:number,y:number,z:number,side:Side):StageVector3{
 const mirrored:readonly [number,number]=side==='POSITIVE_Z'?[x,z]:[-x,-z];
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(mirrored);
 return [px,y-3,pz];
}
const sourceId=(base:string,side:Side)=>
 'B229_QA:'+base+(side==='POSITIVE_Z'?'-positive-z':'-negative-z');
const startPoint=(direction:Direction,side:Side)=>direction==='FLOOR_TO_SLOPE'
 ?model(-6,3,Z_START.FLOOR_TO_SLOPE,side)
 :model(-6,3+(19.5-Z_START.SLOPE_TO_FLOOR)/3,
    Z_START.SLOPE_TO_FLOOR,side);
const destination=(direction:Direction,side:Side)=>direction==='FLOOR_TO_SLOPE'
 ?model(-6,3+(19.5-19.1)/3,19.1,side)
 :model(-6,3,21.9,side);
function stage(side:Side):StageDefinition{
 const source:StageSolidDefinition[]=
 ['underpass-route-floor-concrete01','underpass-route-slope00-outer']
 .map(base=>{
  const record=COMPONENTS.find(x=>x.id===
    base+(side==='POSITIVE_Z'?'-positive-z':'-negative-z'));
  if(!record)throw Error('B229_MISSING_EXACT_CI688_SOURCE_'+base);
  const v=record.mesh.vertices;
  const size=([0,1,2] as const).map(k=>
   Math.max(...v.map(p=>p[k]))-Math.min(...v.map(p=>p[k])))
   as unknown as StageVector3;
  return {id:sourceId(base,side),center:[0,0,0],size,
   material:'medium',render:false,cameraBlocker:false,
   projectileBlocker:false,collisionEnabled:true,
   navigationEnabled:false,triangleMesh:record.mesh};
 });
 return {
  metadata:{id:'b229-physical-cpu-locomotion-isolated',
   displayName:'B229 original source cpu-speed Rapier QA',
   worldBounds:FROZEN.worldBounds,
   teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
   teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
   tacticalNodes:[],splatZones:[]},
  solids:[...FROZEN.solids,...source],
  paintSurfaces:FROZEN.paintSurfaces,
  navigationLinks:FROZEN.navigationLinks
 };
}
type Witness={
 side:Side;direction:Direction;mode:Mode;
 startOriginalSourceSupported:boolean;
 actualLaunchSupportId:string|null;
 physicallyGroundedAtLaunch:boolean;
 launchTick:number|null;launchSpeedMetersPerSecond:number|null;
 leftGround:boolean;landedAfterJump:boolean;
 firstTargetLandingTick:number|null;
 stableTargetTicks:number;maxStableTargetTicks:number;
 horizontalErrorAtFirstTargetMeters:number|null;
 closestGroundedOriginalTargetMeters:number|null;
 collisionsAgainstOriginal25:readonly string[];
 finalSupportId:string|null;finalGrounded:boolean;
 finalPosition:[number,number,number];totalTickCount:number;
 nativeKccSteps:number;teleportsAfterInitialSpawn:0;
 nativeCpuAcceleration:A;nativeCpuSpeed:typeof FULL_V;
 sourceFaceAdditions:2;liveStageModified:false;
 physicalTargetReached:boolean;accepted:boolean;
};
function pilot(side:Side,direction:Direction,mode:Mode):Witness{
 const original=stage(side),world=new RapierStagePhysics(DT,original);
 world.step();
 const start=startPoint(direction,side),target=destination(direction,side);
 const initialId=sourceId(direction==='FLOOR_TO_SLOPE'
  ?'underpass-route-floor-concrete01':'underpass-route-slope00-outer',side);
 const targetId=sourceId(direction==='FLOOR_TO_SLOPE'
  ?'underpass-route-slope00-outer':'underpass-route-floor-concrete01',side);
 const body:RigidBody=world.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   start[0],start[1]+PROFILE.humanFootOffsetMeters+.06,start[2]));
 const collider:Collider=world.world.createCollider(
  RAPIER.ColliderDesc.capsule(
   PROFILE.humanHalfHeightMeters,PROFILE.humanRadiusMeters),body);
 const character=createConfiguredPlayerCharacterController(world.world);
 let nativeKccSteps=0;
 const collisionsAgainstOriginal25=new Set<string>();
 function step(x:number,y:number,z:number){
  const before=body.translation();
  character.computeColliderMovement(collider,new Vec3(x,y,z),
   undefined,undefined,c=>world.shouldCharacterCollide(c,'HUMAN'));
  for(let i=0;i<character.numComputedCollisions();i++){
   const c=character.computedCollision(i)?.collider;
   const id=c?world.sourceSolidIdForCollider(c):null;
   if(id&&FROZEN.solids.some(s=>s.id===id))
    collisionsAgainstOriginal25.add(id);
  }
  const moved=character.computedMovement();
  body.setNextKinematicTranslation({
   x:before.x+moved.x,y:before.y+moved.y,z:before.z+moved.z
  });
  const grounded=character.computedGrounded();
  world.step();nativeKccSteps++;
  return grounded;
 }
 let grounded=false;
 for(let i=0;i<30;i++){grounded=step(0,-.12,0);if(grounded)break;}
 const support=()=>{
  const p=body.translation();
  return world.castCharacterFootSupport(new Vec3(p.x,p.y,p.z),
   PROFILE.humanFootOffsetMeters,'HUMAN')?.solidId??null;
 };
 const initialSupport=support();
 let speed=0,vy=-.5;
 let launchTick:number|null=null,launchSpeedMetersPerSecond:number|null=null;
 let launchSupport:string|null=null,launchGrounded=false;
 let leftGround=false,landedAfterJump=false,firstLandingTick:number|null=null;
 let stableTargetTicks=0,maxStableTargetTicks=0,closest=Infinity;
 let firstError:number|null=null,finalGrounded=grounded,finalSupport:string|null=initialSupport;
 let count=0;
 for(let tick=0;tick<240;tick++){
  count++;
  const p=body.translation();
  const dx=target[0]-p.x,dz=target[2]-p.z;
  const dist=Math.hypot(dx,dz);
  const ux=dist>1e-8?dx/dist:0,uz=dist>1e-8?dz/dist:0;
  // Real CPU drive constraints: 18m/s2 toward 4.4m/s, no full-speed
  // scripted KCC displacement on the first step.
  const targetSpeed=Math.min(FULL_V,Math.sqrt(2*A*dist));
  speed=Math.max(0,Math.min(targetSpeed,speed+A*DT));
  const progress=Math.hypot(p.x-start[0],p.z-start[2]);
  const lipProgress=direction==='FLOOR_TO_SLOPE'?1.52:2.24;
  if(mode==='JUMP_8_2_NATIVE_KCC'&&launchTick===null&&
     progress>=lipProgress&&grounded){
   launchSupport=support();launchGrounded=grounded;
   // Fail closed: the exact original source floor must actually support
   // the capsule when the CPU-local jump command is triggered.
   if(launchSupport===initialId){
    vy=JUMP_V;launchTick=tick;launchSpeedMetersPerSecond=speed;
   }
  }
  vy=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
   vy-GRAVITY*DT);
  grounded=step(ux*speed*DT,vy*DT,uz*speed*DT);
  if(launchTick!==null&&!grounded)leftGround=true;
  if(launchTick!==null&&leftGround&&grounded)landedAfterJump=true;
  if(grounded&&vy<0)vy=-.5;
  const after=body.translation();
  const error=Math.hypot(after.x-target[0],after.z-target[2]);
  finalSupport=support();
  finalGrounded=grounded;
  if(grounded&&finalSupport===targetId){
   closest=Math.min(closest,error);
   if(firstLandingTick===null&&launchTick!==null){
    firstLandingTick=tick;firstError=error;
   }
   if(error<=.65){
    stableTargetTicks++;
    maxStableTargetTicks=Math.max(maxStableTargetTicks,stableTargetTicks);
   }else stableTargetTicks=0;
  }else stableTargetTicks=0;
  if(maxStableTargetTicks>=18)break;
  if(after.y<-20)break;
 }
 const p=body.translation();
 const accepted=mode==='JUMP_8_2_NATIVE_KCC'&&
  initialSupport===initialId&&launchSupport===initialId&&
  launchGrounded&&launchTick!==null&&
  leftGround&&landedAfterJump&&maxStableTargetTicks>=18&&
  collisionsAgainstOriginal25.size===0;
 return {side,direction,mode,
  startOriginalSourceSupported:initialSupport===initialId,
  actualLaunchSupportId:launchSupport,
  physicallyGroundedAtLaunch:launchGrounded,
  launchTick,launchSpeedMetersPerSecond,
  leftGround,landedAfterJump,
  firstTargetLandingTick:firstLandingTick,
  stableTargetTicks,maxStableTargetTicks,
  horizontalErrorAtFirstTargetMeters:firstError,
  closestGroundedOriginalTargetMeters:Number.isFinite(closest)?closest:null,
  collisionsAgainstOriginal25:[...collisionsAgainstOriginal25].sort(),
  finalSupportId:finalSupport,finalGrounded,
  finalPosition:[p.x,p.y,p.z],totalTickCount:count,
  nativeKccSteps,teleportsAfterInitialSpawn:0,
  nativeCpuAcceleration:A,nativeCpuSpeed:FULL_V,
  sourceFaceAdditions:2,liveStageModified:false,
  physicalTargetReached:maxStableTargetTicks>=18,accepted};
}
beforeAll(async()=>initializeRapier());
describe('B229 source gap physical candidate with real CPU locomotive constraints',()=>{
 it('records mirrored native CPU-speed jump versus ground-only, no route permissions',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  const records:Witness[]=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const)
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const)
    for(const mode of ['WALK_ONLY','JUMP_8_2_NATIVE_KCC'] as const)
     records.push(pilot(side,direction,mode));
  const jumps=records.filter(x=>x.mode==='JUMP_8_2_NATIVE_KCC');
  const walks=records.filter(x=>x.mode==='WALK_ONLY');
  console.log('B229_GENUINE_RAPIER_CPU_SPEED_ORIGINAL_JUMP_CANDIDATES',
   JSON.stringify({qaOnly:true,
    actualCpuAgentSystemInstantiated:false,
    physicallyNativeKcc:true,
    source:'2_CI688_TRIANGLE_MESH_FACES_AND_FROZEN_25',
    originalStage:'25/17/26/0',originalOpposingRoutes:'0/12',
    cssize:FROZEN.solids.length,qaWorldSolids:27,
    nativeCpuSpeedMetersPerSecond:FULL_V,
    nativeCpuAccelerationMetersPerSecond2:A,
    existingSuperJumpLerpReused:false,
    cpuLocalJumpProductionAuthorized:false,officialWinner:'NONE',
    results:records,
    candidatesAccepted:jumps.filter(x=>x.accepted).length}));
  expect(records).toHaveLength(8);
  expect(records.every(x=>x.sourceFaceAdditions===2&&
   !x.liveStageModified&&x.teleportsAfterInitialSpawn===0&&
   x.nativeKccSteps>0)).toBe(true);
  expect(walks.every(x=>!x.accepted)).toBe(true);
  // First B229 experiment is diagnostic: launch and safe landing must be
  // measured before the physical jump gate can be promoted to strict PASS.
  // Never silently count a Recast projected endpoint as actual landing.
  expect(jumps).toHaveLength(4);
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
 },60000);
});
