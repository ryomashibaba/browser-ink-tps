import {describe,it,expect} from 'vitest';
import {B76HumanSourceCoach,type B76HumanSourceFrame}
 from './UndertowF3HumanInkCoach';
const make=(tick=100,shots=0,cells=0,dry=0):B76HumanSourceFrame=>({
 tick,shotsFired:shots,inkDryFireAttempts:dry,
 matchState:'PLAYING',paused:false,stopReason:null,
 player:{mode:'HUMAN',ink:100},
 b23HumanInkFeedback:{humanChangedCells:cells},
 playerInkRecoveryState:'HUMAN',
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,
 sourceScoreablePromotions:0,productionAuthorized:false,
 unrestricted4v4Certified:false
});
describe('W10-B76 genuine human source-ink skill feedback and refill UX',()=>{
 it('only credits actual raster-changed original Human Impact cells',()=>{
  const c=new B76HumanSourceCoach();
  expect(c.observe(make(100,7,200))).toMatchObject({
   state:'NO_RECENT_INPUT',humanAcceptedShots3s:0,
   actualHumanChangedCells3s:0,actualHumanInkTotal:200});
  expect(c.observe(make(130,10,245))).toMatchObject({
   state:'REAL_SOURCE_PAINT',humanAcceptedShots3s:3,
   actualHumanChangedCells3s:45});
  expect(c.observe(make(130,10,245))).toMatchObject({
   humanAcceptedShots3s:3,actualHumanChangedCells3s:45});
  expect(c.observe(make(131,11,245))).toMatchObject({
   humanAcceptedShots3s:4,actualHumanChangedCells3s:45});
  expect(c.observe(make(311,12,245))).toMatchObject({
   humanAcceptedShots3s:1,actualHumanChangedCells3s:0,
   state:'SHOT_WITHOUT_NEW_PAINT'});
 });
 it('shows dry fire and real own-ink Squid recovery without faking ink',()=>{
  const c=new B76HumanSourceCoach();
  c.observe(make(100,0,0));
  expect(c.observe({...make(120,2,0,2),player:{mode:'HUMAN',ink:8},
   playerInkRecoveryState:'LOCKED'})).toMatchObject({
   state:'DRY_FIRE',dryFireAttempts3s:2,
   humanAcceptedShots3s:2,actualHumanChangedCells3s:0});
  expect(c.observe({...make(310,2,0,2),player:{mode:'SQUID',ink:14},
   playerInkRecoveryState:'SQUID_OWN'})).toMatchObject({
   state:'REFILLING_ON_OWN_INK',dryFireAttempts3s:0});
  expect(c.observe({...make(330,2,0,2),player:{mode:'SQUID',ink:37},
   playerInkRecoveryState:'SQUID_OWN'})).toMatchObject({
   state:'NO_RECENT_INPUT',playerInkPercent:37});
 });
 it('does not turn no-hit shots into hit-rate or official Turf',()=>{
  const c=new B76HumanSourceCoach();c.observe(make());
  expect(c.observe(make(150,5,0))).toMatchObject({
   state:'SHOT_WITHOUT_NEW_PAINT',inferredProjectileHitRate:false,
   officialWinner:'NONE',originalScoreableSurfaces:0,
   original4v4Certified:false});
 });
 it('rejects any provenance mismatch or regressed clocks/counters',()=>{
  const c=new B76HumanSourceCoach();c.observe(make(200,5,23));
  const invalid=[{...make(201,5,24),sourceScoreablePromotions:1},
   {...make(201,5,24),productionAuthorized:true},
   {...make(199,5,24)},
   {...make(202,4,24)},
   {...make(202,6,22)},
   {...make(202,6,24),originalSourceNavigationLinks:27}];
  for(const f of invalid){
   expect(c.observe(f)?.state).toBe('HOLD');
   c.observe(make(200,5,23));
  }
 });
 it('does not display fabricated counters for older HUD test fixtures',()=>{
  const c=new B76HumanSourceCoach();
  expect(c.observe({matchState:'STAGING',paused:false,stopReason:null,
   player:{mode:'HUMAN',ink:100},shotsFired:0,
   sourceScoreablePromotions:0,productionAuthorized:false})).toBeNull();
 });
});
