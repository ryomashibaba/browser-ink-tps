import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics}
 from '../physics/RapierStagePhysics';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {F4_FOOT_HEIGHT_TOLERANCE_METERS,
 f4OriginalTriangleAtFootHeight,inspectF4OriginalSourceFloorCorridor}
 from './UndertowF3SourceFloorAuthority';

beforeAll(async()=>{await initializeRapier()});
describe('F4 real original source floor / visible optical gap classification',()=>{
 it('does not promote an optical triangle into an original collision floor',()=>{
  const one:[[number,number,number],[number,number,number],
    [number,number,number]]=[
   [0,3,0],[2,3,0],[0,3,2]];
  expect(f4OriginalTriangleAtFootHeight(one,.3,.3,3)).toBe(true);
  expect(f4OriginalTriangleAtFootHeight(one,.3,.3,4)).toBe(false);
  expect(f4OriginalTriangleAtFootHeight(one,3,.3,3)).toBe(false);
  expect(f4OriginalTriangleAtFootHeight(one,.3,.3,3,
   F4_FOOT_HEIGHT_TOLERANCE_METERS)).toBe(true);
 });
 it('classifies the actual earlier HUMAN lower landing and centerward support absence at SAME native foot height',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const before=[stage.solids,stage.paintSurfaces,stage.navigationLinks];
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const x=-.0793517455458641;
  const footY=3.8949711322784424-.87;
  const zs=[53.2,51.5,49.0,47.947879791259766,47,46,
   45.84,45,44,43,42,41,40];
  const rows=inspectF4OriginalSourceFloorCorridor(stage,physics,
   zs.map((z,i)=>({id:'POSITIVE_Z_'+i,x,z,footY})));
  expect(rows).toHaveLength(zs.length);
  expect(rows[3]!.originalRapierSupportId)
   .toBe('UndertowT21D:first-drop-landing-positive-z');
  expect(rows[3]!.classification)
   .toBe('REGISTERED_COLLISION_RENDER_DECLARED');
  // Known real loss of support: do not assert whether the optical-only
  // source at that point is a floor, or that no original game floor exists.
  expect(rows[6]!.originalRapierSupportId).toBeNull();
  expect(rows[6]!.classification).toMatch(
   /^(PINNED_OPTICAL_TRIANGLE_ONLY|NO_REGISTERED_OR_PINNED_OPTICAL)/);
  expect(rows.every(r=>r.originalStage==='25/17/26/0'&&
   !r.inferredFloorAuthorized&&!r.originalVersionCollisionCertified&&
   r.runtimeAddedSolids===0)).toBe(true);
  expect([stage.solids,stage.paintSurfaces,stage.navigationLinks])
   .toEqual(before);
  console.log('F4_TRUE_SOURCE_LOWER_CORRIDOR_CLASSIFICATION',
   JSON.stringify({nativeProvenance:'P1_REAL_AT_TICK_1298',
    sampledAtFixedFootY:footY,registeringOriginalGeometryChanges:0,
    rows:rows.map(r=>({z:r.point[2],class:r.classification,
     rapier:r.originalRapierSupportId,refTriangles:r.opticalOnlySourceComponents.length,
     refNames:r.opticalOnlySourceComponents.slice(0,3)}))}));
 });
 it('maps only registered native Rapier support from lower landing toward original ramp without inferring a continuous route',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  // 64 points at the native HUMAN P1 lower-floor foot height. This is a
  // fixed-height diagnostic map, NOT a walkable route: the original ramp
  // rises from Y=3.0 to 4.5 and requires a moving capsule to be proven.
  const xPositions=[-.5,0,.5,1,1.5,2,2.5,3];
  const zPositions=[45.84,46,47,48,49,50,51,52];
  const fixedY=3.8949711322784424-.87;
  const rows=inspectF4OriginalSourceFloorCorridor(stage,physics,
   zPositions.flatMap((z,i)=>xPositions.map((x,j)=>({
    id:'RAMP_APPROACH_'+i+'_'+j,x,z,footY:fixedY
   }))));
  expect(rows).toHaveLength(64);
  const short=(id:string|null)=>{
   if(id?.includes('first-drop-landing-positive-z'))return 'L';
   if(id?.includes('right-low-route-ramp-positive-z'))return 'R';
   if(id?.startsWith('UndertowT21D:'))return 'O';
   return '.';
  };
  const grid=zPositions.map((z,i)=>({
   z,rapierColumns:rows.slice(i*8,(i+1)*8)
    .map(r=>short(r.originalRapierSupportId)).join(''),
   opticalOnlyColumns:rows.slice(i*8,(i+1)*8)
    .map(r=>r.classification==='PINNED_OPTICAL_TRIANGLE_ONLY_NO_RAPIER_SUPPORT'?'v':'.').join('')
  }));
  const summary={
   originalAuthority:'25/17/26/0',sameFootHeight:fixedY,
   xColumns:xPositions,grid,
   landingCount:rows.filter(r=>short(r.originalRapierSupportId)==='L').length,
   rampCount:rows.filter(r=>short(r.originalRapierSupportId)==='R').length,
   visuallyOnlyCount:rows.filter(r=>r.classification===
    'PINNED_OPTICAL_TRIANGLE_ONLY_NO_RAPIER_SUPPORT').length,
   absentBothCount:rows.filter(r=>r.classification===
    'NO_REGISTERED_OR_PINNED_OPTICAL_AT_THIS_FOOT_HEIGHT').length,
   authorizesNewFloor:false,certifiesHumanRoute:false
  };
  expect(summary.landingCount).toBeGreaterThan(0);
  expect(summary.absentBothCount).toBeGreaterThan(0);
  expect(rows.every(r=>!r.inferredFloorAuthorized&&
   r.originalRapierHitFootGapMeters===null||
   !!r.originalRapierSupportId)).toBe(true);
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  console.log('F4_NATIVE_LOWER_TO_RIGHT_RAMP_64_POINT_ORIGINAL_FLOOR_GRID',
   JSON.stringify(summary));
 });

});
