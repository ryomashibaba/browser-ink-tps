import {describe,it,expect} from 'vitest';
import {b464RealSourceFrontlineView} from './B464PlayableSourceFrontlineHud';
const evidence=()=>({
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false,
 matchState:'PLAYING',stopReason:null,
 cpu:{cpu:['A1','A2','A3','B1','B2','B3','B4'].map(id=>({id})),
  sourcePatrol:{
   b441Enabled:true,b448A3ResearchEnabled:true,
   b441ProposalsChecked:131,b441StrictGoalsAvailable:6,
   b441ActualGoalRequests:12,b441UnsafeOrUnreachableHolds:125,
   b443FirstActualFrontlineArrivals:3,
   b448A3FreshLiveOriginalGoalsAuthorized:5,
   b448A3RealNativeGoalRequests:4
  }}
});
describe('B464 real player-visible optional native CPU frontline',()=>{
 it('shows real source-authorized CPU metrics, not a Turf winner',()=>{
  const v=b464RealSourceFrontlineView(evidence());
  expect(v).toMatchObject({status:'LIVE',nativeGoalsRequested:12,
   safeOriginalCandidates:6,heldUnreachableOrUnsafe:125,
   actualOriginalArrivals:3,actualA3Requests:4,
   originalOpponentRoutesCertified:0,originalOfficialScoreable:0,
   officialWinner:'NONE',productionAuthorized:false});
  expect(v?.lines).toContain('REQUEST ≠ ARRIVAL');
  expect(v?.lines).toContain('0/12');
  expect(v?.lines).not.toContain('TEAM_A_WINS');
 });
 it('preserves true STAGING and TIME_UP modes, and stop HOLD',()=>{
  const s=evidence();
  s.matchState='STAGING';expect(b464RealSourceFrontlineView(s)?.status).toBe('READY');
  s.matchState='TIME_UP';expect(b464RealSourceFrontlineView(s)?.status).toBe('TIME_UP');
  s.stopReason='ORIGINAL_ROUTE_BLOCKED';
  expect(b464RealSourceFrontlineView(s)?.status).toBe('HOLD');
 });
 it('never displays fabricated score, CPU, normal patrol or unsupported paths',()=>{
  const edits:Array<(s:ReturnType<typeof evidence>)=>void>=[
   s=>{s.originalSourceSolids=26},
   s=>{s.sourceScoreablePromotions=1},
   s=>{s.productionAuthorized=true},
   s=>{s.unrestricted4v4Certified=true},
   s=>{s.cpu.cpu.pop()},
   s=>{s.cpu.cpu[0].id='A2'},
   s=>{s.cpu.sourcePatrol.b441Enabled=false},
   s=>{s.cpu.sourcePatrol.b448A3ResearchEnabled=false},
   s=>{s.cpu.sourcePatrol.b441ActualGoalRequests=-1},
   s=>{s.cpu.sourcePatrol.b443FirstActualFrontlineArrivals=NaN},
   s=>{s.cpu.sourcePatrol.b441UnsafeOrUnreachableHolds=Infinity}
  ];
  for(const edit of edits){
   const s=evidence();edit(s);
   expect(b464RealSourceFrontlineView(s)).toBeNull();
  }
 });
});
