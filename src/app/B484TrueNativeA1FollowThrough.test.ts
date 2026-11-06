import {describe,it,expect} from 'vitest';
import {B484TrueNativeA1FollowThrough} from './B484TrueNativeA1FollowThrough';
const frame=(tick:number,foot:readonly [number,number,number])=>({
 tick,foot,mode:'GROUND',rejoined:true,originalSolidId:
 'UndertowT21D:first-drop-landing-positive-z',
 existingB471Goal:[0.31,3.1,56.45] as const,
 keyRequests:1,approvedGoals:1,nativeGoalRequests:1,
 verifiedArrivals:0,status:'MOVING' as const
});
describe('B484 real native C-key A1 source foot witness',()=>{
 it('records actual same-world foot and persists goal after HOLD',()=>{
  const s=new B484TrueNativeA1FollowThrough();
  expect(s.snapshot()).toBeNull();
  s.observe(frame(1121,[2.6,3.18,51]));
  s.observe(frame(1122,[2.5,3.14,51.2]));
  s.observe({...frame(1123,[2.4,3.1,51.3]),
   existingB471Goal:null,status:'HOLD'});
  const d=s.snapshot()!;
  expect(d).toMatchObject({nativeRows:3,
   actualNativeGoalRequests:1,originalB471VerifiedArrivals:0,
   finalCommandStatus:'HOLD',crossTeamRouteCertified:false,
   officialWinner:'NONE',actorInkPhysicsClockWrites:0});
  expect(d.closestPhysicalGoalDistanceXZ).toBeLessThan(
   d.initialGoalDistanceXZ!);
  expect(d.observedFootTravelMeters).toBeGreaterThan(0);
 });
 it('only labels original B471 physical arrival when real counter updates',()=>{
  const s=new B484TrueNativeA1FollowThrough();
  s.observe(frame(1,[.31,3.1,56.45]));
  expect(s.summary()?.originalB471VerifiedArrivals).toBe(0);
  s.observe({...frame(2,[.31,3.1,56.45]),status:'ARRIVED',
   existingB471Goal:null,verifiedArrivals:1});
  expect(s.summary()?.originalB471VerifiedArrivals).toBe(1);
  expect(s.summary()?.trueArrivalOnlyFromB471).toBe(true);
 });
 it('resets physical progress for a second genuine C command, not lifetime travel',()=>{
  const s=new B484TrueNativeA1FollowThrough();
  s.observe(frame(100,[.31,3.1,56.45]));
  s.observe({...frame(101,[.31,3.1,56.45]),
   status:'ARRIVED' as const,existingB471Goal:null,verifiedArrivals:1});
  expect(s.summary()?.currentOrderClosestPhysicalGoalDistanceXZ).toBe(0);
  s.observe({...frame(140,[5,3.1,53]),
   keyRequests:2,approvedGoals:1,nativeGoalRequests:1,
   verifiedArrivals:1,existingB471Goal:null,status:'REQUESTED' as const});
  expect(s.summary()).toMatchObject({
   genuineKeyRequests:2,currentOrderKeyRequest:2,
   currentOrderNativeRows:1,currentOrderApprovedOriginalGoal:null,
   currentOrderClosestPhysicalGoalDistanceXZ:null,
   originalB471VerifiedArrivals:1
  });
  s.observe({...frame(141,[5,3.1,52.8]),
   keyRequests:2,approvedGoals:2,nativeGoalRequests:2,
   verifiedArrivals:1,existingB471Goal:[8,3.1,48] as const,
   status:'MOVING' as const});
  const second=s.summary()!;
  expect(second.currentOrderInitialGoalDistanceXZ).toBeGreaterThan(5);
  expect(second.currentOrderClosestPhysicalGoalDistanceXZ).toBeGreaterThan(5);
  expect(second.currentOrderObservedFootTravelMeters).toBeCloseTo(.2,5);
  expect(second.currentOrderArrivalOnlyFromOriginalB471).toBe(true);
  expect(second.originalB471VerifiedArrivals).toBe(1);
  // A replayed/stale first-key observation cannot rewrite current progress.
  s.observe({...frame(142,[8,3.1,48]),keyRequests:1});
  expect(s.summary()?.lastTick).toBe(141);
 });
 it('does not accept fake key, foot, actor or duplicate physical tick',()=>{
  const s=new B484TrueNativeA1FollowThrough();
  for(const change of [
   {keyRequests:0},{rejoined:false},{mode:'AIR'},
   {foot:[NaN,3,51] as const},{existingB471Goal:[1,3,-40] as const},
   {verifiedArrivals:2},{tick:-1}
  ])s.observe({...frame(1,[1,3,51]),...change});
  expect(s.snapshot()).toBeNull();
  s.observe(frame(1,[1,3,51]));s.observe(frame(1,[99,3,99]));
  expect(s.summary()?.nativeRows).toBe(1);
  expect(s.summary()?.lastPhysicalFoot).toEqual([1,3,51]);
 });
});
