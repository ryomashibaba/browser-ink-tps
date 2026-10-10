import {describe,it,expect} from 'vitest';
import {originalSourceFocusCamera} from './UndertowReviewCameraComposition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as geo} from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';
describe('T21 Phase13C source-only camera framing',()=>{
 it('focuses deterministically without gameplay authority',()=>{
  const b=geo.worldBounds,span=Math.max(b.maxX-b.minX,b.maxZ-b.minZ);
  const a=originalSourceFocusCamera(b,'OVERVIEW'),t=originalSourceFocusCamera(b,'TOP');
  expect([a.sourceOnly,t.sourceOnly,a.gameplayAuthority,t.gameplayAuthority]).toEqual([true,true,'NONE','NONE']);
  expect(a.target).toEqual([(b.minX+b.maxX)/2,8.5,(b.minZ+b.maxZ)/2]);
  expect([a.pitchDegrees,t.pitchDegrees]).toEqual([53,80]);
  expect(a.distanceMeters).toBeLessThan(Math.max(42,span*.82));
  expect(t.distanceMeters).toBeLessThan(Math.max(28,span*.72));
  expect(originalSourceFocusCamera(b,'OVERVIEW')).toEqual(a);
 });
 it('rejects invalid source extent and freezes live T20 / T21',()=>{
  expect(()=>originalSourceFocusCamera({minX:0,maxX:0,minZ:0,maxZ:1},'TOP')).toThrow();
  expect(()=>originalSourceFocusCamera({minX:NaN,maxX:2,minZ:0,maxZ:1},'OVERVIEW')).toThrow();
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(geo.activationReady).toBe(false);
 });
});
