import {describe,expect,it} from 'vitest';
import {sourceSessionSummary,type SourceSessionMetrics} from './UndertowF3SourceSessionBoard';
const input=():SourceSessionMetrics=>({
 matchState:'STAGING',timeRemainingSeconds:180,tick:0,
 originalSourceSolids:25,originalPaintSurfaces:17,originalSourceNavigationLinks:26,
 sourceScoreablePromotions:0,productionAuthorized:false,
 unrestricted4v4Certified:false,cpu:{physicalRejoins:[]},
 b23HumanInkFeedback:{humanChangedCells:0,humanChangedImpactCount:0},
 shotsFired:0,cpuSourceTurfShots:0,cpuImpactInkCellsChanged:0,
 cpuSplats:0,humanSplats:0,humanRespawns:0,stopReason:null
});
describe('W10-B58 actual source-local session recap gate',()=>{
 it('shows real native player / CPU activity but no inferred winning team',()=>{
  const v=input();v.matchState='PLAYING';v.timeRemainingSeconds=88.5;
  v.cpu.physicalRejoins=['A1','A2','A3','B1','B2','B3','B4'];
  v.shotsFired=30;v.b23HumanInkFeedback.humanChangedCells=558;
  v.b23HumanInkFeedback.humanChangedImpactCount=18;
  v.cpuSourceTurfShots=17;v.cpuImpactInkCellsChanged=90;
  const a=sourceSessionSummary(v);
  expect(a).toMatchObject({state:'PLAYING',genuineHumanShots:30,
   realHumanImpactInkCells:558,actualCpuSourceShots:17,
   actualCpuImpactInkCells:90,cpuPhysicallyRejoined:7,
   officialScoreableSurfaces:0,officialWinner:'NONE',
   naturallyConnectedOpposingPathsCertified:0,
   matchVictoryCertified:false,productionAuthorized:false});
 });
 it('time end means unscored training finished, not a Turf win',()=>{
  const v=input();v.matchState='TIME_UP';v.timeRemainingSeconds=0;v.tick=10800;
  expect(sourceSessionSummary(v)).toMatchObject({
   state:'COMPLETE',finished:true,result:'NO OFFICIAL TURF RESULT',
   officialWinner:'NONE',officialScoreableSurfaces:0});
  v.stopReason='SOURCE_PHYSICAL_STOP';
  expect(sourceSessionSummary(v)).toMatchObject({state:'SAFE_STOP',finished:false});
 });
 it('fails closed on data/source drift, invalid CPU ids and fabricated score',()=>{
  const v=input();v.sourceScoreablePromotions=1;
  expect(()=>sourceSessionSummary(v)).toThrow('W10_B58_SOURCE_AUTHORITY_GATE');
  v.sourceScoreablePromotions=0;v.unrestricted4v4Certified=true;
  expect(()=>sourceSessionSummary(v)).toThrow('W10_B58_SOURCE_AUTHORITY_GATE');
  v.unrestricted4v4Certified=false;v.cpu.physicalRejoins=['A1','A1'];
  expect(()=>sourceSessionSummary(v)).toThrow('W10_B58_INVALID_NATIVE_SESSION_VALUES');
  v.cpu.physicalRejoins=[];v.b23HumanInkFeedback.humanChangedCells=-1;
  expect(()=>sourceSessionSummary(v)).toThrow('W10_B58_INVALID_NATIVE_SESSION_VALUES');
 });
});

describe('B373 real native 180s shooter circuit and combat recap',()=>{
 const source=()=>{
  const f=input();
  f.matchState='PLAYING';f.tick=1621;f.timeRemainingSeconds=151;
  f.cpu.physicalRejoins=['A1','A2','A3','B1','B2','B3','B4'];
  f.shotsFired=11;f.b23HumanInkFeedback.humanChangedCells=90;
  f.b343OriginalSourceVolleyBudget={enabled:true};
  f.humanCpuDirectHits=0;f.humanCpuDirectSplats=0;
  f.b186RealOriginalHumanCircuit={
   enabled:true,status:'REAL_LOCAL_CIRCUIT_CLEAR',
   sourceLocalPlayClear:true,actualOriginalRampTouched:true,
   realPostDropHumanImpactChangedCells:90,
   genuineGroundedTravelMeters:12.8334,
   naturalCrossTeamRouteProven:false,
   sourceScoreablePromotions:0,officialWinner:'NONE'};
  return f;
 };
 it('projects only genuine current-life physics, impact-ink and physical CPU damage',()=>{
  const f=source();const x=sourceSessionSummary(f);
  expect(x).toMatchObject({state:'PLAYING',finished:false,
   sourceShooter:{currentLifeStatus:'REAL_LOCAL_CIRCUIT_CLEAR',
    currentLifeLocalClear:true,originalRampContact:true,
    trueHumanImpactCells:90,physicalTravelMeters:12.8334,
    actualHumanCpuDirectHits:0,actualHumanCpuDirectSplats:0,
    officialWinner:'NONE',scoringPromotions:0,
    certifiedNaturalOpponentRoute:false}});
  f.matchState='TIME_UP';f.timeRemainingSeconds=0;f.tick=10800;
  expect(sourceSessionSummary(f)).toMatchObject({
   state:'COMPLETE',finished:true,sourceShooter:{currentLifeLocalClear:true},
   officialWinner:'NONE',naturallyConnectedOpposingPathsCertified:0});
 });
 it('after actual human death, last-life circuit cannot be promoted from old CLEAR',()=>{
  const f=source();
  f.humanSplats=1;f.humanRespawns=1;
  f.b186RealOriginalHumanCircuit!.status='WAIT_FIRST_DROP';
  f.b186RealOriginalHumanCircuit!.sourceLocalPlayClear=false;
  f.b186RealOriginalHumanCircuit!.actualOriginalRampTouched=false;
  f.b186RealOriginalHumanCircuit!.genuineGroundedTravelMeters=0;
  f.b186RealOriginalHumanCircuit!.realPostDropHumanImpactChangedCells=0;
  const x=sourceSessionSummary(f);
  expect(x.sourceShooter).toMatchObject({
   currentLifeStatus:'WAIT_FIRST_DROP',currentLifeLocalClear:false,
   trueHumanImpactCells:0,physicalTravelMeters:0});
  expect(x.actualHumanRespawns).toBe(1);
 });
 it('source/route tampering and invented real CPU hit counters fail closed',()=>{
  for(const edit of [
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.officialWinner='TEAM_A';},
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.naturalCrossTeamRouteProven=true;},
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.sourceScoreablePromotions=1;},
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.actualOriginalRampTouched=false;},
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.realPostDropHumanImpactChangedCells=NaN;},
   (f:SourceSessionMetrics)=>{f.humanCpuDirectHits=-1;},
   (f:SourceSessionMetrics)=>{f.humanCpuDirectSplats=1;},
   (f:SourceSessionMetrics)=>{f.b186RealOriginalHumanCircuit!.status='INVENTED_CLEAR';},
  ]){
   const f=source();edit(f);
   expect(()=>sourceSessionSummary(f)).toThrow('B373_UNTRUSTED_SOURCE_PRACTICE_RECAP');
  }
 });
 it('preserves all non-shooter existing source session views',()=>{
  const f=input();
  expect(sourceSessionSummary(f).sourceShooter).toBeNull();
  f.b343OriginalSourceVolleyBudget={enabled:false};
  expect(sourceSessionSummary(f).sourceShooter).toBeNull();
 });
});
