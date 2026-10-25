import {describe,it,expect} from 'vitest';
import {B217ActualNativePaintTempo} from './B217ActualNativePaintTempo';
const s=(tick:number,shots:number,paint:number,human=0)=>({
 tick,cpuSourceShots:shots,cpuImpactPaintChanges:paint,
 humanShots:human,sourceScoreable:0
});
describe('B217 live original SOURCE real native 5s telemetry',()=>{
 it('uses genuine ticks and distinct shot/paint deltas, never claimed scoring',()=>{
  const m=new B217ActualNativePaintTempo();
  expect(m.observe(s(100,2,20))).toBeNull();
  expect(m.observe(s(399,32,400))).toBeNull();
  expect(m.observe(s(400,34,403,4))).toEqual({
   fromTick:100,toTick:400,nativeTicks:300,
   genuineCpuSourceShots:32,actualCpuChangedPaintCells:383,
   realHumanShots:4,sourceScoreable:0
  });
 });
 it('a paused native simulation does not fabricate activity',()=>{
  const m=new B217ActualNativePaintTempo();
  m.observe(s(1000,40,900));m.observe(s(1300,50,1200));
  const old=m.snapshot();
  for(let i=0;i<10;i++)expect(m.observe(s(1300,50,1200))).toEqual(old);
 });
 it('resets after actual restart or counter regression',()=>{
  const m=new B217ActualNativePaintTempo();
  m.observe(s(400,34,403));m.observe(s(700,60,800));
  expect(m.snapshot()).not.toBeNull();
  expect(m.observe(s(8,0,0))).toBeNull();
  expect(m.snapshot()).toBeNull();
  expect(m.observe(s(309,2,30))).toMatchObject({
   fromTick:8,genuineCpuSourceShots:2,actualCpuChangedPaintCells:30
  });
 });
 it('refuses forged scored surfaces, invalid counters, negative changes',()=>{
  const m=new B217ActualNativePaintTempo();
  expect(m.observe({...s(20,0,0),sourceScoreable:1})).toBeNull();
  expect(m.observe(s(20,0,0))).toBeNull();
  expect(m.observe({...s(400,2,7),cpuImpactPaintChanges:NaN})).toBeNull();
  expect(m.snapshot()).toBeNull();
  m.observe(s(900,100,500));expect(m.observe(s(1201,30,600))).toBeNull();
 });
 it('zero genuine changes stay zero even if time progresses',()=>{
  const m=new B217ActualNativePaintTempo();
  m.observe(s(0,0,0));
  expect(m.observe(s(301,0,0))).toMatchObject({
   genuineCpuSourceShots:0,actualCpuChangedPaintCells:0
  });
 });
});
