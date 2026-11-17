import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PerformanceStats} from '../../core/PerformanceStats';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {originalNativeLandingFootReprojection}
 from './UndertowOriginalNativeLandingFootReprojection';

beforeAll(async()=>await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]));
describe('Issue #13 real original landing NavMesh Y vs collision face',()=>{
 it('reconciles two pinned B2/B4 native interpolated first-denials against the genuine existing Rapier landing',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const known=[
   {x:1.72473923365,y:3.28055548668,z:-52.7625239690},
   {x:.13520034223,y:3.27931027577,z:-51.8685684204}
  ];
  for(const raw of known){
   const offset=.68;
   const nativeHit=physics.castCharacterFootSupport(
    new Vec3(raw.x,raw.y+offset,raw.z),offset,'HUMAN');
   expect(nativeHit?.solidId)
    .toBe('UndertowT21D:first-drop-landing-negative-z');
   expect(Math.abs(nativeHit!.point.y-raw.y)).toBeGreaterThan(.25);
   const proof=originalNativeLandingFootReprojection(
    stage,physics,nav,raw,-1);
   expect(proof).not.toBeNull();
   expect(proof!.originalSolidId)
    .toBe('UndertowT21D:first-drop-landing-negative-z');
   expect(proof!.physicalLandingY).toBeCloseTo(3,2);
   expect(proof!.actualPhysicalGapMeters).toBeGreaterThanOrEqual(0);
   expect(proof!.actualPhysicalGapMeters).toBeLessThanOrEqual(.25);
   expect(proof!.projectionXZErrorMeters).toBeLessThanOrEqual(.01);
   expect(proof!.realKccRouteCertified).toBe(false);
  }
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
 });
 it('fails closed on wrong side, nonfinite paths and unsupported source authority',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const raw={x:1.72473923365,y:3.28055548668,z:-52.7625239690};
  expect(originalNativeLandingFootReprojection(
   stage,physics,nav,raw,1)).toBeNull();
  expect(originalNativeLandingFootReprojection(
   stage,physics,nav,{...raw,y:NaN},-1)).toBeNull();
  expect(originalNativeLandingFootReprojection(
   {...stage,solids:stage.solids.filter(s=>
    s.id!=='UndertowT21D:first-drop-landing-negative-z')},
   physics,nav,raw,-1)).toBeNull();
  const shiftedNav={
   auditNavMeshProjection:()=>({
    success:true,nearestPoint:{x:raw.x+.10,y:3.10,z:raw.z},
    distanceMeters:.1
   })
  } as unknown as RecastStageNavigation;
  expect(originalNativeLandingFootReprojection(
   stage,physics,shiftedNav,raw,-1)).toBeNull();
  const highNav={
   auditNavMeshProjection:()=>({
    success:true,nearestPoint:{x:raw.x,y:3.32,z:raw.z},
    distanceMeters:.1
   })
  } as unknown as RecastStageNavigation;
  expect(originalNativeLandingFootReprojection(
   stage,physics,highNav,raw,-1)).toBeNull();
 });
});
