import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {PlayerResources} from '../../combat/PlayerResources';
import {GAME_CONFIG} from '../../config/game/gameConfig';
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
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';
import type {PaintRequest} from '../../ink/PaintCoordinator';

const DT=1/60;
type Bot={
 id:string;team:Team.A|Team.B;slot:number;
 agent:CrowdAgent|null;position:Vec3;previousPosition:Vec3;entity:Entity;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;lifeState:'ACTIVE'|'SPLATTED';
 hp:number;respawnRemainingSeconds:number;mobilityState:string;
};
beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
afterEach(()=>vi.restoreAllMocks());

describe('W10-B13: real Human weapon to genuine seven-CPU combat lifecycle',()=>{
 it('real 60Hz player projectiles splat B1, then native CPU respawns at a separately source-supported QA slot',()=>{
  // Mock visuals ONLY. Player KCC, Rapier, NavMesh, CPU lifecycle and
  // actual ProjectileSystem/player ink consumption remain unmocked.
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const original=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const physics=new RapierStagePhysics(DT,original);physics.step();
  const nav=new RecastStageNavigation(original,stats);
  const spawnPlan=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
  const stage=withProvisionalT21QaSpawnMetadata(original,spawnPlan);
  const app={root:new Entity('W10_B13_HUMAN_SHOOTER_CPU_RESPAWN')} as never;
  const paint:PaintRequest[]=[];
  const coordinator={enqueue:(r:PaintRequest)=>paint.push(r)};
  const surfaces=defineTestSurfaces(ink,stage);
  const player=new PlayerController(app,physics,{
   moveX:0,moveY:0,squidHeld:false,jumpHeld:false,consumeJump:()=>false
  } as PlayerInput,{
   getFlatForward:(v:Vec3)=>v.set(0,0,1)
  } as ThirdPersonCamera,ink,stats);
  player.setTeam(Team.A);
  const drop=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
  const solid=stage.solids.find(s=>
   s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const foot=nearestT21SourceSupportedLanding(solid,{
   x:drop.start[0],y:drop.start[1],z:drop.start[2]
  });
  player.teleport(new Vec3(foot.x,
   foot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,foot.z));
  for(let i=0;i<75;i++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  expect(stats.playerGrounded).toBe(true);
  const playerBody=player.getPosition();
  expect(Math.abs(playerBody.y-
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-foot.y))
   .toBeLessThan(.13);

  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const cpu=new CpuAgentSystem(app,nav,ink,coordinator as never,stats,
   stage,Team.A,handoff);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots.map(b=>b.id)).toEqual([
   'A1','A2','A3','B1','B2','B3','B4'
  ]);
  const target=bots.find(b=>b.id==='B1')!;
  expect(target.team).toBe(Team.B);
  expect(target.slot).toBe(0);
  const directions=[
   new Vec3(1,0,0),new Vec3(-1,0,0),
   new Vec3(0,0,1),new Vec3(0,0,-1),
   new Vec3(.707,0,.707),new Vec3(-.707,0,.707),
   new Vec3(.707,0,-.707),new Vec3(-.707,0,-.707)
  ];
  // QA-only source-supported short-range contact. Original spawns, CPU
  // patrol topology and authentic cross-team engagement are NOT certified.
  const setup=directions.map(dir=>{
   const dest=new Vec3(playerBody.x+dir.x*1.45,
    foot.y,playerBody.z+dir.z*1.45);
   const hit=physics.castStageSegment(
    new Vec3(playerBody.x,playerBody.y+.4,playerBody.z),
    new Vec3(dest.x,foot.y+.76,dest.z),'ink-projectile');
   const patch=ink.sampleWorld(
    new Vec3(dest.x,foot.y+.06,dest.z),.34,SurfaceFlags.Paintable);
   const snapped=nav.closestPoint(dest);
   return {dest,hit,patch,snapped,
    snapDistance:snapped.distance(dest)};
  }).find(x=>x.patch&&!x.hit&&x.snapDistance<.35);
  expect(setup,'original source-grounded opponent and free attack line')
   .toBeDefined();
  for(const bot of bots){
   bot.agent?.resetMoveTarget();
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  if(target.agent)nav.removeAgent(target.agent);
  target.agent=nav.addAgent(setup!.dest);
  const positioned=target.agent.position();
  target.position.set(positioned.x,positioned.y,positioned.z);
  target.previousPosition.copy(target.position);
  target.entity.setPosition(positioned.x,positioned.y+.68,positioned.z);
  expect(target.lifeState).toBe('ACTIVE');

  const resources=new PlayerResources(stats);
  const feedback={
   updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
   stringerFuse:vi.fn(),stringerBurst:vi.fn(),melee:vi.fn(),beam:vi.fn()
  };
  const projectile=new ProjectileSystem(app,surfaces,physics,
   coordinator as never,resources,new CombatTargetSystem(app,stats),
   cpu,feedback as never,stats);

  let firstActualHit=-1,firstSplat=-1,respawn=-1;
  let shotFrames=0,deadFrames=0,hitsAtSplat=0;
  let hpOnRespawn=-1;
  let maxPlayerFootError=0;
  let fireAfterSplat=0,offSourceOpponentFrames=0;
  let firstDamage=100;
  for(let frame=1;frame<=620;frame++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const body=player.getPosition();
   maxPlayerFootError=Math.max(maxPlayerFootError,Math.abs(
    body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-foot.y));
   cpu.fixedUpdate(DT,true,Team.A,body,false);
   // Each request must originate from actual CPU tactical weapon logic.
   // No opposing CPU fires during the isolated reverse-direction test.
   cpu.drainFireRequests(req=>{throw Error(
    'W10_B13_UNEXPECTED_CPU_SHOT_'+req.sourceId);});
   cpu.drainKitRequests(()=>false);
   const current=target.position;
   const aimTarget=new Vec3(current.x,current.y+.68,current.z);
   const forward=aimTarget.clone().sub(body).normalize();
   const muzzle=player.getMuzzlePosition(forward);
   const launch=projectile.solvePlayerLaunchDirection(muzzle,aimTarget);
   const fire=target.lifeState==='ACTIVE'&&firstSplat<0;
   if(fire)shotFrames++;
   else if(firstSplat>=0&&fire)fireAfterSplat++;
   const priorHp=target.hp;
   projectile.fixedUpdate(DT,fire,false,muzzle,launch,Team.A,body,
    true,true);
   if(target.hp<priorHp&&firstActualHit<0){
    firstActualHit=frame;
    firstDamage=priorHp-target.hp;
   }
   if(target.lifeState==='SPLATTED'){
    if(firstSplat<0){
     firstSplat=frame;
     hitsAtSplat=stats.cpuCombatHits;
     expect(target.agent).toBeNull();
     expect(target.entity.enabled).toBe(false);
    }
    deadFrames++;
    expect(cpu.findNearestCombatHit(muzzle,aimTarget,Team.A)).toBeNull();
   }else if(firstSplat>=0){
    respawn=frame;
    hpOnRespawn=target.hp;
    break;
   }
   if(firstSplat<0&&Math.abs(target.position.y-foot.y)>.26)
    offSourceOpponentFrames++;
  }
  const sourceSpawn=spawnPlan.teamBSlots[target.slot]!;
  const sourceSpawnId='UndertowT21D:spawn-high-negative-z';
  const respawnRay=physics.castStageSegment(
   new Vec3(sourceSpawn[0],sourceSpawn[1]+.70,sourceSpawn[2]),
   new Vec3(sourceSpawn[0],sourceSpawn[1]-.70,sourceSpawn[2]),
   'ink-projectile'
  );
  const evidence={
   cpuCount:bots.length,opponent:target.id,
   sourceLocalCombatPosition:setup!.dest.toArray(),
   originalSourceFloorId:solid.id,
   actualPlayerWeaponShots:stats.shotsFired,
   originalProjectileCpuHits:stats.cpuCombatHits,
   firstActualHit,firstDamage,firstSplat,respawn,
   cpuLifeStateAfterRespawn:target.lifeState,
   cpuHpAfterRespawn:hpOnRespawn,
   cpuSplats:stats.cpuSplats,cpuRespawns:stats.cpuRespawns,
   hitsAtSplat,deadFrames,shotFrames,fireAfterSplat,
   cpuSpawnSourceSolidId:respawnRay?.solidId??null,
   physicalRespawnSlotSource:sourceSpawn,
   actualRespawnPosition:target.position.toArray(),
   maxPlayerFootError,offSourceOpponentFrames,
   sourceScoreableArea:ink.snapshot().areaA+ink.snapshot().areaB,
   paintRequestCount:paint.length,
   originalActorSpawnCertified:false,
   gameplayCrossTeamPathCertified:false,
   importedActorLayoutsUsed:false,
   authoredCpuDamageInjected:0,authoredNavigationLinks:0,
   originalStageGeometryModified:false,
   full4v4MatchCertified:false,productionAuthorized:false
  };
  console.log('T21_W10B13_HUMAN_TO_CPU_SPLAT_RESPAWN',JSON.stringify(evidence));
  expect(firstActualHit).toBeGreaterThan(0);
  expect(firstDamage).toBeGreaterThan(0);
  expect(shotFrames).toBeGreaterThan(0);
  expect(stats.shotsFired).toBeGreaterThanOrEqual(3);
  expect(stats.cpuCombatHits).toBeGreaterThanOrEqual(3);
  expect(stats.cpuSplats).toBe(1);
  expect(firstSplat).toBeGreaterThan(firstActualHit);
  expect(respawn).toBeGreaterThan(firstSplat);
  expect(deadFrames).toBeGreaterThanOrEqual(148);
  expect(target.lifeState).toBe('ACTIVE');
  expect(hpOnRespawn).toBe(GAME_CONFIG.combat.playerMaxHp);
  expect(stats.cpuRespawns).toBe(1);
  expect(target.agent).not.toBeNull();
  expect(target.entity.enabled).toBe(true);
  expect(target.position.distance(new Vec3(...sourceSpawn))).toBeLessThan(.16);
  expect(respawnRay?.solidId).toBe(sourceSpawnId);
  expect(offSourceOpponentFrames).toBe(0);
  expect(fireAfterSplat).toBe(0);
  expect(maxPlayerFootError).toBeLessThan(.17);
  expect(resources.currentHp).toBe(100);
  expect(feedback.shot).toHaveBeenCalled();
  expect(paint.every(p=>original.paintSurfaces.some(
   s=>s.id===p.surfaceId))).toBe(true);
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(handoff.activeCount).toBe(0);
 });
});
