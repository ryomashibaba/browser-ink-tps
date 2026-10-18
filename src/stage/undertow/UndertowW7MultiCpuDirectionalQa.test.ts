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

describe('W7: source-floor directional control with multiple moving CPUs',()=>{
 it('validates six real KCC approach/retreat phases with two converging source-goal Crowd CPUs',()=>{
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
  const camera=({getFlatForward:(out:Vec3)=>out.copy(approach)}) as ThirdPersonCamera;
  const app={root:new Entity('W7_REAL_HIGH_SPAWN_8_ACTORS')} as never;
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
  // A1/A2 both receive a genuine reachable native goal at the original
  // HUMAN source-supported slot. A3 and the four opposing CPUs remain live
  // agents in the same Rapier world. No actor is reassigned a physical pose.
  const slotTarget=new Vec3(humanStart[0],humanStart[1],humanStart[2]);
  const moving=bots.filter(b=>b.id==='A1'||b.id==='A2');
  expect(moving.map(b=>b.id)).toEqual(['A1','A2']);
  for(const bot of moving){
   const path=nav.auditPath(bot.position,slotTarget);
   expect(path.reachedTarget,bot.id+' actual native source path').toBe(true);
   expect(path.startSnapDistanceMeters).toBeLessThan(.22);
   expect(path.endSnapDistanceMeters).toBeLessThan(.22);
   bot.agent!.requestMoveTarget(slotTarget);
  }
  const initialFeet=new Map(bots.map(b=>[b.id,b.position.clone()]));
  const cpuPrevious=new Map(bots.map(b=>[b.id,b.position.clone()]));
  const cpuSteps=new Map(bots.map(b=>[b.id,0]));
  const cpuTravel=new Map(bots.map(b=>[b.id,0]));
  const upperFloor='UndertowT21D:spawn-high-positive-z';
  // Six deliberate keyboard/camera phases: approach each of the three
  // original same-side CPU spawn feet, then return toward HUMAN's own
  // original slot. Direction is recomputed from the REAL player each tick,
  // not a scripted body transform. No jumping or artificial displacement.
  const phases=[
   {name:'APPROACH_A1',target:'A1',radius:.70},
   {name:'RETURN_1',target:'HUMAN',radius:.17},
   {name:'APPROACH_A2',target:'A2',radius:.70},
   {name:'RETURN_2',target:'HUMAN',radius:.17},
   {name:'APPROACH_A3',target:'A3',radius:.70},
   {name:'RETURN_3',target:'HUMAN',radius:.17}
  ] as const;
  const phaseReached=new Map(phases.map(x=>[x.name,false]));
  const perPhaseMeters=new Map(phases.map(x=>[x.name,0]));
  const perPhaseCpuMotion=new Map(phases.map(x=>[x.name,0]));
  let successfulFrames=0,firstUnsafe:string|null=null,firstUnsafeFrame=-1;
  let totalPlayerTravel=0,maxCpuStep=0,playerAirTicks=0,unsupportedFloorTicks=0;
  let minPlayerCpu=Infinity,minCpuCpu=Infinity;
  let physicallyNearFrames=0,acceptedCpuSteps=0,positiveCpuGoalsMoved=0;
  let changedHeadingCount=0;
  let lastHeading=new Vec3(0,0,0);
  let previousHuman=player.getPosition().clone();
  for(let frame=1;frame<=270;frame++){
   const phase=phases[Math.floor((frame-1)/45)]!;
   const human=player.getPosition();
   const target=phase.target==='HUMAN'
    ?slotTarget:initialFeet.get(phase.target)!;
   const distance=Math.hypot(target.x-human.x,target.z-human.z);
   if(distance<=phase.radius){
    move=0;phaseReached.set(phase.name,true);
   }else{
    approach.set(target.x-human.x,0,target.z-human.z).normalize();
    move=1;
    if(lastHeading.length()>0&&lastHeading.dot(approach)<.5)
     changedHeadingCount++;
    lastHeading.copy(approach);
   }
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const now=player.getPosition().clone();
   const deltaHuman=Math.hypot(now.x-previousHuman.x,now.z-previousHuman.z);
   totalPlayerTravel+=deltaHuman;
   perPhaseMeters.set(phase.name,perPhaseMeters.get(phase.name)!+deltaHuman);
   previousHuman=now;
   if(!stats.playerGrounded)playerAirTicks++;
   if(floor(now.x,now.z)!==upperFloor)unsupportedFloorTicks++;
   try{
    cpu.fixedUpdate(DT,true,Team.A,now,true);
   }catch(error){
    firstUnsafe=String(error);firstUnsafeFrame=frame;
    break;
   }
   expect(shared.cpuColliderCount).toBe(7);
   expect(shared.approxActorOverlapIds()).toEqual([]);
   const realHumanY=now.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   for(let i=0;i<bots.length;i++){
    const bot=bots[i]!;
    const old=cpuPrevious.get(bot.id)!;
    const d=bot.position.distance(old);
    expect(d).toBeLessThanOrEqual(GAME_CONFIG.cpu.maxSpeedMetersPerSecond*DT+.0001);
    if(d>.0001){
     acceptedCpuSteps++;
     cpuSteps.set(bot.id,cpuSteps.get(bot.id)!+1);
     perPhaseCpuMotion.set(phase.name,perPhaseCpuMotion.get(phase.name)!+d);
    }
    cpuTravel.set(bot.id,cpuTravel.get(bot.id)!+d);
    maxCpuStep=Math.max(maxCpuStep,d);
    old.copy(bot.position);
    if(Math.abs(realHumanY-bot.position.y)<1){
     const separation=Math.hypot(now.x-bot.position.x,now.z-bot.position.z);
     minPlayerCpu=Math.min(minPlayerCpu,separation);
     if(separation<.9)physicallyNearFrames++;
     expect(separation).toBeGreaterThan(.61);
    }
    for(let j=i+1;j<bots.length;j++){
     const other=bots[j]!;
     if(Math.abs(bot.position.y-other.position.y)>=1)continue;
     const gap=Math.hypot(bot.position.x-other.position.x,
      bot.position.z-other.position.z);
     minCpuCpu=Math.min(minCpuCpu,gap);
     expect(gap).toBeGreaterThan(.57);
    }
   }
   cpu.drainFireRequests(()=>{throw Error('W7_PRECOMBAT_SOURCE_QA');});
   cpu.drainKitRequests(()=>false);
   successfulFrames++;
  }
  positiveCpuGoalsMoved=moving.filter(b=>cpuTravel.get(b.id)!>.05).length;
  const ledger={
   source:'REAL_60HZ_HUMAN_RAPIER_PLUS_SEVEN_NATIVE_CPU',
   phases:phases.map(p=>({
    name:p.name,inputFrames:45,nearGoal:phaseReached.get(p.name),
    truePlayerTravelMeters:perPhaseMeters.get(p.name),
    acceptedCpuTravelMeters:perPhaseCpuMotion.get(p.name)
   })),
   realFrames:successfulFrames,plannedFrames:270,
   changedHeadingCount,totalPlayerTravelMeters:totalPlayerTravel,
   playerAirTicks,unsupportedFloorTicks,
   closestPlayerCpuMeters:minPlayerCpu,closestCpuCpuMeters:minCpuCpu,
   physicallyNearFrameSamples:physicallyNearFrames,
   commandedNativeCpuIds:moving.map(b=>b.id),
   nativeCpuGoal:[slotTarget.x,slotTarget.y,slotTarget.z],
   originalCpuFeet:[...initialFeet].map(([id,p])=>({id,foot:[p.x,p.y,p.z]})),
   perCpuAcceptedSteps:[...cpuSteps],
   perCpuTraveledMeters:[...cpuTravel],
   positiveGoalCpuTravelCount:positiveCpuGoalsMoved,
   acceptedCpuSteps,maxCpuFrameStepMeters:maxCpuStep,
   liveCpuColliders:shared.cpuColliderCount,
   firstUnsafe,firstUnsafeFrame,
   sourceSolids:stage.solids.length,sourcePaint:stage.paintSurfaces.length,
   sourceNavLinks:stage.navigationLinks?.length,
   sourceGeometryChanged:false,physicalActorTeleports:0,
   productionAuthorized:false,unrestricted4v4Certified:false,
   fullCombatCertified:false
  };
  console.log('T21_W7_MULTI_CPU_DIRECTIONAL_KCC',JSON.stringify(ledger));
  expect(firstUnsafe).toBeNull();
  expect(successfulFrames).toBe(270);
  expect(totalPlayerTravel).toBeGreaterThan(2.0);
  // Ensure the six phases actually exercised route reversals and close
  // same-floor encounters; merely stepping 270 ticks is not sufficient.
  expect(changedHeadingCount).toBeGreaterThanOrEqual(2);
  expect([...phaseReached.values()].every(Boolean)).toBe(true);
  expect(physicallyNearFrames).toBeGreaterThan(30);
  expect(minPlayerCpu).toBeLessThan(.95);
  expect(minPlayerCpu).toBeGreaterThan(.61);
  expect(minCpuCpu).toBeGreaterThan(.57);
  expect(playerAirTicks).toBe(0);
  expect(unsupportedFloorTicks).toBe(0);
  expect(acceptedCpuSteps).toBeGreaterThan(10);
  expect(positiveCpuGoalsMoved).toBe(2);
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
