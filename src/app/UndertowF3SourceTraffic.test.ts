import {Entity,Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {SurfaceFlags,Team} from '../ink/types';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {PlayerController} from '../player/PlayerController';
import type {PlayerInput} from '../input/PlayerInput';
import type {ThirdPersonCamera} from '../camera/ThirdPersonCamera';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {rasterizeStageFootprint} from '../stage/StageFootprint';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {defineTestSurfaces} from '../stage/TestStage';
import {proposeB441OriginalFrontline} from './B441OriginalSourceFrontline';
import {UndertowPhase14ECpuHandoff}
 from '../stage/undertow/UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from '../stage/undertow/UndertowPhase14QSharedActorCollision';
import {planSourceSupportedT21QaSpawnSlots,withProvisionalT21QaSpawnMetadata}
 from '../stage/undertow/UndertowPhase14QSourceSpawnPlan';
import {UndertowF3SourceTraffic,type F3TrafficCpu}
 from './UndertowF3SourceTraffic';
import {UndertowF3NativeHumanCrowd} from './UndertowF3NativeHumanCrowd';

const DT=1/60;
type Bot=F3TrafficCpu&{agent:CrowdAgent|null};
beforeAll(async()=>{
 await Promise.all([initializeRecastNavigation(),initializeRapier()]);
});
describe('F3B playable 8-actor original source runtime',()=>{
 it('uses real HUMAN Rapier support for both original registered grates without adding a floor or route',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const originalGrates=stage.solids.filter(s=>s.collisionBehavior==='GRATE');
  expect(originalGrates).toHaveLength(2);
  for(const grate of originalGrates){
   expect(grate.footprint).toBeDefined();
   // Exact existing stage solid only: no synthetic adjoining bridge,
   // NavLink, scoreable face, or claim of a connected playable route.
   const isolated={...stage,solids:[grate],paintSurfaces:[],
    navigationLinks:[]};
   const physics=new RapierStagePhysics(DT,isolated);
   physics.step();
   const rects=rasterizeStageFootprint(
    grate.size[0],grate.size[2],grate.footprint!).rectangles;
   const interior=[...rects].sort((a,b)=>
    b.widthMeters*b.depthMeters-a.widthMeters*a.depthMeters)[0];
   expect(interior).toBeDefined();
   const foot=new Vec3(
    grate.center[0]+interior!.centerU-grate.size[0]/2,
    grate.center[1]+grate.size[1]/2,
    grate.center[2]+interior!.centerV-grate.size[2]/2);
   const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   expect(physics.castCharacterFootSupport(
    new Vec3(foot.x,foot.y+offset,foot.z),offset,'HUMAN')?.solidId)
    .toBe(grate.id);
   expect(physics.castStageSegment(
    new Vec3(foot.x,foot.y+.3,foot.z),
    new Vec3(foot.x,foot.y-.3,foot.z),'ink-projectile'))
    .toBeNull();
   const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
   traffic.stage=isolated;
   traffic.physics=physics;
   traffic.sourceEndpointProbes=0;
   expect(traffic.hasSourceFootSupport(foot)).toBe(true);
   expect(traffic.sourceNativeCharacterFootHit(foot)?.solidId).toBe(grate.id);
   // A lower solid cannot count as CPU ground contact from 30 cm above it.
   expect(traffic.sourceNativeCharacterFootHit(
    new Vec3(foot.x,foot.y+.30,foot.z))).toBeNull();
   expect(traffic.hasSourceFootSupport(
    new Vec3(Number.NaN,foot.y,foot.z))).toBe(false);
   expect(traffic.sourceEndpointProbes).toBe(2);
   physics.world.free();
  }
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(stage.paintSurfaces.every(s=>
   (s.flags&SurfaceFlags.Scoreable)===0)).toBe(true);
 });
 it('prioritizes physically registered OWN retreat over an already approved A1 C-key order, then resumes the order',()=>{
  // Isolated source goal-selection policy fixture: native feet and owner
  // cells are controlled here. It is NOT a claimed real-Chromium arrival.
  const original=undertowT21dConnectivityQaStage();
  const backing='UndertowT21D:right-low-route-ramp-positive-z';
  const paint=original.paintSurfaces.find(s=>s.backingSolidId===backing)!;
  expect(paint).toBeDefined();
  const physical=new Vec3(0,3,42);
  const recoveryFoot=new Vec3(0,3,47);
  const commandedFoot=new Vec3(0,3,35);
  const actor={id:'A1',team:Team.A,hp:25,lifeState:'ACTIVE',
   mobilityState:'GROUND',position:physical,agent:{}};
  const fake:any=Object.create(UndertowF3SourceTraffic.prototype);
  fake.freeCombat=true;
  fake.respawnOriginalDrops=new Set();
  fake.physicallyRejoined=new Set(['A1']);
  fake.patrolGoals=new Map([['A1',[recoveryFoot]]]);
  fake.bots=[actor];
  fake.b137NativeTick=1100;
  fake.b171AllySyncPracticeRunning=true;
  fake.b471AllyOrder={
   requestedTick:1090,goal:commandedFoot,realAllyFootAtApproval:physical
  };
  fake.b471OrderStatus='MOVING';
  fake.b471SourceDecision='ORIGINAL_GOAL_GRANTED';
  fake.originalSourceRecoveryIntent=new Set();
  fake.b443OriginalGoalLocks=new Map();
  fake.b442LastApprovedFront=new Map();
  fake.enableB192HumanCombat=true;
  fake.enableOriginalSourceBattleRecovery=true;
  fake.stage=original;
  fake.realGoalRequests=0;
  fake.hasSourceFootSupport=()=>true;
  fake.hasSourceSupportedRoute=()=>true;
  fake.physics={
   castStageSegment:(from:Vec3)=>({
    solidId:backing,point:new Vec3(from.x,from.y-.65,from.z)
   }),
   castCharacterFootSupport:(center:Vec3,offset:number)=>({
    solidId:backing,point:new Vec3(center.x,center.y-offset,center.z)
   })
  };
  fake.sourceInk={
   sampleWorld:(point:Vec3,_radius:number,_need:number,_exclude:number,
    filter:(surface:unknown)=>boolean)=>{
    const surface={
     id:paint.id,baseFlags:paint.flags,flags:paint.flags,
     isScoreable:false
    };
    if(filter&&!filter(surface))return null;
    return {owner:point.z>=46?Team.A:Team.Neutral,
     flags:paint.flags,surface};
   }
  };
  fake.nav={
   closestPoint:(p:Vec3)=>p,
   auditPath:(from:Vec3,to:Vec3)=>({
    reachedTarget:true,startSnapDistanceMeters:0,
    endSnapDistanceMeters:0,pointCount:2,
    nativePathPoints:[from.clone(),to.clone()]
   })
  };
  const goal=new Vec3();
  expect(fake.chooseSourceGoal('A1',physical,goal)).toBe(true);
  expect(goal.equals(recoveryFoot)).toBe(true);
  expect(fake.originalSourceRecoveryIntent.has('A1')).toBe(true);
  expect(fake.b471AllyOrder.goal.equals(commandedFoot)).toBe(true);
  // An unavailable native retreat route must not silently resume
  // player-C or ordinary attack patrol while the genuine CPU is wounded.
  fake.nav.auditPath=()=>({
   reachedTarget:false,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,pointCount:0,nativePathPoints:[]
  });
  const held=new Vec3(9,9,9);
  expect(fake.chooseSourceGoal('A1',physical,held)).toBe(false);
  expect(held.equals(new Vec3(9,9,9))).toBe(true);
  expect(fake.originalSourceRecoveryIntent.has('A1')).toBe(true);
  expect(fake.b471AllyOrder.goal.equals(commandedFoot)).toBe(true);
  fake.nav.auditPath=(from:Vec3,to:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,pointCount:2,
   nativePathPoints:[from.clone(),to.clone()]
  });
  // The existing 70%-HP hysteresis now clears intent before the
  // queued, still path-gated genuine C order is considered again.
  actor.hp=75;
  expect(fake.chooseSourceGoal('A1',physical,goal)).toBe(true);
  expect(goal.equals(commandedFoot)).toBe(true);
  expect(fake.originalSourceRecoveryIntent.has('A1')).toBe(false);
 });
 for(const humanWalkTicks of [0,28,60,120,180,240])it('native 7-CPU drop safety and human forward/reverse input case='+humanWalkTicks,()=>{
  const stub=vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  try{
   const source=undertowT21dConnectivityQaStage();
   const stats=new PerformanceStats(),ink=new GameplayInkSystem();
   const app={root:new Entity('F3B_REAL_ACTORS')} as never;
   const nav=new RecastStageNavigation(source,stats);
   const physics=new RapierStagePhysics(DT,source);
   physics.step();
   const slots=planSourceSupportedT21QaSpawnSlots(source,nav,physics);
   const stage=withProvisionalT21QaSpawnMetadata(source,slots);
   const pInput={moveX:0,moveY:0,jumpHeld:false,squidHeld:false,
    consumeJump:()=>false} as PlayerInput;
   const camera=({getFlatForward:(v:Vec3)=>v.set(0,0,-1)}) as ThirdPersonCamera;
   const player=new PlayerController(app,physics,pInput,camera,ink,stats);
   player.setTeam(Team.A);
   player.teleport(new Vec3(slots.teamASlots[3]![0],
    slots.teamASlots[3]![1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    slots.teamASlots[3]![2]));
   const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
   // B93: READ-ONLY real shared Rapier KCC rejections (no approval edits).
   const blockedA3:Array<{cause:string;owners:readonly string[];
    from:number[];to:number[]}>=[]; 
   if(humanWalkTicks===240){
    const realAudit=shared.auditGroundStep.bind(shared);
    vi.spyOn(shared,'auditGroundStep').mockImplementation((id,from,to,dt)=>{
     const result=realAudit(id,from,to,dt);
     if(id==='A3'&&!result.approved&&blockedA3.length<16)
      blockedA3.push({cause:result.cause,owners:result.colliderOwnerIds,
       from:[from.x,from.y,from.z],to:[to.x,to.y,to.z]});
     return result;
    });
   }
   const handoff=new UndertowPhase14ECpuHandoff(stage,true);
   const liveHuman=new UndertowF3NativeHumanCrowd(nav,stage);
   const cpu=new CpuAgentSystem(app,nav,ink,
    {enqueue:vi.fn()} as never,stats,stage,Team.A,
    handoff,shared,liveHuman,true);
   const bots=(cpu as unknown as {bots:Bot[]}).bots;
   // B93 is explicitly experimental, never the FIXED retail/QA default.
   const traffic=new UndertowF3SourceTraffic(stage,nav,slots,bots,
    physics,undefined,false,false,false,humanWalkTicks===240);
   cpu.useF3dOriginalSourceGoals(traffic);
   let done=0,stop:string|null=null,overlap:string|null=null,
    minimumSeparation=Infinity,maxGroundStep=0;
   let b93ParkedPlayerFoot:number[]|null=null;
   const b95LateralSourceProbes:Array<{
    requested:number[];snap:number;nativeEndSnap:number;
    reached:boolean;pathPoints:number;sourceSolidId:string|null;
    sourceY:number|null
   }> = [];
   const b94RouteCheckpoints:Array<{
    tick:number;realFoot:number[];crowdFoot:unknown;phase:string|null;
    physicalRejoins:number;humanFoot:number[];
   }> = [];
   let obstructionWitness:null|{
    rejoined:number;released:string[];a3Rejoined:boolean;a2Released:boolean;
    playerFoot:number[];a3Foot:number[];
    genuineSourceAlternateDrops:readonly {
     linkId:string;sourceStart:number[];sourceEnd:number[];
     rejoinRouteExists:boolean;upperPhysicalFootSnapMeters:number;
     endpointSnapMeters:number;nativePathPoints:number;
     upperStartToHumanMeters:number;
    }[];
   }=null;
   // B91: first obstruct the real upper original lip, wait through the
   // observed 5/7 physical plateau, THEN retreat without restarting.
   for(let frame=1;frame<=(humanWalkTicks===180?3600:2400);frame++){
    (pInput as unknown as {moveY:number}).moveY=
     humanWalkTicks===240?(frame<=60?1:0):
     humanWalkTicks===180?(frame<=60?1:frame>1500&&frame<=1560?-1:0):
     humanWalkTicks===120?(frame<=60?1:frame<=120?-1:0):
      frame<=humanWalkTicks?1:0;
    const before=bots.map(b=>b.position.clone());
    try{
     player.computeFixed(DT);
     physics.step();player.syncAfterPhysics(DT);
     const h=player.getPosition();
     traffic.prepare(frame,{x:h.x,
      y:h.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:h.z});
     cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),true);
     traffic.observe(frame);
     cpu.drainFireRequests(()=>{});
     cpu.drainKitRequests(()=>false);
    }catch(e){stop=String(e);break;}
    for(let i=0;i<bots.length;i++){
     if(bots[i]!.mobilityState==='GROUND')
      maxGroundStep=Math.max(maxGroundStep,
       bots[i]!.position.distance(before[i]!));
    }
    const human=player.getPosition();
    const feet=[
     ...bots.map(b=>({id:b.id,x:b.position.x,y:b.position.y,z:b.position.z})),
     {id:'HUMAN',x:human.x,
      y:human.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:human.z}
    ];
    for(let i=0;i<feet.length;i++)for(let j=i+1;j<feet.length;j++){
     const a=feet[i]!,b=feet[j]!;
     if(Math.abs(a.y-b.y)>=1)continue;
     const d=Math.hypot(a.x-b.x,a.z-b.z);
     minimumSeparation=Math.min(minimumSeparation,d);
     if(d<(a.id==='HUMAN'||b.id==='HUMAN'?.58:.56)&&!overlap)
      overlap=frame+':'+a.id+'/'+b.id+'='+d;
    }
    if(humanWalkTicks===240&&[180,360,600,900,1500,2400].includes(frame)){
     const actor=bots.find(b=>b.id==='A3')!;
     b94RouteCheckpoints.push({tick:frame,realFoot:actor.position.toArray(),
      crowdFoot:actor.agent?.position()??null,
      phase:traffic.snapshot().b93UpperDetours.find(d=>d.actorId==='A3')?.phase??null,
      physicalRejoins:traffic.snapshot().physicalRejoins.length,
      humanFoot:player.getPosition().toArray()});
    }
    if(humanWalkTicks===240&&frame===1500){
     const bot=bots.find(b=>b.id==='A3')!;
     const human=player.getPosition();
     const offsets:[[number,number],[number,number],[number,number],
       [number,number],[number,number]]=[
      [1.5,.4],[1.0,.9],[1.9,.3],[1.4,1.1],[2.2,.7]
     ];
     for(const [side,back] of offsets){
      const wanted=new Vec3(bot.position.x+side,bot.position.y,
       bot.position.z+back);
      const navFoot=nav.closestPoint(wanted);
      const path=nav.auditPath(bot.position,
       new Vec3(navFoot.x,navFoot.y,navFoot.z));
      const hit=physics.castStageSegment(
       new Vec3(navFoot.x,navFoot.y+.65,navFoot.z),
       new Vec3(navFoot.x,navFoot.y-.65,navFoot.z),'ink-projectile');
      b95LateralSourceProbes.push({
       requested:wanted.toArray(),snap:Math.hypot(navFoot.x-wanted.x,
        navFoot.y-wanted.y,navFoot.z-wanted.z),
       nativeEndSnap:path.endSnapDistanceMeters,
       reached:path.reachedTarget,pathPoints:path.pointCount,
       sourceSolidId:hit?.solidId??null,sourceY:hit?.point.y??null});
     }
    }
    if(humanWalkTicks===240&&frame===60)
     b93ParkedPlayerFoot=player.getPosition().toArray();
    if(humanWalkTicks===180&&frame===1500){
     const checkpoint=traffic.snapshot();
     obstructionWitness={
      rejoined:checkpoint.physicalRejoins.length,
      released:[...checkpoint.releasedCpuIds],
      a3Rejoined:checkpoint.cpu.find(c=>c.id==='A3')?.rejoined??false,
      a2Released:checkpoint.cpu.find(c=>c.id==='A2')?.released??false,
      playerFoot:player.getPosition().toArray(),
      a3Foot:bots.find(b=>b.id==='A3')!.position.toArray(),
      // B92: inspect alternatives only from the immutable six HIGH
      // original positive-z first-drop links. Recast path acceptance is
      // a navigation observation, NEVER collision-supported passage.
      genuineSourceAlternateDrops:stage.navigationLinks!
       .filter(link=>link.id.startsWith('first-drop-positive-z-'))
       .map(link=>{
        const foot=bots.find(b=>b.id==='A3')!.position;
        const native=nav.auditPath(foot,new Vec3(...link.end));
        const playerFoot=player.getPosition();
        return {linkId:link.id,sourceStart:[...link.start],
         sourceEnd:[...link.end],rejoinRouteExists:native.reachedTarget,
         upperPhysicalFootSnapMeters:native.startSnapDistanceMeters,
         endpointSnapMeters:native.endSnapDistanceMeters,
         nativePathPoints:native.pointCount,
         upperStartToHumanMeters:Math.hypot(
          link.start[0]-playerFoot.x,link.start[2]-playerFoot.z)};
       })
     };
    }
    if(!done&&traffic.snapshot().physicalRejoins.length===7)
     done=frame;
    if(done&&frame>=done+360)break;
   }
   const state=traffic.snapshot();
   // Native 60Hz source CPU observations contain real Crowd and KCC
   // decisions only. Both movement grants and altered SOURCE stay zero.
   const motion=cpu.sourceGroundStepEvidenceSnapshot();
   expect([motion.syntheticFootMoves,motion.syntheticGoals,
    motion.newSolids,motion.newNavLinks,motion.scoreablePromotions])
    .toEqual([0,0,0,0,0]);
   const rows=Object.values(motion.byActor);
   expect(rows.length).toBeGreaterThan(0);
   expect(rows.some(r=>r.crowdNoStep+r.crowdProposals>0)).toBe(true);
   expect(rows.every(r=>r.rapierRejected===
    Object.values(r.rejectionCauses).reduce((s,n)=>s+n,0))).toBe(true);
   expect(traffic.nativeSourceFreeCombatEnabled()).toBe(state.freeCombatEnabled);
   expect(traffic.nativeSourceAllSevenLiveRejoined())
    .toBe(state.physicalRejoins.length===7);
   // Compare genuine native 7-CPU live roster, physical feet and only
   // certified real goal positions; never trust a synthetic HUD count.
   expect(traffic.nativeSourceLiveRejoinedIds()).toEqual(state.physicalRejoins);
   expect(traffic.nativeSourceRadarView().cpu).toEqual(state.cpu.map(c=>({
    id:c.id,mobilityState:c.mobilityState,rejoined:c.rejoined,
    physicalFoot:c.physicalFoot
   })));
   expect(traffic.nativeSourceRadarView().sourcePatrol.activeTargets)
    .toEqual(state.sourcePatrol.activeTargets);
   console.log('T21_F3B_NATIVE_PLAYABLE_8_ACTOR_DIAGNOSTIC',JSON.stringify({
    done,stop,overlap,minimumSeparation,maxGroundStep,
    physicalFirstDrops:state.physicalFirstDrops,
    physicalRejoins:state.physicalRejoins,
    cleared:state.landingCorridorsCleared,
    released:state.releasedCpuIds,
    freeCombatEnabled:state.freeCombatEnabled,
    sourceLinks:state.originalSourceLinksUsed,
    realHumanPassiveNav:liveHuman.snapshot, humanWalkTicks,
    obstructionWitness,
    b93UpperDetours:state.b93UpperDetours,
    b93ExperimentalEnabled:state.b93ExperimentalEnabled,
    b93ParkedPlayerFoot,
    b94RouteCheckpoints,
    b95LateralSourceProbes,
    blockedA3,
    b93A3NativePath:(()=>{
     const actor=bots.find(b=>b.id==='A3')!;
     const link=stage.navigationLinks!.find(l=>
      l.id===state.b93UpperDetours.find(d=>d.actorId==='A3')?.linkId);
     return link?nav.auditPath(actor.position,new Vec3(...link.end))
      .nativePathPoints.slice(0,12):[];
    })(),
    b94UpperOriginalRoute:(()=>{
     const actor=bots.find(b=>b.id==='A3')!;
     const link=stage.navigationLinks!.find(l=>
      l.id===state.b93UpperDetours.find(d=>d.actorId==='A3')?.linkId);
     if(!link)return null;
     const path=nav.auditPath(actor.position,new Vec3(...link.start));
     return {linkId:link.id,reachability:path.reachedTarget,
      startSnap:path.startSnapDistanceMeters,
      endSnap:path.endSnapDistanceMeters,
      points:path.nativePathPoints.slice(0,12)};
    })(),
    sourcePatrol:state.sourcePatrol,
    originalHumanPlayerFoot:player.getPosition().toArray(),
    actorSteeringFeet:bots.map(b=>({id:b.id,
     physicalFoot:b.position.toArray(),mobility:b.mobilityState,
     nativeSteeringFoot:b.agent?.position()??null})),
    originalActorRouteGoals:traffic.routePlan.routes.map(r=>({id:r.actorId,
     linkId:r.linkId,start:r.start,originalGoal:r.sourceGoal})),
    originalSourceOnly:true,productionAuthorized:false
   }));
   if(humanWalkTicks===240)console.log(
    'T21_B95_NATIVE_SOURCE_ESCAPE_WITNESS',JSON.stringify({
     realHumanHeldFoot:b93ParkedPlayerFoot,
     nativeA3OriginalFloor:state.cpu.find(c=>c.id==='A3')?.physicalFoot,
     nativeSourceDetour:state.b93UpperDetours,
     genuineRapierBlockerCount:blockedA3.length,
     rejoined:state.physicalRejoins.length,
     tickFinished:done,
     sourceScoreable:0,productionAuthorized:false
    }));
   expect(stop).toBeNull();
   expect(overlap).toBeNull();
   if(humanWalkTicks===60){
    // The HUMAN's real parked capsule obstructs A3 at the original lip.
    // The five remaining native actors must never ghost through it.
    // Real HUMAN obstruction may legitimately postpone a first drop;
    // future physically safe rerouting must not be rejected by this test.
    expect(state.physicalRejoins.length).toBeGreaterThanOrEqual(5);
    if(!state.freeCombatEnabled){
     expect(state.cpu.find(c=>c.id==='A3')?.rejoined).toBe(false);
     expect(state.cpu.find(c=>c.id==='A2')?.released).toBe(false);
    }
   }else{
    expect(state.physicalFirstDrops).toHaveLength(7);
    expect(state.physicalRejoins).toHaveLength(7);
    expect(state.freeCombatEnabled).toBe(true);
    expect(state.sourcePatrol.auditedTargets).toBeGreaterThan(0);
    expect(state.sourcePatrol.realGoalRequests).toBeGreaterThan(0);
    expect(state.sourcePatrol.travelMeters).toBeGreaterThan(0.5);
   }
   if(humanWalkTicks===240){
    expect(state.b93ExperimentalEnabled).toBe(true);
    expect(b93ParkedPlayerFoot).not.toBeNull();
    // Releasing W at tick 60 does not instantly cancel existing Rapier
    // velocity. Compare with the independently observed settled real
    // human foot at tick 180, then enforce no human intervention.
    const settledFoot=b94RouteCheckpoints.find(x=>x.tick===180)?.humanFoot;
    expect(settledFoot).toBeDefined();
    expect(Math.hypot(
     player.getPosition().x-settledFoot![0]!,
     player.getPosition().z-settledFoot![2]!
    )).toBeLessThan(.02);
    expect(done).toBeGreaterThan(0);
    expect(state.b93UpperDetours.some(r=>r.actorId==='A3'&&
     r.linkId.startsWith('first-drop-positive-z-'))).toBe(true);
    // B95: a lateral target is authentic-source-supported and remains
    // opt-in. This is not a bypass for the real human or any CPU body.
    expect(state.b93UpperDetours.some(r=>r.actorId==='A3'&&
     r.escapeFoot!==null)).toBe(true);
   }else expect(state.b93ExperimentalEnabled).toBe(false);
   if(humanWalkTicks===180){
    expect(obstructionWitness).not.toBeNull();
    expect(obstructionWitness?.rejoined).toBe(5);
    expect(obstructionWitness?.genuineSourceAlternateDrops).toHaveLength(6);
    expect(obstructionWitness?.genuineSourceAlternateDrops.every(x=>
     x.linkId.startsWith('first-drop-positive-z-'))).toBe(true);
    expect(obstructionWitness?.a3Rejoined).toBe(false);
    expect(obstructionWitness?.a2Released).toBe(false);
    // A genuine return across the obstruction MUST precede recovery.
    expect(Math.hypot(
     player.getPosition().x-obstructionWitness!.playerFoot[0]!,
     player.getPosition().z-obstructionWitness!.playerFoot[2]!
    )).toBeGreaterThan(2);
    expect(state.physicalRejoins).toHaveLength(7);
    expect(state.freeCombatEnabled).toBe(true);
   }
   if(humanWalkTicks===0){
    // Isolated native-geometry unit fixture only. Deliberately present
    // inconsistent life-state inputs AFTER the real 7/7 physical run;
    // never insert death, warp, or HP values in actual Chromium gameplay.
    const actor=bots.find(b=>b.id==='B1')!;
    expect(actor.lifeState).toBe('ACTIVE');
    expect(state.physicalRejoins).toContain('B1');
    actor.lifeState='SPLATTED';actor.hp=0;
    actor.mobilityState='FIRST_DROP_FALL'; // stale prior-life motion
    traffic.observe(done+361);
    const splatted=traffic.snapshot();
    expect(traffic.nativeSourceAllSevenLiveRejoined()).toBe(false);
    expect(splatted.cpu.find(x=>x.id==='B1')).toMatchObject({
     lifeState:'SPLATTED',hp:0,rejoined:false
    });
    expect(splatted.physicalRejoins).not.toContain('B1');
    expect(traffic.nativeSourceLiveRejoinedIds()).toEqual(splatted.physicalRejoins);
    expect(traffic.nativeSourceRadarView().cpu.find(c=>c.id==='B1'))
     .toMatchObject({id:'B1',rejoined:false});
    expect(splatted.physicalFirstDrops).not.toContain('B1');
    expect(splatted.freeCombatEnabled).toBe(true);
    // A fake on-floor ACTIVE recovery is NOT an original high-spawn
    // respawn, must not get new lower-rejoin certification.
    actor.lifeState='ACTIVE';actor.hp=100;
    actor.mobilityState='GROUND';
    traffic.observe(done+362);
    const unsafe=traffic.snapshot();
    expect(traffic.nativeSourceAllSevenLiveRejoined()).toBe(false);
    expect(unsafe.physicalRejoins).not.toContain('B1');
    expect(traffic.nativeSourceLiveRejoinedIds()).toEqual(unsafe.physicalRejoins);
    expect(unsafe.sourcePatrol.respawnUnsafeReturnHolds).toBeGreaterThan(0);
    expect(unsafe.sourcePatrol.respawnPendingCpuIds).not.toContain('B1');
    expect(unsafe.sourcePatrol.respawnOriginalRejoins).toBe(0);
   }
   expect(state.sourcePatrol.attemptsToCrossUnboundUnderpass).toBe(0);
   if(humanWalkTicks!==60)expect(done).toBeGreaterThan(0);
   expect(maxGroundStep).toBeLessThan(.10);
   expect(stage.solids).toBe(frozen.solids);
   expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
   expect(stage.navigationLinks).toBe(frozen.navigationLinks);
   cpu.reset(Team.A);
   liveHuman.dispose();
   shared.dispose();
  }finally{stub.mockRestore();}
 });

 it('reads genuine B1 80-second physical foot against unchanged real SOURCE Recast and Rapier',()=>{
  // Immutable 2026-11-14 native Chromium #43573401997 B1 sample at ~80s.
  // This audits ORIGINAL candidate path support, NOT a simulated actor
  // or a new navigation/geometry permission. No artificial foot movement.
  const stub=vi.spyOn(Entity.prototype,'addComponent').mockImplementation(
   ()=>null as never);
  try{
   const original=undertowT21dConnectivityQaStage();
   const stats=new PerformanceStats(),ink=new GameplayInkSystem();
   const app={root:new Entity('B1_ACTUAL_80S_ROUTE_AUDIT')} as never;
   const nav=new RecastStageNavigation(original,stats);
   const physics=new RapierStagePhysics(DT,original);
   physics.step();
   const slots=planSourceSupportedT21QaSpawnSlots(original,nav,physics);
   const stage=withProvisionalT21QaSpawnMetadata(original,slots);
   const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
   const cpu=new CpuAgentSystem(app,nav,ink,
    {enqueue:vi.fn()} as never,stats,stage,Team.A,
    new UndertowPhase14ECpuHandoff(stage,true),shared,
    new UndertowF3NativeHumanCrowd(nav,stage),true);
   const bots=(cpu as unknown as {bots:Bot[]}).bots;
   const traffic=new UndertowF3SourceTraffic(stage,nav,slots,bots,
    physics,undefined,false,false,false,false);
   const t=traffic as unknown as {
    patrolGoals:Map<string,Vec3[]>;
    physics:RapierStagePhysics;stage:typeof stage;
    nativeRouteChecks:number;nativeRouteRayProbes:number;
    sourceEndpointProbes:number;
    sourceNativeCharacterFootHit:(p:Vec3)=>{solidId:string}|null;
    hasSourceSupportedRoute:(a:ReturnType<typeof nav.auditPath>,
     sign:number,actualFoot?:Vec3)=>boolean
   };
   const realFoot=new Vec3(-5.897308208113267,
    4.619208170858396,-48.42249000392073);
   const observedGoal=new Vec3(-17.2657470703125,
    4.599999904632568,-48.05963134765625);
   const candidates=t.patrolGoals.get('B1')??[];
   // Identify the FIRST unregistered route sample using the IDENTICAL
   // 0.30m geometry step and real Rapier foot hit as runtime. Do not
   // pretend a Recast polyline is a successful physical capsule walk.
   const firstDenied=(a:ReturnType<typeof nav.auditPath>)=>{
    const points=a.nativePathPoints;
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    for(let leg=0;leg+1<points.length;leg++){
     const from=points[leg]!,to=points[leg+1]!;
     const meters=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z);
     const steps=Math.max(1,Math.ceil(meters/.30));
     for(let i=leg===0?0:1;i<=steps;i++){
      const f=i/steps;
      const p=new Vec3(from.x+(to.x-from.x)*f,
       from.y+(to.y-from.y)*f,from.z+(to.z-from.z)*f);
      const hit=physics.castCharacterFootSupport(
       new Vec3(p.x,p.y+offset,p.z),offset,'HUMAN');
      const verticalGap=hit?hit.point.y-p.y:null;
      const valid=hit&&Math.abs(verticalGap!)<=.25&&
       stage.solids.some(s=>s.id===hit.solidId)&&
       p.z<=-33&&p.y>=2.5&&p.y<=5.5;
      if(!valid)return {leg,step:i,samples:steps,
       point:[p.x,p.y,p.z],reason:!hit?'NO_REGISTERED_SUPPORT':
        Math.abs(verticalGap!)>.25?'SOURCE_RAPIER_HEIGHT_MISMATCH':
        'UNSUPPORTED_SIDE_OR_SOURCE_SOLID',
       actualSolid:hit?.solidId??null,actualY:hit?.point.y??null,
       verticalGap};
     }
    }
    return null;
   };
   const rows=[...candidates,observedGoal].map((goal,index)=>{
    const a=nav.auditPath(realFoot,goal);
    const supported=t.hasSourceSupportedRoute(a,-1);
    return {index,goal:[goal.x,goal.y,goal.z],
     sourceFoot:t.sourceNativeCharacterFootHit(goal)?.solidId??null,
     reached:a.reachedTarget,startSnap:a.startSnapDistanceMeters,
     endSnap:a.endSnapDistanceMeters,waypoints:a.pointCount,
     registeredFullPath:supported,firstDenied:supported?null:firstDenied(a),
     // Diagnostic only: true RAW Rapier physical foot as the START, not a
     // new route link, altered runtime snap threshold or fake CPU move.
     firstDeniedUsingActualFoot:firstDenied({...a,
      nativePathPoints:[realFoot,...a.nativePathPoints.slice(1)]}),
     actualNativeFootApproved:t.hasSourceSupportedRoute(a,-1,realFoot),
     inventedRaisedFootDenied:!t.hasSourceSupportedRoute(a,-1,
      new Vec3(realFoot.x,realFoot.y+.04,realFoot.z))};
   });
   const realSupport=t.sourceNativeCharacterFootHit(realFoot);
   expect([stage.solids.length,stage.paintSurfaces.length,
    stage.navigationLinks?.length]).toEqual([25,17,26]);
   expect(realSupport?.solidId).toMatch(/^UndertowT21D:/);
   expect(candidates.length).toBeGreaterThan(1);
   expect(rows.length).toBe(candidates.length+1);
   // Real Rapier foot fixes only the 1.96mm Recast projection error.
   // Two ORIGINAL routes still lack supported intermediate ramp height.
   expect(rows.filter(x=>x.actualNativeFootApproved).map(x=>x.index))
    .toEqual([2,3,4,5,6]);
   expect(rows.every(x=>!x.registeredFullPath&&
    x.inventedRaisedFootDenied)).toBe(true);
   console.log('P2_B1_GENUINE_80S_REAL_NATIVE_ROUTE_GATE',
    JSON.stringify({observedRun:43573401997,immutablePhysicalFoot:
     [realFoot.x,realFoot.y,realFoot.z],supportId:realSupport?.solidId,
     actualNativeRouteAudit:true,actualRegisteredRapier:true,
     noAgentOrStageWrites:true,rows}));
  }finally{stub.mockRestore()}
 });

 it('B1 P2 late-foot original ink rescue is route-audited and fails closed',()=>{
  // Genuine immutable SOURCE shape and owner grid, but controlled
  // auditPath result: NOT a claim of real Rapier/Crowd locomotion.
  const stage=undertowT21dConnectivityQaStage();
  const proposals=proposeB441OriginalFrontline(stage,'B');
  expect(proposals.length).toBeGreaterThan(1);
  const foot=new Vec3(...proposals[0]!.point);
  const ink=new GameplayInkSystem();defineTestSurfaces(ink,stage);
  const bot={id:'B1',team:Team.B,position:foot.clone(),
   lifeState:'ACTIVE',mobilityState:'GROUND',hp:100,agent:{}};
  const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
  traffic.stage=stage;traffic.physics={};traffic.nav={
   auditPath:vi.fn((a:Vec3,b:Vec3)=>({
    reachedTarget:true,startSnapDistanceMeters:0,
    endSnapDistanceMeters:0,pointCount:2,nativePathPoints:[a,b]
   }))
  };
  traffic.bots=[bot];traffic.sourceInk=ink;traffic.freeCombat=true;
  traffic.physicallyRejoined=new Set(['B1']);
  traffic.physicallyFalling=new Set();
  traffic.cleared=new Set();
  traffic.respawnOriginalDrops=new Set();
  traffic.originalSourceRecoveryIntent=new Set();
  traffic.patrolGoals=new Map([['B1',[foot.clone()]]]);
  traffic.patrolIndex=new Map();
  traffic.b441FrontGoals=new Map([['B1',[]]]);
  traffic.b445FrontlineGates=new Map();
  // B446 read-only dry evidence is NOT a movement or path grant.
  traffic.b446LiveFootProbes=new Map([['B1',{
   probeOnlyNoActorOrGoalWrites:true
  }]]);
  traffic.b443OriginalGoalLocks=new Map();
  traffic.b442LastApprovedFront=new Map();
  traffic.b467LiveSourceGoals=new Map();
  traffic.b470LastNativeRetry=new Map();
  traffic.realKccRejectedSteps=new Map();
  traffic.p2B1DroughtFoot=new Map();
  traffic.p2B1LastFullRouteAuditTick=-1000;
  traffic.enableB441SourceFrontline=true;
  traffic.enableB192HumanCombat=false;
  traffic.enableB137OriginalAllyRally=false;
  traffic.b137NativeTick=1200;
  traffic.realGoalRequests=0;traffic.b441ActualGoalRequests=0;
  traffic.heldRequests=0;
  traffic.sourceNativeCharacterFootHit=vi.fn((p:Vec3)=>({
   solidId:'UndertowT21D:right-low-team-b',point:p.clone()
  }));
  traffic.hasSourceFootSupport=vi.fn(()=>true);
  traffic.hasSourceSupportedRoute=vi.fn(()=>true);
  const originalFoot=bot.position.clone(),out=new Vec3();
  // Nothing can be promoted without the REAL no-aim witness.
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(false);
  traffic.noteRealSourcePaintAimDrought('B1',foot,119);
  expect(traffic.p2B1DroughtFoot.size).toBe(0);
  traffic.noteRealSourcePaintAimDrought('B1',foot,120);
  expect(traffic.p2B1DroughtFoot.size).toBe(1);
  // One isolated no-aim timestamp does NOT demonstrate real physical
  // stationarity. The original validated route remains unchanged.
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(false);
  traffic.b137NativeTick=1320;
  traffic.noteRealSourcePaintAimDrought('B1',foot,240);
  expect(traffic.p2B1DroughtFoot.get('B1')?.firstStillNativeTick)
   .toBe(1200);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(true);
  expect(out.distance(foot)).toBeGreaterThanOrEqual(2);
  expect(out.z).toBeLessThanOrEqual(-33);
  expect(traffic.nav.auditPath).toHaveBeenCalled();
  expect(traffic.hasSourceSupportedRoute).toHaveBeenCalled();
  expect(traffic.b443OriginalGoalLocks.get('B1')?.target).toEqual(out);
  expect(traffic.p2B1DroughtFoot.size).toBe(0);
  expect(bot.position).toEqual(originalFoot);
  // The critical earlier gap: an existing safe in-flight goal should
  // be preserved with one drought snapshot, but reconsidered after
  // >=120 genuine-stationary ticks and >=120 current weapon NO-AIM.
  // It may switch ONLY to a distinct candidate passing ALL same native
  // Rapier/Recast gates. A static test foot is a controlled fixture, not
  // evidence of native KCC success on a future Chromium run.
  const formerlyApproved=out.clone();
  traffic.b137NativeTick=1500;
  traffic.noteRealSourcePaintAimDrought('B1',foot,120);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(true);
  expect(out).toEqual(formerlyApproved);
  traffic.b137NativeTick=1620;
  traffic.noteRealSourcePaintAimDrought('B1',foot,240);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(true);
  expect(out.distance(formerlyApproved)).toBeGreaterThanOrEqual(2);
  expect(traffic.b443OriginalGoalLocks.get('B1')?.target).toEqual(out);
  expect(traffic.p2B1DroughtFoot.size).toBe(0);
  expect(bot.position).toEqual(originalFoot);
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(stage.paintSurfaces.every(s=>
   (s.flags&SurfaceFlags.Scoreable)===0)).toBe(true);
  // A route that lacks actual source full-path Rapier support stays HOLD.
  traffic.b441FrontGoals.set('B1',[]);
  traffic.b443OriginalGoalLocks.delete('B1');
  traffic.b442LastApprovedFront.delete('B1');
  traffic.b137NativeTick=1800;
  traffic.hasSourceSupportedRoute=vi.fn(()=>false);
  traffic.noteRealSourcePaintAimDrought('B1',foot,120);
  traffic.b137NativeTick=1920;
  traffic.noteRealSourcePaintAimDrought('B1',foot,240);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(false);
  expect(traffic.b443OriginalGoalLocks.has('B1')).toBe(false);
  // Fully OWN source does not give permission for fake paint goals.
  traffic.hasSourceSupportedRoute=vi.fn(()=>true);
  traffic.b137NativeTick=2100;
  for(const surface of ink.getSurfaces())surface.ownerGrid.fill(Team.B);
  traffic.noteRealSourcePaintAimDrought('B1',foot,360);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(false);
  expect(traffic.b443OriginalGoalLocks.has('B1')).toBe(false);
  // B441 may have no ACTUALLY approved front from this current B1
  // physical foot. A stalled old original patrol must not be frozen just
  // because the research mode is on: recheck a DISTINCT existing patrol.
  // A full Rapier+Recast supported route remains mandatory.
  traffic.b443OriginalGoalLocks.delete('B1');
  traffic.b442LastApprovedFront.delete('B1');
  traffic.b441FrontGoals.set('B1',[]);
  for(const surface of ink.getSurfaces())surface.ownerGrid.fill(Team.B);
  const other=new Vec3(...proposals[1]!.point);
  traffic.patrolGoals.set('B1',[foot.clone(),other]);
  traffic.patrolIndex.set('B1',0);
  traffic.b137NativeTick=2400;
  traffic.p2B1DroughtFoot.set('B1',{
   firstStillNativeTick:2200,nativeTick:2400,
   foot:foot.clone(),misses:240
  });
  traffic.hasSourceSupportedRoute=vi.fn(()=>false);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(false);
  expect(traffic.patrolIndex.get('B1')).toBe(0);
  expect(traffic.p2B1DroughtFoot.has('B1')).toBe(true);
  traffic.hasSourceSupportedRoute=vi.fn(()=>true);
  expect(traffic.chooseSourceGoal('B1',foot,out)).toBe(true);
  expect(out).toEqual(other);
  expect(traffic.patrolIndex.get('B1')).toBe(1);
  expect(traffic.p2B1DroughtFoot.size).toBe(0);
  expect(bot.position).toEqual(originalFoot);
  // A genuine splat/respawn must erase the prior life's witness.
  traffic.p2B1DroughtFoot.set('B1',{
   firstStillNativeTick:1800,nativeTick:2100,foot,misses:360
  });
  bot.lifeState='SPLATTED';
  traffic.onNativeSourceCpuRespawn('B1');
  expect(traffic.p2B1DroughtFoot.size).toBe(0);
 });

});
