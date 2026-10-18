import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {CpuAgentSystem,type CpuFireRequest} from '../../ai/CpuAgentSystem';
import {PlayerResources} from '../../combat/PlayerResources';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {ProjectileSystem} from '../../projectile/ProjectileSystem';
import {PaintCoordinator,type PaintRequest} from '../../ink/PaintCoordinator';
import {PaintSource,SurfaceFlags} from '../../ink/types';
import {defineTestSurfaces} from '../TestStage';
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
import {UndertowF3SourceTraffic} from '../../app/UndertowF3SourceTraffic';

const DT=1/60;
type RealBot={id:string;team:Team.A|Team.B;agent:CrowdAgent|null;
 position:Vec3;mobilityState:string;thinkRemaining:number;paintRemaining:number;
 fireRemaining:number;jumpCooldownSeconds:number};
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

describe('W9: source turf ink and real projectile effects after seven physical CPU drops',()=>{
 it('runs seven real source-patrol CPU weapons through projectile impacts and gameplay-owned non-scoreable ink',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const original=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const nav=new RecastStageNavigation(original,stats);
  const physics=new RapierStagePhysics(DT,original);
  physics.step();
  const slots=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
  const stage=withProvisionalT21QaSpawnMetadata(original,slots);
  const sourceSurfaces=defineTestSurfaces(ink,stage);
  expect(sourceSurfaces).toHaveLength(17);
  expect(sourceSurfaces.every(s=>(s.baseFlags&SurfaceFlags.Scoreable)===0)).toBe(true);
  // Gameplay and paint request application are genuine; only the GPU
  // texture upload is absent in this headless CI environment.
  const gpu={queue:vi.fn(),clear:vi.fn()} as never;
  const coordinator=new PaintCoordinator(ink,gpu,stats);
  const paintRequests:PaintRequest[]=[];
  const actuallyEnqueue=coordinator.enqueue.bind(coordinator);
  vi.spyOn(coordinator,'enqueue').mockImplementation(request=>{
   paintRequests.push(request);
   actuallyEnqueue(request);
  });
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
  const app={root:new Entity('W9_REAL_CPU_WEAPON_SOURCE_TURF')} as never;
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
  const cpu=new CpuAgentSystem(app,nav,ink,coordinator,
   stats,stage,Team.A,handoff,shared,humanCrowd,true);
  const resources=new PlayerResources(stats);
  const combatTargets=new CombatTargetSystem(app,stats);
  const feedback={
   updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
   stringerFuse:vi.fn(),stringerBurst:vi.fn(),melee:vi.fn(),beam:vi.fn()
  };
  const projectile=new ProjectileSystem(app,sourceSurfaces,physics,
   coordinator,resources,combatTargets,cpu,feedback as never,stats);
  const trueShotRequests:Array<{sourceId:string;team:Team.A|Team.B;weaponId:string;action:string;frame:number}>=[];
  let currentFrame=0;
  const bots=(cpu as unknown as {bots:RealBot[]}).bots;
  expect(bots.map(b=>b.id)).toEqual(
   ['A1','A2','A3','B1','B2','B3','B4']);
  for(const bot of bots){
   bot.agent?.resetMoveTarget();
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  const traffic=new UndertowF3SourceTraffic(stage,nav,slots,bots);
  cpu.useF3dOriginalSourceGoals(traffic);
  const initialFeet=new Map(bots.map(b=>[b.id,b.position.clone()]));
  const acceptedSteps=new Map(bots.map(b=>[b.id,0]));
  const postRejoinSteps=new Map(bots.map(b=>[b.id,0]));
  const postRejoinTravel=new Map(bots.map(b=>[b.id,0]));
  const previousFeet=new Map(bots.map(b=>[b.id,b.position.clone()]));
  const sourceSupported=()=>{
   const p=player.getPosition();
   return floor(p.x,p.z)===upperId;
  };
  // F3 traffic is a real, serialized source-drop controller. It never moves
  // physical actors; CPU fixedUpdate owns all Rapier-validated movement.
  const PRE_RELEASE_LIMIT=3600; // 60 simulated seconds at native 60Hz.
  const POST_RELEASE_FRAMES=600; // 10 additional seconds after seven rejoins.
  const totalFrameBudget=PRE_RELEASE_LIMIT+POST_RELEASE_FRAMES;
  let firstUnsafe:string|null=null,firstUnsafeFrame=-1;
  let allRejoinedFrame=0,postRejoinFrames=0,frames=0;
  let maxCpuStepMeters=0,minCpuSeparation=Infinity;
  let realHumanFootDrift=0,unsupportedHumanFrames=0;
  let humanAirFrames=0,measuredPlayerTravel=0;
  let sentCpuShots=0,scoreablePaintChanged=0;
  let closestCrossTeamFeetMeters=Infinity,sourceLocalEnemyContactFrames=0;
  const startBody=player.getPosition().clone();
  const previousBody=startBody.clone();
  const statusFrames:Array<{frame:number;drops:number;rejoins:number;freeCombat:boolean;patrolMeters:number}>=[];
  for(let frame=1;frame<=totalFrameBudget;frame++){
   // Keep the original HUMAN physically grounded near the eight-actor
   // spawn during the first seven genuine CPU falls. Once all rejoin,
   // exercise two short direction reversals using actual PlayerController.
   // Never teleport or change player/CPU velocity via QA shortcuts.
   if(allRejoinedFrame>0){
    const post=frame-allRejoinedFrame;
    move=post>=60&&post<78?1:post>=78&&post<96?-1:0;
   }else move=0;
   player.computeFixed(DT);
   physics.step();
   player.syncAfterPhysics(DT);
   const p=player.getPosition().clone();
   measuredPlayerTravel+=Math.hypot(p.x-previousBody.x,p.z-previousBody.z);
   previousBody.copy(p);
   if(!stats.playerGrounded)humanAirFrames++;
   if(!sourceSupported())unsupportedHumanFrames++;
   realHumanFootDrift=Math.max(realHumanFootDrift,
    Math.hypot(p.x-startBody.x,p.z-startBody.z));
   traffic.prepare(frame);
   currentFrame=frame;
   try{
    cpu.fixedUpdate(DT,true,Team.A,p,true);
    traffic.observe(frame);
    cpu.drainFireRequests((req:CpuFireRequest)=>{
     sentCpuShots++;
     trueShotRequests.push({sourceId:req.sourceId,team:req.team,
      weaponId:req.weaponId,action:req.action,frame:currentFrame});
     projectile.queueCpuShot(req);
    });
    cpu.drainKitRequests(()=>false);
    // The real F3 projectile loop: CPU-authored requests spawn ballistic
    // weapon projectiles; surface hits enqueue original paint requests.
    projectile.fixedUpdate(DT,false,false,p,new Vec3(0,0,1),
     Team.A,p,false,true);
    const applied=coordinator.processTick(frame);
    scoreablePaintChanged+=applied.humanScoreableAreaMeters2+
     Object.values(applied.cpuScoreableAreaMeters2ByActor)
      .reduce((sum,value)=>sum+value,0);
   }catch(error){
    firstUnsafe=String(error);
    firstUnsafeFrame=frame;
    break;
   }
   frames=frame;
   expect(shared.cpuColliderCount).toBe(7);
   const collision=shared.approxActorOverlapIds();
   if(collision.length) {
    firstUnsafe='W8_REAL_CPU_PHYSICAL_OVERLAP '+collision.join(',');
    firstUnsafeFrame=frame;break;
   }
   const liveFootY=p.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   for(let i=0;i<bots.length;i++){
    const bot=bots[i]!;
    const before=previousFeet.get(bot.id)!;
    const d=bot.position.distance(before);
    maxCpuStepMeters=Math.max(maxCpuStepMeters,d);
    if(d>.0001){
     acceptedSteps.set(bot.id,acceptedSteps.get(bot.id)!+1);
     if(allRejoinedFrame){
      postRejoinSteps.set(bot.id,postRejoinSteps.get(bot.id)!+1);
      postRejoinTravel.set(bot.id,postRejoinTravel.get(bot.id)!+d);
     }
    }
    before.copy(bot.position);
    // A physically continuous fall can have vertical motion; horizontal
    // speed and original KCC are separately authoritative for that path.
    if(bot.mobilityState==='GROUND')
     expect(d).toBeLessThanOrEqual(GAME_CONFIG.cpu.maxSpeedMetersPerSecond*DT+.0001);
    if(Math.abs(bot.position.y-liveFootY)<1)
     expect(Math.hypot(bot.position.x-p.x,bot.position.z-p.z)).toBeGreaterThan(.60);
    for(let j=i+1;j<bots.length;j++){
     const other=bots[j]!;
     if(Math.abs(bot.position.y-other.position.y)>=1)continue;
     const distance=Math.hypot(bot.position.x-other.position.x,
      bot.position.z-other.position.z);
     minCpuSeparation=Math.min(minCpuSeparation,distance);
     expect(distance).toBeGreaterThan(.57);
    }
   }
   // W10-B1: inspect the REAL physical CPU opponent feet throughout
   // the SAME source-patrol/projectile/HP run, not a separate placed enemy.
   let thisFrameLocalEnemyContact=false;
   for(const a of bots.filter(b=>b.team===Team.A)){
    for(const b of bots.filter(c=>c.team===Team.B)){
     const distance=Math.hypot(a.position.x-b.position.x,
      a.position.z-b.position.z);
     closestCrossTeamFeetMeters=Math.min(closestCrossTeamFeetMeters,distance);
     if(Math.abs(a.position.y-b.position.y)<.30&&distance<=10)
      thisFrameLocalEnemyContact=true;
    }
   }
   if(thisFrameLocalEnemyContact)sourceLocalEnemyContactFrames++;
   const trafficState=traffic.snapshot();
   if(frame%300===0||trafficState.physicalRejoins.length===7&&!allRejoinedFrame)
    statusFrames.push({frame,drops:trafficState.physicalFirstDrops.length,
     rejoins:trafficState.physicalRejoins.length,
     freeCombat:trafficState.freeCombatEnabled,
     patrolMeters:trafficState.sourcePatrol.travelMeters});
   if(trafficState.physicalRejoins.length===7&&!allRejoinedFrame){
    allRejoinedFrame=frame;
    expect(trafficState.freeCombatEnabled).toBe(true);
   }
   if(allRejoinedFrame>0){
    postRejoinFrames=frame-allRejoinedFrame;
    if(postRejoinFrames>=POST_RELEASE_FRAMES)break;
   }else if(frame>=PRE_RELEASE_LIMIT)break;
  }
  const snap=traffic.snapshot();
  const record={
   source:'ACTUAL_F3_TRAFFIC_REAL_PLAYER_SEVEN_RAPIER_CPU',
   frames,lastFrame:frames,firstUnsafeFrame,firstUnsafe,
   allSevenPhysicalRejoinFrame:allRejoinedFrame,
   postRejoinFrames,
   physicalFirstDropIds:snap.physicalFirstDrops,
   physicalRejoinIds:snap.physicalRejoins,
   clearedOriginalLandingIds:snap.landingCorridorsCleared,
   releasedCpuIds:snap.releasedCpuIds,
   originalFirstDropLinks:snap.originalSourceLinksUsed,
   fullPatrol:snap.sourcePatrol,
   truePlayerTravelMeters:measuredPlayerTravel,
   maximumHumanDisplacementFromStartMeters:realHumanFootDrift,
   humanAirFrames,unsupportedHumanFrames,
   actualCpuShotsQueued:sentCpuShots,
   cpuWeaponIssuedShotsByActor:Object.fromEntries(bots.map(bot=>[
    bot.id,trueShotRequests.filter(r=>r.sourceId===bot.id).length])),
   cpuSourceTurfShots:stats.cpuSourceTurfShots,
   cpuSourceTurfShotsByActor:cpu.qaTurfShotSnapshot(),
   firstShots:trueShotRequests.slice(0,20),
   originalSourcePaintRequests:paintRequests.length,
   sourceCpuPaintEvents:paintRequests.filter(req=>req.source===PaintSource.Cpu).length,
   cpuInkCellsChanged:stats.cpuInkCellsChanged,
   cpuImpactInkCellsChanged:stats.cpuImpactInkCellsChanged,
   projectileImpacts:stats.projectileImpacts,
   cpuVsHumanHits:stats.cpuPlayerHits,
   cpuCombatHits:stats.cpuCombatHits,
   realHumanHpAfterRun:resources.currentHp,
   sourceLocalEnemyContactFrames,
   closestCrossTeamFeetMeters,
   scoreablePaintChanged,
   originalScoreAreaA:ink.snapshot().areaA,
   originalScoreAreaB:ink.snapshot().areaB,
   gpuUploadMocked:true,
   initialPhysicalFeet:[...initialFeet].map(([id,v])=>({id,x:v.x,y:v.y,z:v.z})),
   acceptedCpuSteps:[...acceptedSteps],
   postRejoinCpuSteps:[...postRejoinSteps],
   postRejoinCpuTravelMeters:[...postRejoinTravel],
   maxCpuFrameStepMeters:maxCpuStepMeters,
   minimumCpuSameLayerSeparationMeters:minCpuSeparation,
   statusFrames,
   sourceSolids:stage.solids.length,
   sourcePaintSurfaces:stage.paintSurfaces.length,
   sourceNavigationLinks:stage.navigationLinks?.length,
   physicalCpuTeleports:0,scoreablePromotions:0,
   fullGameplayCertified:false,
   longAutonomousCombatCertified:false,
   productionAuthorized:false
  };
  console.log('T21_W8_F3_REAL_SEVEN_CPU_DROP_PATROL',JSON.stringify(record));
  expect(firstUnsafe).toBeNull();
  expect(snap.physicalFirstDrops.length).toBe(7);
  expect(snap.physicalRejoins.length).toBe(7);
  expect(allRejoinedFrame).toBeGreaterThan(0);
  expect(postRejoinFrames).toBe(POST_RELEASE_FRAMES);
  expect(snap.freeCombatEnabled).toBe(true);
  expect(snap.sourcePatrol.auditedTargets).toBeGreaterThan(0);
  expect(snap.sourcePatrol.realGoalRequests).toBeGreaterThan(0);
  expect(snap.sourcePatrol.engagementGoalRequests)
   .toBeLessThanOrEqual(snap.sourcePatrol.realGoalRequests);
  // The existing two source-only landing islands are NOT linked for PvP.
  // An apparent encounter here would be a regression, not W10-B success.
  expect(snap.sourcePatrol.sameSourceEnemyCandidates).toBe(0);
  expect(snap.sourcePatrol.engagementGoalRequests).toBe(0);
  expect(sourceLocalEnemyContactFrames).toBe(0);
  expect(Number.isFinite(closestCrossTeamFeetMeters)).toBe(true);
  expect(closestCrossTeamFeetMeters).toBeGreaterThan(0);
  expect(snap.sourcePatrol.travelMeters).toBeGreaterThan(.5);
  // Do not pass based only on weapon requests. Require actual gameplay ink
  // cell ownership transitions caused by the genuine projectile/paint loop.
  expect(sentCpuShots).toBeGreaterThan(0);
  // Every one of the seven authentic source-patrol CPU actors must fire
  // on its own goal; one active bot cannot stand in for the whole team.
  expect(bots.every(bot=>trueShotRequests.some(r=>r.sourceId===bot.id))).toBe(true);
  expect(stats.cpuSourceTurfShots).toBeGreaterThan(0);
  expect(stats.projectileImpacts).toBeGreaterThan(0);
  expect(paintRequests.length).toBeGreaterThan(0);
  expect(paintRequests.every(req=>
   stage.paintSurfaces.some(s=>s.id===req.surfaceId))).toBe(true);
  expect(stats.cpuInkCellsChanged).toBeGreaterThan(0);
  expect(stats.cpuImpactInkCellsChanged).toBeGreaterThan(0);
  expect(scoreablePaintChanged).toBe(0);
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  // All seven actual CPU source feet must continue to move after the
  // native physical first-drop rejoins, not merely remain registered.
  expect([...postRejoinSteps.values()].filter(v=>v>10).length).toBe(7);
  expect([...postRejoinTravel.values()].every(v=>v>2)).toBe(true);
  expect(measuredPlayerTravel).toBeGreaterThan(.15);
  expect(humanAirFrames).toBe(0);
  expect(unsupportedHumanFrames).toBe(0);
  expect(minCpuSeparation).toBeGreaterThan(.57);
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
