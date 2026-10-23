import {describe,expect,it} from 'vitest';
import {formatF3PlayableHud,genuineF3DirectHitVisible,type F3PlayableHudState}
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
  expect(genuineF3DirectHitVisible({...base,paused:true})).toBe(false);
  expect(genuineF3DirectHitVisible({...base,stopReason:'SOURCE_HOLD'})).toBe(false);
 });
});
