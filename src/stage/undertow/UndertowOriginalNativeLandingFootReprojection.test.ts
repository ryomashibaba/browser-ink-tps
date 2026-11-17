import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PerformanceStats} from '../../core/PerformanceStats';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {originalNativeLandingFootReprojection,
 originalNativeRampFootReprojection}
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


describe('Issue #13 original mirrored FloorConcrete03 ramp native Y recheck',()=>{
 it('finds the true slope face for genuine B2/B4 post-landing denials without allowing actor movement',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const points=[
   new Vec3(-1.6752602259318037,3.894444465637207,
    -49.090881983439125),
   new Vec3(-1.708983707016912,3.72758620360802,
    -49.548011779785156)
  ];
  for(const p of points){
   const off=.68;
   const nativeRaw=physics.castCharacterFootSupport(
    new Vec3(p.x,p.y+off,p.z),off,'HUMAN');
   expect(nativeRaw?.solidId).toBe(
    'UndertowT21D:right-low-route-ramp-negative-z');
   expect(p.y-nativeRaw!.point.y).toBeGreaterThan(.25);
   const proof=originalNativeRampFootReprojection(
    stage,physics,nav,p,-1);
   expect(proof?.originalSolidId).toBe(
    'UndertowT21D:right-low-route-ramp-negative-z');
   expect(proof!.actualPhysicalGapMeters).toBeGreaterThan(0);
   expect(proof!.actualPhysicalGapMeters).toBeLessThanOrEqual(.25);
   expect(proof!.projectionXZErrorMeters).toBeLessThan(.01);
   expect(proof!.realRapierFaceY).toBeCloseTo(
    proof!.originalTriangleFaceY,2);
   expect(proof!.newFloorOrOffmeshLinkAuthorized).toBe(false);
   expect(proof!.completePhysicalKccRouteCertified).toBe(false);
  }
 });
 it('refuses wrong side, false source triangles and off-corridor native snaps',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const raw={x:-1.6752602259318037,y:3.894444465637207,
   z:-49.090881983439125};
  expect(originalNativeRampFootReprojection(
   stage,physics,nav,raw,1)).toBeNull();
  expect(originalNativeRampFootReprojection(
   stage,physics,nav,{...raw,x:NaN},-1)).toBeNull();
  const without={...stage,solids:stage.solids.filter(s=>
   s.id!=='UndertowT21D:right-low-route-ramp-negative-z')};
  expect(originalNativeRampFootReprojection(
   without,physics,nav,raw,-1)).toBeNull();
  const wrongNearest={auditNavMeshProjection:()=>({
   success:true,nearestPoint:new Vec3(raw.x+.10,3.20,raw.z),
   distanceMeters:.1
  })} as unknown as RecastStageNavigation;
  expect(originalNativeRampFootReprojection(
   stage,physics,wrongNearest,raw,-1)).toBeNull();
  const wrongLayer={auditNavMeshProjection:()=>({
   success:true,nearestPoint:new Vec3(raw.x,5.5,raw.z),
   distanceMeters:.1
  })} as unknown as RecastStageNavigation;
  expect(originalNativeRampFootReprojection(
   stage,physics,wrongLayer,raw,-1)).toBeNull();
 });
});
