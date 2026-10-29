import {describe,it,expect} from 'vitest';
import {b312JudgeRealHumanSecondSurface,
 b312ValidateOriginalOwnerFrame,
 type B312RealReadOnlyFrame} from './B312NativeOriginalSecondHumanInk';
const source='UndertowT21D:spawn-high-positive-z:paint';
const landing='UndertowT21D:first-drop-landing-positive-z:paint';
const make=():B312RealReadOnlyFrame=>({
 tick:800,shots:12,humanChangedCells:380,
 humanLastImpactTick:790,humanLastPaintedSurface:source,
 source:'25/17/26/0',originalRows:Array.from({length:17},(_,i)=>({
  surfaceId:i===0?source:i===1?landing:'source-'+i,
  originalOwnedA:i===0?380:0,originalOwnedB:0,
  originalNeutral:i===0?620:1000,activeOriginalCells:1000
 }))});
describe('B312 exact original human second paint surface provenance',()=>{
 it('needs true new human hit on a distinct original surface and ownerGrid change',()=>{
  const before=make(),after=make();
  after.tick=850;after.shots=15;after.humanChangedCells=420;
  after.humanLastImpactTick=840;after.humanLastPaintedSurface=landing;
  after.originalRows[1]!.originalOwnedA=40;
  after.originalRows[1]!.originalNeutral=960;
  expect(b312JudgeRealHumanSecondSurface(before,after,landing).verdict)
   .toBe('GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS');
 });
 it('CPU-only paint, no shot, wrong impact or same-surface hit must HOLD',()=>{
  const before=make(),after=make();after.tick=850;
  after.originalRows[1]!.originalOwnedA=30;
  after.originalRows[1]!.originalNeutral=970;
  expect(b312JudgeRealHumanSecondSurface(before,after,landing).verdict)
   .toBe('HOLD_NO_PROVEN_SECOND_HUMAN_SOURCE_PAINT');
  after.shots=14;after.humanChangedCells=410;after.humanLastImpactTick=840;
  expect(b312JudgeRealHumanSecondSurface(before,after,landing).verdict)
   .toBe('HOLD_NO_PROVEN_SECOND_HUMAN_SOURCE_PAINT');
  after.humanLastPaintedSurface=landing;
  expect(b312JudgeRealHumanSecondSurface(before,after,landing).verdict)
   .toBe('GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS');
  before.humanLastPaintedSurface=landing;
  expect(b312JudgeRealHumanSecondSurface(before,after,landing).verdict)
   .toBe('HOLD_NO_PROVEN_SECOND_HUMAN_SOURCE_PAINT');
 });
 it('disallows fabricated 18th PaintSurface or changed original footprint',()=>{
  const f=make();
  expect(b312ValidateOriginalOwnerFrame(f)).toBe(true);
  expect(()=>b312ValidateOriginalOwnerFrame({...f,originalRows:f.originalRows.slice(1)}))
   .toThrow();
  const after=make();after.tick++;
  after.originalRows[1]!.activeOriginalCells=999;
  after.originalRows[1]!.originalNeutral=999;
  expect(()=>b312JudgeRealHumanSecondSurface(f,after,landing)).toThrow();
 });
});
