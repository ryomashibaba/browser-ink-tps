import {describe,it,expect,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team,SurfaceFlags} from '../ink/types';
import type {GameplayInkSystem,GameplayInkSample} from '../ink/GameplayInkSystem';
import {rankOriginalSourcePatrolGoals,prioritizeExistingInFlightSourceGoal} from './UndertowF3PaintAwarePatrol';

const goals=[new Vec3(1,3,40),new Vec3(2,3,41),
 new Vec3(3,3,42),new Vec3(4,3,43)];
function ownerInk(owners:readonly (Team|null)[]){
 const sampleWorld=vi.fn((p:Vec3,range:number,required:number)=>{
  expect(range).toBe(.38);
  expect(required).toBe(SurfaceFlags.Paintable);
  const idx=p.x-1;
  const owner=owners[idx];
  return owner===null?null:{owner,planeDistance:0} as GameplayInkSample;
 });
 return {system:{sampleWorld} as unknown as GameplayInkSystem,sampleWorld};
}
describe('W10-B31 authoritative source-ink-aware CPU patrol only',()=>{
 it('prioritizes genuine enemy/neutral ownerGrid ahead of already-own ink',()=>{
  const ink=ownerInk([Team.A,Team.Neutral,Team.B,Team.A]);
  const r=rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,0);
  expect(r.map(v=>v.index)).toEqual([2,1,0,3]);
  expect(r.map(v=>v.priority)).toEqual(['OTHER_TEAM','NEUTRAL','OWN','OWN']);
  expect(ink.sampleWorld).toHaveBeenCalledTimes(4);
  expect(r.every(v=>v.sourceOnly&&!v.pathAuthorized)).toBe(true);
 });
 it('samples only pre-existing positions, never fabricates source goals',()=>{
  const ink=ownerInk([Team.Neutral,null,Team.A,Team.Neutral]);
  const r=rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,3);
  expect(r).toHaveLength(goals.length);
  expect(r.map(x=>x.index)).toEqual([3,0,1,2]);
  for(let i=0;i<goals.length;i++){
   expect(goals[i]!.y).toBe(3);
   expect(goals[i]!.z).toBe(40+i);
  }
  expect(ink.sampleWorld.mock.calls.every(([p])=>p.y===3.06)).toBe(true);
 });
 it('keeps deterministic round-robin tie order and skips missing paint evidence',()=>{
  const ink=ownerInk([null,null,null,null]);
  const r=rankOriginalSourcePatrolGoals(goals,Team.B,ink.system,2);
  expect(r.map(x=>x.index)).toEqual([2,3,0,1]);
  expect(r.every(x=>x.priority==='UNSAMPLED')).toBe(true);
  expect(()=>rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,-1))
   .toThrow('W10_B31_UNVERIFIED_START_INDEX');
 });
});

describe('W10-B33 prior original goal hysteresis, not fabricated Nav',()=>{
 it('holds an in-flight PREAPPROVED goal before ownership priority',()=>{
  const ink=ownerInk([Team.A,Team.Neutral,Team.B,Team.A]);
  const ranks=rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,0);
  const before=ranks.map(x=>x.index);
  const held=prioritizeExistingInFlightSourceGoal(
   ranks,goals,0,new Vec3(-10,3,42));
  expect(before).toEqual([2,1,0,3]);
  expect(held.map(x=>x.index)).toEqual([0,2,1,3]);
  expect(held).toHaveLength(ranks.length);
  expect(held[0]!.pathAuthorized).toBe(false);
  expect(ranks.map(x=>x.index)).toEqual(before);
 });
 it('reranks after genuine foot arrival, preserving typed source candidates',()=>{
  const ink=ownerInk([Team.A,Team.Neutral,Team.B,Team.A]);
  const ranks=rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,0);
  const arrived=prioritizeExistingInFlightSourceGoal(
   ranks,goals,0,new Vec3(1.3,3,40));
  expect(arrived.map(x=>x.index)).toEqual([2,1,0,3]);
  expect(prioritizeExistingInFlightSourceGoal(
   ranks,goals,-1,new Vec3(0,3,0))).toEqual(ranks);
 });
 it('invalid real foot cannot grant any synthetic route or preference',()=>{
  const ink=ownerInk([Team.A,Team.Neutral,Team.B,Team.A]);
  const ranks=rankOriginalSourcePatrolGoals(goals,Team.A,ink.system,0);
  expect(prioritizeExistingInFlightSourceGoal(
   ranks,goals,0,new Vec3(Number.NaN,3,0))).toEqual(ranks);
 });
});
