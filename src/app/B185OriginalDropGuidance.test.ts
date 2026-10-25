import {describe,it,expect} from 'vitest';
import {b185OriginalDropGuidance as cue} from './B185OriginalDropGuidance';
const lower={nativeTick:50,originalFootInsideXZ:true,
 originalSourceSolidId:'UndertowT21D:first-drop-landing-positive-z',
 actualHorizontalDistanceToOriginalPolygonEdgeMeters:1.7};
const upper={nativeTick:50,insideRegisteredOriginalXZFootprint:true,
 originalFlatVerticalBandWithin22cm:true,
 distanceToOriginalPolygonBoundaryMeters:.35};
describe('B185 original polygon-in-XZ player guidance',()=>{
 it('states real upper edge and registered landing footprint without promising passage',()=>{
  expect(cue('UPPER_READY',50,lower,upper)).toMatchObject({
   lowerRegisteredFootprintXZ:'INSIDE',upperOriginalEdgeDistanceMeters:.35,
   stageRouteCertification:false,lowerXZAloneProvesLanding:false
  });
  expect(cue('UPPER_READY',50,lower,upper).label).toContain('0.35m');
 });
 it('tells player when true registered lower polygon is not horizontally underneath',()=>{
  const a=cue('DESCENDING',50,{...lower,originalFootInsideXZ:false},null);
  expect(a.lowerRegisteredFootprintXZ).toBe('OUTSIDE');
  expect(a.label).toContain('real lower-floor collision still required');
 });
 it('never promotes old tick, foreign original collider or malformed geometry',()=>{
  expect(cue('UPPER_READY',51,lower,upper)).toMatchObject({
   lowerRegisteredFootprintXZ:'UNKNOWN',upperOriginalEdgeDistanceMeters:null
  });
  expect(cue('DESCENDING',50,{
   ...lower,originalSourceSolidId:'UndertowT21D:spawn-high-positive-z'
  },upper).lowerRegisteredFootprintXZ).toBe('UNKNOWN');
  expect(cue('UPPER_READY',50,lower,{
   ...upper,originalFlatVerticalBandWithin22cm:false
  }).upperOriginalEdgeDistanceMeters).toBeNull();
 });
 it('never reports original 4v4/turf authority for a local source-only clear',()=>{
  const a=cue('SOURCE_LOWER_LANDED',50,lower,upper);
  expect(a).toMatchObject({
   sourceScoreablePromotions:0,fullOriginal4v4Certified:false
  });
  expect(a.label).toContain('local practice clear only');
 });
});
