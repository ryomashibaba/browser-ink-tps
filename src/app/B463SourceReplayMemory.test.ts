import {describe,it,expect} from 'vitest';
import {B463_LOCAL_KEY,b463FromRealTimeUp,b463ReadPreviousSourceRound,
 b463FormatSourceRoundComparison} from './B463SourceReplayMemory';
const origin=1793852715204.2;
const view=()=>({finished:true,timeRemainingSeconds:0,
 cpuPhysicallyRejoined:7,genuineHumanShots:121,
 realHumanImpactInkCells:1117,actualCpuSourceShots:146,
 actualCpuImpactInkCells:11926,actualHumanSplats:0,
 actualHumanRespawns:0,officialScoreableSurfaces:0,
 officialWinner:'NONE',productionAuthorized:false});
describe('B463 real SOURCE-only non-scoring replay history',()=>{
 it('accepts actual two-180s RAW values as separate local worlds only',()=>{
  const first=b463FromRealTimeUp(view(),11856,1793851814094.9);
  expect(first?.source).toBe('25/17/26/0');
  const nextView={...view(),genuineHumanShots:19,
   realHumanImpactInkCells:112,actualCpuSourceShots:112,
   actualCpuImpactInkCells:11908};
  const second=b463FromRealTimeUp(nextView,11858,origin);
  expect(second).not.toBeNull();
  const prev=b463ReadPreviousSourceRound(JSON.stringify(first),origin);
  expect(prev).not.toBeNull();
  expect(b463ReadPreviousSourceRound(JSON.stringify(first),
   1793851814094.9)).toBeNull();
  expect(b463FormatSourceRoundComparison(prev!,second!))
   .toContain('HUMAN SHOTS 121 → 19 (-102)');
  expect(b463FormatSourceRoundComparison(prev!,second!))
   .toContain('WINNER NONE');
  expect(B463_LOCAL_KEY).toContain('last-real-source-round');
 });
 it('never records staged, paused, abbreviated or scoring/fake win rounds',()=>{
  const v=view();
  expect(b463FromRealTimeUp({...v,finished:false},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,timeRemainingSeconds:1},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp(v,10799,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,cpuPhysicallyRejoined:6},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,officialWinner:'TEAM_A'},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,officialScoreableSurfaces:1},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,genuineHumanShots:-1},11856,origin)).toBeNull();
 });
 it('refuses tampered, oversized, future-world and invented official records',()=>{
  const a=b463FromRealTimeUp(view(),11856,origin)!;
  for(const bad of [{...a,officialWinner:'TEAM_A'},
   {...a,source:'31/17/26/0'},{...a,cpuRejoined:6},
   {...a,formal4v4Certified:true},{...a,realNativeTick:9000},
   {...a,humanShots:NaN},{...a,worldOrigin:origin+3}]){
   expect(b463ReadPreviousSourceRound(JSON.stringify(bad),origin+2))
    .toBeNull();
  }
  expect(b463ReadPreviousSourceRound('{invalid',origin)).toBeNull();
  expect(b463ReadPreviousSourceRound('a'.repeat(2049),origin)).toBeNull();
 });
});
