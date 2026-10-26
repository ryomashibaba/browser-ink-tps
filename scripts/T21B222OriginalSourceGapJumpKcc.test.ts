/**
 * B222 isolated REAL Rapier production-Human KCC jump experiment.
 * No production stage / nav / CPU / source mesh mutation or teleport.
 * Existing CI688 Temple01 original floor and slope only, per mirrored side.
 * Tests the previously untested jump hypothesis after Pass18J no-jump failure.
 */
import RAPIER, {type Collider,type RigidBody} from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {
 PLAYER_CHARACTER_PHYSICS as HUMAN,
 createConfiguredPlayerCharacterController
} from '../src/player/PlayerCharacterPhysics';
import {
 initializeRapier,RapierStagePhysics
} from '../src/physics/RapierStagePhysics';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as STAGE}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Motion='WALK'|'JUMP';
const DT=1/60;
const sid=(base:string,side:Side)=>
 base+(side==='POSITIVE_Z'?'-positive-z':'-negative-z');
const source=(base:string,side:Side)=>{
 const f=FACES.find(x=>x.id===sid(base,side));
 if(!f)throw Error('B222_SOURCE_MISSING_'+base+'_'+side);
 return f;
};
const point=(modelX:number,modelY:number,modelZ:number,side:Side):StageVector3=>{
 const mirrored=side==='POSITIVE_Z'
  ?[modelX,modelZ]:[-modelX,-modelZ];
 const [x,z]=undertowTemple01ModelXZToProjectXZ(
  [mirrored[0]!,mirrored[1]!]);
 return [x,modelY-3,z];
};
const floorPoint=(side:Side)=>point(-6,3,21.9,side);
const slopePoint=(side:Side)=>point(-6,3+(19.5-19.1)/3,19.1,side);

function stageFor(side:Side):StageDefinition {
 const floor=source('underpass-route-floor-concrete01',side);
 const slope=source('underpass-route-slope00-outer',side);
 const solids:StageSolidDefinition[]=[floor,slope].map(f=>({
  id:'B222:'+f.id,center:[0,0,0],
  size:[
   Math.max(...f.mesh.vertices.map(v=>v[0]))-Math.min(...f.mesh.vertices.map(v=>v[0])),
   Math.max(...f.mesh.vertices.map(v=>v[1]))-Math.min(...f.mesh.vertices.map(v=>v[1])),
   Math.max(...f.mesh.vertices.map(v=>v[2]))-Math.min(...f.mesh.vertices.map(v=>v[2]))
  ],material:'medium',render:false,projectileBlocker:true,
  cameraBlocker:false,collisionEnabled:true,navigationEnabled:false,
  triangleMesh:f.mesh
 }));
 return {metadata:{
  id:'b222-source-only-'+side,
  displayName:'B222 isolated original source KCC QA',
  worldBounds:STAGE.worldBounds,
  teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
  teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
  tacticalNodes:[],splatZones:[]},
  solids,paintSurfaces:[],navigationLinks:[]};
}

interface Result {
 side:Side;motion:Motion;direction:'FLOOR_TO_SLOPE'|'SLOPE_TO_FLOOR';
 settled:boolean;leftGround:boolean;landedAfterAirborne:boolean;
 finishSupportedByTarget:boolean;finishGrounded:boolean;
 finalHorizontalErrorMeters:number;finalFootHeightErrorMeters:number;
 minFootBelowTargetMeters:number;maxRiseMeters:number;
 jumpUsed:boolean;success:boolean;
}
function run(
 side:Side,motion:Motion,direction:Result['direction']
):Result{
 const qa=stageFor(side);
 const physics=new RapierStagePhysics(DT,qa);
 physics.step();
 const start=direction==='FLOOR_TO_SLOPE'?floorPoint(side):slopePoint(side);
 const end=direction==='FLOOR_TO_SLOPE'?slopePoint(side):floorPoint(side);
 const targetId='B222:'+sid(direction==='FLOOR_TO_SLOPE'
  ?'underpass-route-slope00-outer':'underpass-route-floor-concrete01',side);
 const body:RigidBody=physics.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   start[0],start[1]+HUMAN.humanFootOffsetMeters+0.06,start[2]));
 const collider:Collider=physics.world.createCollider(
  RAPIER.ColliderDesc.capsule(
   HUMAN.humanHalfHeightMeters,HUMAN.humanRadiusMeters),body);
 const ctrl=createConfiguredPlayerCharacterController(physics.world);
 const step=(x:number,y:number,z:number)=>{
  const before=body.translation();
  ctrl.computeColliderMovement(collider,new Vec3(x,y,z),
   undefined,undefined,c=>physics.shouldCharacterCollide(c,'HUMAN'));
  const corrected=ctrl.computedMovement();
  body.setNextKinematicTranslation({
   x:before.x+corrected.x,y:before.y+corrected.y,z:before.z+corrected.z});
  const grounded=ctrl.computedGrounded();
  physics.step();
  return grounded;
 };
 let settled=false;
 for(let i=0;i<30;i++){
  settled=step(0,-0.12,0);
  if(settled)break;
 }
 let vy=motion==='JUMP'&&settled?GAME_CONFIG.player.jumpSpeedMetersPerSecond:0;
 let leftGround=false,landedAfterAirborne=false,finishGrounded=false;
 let minFootY=Infinity,maxFootY=-Infinity;
 let finishSupportedByTarget=false;
 for(let tick=0;tick<120;tick++){
  const prev=body.translation();
  const dx=end[0]-prev.x,dz=end[2]-prev.z;
  const d=Math.hypot(dx,dz);
  const travel=Math.min(d,GAME_CONFIG.player.humanSpeedMetersPerSecond*DT);
  vy=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
   vy-GAME_CONFIG.player.gravityMetersPerSecond2*DT);
  const grounded=step(
   d>1e-8?dx/d*travel:0,vy*DT,d>1e-8?dz/d*travel:0);
  if(!grounded)leftGround=true;
  if(leftGround&&grounded)landedAfterAirborne=true;
  if(grounded&&vy<0)vy=-0.5;
  const p=body.translation();
  const footY=p.y-HUMAN.humanFootOffsetMeters;
  minFootY=Math.min(minFootY,footY);
  maxFootY=Math.max(maxFootY,footY);
  finishGrounded=grounded;
  const err=Math.hypot(end[0]-p.x,end[2]-p.z);
  if(err<=0.22&&grounded){
   const hit=physics.castCharacterFootSupport(
    new Vec3(p.x,p.y,p.z),HUMAN.humanFootOffsetMeters,'HUMAN');
   finishSupportedByTarget=hit?.solidId===targetId&&
    Math.abs(hit.point.y-end[1])<=0.20;
   if(finishSupportedByTarget)break;
  }
 }
 const p=body.translation();
 const finalHorizontalErrorMeters=Math.hypot(end[0]-p.x,end[2]-p.z);
 const finalFootHeightErrorMeters=Math.abs(
  (p.y-HUMAN.humanFootOffsetMeters)-end[1]);
 const success=settled&&leftGround&&landedAfterAirborne&&
  finishGrounded&&finishSupportedByTarget&&
  finalHorizontalErrorMeters<=0.22&&finalFootHeightErrorMeters<=0.22;
 return {
  side,motion,direction,settled,leftGround,landedAfterAirborne,
  finishSupportedByTarget,finishGrounded,finalHorizontalErrorMeters,
  finalFootHeightErrorMeters,
  minFootBelowTargetMeters:Math.max(0,end[1]-minFootY),
  maxRiseMeters:maxFootY-start[1],jumpUsed:motion==='JUMP',success
 };
}
beforeAll(async()=>initializeRapier());

describe('B222 exact original 2m floor-to-slope gap, isolated production KCC',()=>{
 it('checks real ground contact and both jump directions on source geometry, without runtime promotion',()=>{
  expect(STAGE.solids).toHaveLength(25);
  expect(STAGE.paintSurfaces).toHaveLength(17);
  expect(STAGE.navigationLinks).toHaveLength(26);
  expect(STAGE.activationReady).toBe(false);
  expect(HUMAN.humanRadiusMeters).toBe(0.32);
  expect(GAME_CONFIG.player.jumpSpeedMetersPerSecond).toBe(8.2);
  expect(GAME_CONFIG.player.gravityMetersPerSecond2).toBe(28);
  const outcomes:Result[]=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const)
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const)
    for(const motion of ['WALK','JUMP'] as const)
     outcomes.push(run(side,motion,direction));
  console.log('B222_NATIVE_ORIGINAL_GAP_KCC_JUMP_WITNESS',
   JSON.stringify({source:'CI688_EXACT_2_COMPONENTS_PER_SIDE',
    physicalKcc:true,sceneIsolated:true,teleports:0,
    productionAuthorized:false,scoreablePromotions:0,
    navLinksAdded:0,originalCrossTeamRoutesCertified:'0/12',
    outcomes}));
  expect(outcomes).toHaveLength(8);
  expect(outcomes.every(o=>o.settled)).toBe(true);
  expect(outcomes.filter(o=>o.motion==='WALK').every(o=>!o.success)).toBe(true);
  // Do not manufacture a PASS: the next decision follows real Rapier outcomes.
  const jumps=outcomes.filter(o=>o.motion==='JUMP');
  expect(jumps).toHaveLength(4);
  expect(jumps.every(o=>Number.isFinite(o.finalHorizontalErrorMeters)
   &&Number.isFinite(o.finalFootHeightErrorMeters))).toBe(true);
  expect(STAGE.activationReady).toBe(false);
 },30000);
});
