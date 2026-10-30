import {describe,expect,it} from 'vitest';
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
