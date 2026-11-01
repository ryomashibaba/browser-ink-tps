import {describe,it,expect} from 'vitest';
import {B401NativeLiveSourceInkOwnership} from './B401NativeLiveSourceInkOwnership';
import type {B400SourceGrid} from './B400RealOriginalSourceGridRecap';
const stage=[25,17,26,0] as const;
const grid=(id:string,raw:number[]=[0,0,0,0]):B400SourceGrid=>({
 id,widthCells:2,heightCells:2,isScoreable:false,
 ownerGrid:new Int8Array(raw),isCellActive:()=>true
});
const all=(a:B400SourceGrid)=>[a,...Array.from({length:16},(_,i)=>grid('orig-'+i))];
describe('B401 live SOURCE-only grid ownership',()=>{
 it('samples actual changing ownership only every 180 native ticks',()=>{
  const first=grid('real',[1,-1,0,1]),source=all(first);
  const measure=new B401NativeLiveSourceInkOwnership();
  expect(measure.observe(source,stage,0,'STAGING',true).status).toBe('WAITING');
  const a=measure.observe(source,stage,1,'STAGING',true);
  expect(a).toMatchObject({status:'LIVE_REGISTERED_SOURCE_ONLY',
   totalActiveCells:68,teamA:2,teamB:1,neutral:65,
   officialTurfScore:false,winner:'NONE',gameplayWrites:0});
  (first.ownerGrid as Int8Array)[2]=1;
  expect(measure.observe(source,stage,100,'PLAYING',true)).toEqual(a);
  const b=measure.observe(source,stage,181,'PLAYING',true);
  expect(b.teamA).toBe(3);expect(b.neutral).toBe(64);
  expect(Array.from(first.ownerGrid)).toEqual([1,-1,1,1]);
  expect(b.aPercent+b.bPercent+b.neutralPercent).toBeCloseTo(100,8);
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
