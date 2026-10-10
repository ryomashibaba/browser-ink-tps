import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION,type StageDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {auditPhase14JRapierRejoinStep} from './UndertowPhase14JCollisionRejoinGate';

const DT=1/60;
function isolatedFixture(withWall:boolean):StageDefinition {
  // Synthetic obstacles exist exclusively INSIDE an isolated rejection test,
  // never in the frozen Undertow stage or its React/PlayCanvas runtime.
  const base={
    ...PRODUCTION_STAGE_DEFINITION,
    solids:[{
      id:'TEST_ONLY_FLOOR',center:[0,-.15,0] as const,size:[6,.30,6] as const,
      material:'dark' as const,render:true,projectileBlocker:true,cameraBlocker:true
    }],
    paintSurfaces:[]
  };
  const barrier={
    id:'TEST_ONLY_CAPSULE_BARRIER',
    center:[.16,.5,0] as const,size:[.12,1,1.4] as const,
    material:'dark' as const,render:true,projectileBlocker:true,cameraBlocker:true
  };
  return {...base,solids:withWall?[...base.solids,barrier]:base.solids};
}
beforeAll(async()=>{await initializeRapier();});
describe('Phase14J actual Rapier KCC capsule collision for postlanding Crowd rejoin',()=>{
 it('accepts a clear, physically bounded 60Hz step and rejects a source-solid wall obstruction',()=>{
  const clear=new RapierStagePhysics(DT,isolatedFixture(false));
  const blocked=new RapierStagePhysics(DT,isolatedFixture(true));
  clear.step();blocked.step();
  const from={x:-.26,y:.02,z:0};
  const to={x:-.192,y:.02,z:0};
  const normal=auditPhase14JRapierRejoinStep(clear,from,to,DT);
  const obstacle=auditPhase14JRapierRejoinStep(blocked,from,to,DT);
  console.log('T21_PHASE14J_RAPIER_CAPSULE_WALL_NEGATIVE',JSON.stringify({
    normal,obstacle,testOnlyWallNeverPromoted:true,activationReady:false
  }));
  expect(normal.approved).toBe(true);
  expect(normal.cause).toBe('CONTINUOUS_CLEAR');
  expect(obstacle.approved).toBe(false);
  expect(obstacle.cause).toBe('BLOCKED_BY_SOURCE_COLLIDER');
  expect(obstacle.collisionDeltaMeters).toBeGreaterThan(.022);
  expect(normal.requestedMeters).toBeLessThanOrEqual(4.4*DT);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
 it('preserves 60Hz, speed and finite-coordinate fail-closed gates',()=>{
  const p=new RapierStagePhysics(DT,isolatedFixture(false));p.step();
  const from={x:-1,y:.02,z:0};
  expect(()=>auditPhase14JRapierRejoinStep(p,from,{x:0,y:.02,z:0},DT))
    .toThrow('OVERSPEED_REJOIN_REQUEST');
  expect(()=>auditPhase14JRapierRejoinStep(p,from,{x:-.98,y:.02,z:0},1/30))
    .toThrow('INVALID_60HZ_OR_POSITION');
  expect(()=>auditPhase14JRapierRejoinStep(p,from,{x:NaN,y:.02,z:0},DT))
    .toThrow('INVALID_60HZ_OR_POSITION');
 });
 it('retains the frozen 25 original solids for live T21 collision authority',()=>{
  const stage=undertowT21dConnectivityQaStage();
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(stage.metadata.id).toBe('undertow-t21d-partial-connectivity-qa');
  expect(stage.solids.some(s=>s.id==='TEST_ONLY_CAPSULE_BARRIER')).toBe(false);
  expect(freeze.activationReady).toBe(false);
 });
});