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
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';
import {UndertowPhase14QHumanCrowdAnchor}
 from './UndertowPhase14QHumanCrowdAnchor';

const DT=1/60;
type Bot={id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;previousPosition:Vec3;entity:Entity;mobilityState:string;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;lifeState:'ACTIVE'|'SPLATTED';
 respawnRemainingSeconds:number};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('T21 Phase14Q M4 REAL original-stage seven-CPU first fall veto',()=>{
 for(const b1Only of [false,true]){
 it(b1Only?
  'records real B1 native Recast offmesh entry overspeed on F2 without relaxing physical speed authority':
  'records shared source-spawn high-island A1 overlap at first frame without illicit spawn shifts',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const app={root:new Entity('T21_M4_FIRST_REAL_CPU_FALL_ACTOR_CONTACT')} as never;
  const nav=new RecastStageNavigation(stage,stats);
  const originalDrop=new UndertowPhase14ECpuHandoff(stage,true);
  const physics=new RapierStagePhysics(DT,stage);
  physics.step();
  const input={moveX:0,moveY:0,jumpHeld:false,squidHeld:false,
   consumeJump:()=>false} as PlayerInput;
  const camera=({getFlatForward:(v:Vec3)=>v.set(0,0,1)}) as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const floor=stage.solids.find(s=>
    s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
  const foot=nearestT21SourceSupportedLanding(floor,{
   x:link.start[0],y:link.start[1],z:link.start[2]
  });
  player.teleport(new Vec3(foot.x,
   foot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,foot.z));
  for(let i=0;i<75;i++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  const center=player.getPosition();
  const physicalHumanFoot={
   x:center.x,y:center.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
   z:center.z
  };
  const passiveHuman=new UndertowPhase14QHumanCrowdAnchor(
   nav,stage,true,physicalHumanFoot);
  const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
  shared.syncActualHumanFoot(physicalHumanFoot);
  const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
   stats,stage,Team.A,originalDrop,shared,passiveHuman);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  for(const bot of bots){
   if(b1Only&&bot.id!=='B1'){
    if(bot.agent)nav.removeAgent(bot.agent);
    bot.agent=null;
    bot.lifeState='SPLATTED';
    bot.respawnRemainingSeconds=9000;
    continue;
   }
   const side=bot.team===Team.A?'positive-z':'negative-z';
   const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(
    p=>p.id==='first-drop-'+side)!;
   expect(probe.expectation).toBe('MUST_REACH');
   expect(nav.auditPath(new Vec3(...probe.from),
    new Vec3(...probe.to)).reachedTarget).toBe(true);
   if(bot.agent)nav.removeAgent(bot.agent);
   bot.agent=nav.addAgent(new Vec3(...probe.from));
   const p=bot.agent.position();
   bot.position.set(p.x,p.y,p.z);
   bot.previousPosition.copy(bot.position);
   bot.entity.setPosition(p.x,p.y+.68,p.z);
   bot.agent.requestMoveTarget(nav.closestPoint(new Vec3(...probe.to)));
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  let blockedFrame=-1,blockedBot:string|null=null,blocker='';
  let actualCpuPoseChangedAfterBlock=false;
  let framesCompleted=0;
  for(let frame=1;frame<=380;frame++){
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const before=bots.map(b=>b.position.clone());
   try{
    cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),false);
   }catch(err){
    blockedFrame=frame;blocker=String(err);
    const match=blocker.match(/"botId":"([AB][1-4])"/) ??
      blocker.match(/"id":"([AB][1-4])"/);
    blockedBot=match?.[1]??null;
    if(blockedBot||b1Only){
     const observed=blockedBot??'B1';
     const i=bots.findIndex(b=>b.id===observed);
     actualCpuPoseChangedAfterBlock=bots[i]!.position.distance(before[i]!)>1e-7;
    }
    break;
   }
   framesCompleted++;
   cpu.drainFireRequests(()=>{throw Error('T21_M4_PRECOMBAT_SHOT_NOT_AUTHORIZED');});
   cpu.drainKitRequests(()=>false);
  }
  const evidence={
   sourceOriginalSolids:stage.solids.length,
   sourceOriginalPaintSurfaces:stage.paintSurfaces.length,
   sourceOriginalNavLinks:stage.navigationLinks?.length,
   actualSevenCpuAgents:bots.map(b=>b.id),
   activeQaCpuIds:b1Only?['B1']:bots.map(b=>b.id),framesCompleted,
   firstUnsafeFrame:blockedFrame,firstUnsafeActor:blockedBot,
   sourceAuthorityRefusal:blocker,
   blockedCpuVisibleFootMutated:actualCpuPoseChangedAfterBlock,
   fakeSourceGeometryAdded:false,realCpuTeleports:0,
   fullEightActorContinuousCollisionCertified:false,
   productionAuthorized:false
  };
  console.log('T21_PHASE14Q_M4_FIRST_REAL_FALL_CONTACT_FAIL_CLOSED',
    JSON.stringify(evidence));
  expect(blockedFrame).toBeGreaterThan(0);
  if(b1Only){
   // With only B1 active, native Crowd generates an oversized
   // offmesh-entry candidate on F2 BEFORE the actor falls near HUMAN.
   // Do not raise speed caps to manufacture a later landing result:
   // the real physical-world gate must reject it as an independent
   // unsafe candidate, leaving B1 foot and real player unmodified.
   expect(blockedFrame).toBe(2);
   expect(blockedBot).toBeNull();
   expect(blocker).toContain('T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED');
  }else{
   expect(blockedBot).not.toBeNull();
   expect(blockedFrame).toBe(1);
   expect(blockedBot).toBe('A1');
   expect(blocker).toContain('T21_PHASE14Q_REAL_CROWD_COLLISION_BLOCKED');
  }
  expect(blocker).toMatch(/T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED|T21_PHASE14Q_ACTUAL_FIRST_DROP_ACTOR_CONTACT|T21_PHASE14Q_REAL_CROWD_COLLISION_BLOCKED|T21_PHASE14Q_REAL_REJOIN_COLLISION_BLOCKED/);
  expect(actualCpuPoseChangedAfterBlock).toBe(false);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(shared.cpuColliderCount).toBe(0);
  passiveHuman.dispose();
  shared.dispose();
 });
 }
});
