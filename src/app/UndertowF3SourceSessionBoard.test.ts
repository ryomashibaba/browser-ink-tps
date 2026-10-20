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
