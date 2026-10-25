import {describe,it,expect} from 'vitest';
import {rankB169OriginalAdvanceGuardGoals as rank} from './B169OriginalAllyAdvanceGuard';
const p=(x:number,y:number,z:number)=>({x,y,z});
const base=()=>({
 enabled:true,allySyncPracticeRunning:true,
 humanGrounded:true,humanActive:true,
 realUpperHumanFoot:p(0,8.39,66),realLowerA1Foot:p(2,3.9,51),
 authoredHumanDropLanding:p(0,3,49),
 alreadyAuditedOriginalPatrolFeet:[p(3,3.9,53),p(2,3.9,51.5),
  p(7,3.9,56),p(1,3.9,49)]
});
describe('B169 original human approach and genuine A1 lower guard',()=>{
 it('ranks existing authentic patrol feet and avoids the authored drop',()=>{
  const x=base(),result=rank(x);
  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(x.alreadyAuditedOriginalPatrolFeet[0]);
  expect(result.every(g=>x.alreadyAuditedOriginalPatrolFeet.includes(g))).toBe(true);
  expect(result).not.toContainEqual(p(1,3.9,49));
 });
 it('B196 opts in ONLY to reorder existing audited source feet near original landing',()=>{
  const x=base();
  const legacy=rank(x);
  const coOp=rank({...x,preferPlayableCoopNearGuard:true});
  expect(legacy[0]).toEqual(p(3,3.9,53));
  expect(coOp[0]).toEqual(p(2,3.9,51.5));
  expect(coOp).toHaveLength(legacy.length);
  expect(coOp.every(g=>x.alreadyAuditedOriginalPatrolFeet.includes(g))).toBe(true);
  expect(coOp).not.toContainEqual(p(1,3.9,49));
  expect(rank({...x,preferPlayableCoopNearGuard:true,
   alreadyAuditedOriginalPatrolFeet:[]})).toEqual([]);
 });
 it('B198 refuses real-player first-drop ingress blockers on original source',()=>{
  const original=base();
  const laneBlock=p(.2,3.9,53.2);
  const safeLateral=p(2.3,3.9,52);
  const unsafeInventory={...original,alreadyAuditedOriginalPatrolFeet:[
   laneBlock,safeLateral
  ]};
  // Legacy experiment remains unchanged and can return this source foot;
  // actual user-selected B193 MUST deny the potential human KCC blocker.
  expect(rank(unsafeInventory)).toContainEqual(laneBlock);
  const result=rank({...unsafeInventory,preferPlayableCoopNearGuard:true});
  expect(result).not.toContainEqual(laneBlock);
  expect(result).toEqual([safeLateral]);
  expect(rank({...unsafeInventory,preferPlayableCoopNearGuard:true,
   alreadyAuditedOriginalPatrolFeet:[laneBlock]})).toEqual([]);
 });
 it('B198 exclusion never becomes an invented source path or CPU position',()=>{
  const x=base();
  const result=rank({...x,preferPlayableCoopNearGuard:true});
  expect(result.every(goal=>x.alreadyAuditedOriginalPatrolFeet.includes(goal))).toBe(true);
  expect(result.every(goal=>goal.z>=33&&goal.y>=2.7&&goal.y<=5.25)).toBe(true);
  expect(rank({...x,preferPlayableCoopNearGuard:true,
   realUpperHumanFoot:p(0,8.39,49)})).toEqual([]);
 });
 it('only arms with a grounded live human on the source upper area',()=>{
  const x=base();
  expect(rank({...x,realUpperHumanFoot:p(0,3.9,48)})).toEqual([]);
  expect(rank({...x,humanGrounded:false})).toEqual([]);
  expect(rank({...x,humanActive:false})).toEqual([]);
  expect(rank({...x,enabled:false})).toEqual([]);
  // B139 ally opt-in alone must not enable B169 prepositioning.
  expect(rank({...x,allySyncPracticeRunning:false})).toEqual([]);
 });
 it('refuses opposing zones, invalid goals and wrong elevations',()=>{
  const x=base();
  expect(rank({...x,realLowerA1Foot:p(2,3.9,-55)})).toEqual([]);
  expect(rank({...x,alreadyAuditedOriginalPatrolFeet:[
   p(0,3.9,48),p(0,3.9,-51),p(5,12,54),p(NaN,3.9,53)]})).toEqual([]);
 });
 it('cannot fabricate a target when none is in the source inventory',()=>{
  const x=base();
  expect(rank({...x,alreadyAuditedOriginalPatrolFeet:[]})).toEqual([]);
  expect(x.alreadyAuditedOriginalPatrolFeet).toHaveLength(4);
 });
});
