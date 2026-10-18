import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {beforeAll,afterEach,describe,expect,it,vi} from 'vitest';
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
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';
import {undertowTemple01ModelXZToProjectXZ}
 from './UndertowSpillwayModelXZGeometry';
import {UndertowF3NativeHumanCrowd} from '../../app/UndertowF3NativeHumanCrowd';

const DT=1/60;
type Bot={id:string;team:Team.A|Team.B;position:Vec3;agent:CrowdAgent|null;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;mobilityState:string};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('W5 actual moving HUMAN + seven native CPUs + shared Rapier world',()=>{
 it('keeps original landing walking and original-spawn CPU physical authority separate for one bounded 60Hz window',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const original=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const nav=new RecastStageNavigation(original,stats);
  const physics=new RapierStagePhysics(DT,original);
  physics.step();
  const spawns=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
  const qa=withProvisionalT21QaSpawnMetadata(original,spawns);
  expect(spawns.releaseAuthorized).toBe(false);
  expect(qa.solids).toBe(frozen.solids);
  expect(qa.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(qa.navigationLinks).toBe(frozen.navigationLinks);
  expect(frozen.solids.length).toBe(25);
  expect(frozen.paintSurfaces.length).toBe(17);
  expect(frozen.navigationLinks.length).toBe(26);

  const [sx,sz]=undertowTemple01ModelXZToProjectXZ([-22.5,43]);
  const [ex,ez]=undertowTemple01ModelXZToProjectXZ([-22.5,45]);
  const forwardVector=new Vec3(ex-sx,0,ez-sz).normalize();
  const landingId='UndertowT21D:first-drop-landing-positive-z';
  const realFloor=(x:number,z:number)=>{
   const hit=physics.castStageSegment(
    new Vec3(x,3.8,z),new Vec3(x,2.2,z),'ink-projectile');
   return hit?.solidId??null;
  };
  for(let i=0;i<=8;i++){
   const t=i/8;
   expect(realFloor(sx+(ex-sx)*t,sz+(ez-sz)*t))
    .toBe(landingId);
  }

  let axis=0;
  const input={get moveX(){return 0;},get moveY(){return axis;},
   get squidHeld(){return false;},get jumpHeld(){return false;},
   consumeJump(){return false;}} as PlayerInput;
  const camera=({getFlatForward:(out:Vec3)=>out.copy(forwardVector)}) as ThirdPersonCamera;
  const app={root:new Entity('W5_SOURCE_ONLY_EIGHT_ACTOR_QA')} as never;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  player.teleport(new Vec3(sx,3+
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,sz));
  for(let i=0;i<75;i++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  expect(stats.playerGrounded).toBe(true);
  const handoff=new UndertowPhase14ECpuHandoff(qa,true);
  const shared=new UndertowPhase14QSharedActorCollision(physics,qa,true);
  const humanCrowd=new UndertowF3NativeHumanCrowd(nav,qa);
  const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
   stats,qa,Team.A,handoff,shared,humanCrowd,true);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  const originalFeet=new Map(bots.map(b=>[b.id,b.position.clone()]));
  // All seven are real native Crowd actors. Only one is deliberately given
  // a nearby source-supported movement goal; other original agents remain
  // present as real collision neighbours, not removed or repositioned.
  for(const bot of bots){
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
   bot.agent?.resetMoveTarget();
  }
  let chosenBot:Bot|null=null,chosenGoal:Vec3|null=null;
  for(const bot of bots){
   if(chosenBot)break;
   const side=bot.team===Team.A?'positive-z':'negative-z';
   const sourceId='UndertowT21D:spawn-high-'+side;
   for(const [dx,dz] of [[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]]){
    const desired=new Vec3(bot.position.x+dx,bot.position.y,
     bot.position.z+dz);
    const target=nav.closestPoint(desired);
    if(Math.hypot(target.x-desired.x,target.y-desired.y,
        target.z-desired.z)>.12)continue;
    const audit=nav.auditPath(bot.position,target);
    if(!audit.reachedTarget||audit.startSnapDistanceMeters>.15||
       audit.endSnapDistanceMeters>.15)continue;
    const groundedSamples=[.25,.5,.75,1].every(f=>{
     const x=bot.position.x+(target.x-bot.position.x)*f;
     const z=bot.position.z+(target.z-bot.position.z)*f;
     const hit=physics.castStageSegment(
      new Vec3(x,bot.position.y+.7,z),
      new Vec3(x,bot.position.y-.7,z),'ink-projectile');
     return hit?.solidId===sourceId;
    });
    if(!groundedSamples)continue;
    const clearOfOthers=bots.every(other=>other===bot||
     Math.hypot(other.position.x-target.x,
      other.position.z-target.z)>1.0||
     Math.abs(other.position.y-target.y)>1);
    if(!clearOfOthers)continue;
    chosenBot=bot;chosenGoal=target;break;
   }
  }
  expect(chosenBot,'A real original-surface CPU goal must exist').not.toBeNull();
  chosenBot!.agent!.requestMoveTarget(chosenGoal!);

  let playerTravel=0,unsupported=0,airborne=0;
  let maxCpuStep=0,acceptedCpuSteps=0,maxCpuTravel=0;
  let firstUnsafe:string|null=null,firstUnsafeFrame=-1,successTicks=0;
  let priorHuman=player.getPosition().clone();
  const cpuLast=new Map(bots.map(b=>[b.id,b.position.clone()]));
  axis=1;
  for(let frame=1;frame<=28;frame++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const p=player.getPosition().clone();
   playerTravel+=Math.hypot(p.x-priorHuman.x,p.z-priorHuman.z);
   priorHuman=p;
   if(!stats.playerGrounded)airborne++;
   if(realFloor(p.x,p.z)!==landingId)unsupported++;
   // No synthetic player path or CPU pose overrides: this is the real
   // F3 movement sequence (Player -> physics -> 7 CPU Crowd + shared KCC).
   try{
    cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),true);
   }catch(error){
    firstUnsafe=String(error);firstUnsafeFrame=frame;
    break; // real safety-veto remains authoritative
   }
   expect(shared.cpuColliderCount).toBe(7);
   expect(shared.approxActorOverlapIds()).toEqual([]);
   for(const b of bots){
    const previous=cpuLast.get(b.id)!;
    const d=b.position.distance(previous);
    maxCpuStep=Math.max(maxCpuStep,d);
    if(d>.0001)acceptedCpuSteps++;
    maxCpuTravel=Math.max(maxCpuTravel,
     b.position.distance(originalFeet.get(b.id)!));
    previous.copy(b.position);
    expect(d).toBeLessThanOrEqual(
     GAME_CONFIG.cpu.maxSpeedMetersPerSecond*DT+.0001);
   }
   cpu.drainFireRequests(()=>{throw Error('W5_NO_UNPROVEN_SHOTS');});
   cpu.drainKitRequests(()=>false);
   successTicks++;
  }
  const audit={
   source:'REAL_PLAYER_CONTROLLER_RAPIER_PLUS_SEVEN_CPU_CROWD',
   chosenCpu:chosenBot!.id,
   chosenGoal:[chosenGoal!.x,chosenGoal!.y,chosenGoal!.z],
   playerTravelMeters:playerTravel,
   playerGroundedFrames:successTicks-airborne,
   playerAirborneFrames:airborne,
   playerUnsupportedFloorFrames:unsupported,
   totalCpuAgents:bots.length,realCpuSharedColliders:shared.cpuColliderCount,
   maximumAcceptedCpuStepMeters:maxCpuStep,
   acceptedCpuSteps,maximumCpuNetTravelMeters:maxCpuTravel,
   completedFrames:successTicks,firstUnsafeFrame,firstUnsafe,
   fakeCpuPoseOffsets:0,productionAuthorized:false,
   full4v4MovementCertified:false,
   allSevenRejoinedCertified:false,
   sourceGeometryModified:false,scoreablePaintPromotions:0
  };
  console.log('T21_W5_MOVING_HUMAN_SEVEN_CPU_SHARED_QA',JSON.stringify(audit));
  expect(firstUnsafe).toBeNull();
  expect(successTicks).toBe(28);
  expect(playerTravel).toBeGreaterThan(1.5);
  expect(playerTravel).toBeLessThan(2.18);
  expect(airborne).toBe(0);
  expect(unsupported).toBe(0);
  expect(acceptedCpuSteps).toBeGreaterThan(0);
  expect(shared.cpuColliderCount).toBe(7);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(shared.cpuColliderCount).toBe(0);
  humanCrowd.dispose();
  shared.dispose();
  expect(handoff.activeCount).toBe(0);
 });
});
