import {Entity,Vec3} from 'playcanvas';
import {beforeAll,afterEach,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team,SurfaceFlags} from '../../ink/types';
import {initializeRapier,RapierStagePhysics}
 from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {defineTestSurfaces} from '../TestStage';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {nearestT21SourceSupportedLanding,UndertowPhase14ECpuHandoff}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';

const DT=1/60;
type Bot={
 id:string;agent:CrowdAgent|null;position:Vec3;previousPosition:Vec3;
 entity:Entity;thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;lifeState:'ACTIVE'|'SPLATTED';
 respawnRemainingSeconds:number;mobilityState:string;
};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

function scenario(radius:number){
 vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
 const stage=undertowT21dConnectivityQaStage(),stats=new PerformanceStats();
 const physics=new RapierStagePhysics(DT,stage);
 physics.step();
 const ink=new GameplayInkSystem();
 expect(defineTestSurfaces(ink,stage)).toHaveLength(17);
 const app={root:new Entity('T21_Phase14Q_CPU_GROUND_TO_PLAYER_REAL_RAPIER')} as never;
 const input={moveX:0,moveY:0,jumpHeld:false,squidHeld:false,
   consumeJump:()=>false} as PlayerInput;
 const camera=({getFlatForward:(out:Vec3)=>out.set(0,0,1)}) as ThirdPersonCamera;
 const player=new PlayerController(app,physics,input,camera,ink,stats);
 player.setTeam(Team.A);
 const floor=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-negative-z')!;
 const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
 const supported=nearestT21SourceSupportedLanding(floor,{
   x:link.start[0],y:link.start[1],z:link.start[2]
 });
 player.teleport(new Vec3(supported.x,
   supported.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
   supported.z));
 for(let f=0;f<75;f++){
  player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
 }
 const body=player.getPosition();
 const human={x:body.x,y:body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
   z:body.z};
 const collision=new UndertowPhase14QSharedActorCollision(physics,stage,true);
 collision.syncActualHumanFoot(human);
 const nav=new RecastStageNavigation(stage,stats);
 const adapter=new UndertowPhase14ECpuHandoff(stage,true);
 const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
   stats,stage,Team.A,adapter,collision);
 collision.syncActualHumanFoot(human);
 const bots=(cpu as unknown as {bots:Bot[]}).bots;
 expect(bots).toHaveLength(7);
 for(const bot of bots){
  if(bot.id==='B1')continue;
  if(bot.agent)nav.removeAgent(bot.agent);
  bot.agent=null;bot.lifeState='SPLATTED';
  bot.respawnRemainingSeconds=9000;
  bot.entity.enabled=false;
 }
 const b1=bots.find(b=>b.id==='B1')!;
 if(b1.agent)nav.removeAgent(b1.agent);
 // Choose a direction proven traversable by the ORIGINAL 17 paint masks.
 const candidates=[
  [1,0],[-1,0],[0,1],[0,-1],
  [.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]
 ] as const;
 const source=candidates.map(([dx,dz])=>{
  const pos=new Vec3(human.x+dx*radius,human.y,human.z+dz*radius);
  const paint=ink.sampleWorld(
   new Vec3(pos.x,human.y+.06,pos.z),.34,SurfaceFlags.Paintable
  );
  const snap=nav.closestPoint(pos);
  return {pos,paint,snap};
 }).find(x=>x.paint&&
    Math.hypot(x.snap.x-x.pos.x,x.snap.y-x.pos.y,x.snap.z-x.pos.z)<.2);
 expect(source,'source must be original 17-surface grounded').toBeDefined();
 b1.agent=nav.addAgent(source!.pos);
 const start=b1.agent.position();
 b1.position.set(start.x,start.y,start.z);
 b1.previousPosition.copy(b1.position);
 b1.entity.setPosition(start.x,start.y+.68,start.z);
 b1.thinkRemaining=900;b1.paintRemaining=900;
 b1.fireRemaining=900;b1.jumpCooldownSeconds=900;
 b1.agent.requestMoveTarget(nav.closestPoint(new Vec3(human.x,human.y,human.z)));
 return {cpu,collision,body,human,stats,b1,adapter,stage};
}
describe('T21 Phase14Q M2 real CpuAgentSystem ground step shared Rapier vetting',()=>{
 it('blocks an actual moving Recast B1 foot on real HUMAN collider without mutating its visible foot or teleporting its Crowd agent',()=>{
  const w=scenario(.69);
  let reason='',blockedAt=-1,footBefore:Vec3|null=null;
  for(let frame=1;frame<=110;frame++){
   const before=w.b1.position.clone();
   try{
    w.cpu.fixedUpdate(DT,true,Team.A,w.body,false);
   }catch(e){
    reason=String(e);blockedAt=frame;footBefore=before;break;
   }
   const delta=w.b1.position.distance(before);
   expect(delta).toBeLessThan(.10);
  }
  console.log('T21_PHASE14Q_REAL_CPU_CROWD_SHARED_WORLD_BLOCK_EVIDENCE',
   JSON.stringify({
    blockedAt,reason,cpuId:w.b1.id,
    previousOriginalSourceCpuFoot:footBefore?
     [footBefore.x,footBefore.y,footBefore.z]:null,
    actualCpuFoot:[w.b1.position.x,w.b1.position.y,w.b1.position.z],
    humanRealFoot:w.human,liveCpuColliders:w.collision.cpuColliderCount,
    originalGeometryChanged:false,
    visibleBotPoseModifiedAfterBlock:false,
    automaticCrowdTeleport:false,
    fullSevenCpuDynamicContactResolved:false,
    productionActivationAuthorized:false
   }));
  expect(blockedAt).toBeGreaterThan(0);
  expect(reason).toContain('T21_PHASE14Q_REAL_CROWD_COLLISION_BLOCKED');
  expect(reason).toMatch(/UNSUPPORTED_INITIAL_OVERLAP|DYNAMIC_ACTOR_OR_STAGE_BLOCKER/);
  expect(w.b1.position.distance(footBefore!)).toBeLessThan(1e-7);
  expect(w.collision.cpuColliderCount).toBe(1);
  w.cpu.reset(Team.A);
  expect(w.collision.cpuColliderCount).toBe(0);
  w.collision.dispose();
  expect(w.adapter.activeCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
 it('rejects the opt-in shared collision authority unless the original T21 Rapier drop adapter is present',()=>{
  const w=scenario(.69);
  const nav=new RecastStageNavigation(w.stage,w.stats);
  expect(()=>new CpuAgentSystem(
   {root:new Entity('T21_Phase14Q_REJECT_WITHOUT_ADAPTER')} as never,
   nav,new GameplayInkSystem(),{enqueue:vi.fn()} as never,
   w.stats,w.stage,Team.A,undefined,w.collision
  )).toThrow('T21_PHASE14Q_SHARED_COLLISION_PRODUCTION_FORBIDDEN');
  w.cpu.reset(Team.A);
  expect(w.collision.cpuColliderCount).toBe(0);
  w.collision.dispose();
 });
});
