import {describe,it,expect} from 'vitest';
import {describeB141RealOriginalAlly as inspect,type B141AllyNativeView}
 from './UndertowF3OriginalAllyProximity';
function sample():B141AllyNativeView{
 return {
  matchState:'PLAYING',player:{position:[0,8.395,65],hp:100},
  cpu:{physicalRejoins:['A1','A2','A3','B1','B2','B3','B4'],
   cpu:[{id:'A1',physicalFoot:[7.77,4.47,52],mobilityState:'GROUND'}],
   sourcePatrol:{b137AllyRallyOptIn:true,b137ApprovedNativeRallies:0}},
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false
 };
}
const view=(s:B141AllyNativeView)=>inspect(s,.8);
describe('B141 source practice teammate real physical orientation',()=>{
 it('makes native upper-vs-lower mismatch obvious without claiming route',()=>{
  const x=view(sample());
  expect(x.code).toBe('A1_BELOW');
  expect(x.actualVerticalFootGapMeters).toBeCloseTo(3.125,3);
  expect(x.text).toContain('route unverified');
  expect(x.currentRouteCertified).toBe(false);
 });
 it('cannot appear in default FIXED or unsupported original stage',()=>{
  const n=sample();n.cpu.sourcePatrol.b137AllyRallyOptIn=false;
  expect(view(n).code).toBe('OFF');
  const altered=sample();altered.sourceScoreablePromotions=1;
  expect(view(altered).code).toBe('SOURCE_HOLD');
 });
 it('only uses actually available released and grounded real foot',()=>{
  const n=sample();n.cpu.physicalRejoins.length=0;
  expect(view(n).code).toBe('WAITING_7_CPU');
  const absent=sample();absent.cpu.cpu[0]!.physicalFoot=[NaN,4,52];
  expect(view(absent).code).toBe('MISSING_REAL_FOOT');
  const ungrounded=sample();ungrounded.cpu.cpu[0]!.mobilityState='AIR';
  expect(view(ungrounded).code).toBe('A1_NOT_GROUNDED');
 });
 it('historical goal count never becomes live route or arrival proof',()=>{
  const n=sample();
  n.player.position=[0,3.9,49];
  expect(view(n).code).toBe('SAME_LEVEL_UNPROVEN');
  n.cpu.sourcePatrol.b137ApprovedNativeRallies=4;
  expect(view(n).code).toBe('HISTORICAL_GOAL_REQUEST');
  expect(view(n).physicalMeetingCertified).toBe(false);
  n.player.position=[7,3.9,52];
  expect(view(n).code).toBe('CLOSE_XZ');
 });
});
