import {describe,it,expect,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team,SurfaceFlags} from '../ink/types';
import {GameplayInkSystem,type GameplayInkSample} from '../ink/GameplayInkSystem';
import {PaintSurface} from '../ink/PaintSurface';
import {rankOriginalSourcePatrolGoals,existingOriginalSourceInkOpportunity,prioritizeExistingInFlightSourceGoal,mayReconsiderStalledOriginalGoal,B34_GROUNDED_STALL_TICKS,distributeOriginalSourceGoalCoverage} from './UndertowF3PaintAwarePatrol';

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

describe('W10-B34 genuine 36-tick original-foot stalled-goal escape gate',()=>{
 it('does not permit alternative before 36 continuous grounded-stationary observations',()=>{
  expect(B34_GROUNDED_STALL_TICKS).toBe(36);
  for(let steps=0;steps<36;steps++)
   expect(mayReconsiderStalledOriginalGoal(steps,0,8)).toBe(false);
  expect(mayReconsiderStalledOriginalGoal(36,0,8)).toBe(true);
 });
 it('never manufactures a new goal for already arrived or absent original goals',()=>{
  expect(mayReconsiderStalledOriginalGoal(100,-1,8)).toBe(false);
  expect(mayReconsiderStalledOriginalGoal(100,0,1.49)).toBe(false);
  expect(mayReconsiderStalledOriginalGoal(100,0,Number.NaN)).toBe(false);
  expect(mayReconsiderStalledOriginalGoal(-1,0,8)).toBe(false);
  expect(mayReconsiderStalledOriginalGoal(36.5,0,8)).toBe(false);
 });
});

describe('native original paint coverage priority improves actual CPU floor patrol',()=>{
 it('prefers the genuinely unpainted neighborhood over an already fully painted source floor goal',()=>{
  // A complete real owner-grid is the sole paint authority. Both existing
  // candidates have an OWN center, but only the first has four fresh
  // ORIGINAL source cells nearby. No extra CPU goal or scoreable surface.
  const ink=new GameplayInkSystem();
  const source=new PaintSurface(
   'UndertowT21D:right-low-team-a:paint',
   new Vec3(0,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   20,20,.25,SurfaceFlags.Paintable|SurfaceFlags.Floor,8
  );
  ink.registerSurface(source);
  source.ownerGrid.fill(Team.A);
  const g=[new Vec3(-4,3,-4),new Vec3(4,3,4)];
  for(const [dx,dz,owner] of [
   [.75,0,Team.Neutral],[-.75,0,Team.B],
   [0,.75,Team.Neutral],[0,-.75,Team.B]
  ] as const){
   const observed=ink.sampleWorld(
    new Vec3(g[0]!.x+dx,3.06,g[0]!.z+dz),
    .38,SurfaceFlags.Paintable
   )!;
   source.ownerGrid[source.index(
    Math.floor(observed.u/source.cellSize),
    Math.floor(observed.v/source.cellSize))]=owner;
  }
  const frozen=Array.from(source.ownerGrid);
  const result=rankOriginalSourcePatrolGoals(g,Team.A,ink,1);
  expect(result.map(r=>r.index)).toEqual([0,1]);
  expect(result.every(r=>r.priority==='OWN')).toBe(true);
  expect(result[0]!.neighborhoodOpportunity).toBeGreaterThan(
   result[1]!.neighborhoodOpportunity);
  expect(result.every(r=>r.sampledOriginalCells===5)).toBe(true);
  expect(result.every(r=>!r.pathAuthorized&&r.sourceOnly)).toBe(true);
  // Existing B471 C-order used to drop BOTH because their centers OWN.
  // Only first has actual same-surface enemy/neutral original neighbors.
  expect(existingOriginalSourceInkOpportunity(result[0]!)).toBe(true);
  expect(existingOriginalSourceInkOpportunity(result[1]!)).toBe(false);
  expect(Array.from(source.ownerGrid)).toEqual(frozen);
  expect(ink.snapshot().areaA).toBe(0);
 });
 it('rejects inactive original footprint cells from coverage; never claims navigability',()=>{
  const ink=new GameplayInkSystem();
  const source=new PaintSurface(
   'UndertowT21D:right-low-team-b:paint',
   new Vec3(0,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   6,6,.25,SurfaceFlags.Paintable,8
  );
  ink.registerSurface(source);
  source.ownerGrid.fill(Team.B);
  const p=new Vec3(-2.75,3,-2.75);
  const result=rankOriginalSourcePatrolGoals([p],Team.B,ink,0)[0]!;
  expect(result.priority).toBe('OWN');
  expect(result.sampledOriginalCells).toBeLessThan(5);
  expect(result.neighborhoodOpportunity).toBe(0);
  expect(existingOriginalSourceInkOpportunity(result)).toBe(false);
  expect(result.pathAuthorized).toBe(false);
  expect(ink.snapshot().percentB).toBe(0);
 });
});

describe('actual source PLAYER C-order neighbor ink eligibility',()=>{
 it('keeps measured neutral and opposing owner-grid centers only',()=>{
  const ranks=rankOriginalSourcePatrolGoals(goals,Team.A,
   ownerInk([Team.A,Team.Neutral,Team.B,Team.A]).system,0);
  expect(ranks.map(existingOriginalSourceInkOpportunity))
   .toEqual([true,true,false,false]);
 });
 it('rejects unobserved, fake-scoreable or non-original neighbor evidence',()=>{
  const ranks=rankOriginalSourcePatrolGoals(goals,Team.A,
   ownerInk([Team.A,null,Team.A,Team.A]).system,0);
  expect(ranks.every(r=>!existingOriginalSourceInkOpportunity(r))).toBe(true);
  const r=ranks.find(x=>x.priority==='OWN')!;
  expect(existingOriginalSourceInkOpportunity({
   ...r,neighborhoodOpportunity:1,sampledOriginalCells:1
  })).toBe(false);
  // The real rank type intentionally encodes true/false authority as
  // literals. Forge an untrusted runtime payload through an explicit cast
  // to verify that the defensive source gate still fails closed.
  const forged=(delta:Record<string,unknown>)=>
   ({...r,...delta}) as Parameters<typeof existingOriginalSourceInkOpportunity>[0];
  expect(existingOriginalSourceInkOpportunity(forged({
   neighborhoodOpportunity:1,sampledOriginalCells:2,sourceOnly:false
  }))).toBe(false);
  expect(existingOriginalSourceInkOpportunity(forged({
   neighborhoodOpportunity:1,sampledOriginalCells:2,pathAuthorized:true
  }))).toBe(false);
  expect(existingOriginalSourceInkOpportunity({
   ...r,neighborhoodOpportunity:Number.NaN,sampledOriginalCells:2
  })).toBe(false);
 });
});
describe('genuine source CPU teammates distribute already-authorized goals',()=>{
 it('diversifies equally useful existing paint goals, never invents another',()=>{
  const ranked=rankOriginalSourcePatrolGoals(goals,Team.A,
   ownerInk([Team.Neutral,Team.Neutral,Team.Neutral,Team.Neutral]).system,0);
  const before=ranked.map(x=>x.index);
  const output=distributeOriginalSourceGoalCoverage(
   ranked,goals,[new Vec3(1,3,40),new Vec3(2,3,41)]);
  expect(before).toEqual([0,1,2,3]);
  expect(output.map(x=>x.index)).toEqual([3,0,1,2]);
  expect(output.every(x=>x.sourceOnly&&!x.pathAuthorized)).toBe(true);
  expect(ranked.map(x=>x.index)).toEqual(before);
 });
 it('actual ownerGrid opportunity wins over spacing, not vice versa',()=>{
  const ranked=rankOriginalSourcePatrolGoals(goals,Team.A,
   ownerInk([Team.B,Team.A,Team.Neutral,Team.A]).system,0);
  const out=distributeOriginalSourceGoalCoverage(ranked,goals,
   [new Vec3(1,3,40)]);
  expect(out.map(x=>x.index)[0]).toBe(0);
 });
 it('ignores invalid or cross-height actor positions without adding routes',()=>{
  const ranked=rankOriginalSourcePatrolGoals(goals,Team.A,
   ownerInk([Team.Neutral,Team.Neutral,Team.Neutral,Team.Neutral]).system,0);
  expect(distributeOriginalSourceGoalCoverage(ranked,goals,
   [{x:1,y:Number.NaN,z:40},{x:1,y:30,z:40}])).toEqual(ranked);
  expect(distributeOriginalSourceGoalCoverage(ranked,goals,
   [new Vec3(1,3,40)],Number.NaN)).toEqual(ranked);
 });
});
