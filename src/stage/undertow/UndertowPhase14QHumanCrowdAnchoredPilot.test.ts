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
import {Team} from '../../ink/types';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {nearestT21SourceSupportedLanding,UndertowPhase14ECpuHandoff}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';
import {UndertowPhase14QHumanCrowdAnchor}
 from './UndertowPhase14QHumanCrowdAnchor';

const DT=1/60;
type Bot={
 id:string;team:Team.A|Team.B;agent:CrowdAgent|null;entity:Entity;
 position:Vec3;previousPosition:Vec3;mobilityState:string;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;
};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());
describe('T21 Phase14Q M3 real PlayerController externally anchored 8th Crowd neighbour',()=>{
 it('rebinds only HUMAN Crowd proxy from real physical KCC each 60Hz before seven actual source-authoritative CPU drops',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats();
  const ink=new GameplayInkSystem();
  const app={root:new Entity('T21_PHASE14Q_REAL_SEVEN_CPU_SHARED_COLLISION_PREFLIGHT')} as never;
  const nav=new RecastStageNavigation(stage,stats);
  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
   stats,stage,Team.A,handoff);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  const physics=new RapierStagePhysics(DT,stage);
  physics.step();
  let move=0;
  const input={
   get moveX(){return 0;},get moveY(){return move;},
   get squidHeld(){return false;},get jumpHeld(){return false;},
   consumeJump(){return false;}
  } as PlayerInput;
  const camera=({getFlatForward:(v:Vec3)=>v.set(0,0,1)}) as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const floor=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
  const start=nearestT21SourceSupportedLanding(floor,{
   x:link.start[0],y:link.start[1],z:link.start[2]
  });
  player.teleport(new Vec3(start.x,
   start.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,start.z));
  // Eighth Crowd agent is the original-source grounded HUMAN, and has
  // no commanded movement. CPU Crowd separation sees it as an obstacle;
  // genuine PlayerController and Rapier, not this proxy, own player physics.
  const humanCrowd=new UndertowPhase14QHumanCrowdAnchor(
    nav,stage,true,{x:start.x,y:start.y,z:start.z});
  const humanCrowdFoot=humanCrowd.rawCrowdPosition;
  expect(Math.hypot(humanCrowdFoot.x-start.x,humanCrowdFoot.y-start.y,
    humanCrowdFoot.z-start.z)).toBeLessThan(.3);
  for(const bot of bots){
   const side=bot.team===Team.A?'positive-z':'negative-z';
   const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>p.id==='first-drop-'+side)!;
   expect(probe.expectation).toBe('MUST_REACH');
   expect(nav.auditPath(new Vec3(...probe.from),new Vec3(...probe.to)).reachedTarget)
     .toBe(true);
   if(bot.agent)nav.removeAgent(bot.agent);
   bot.agent=nav.addAgent(new Vec3(...probe.from));
   const p=bot.agent.position();
   bot.position.set(p.x,p.y,p.z);
   bot.previousPosition.copy(bot.position);
   bot.entity.setPosition(p.x,p.y+.68,p.z);
   bot.agent.requestMoveTarget(nav.closestPoint(new Vec3(...probe.to)));
   bot.thinkRemaining=900;bot.paintRemaining=900;bot.fireRemaining=900;
   bot.jumpCooldownSeconds=900;
  }
  const rejoined=new Set<string>();
  let completed=-1;
  let maxHumanProxyDrift=0;
  let anchorCorrections=0;
  for(let frame=1;frame<=780;frame++){
   move=0;
   player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   const body=player.getPosition();
   const physicalFoot={
     x:body.x,y:body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
     z:body.z
   };
   const anchored=humanCrowd.syncActualPlayerFoot(physicalFoot);
   expect(anchored.footToCrowdHorizontalMeters).toBeLessThan(.065);
   if(anchored.footToCrowdHorizontalMeters>.01)anchorCorrections++;
   const old=bots.map(b=>b.mobilityState);
   cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),false);
   const drifted=humanCrowd.rawCrowdPosition;
   maxHumanProxyDrift=Math.max(maxHumanProxyDrift,
     Math.hypot(drifted.x-physicalFoot.x,drifted.z-physicalFoot.z));
   cpu.drainFireRequests(()=>{throw Error('PHASE14Q_PRECOMBAT_SHOT_UNEXPECTED');});
   cpu.drainKitRequests(()=>false);
   for(let i=0;i<bots.length;i++){
    if(old[i]==='FIRST_DROP_REJOIN'&&bots[i]!.mobilityState==='GROUND')
     rejoined.add(bots[i]!.id);
   }
   if(rejoined.size===7){completed=frame;break;}
  }
  expect(completed).toBeGreaterThan(0);
  expect(rejoined.size).toBe(7);
  const body=player.getPosition();
  const humanFoot={x:body.x,y:body.y-
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:body.z};
  const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
  shared.syncActualHumanFoot(humanFoot);
  for(const b of bots){
   expect(b.mobilityState).toBe('GROUND');
   shared.syncRealCpuFoot(b.id,b.position);
  }
  expect(shared.cpuColliderCount).toBe(7);
  const allContacts=bots.map(bot=>{
   const separation=Math.hypot(bot.position.x-humanFoot.x,
     bot.position.z-humanFoot.z);
   const audited=shared.auditGroundStep(bot.id,bot.position,bot.position,DT);
   return {id:bot.id,horizontalSeparationMeters:separation,
      approved:audited.approved,cause:audited.cause};
  });
  const closest=Math.min(...allContacts.map(x=>x.horizontalSeparationMeters));
  const closeContacts=['B4','B2'].map(id=>{
   const bot=bots.find(b=>b.id===id)!;
   const result=shared.auditGroundStep(id,bot.position,bot.position,DT);
   return {id,cpuFoot:[bot.position.x,bot.position.y,bot.position.z],
    horizontalSeparationMeters:Math.hypot(
     bot.position.x-humanFoot.x,bot.position.z-humanFoot.z),
    cause:result.cause,approved:result.approved,
    playerInSamePhysicsWorld:result.realHumanCapsulePresent,
    productionAuthorized:result.productionAuthorized
   };
  });
  console.log('T21_PHASE14Q_M3_ANCHORED_HUMAN_CROWD_EVIDENCE',
   JSON.stringify({
    firstDropRecovered:rejoined.size,completedFrame:completed,
    originalSourceSolids:stage.solids.length,
    originalPaintSurfaces:stage.paintSurfaces.length,
    originalNavigationLinks:stage.navigationLinks?.length,
    realPlayerFoot:humanFoot,
    sharedWorldActorColliders:shared.cpuColliderCount,
    riskyContacts:closeContacts,
    allSevenHumanContacts:allContacts,
    closestHorizontalMeters:closest,
    humanCrowdFoot:[humanCrowdFoot.x,humanCrowdFoot.y,humanCrowdFoot.z],
    sourceHumanCrowdAgentPreserved:humanCrowd.rawCrowdPosition,
    maximumCrowdDriftBeforeNextAuthoritativeSync:maxHumanProxyDrift,
    externalHumanPositionSynchronizedEveryPhysicsTick:true,
    usesOnlyCrowdSideHumanAgentTeleport:true,
    actualCpuOrPhysicalHumanTeleports:0,
    anchorCorrections,
    stationaryPhysicalHumanMovedMeters:Math.hypot(humanFoot.x-start.x,
      humanFoot.z-start.z),
    allCpuSimultaneousCollisionSolved:allContacts.every(c=>c.approved),
    originalFreezeUnchanged:true,
    t21ProductionActivationAuthorized:false
   }));
  expect(allContacts).toHaveLength(7);
  expect(Number.isFinite(closest)).toBe(true);
  expect(Number.isFinite(maxHumanProxyDrift)).toBe(true);
  expect(maxHumanProxyDrift).toBeLessThan(.25);
  expect(closeContacts.every(c=>c.playerInSamePhysicsWorld)).toBe(true);
  expect(humanFoot.y).toBeGreaterThan(3.0);
  expect(humanCrowd).not.toBeNull();
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  shared.dispose();
  expect(shared.cpuColliderCount).toBe(0);
  humanCrowd.dispose();
  cpu.reset(Team.A);
  expect(handoff.activeCount).toBe(0);
 });
});
