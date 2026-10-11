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

const DT=1/60;
type Bot=F3TrafficCpu&{agent:CrowdAgent|null};
beforeAll(async()=>{
 await Promise.all([initializeRecastNavigation(),initializeRapier()]);
});
describe('F3B playable 8-actor original source runtime',()=>{
 it('reaches all seven real CPU first-drops and lower NavMesh rejoins with a genuine PlayerController and no passive human Crowd proxy',()=>{
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
   const camera=({getFlatForward:(v:Vec3)=>v.set(0,0,1)}) as ThirdPersonCamera;
   const player=new PlayerController(app,physics,pInput,camera,ink,stats);
   player.setTeam(Team.A);
   player.teleport(new Vec3(slots.teamASlots[3]![0],
    slots.teamASlots[3]![1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    slots.teamASlots[3]![2]));
   const shared=new UndertowPhase14QSharedActorCollision(physics,stage,true);
   const handoff=new UndertowPhase14ECpuHandoff(stage,true);
   const cpu=new CpuAgentSystem(app,nav,ink,
    {enqueue:vi.fn()} as never,stats,stage,Team.A,
    handoff,shared,undefined,true);
   const bots=(cpu as unknown as {bots:Bot[]}).bots;
   const traffic=new UndertowF3SourceTraffic(stage,nav,slots,bots);
   let done=0,stop:string|null=null,overlap:string|null=null,
    minimumSeparation=Infinity,maxGroundStep=0;
   for(let frame=1;frame<=2400;frame++){
    const before=bots.map(b=>b.position.clone());
    try{
     player.computeFixed(DT);
     physics.step();player.syncAfterPhysics(DT);
     traffic.prepare(frame);
     cpu.fixedUpdate(DT,true,Team.A,player.getPosition(),true);
     traffic.observe();
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
    if(traffic.snapshot().physicalRejoins.length===7){
     done=frame;break;
    }
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
    originalSourceOnly:true,productionAuthorized:false
   }));
   expect(stop).toBeNull();
   expect(overlap).toBeNull();
   expect(state.physicalFirstDrops).toHaveLength(7);
   expect(state.physicalRejoins).toHaveLength(7);
   expect(state.freeCombatEnabled).toBe(true);
   expect(done).toBeGreaterThan(0);
   expect(maxGroundStep).toBeLessThan(.10);
   expect(stage.solids).toBe(frozen.solids);
   expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
   expect(stage.navigationLinks).toBe(frozen.navigationLinks);
   cpu.reset(Team.A);
   shared.dispose();
  }finally{stub.mockRestore();}
 });
});
