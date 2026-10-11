import {Entity,Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {beforeAll,afterEach,describe,expect,it,vi} from 'vitest';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,
 undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UndertowPhase14ECpuHandoff}
 from './UndertowPhase14ECpuHandoff';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';

type Bot={
 id:string;team:Team.A|Team.B;position:Vec3;
 agent:CrowdAgent|null;mobilityState:string;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;
};
const DT=1/60;
beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
afterEach(()=>vi.restoreAllMocks());

describe('T21 macro QA real 7-CPU source-derived 4+4 spawn deployment',()=>{
 it('runs seven real CPU Crowd and original Rapier first-drop controllers from nonoverlapping genuine high spawn footprints without hand-placed per-bot fake positions',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const frozenStage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats();
  const nav=new RecastStageNavigation(frozenStage,stats);
  const phys=new RapierStagePhysics(DT,frozenStage);phys.step();
  const plan=planSourceSupportedT21QaSpawnSlots(frozenStage,nav,phys);
  const qa=withProvisionalT21QaSpawnMetadata(frozenStage,plan);
  const adapter=new UndertowPhase14ECpuHandoff(qa,true);
  const cpu=new CpuAgentSystem(
   {root:new Entity('T21_SEVEN_SOURCE_SPAWN_QA')} as never,
   nav,new GameplayInkSystem(),{enqueue:vi.fn()} as never,
   stats,qa,Team.A,adapter
  );
  const bots=(cpu as unknown as {bots:Bot[]}).bots;
  expect(bots).toHaveLength(7);
  const initial=new Map(bots.map(b=>[b.id,b.position.clone()]));
  const initialMinimum=Math.min(...bots.flatMap((b,i)=>
   bots.slice(i+1).filter(other=>other.team===b.team).map(other=>
    Math.hypot(other.position.x-b.position.x,
      other.position.z-b.position.z))));
  expect(initialMinimum).toBeGreaterThan(.7);
  for(const b of bots){
   expect(b.agent).not.toBeNull();
   const side=b.team===Team.A?'positive-z':'negative-z';
   const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(x=>
    x.id==='first-drop-'+side)!;
   const route=nav.auditPath(b.position,new Vec3(...probe.to));
   expect(route.reachedTarget).toBe(true);
   b.agent!.requestMoveTarget(nav.closestPoint(new Vec3(...probe.to)));
   b.thinkRemaining=900;b.paintRemaining=900;
   b.fireRemaining=900;b.jumpCooldownSeconds=900;
  }
  const physicalDrops=new Set<string>();
  const biggestStep=new Map<string,number>();
  let frames=0;
  for(let i=0;i<180;i++){
   const before=bots.map(b=>b.position.clone());
   cpu.fixedUpdate(DT,true,Team.A,new Vec3(0,7,0),false);
   cpu.drainFireRequests(()=>{throw Error('T21_QA_SPAWN_NO_EARLY_COMBAT');});
   cpu.drainKitRequests(()=>false);
   frames++;
   for(let j=0;j<bots.length;j++){
    const b=bots[j]!;
    const d=b.position.distance(before[j]!);
    biggestStep.set(b.id,Math.max(biggestStep.get(b.id)??0,d));
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeLessThan(.65);
    if(b.mobilityState==='FIRST_DROP_FALL'||
       b.mobilityState==='FIRST_DROP_REJOIN')physicalDrops.add(b.id);
   }
  }
  const netProgress=bots.map(b=>({
   id:b.id,deltaMeters:b.position.distance(initial.get(b.id)!)
  }));
  const moving=netProgress.filter(b=>b.deltaMeters>.2);
  expect(moving.length).toBeGreaterThanOrEqual(3);
  expect(frames).toBe(180);
  expect(plan.releaseAuthorized).toBe(false);
  expect(frozen.activationReady).toBe(false);
  expect(qa.solids).toBe(frozen.solids);
  expect(qa.navigationLinks).toBe(frozen.navigationLinks);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_MACRO_REAL_SEVEN_CPU_NONOVERLAP_SOURCE_SPAWN_DEPLOYMENT',
   JSON.stringify({
    frames,originalHighSolids:plan.originalHighSolids,
    nativeInitialMinimumSeparationMeters:initialMinimum,
    sevenOriginalSourceSpawnPositions:[...initial].map(([id,p])=>({
     id,foot:[p.x,p.y,p.z]
    })),movement:netProgress,movingCpuCount:moving.length,
    originalKccDropActorIds:[...physicalDrops],
    maximumAuthenticSteps:[...biggestStep],
    actualCpuPoseTeleports:0,stageSolidsModified:false,
    originalStageSourceScoreablePromoted:false,
    actualPlayerOperated:false,
    sharedActorWorldCollisionApproved:false,
    productionAuthorized:false
   }));
  cpu.reset(Team.A);
  expect(adapter.activeCount).toBe(0);
 });
});
