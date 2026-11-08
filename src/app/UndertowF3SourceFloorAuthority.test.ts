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
});
