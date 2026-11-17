import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {UndertowF3SourceTraffic} from './UndertowF3SourceTraffic';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics}
 from '../physics/RapierStagePhysics';
import {PerformanceStats} from '../core/PerformanceStats';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';

beforeAll(async()=>await Promise.all([
 initializeRecastNavigation(),initializeRapier()
]));
describe('STAGE Issue #13 genuine SOURCE route gate integration',()=>{
 it('changes the actual original SOURCE traffic path gate for two real refused B2/B4 landing samples only',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
  Object.assign(traffic,{
   stage,physics,nav,nativeRouteChecks:0,nativeRouteRayProbes:0,
   sourceEndpointProbes:0,enableB441SourceFrontline:false
  });
  for(const p of [
   {x:1.72473923365,y:3.28055548668,z:-52.7625239690},
   {x:.13520034223,y:3.27931027577,z:-51.8685684204}
  ]){
   // The previous route gate returns false at the straight-interpolated Y.
   expect(traffic.sourceNativeCharacterFootHit(p)).toBeNull();
   // This is the SAME native game method now invoked from actual SOURCE
   // B441 candidate selection: no foot, goal, KCC or route is moved.
   const path={nativePathPoints:[p]};
   expect(traffic.hasSourceSupportedRoute(path,-1)).toBe(true);
   expect(traffic.hasSourceSupportedRoute(path,1)).toBe(false);
  }
  expect(traffic.nativeRouteChecks).toBe(4);
  expect(traffic.nativeRouteRayProbes).toBe(4);
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
 });
 it('rejects missing native projection / source floor instead of creating a fabricated connection',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav={
   auditNavMeshProjection:()=>({
    success:false,nearestPoint:null,distanceMeters:null
   })
  } as unknown as RecastStageNavigation;
  const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
  Object.assign(traffic,{
   stage,physics,nav,nativeRouteChecks:0,nativeRouteRayProbes:0,
   sourceEndpointProbes:0,enableB441SourceFrontline:false
  });
  const point={x:1.72473923365,y:3.28055548668,z:-52.7625239690};
  expect(traffic.hasSourceSupportedRoute(
   {nativePathPoints:[point]},-1)).toBe(false);
  expect(traffic.nativeRouteRayProbes).toBe(1);
 });
});
