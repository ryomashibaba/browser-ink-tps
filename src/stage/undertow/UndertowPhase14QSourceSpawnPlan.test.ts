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
 originalHighSpawnNativeConnection,withProvisionalT21QaSpawnMetadata}
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

describe('T21 SOURCE native clearance vs real Rapier high-floor top',()=>{
 it('accepts 4+4 real native high-island spawn positions despite Recast +0.10m clearance, keeping 17 HUMAN perimeter support probes',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const plan=planSourceSupportedT21QaSpawnSlots(stage,nav,physics);
  for(const [side,spawn,slots] of [
   ['positive-z',stage.metadata.teamASpawn,plan.teamASlots],
   ['negative-z',stage.metadata.teamBSpawn,plan.teamBSlots]
  ] as const){
   const floorId='UndertowT21D:spawn-high-'+side;
   const floor=stage.solids.find(s=>s.id===floorId)!;
   const floorTop=floor.center[1]+floor.size[1]*.5;
   expect(floorTop).toBe(7.5);
   expect(slots).toHaveLength(4);
   for(const foot of slots){
    const nativeY=foot[1];
    // The 10cm delta seen on true CI is a REAL Recast clearance, not
    // a nonexistent physical ground or a failed HUMAN floor support.
    expect(nativeY-floorTop).toBeGreaterThan(.08);
    expect(nativeY-floorTop).toBeLessThan(.16);
    expect(originalHighSpawnNativeConnection(nav,
     [spawn[0],nativeY,spawn[2]],foot)).toBe(true);
    for(let i=0;i<16;i++){
     const a=2*Math.PI*i/16;
     const hit=physics.castCharacterFootSupport(new Vec3(
      foot[0]+Math.cos(a)*.285,foot[1],foot[2]+Math.sin(a)*.285
     ),0,'HUMAN');
     expect(hit?.solidId).toBe(floorId);
     expect(hit?.point.y).toBeCloseTo(floorTop,2);
    }
   }
  }
  expect(plan.qaOnly).toBe(true);
  expect(plan.releaseAuthorized).toBe(false);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect([stage.solids.length,stage.paintSurfaces.length,stage.navigationLinks?.length])
   .toEqual([25,17,26]);
 });
});

describe('T21 actual SOURCE QA spawn admission fail-closed paths',()=>{
 it('rejects a native point echo when original Recast projection failed',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const nav={
   auditNavMeshProjection:vi.fn(()=>({
    success:false,nearestPoint:null,distanceMeters:null
   }))
  } as unknown as RecastStageNavigation;
  expect(()=>planSourceSupportedT21QaSpawnSlots(
   stage,nav,{} as RapierStagePhysics
  )).toThrow('T21_QA_SOURCE_SPAWN_ORIGINAL_POINT_NOT_NAVIGABLE_positive-z');
 });
 it('allows same-high native routes only when both real directions reach their original endpoints',()=>{
  const from=[0,7.5,0] as const,to=[.82,7.5,0] as const;
  const path=(a:Vec3,b:Vec3)=>({
   startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   querySuccess:true,pointCount:2,
   nativePathPoints:[{x:a.x,y:a.y,z:a.z},{x:b.x,y:b.y,z:b.z}],
   endpointErrorMeters:0,reachedTarget:true
  });
  const nav={
   auditPath:vi.fn((a:Vec3,b:Vec3)=>path(a,b))
  } as unknown as RecastStageNavigation;
  expect(originalHighSpawnNativeConnection(nav,from,to)).toBe(true);
  expect((nav.auditPath as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2);
  let calls=0;
  vi.spyOn(nav,'auditPath').mockImplementation((a,b)=>{
   calls++;
   return {...path(a,b),reachedTarget:calls===1};
  });
  expect(originalHighSpawnNativeConnection(nav,from,to)).toBe(false);
 });
 it('rejects a projected route that detours through a lower source floor',()=>{
  const nav={
   auditPath:vi.fn((a:Vec3,b:Vec3)=>({
    startSnapDistanceMeters:0,endSnapDistanceMeters:0,
    querySuccess:true,pointCount:3,
    nativePathPoints:[
     {x:a.x,y:a.y,z:a.z},
     {x:(a.x+b.x)/2,y:3,z:(a.z+b.z)/2},
     {x:b.x,y:b.y,z:b.z}
    ],endpointErrorMeters:0,reachedTarget:true
   }))
  } as unknown as RecastStageNavigation;
  expect(originalHighSpawnNativeConnection(
   nav,[0,7.5,0],[.82,7.5,0]
  )).toBe(false);
 });
});
