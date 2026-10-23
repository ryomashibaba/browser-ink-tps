import {describe,expect,it} from 'vitest';
import {inspectB120OriginalFirstDropBoundary as inspect}
 from './W10B120OriginalSourceBoundary';
describe('W10-B120 original-source registered first-drop boundary',()=>{
 const b=(tick:number,x:number,y:number,z:number)=>
  inspect({nativeTick:tick,actualRapierBody:[x,y,z],side:'positive-z'});
 it('detects the genuine grounded tick-258 landing INSIDE original lower polygon',()=>{
  const v=b(258,-.1739107072353363,3.895097494125366,47.10128402709961);
  expect(v.originalFootInsideXZ).toBe(true);
  expect(v.originalFloorHorizontalStatus)
   .toBe('ACTUAL_FOOT_INSIDE_EXISTING_FIRST_DROP');
  expect(v.originalSourceSolidId)
   .toBe('UndertowT21D:first-drop-landing-positive-z');
  expect(v.originalSlabTopMeters).toBe(3);
  expect(Math.abs(v.actualFootVerticalToSourceTopMeters)).toBeLessThan(.1);
 });
 it('detects genuine tick-270 physical EXIT from existing source polygon',()=>{
  const v=b(270,-.1875273883342743,3.7403006553649902,46.062782287597656);
  expect(v.originalFootInsideXZ).toBe(false);
  expect(v.actualHorizontalDistanceToOriginalPolygonEdgeMeters).toBeGreaterThan(0);
  expect(v.missingFloorProven).toBe(false);
  expect(v.corridorOrOtherFloorInferred).toBe(false);
  expect(v.originalStageGeometryModified).toBe(false);
 });
 it('never mislabels airborne first-drop original footage as proven missing geometry',()=>{
  const v=b(150,-.17371968924999237,7.923279285430908,56.297340393066406);
  expect(v.missingFloorProven).toBe(false);
  expect(v.originalHumanKccMovedByObservation).toBe(false);
  expect(v.formal4v4Certified).toBe(false);
 });
 it('reports actual mirrored original source identity without new floor',()=>{
  const v=inspect({nativeTick:174,side:'negative-z',
   actualRapierBody:[.17371968924999237,3.8966126441955566,-54.21735382080078]});
  expect(v.originalSourceSolidId)
   .toBe('UndertowT21D:first-drop-landing-negative-z');
  expect(v.originalFootInsideXZ).toBe(true);
  expect(v.originalSourceAuthority).toEqual([25,17,26,0]);
 });
 it('rejects nonnative/fabricated coordinates rather than granting route approval',()=>{
  expect(()=>inspect({nativeTick:-1,side:'positive-z',
   actualRapierBody:[0,3,54]})).toThrow('T21_B120_ORIGINAL_NATIVE_SOURCE_AUTHORITY_INVALID');
  expect(()=>inspect({nativeTick:1,side:'positive-z',
   actualRapierBody:[NaN,3,54]})).toThrow('T21_B120_ORIGINAL_NATIVE_SOURCE_AUTHORITY_INVALID');
 });
});
