import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';
import {UndertowPhase14ECpuHandoff} from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';
import {UndertowF3NativeHumanCrowd} from '../../app/UndertowF3NativeHumanCrowd';

const DT=1/60;
type RealBot={id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;thinkRemaining:number;paintRemaining:number;
 fireRemaining:number;jumpCooldownSeconds:number};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('W6: same-floor moving physical Human and seven native CPUs',()=>{
 it('approaches a real initial CPU without violating a genuine shared Rapier capsule on original spawn terrain',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const original=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const nav=new RecastStageNavigation(original,stats);
  const physics=new RapierStagePhysics(DT,original);
  physics.step();
  const slots=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
  const stage=withProvisionalT21QaSpawnMetadata(original,slots);
  const humanStart=slots.teamASlots[3]!;
  const upperId='UndertowT21D:spawn-high-positive-z';
  const floor=(x:number,z:number)=>{
   const hit=physics.castStageSegment(
    new Vec3(x,8.2,z),new Vec3(x,6.8,z),'ink-projectile');
   return hit?.solidId??null;
  };
  expect(floor(humanStart[0],humanStart[2])).toBe(upperId);
  let move=0;
  const approach=new Vec3(0,0,1);
  const input={
   get moveX(){return 0;},get moveY(){return move;},
   get squidHeld(){return false;},get jumpHeld(){return false;},
   consumeJump(){return false;}
  } as PlayerInput;
  const camera=({getFlatForward:(out:Vec3)=>out.copy(approach)})
   as ThirdPersonCamera;
  const app={root:new Entity('W6_REAL_HIGH_SPAWN_8_ACTORS')} as never;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  player.teleport(new Vec3(humanStart[0],
   humanStart[1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
   humanStart[2]));
  for(let f=0;f<75;f++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  expect(stats.playerGrounded).toBe(true);
  const footY=player.getPosition().y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  expect(footY).toBeGreaterThan(7.45);
  expect(footY).toBeLessThan(7.6);
  const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const humanCrowd=new UndertowF3NativeHumanCrowd(nav,stage);
  const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
   stats,stage,Team.A,handoff,shared,humanCrowd,true);
  const bots=(cpu as unknown as {bots:RealBot[]}).bots;
  expect(bots.map(b=>b.id)).toEqual(
   ['A1','A2','A3','B1','B2','B3','B4']);
  for(const bot of bots){
   bot.agent?.resetMoveTarget();
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  const physicalStart=player.getPosition().clone();
  const candidates=bots.filter(b=>b.team===Team.A);
  // CPU and Human are their ORIGINAL source-derived 4+4 QA slots, never
  // hand-teleported to manufacture a collision or an easy pass.
  const target=candidates.sort((a,b)=>
   a.position.distance(physicalStart)-b.position.distance(physicalStart))[0]!;
  const dx=target.position.x-physicalStart.x;
  const dz=target.position.z-physicalStart.z;
  const startSeparation=Math.hypot(dx,dz);
  expect(startSeparation).toBeGreaterThan(.63);
  expect(startSeparation).toBeLessThan(2.7);
  approach.set(dx,0,dz).normalize();
  const goal=nav.closestPoint(new Vec3(
   humanStart[0],humanStart[1],humanStart[2]));
  const native=nav.auditPath(target.position,
   new Vec3(goal.x,goal.y,goal.z));
  expect(native.reachedTarget).toBe(true);
  expect(native.startSnapDistanceMeters).toBeLessThan(.22);
  expect(native.endSnapDistanceMeters).toBeLessThan(.22);
  // ONE native CPU receives an authentic reachable source-floor goal.
  // Other real CPUs are present and collidable in the same world.
  target.agent!.requestMoveTarget(new Vec3(goal.x,goal.y,goal.z));
  const originalFeet=new Map(bots.map(b=>[b.id,b.position.clone()]));
  let minimumSameFloorSeparation=Infinity;
  let humanTravelMeters=0,minimumProjectedSeparation=Infinity;
  let playerAirTicks=0,unverifiedFloorTicks=0;
  let cpuAcceptedSteps=0,maximumCpuFrameStep=0;
  let successfulFrames=0,firstUnsafe:string|null=null,firstUnsafeFrame=-1;
  let previousPlayer=player.getPosition().clone();
  const previousBots=new Map(bots.map(b=>[b.id,b.position.clone()]));
  move=1;
  for(let frame=1;frame<=45;frame++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const now=player.getPosition().clone();
   humanTravelMeters+=Math.hypot(now.x-previousPlayer.x,now.z-previousPlayer.z);
   previousPlayer=now;
   if(!stats.playerGrounded)playerAirTicks++;
   if(floor(now.x,now.z)!==upperId)unverifiedFloorTicks++;
   try{
    cpu.fixedUpdate(DT,true,Team.A,now,true);
   }catch(error){
    firstUnsafe=String(error);firstUnsafeFrame=frame;
    break;
   }
   expect(shared.cpuColliderCount).toBe(7);
   expect(shared.approxActorOverlapIds()).toEqual([]);
   const realHumanY=now.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   for(const bot of bots){
    const delta=bot.position.distance(previousBots.get(bot.id)!);
    if(delta>1e-4)cpuAcceptedSteps++;
    maximumCpuFrameStep=Math.max(maximumCpuFrameStep,delta);
    previousBots.get(bot.id)!.copy(bot.position);
    expect(delta).toBeLessThanOrEqual(
     GAME_CONFIG.cpu.maxSpeedMetersPerSecond*DT+1e-4);
    if(Math.abs(bot.position.y-realHumanY)>=1)continue;
    const sep=Math.hypot(bot.position.x-now.x,bot.position.z-now.z);
    minimumSameFloorSeparation=Math.min(minimumSameFloorSeparation,sep);
    if(bot.id===target.id)
     minimumProjectedSeparation=Math.min(minimumProjectedSeparation,sep);
    // Actual capsule contact must NEVER produce a final real-foot overlap.
    expect(sep).toBeGreaterThan(.61);
   }
   cpu.drainFireRequests(()=>{throw Error('W6_SOURCE_CONTACT_NO_COMBAT');});
   cpu.drainKitRequests(()=>false);
   successfulFrames++;
  }
  const evidence={
   source:'REAL_HUMAN_KCC_PLUS_SEVEN_NATIVE_CPU_SHARED_COLLIDERS',
   approachedActor:target.id,originalHumanSlot:humanStart,
   originalTargetCpuFoot:originalFeet.get(target.id),
   initialTargetDistanceMeters:startSeparation,
   humanTravelMeters,minimumTargetDistanceMeters:minimumProjectedSeparation,
   minimumSameFloorActorDistanceMeters:minimumSameFloorSeparation,
   cpuAcceptedSteps,maximumCpuFrameStepMeters:maximumCpuFrameStep,
   playerAirTicks,unverifiedFloorTicks,
   successFrames:successfulFrames,firstUnsafe,firstUnsafeFrame,
   allSevenSharedColliders:shared.cpuColliderCount,
   originalSolids:stage.solids.length,
   originalPaintSurfaces:stage.paintSurfaces.length,
   originalNavigationLinks:stage.navigationLinks?.length,
   productionAuthorized:false,unrestricted4v4Certified:false,
   allSevenFirstDropsCertified:false,sourceGeometryModified:false,
   scoreablePromotions:0,physicalCpuTeleports:0
  };
  console.log('T21_W6_SAME_FLOOR_EIGHT_ACTOR_REAL_CONTACT',JSON.stringify(evidence));
  expect(firstUnsafe).toBeNull();
  expect(successfulFrames).toBe(45);
  expect(humanTravelMeters).toBeGreaterThan(.04);
  expect(minimumSameFloorSeparation).toBeLessThan(Infinity);
  expect(minimumSameFloorSeparation).toBeGreaterThan(.61);
  expect(playerAirTicks).toBe(0);
  expect(unverifiedFloorTicks).toBe(0);
  expect(shared.cpuColliderCount).toBe(7);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(shared.cpuColliderCount).toBe(0);
  humanCrowd.dispose();
  shared.dispose();
  expect(handoff.activeCount).toBe(0);
 });
});
