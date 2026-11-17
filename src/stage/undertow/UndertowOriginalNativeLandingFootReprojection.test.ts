import {Vec3} from 'playcanvas';
import {rasterizeStageFootprint} from '../StageFootprint';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {SurfaceFlags} from '../../ink/types';
import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PerformanceStats} from '../../core/PerformanceStats';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {originalNativeLandingFootReprojection,
 originalNativeRampFootReprojection,
 originalNativeRightLowFootReprojection}
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

describe('STAGE #13 registered right-low source floor native-Y reconciliation',()=>{
 it('rechecks both already-visible original 4.5m floor masks using real Rapier/Recast',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  for(const sign of [1,-1] as const){
   const id='UndertowT21D:right-low-team-'+(sign===1?'a':'b');
   const solid=stage.solids.find(s=>s.id===id)!;
   const raster=rasterizeStageFootprint(
    solid.size[0],solid.size[2],solid.footprint!);
   const rects=[...raster.rectangles].sort((a,b)=>
    b.widthMeters*b.depthMeters-a.widthMeters*a.depthMeters);
   let sample:{x:number;y:number;z:number}|null=null;
   for(const rect of rects){
    const x=solid.center[0]-solid.size[0]*.5+rect.centerU;
    const z=solid.center[2]-solid.size[2]*.5+rect.centerV;
    const actual=nav.auditNavMeshProjection(new Vec3(x,4.95,z));
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const hit=physics.castCharacterFootSupport(
     new Vec3(x,4.95+offset,z),offset,'HUMAN');
    const p=actual.nearestPoint;
    if(actual.success&&hit?.solidId===id&&p&&
       Math.hypot(p.x-x,p.z-z)<=.01&&
       p.y-hit.point.y>=0&&p.y-hit.point.y<=.25){
     sample={x,y:4.95,z};break;
    }
   }
   expect(sample,id).not.toBeNull();
   const proof=originalNativeRightLowFootReprojection(
    stage,physics,nav,sample!,sign);
   expect(proof?.originalSolidId).toBe(id);
   expect(proof!.physicalFloorY).toBeCloseTo(4.5,4);
   expect(proof!.actualPhysicalGapMeters).toBeGreaterThanOrEqual(0);
   expect(proof!.actualPhysicalGapMeters).toBeLessThanOrEqual(.25);
   expect(sample!.y-proof!.physicalFloorY).toBeGreaterThan(.25);
   expect(proof!.projectionXZErrorMeters).toBeLessThanOrEqual(.01);
   expect(proof!.newTerrainAuthorized).toBe(false);
   expect(proof!.newOffmeshLinkAuthorized).toBe(false);
   expect(proof!.realKccRouteCertified).toBe(false);
   expect(originalNativeRightLowFootReprojection(
    stage,physics,nav,sample!,sign===1?-1:1)).toBeNull();
   expect(originalNativeRightLowFootReprojection(
    stage,physics,nav,{...sample!,x:NaN},sign)).toBeNull();
   const wrongNav={auditNavMeshProjection:()=>({
    success:true,nearestPoint:new Vec3(sample!.x+.05,4.6,sample!.z),
    distanceMeters:.05})} as unknown as RecastStageNavigation;
   expect(originalNativeRightLowFootReprojection(
    stage,physics,wrongNav,sample!,sign)).toBeNull();
  }
  expect([stage.solids.length,stage.paintSurfaces.length,
    stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(stage.paintSurfaces.filter(s=>(s.flags&SurfaceFlags.Scoreable)!==0))
   .toHaveLength(0);
 });
});
