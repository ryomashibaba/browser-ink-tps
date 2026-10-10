import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem,type CpuFireRequest} from '../../ai/CpuAgentSystem';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PlayerResources} from '../../combat/PlayerResources';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {ProjectileSystem} from '../../projectile/ProjectileSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team,SurfaceFlags} from '../../ink/types';
import type {PaintRequest} from '../../ink/PaintCoordinator';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {defineTestSurfaces} from '../TestStage';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';

const DT=1/60;
type Bot={
 id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;previousPosition:Vec3;entity:Entity;
 mobilityState:string;thinkRemaining:number;paintRemaining:number;
 fireRemaining:number;jumpCooldownSeconds:number;
};
type QaCpu=Omit<CpuAgentSystem,'bots'>&{bots:Bot[]};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('T21 Phase14O seven real CPUs and one real Rapier PlayerController in a single 60Hz QA schedule',()=>{
 it('keeps seven genuine original-link CPU falls and real human physics progressing together, then applies a CPU-authored projectile',()=>{
  // Only the headless PlayCanvas Render components are mocked; gameplay
  // Recast, HUMAN PlayerController, Rapier and weapon/projectile are real.
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stage=undertowT21dConnectivityQaStage();
  const root=new Entity('T21_PHASE14O_7CPU_1PHYSICAL_PLAYER');
  const app={root} as never;
  const stats=new PerformanceStats();
  const ink=new GameplayInkSystem();
  const surfaces=defineTestSurfaces(ink,stage);
  const events:PaintRequest[]=[];
  const coordinator={enqueue:(event:PaintRequest)=>events.push(event)};
  const nav=new RecastStageNavigation(stage,stats);
  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const cpu=new CpuAgentSystem(app,nav,ink,coordinator as never,stats,
    stage,Team.A,handoff) as QaCpu;
  const bots=cpu.bots;
  expect(bots.map(b=>b.id)).toEqual(['A1','A2','A3','B1','B2','B3','B4']);

  const physics=new RapierStagePhysics(DT,stage);
  physics.step();
  let inputZ=0;
  const input={
    get moveX(){return 0;},get moveY(){return inputZ;},
    get squidHeld(){return false;},get jumpHeld(){return false;},
    consumeJump(){return false;}
  } as PlayerInput;
  const camera={getFlatForward:(v:Vec3)=>v.set(0,0,1)}
    as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const originalLink=stage.navigationLinks!.find(x=>
    x.id==='first-drop-negative-z-3')!;
  const originalFloor=stage.solids.find(x=>
    x.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const supported=nearestT21SourceSupportedLanding(originalFloor,{
    x:originalLink.start[0],y:originalLink.start[1],z:originalLink.start[2]
  });
  player.teleport(new Vec3(supported.x,
    supported.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    supported.z));

  const resources=new PlayerResources(stats);
  const feedback={updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
    stringerFuse:vi.fn(),stringerBurst:vi.fn(),melee:vi.fn(),beam:vi.fn()};
  const projectile=new ProjectileSystem(app,surfaces,physics,
    coordinator as never,resources,
    new CombatTargetSystem(app,stats),cpu,feedback as never,stats);

  // ORIGINAL two independently verified first-drop paths. Never inject
  // phase14 adapter.observe, synthesize a bridge or telepose post-landing.
  for(const b of bots){
    const side=b.team===Team.A?'positive-z':'negative-z';
    const route=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>
      p.id==='first-drop-'+side)!;
    expect(route.expectation).toBe('MUST_REACH');
    expect(nav.auditPath(new Vec3(...route.from),
      new Vec3(...route.to)).reachedTarget).toBe(true);
    if(b.agent)nav.removeAgent(b.agent);
    b.agent=nav.addAgent(new Vec3(...route.from));
    const p=b.agent.position();
    b.position.set(p.x,p.y,p.z);
    b.previousPosition.copy(b.position);
    b.entity.setPosition(p.x,p.y+.68,p.z);
    b.agent.requestMoveTarget(nav.closestPoint(new Vec3(...route.to)));
    b.thinkRemaining=900;b.paintRemaining=900;
    b.fireRemaining=900;b.jumpCooldownSeconds=900;
  }
  const dropFrames=new Map<string,number>();
  const recovered=new Map<string,number>();
  const rawDrops=new Map<string,number>();
  const originalObserve=handoff.observe.bind(handoff);
  vi.spyOn(handoff,'observe').mockImplementation((id,from,to,dt)=>{
    const didStart=originalObserve(id,from,to,dt);
    if(didStart){
      const motion=auditPhase14CrowdFrame(from,to,dt);
      expect(motion.suspectedInstantTransition).toBe(true);
      rawDrops.set(id,motion.travelledMeters);
    }
    return didStart;
  });
  let humanGroundTicks=0;
  let humanMoved=0;
  let maxHumanStep=0;
  let maxCpuStep=0;
  let peakDropBodies=0;
  let completedFrame=-1;
  for(let frame=1;frame<=780;frame++){
    const before=player.getPosition();
    inputZ=frame>=100&&frame<118?.10:0;
    player.computeFixed(DT);
    physics.step();
    player.syncAfterPhysics(DT);
    const human=player.getPosition();
    const step=before.distance(human);
    maxHumanStep=Math.max(maxHumanStep,step);
    humanMoved+=step;
    if(stats.playerGrounded)humanGroundTicks++;
    const last=bots.map(b=>b.position.clone());
    const states=bots.map(b=>b.mobilityState);
    cpu.fixedUpdate(DT,true,Team.A,human,false);
    cpu.render(.5);
    peakDropBodies=Math.max(peakDropBodies,handoff.activeCount);
    for(let i=0;i<bots.length;i++){
      const b=bots[i]!,old=states[i]!;
      const travel=b.position.distance(last[i]!);
      maxCpuStep=Math.max(maxCpuStep,travel);
      expect(travel).toBeLessThan(.6);
      if(old==='GROUND'&&b.mobilityState==='FIRST_DROP_FALL'){
        expect(b.agent).toBeNull();
        dropFrames.set(b.id,frame);
      }
      if(old==='FIRST_DROP_REJOIN'&&b.mobilityState==='GROUND')
        recovered.set(b.id,frame);
      expect([b.position.x,b.position.y,b.position.z].every(Number.isFinite))
        .toBe(true);
    }
    cpu.drainFireRequests(r=>{throw Error('PRE_LANDING_UNEXPECTED_CPU_FIRE_'+r.sourceId);});
    cpu.drainKitRequests(()=>false);
    projectile.fixedUpdate(DT,false,false,human,new Vec3(0,0,1),
      Team.A,human,false,false);
    expect(resources.currentHp).toBe(100);
    if(recovered.size===7){completedFrame=frame;break;}
  }
  expect(completedFrame).toBeGreaterThan(0);
  expect(dropFrames.size).toBe(7);
  expect(rawDrops.size).toBe(7);
  expect(humanGroundTicks).toBeGreaterThan(100);
  expect(maxHumanStep).toBeLessThan(.6);
  expect(humanMoved).toBeGreaterThan(.01);
  const human=player.getPosition();
  const physicalFootY=human.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  expect(Math.abs(physicalFootY-supported.y)).toBeLessThan(.13);
  expect(player.currentMode).toBe('HUMAN');
  expect(stats.playerCollider).toBe('CAPSULE');
  expect(ink.getSurfaces()).toHaveLength(17);
  expect(ink.getSurfaces().every(s=>(s.baseFlags&SurfaceFlags.Scoreable)===0)).toBe(true);
  expect(events.length).toBe(0);

  // Live CPU B1 position is the result of original-source Recast + Rapier
  // fall + collision-gated Crowd rejoin. Do not relocate this shooter.
  const b1=bots.find(b=>b.id==='B1')!;
  const b1Grounded=b1.position.clone();
  const lineOfSight=physics.castStageSegment(
    new Vec3(b1Grounded.x,b1Grounded.y+.76,b1Grounded.z),
    human,'ink-projectile'
  );
  const blockedBy=lineOfSight?.solidId??null;
  for(const b of bots){
    expect(b.agent).not.toBeNull();
    expect(b.mobilityState).toBe('GROUND');
    b.thinkRemaining=900;b.paintRemaining=900;
    b.fireRemaining=900;b.jumpCooldownSeconds=900;
    b.agent!.resetMoveTarget();
  }
  b1.fireRemaining=0;
  const cpuShots:CpuFireRequest[]=[];
  let combatFrames=0;
  const startHp=resources.currentHp;
  for(;combatFrames<75&&resources.currentHp>=startHp;combatFrames++){
    player.computeFixed(DT);
    physics.step();
    player.syncAfterPhysics(DT);
    const humanPosition=player.getPosition();
    cpu.fixedUpdate(DT,true,Team.A,humanPosition,true);
    cpu.drainFireRequests(r=>{
      cpuShots.push(r);
      projectile.queueCpuShot(r);
    });
    cpu.drainKitRequests(()=>false);
    projectile.fixedUpdate(DT,false,false,humanPosition,
      new Vec3(0,0,1),Team.A,humanPosition,false,true);
  }
  const evidence={
    phase:'14O',source:'IMMUTABLE_T21D_25_SOLIDS_17_PAINT_26_LINKS',
    sevenCpuFirstDrops:[...dropFrames],
    sevenCpuRejoins:[...recovered],
    originalOffmeshRawSteps:[...rawDrops],
    peakDropBodies,completedFrame,playerRealGroundTicks:humanGroundTicks,
    playerOriginalSourceSolid:originalFloor.id,playerFootY:physicalFootY,
    playerOriginalFootY:supported.y,
    maxHumanStep,maxCpuStep,humanTotalTravel:humanMoved,
    b1OriginalGround:[b1Grounded.x,b1Grounded.y,b1Grounded.z],
    sourceProjectileBlocker:blockedBy,
    combatFrames,cpuShots:cpuShots.map(r=>({id:r.sourceId,weaponId:r.weaponId})),
    hpBefore:startHp,hpAfter:resources.currentHp,
    actualCpuPlayerHits:stats.cpuPlayerHits,
    actualProjectileImpacts:stats.projectileImpacts,
    realCpuAndPlayerShareTickScheduler:true,
    realHumanInput:false,
    sharedDynamicCpuPlayerPhysicalColliderWorld:false,
    fullFourVsFourProductionCertified:false,
    cameraGpuVisualCertified:false,
    sourceGeometryModified:false,
    sourceScoreabilityModified:false,
    t21ProductionActivation:false
  };
  console.log('T21_PHASE14O_REAL_SEVEN_CPU_AND_PLAYER_COMBAT_EVIDENCE',
    JSON.stringify(evidence));
  expect(cpuShots.some(r=>r.sourceId==='B1')).toBe(true);
  expect(cpuShots.every(r=>r.sourceId==='B1')).toBe(true);
  expect(blockedBy).toBeNull();
  expect(resources.currentHp).toBeLessThan(startHp);
  expect(stats.cpuPlayerHits).toBeGreaterThan(0);
  expect(stats.projectileImpacts).toBeGreaterThan(0);
  expect(events.every(e=>stage.paintSurfaces.some(s=>s.id===e.surfaceId)))
    .toBe(true);
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  cpu.reset(Team.A);
  expect(handoff.activeCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
});
