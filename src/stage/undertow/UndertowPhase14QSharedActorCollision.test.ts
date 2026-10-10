import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {SurfaceFlags} from '../../ink/types';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {defineTestSurfaces} from '../TestStage';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';

const DT=1/60;
beforeAll(async()=>{await initializeRapier();});
afterEach(()=>vi.restoreAllMocks());

function world(){
 vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
 const stage=undertowT21dConnectivityQaStage();
 const stats=new PerformanceStats();
 const physics=new RapierStagePhysics(DT,stage);
 physics.step();
 const ink=new GameplayInkSystem();
 defineTestSurfaces(ink,stage);
 const input={moveX:0,moveY:0,squidHeld:false,jumpHeld:false,
   consumeJump:()=>false} as PlayerInput;
 const camera={getFlatForward:(v:Vec3)=>v.set(0,0,1)} as ThirdPersonCamera;
 const player=new PlayerController({root:new Entity('T21_Q_ACTUAL_PLAYER')} as never,
   physics,input,camera,ink,stats);
 const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
 const floor=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-negative-z')!;
 const foot=nearestT21SourceSupportedLanding(floor,{
  x:link.start[0],y:link.start[1],z:link.start[2]
 });
 player.teleport(new Vec3(foot.x,foot.y+
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,foot.z));
 for(let i=0;i<75;i++){
  player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
 }
 const realPlayer=player.getPosition();
 const humanFoot={x:realPlayer.x,y:realPlayer.y-
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:realPlayer.z};
 const actors=new UndertowPhase14QSharedActorCollision(physics,stage,true);
 actors.syncActualHumanFoot(humanFoot);
 return {stage,ink,stats,physics,player,realPlayer,humanFoot,actors};
}
describe('Phase14Q actual shared Rapier HUMAN/cpu capsule KCC authority: opt-in T21 only',()=>{
 it('uses one original-solid Rapier world for real player collider and CPU step; a proximity blocker is never promoted to a CPU teleport',()=>{
  const w=world();
  expect(w.stats.playerGrounded).toBe(true);
  const directions=[
   [1,0],[-1,0],[0,1],[0,-1],
   [.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]
  ] as const;
  const candidate=directions.map(([dx,dz])=>{
   const x=w.humanFoot.x+dx*.69,z=w.humanFoot.z+dz*.69;
   const source=w.ink.sampleWorld(new Vec3(x,w.humanFoot.y+.05,z),
     .34,SurfaceFlags.Paintable);
   const ray=w.physics.castStageSegment(
     new Vec3(x,w.realPlayer.y,z),w.realPlayer,'ink-projectile');
   return {x,z,dx,dz,source,ray};
  }).find(c=>c.source&&!c.ray);
  expect(candidate,'original masked landing must have a clear adjacent standing CPU').toBeDefined();
  const from={x:candidate!.x,y:w.humanFoot.y,z:candidate!.z};
  const to={x:from.x-candidate!.dx*.068,y:from.y,
    z:from.z-candidate!.dz*.068};
  const startBody=w.player.getPosition();
  w.actors.syncRealCpuFoot('B1',from);
  expect(w.actors.cpuColliderCount).toBe(1);
  const result=w.actors.auditGroundStep('B1',from,to,DT);
  console.log('T21_PHASE14Q_REAL_SHARED_RAPIER_CPU_HUMAN_CONTACT',JSON.stringify({
    result,sourceFloorY:w.humanFoot.y,sourceOriginalSolids:25,
    requestedCPUStart:[from.x,from.y,from.z],
    requestedCPUEnd:[to.x,to.y,to.z],
    realHuman:[w.realPlayer.x,w.realPlayer.y,w.realPlayer.z],
    actualPlayerPositionAfterAudit:w.player.getPosition()
  }));
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(result.productionAuthorized).toBe(false);
  expect(result.originalNavAuthorityOverridden).toBe(false);
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(w.player.getPosition().distance(startBody)).toBeLessThan(.00001);
  expect(result.requestedMeters).toBeLessThan(.075);
  expect(result.source).toBe('ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD');
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('DYNAMIC_ACTOR_OR_STAGE_BLOCKER');
  // The actual Rapier HUMAN collider was contacted even though the
  // computed displacement differed by only 1.3cm: small tolerance MUST
  // NOT override positive actor-collider evidence.
  expect(result.horizontalDisagreementMeters).toBeGreaterThan(.005);
  expect(result.colliderOwnerIds).toContain('REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR');
  w.actors.dispose();
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
 });
 it('real HUMAN production PlayerController KCC must not walk through a stationary CPU collider in its own Rapier stage world',()=>{
  // Proven original masked location, not an imaginary obstacle. No manual
  // player teleport after the first authentic Rapier ground settlement.
  const w=world();
  const cpuFoot={x:w.humanFoot.x,y:w.humanFoot.y,
    z:w.humanFoot.z+.78};
  const surface=w.ink.sampleWorld(new Vec3(
    cpuFoot.x,w.humanFoot.y+.05,cpuFoot.z),
    .34,SurfaceFlags.Paintable);
  expect(surface,'CPU contact fixture must belong to original landing paint surface')
    .not.toBeNull();
  w.actors.syncRealCpuFoot('B4',cpuFoot);
  const input=(w.player as unknown as {input:PlayerInput}).input as unknown as {
    moveY:number
  };
  input.moveY=1;
  const before=w.player.getPosition();
  let minimumDistance=Number.POSITIVE_INFINITY;
  for(let frame=0;frame<45;frame++){
    w.player.computeFixed(DT);
    w.physics.step();
    w.player.syncAfterPhysics(DT);
    const p=w.player.getPosition();
    minimumDistance=Math.min(minimumDistance,
      Math.hypot(p.x-cpuFoot.x,p.z-cpuFoot.z));
  }
  const after=w.player.getPosition();
  const playerTravel=after.distance(before);
  console.log('T21_PHASE14Q_ACTUAL_PLAYER_KCC_BLOCKED_BY_REAL_CPU_PROXY',JSON.stringify({
    playerTravelMeters:playerTravel,
    closestPlayerCpuHorizontalMeters:minimumDistance,
    cpuOriginalFoot:cpuFoot,
    humanFirst:[before.x,before.y,before.z],
    humanFinal:[after.x,after.y,after.z],
    cpuCapsuleCount:w.actors.cpuColliderCount,
    originalGeometryUnchanged:true,
    cpuRenderMovementFabricated:false,
    fullCpuCrowdCollisionCouplingApproved:false
  }));
  expect(w.stats.playerGrounded).toBe(true);
  expect(minimumDistance).toBeGreaterThan(.54);
  expect(playerTravel).toBeGreaterThan(.01);
  expect(playerTravel).toBeLessThan(.65);
  expect(w.actors.cpuColliderCount).toBe(1);
  w.actors.dispose();
 });
 it('rejects a prospective CPU Crowd endpoint INSIDE the real HUMAN capsule before a tiny physical discrepancy is incorrectly tolerated',()=>{
  const w=world();
  const initial={x:w.humanFoot.x+.655,y:w.humanFoot.y,z:w.humanFoot.z};
  const unsafe={x:w.humanFoot.x+.59,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B3',initial);
  const result=w.actors.auditGroundStep('B3',initial,unsafe,DT);
  expect(result.requestedMeters).toBeLessThan(.075);
  expect(result.proposedActorCapsuleOverlap).toBe(true);
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('DYNAMIC_ACTOR_OR_STAGE_BLOCKER');
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(w.player.getPosition().x).toBeCloseTo(w.humanFoot.x);
  console.log('T21_PHASE14Q_M3_REJECT_PROSPECTIVE_REAL_HUMAN_CAPSULE_OVERLAP',
    JSON.stringify(result));
  w.actors.dispose();
 });
 it('fails closed on initial actual human/CPU overlap, even if a Rapier KCC does not depenetrate the stationary capsule',()=>{
  const w=world();
  const before={x:w.humanFoot.x+.04,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B4',before);
  const result=w.actors.auditGroundStep('B4',before,before,DT);
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('UNSUPPORTED_INITIAL_OVERLAP');
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(w.actors.cpuColliderCount).toBe(1);
  w.actors.dispose();
 });
 it('match reset removes every CPU proxy but retains the actual PlayerController and static original collision geometry',()=>{
  const w=world();
  const a={x:w.humanFoot.x+2,y:w.humanFoot.y,z:w.humanFoot.z};
  const b={x:w.humanFoot.x-2,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('A1',a);
  w.actors.syncRealCpuFoot('B4',b);
  expect(w.actors.cpuColliderCount).toBe(2);
  const originalHumanPosition=w.player.getPosition().clone();
  const originalProbe=w.physics.castStageSegment(
    new Vec3(w.humanFoot.x,w.humanFoot.y+1,w.humanFoot.z),
    new Vec3(w.humanFoot.x,w.humanFoot.y-1,w.humanFoot.z),'ink-projectile');
  expect(originalProbe?.solidId)
    .toBe('UndertowT21D:first-drop-landing-negative-z');
  w.actors.resetActors();
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(w.player.getPosition().distance(originalHumanPosition)).toBeLessThan(1e-7);
  expect(w.physics.castStageSegment(
    new Vec3(w.humanFoot.x,w.humanFoot.y+1,w.humanFoot.z),
    new Vec3(w.humanFoot.x,w.humanFoot.y-1,w.humanFoot.z),'ink-projectile')
    ?.solidId).toBe(originalProbe?.solidId);
  w.actors.syncRealCpuFoot('B1',a);
  expect(()=>w.actors.auditGroundStep('B1',a,a,DT))
    .toThrow('T21_PHASE14Q_REAL_HUMAN_FOOT_NOT_SYNCHRONIZED');
  w.actors.syncActualHumanFoot(w.humanFoot);
  const audited=w.actors.auditGroundStep('B1',a,a,DT);
  expect(audited.realHumanCapsulePresent).toBe(true);
  expect(audited.originalSourceCollidersIntact).toBe(true);
  w.actors.dispose();
  expect(w.actors.cpuColliderCount).toBe(0);
 });
 it('refuses unsafe 60Hz, overspeed, untrusted actor identity and production stages',()=>{
  const w=world();
  const at={x:w.humanFoot.x+2,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('A1',at);
  expect(()=>w.actors.auditGroundStep('A1',at,at,.03))
   .toThrow('T21_PHASE14Q_REQUIRES_EXACT_60HZ');
  expect(()=>w.actors.auditGroundStep('A1',at,{
   x:at.x+1,y:at.y,z:at.z},DT))
   .toThrow('T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED');
  expect(()=>w.actors.syncRealCpuFoot('invalid',at))
   .toThrow('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  expect(()=>w.actors.syncRealCpuFoot('B1',{x:NaN,y:3,z:4}))
   .toThrow('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  expect(()=>new UndertowPhase14QSharedActorCollision(
   w.physics,w.stage,false)).toThrow('T21_PHASE14Q_NOT_AUTHORIZED_FOR_PRODUCTION');
  w.actors.dispose();
 });
});
