import {describe,expect,it} from 'vitest';
import {sourceSessionSummary,type SourceSessionMetrics,B387RoundMilestones} from './UndertowF3SourceSessionBoard';
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

describe('B387 genuine native 180s source history',()=>{
 const input=()=>({tick:1000,respawns:0,stage:[25,17,26,0],
  playing:true,alive:true,weapon:'twin-comets',drop:true,
  c:{status:'REAL_LOCAL_CIRCUIT_CLEAR',sourceLocalPlayClear:true,
   actualOriginalRampTouched:true,
   actualOriginalRaisedFootColliderId:'UndertowT21D:right-low-team-a',
   realPostDropHumanImpactChangedCells:65,genuineGroundedTravelMeters:11.17,
   naturalCrossTeamRouteProven:false,sourceScoreablePromotions:0,
   officialWinner:'NONE'}});
 it('one physical clear once per life; genuine respawn does not carry current clear',()=>{
  const h=new B387RoundMilestones(),f=input();
  expect(h.observe(f)).toMatchObject({realClearedLives:1,currentLifeClear:true});
  f.tick=1001;expect(h.observe(f).realClearedLives).toBe(1);
  f.tick=1151;f.respawns=1;f.drop=false;
  f.c.status='WAIT_FIRST_DROP';f.c.sourceLocalPlayClear=false;
  expect(h.observe(f)).toMatchObject({realClearedLives:1,
   currentLifeClear:false,lastTrueWeapon:'twin-comets'});
 });
 it('rejects fabricated stage, winner, natural paths and missing 60 cells',()=>{
  for(const bad of [
   (f:ReturnType<typeof input>)=>{f.stage=[25,17,26,1];},
   (f:ReturnType<typeof input>)=>{f.c.officialWinner='A';},
   (f:ReturnType<typeof input>)=>{f.c.sourceScoreablePromotions=1;},
   (f:ReturnType<typeof input>)=>{f.c.naturalCrossTeamRouteProven=true;},
   (f:ReturnType<typeof input>)=>{f.respawns=7;}
  ]){const f=input(),h=new B387RoundMilestones();bad(f);
   expect(h.observe(f)).toMatchObject({valid:false,realClearedLives:0});}
  const f=input();f.c.realPostDropHumanImpactChangedCells=59;
  expect(new B387RoundMilestones().observe(f).realClearedLives).toBe(0);
 });
 it('a previous-life success persists in unscored 180-second recap',()=>{
  const s:SourceSessionMetrics={
   matchState:'TIME_UP',timeRemainingSeconds:0,tick:10800,
   originalSourceSolids:25,originalPaintSurfaces:17,originalSourceNavigationLinks:26,
   sourceScoreablePromotions:0,productionAuthorized:false,unrestricted4v4Certified:false,
   cpu:{physicalRejoins:['A1']},
   b23HumanInkFeedback:{humanChangedCells:65,humanChangedImpactCount:1},
   shotsFired:12,cpuSourceTurfShots:5,cpuImpactInkCellsChanged:7,
   cpuSplats:0,humanSplats:1,humanRespawns:1,stopReason:null,
   b384OpenLoadoutCircuit:true,b343OriginalSourceVolleyBudget:{enabled:false},
   humanCpuDirectHits:0,humanCpuDirectSplats:0,
   b186RealOriginalHumanCircuit:{
    enabled:true,status:'WAIT_FIRST_DROP',sourceLocalPlayClear:false,
    actualOriginalRampTouched:false,realPostDropHumanImpactChangedCells:0,
    genuineGroundedTravelMeters:0,naturalCrossTeamRouteProven:false,
    sourceScoreablePromotions:0,officialWinner:'NONE'},
   b387RealRoundMilestones:{
    enabled:true,valid:true,realClearedLives:1,currentLifeClear:false,
    currentLifeIndex:1,lastObservedNativeTick:10800,
    lastTrueClearTick:1900,lastTrueWeapon:'twin-comets',
    lastTruePostDropCells:65,sourceScoreable:0,enemyRoutesCertified:0,
    officialWinner:'NONE',productionAuthorized:false}
  };
  expect(sourceSessionSummary(s)).toMatchObject({finished:true,
   sourceShooter:{currentLifeLocalClear:false},
   roundMilestones:{realClearedLives:1,currentLifeClear:false},
   officialWinner:'NONE'});
  s.b387RealRoundMilestones!.sourceScoreable=1 as 0;
  expect(()=>sourceSessionSummary(s)).toThrow('B387_UNTRUSTED_ROUND_MILESTONE');
 });
});
