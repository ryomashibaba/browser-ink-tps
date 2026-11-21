import {describe,it,expect} from 'vitest';
import {B401NativeLiveSourceInkOwnership,b401SourceHudLine,b401ReplaceSourceGridFooter,b401F4RegisteredPaintedCellLead} from './B401NativeLiveSourceInkOwnership';
import type {B400SourceGrid} from './B400RealOriginalSourceGridRecap';
const stage=[25,17,26,0] as const;
const grid=(id:string,raw:number[]=[0,0,0,0]):B400SourceGrid=>({
 id,widthCells:2,heightCells:2,isScoreable:false,
 ownerGrid:new Int8Array(raw),isCellActive:()=>true
});
const all=(a:B400SourceGrid)=>[a,...Array.from({length:16},(_,i)=>grid('orig-'+i))];
describe('B401 live SOURCE-only grid ownership',()=>{
 it('samples actual changing ownership only every 120 native ticks',()=>{
  const first=grid('real',[1,-1,0,1]),source=all(first);
  const measure=new B401NativeLiveSourceInkOwnership();
  expect(measure.observe(source,stage,0,'STAGING',true).status).toBe('WAITING');
  const a=measure.observe(source,stage,1,'STAGING',true);
  expect(a).toMatchObject({status:'LIVE_REGISTERED_SOURCE_ONLY',
   totalActiveCells:68,teamA:2,teamB:1,neutral:65,
   officialTurfScore:false,winner:'NONE',gameplayWrites:0});
  (first.ownerGrid as Int8Array)[2]=1;
  expect(measure.observe(source,stage,100,'PLAYING',true)).toEqual(a);
  const b=measure.observe(source,stage,121,'PLAYING',true);
  expect(b.teamA).toBe(3);expect(b.neutral).toBe(64);
  expect(Array.from(first.ownerGrid)).toEqual([1,-1,1,1]);
  expect(b.aPercent+b.bPercent+b.neutralPercent).toBeCloseTo(100,8);
 });
 it('takes one exact final original OwnerGrid snapshot at genuine TIME_UP',()=>{
  const first=grid('source',[1,0,0,0]),gs=all(first);
  const m=new B401NativeLiveSourceInkOwnership();
  const atStart=m.observe(gs,stage,10750,'PLAYING',true);
  expect(atStart.teamA).toBe(1);
  (first.ownerGrid as Int8Array)[1]=-1;
  // 50 ticks is less than the ordinary 120-tick sample interval.
  const last=m.observe(gs,stage,10800,'TIME_UP',true);
  expect(last).toMatchObject({
   status:'LIVE_REGISTERED_SOURCE_ONLY',
   reason:'FINAL_NATIVE_SOURCE_OWNER_GRID',
   sampleNativeTick:10800,teamA:1,teamB:1,
   officialTurfScore:false,winner:'NONE',gameplayWrites:0
  });
  expect(b401SourceHudLine(last)).toContain('FINAL SOURCE GRID');
  (first.ownerGrid as Int8Array)[2]=1;
  expect(m.observe(gs,stage,10800,'TIME_UP',true)).toBe(last);
  expect(m.observe(gs,stage,10801,'TIME_UP',true)).toBe(last);
  expect(last.teamA).toBe(1);
  const clock='TIME COMPLETE\n'+b401SourceHudLine(last)+'NO OFFICIAL WINNER';
  expect(b401ReplaceSourceGridFooter(clock,last)).toBe(clock);
  expect(b401ReplaceSourceGridFooter(clock,last).split('FINAL SOURCE GRID').length)
   .toBe(2);
  expect(b401ReplaceSourceGridFooter(clock,last).endsWith('NO OFFICIAL WINNER'))
   .toBe(true);
 });
 it('requires a genuine full native timeline and refuses false TIME_UP',()=>{
  const m=new B401NativeLiveSourceInkOwnership(),g=all(grid('source'));
  expect(m.observe(g,stage,9999,'TIME_UP',true).status).toBe('WAITING');
  expect(m.observe(g,stage,10800,'TIME_UP',false).status).toBe('WAITING');
  const live=m.observe(g,stage,10000,'PLAYING',true);
  expect(live.status).toBe('LIVE_REGISTERED_SOURCE_ONLY');
  expect(m.observe(g,stage,10000,'TIME_UP',true)).toBe(live);
  expect(m.observe(g,stage,9999,'PLAYING',true)).toBe(live);
 });
 it('refuses guessed stage, unscored constraints, fake phase, and invalid owners',()=>{
  const reader=new B401NativeLiveSourceInkOwnership(),source=all(grid('real'));
  expect(reader.observe(source,stage,1,'PLAYING',false).status).toBe('WAITING');
  expect(reader.observe(source,stage,1,'TIME_UP',true).status).toBe('WAITING');
  expect(reader.observe(source,[25,17,26,1],1,'PLAYING',true).status).toBe('HOLD');
  expect(new B401NativeLiveSourceInkOwnership().observe(
   all(grid('real',[0,2,0,0])),stage,1,'PLAYING',true).status).toBe('HOLD');
  expect(new B401NativeLiveSourceInkOwnership().observe(
   all({...grid('real'),isScoreable:true}),stage,1,'PLAYING',true).status).toBe('HOLD');
 });
});

describe('B401 genuine low-FPS SOURCE HUD refresh contract',()=>{
 it('samples 120 native ticks apart but never invents an intermediate sample',()=>{
  const m=new B401NativeLiveSourceInkOwnership();
  const g=grid('source',[1,0,0,0]),gs=all(g);
  expect(m.observe(gs,stage,1,'PLAYING',true).sampleNativeTick).toBe(1);
  (g.ownerGrid as Int8Array)[1]=-1;
  expect(m.observe(gs,stage,120,'PLAYING',true).sampleNativeTick).toBe(1);
  const real=m.observe(gs,stage,121,'PLAYING',true);
  expect(real).toMatchObject({sampleNativeTick:121,teamB:1,gameplayWrites:0});
  expect(m.observe(gs,stage,239,'PLAYING',true)).toBe(real);
  expect(m.observe(gs,stage,241,'PLAYING',true).sampleNativeTick).toBe(241);
 });
 it('updates only the real SOURCE grid section and preserves unscored match authority',()=>{
  const m=new B401NativeLiveSourceInkOwnership();
  const g=grid('source',[1,0,0,0]),gs=all(g);
  const first=m.observe(gs,stage,1,'PLAYING',true);
  const original='FULL SOURCE ROUND · UNSCORED\n01:00 · PLAYING\n'+
   b401SourceHudLine(first)+'NO OFFICIAL WINNER';
  (g.ownerGrid as Int8Array)[1]=-1;
  const second=m.observe(gs,stage,121,'PLAYING',true);
  const updated=b401ReplaceSourceGridFooter(original,second);
  expect(updated).toContain('01:00 · PLAYING');
  expect(updated).toContain(' / B 1 / NEUTRAL ');
  expect(updated).toContain('TICK 121 · NOT TURF SCORE');
  expect(updated.split('LIVE SOURCE GRID ·').length).toBe(2);
  expect(updated.endsWith('NO OFFICIAL WINNER')).toBe(true);
  expect(b401ReplaceSourceGridFooter('unrelated text',second)).toBe('unrelated text');
  expect(b401ReplaceSourceGridFooter(updated,second)).toBe(updated);
 });
});

describe('F4 real registered-cell lead is information, never a turf result',()=>{
 it('shows an actual registered-cell difference and final updates only',()=>{
  const m=new B401NativeLiveSourceInkOwnership();
  const floor=grid('source',[1,1,-1,0]),gs=all(floor);
  const first=m.observe(gs,stage,1,'PLAYING',true);
  expect(b401F4RegisteredPaintedCellLead(first))
   .toContain('TEAM A +1 REGISTERED CELLS');
  expect(b401SourceHudLine(first,true)).toContain('F4 PAINTED GRID');
  expect(b401SourceHudLine(first)).not.toContain('F4 PAINTED GRID');
  const before='F4 TERRAIN RESEARCH · UNSCORED\n'+
   b401SourceHudLine(first,true)+'NO OFFICIAL WINNER';
  // A=2/B=1 initially. Paint the one remaining neutral cell for B,
  // so the true second 120-tick sample becomes A=2/B=2 (even).
  (floor.ownerGrid as Int8Array)[3]=-1;
  const next=m.observe(gs,stage,121,'PLAYING',true);
  const updated=b401ReplaceSourceGridFooter(before,next,true);
  expect(updated).toContain('EVEN REGISTERED CELLS');
  expect(updated.split('F4 PAINTED GRID').length).toBe(2);
  expect(updated.split('LIVE SOURCE GRID').length).toBe(2);
  expect(updated.endsWith('NO OFFICIAL WINNER')).toBe(true);
  expect(b401ReplaceSourceGridFooter(updated,next,true)).toBe(updated);
  expect(m.get().officialTurfScore).toBe(false);
  expect(m.get().winner).toBe('NONE');
 });
 it('never invents official or partial SOURCE evidence from a bad grid',()=>{
  const m=new B401NativeLiveSourceInkOwnership();
  const first=m.observe(all(grid('source')),stage,1,'PLAYING',true);
  expect(b401F4RegisteredPaintedCellLead(first))
   .toContain('NO PAINT YET');
  for(const corrupt of [
   {status:'HOLD'},{registeredSurfaces:16},{winner:'A'},
   {officialTurfScore:true},{productionAuthorized:true},{gameplayWrites:1},
   {teamA:-1},{neutral:999},{teamA:NaN},{totalActiveCells:0}
  ]){
   expect(b401F4RegisteredPaintedCellLead(
    {...first,...corrupt} as typeof first)).toBeNull();
  }
 });
});
