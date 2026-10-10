import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem,type CpuFireRequest} from '../../ai/CpuAgentSystem';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {PlayerResources} from '../../combat/PlayerResources';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {SurfaceFlags,Team} from '../../ink/types';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {PlayerController} from '../../player/PlayerController';
import {ProjectileSystem} from '../../projectile/ProjectileSystem';
import {defineTestSurfaces,PRODUCTION_STAGE_DEFINITION} from '../TestStage';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import type {PaintRequest} from '../../ink/PaintCoordinator';

const DT=1/60;
const stage=undertowT21dConnectivityQaStage();
type Bot={
 id:string;agent:CrowdAgent|null;position:Vec3;previousPosition:Vec3;
 entity:Entity;thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;
};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('T21 Phase14N genuine CPU shooter -> real projectile -> original Rapier player HP',()=>{
 it('makes B1 decide and fire itself at an actual source-landed PlayerController; no authored shot injected',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stats=new PerformanceStats();
  const physics=new RapierStagePhysics(DT,stage);
  physics.step();
  const ink=new GameplayInkSystem();
  const surfaces=defineTestSurfaces(ink,stage);
  const app={root:new Entity('T21_PHASE14N_REAL_CPU_TO_REAL_PLAYER')} as never;
  const input={moveX:0,moveY:0,squidHeld:false,jumpHeld:false,
    consumeJump:()=>false} as PlayerInput;
  const camera={getFlatForward:(v:Vec3)=>v.set(0,0,1)} as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
  const surfaceSolid=stage.solids.find(s=>
    s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const supported=nearestT21SourceSupportedLanding(surfaceSolid,{
    x:link.start[0],y:link.start[1],z:link.start[2]
  });
  player.teleport(new Vec3(supported.x,
    supported.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    supported.z));
  for(let frame=0;frame<75;frame++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  const body=player.getPosition();
  expect(Math.abs(body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-supported.y))
    .toBeLessThan(.13);
  const directions=[new Vec3(1,0,0),new Vec3(-1,0,0),
    new Vec3(0,0,1),new Vec3(0,0,-1),
    new Vec3(.707,0,.707),new Vec3(-.707,0,.707),
    new Vec3(.707,0,-.707),new Vec3(-.707,0,-.707)];
  const supportedShooter=directions.map(v=>{
    const at=new Vec3(body.x+v.x*1.35,supported.y,body.z+v.z*1.35);
    const muzzle=new Vec3(at.x,body.y,at.z);
    const paint=ink.sampleWorld(new Vec3(at.x,supported.y+.06,at.z),
      .34,SurfaceFlags.Paintable);
    const blocker=physics.castStageSegment(muzzle,body,'ink-projectile');
    return {at,muzzle,paint,blocker};
  }).find(x=>x.paint&&!x.blocker);
  expect(supportedShooter).toBeDefined();
  const navigation=new RecastStageNavigation(stage,stats);
  const adapter=new UndertowPhase14ECpuHandoff(stage,true);
  const paintRequests:PaintRequest[]=[];
  const cpu=new CpuAgentSystem(app,navigation,ink,
    {enqueue:(r:PaintRequest)=>paintRequests.push(r)} as never,
    stats,stage,Team.A,adapter);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  const shooter=bots.find(b=>b.id==='B1')!;
  expect(shooter).toBeDefined();
  for(const b of bots){
    b.thinkRemaining=900;b.paintRemaining=900;
    b.jumpCooldownSeconds=900;b.fireRemaining=900;
  }
  navigation.removeAgent(shooter.agent!);
  shooter.agent=navigation.addAgent(supportedShooter!.at);
  const agentPos=shooter.agent.position();
  shooter.position.set(agentPos.x,agentPos.y,agentPos.z);
  shooter.previousPosition.copy(shooter.position);
  shooter.entity.setPosition(shooter.position.x,shooter.position.y+.68,
    shooter.position.z);
  shooter.fireRemaining=0;

  const resources=new PlayerResources(stats);
  const targets=new CombatTargetSystem(app,stats);
  const feedback={updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
    stringerFuse:vi.fn(),stringerBurst:vi.fn(),melee:vi.fn(),beam:vi.fn()};
  const projectile=new ProjectileSystem(app,surfaces,physics,
    {enqueue:(r:PaintRequest)=>paintRequests.push(r)} as never,
    resources,targets,cpu,feedback as never,stats);
  const requests:CpuFireRequest[]=[];
  const startingHp=resources.currentHp;
  let ticks=0;
  for(;ticks<50&&resources.currentHp===startingHp;ticks++){
    cpu.fixedUpdate(DT,true,Team.A,body,true);
    cpu.drainFireRequests(request=>{
      if(request.sourceId!=='B1')return;
      requests.push(request);
      projectile.queueCpuShot(request);
    });
    cpu.drainKitRequests(()=>false);
    projectile.fixedUpdate(DT,false,false,body,new Vec3(0,0,1),
      Team.A,body,false,true);
  }
  expect(requests.length).toBeGreaterThanOrEqual(1);
  expect(requests.every(x=>x.sourceId==='B1')).toBe(true);
  expect(requests.every(x=>x.weaponId==='pulse-sprayer')).toBe(true);
  expect(requests.every(x=>x.action==='PROJECTILE')).toBe(true);
  expect(resources.currentHp).toBeLessThan(startingHp);
  expect(stats.cpuPlayerHits).toBeGreaterThanOrEqual(1);
  expect(stats.projectileImpacts).toBeGreaterThanOrEqual(1);
  expect(feedback.shot).toHaveBeenCalled();
  expect(paintRequests.every(r=>
    stage.paintSurfaces.some(s=>s.id===r.surfaceId))).toBe(true);
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  console.log('T21_PHASE14N_REAL_CPU_TO_REAL_PLAYER_END_TO_END_PASS',JSON.stringify({
    shooter:'ACTUAL_CPU_AGENT_B1',weaponId:requests[0]?.weaponId,
    actualCpuIssuedShots:requests.length,
    originalT21SourceMuzzle:[requests[0]!.origin.x,requests[0]!.origin.y,
      requests[0]!.origin.z],
    originalT21SourcePlayerPhysicsFootY:
      body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
    blockerFreeSourceSegment:true,physics:'ACTUAL_RAPIER_HUMAN_KCC',
    projectile:'ACTUAL_60HZ_PROJECTILE_SYSTEM',
    realDamageApplied:true,hpBefore:startingHp,hpAfter:resources.currentHp,
    confirmedCpuPlayerHits:stats.cpuPlayerHits,
    projectileImpacts:stats.projectileImpacts,simulatedTicks:ticks,
    sourceScoreableArea:0,gamepadOrHumanInputUsed:false,
    4v4ProductionCertified:false,activationAuthorized:false
  }));
  cpu.reset(Team.A);
  expect(adapter.activeCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
});
