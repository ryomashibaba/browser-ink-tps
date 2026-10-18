import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {CpuAgentSystem,type CpuFireRequest} from '../../ai/CpuAgentSystem';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {PlayerResources} from '../../combat/PlayerResources';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {SurfaceFlags,Team} from '../../ink/types';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {PlayerController} from '../../player/PlayerController';
import {ProjectileSystem} from '../../projectile/ProjectileSystem';
import {defineTestSurfaces} from '../TestStage';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import type {PaintRequest} from '../../ink/PaintCoordinator';

const DT=1/60;
const MAX_FRAMES=1000;
type Bot={
 id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;previousPosition:Vec3;entity:Entity;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;lifeState:'ACTIVE'|'SPLATTED';
};
beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
afterEach(()=>vi.restoreAllMocks());

describe('W10-B12: continuous actual source-grounded CPU->Human splat & respawn',()=>{
 it('real CPU aims/shoots, real projectile splats physical Human, respawns and damages again',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const physics=new RapierStagePhysics(DT,stage);physics.step();
  const surfaces=defineTestSurfaces(ink,stage);
  const root=new Entity('W10_B12_REAL_SOURCE_LOCAL_COMBAT');
  const app={root} as never;
  const input={
   moveX:0,moveY:0,squidHeld:false,jumpHeld:false,
   consumeJump:()=>false
  } as PlayerInput;
  const camera={
   getFlatForward:(out:Vec3)=>out.set(0,0,1)
  } as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const srcLink=stage.navigationLinks!.find(l=>
   l.id==='first-drop-negative-z-3')!;
  const originalSolid=stage.solids.find(s=>
   s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const support=nearestT21SourceSupportedLanding(originalSolid,{
   x:srcLink.start[0],y:srcLink.start[1],z:srcLink.start[2]
  });
  const originalRespawnPosition=new Vec3(
   support.x,support.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
   support.z
  );
  player.teleport(originalRespawnPosition);
  const playerTick=()=>{
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  };
  for(let i=0;i<75;i++)playerTick();
  const target=player.getPosition();
  expect(stats.playerGrounded).toBe(true);
  expect(Math.abs(target.y-
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-support.y))
   .toBeLessThan(.13);
  // Test-only close-combat setup within ORIGINAL source floor. Neither
  // original map traversal nor competitive spawn locations are claimed.
  const directions=[
   new Vec3(1,0,0),new Vec3(-1,0,0),
   new Vec3(0,0,1),new Vec3(0,0,-1),
   new Vec3(.707,0,.707),new Vec3(-.707,0,.707),
   new Vec3(.707,0,-.707),new Vec3(-.707,0,-.707)
  ];
  const candidate=directions.map(unit=>{
   const point=new Vec3(target.x+unit.x*1.35,support.y,
    target.z+unit.z*1.35);
   const origin=new Vec3(point.x,target.y,point.z);
   const ground=ink.sampleWorld(
    new Vec3(point.x,support.y+.06,point.z),.34,SurfaceFlags.Paintable);
   const blocker=physics.castStageSegment(origin,target,'ink-projectile');
   return {point,origin,ground,blocker};
  }).find(x=>x.ground&&!x.blocker);
  expect(candidate,'actual nearby original-source firing footing')
   .toBeDefined();

  const navigation=new RecastStageNavigation(stage,stats);
  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const paint:PaintRequest[]=[];
  const coordinator={
   enqueue:(r:PaintRequest)=>paint.push(r)
  };
  const cpu=new CpuAgentSystem(app,navigation,ink,
   coordinator as never,stats,stage,Team.A,handoff);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots.map(b=>b.id)).toEqual([
   'A1','A2','A3','B1','B2','B3','B4'
  ]);
  const shooter=bots.find(b=>b.id==='B1')!;
  expect(shooter.team).toBe(Team.B);
  // This B1 local position is explicitly QA-scoped and NOT a source actor.
  // Real CPU AgentSystem still owns aiming, cooldown, shot and collision.
  for(const bot of bots){
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  navigation.removeAgent(shooter.agent!);
  shooter.agent=navigation.addAgent(candidate!.point);
  const start=shooter.agent.position();
  shooter.position.set(start.x,start.y,start.z);
  shooter.previousPosition.copy(shooter.position);
  shooter.entity.setPosition(start.x,start.y+.68,start.z);
  shooter.fireRemaining=0;

  const resources=new PlayerResources(stats);
  const feedback={
   updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
   stringerFuse:vi.fn(),stringerBurst:vi.fn(),
   melee:vi.fn(),beam:vi.fn()
  };
  const projectile=new ProjectileSystem(app,surfaces,physics,
   coordinator as never,resources,
   new CombatTargetSystem(app,stats),cpu,feedback as never,stats);
  const actualCpuShotRecords:CpuFireRequest[]=[];
  let actualIssued=0;
  let firstSplatFrame=-1,firstRespawnFrame=-1;
  let hpAfterRespawn=100,secondDamageFrame=-1;
  let deadFrames=0,deathEvents=0,respawnEvents=0;
  let hitsAtFirstSplat=0;
  let maxPhysicalPositionError=0,unauthorizedShots=0;
  let originalBlockedShots=0;
  for(let frame=1;frame<=MAX_FRAMES;frame++){
   const alive=resources.currentHp>0;
   if(alive)player.computeFixed(DT);
   physics.step();
   player.syncAfterPhysics(DT);
   const body=player.getPosition();
   if(alive){
    maxPhysicalPositionError=Math.max(maxPhysicalPositionError,
     Math.abs(body.y-
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-support.y));
   }
   cpu.fixedUpdate(DT,true,Team.A,body,alive);
   cpu.drainFireRequests(req=>{
    if(req.sourceId!=='B1'){
     unauthorizedShots++;
     return;
    }
    actualIssued++;
    actualCpuShotRecords.push(req);
    projectile.queueCpuShot(req);
   });
   cpu.drainKitRequests(()=>false);
   projectile.fixedUpdate(
    DT,false,false,body,new Vec3(0,0,1),
    Team.A,body,false,alive
   );
   if(resources.currentHp<=0){
    if(firstSplatFrame<0){
     firstSplatFrame=frame;
     deathEvents++;
     hitsAtFirstSplat=stats.cpuPlayerHits;
     player.setLifecycleActive(false);
    }
    deadFrames++;
    // Actual F3 gameplay convention: wait 150 fixed frames, reset real
    // resources and teleport to the same VERIFIED local source-floor point.
    // This is an isolated local QA respawn anchor, NOT a valid match spawn.
    if(deadFrames>=150){
     resources.reset();
     player.teleport(originalRespawnPosition);
     player.setLifecycleActive(true);
     firstRespawnFrame=frame;
     respawnEvents++;
     hpAfterRespawn=resources.currentHp;
     deadFrames=0;
     // The second test cycle measures genuine new CPU damage only.
    }
   }else if(firstRespawnFrame>=0&&
    resources.currentHp<hpAfterRespawn){
    secondDamageFrame=frame;
    break;
   }
   // Terminal native route is unresolved: never relocate actors across it.
   expect(shooter.position.z*Math.sign(support.z)).toBeGreaterThan(0);
   expect(physics.castStageSegment(
    new Vec3(body.x,body.y+.2,body.z),
    new Vec3(body.x,body.y-1.4,body.z),'ink-projectile'))
    .not.toBeNull();
  }
  const evidence={
   actualSevenCpuAgents:bots.length,realShooterId:shooter.id,
   realCpuIssuedProjectiles:actualIssued,
   authoredShotsInjected:0,unknownActorShots:unauthorizedShots,
   firstCpuShot:actualCpuShotRecords.length?{
    sourceId:actualCpuShotRecords[0]!.sourceId,
    weaponId:actualCpuShotRecords[0]!.weaponId,
    action:actualCpuShotRecords[0]!.action
   }:null,
   firstSplatFrame,firstRespawnFrame,secondDamageFrame,
   hpAfterRespawn,hpAfterSecondEngagement:resources.currentHp,
   deathEvents,respawnEvents,deadFrames,
   realProjectileHits:stats.cpuPlayerHits,
   cpuHitsBeforeFirstSplat:hitsAtFirstSplat,
   cpuHitsAfterRespawn:stats.cpuPlayerHits-hitsAtFirstSplat,
   realProjectileImpacts:stats.projectileImpacts,
   maxPhysicalPositionError,
   sourceLandingSolid:originalSolid.id,
   sourceFloorY:support.y,
   scoreablePaintArea:ink.snapshot().areaA+ink.snapshot().areaB,
   paintRequests:paint.length,
   sourceGeometryModified:false,sourceNavLinksModified:false,
   teamPositionOnOriginalMatchPathCertified:false,
   sameTeamBattleInterferenceFullyTested:false,
   originalStageConnectivityCertified:false,
   fourVsFourMatchCertified:false,productionAuthorized:false
  };
  console.log('T21_W10B12_REAL_CPU_HUMAN_COMBAT_LIFECYCLE',JSON.stringify(evidence));
  expect(unauthorizedShots).toBe(0);
  expect(actualIssued).toBeGreaterThan(3);
  expect(actualCpuShotRecords.length).toBeGreaterThan(0);
  expect(firstSplatFrame).toBeGreaterThan(0);
  expect(firstRespawnFrame).toBeGreaterThan(firstSplatFrame);
  expect(firstRespawnFrame-firstSplatFrame).toBe(149);
  expect(secondDamageFrame).toBeGreaterThan(firstRespawnFrame);
  expect(deathEvents).toBe(1);
  expect(respawnEvents).toBe(1);
  expect(hpAfterRespawn).toBe(100);
  expect(resources.currentHp).toBeLessThan(100);
  // Three real 34-HP hits splat the original 100-HP Human.
  // A fourth independent real hit lands after resources.reset().
  expect(hitsAtFirstSplat).toBeGreaterThanOrEqual(3);
  expect(stats.cpuPlayerHits-hitsAtFirstSplat).toBeGreaterThanOrEqual(1);
  expect(stats.cpuPlayerHits).toBeGreaterThanOrEqual(4);
  expect(stats.projectileImpacts).toBeGreaterThan(3);
  expect(maxPhysicalPositionError).toBeLessThan(.17);
  expect(feedback.shot).toHaveBeenCalled();
  expect(paint.every(r=>
   stage.paintSurfaces.some(x=>x.id===r.surfaceId))).toBe(true);
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(handoff.activeCount).toBe(0);
 });
});
