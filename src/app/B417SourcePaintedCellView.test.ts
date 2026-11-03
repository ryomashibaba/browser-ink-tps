import {describe,it,expect} from 'vitest';
import {b417RealSourcePaintedCellView}
 from './B417SourcePaintedCellView';
import type {B401LiveState} from './B401NativeLiveSourceInkOwnership';
const source=[25,17,26,0] as const;
function live():B401LiveState{
 return {status:'LIVE_REGISTERED_SOURCE_ONLY',
  reason:'REAL_NATIVE_PAINT_SURFACE_OWNERS',sampleNativeTick:6500,
  registeredSurfaces:17,totalActiveCells:1000,
  teamA:100,teamB:400,neutral:500,
  aPercent:10,bPercent:40,neutralPercent:50,
  originalSourceOnly:true,officialTurfScore:false,winner:'NONE',
  gameplayWrites:0,productionAuthorized:false};
}
describe('real SOURCE painted-cell match feedback, not official Turf scoring',()=>{
 it('uses actual 17-grid owner counts and labels no official result',()=>{
  const v=b417RealSourcePaintedCellView(live(),6580,source,true)!;
  expect(v.teamA).toBe(100);
  expect(v.teamB).toBe(400);
  expect(v.registeredCells).toBe(1000);
  expect(v.aSharePaintedPercent).toBe(20);
  expect(v.bSharePaintedPercent).toBe(80);
  expect(v.nativeAgeTicks).toBe(80);
  expect(v.label).toContain('UNSCORED / NO TURF RESULT');
  expect(v.officialWinner).toBe('NONE');
  expect(v.gameplayWrites).toBe(0);
 });
 it('hide on any invalid SOURCE, replay, stale sample, fake winner or scoreable',()=>{
  const raw=live();
  expect(b417RealSourcePaintedCellView(raw,1,source,true)).toBe(null);
  expect(b417RealSourcePaintedCellView(raw,7000,source,true)).toBe(null);
  expect(b417RealSourcePaintedCellView(raw,6580,[25,17,26,1],true)).toBe(null);
  expect(b417RealSourcePaintedCellView(raw,6580,source,false)).toBe(null);
  for(const modified of [
   {teamA:900},{teamB:-1},{registeredSurfaces:16},
   {officialTurfScore:true},{winner:'A'},{gameplayWrites:1},
   {originalSourceOnly:false},{productionAuthorized:true},
   {status:'HOLD'},{aPercent:20},{sampleNativeTick:7000}
  ]){
   const fabricated={...raw,...modified} as B401LiveState;
   expect(b417RealSourcePaintedCellView(fabricated,6580,source,true)).toBe(null);
  }
 });
 it('zero actual painted cells show zero share, not an invented winner',()=>{
  const data={...live(),teamA:0,teamB:0,neutral:1000,
   aPercent:0,bPercent:0,neutralPercent:100};
  const v=b417RealSourcePaintedCellView(data,6501,source,true)!;
  expect(v.aSharePaintedPercent).toBe(0);
  expect(v.bSharePaintedPercent).toBe(0);
  expect(v.officialTurfScore).toBe(false);
 });
});
