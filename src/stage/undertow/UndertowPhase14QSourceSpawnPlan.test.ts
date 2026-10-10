import {Entity,Vec3} from 'playcanvas';
import {beforeAll,afterEach,describe,expect,it,vi} from 'vitest';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from './UndertowPhase14QSourceSpawnPlan';

beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
afterEach(()=>vi.restoreAllMocks());
describe('T21 QA spawn provenance and eight-actor upper island allocation',()=>{
 it('allocates 4+4 non-overlapping actual original Rapier high-slab and Recast-supported QA slots, then instantiates seven real CPU bodies on them',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats();
  const nav=new RecastStageNavigation(stage,stats);
  const phys=new RapierStagePhysics(1/60,stage);
  phys.step();
  const originalStageMeta=stage.metadata;
  const plan=planSourceSupportedT21QaSpawnSlots(stage,nav,phys);
  expect(plan.qaOnly).toBe(true);
  expect(plan.releaseAuthorized).toBe(false);
  expect(plan.teamASlots).toHaveLength(4);
  expect(plan.teamBSlots).toHaveLength(4);
  expect(plan.minimumClearanceMeters).toBeGreaterThanOrEqual(.70);
  const qa=withProvisionalT21QaSpawnMetadata(stage,plan);
  expect(qa.solids).toBe(frozen.solids);
  expect(qa.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(qa.navigationLinks).toBe(frozen.navigationLinks);
  expect(qa.metadata.teamASpawn).toEqual(originalStageMeta.teamASpawn);
  expect(qa.metadata.teamBSpawn).toEqual(originalStageMeta.teamBSpawn);
  expect(stage.metadata.teamASpawnSlots).toHaveLength(1);
  expect(stage.metadata.teamBSpawnSlots).toHaveLength(1);
  const app={root:new Entity('T21_UNDER_T21_QA_SAFE_SPAWN')} as never;
  const cpu=new CpuAgentSystem(app,nav,new GameplayInkSystem(),
   {enqueue:vi.fn()} as never,stats,qa,Team.A);
  const bots=(cpu as unknown as {bots:Array<{id:string;team:Team.A|Team.B;position:Vec3}>}).bots;
  expect(bots.map(b=>b.id)).toEqual(['A1','A2','A3','B1','B2','B3','B4']);
  const minCpuDist=Math.min(...bots.flatMap((b,i)=>bots.slice(i+1)
   .filter(o=>o.team===b.team).map(o=>
     Math.hypot(o.position.x-b.position.x,o.position.z-b.position.z))));
  expect(minCpuDist).toBeGreaterThan(.70);
  console.log('T21_QA_HIGH_SPAWN_SOURCE_BACKED_4_PLUS_4_SLOTS',JSON.stringify({
   originalSourceStage:stage.metadata.id,
   spawnCentersUnchanged:true,
   originalHighSolids:plan.originalHighSolids,
   candidateTeamASlots:plan.teamASlots,
   candidateTeamBSlots:plan.teamBSlots,
   minimumSlotClearanceMeters:plan.minimumClearanceMeters,
   instantiatedRealCpuIds:bots.map(x=>x.id),
   actualCpuInitialSeparationMeters:minCpuDist,
   releaseAuthorized:false,originalT20Unchanged:true
  }));
  cpu.reset(Team.A);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
 it('does not allow source slots or source collision authority to leak onto production T20',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const phys=new RapierStagePhysics(1/60,stage);
  phys.step();
  const plan=planSourceSupportedT21QaSpawnSlots(stage,nav,phys);
  expect(()=>withProvisionalT21QaSpawnMetadata(
   PRODUCTION_STAGE_DEFINITION,plan)).toThrow(
    'T21_QA_SPAWN_METADATA_MUST_NOT_PROMOTE');
 });
});
