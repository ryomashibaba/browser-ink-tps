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
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';
import {UndertowPhase14QHumanCrowdAnchor}
 from './UndertowPhase14QHumanCrowdAnchor';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';
import {planT21F2SourceDropRoutes}
 from './UndertowF2SourceDropRoutes';

const DT=1/60;
type Bot={
 id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;mobilityState:string;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;
};
beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
afterEach(()=>vi.restoreAllMocks());

describe('T21 F2 single-timeline actual seven CPU and PlayerController source QA',()=>{
 it('distributes all eight source high-pad actors onto real first-drop links and records a bounded 60Hz physically vetoed session without creating geometry or a playable Turf score',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const original=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const app={root:new Entity('T21_F2_REAL_EIGHT_ACTOR_PHYSICAL_QA')} as never;
  const nav=new RecastStageNavigation(original,stats);
  const physics=new RapierStagePhysics(DT,original);
  physics.step();
  const spawnPlan=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
  const stage=withProvisionalT21QaSpawnMetadata(original,spawnPlan);
  const routePlan=planT21F2SourceDropRoutes(stage,nav,spawnPlan);
  expect(routePlan.routes).toHaveLength(8);
  const routeOf=(id:string)=>{
    const route=routePlan.routes.find(r=>r.actorId===id);
    if(!route)throw Error('T21_F2_SOURCE_ACTOR_ROUTE_MISSING_'+id);
    return route;
  };
  const input={
    moveX:0,moveY:0,jumpHeld:false,squidHeld:false,
    consumeJump:()=>false
  } as PlayerInput;
  const camera=({getFlatForward:(v:Vec3)=>v.set(0,0,1)}) as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const humanStart=routeOf('HUMAN').start;
  player.teleport(new Vec3(humanStart[0],
    humanStart[1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    humanStart[2]));
  for(let i=0;i<30;i++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
  }
  const body=player.getPosition();
  const physicalHumanFoot={
    x:body.x,y:body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:body.z
  };
  const humanAnchor=new UndertowPhase14QHumanCrowdAnchor(
    nav,stage,true,physicalHumanFoot);
  const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
  const handoff=new UndertowPhase14ECpuHandoff(stage,true);
  const cpu=new CpuAgentSystem(app,nav,ink,{enqueue:vi.fn()} as never,
    stats,stage,Team.A,handoff,shared,humanAnchor,true);
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  const starts=new Map(bots.map(b=>[b.id,b.position.clone()]));
  for(const bot of bots){
    const route=routeOf(bot.id);
    expect(bot.position.distance(new Vec3(...route.start))).toBeLessThan(.2);
    expect(bot.agent).not.toBeNull();
    bot.agent!.requestMoveTarget(nav.closestPoint(
      new Vec3(...route.sourceGoal)));
    bot.thinkRemaining=900;bot.paintRemaining=900;
    bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  const historicalMoves=new Map<string,number>();
  const physicallyFalling=new Set<string>();
  const physicallyRejoined=new Set<string>();
  let lastBlocker:string|null=null;
  let stopFrame=0,completedFrame=0,maxGroundStep=0;
  let maximumPhysicalHumanDrift=0;
  let firstDropFrame=0,closestActorSeparation=Number.POSITIVE_INFINITY;
  let firstOverlap:string|null=null;
  let maxCpuTravel=0;
  for(let frame=1;frame<=1200;frame++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
    const bodyNow=player.getPosition();
    const actualHumanFoot={
      x:bodyNow.x,y:bodyNow.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
      z:bodyNow.z
    };
    maximumPhysicalHumanDrift=Math.max(maximumPhysicalHumanDrift,
      Math.hypot(actualHumanFoot.x-physicalHumanFoot.x,
        actualHumanFoot.z-physicalHumanFoot.z));
    // Keep the authored lower link as a test objective. This is a goal
    // request, NOT a CPU physical foot or stage geometry relocation.
    for(const bot of bots){
      if(bot.mobilityState==='GROUND'&&bot.agent&&frame%18===1){
        bot.agent.requestMoveTarget(nav.closestPoint(
          new Vec3(...routeOf(bot.id).sourceGoal)));
        bot.thinkRemaining=900;
      }
    }
    const before=bots.map(b=>b.position.clone());
    const previousStates=bots.map(b=>b.mobilityState);
    try{
      cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),false);
      cpu.drainFireRequests(()=>{throw Error('T21_F2_NO_COMBAT_YET');});
      cpu.drainKitRequests(()=>false);
    }catch(error){
      lastBlocker=String(error);
      stopFrame=frame;
      break;
    }
    for(let i=0;i<bots.length;i++){
      const bot=bots[i]!;
      const traveled=bot.position.distance(before[i]!);
      expect(Number.isFinite(traveled)).toBe(true);
      if(bot.mobilityState==='GROUND')
        maxGroundStep=Math.max(maxGroundStep,traveled);
      if(bot.mobilityState==='FIRST_DROP_FALL'||
         bot.mobilityState==='FIRST_DROP_REJOIN'){
        physicallyFalling.add(bot.id);
        if(!firstDropFrame)firstDropFrame=frame;
      }
      if(previousStates[i]==='FIRST_DROP_REJOIN'&&
          bot.mobilityState==='GROUND')
        physicallyRejoined.add(bot.id);
      const distance=bot.position.distance(starts.get(bot.id)!);
      maxCpuTravel=Math.max(maxCpuTravel,distance);
      historicalMoves.set(bot.id,Math.max(historicalMoves.get(bot.id)??0,
        distance));
    }
    const feet=[
      ...bots.map(b=>({id:b.id,x:b.position.x,y:b.position.y,z:b.position.z})),
      {id:'HUMAN',...actualHumanFoot}
    ];
    for(let i=0;i<feet.length;i++)for(let j=i+1;j<feet.length;j++){
      const a=feet[i]!,b=feet[j]!;
      if(Math.abs(a.y-b.y)>=1)continue;
      const d=Math.hypot(a.x-b.x,a.z-b.z);
      closestActorSeparation=Math.min(closestActorSeparation,d);
      const required=a.id==='HUMAN'||b.id==='HUMAN'?.59:.57;
      if(d<required-.01&&!firstOverlap)
        firstOverlap=frame+':'+a.id+'/'+b.id+':'+d.toFixed(5);
    }
    if(physicallyRejoined.size===7){
      completedFrame=frame;
      break;
    }
  }
  const result={
    framesCompleted:completedFrame||stopFrame||1200,
    boundedFrames:1200,
    distinctOriginalFirstDropLinks:routePlan.distinctFirstDropLinks,
    assignedOriginalLinks:routePlan.routes.map(r=>({
      actorId:r.actorId,linkId:r.linkId,sourceGoal:r.sourceGoal
    })),
    realSevenCpuSpawnFeet:[...starts].map(([id,p])=>({
      id,position:[p.x,p.y,p.z]
    })),
    originalHighSourceSpawns8:true,
    physicalFirstDropActorIds:[...physicallyFalling],
    physicallyRejoinedActorIds:[...physicallyRejoined],
    firstPhysicalDropFrame:firstDropFrame,
    completedAllSevenFrame:completedFrame,
    maximumGroundFootStepMeters:maxGroundStep,
    farthestCpuFromSourceStartMeters:maxCpuTravel,
    perCpuMovement:[...historicalMoves],
    closestSameLayerActorHorizontalMeters:closestActorSeparation,
    firstUnapprovedSameLayerOverlap:firstOverlap,
    maximumStationaryPhysicalHumanHorizontalDriftMeters:maximumPhysicalHumanDrift,
    failClosedRuntimeStop:lastBlocker,
    failClosedRuntimeStopFrame:stopFrame,
    f2FullSequenceCertified:completedFrame>0&&!firstOverlap&&!lastBlocker,
    realHumanControlledByKeyboard:false,
    sourceScoreablePromotions:0,
    sourceGeometryChanged:false,
    productionAuthorized:false
  };
  console.log('T21_F2_EIGHT_ACTOR_CONTINUOUS_REAL_SOURCE_DIAGNOSTIC',
    JSON.stringify(result));
  expect(routePlan.releaseAuthorized).toBe(false);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(physicalHumanFoot.y).toBeGreaterThan(7.35);
  expect(maximumPhysicalHumanDrift).toBeLessThan(.25);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  cpu.reset(Team.A);
  expect(shared.cpuColliderCount).toBe(0);
  humanAnchor.dispose();
  shared.dispose();
  expect(handoff.activeCount).toBe(0);
 });
});
