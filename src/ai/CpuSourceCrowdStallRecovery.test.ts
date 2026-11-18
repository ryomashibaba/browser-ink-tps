import {describe,it,expect} from 'vitest';
import {shouldRefreshStalledOriginalSourceCrowd as should,
 SOURCE_CROWD_STALL_SECONDS,SOURCE_CROWD_BLOCK_QUIET_TICKS,
 SOURCE_CROWD_RECOVERY_AUDIT_INTERVAL_TICKS,
 SOURCE_COMMITTED_WEAPON_STEERING_GRACE_SECONDS,
 deferSourceCrowdSteeringForCommittedWeapon,
 sourceCrowdSecondRefreshEarned,
 type CpuSourceCrowdStallEvidence} from './CpuSourceCrowdStallRecovery';
const live:CpuSourceCrowdStallEvidence={
 actualFoot:{x:1,y:3,z:1},admittedGoal:{x:8,y:3,z:1},
 stationarySeconds:5.1,aliveGroundedPhysicallyRejoined:true,
 hasCrowdAgent:true,alreadyRefreshedThisLife:false,
 currentSourceTick:600,lastPhysicalBlockTick:null
};
describe('T21 V28 real-foot stalled SOURCE Crowd proxy bounded refresh',()=>{
 it('detects 1.2-second physical stationary SOURCE steering safely with distant authorized goal',()=>{
  expect(SOURCE_CROWD_STALL_SECONDS).toBe(1.2);
  expect(should(live)).toBe(true);
  // The existing QA warning remains five seconds. This SOURCE-only
  // safe review can begin at the 72-tick B4 observation boundary.
  expect(should({...live,stationarySeconds:1.199})).toBe(false);
  expect(should({...live,stationarySeconds:1.2})).toBe(true);
  expect(should({...live,admittedGoal:{x:1.8,y:3,z:1}})).toBe(false);
 });
 it('does not mask a genuine recent KCC or offmesh blocker',()=>{
  expect(SOURCE_CROWD_BLOCK_QUIET_TICKS).toBe(300);
  expect(SOURCE_CROWD_RECOVERY_AUDIT_INTERVAL_TICKS).toBe(90);
  expect(should({...live,lastPhysicalBlockTick:600})).toBe(false);
  expect(should({...live,lastPhysicalBlockTick:301})).toBe(false);
  expect(should({...live,lastPhysicalBlockTick:300})).toBe(false);
  expect(should({...live,lastPhysicalBlockTick:299})).toBe(true);
  expect(should({...live,lastPhysicalBlockTick:601})).toBe(false);
 });
 it('does not refresh a splatted/high-spawn unrejoined CPU or missing Recast proxy',()=>{
  expect(should({...live,aliveGroundedPhysicallyRejoined:false})).toBe(false);
  expect(should({...live,hasCrowdAgent:false})).toBe(false);
  expect(should({...live,admittedGoal:null})).toBe(false);
 });
 it('does not loop re-anchors within one physical CPU life',()=>{
  expect(should({...live,alreadyRefreshedThisLife:true})).toBe(false);
  // The owner explicitly clears this bit only when the real bot splats
  // and respawns after the original 150-tick physical life transition.
  expect(should({...live,alreadyRefreshedThisLife:false})).toBe(true);
 });
 it('refuses invalid actual feet, goals, and source tick evidence',()=>{
  expect(should({...live,actualFoot:{x:Infinity,y:3,z:1}})).toBe(false);
  expect(should({...live,admittedGoal:{x:8,y:NaN,z:1}})).toBe(false);
  expect(should({...live,stationarySeconds:NaN})).toBe(false);
  expect(should({...live,currentSourceTick:NaN})).toBe(false);
  expect(should({...live,lastPhysicalBlockTick:-1})).toBe(false);
 });
});

describe('SOURCE native charged-weapon idle: steering-only unlock',()=>{
 it('preserves short-lived actual charge/burst/guard and old one-per-life gate',()=>{
  expect(SOURCE_COMMITTED_WEAPON_STEERING_GRACE_SECONDS).toBe(5);
  for(const s of [0,1.2,4.999])
   expect(deferSourceCrowdSteeringForCommittedWeapon(true,s)).toBe(true);
  expect(deferSourceCrowdSteeringForCommittedWeapon(true,NaN)).toBe(true);
  expect(should({...live,alreadyRefreshedThisLife:true})).toBe(false);
 });
 it('after five true stationary seconds allows ONLY the subsequent strict physical/native route audit',()=>{
  expect(deferSourceCrowdSteeringForCommittedWeapon(true,5)).toBe(false);
  expect(deferSourceCrowdSteeringForCommittedWeapon(true,9.62)).toBe(false);
  expect(deferSourceCrowdSteeringForCommittedWeapon(false,0)).toBe(false);
  expect(should({...live,stationarySeconds:9.62,
   lastPhysicalBlockTick:590,currentSourceTick:600})).toBe(false);
  expect(should({...live,stationarySeconds:9.62,
   lastPhysicalBlockTick:null,currentSourceTick:600})).toBe(true);
 });
});

describe('SOURCE physical Crowd rearm after genuine original KCC progress',()=>{
 const ok={
  refreshTick:600,nowTick:780,refreshCount:1,
  refreshFoot:{x:0,y:3,z:0},approvedFoot:{x:2,y:3,z:0},
  groundedAndRejoined:true,realKccApproved:true
 };
 it('allows second and only second after 180 ticks and 2m in same layer',()=>{
  expect(sourceCrowdSecondRefreshEarned(ok)).toBe(true);
  for(const denial of [
   {nowTick:779},{approvedFoot:{x:1.99,y:3,z:0}},
   {approvedFoot:{x:2,y:3.31,z:0}},
   {refreshCount:2},{refreshCount:0},
   {groundedAndRejoined:false},{realKccApproved:false},
   {nowTick:NaN},{refreshTick:-1},
   {approvedFoot:{x:NaN,y:3,z:0}}
  ])expect(sourceCrowdSecondRefreshEarned({...ok,...denial})).toBe(false);
 });
});
