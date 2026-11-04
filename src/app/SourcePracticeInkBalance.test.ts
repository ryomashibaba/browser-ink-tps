import {describe,it,expect} from 'vitest';
import type {B401LiveState} from './B401NativeLiveSourceInkOwnership';
import {sourcePracticeInkBalance} from './SourcePracticeInkBalance';

const genuine:B401LiveState={
 status:'LIVE_REGISTERED_SOURCE_ONLY',reason:'REAL_NATIVE_PAINT_SURFACE_OWNERS',
 sampleNativeTick:1440,registeredSurfaces:17,totalActiveCells:1000,
 teamA:210,teamB:390,neutral:400,aPercent:21,bPercent:39,
 neutralPercent:40,originalSourceOnly:true,officialTurfScore:false,
 winner:'NONE',gameplayWrites:0,productionAuthorized:false
};
const stage=[25,17,26,0] as const;
describe('F3 normal PLAYER source practice paint balance (never a winner)',()=>{
 it('renders only actual registered 17-cell ownership without making Turf score',()=>{
  const s=sourcePracticeInkBalance(genuine,stage,'PLAYING');
  expect(s).toEqual({sourceTick:1440,teamA:210,teamB:390,neutral:400,
   total:1000,aPercent:21,bPercent:39,neutralPercent:40,
   officialTurfScore:false,winner:'NONE',gameplayWrites:0});
 });
 it('requires exact original SOURCE and B401 native authority',()=>{
  expect(sourcePracticeInkBalance(genuine,[25,17,26,1],'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance(genuine,[26,17,26,0],'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance(genuine,stage,'TIME_UP')).toBeNull();
  expect(sourcePracticeInkBalance({...genuine,status:'HOLD'},stage,'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance({...genuine,sampleNativeTick:0},stage,'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance({...genuine,registeredSurfaces:16},stage,'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance({...genuine,winner:'A' as 'NONE'},stage,'PLAYING')).toBeNull();
  expect(sourcePracticeInkBalance({...genuine,officialTurfScore:true as false},stage,'PLAYING')).toBeNull();
 });
 it('rejects fake, inconsistent and invalid owner counts, including NaN',()=>{
  for(const change of [
   {teamB:400},{neutral:-1},{totalActiveCells:999},
   {teamA:NaN},{teamA:Infinity},{teamA:.5},
   {totalActiveCells:0}
  ])expect(sourcePracticeInkBalance({...genuine,...change},stage,'PLAYING')).toBeNull();
 });
});
