import {Entity,Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {Team} from '../ink/types';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {PlayerController} from '../player/PlayerController';
import type {PlayerInput} from '../input/PlayerInput';
import type {ThirdPersonCamera} from '../camera/ThirdPersonCamera';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
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
    sourcePatrol:state.sourcePatrol,
    originalHumanPlayerFoot:player.getPosition().toArray(),
    actorSteeringFeet:bots.map(b=>({id:b.id,
     physicalFoot:b.position.toArray(),mobility:b.mobilityState,
     nativeSteeringFoot:b.agent?.position()??null})),
    originalActorRouteGoals:traffic.routePlan.routes.map(r=>({id:r.actorId,
     linkId:r.linkId,start:r.start,originalGoal:r.sourceGoal})),
    originalSourceOnly:true,productionAuthorized:false
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
    expect(Math.hypot(
     player.getPosition().x-b93ParkedPlayerFoot![0]!,
     player.getPosition().z-b93ParkedPlayerFoot![2]!
    )).toBeLessThan(.1);
    expect(state.b93UpperDetours.some(r=>r.actorId==='A3'&&
     r.linkId.startsWith('first-drop-positive-z-'))).toBe(true);
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
});
