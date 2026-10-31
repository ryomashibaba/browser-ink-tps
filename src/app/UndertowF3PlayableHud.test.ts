import {describe,expect,it} from 'vitest';
import {nativeSourceRoundActionWindow,nativeSourceCpuCanStartActionsBeforeTickEnd} from './NativeSourceRoundActionWindow';
import {eligibleB378SourcePracticeWeapon} from './B378SourcePracticeWeaponSelection';
import {applyB379NativePlayerWeaponMobility} from './B379NativePlayerWeaponMobility';
import {b380NativeWeaponGuidance} from './B380NativePlayerWeaponGuide';
import {b382NativeSourceUserSubEnabled} from './B382NativeSourceUserSubGate';
import {weaponKit,subWeaponProfile} from '../weapons/WeaponKitCatalog';
import {weaponProfile} from '../weapons/WeaponCatalog';
import {WEAPON_ORDER} from '../weapons/WeaponCatalog';
import {b371RealSourceMissionCue,type B371SourceMissionFrame} from './B371RealSourceMissionCue';
import {b361GenuineShooterLine,formatF3PlayableHud,b290SourcePlayerHudPhase,b338SourceRoundGuide,genuineF3DirectHitVisible,sourceF3RealAimLineCue,type F3PlayableHudState}
 from './UndertowF3PlayableHud';

function state():F3PlayableHudState{
 return {
  player:{hp:100,ink:100},
  matchState:'STAGING',timeRemainingSeconds:180,
  cpu:{physicalRejoins:[],freeCombatEnabled:false},
  shotsFired:0,cpuSourceTurfShots:0,cpuSplats:0,humanSplats:0,
  sourceScoreablePromotions:0,productionAuthorized:false,
  paused:false,stopReason:null
 };
}
describe('W10-B17 non-scoring source practice HUD',()=>{
 it('shows 3-minute staging but cannot invent a Turf result',()=>{
  const a=formatF3PlayableHud(state());
  expect(a).toMatchObject({clock:'3:00',hp:100,ink:100,
   sessionState:'SOURCE STAGING',cpuRecovered:0,
   scoring:'UNSCORED / NO OFFICIAL RESULT',
   productionAuthorized:false,originalCrossTeamContactCertified:false});
 });
 it('exposes genuine source-local patrol and measured HP/ink',()=>{
  const s=state();
  s.player.hp=23.6;s.player.ink=63.4;
  s.cpu.physicalRejoins=['A1','A2','A3','B1','B2','B3','B4'];
  s.cpu.freeCombatEnabled=true;
  s.matchState='PLAYING';s.timeRemainingSeconds=153.3;
  s.shotsFired=12;s.cpuSourceTurfShots=87;
  const a=formatF3PlayableHud(s);
  expect(a).toMatchObject({clock:'2:34',hp:24,ink:63,
   cpuRecovered:7,sourceState:'SOURCE-LOCAL PATROL',
   sessionState:'SOURCE PRACTICE',humanShots:12,cpuTurfShots:87});
 });
 it('B82 reports real 60Hz splat time without claiming official combat',()=>{
  const s=state();s.matchState='PLAYING';s.player.hp=0;
  s.humanRespawnTicksRemaining=149;
  expect(formatF3PlayableHud(s)).toMatchObject({
   lifeState:'SPLATTED',respawnSeconds:2.5,
   scoring:'UNSCORED / NO OFFICIAL RESULT',
   originalCrossTeamContactCertified:false});
  s.humanRespawnTicksRemaining=6;
  expect(formatF3PlayableHud(s).respawnSeconds).toBe(.1);
  s.humanRespawnTicksRemaining=151;
  expect(formatF3PlayableHud(s).respawnSeconds).toBeNull();
  s.player.hp=100;s.humanRespawnTicksRemaining=30;
  expect(formatF3PlayableHud(s)).toMatchObject({
   lifeState:'ACTIVE',respawnSeconds:null});
 });
 it('B84 uses only native original ink relation and actual HP danger',()=>{
  const s=state();
  s.matchState='PLAYING';s.player.hp=95;
  s.player.inkRelation='ENEMY';
  s.originalSourceSolids=25;s.originalPaintSurfaces=17;
  s.originalSourceNavigationLinks=26;s.unrestricted4v4Certified=false;
  expect(formatF3PlayableHud(s).hazard).toBe('ENEMY_INK');
  s.player.hp=34.2;
  expect(formatF3PlayableHud(s).hazard).toBe('CRITICAL_ENEMY_INK');
  s.player.inkRelation='OWN';
  expect(formatF3PlayableHud(s).hazard).toBe('LOW_HP');
  s.player.hp=60;
  expect(formatF3PlayableHud(s).hazard).toBe('NONE');
  s.player.inkRelation='ENEMY';s.originalPaintSurfaces=18;
  expect(formatF3PlayableHud(s).hazard).toBe('NONE');
  s.originalPaintSurfaces=17;s.unrestricted4v4Certified=true;
  expect(formatF3PlayableHud(s).hazard).toBe('NONE');
  s.unrestricted4v4Certified=false;s.paused=true;
  expect(formatF3PlayableHud(s).hazard).toBe('NONE');
  s.paused=false;s.player.hp=0;
  expect(formatF3PlayableHud(s).hazard).toBe('NONE');
 });
 it('B87 verifies human direct CPU hit counters only on original source',()=>{
  const s=state();
  s.originalSourceSolids=25;s.originalPaintSurfaces=17;
  s.originalSourceNavigationLinks=26;s.unrestricted4v4Certified=false;
  s.humanCpuDirectHits=3;
  expect(formatF3PlayableHud(s).realHumanCpuDirectHits).toBe(3);
  s.humanCpuDirectHits=-1;
  expect(formatF3PlayableHud(s).realHumanCpuDirectHits).toBeNull();
  s.humanCpuDirectHits=4;s.originalSourceNavigationLinks=25;
  expect(formatF3PlayableHud(s).realHumanCpuDirectHits).toBeNull();
  s.originalSourceNavigationLinks=26;s.unrestricted4v4Certified=true;
  expect(formatF3PlayableHud(s).realHumanCpuDirectHits).toBeNull();
 });
 it('B88 requires authentic direct damage and original source for CPU splat',()=>{
  const s=state();s.originalSourceSolids=25;s.originalPaintSurfaces=17;
  s.originalSourceNavigationLinks=26;s.unrestricted4v4Certified=false;
  s.humanCpuDirectHits=3;s.humanCpuDirectSplats=1;
  expect(formatF3PlayableHud(s).realHumanCpuDirectSplats).toBe(1);
  s.humanCpuDirectSplats=4;
  expect(formatF3PlayableHud(s).realHumanCpuDirectSplats).toBeNull();
  s.humanCpuDirectSplats=1;s.originalSourceSolids=24;
  expect(formatF3PlayableHud(s).realHumanCpuDirectSplats).toBeNull();
 });
 it('time-up never claims a 4v4 result; safe stop is explicit',()=>{
  const s=state();
  s.matchState='TIME_UP';s.timeRemainingSeconds=0;
  expect(formatF3PlayableHud(s)).toMatchObject({
   clock:'0:00',sessionState:'TIME COMPLETE — NO WINNER'});
  s.stopReason='SOURCE_COLLISION_HOLD';
  expect(formatF3PlayableHud(s).sessionState).toBe('SAFE STOP');
 });
 it('clamps invalid vitals; rejects scoring and production promotion',()=>{
  const s=state();
  s.player.hp=-50;s.player.ink=Infinity;
  expect(formatF3PlayableHud(s)).toMatchObject({hp:0,ink:0});
  s.sourceScoreablePromotions=1;
  expect(()=>formatF3PlayableHud(s)).toThrow('T21_W10B17_HUD_MUST_NEVER_CERTIFY_TURF_SCORE');
  s.sourceScoreablePromotions=0;s.productionAuthorized=true;
  expect(()=>formatF3PlayableHud(s)).toThrow('T21_W10B17_HUD_MUST_NEVER_CERTIFY_TURF_SCORE');
 });
});

describe('W10-B136 genuine native direct hit and splat marker timing',()=>{
 const base={sourceTrusted:true,nativeTick:190,
  realHitCount:1,nativeMarkerUntil:238,
  matchState:'STAGING' as 'STAGING'|'PLAYING'|'TIME_UP',
  paused:false,stopReason:null as string|null};
 it('restores real B15 staging QA hit/splat without manufacturing hits',()=>{
  expect(genuineF3DirectHitVisible(base)).toBe(true);
  expect(genuineF3DirectHitVisible({...base,matchState:'PLAYING'})).toBe(true);
  expect(genuineF3DirectHitVisible({...base,realHitCount:0,
   nativeMarkerUntil:-1})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,realHitCount:null})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,sourceTrusted:false})).toBe(false);
 });
 it('rejects stale markers, unsound native ticks and ended sessions',()=>{
  expect(genuineF3DirectHitVisible({...base,nativeTick:239})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,nativeTick:-1})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,nativeTick:0.5})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,matchState:'TIME_UP'})).toBe(false);
  // The actual B15 isolated QA is paused while it advances native
  // Rapier ticks with real pointer input. Authentic damage still displays.
  expect(genuineF3DirectHitVisible({...base,paused:true})).toBe(true);
  expect(genuineF3DirectHitVisible({...base,paused:true,
   realHitCount:null})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,stopReason:'SOURCE_HOLD'})).toBe(false);
 });
});

describe('B243 real source muzzle-to-camera aim-line feedback',()=>{
 const base={
  stage:[25,17,26,0],nativeTick:1200,
  matchState:'PLAYING' as const,paused:false,
  stopReason:null as string|null,pointerLocked:true,
  hitKind:'SOURCE_PAINT' as const,rayDistanceMeters:8.25
 };
 it('distinguishes real source paint, registered cover, and empty rays',()=>{
  expect(sourceF3RealAimLineCue(base)).toMatchObject({
   kind:'SOURCE_PAINT',physicalAimLineOnly:true,
   projectileHitCertified:false,enemyContactCertified:false,
   gameplayWrites:0,sourceScoreablePromotions:0
  });
  expect(sourceF3RealAimLineCue({
   ...base,hitKind:'SOURCE_SOLID',rayDistanceMeters:2.5
  })?.label).toContain('REGISTERED COVER LINE');
  expect(sourceF3RealAimLineCue({
   ...base,hitKind:'NO_REGISTERED_HIT',rayDistanceMeters:null
  })?.label).toContain('NO REGISTERED SURFACE');
 });
 it('fails closed outside real source play without invented hit results',()=>{
  expect(sourceF3RealAimLineCue({...base,stage:[25,17,26,1]})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,paused:true})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,pointerLocked:false})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,stopReason:'SOURCE_HOLD'})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,nativeTick:2.5})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,matchState:'TIME_UP'})).toBeNull();
  expect(sourceF3RealAimLineCue({...base,rayDistanceMeters:NaN})).toBeNull();
 });
});

describe('B290 no fictitious READY after real native source movement',()=>{
 const v={matchState:'STAGING',paused:true,tick:0,
  stopReason:null as string|null,playerView:true,formattedState:'PAUSED'};
 it('shows genuine native tick0 READY and post-input tick85 as paused rejoin',()=>{
  expect(b290SourcePlayerHudPhase(v)).toBe('READY · SOURCE ROUND');
  expect(b290SourcePlayerHudPhase({...v,tick:85})).toBe('PAUSED · SOURCE REJOIN');
  expect(b290SourcePlayerHudPhase({...v,tick:1})).toBe('PAUSED · SOURCE REJOIN');
 });
 it('never calls invalid, unknown or negative ticks READY',()=>{
  for(const tick of [undefined,NaN,-1,2.5]){
   expect(b290SourcePlayerHudPhase({...v,tick})).toBe('PAUSED');
  }
 });
 it('preserves QA, running STAGING, real PLAYING, stop and time-up',()=>{
  expect(b290SourcePlayerHudPhase({...v,playerView:false})).toBe('PAUSED');
  expect(b290SourcePlayerHudPhase({...v,paused:false,
   formattedState:'SOURCE STAGING'})).toBe('SOURCE STAGING');
  expect(b290SourcePlayerHudPhase({...v,matchState:'PLAYING'})).toBe('PAUSED');
  expect(b290SourcePlayerHudPhase({...v,stopReason:'SOURCE_HOLD',
   formattedState:'SAFE STOP'})).toBe('SAFE STOP');
  expect(b290SourcePlayerHudPhase({...v,matchState:'TIME_UP',
   formattedState:'TIME COMPLETE — NO WINNER'})).toBe('TIME COMPLETE — NO WINNER');
 });
});

describe('B338 actual native phase explanation, no fabricated result',()=>{
 const g=(matchState:'STAGING'|'PLAYING'|'TIME_UP',paused:boolean,
  tick:number,stopReason:string|null=null,playerView=true)=>
  b338SourceRoundGuide({matchState,paused,tick,stopReason,playerView});
 it('distinguishes tick0 READY, staging, paused rejoin and pause',()=>{
  expect(g('STAGING',true,0).phase).toBe('READY');
  expect(g('STAGING',false,0).phase).toBe('STAGING');
  expect(g('STAGING',true,6).phase).toBe('PAUSED');
  expect(g('PLAYING',true,100).phase).toBe('PAUSED');
 });
 it('shows actual controls only in PLAYING and no winner at TIME_UP',()=>{
  expect(g('PLAYING',false,101).phase).toBe('PLAYING');
  expect(g('PLAYING',false,101).text).toContain('WASD MOVE');
  expect(g('TIME_UP',true,10800).text).toContain('NO WINNER');
 });
 it('preserves invisible QA and explicit safety stop',()=>{
  expect(g('PLAYING',false,101,null,false)).toEqual({phase:'QA',text:''});
  expect(g('PLAYING',false,101,'FAILED').phase).toBe('STOP');
 });
});

describe('B361 genuine source practice player-facing shooter telemetry',()=>{
 const valid=()=>{
  const s=state();
  s.matchState='PLAYING';
  s.originalSourceSolids=25;s.originalPaintSurfaces=17;
  s.originalSourceNavigationLinks=26;s.unrestricted4v4Certified=false;
  s.b343OriginalSourceVolleyBudget={enabled:true,rejectedVolleys:0,
   physicalPoolSize:128,actualFreeSlots:120};
  s.b361NativePlayerWeapon={id:'pulse-sprayer',displayName:'Pulse Sprayer'};
  s.b23HumanInkFeedback={originalSourceOnly:true,scoreablePromotionCount:0,
   humanChangedImpactCount:3,humanChangedCells:91,
   lastImpactTick:140,lastImpactChangedCells:12};
  s.shotsFired=9;
  return s;
 };
 it('displays only the actual chosen weapon and native shot/paint change counts',()=>{
  const s=valid();
  expect(b361GenuineShooterLine(s)).toBe(
   'Pulse Sprayer · 9 REAL SHOTS · 91 SOURCE INK CHANGES');
  s.b361NativePlayerWeapon!.displayName='Different Real Weapon';
  expect(b361GenuineShooterLine(s)).toContain('Different Real Weapon');
 });
 it('refuses forged scoring, staging outside original source, or fake paint',()=>{
  for(const change of [
   (s:F3PlayableHudState)=>{s.b343OriginalSourceVolleyBudget!.enabled=false;},
   (s:F3PlayableHudState)=>{s.originalSourceSolids=26;},
   (s:F3PlayableHudState)=>{s.sourceScoreablePromotions=1;},
   (s:F3PlayableHudState)=>{s.productionAuthorized=true;},
   (s:F3PlayableHudState)=>{s.b23HumanInkFeedback!.originalSourceOnly=false;},
   (s:F3PlayableHudState)=>{s.b23HumanInkFeedback!.humanChangedCells=-1;},
   (s:F3PlayableHudState)=>{s.shotsFired=1.5;},
  ]){const s=valid();change(s);expect(b361GenuineShooterLine(s)).toBeNull();}
 });
});

describe('B371 real SOURCE practice: three verified local goals and native shooter/ink',()=>{
 const frame=():B371SourceMissionFrame=>({
  originalStage:[25,17,26,0],genuineSourceShooterSelected:true,
  nativeTick:100,status:'WAIT_FIRST_DROP',
  originalSourceLocalClear:false,
  realGroundedTravelMeters:0,requiredGroundedTravelMeters:2,
  realFreshHumanImpactCells:0,requiredFreshHumanImpactCells:60,
  actualHumanImpactEvents:0,sourceInkOnly:true,
  realAcceptedShots:0,actualInkPercent:100,
  playerAlive:true,matchState:'PLAYING',stopped:false
 });
 it('shows genuine original first drop and no winner, never fake combat',()=>{
  const x=b371RealSourceMissionCue(frame())!;
  expect(x).toMatchObject({step:'DROP',progress:0,
   scoreablePromotions:0,crossTeamRouteCertified:false,
   officialWinner:'NONE',physicalEnemyHitCertified:false,gameplayWrites:0});
  expect(x.text).toContain('ORIGINAL FIRST DROP');
  expect(x.text).toContain('NO TURF WINNER');
 });
 it('only advances by REAL circuit state, with native movement and actual ink',()=>{
  const f=frame();f.status='MOVE_TO_ORIGINAL_RAISED';
  f.realGroundedTravelMeters=1.386;
  expect(b371RealSourceMissionCue(f)?.text).toContain('1.4 / 2.0m');
  f.status='PAINT_ON_RAISED';f.realFreshHumanImpactCells=37;
  f.actualHumanImpactEvents=3;f.realAcceptedShots=9;
  f.actualInkPercent=66.7;
  const y=b371RealSourceMissionCue(f)!;
  expect(y).toMatchObject({step:'PAINT',progress:2,completed:false});
  expect(y.text).toContain('37 / 60');
  expect(y.text).toContain('9 REAL SHOTS');
  expect(y.text).toContain('67% INK');
  f.status='REAL_LOCAL_CIRCUIT_CLEAR';
  f.originalSourceLocalClear=true;f.realFreshHumanImpactCells=60;
  expect(b371RealSourceMissionCue(f)).toMatchObject({step:'CLEAR',completed:true});
 });
 it('holds at source error and does not turn official scoring on',()=>{
  const f=frame();f.status='INVALID_SOURCE_WITNESS';
  expect(b371RealSourceMissionCue(f)).toMatchObject({step:'HOLD',completed:false});
  f.status='WAIT_FIRST_DROP';f.stopped=true;
  expect(b371RealSourceMissionCue(f)?.step).toBe('HOLD');
  f.stopped=false;f.playerAlive=false;
  expect(b371RealSourceMissionCue(f)?.text).toContain('PLAYER SPLATTED');
  f.playerAlive=true;f.matchState='TIME_UP';
  expect(b371RealSourceMissionCue(f)?.text).toContain('TIME UP');
 });
 it('fails closed when geometry, physical-source proof or resource stats drift',()=>{
  for(const edit of [
   (f:B371SourceMissionFrame)=>{f.originalStage=[25,17,26,1];},
   (f:B371SourceMissionFrame)=>{f.originalStage=[26,17,26,0];},
   (f:B371SourceMissionFrame)=>{f.sourceInkOnly=false;},
   (f:B371SourceMissionFrame)=>{f.genuineSourceShooterSelected=false;},
   (f:B371SourceMissionFrame)=>{f.realAcceptedShots=-1;},
   (f:B371SourceMissionFrame)=>{f.actualInkPercent=Infinity;},
   (f:B371SourceMissionFrame)=>{f.realFreshHumanImpactCells=NaN;},
   (f:B371SourceMissionFrame)=>{f.requiredFreshHumanImpactCells=0;},
   (f:B371SourceMissionFrame)=>{f.originalSourceLocalClear=true;}
  ]){const x=frame();edit(x);expect(b371RealSourceMissionCue(x)).toBeNull();}
 });
});

// B372 native-physics shooter resource readout is a projection of
// PlayerResources/B343 live state, never a fake reload or projectile.
describe('B372 real native SOURCE shooter resource feedback',()=>{
 const make=():B371SourceMissionFrame=>({
  originalStage:[25,17,26,0] as [number,number,number,number],
  genuineSourceShooterSelected:true,nativeTick:1100,
  status:'PAINT_ON_RAISED' as const,originalSourceLocalClear:false,
  realGroundedTravelMeters:3.2,requiredGroundedTravelMeters:2,
  realFreshHumanImpactCells:45,requiredFreshHumanImpactCells:60,
  actualHumanImpactEvents:7,sourceInkOnly:true,realAcceptedShots:10,
  actualInkPercent:18,playerAlive:true,
  matchState:'PLAYING' as const,stopped:false,
  shooterResources:{inkUnits:18,shotInkCostUnits:8.5,
   freePhysicalSlots:126,physicalPoolSize:128,
   realDryFireAttempts:0,realPoolRejections:0}
 });
 it('counts only physically complete steps while showing authentic shot resources',()=>{
  const x=b371RealSourceMissionCue(make())!;
  expect(x).toMatchObject({step:'PAINT',progress:2,completed:false,
   resourceState:'INK_AND_SLOT_AVAILABLE',actualFreePhysicalSlots:126,
   observedDryFireAttempts:0,observedPoolRejections:0});
  expect(x.text).toContain('SOURCE CIRCUIT 2/3');
  expect(x.text).toContain('10 REAL SHOTS');
  expect(x.text).toContain('INK + PHYSICAL SHOT SLOT AVAILABLE');
  expect(x.physicalEnemyHitCertified).toBe(false);
  expect(x.gameplayWrites).toBe(0);
 });
 it('distinguishes actual insufficient ink, physical pool saturation, verified clear',()=>{
  const f=make();f.shooterResources!.inkUnits=7;
  expect(b371RealSourceMissionCue(f)?.resourceState).toBe('LOW_INK');
  f.shooterResources!.inkUnits=40;f.shooterResources!.freePhysicalSlots=0;
  expect(b371RealSourceMissionCue(f)?.resourceState).toBe('PHYSICAL_POOL_FULL');
  f.shooterResources!.realPoolRejections=3;
  expect(b371RealSourceMissionCue(f)?.observedPoolRejections).toBe(3);
  f.shooterResources!.freePhysicalSlots=128;
  f.status='REAL_LOCAL_CIRCUIT_CLEAR' as typeof f.status;
  f.originalSourceLocalClear=true;
  // Literal status transition is tested with correctly typed model frame.
  expect(b371RealSourceMissionCue(f)).toMatchObject({progress:3,completed:true});
 });
 it('rejects altered pool counts, fake consumption stats and negative resources',()=>{
  for(const alter of [
   (f:B371SourceMissionFrame)=>{f.shooterResources!.freePhysicalSlots=129;},
   (f:B371SourceMissionFrame)=>{f.shooterResources!.physicalPoolSize=0;},
   (f:B371SourceMissionFrame)=>{f.shooterResources!.inkUnits=-1;},
   (f:B371SourceMissionFrame)=>{f.shooterResources!.shotInkCostUnits=Infinity;},
   (f:B371SourceMissionFrame)=>{f.shooterResources!.realPoolRejections=-1;},
   (f:B371SourceMissionFrame)=>{f.shooterResources!.realDryFireAttempts=1.5;}
  ]){const f=make();alter(f);expect(b371RealSourceMissionCue(f)).toBeNull();}
 });
});

describe('B376 real 180-second end and genuine HP attack cutoff',()=>{
 it('allows live source actors in staging or playing',()=>{
  for(const matchState of ['STAGING','PLAYING'])
   expect(nativeSourceRoundActionWindow({
    matchState,actualHumanHp:100,stopReason:null})).toEqual({
     humanCanStartNewActions:true,cpuCanStartNewActions:true});
 });
 it('blocks both teams from starting fresh shots/kits at actual time up',()=>{
  expect(nativeSourceRoundActionWindow({
   matchState:'TIME_UP',actualHumanHp:100,stopReason:null})).toEqual({
    humanCanStartNewActions:false,cpuCanStartNewActions:false});
 });
 it('disallows new human actions at true lethal HP without turning CPU off',()=>{
  for(const actualHumanHp of [0,-1,NaN])
   expect(nativeSourceRoundActionWindow({
    matchState:'PLAYING',actualHumanHp,stopReason:null})).toEqual({
     humanCanStartNewActions:false,cpuCanStartNewActions:true});
 });
 it('SAFE STOP and unrecognized phases fail closed',()=>{
  for(const matchState of ['STAGING','PLAYING','TIME_UP','INVALID'])
   expect(nativeSourceRoundActionWindow({
    matchState,actualHumanHp:100,stopReason:'SOURCE_PHYSICAL_STOP'})).toEqual({
     humanCanStartNewActions:false,cpuCanStartNewActions:false});
  expect(nativeSourceRoundActionWindow({
   matchState:'UNKNOWN',actualHumanHp:100,stopReason:null})).toEqual({
    humanCanStartNewActions:false,cpuCanStartNewActions:false});
 });
});

// B377: CPU used to spend real ink and increment source shots BEFORE
// B376 discarded the queued projectile at 0:00. This is a true runtime
// combat-decision gate, not an after-the-fact HUD or metric adjustment.
describe('B377 CPU real 180s clock/ink/shot consistency',()=>{
 const gate=(state:string,remaining:number,dt=1/60,stop:string|null=null)=>
  nativeSourceCpuCanStartActionsBeforeTickEnd({
   matchState:state,remainingSeconds:remaining,
   nativeDtSeconds:dt,stopReason:stop});
 it('keeps normal staging and any source playing tick strictly before 0:00',()=>{
  expect(gate('STAGING',180)).toBe(true);
  expect(gate('PLAYING',180)).toBe(true);
  expect(gate('PLAYING',.5)).toBe(true);
  expect(gate('PLAYING',2/60)).toBe(true);
 });
 it('prevents a charge or projectile at the final native physics tick',()=>{
  expect(gate('PLAYING',1/60)).toBe(false);
  expect(gate('PLAYING',.01)).toBe(false);
  expect(gate('PLAYING',0)).toBe(false);
  expect(gate('TIME_UP',0)).toBe(false);
  expect(gate('UNKNOWN',180)).toBe(false);
 });
 it('invalid clock, stopped match and non-positive dt fail closed',()=>{
  expect(gate('PLAYING',NaN)).toBe(false);
  expect(gate('PLAYING',Infinity)).toBe(false);
  expect(gate('PLAYING',180,0)).toBe(false);
  expect(gate('PLAYING',180,NaN)).toBe(false);
  expect(gate('PLAYING',180,1/60,'SOURCE_STOP')).toBe(false);
 });
});

describe('B378 pregame physical loadout selection, source 180s only',()=>{
 const ready=(requestedId:string)=>({
  requestedId,fullSource180Seconds:true,firstPointerAlreadyLocked:false,
  realPointerLocked:false,matchState:'STAGING',stopReason:null,
  sourceShooterBenchmark:false
 });
 it('permits all already implemented weapon profiles only before first pointer lock',()=>{
  for(const id of WEAPON_ORDER)
   expect(eligibleB378SourcePracticeWeapon(ready(id))).toBe(id);
 });
 it('cannot replace the genuine B343 benchmark or switch an ongoing or stopped match',()=>{
  for(const changed of [
   {sourceShooterBenchmark:true},{firstPointerAlreadyLocked:true},
   {realPointerLocked:true},{matchState:'PLAYING'},
   {matchState:'TIME_UP'},{fullSource180Seconds:false},
   {stopReason:'SAFE_STOP'}
  ])expect(eligibleB378SourcePracticeWeapon({
   ...ready('needle-smg'),...changed})).toBeNull();
 });
 it('rejects unknown and forged weapon names',()=>{
  for(const id of ['','unknown','__proto__','constructor','pulse-sprayer2'])
   expect(eligibleB378SourcePracticeWeapon(ready(id))).toBeNull();
 });
});

describe('B379 real weapon movement and dualie right-click',()=>{
 const rig=(klass:string='DUALIES')=>{
  let tap=false,held=false,secondary=false,accepted=true,count=0;
  const movements:number[]=[];
  const input={get fireHeld(){return held;},get secondaryHeld(){return secondary;},
   consumeSecondaryPressed(){const t=tap;tap=false;return t;}};
  const player={setWeaponMoveMultiplier(v:number){movements.push(v);},
   requestWeaponDodge(){count++;return accepted;}};
  const weapons={currentPlayerWeapon:{weaponClass:klass},
   getMovementMultiplier:(f:boolean,s:boolean)=>f?
    (klass==='CHARGER'?.66:klass==='BRUSH'?1.15:1):
    s&&klass==='BRELLA'?.74:1};
  const apply=(overrides:Partial<{humanAlive:boolean;realPointerLocked:boolean;sourceRoundPhase:string;stopped:boolean}>={})=>
   applyB379NativePlayerWeaponMobility({
    input,player,weapons,humanAlive:true,realPointerLocked:true,
    sourceRoundPhase:'PLAYING',stopped:false,...overrides});
  return {apply,movements,fire(){held=true;},guard(){secondary=true;},
   right(){tap=true;},reject(){accepted=false;},dodgeCount(){return count;}};
 };
 it('wires existing real weapon movement rate into KCC before its physical tick',()=>{
  const c=rig('CHARGER');c.fire();c.apply();expect(c.movements).toEqual([.66]);
  const b=rig('BRUSH');b.fire();b.apply();expect(b.movements).toEqual([1.15]);
  const g=rig('BRELLA');g.guard();g.apply();expect(g.movements).toEqual([.74]);
  const s=rig('SHOOTER');s.fire();s.apply();expect(s.movements).toEqual([1]);
 });
 it('one true secondary pointer press asks native dualie KCC for one dodge',()=>{
  const d=rig();d.right();
  expect(d.apply()).toMatchObject({realDodgeAccepted:true});
  expect(d.apply().realDodgeAccepted).toBe(false);
  expect(d.dodgeCount()).toBe(1);
  d.right();d.reject();expect(d.apply().realDodgeAccepted).toBe(false);
  expect(d.dodgeCount()).toBe(2);
  const other=rig('SHOOTER');other.right();
  expect(other.apply().realDodgeAccepted).toBe(false);
  expect(other.dodgeCount()).toBe(0);
 });
 it('dead, unlocked, timed-out and safe-stopped human cannot dodge or inherit attack movement',()=>{
  for(const invalid of [{humanAlive:false},{realPointerLocked:false},
    {sourceRoundPhase:'TIME_UP'},{sourceRoundPhase:'UNKNOWN'},{stopped:true}]){
   const d=rig('CHARGER');d.fire();d.right();
   expect(d.apply(invalid)).toEqual({movementMultiplier:1,realDodgeAccepted:false});
   expect(d.dodgeCount()).toBe(0);
   expect(d.movements).toEqual([1]);
  }
 });
});

describe('B380 real 180s weapon guidance never invents an action or a score',()=>{
 const view=(id:Parameters<typeof weaponProfile>[0],overrides:Record<string,unknown>={})=>
  b380NativeWeaponGuidance({
   profile:weaponProfile(id),hp:100,actualDodgeCharges:2,
   actualChargePercent:0,currentMode:'HUMAN',canShoot:true,
   realSubEnabled:false,...overrides
  });
 it('names the selected real physical weapon, not always a default shooter',()=>{
  expect(view('pulse-sprayer')).toContain('Pulse Sprayer');
  expect(view('needle-smg')).toContain('Needle SMG');
  expect(view('pulse-sprayer')).not.toContain('RMB DODGE');
 });
 it('dualies show only actual KCC charges, mode and physical right-click',()=>{
  const ready=view('twin-comets',{actualDodgeCharges:2});
  expect(ready).toContain('RMB DODGE 2/2');
  expect(view('twin-comets',{actualDodgeCharges:0})).toContain('RMB DODGE 0/2');
  expect(view('twin-comets',{currentMode:'SQUID'})).toContain('HUMAN FORM');
  expect(view('twin-comets',{hp:0})).toContain('SPLATTED');
  expect(view('twin-comets',{canShoot:false})).toContain('RECOVERING');
 });
 it('uses existing guard and charge weapon classes without granting ability',()=>{
  expect(view('canopy-guard')).toContain('RMB GUARD');
  expect(view('rail-charger',{actualChargePercent:38.6}))
   .toContain('CHARGE 39%');
  expect(view('chord-stringer',{actualChargePercent:70}))
   .toContain('CHARGE 70%');
  expect(view('rotor-splatling',{actualChargePercent:0}))
   .toContain('CHARGE 0%');
  expect(view('metro-roller')).toContain('LMB');
  expect(view('pulse-sprayer',{realSubEnabled:false})).not.toContain('F SUB');
  expect(view('pulse-sprayer',{realSubEnabled:true})).toContain('F SUB');
 });
 it('clamps invalid visual numbers without corrupting game resources',()=>{
  expect(view('twin-comets',{actualDodgeCharges:-5}))
   .toContain('RMB DODGE 0/2');
  expect(view('twin-comets',{actualDodgeCharges:Infinity}))
   .toContain('RMB DODGE 0/2');
  expect(view('rail-charger',{actualChargePercent:Infinity}))
   .toContain('CHARGE 0%');
  expect(view('rail-charger',{actualChargePercent:190}))
   .toContain('CHARGE 100%');
 });
});

// B382: only an ordinary, genuine user-selected SOURCE 180s combat round
// gains the already-implemented REAL F-key SubWeaponSystem. Scripted B343,
// deterministic research, normal previews and frozen production stay intact.
describe('B382 genuine SOURCE human 180s weapon kit sub selection',()=>{
 const q=(extras:Record<string,string>={})=>{
  const p=new URLSearchParams({
   t21Play:'preview',t21QaDrive:'source',
   t21W10B203:'fullRound',t21W10B192:'humanCombat',...extras});
  return b382NativeSourceUserSubEnabled(p);
 };
 it('enables the real sub for a true non-deterministic human 180s combat',()=>{
  expect(q()).toBe(true);
 });
 it('refuses all fake and benchmark source contexts',()=>{
  const invalidModes:Record<string,string>[]=[
   {t21Play:'normal'},{t21QaDrive:'normal'},
   {t21W10B203:'off'},{t21W10B192:'off'},
   {t21QaInput:'deterministic'},
   {t21W10B343:'sourceVolleyAtomic'}
  ];
  for(const overrides of invalidModes)expect(q(overrides)).toBe(false);
  // Missing user opt-in must fail closed too, not only explicit "off".
  const missingCombat=new URLSearchParams({
   t21Play:'preview',t21QaDrive:'source',t21W10B203:'fullRound'
  });
  expect(b382NativeSourceUserSubEnabled(missingCombat)).toBe(false);
 });
 it('guides the selected weapon physical kit, never the default pulse bomb',()=>{
  for(const id of WEAPON_ORDER){
   const profile=weaponProfile(id);
   const sub=subWeaponProfile(weaponKit(id).sub);
   const label=b380NativeWeaponGuidance({
    profile,hp:100,actualDodgeCharges:2,actualChargePercent:0,
    currentMode:'HUMAN',canShoot:true,realSubEnabled:true,
    realSubName:sub.displayName
   });
   expect(label).toContain('F SUB '+sub.displayName);
  }
 });
 it('does not advertise a physically disabled source sub',()=>{
  expect(b380NativeWeaponGuidance({
   profile:weaponProfile('twin-comets'),hp:100,
   actualDodgeCharges:2,actualChargePercent:0,
   currentMode:'HUMAN',canShoot:true,realSubEnabled:false,
   realSubName:'Snap Bomb'
  })).not.toContain('F SUB');
 });
});
