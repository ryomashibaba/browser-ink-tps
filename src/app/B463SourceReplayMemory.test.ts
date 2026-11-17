import {describe,it,expect} from 'vitest';
import {B463_LOCAL_KEY,b463FromRealTimeUp,b463ReadPreviousSourceRound,
 b463FormatSourceRoundComparison} from './B463SourceReplayMemory';
const origin=1793852715204.2;
const combatHref='https://example.org/browser-ink-tps/?t21Play=preview&'+
 't21QaDrive=source&t21W10B183=firstDropPlay&'+
 't21W10B192=humanCombat&t21W10B112=humanGround&'+
 't21W10B203=fullRound';
const circuitHref=combatHref+'&t21W10B384=loadoutCircuit';
const view=()=>({finished:true,timeRemainingSeconds:0,
 cpuPhysicallyRejoined:7,genuineHumanShots:121,
 realHumanImpactInkCells:1117,actualCpuSourceShots:146,
 actualCpuImpactInkCells:11926,actualHumanSplats:0,
 actualHumanRespawns:0,officialScoreableSurfaces:0,
 officialWinner:'NONE',productionAuthorized:false});
describe('B463 real SOURCE-only non-scoring replay history',()=>{
 it('accepts actual two-180s RAW values as separate local worlds only',()=>{
  const first=b463FromRealTimeUp(view(),11856,1793851814094.9,
   combatHref);
  expect(first?.source).toBe('25/17/26/0');
  const nextView={...view(),genuineHumanShots:19,
   realHumanImpactInkCells:112,actualCpuSourceShots:112,
   actualCpuImpactInkCells:11908};
  const second=b463FromRealTimeUp(nextView,11858,origin,
   combatHref);
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
  expect(b463FromRealTimeUp({...v,actualHumanSplats:0,
   actualHumanRespawns:1},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,actualHumanSplats:3,
   actualHumanRespawns:1},11856,origin)).toBeNull();
  expect(b463FromRealTimeUp({...v,actualHumanSplats:81,
   actualHumanRespawns:80},11856,origin)).toBeNull();
 });
 it('refuses tampered, oversized, future-world and invented official records',()=>{
  const a=b463FromRealTimeUp(view(),11856,origin)!;
  for(const bad of [{...a,officialWinner:'TEAM_A'},
   {...a,source:'31/17/26/0'},{...a,cpuRejoined:6},
   {...a,formal4v4Certified:true},{...a,realNativeTick:9000},
   {...a,humanShots:NaN},{...a,worldOrigin:origin+3},
   {...a,worldOrigin:-1},{...a,worldOrigin:-0.25},
   {...a,humanSplats:0,humanRespawns:1},
   {...a,humanSplats:4,humanRespawns:2},
   {...a,humanSplats:81,humanRespawns:80}]){
   expect(b463ReadPreviousSourceRound(JSON.stringify(bad),origin+2))
    .toBeNull();
  }
  expect(b463ReadPreviousSourceRound('{invalid',origin)).toBeNull();
  expect(b463ReadPreviousSourceRound('a'.repeat(2049),origin)).toBeNull();
 });
 it('different genuine SOURCE modes do not create misleading shot or splat deltas',()=>{
  const old=b463FromRealTimeUp(view(),11856,origin-1000,combatHref)!;
  const newer=b463FromRealTimeUp({...view(),genuineHumanShots:1},
   11860,origin,circuitHref)!;
  expect(old.sourceMode).toBe('combat');
  expect(newer.sourceMode).toBe('circuit');
  const local=b463ReadPreviousSourceRound(JSON.stringify(old),origin);
  const display=b463FormatSourceRoundComparison(local!,newer);
  expect(display).toContain('PREVIOUS MODE combat / CURRENT MODE circuit');
  expect(display).toContain('DIRECT PERFORMANCE COMPARISON UNAVAILABLE');
  expect(display).not.toContain('HUMAN SHOTS 121 → 1');
  expect(display).toContain('WINNER NONE');

  const legacy={...old};
  delete legacy.sourceMode;
  const oldData=b463ReadPreviousSourceRound(JSON.stringify(legacy),origin);
  expect(oldData).not.toBeNull();
  expect(b463FormatSourceRoundComparison(oldData!,newer))
   .toContain('PREVIOUS MODE UNKNOWN / CURRENT MODE circuit');
  const tampered={...old,sourceMode:'production'};
  expect(b463ReadPreviousSourceRound(JSON.stringify(tampered),origin))
   .toBeNull();
 });
 it('shows authentic physical splats and 150-tick returns across 180s rounds',()=>{
  const old=b463FromRealTimeUp({
   ...view(),actualHumanSplats:3,actualHumanRespawns:2
  },11856,origin-500,combatHref)!;
  const now=b463FromRealTimeUp({
   ...view(),actualHumanSplats:1,actualHumanRespawns:1
  },11890,origin,combatHref)!;
  const report=b463FormatSourceRoundComparison(old,now);
  expect(report).toContain('HUMAN SPLATS 3 → 1 (-2)');
  expect(report).toContain('HUMAN 150-TICK RETURNS 2 → 1 (-1)');
  expect(report).toContain('NOT AN OFFICIAL SCORE');
  expect(report).toContain('PENDING HUMAN RETURN AT TIME_UP YES → NO');
  expect(report).toContain('HP CONTACT NOT CERTIFIED');
  expect(report).toContain('WINNER NONE');
 });
});
