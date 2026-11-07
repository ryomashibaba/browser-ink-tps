import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun,B25_SOURCE_PAINT_RUN_TICKS,
 B25_SOURCE_PAINT_RUN_REQUIRED_CELLS,
 B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS,
 type B25PracticeFrame,b25MayQuickRetryInRealSourceWorld} from './UndertowF3SourcePaintRun';

const tick=(t:number,patch:Partial<B25PracticeFrame>={}):B25PracticeFrame=>({
 tick:t,paused:false,stopReason:null,inputLocked:true,sessionEnded:false,
 sourceSolids:25,paintableSurfaces:17,originalNavLinks:26,scoreableSurfaces:0,
 foot:{x:t*.08,y:1,z:0,grounded:true,alive:true,
  realPhysicalOriginalStage:true},
 ink:{changedHumanImpactCells:0,changedHumanImpactEvents:0,
  sourceOnly:true,scoreablePromotionCount:0},...patch
});
describe('W10-B25 real human ink + real original grounded foot practice',()=>{
 it('requires actual human changed cells PLUS natural grounded movement and never awards Turf',()=>{
  const run=new UndertowF3SourcePaintRun();
  expect(run.arm()).toBe(true);
  run.observe(tick(10,{inputLocked:false}));
  expect(run.snapshot().status).toBe('ARMED');
  run.observe(tick(11));
  expect(run.snapshot().status).toBe('RUNNING');
  // First painted cell alone cannot satisfy the mobility gate.
  for(let i=12;i<120;i++){
   run.observe(tick(i,{ink:{changedHumanImpactCells:260,
    changedHumanImpactEvents:5,sourceOnly:true,scoreablePromotionCount:0},
    foot:{x:0,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  }
  expect(run.snapshot().status).toBe('RUNNING');
  for(let i=120;i<295;i++){
   run.observe(tick(i,{foot:{x:(i-120)*.09,y:1,z:0,grounded:true,
    alive:true,realPhysicalOriginalStage:true},ink:{
     changedHumanImpactCells:260,changedHumanImpactEvents:5,
     sourceOnly:true,scoreablePromotionCount:0}}));
  }
  const s=run.snapshot();
  expect(s.status).toBe('CLEAR');
  expect(s.humanChangedImpactCells).toBeGreaterThanOrEqual(B25_SOURCE_PAINT_RUN_REQUIRED_CELLS);
  expect(s.realGroundedTravelMeters).toBeGreaterThanOrEqual(B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS);
  expect(s.officialWinner).toBe('NONE');
  expect(s.originalTurfScore).toBe('UNAVAILABLE');
  expect(s.cpuPaintingCounted).toBe(false);
  expect(s.physicalStageModifications).toBe(0);
 });
 it('never rewards 1-tick teleports, airborne movement or absent physical original ground',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(2,{foot:{x:100,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  r.observe(tick(3,{foot:{x:100.1,y:1,z:0,grounded:false,alive:true,realPhysicalOriginalStage:true}}));
  r.observe(tick(4,{foot:{x:100.2,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:false}}));
  expect(r.snapshot().realGroundedTravelMeters).toBe(0);
  expect(r.snapshot().status).toBe('RUNNING');
 });
 it('times out on physical simulation ticks, not paint requests or drawing frames',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(1+B25_SOURCE_PAINT_RUN_TICKS,{foot:{x:0,y:1,z:0,
   grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  const s=r.snapshot();
  expect(s.status).toBe('TIME_UP');
  expect(s.secondsRemaining).toBe(0);
  expect(s.officialWinner).toBe('NONE');
 });
 it('fails closed on scoreable drift, stale ticks, pointer unlock and pause',()=>{
  for(const patch of [{scoreableSurfaces:1},{sourceSolids:26},
    {paused:true},{stopReason:'STAGE_COLLISION_FAILED'}] as const){
   const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
   r.observe(tick(2,patch));
   expect(r.snapshot().status).toBe('ABORTED');
   expect(r.snapshot().officialWinner).toBe('NONE');
  }
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(2,{inputLocked:false}));
  expect(r.snapshot().status).toBe('ABORTED');
  const stale=new UndertowF3SourcePaintRun();stale.arm();stale.observe(tick(10));
  stale.observe(tick(10));
  expect(stale.snapshot().status).toBe('ABORTED');
 });
});

describe('B475 source-native CLASSIC challenge pre-arm, not synthetic paint',()=>{
 it('stays ARMED until real PLAYING AND actual seven original CPU rejoin',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.armNativeFrontlineReady()).toBe(true);
  expect(r.snapshot().status).toBe('ARMED');
  r.observe(tick(1,{realSourceMatchPlaying:false,
   allSevenSourceCpuPhysicallyRejoined:false}));
  expect(r.snapshot().status).toBe('ARMED');
  r.observe(tick(2,{realSourceMatchPlaying:true,
   allSevenSourceCpuPhysicallyRejoined:false}));
  expect(r.snapshot().status).toBe('ARMED');
  r.observe(tick(3,{realSourceMatchPlaying:true,
   allSevenSourceCpuPhysicallyRejoined:true}));
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().humanChangedImpactCells).toBe(0);
  expect(r.snapshot().officialWinner).toBe('NONE');
 });
 it('rejects invalid original SOURCE and never gives practice completion',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.armNativeFrontlineReady()).toBe(true);
  r.observe(tick(1,{sourceSolids:24,realSourceMatchPlaying:true,
   allSevenSourceCpuPhysicallyRejoined:true}));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
 });
});

describe('B58 canonical SOURCE_SWEEP READY: wait for real seven CPU',()=>{
 const frame=(i:number,playing:boolean,joined:boolean)=>tick(i,{
  realSourceMatchPlaying:playing,
  allSevenSourceCpuPhysicallyRejoined:joined,
  ink:{changedHumanImpactCells:0,changedHumanImpactEvents:0,
   sourceOnly:true,scoreablePromotionCount:0,
   originalImpactChangedCellsBySurface:[]}
 });
 it('does not burn the 60s practice during STAGING or physical 6/7 rejoin',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.armNativeCanonicalReady('SOURCE_SWEEP')).toBe(true);
  for(const i of [1,10,50])expect(r.observe(frame(i,false,false)))
   .toMatchObject({status:'ARMED',elapsedTicks:0});
  expect(r.observe(frame(51,true,false))).toMatchObject({
   status:'ARMED',elapsedTicks:0});
  r.observe(frame(52,true,false));
  expect(r.observe(frame(53,true,true))).toMatchObject({
   status:'RUNNING',elapsedTicks:0,
   practiceVariant:'SOURCE_SWEEP',originalSweepSurfaces:0});
  expect(r.observe(frame(54,true,true))).toMatchObject({
   status:'RUNNING',elapsedTicks:1,officialWinner:'NONE'});
 });
 it('does not turn ALLY_SYNC into canonical and preserves original variants',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.armNativeCanonicalReady('ALLY_SYNC')).toBe(false);
  for(const v of ['CLASSIC','SWITCHBACK','PAINT_RELAY'] as const){
   expect(r.armNativeCanonicalReady(v)).toBe(true);
   expect(r.observe(frame(1,false,false))).toMatchObject({
    status:'ARMED',elapsedTicks:0,practiceVariant:v});
   r.abort('TEST');
  }
 });
});

describe('B55 real in-page source-local practice records',()=>{
 const complete=(r:UndertowF3SourcePaintRun,end:number)=>{
  expect(r.arm()).toBe(true);r.observe(tick(1));
  for(let n=2;n<=end;n++)r.observe(tick(n,{
   foot:{x:Math.max(0,n-(end-32))*.375,y:1,z:0,
    grounded:true,alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:190,changedHumanImpactEvents:4,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().status).toBe('CLEAR');return r.snapshot();
 };
 it('saves genuine first clear, slower retry cannot beat it, faster does',()=>{
  const r=new UndertowF3SourcePaintRun();
  const first=complete(r,120);
  expect(first.completedRealPracticeRuns).toBe(1);
  expect(first.bestClearElapsedTicks).toBe(first.elapsedTicks);
  expect(first.newBestOnMostRecentClear).toBe(true);
  const slow=complete(r,160);
  expect(slow.completedRealPracticeRuns).toBe(2);
  expect(slow.bestClearElapsedTicks).toBe(first.elapsedTicks);
  expect(slow.newBestOnMostRecentClear).toBe(false);
  const fast=complete(r,100);
  expect(fast.completedRealPracticeRuns).toBe(3);
  expect(fast.bestClearElapsedTicks).toBe(fast.elapsedTicks);
  expect(fast.newBestOnMostRecentClear).toBe(true);
  expect(fast.practiceRecordScope).toBe('CURRENT_BROWSER_SESSION_ONLY');
  expect(fast.officialRanking).toBe('NONE');
  expect(fast.officialWinner).toBe('NONE');
  expect(r.arm()).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(fast.elapsedTicks);
  expect(r.snapshot().newBestOnMostRecentClear).toBe(false);
  expect(r.arm()).toBe(false);
 });
 it('one goal alone and player abort must never establish a best',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  for(let n=2;n<=180;n++)r.observe(tick(n,{
   foot:{x:0,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:200,changedHumanImpactEvents:5,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  r.abort('PLAYER_POINTER_UNLOCKED');
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
  r.arm();r.observe(tick(1));r.observe(tick(2,{paused:true}));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
 });
});

describe('W10-B56 source-physical SWITCHBACK practice, no original-route promotion',()=>{
 const real=(t:number,x:number,ink=190)=>tick(t,{
  foot:{x,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
  ink:{changedHumanImpactCells:ink,changedHumanImpactEvents:4,
   sourceOnly:true,scoreablePromotionCount:0}
 });
 it('never promotes accumulated pacing without leaving the authentic start',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.arm('SWITCHBACK')).toBe(true);r.observe(real(1,0,0));
  for(let i=2;i<180;i++){
   const phase=(i-2)%16;
   const x=phase<=8?phase*.19:(16-phase)*.19;
   r.observe(real(i,x));
  }
  expect(r.snapshot().realGroundedTravelMeters).toBeGreaterThan(12);
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().routeTurnReached).toBe(false);
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
 });
 it('requires real outbound, return, impact ink and 12m, with separate bests',()=>{
  const r=new UndertowF3SourcePaintRun();
  r.arm('SWITCHBACK');r.observe(real(1,0,0));
  let time=1,x=0;
  const walk=(target:number)=>{
   while(Math.abs(target-x)>.00001){
    x+=Math.sign(target-x)*Math.min(.2,Math.abs(target-x));
    r.observe(real(++time,x));
   }
  };
  walk(2.2);
  expect(r.snapshot().routeTurnReached).toBe(true);
  expect(r.snapshot().routeReturned).toBe(false);
  walk(.2);
  expect(r.snapshot().routeReturned).toBe(true);
  expect(r.snapshot().status).toBe('RUNNING');
  for(let j=0;j<3;j++){walk(2);walk(.2);}
  const s=r.snapshot();
  expect(s.status).toBe('CLEAR');
  expect(s.practiceVariant).toBe('SWITCHBACK');
  expect(s.realGroundedTravelMeters).toBeGreaterThanOrEqual(12);
  expect(s.officialWinner).toBe('NONE');
  expect(s.sourceScoreablePromotions).toBe(0);
  expect(s.bestClearElapsedTicks).toBe(s.elapsedTicks);
  expect(r.arm('CLASSIC')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
  r.abort('USER_STOP');
  expect(r.arm('SWITCHBACK')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(s.elapsedTicks);
  expect(r.snapshot().completedRealPracticeRuns).toBe(1);
 });
 it('rejects non-source ground start or large displacement',()=>{
  const r=new UndertowF3SourcePaintRun();
  r.arm('SWITCHBACK');
  r.observe(tick(1,{foot:{x:0,y:1,z:0,grounded:false,
   alive:true,realPhysicalOriginalStage:true}}));
  expect(r.snapshot().status).toBe('ABORTED');
  r.arm('SWITCHBACK');r.observe(real(1,0,0));
  r.observe(real(2,99));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().routeTurnReached).toBe(false);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
 });
});

describe('W10-B57 PAINT RELAY — distinct real impact ink in each physical leg',()=>{
 const f=(tickNo:number,x:number,cells:number)=>tick(tickNo,{
  foot:{x,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
  ink:{changedHumanImpactCells:cells,changedHumanImpactEvents:cells?4:0,
   sourceOnly:true,scoreablePromotionCount:0}
 });
 it('rejects an outbound-and-return when all 180 cells came before the turn',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0;r.observe(f(n,x,0));
  for(let i=0;i<12;i++){x+=.2;r.observe(f(++n,x,200));}
  expect(r.snapshot().routeTurnReached).toBe(true);
  expect(r.snapshot().relayTurnPaintCells).toBe(200);
  for(let i=0;i<11;i++){x-=.2;r.observe(f(++n,x,200));}
  expect(r.snapshot().routeReturned).toBe(false);
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().officialWinner).toBe('NONE');
 });
 it('must paint ≥60 new cells on each of three ordered legs, then cover 12m',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0,c=0;r.observe(f(n,x,c));
  const move=(dest:number,paint:number)=>{
   while(Math.abs(x-dest)>1e-7){
    x+=Math.sign(dest-x)*Math.min(.2,Math.abs(dest-x));
    c+=paint;r.observe(f(++n,x,c));
   }
  };
  move(2.2,6);
  expect(r.snapshot().relayStage).toBe('RETURN_PAINT');
  expect(r.snapshot().relayTurnPaintCells).toBeGreaterThanOrEqual(60);
  const turn=r.snapshot().relayTurnPaintCells;
  move(.2,7);
  expect(r.snapshot().relayStage).toBe('FINISH_PAINT');
  const returned=r.snapshot().relayReturnPaintCells;
  expect(returned-turn).toBeGreaterThanOrEqual(60);
  move(2.2,0);
  expect(r.snapshot().status).toBe('RUNNING');
  // Movement after crossing the return radius can already count as
  // physically valid FINISH-leg ink. It cannot yet satisfy the 60-cell leg.
  expect(r.snapshot().relayStagePaintCells).toBeLessThan(60);
  move(.2,6);
  expect(r.snapshot().relayStagePaintCells).toBeGreaterThanOrEqual(60);
  expect(r.snapshot().status).toBe('RUNNING'); // still <12 real metres
  for(let i=0;i<2;i++){move(2.2,0);move(.2,0);}
  const fin=r.snapshot();
  expect(fin.status).toBe('CLEAR');
  expect(fin.relayStage).toBe('COMPLETE');
  expect(fin.humanChangedImpactCells).toBeGreaterThanOrEqual(180);
  expect(fin.realGroundedTravelMeters).toBeGreaterThanOrEqual(12);
  expect(fin.bestClearElapsedTicks).toBe(fin.elapsedTicks);
  expect(fin.originalTurfScore).toBe('UNAVAILABLE');
  expect(fin.officialWinner).toBe('NONE');
  expect(r.arm('CLASSIC')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  r.abort('USER_STOP');
  expect(r.arm('PAINT_RELAY')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(fin.elapsedTicks);
 });
 it('old cumulative ink cannot bypass either leg or avoid physical ground',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0;r.observe(f(n,x,0));
  for(let i=0;i<11;i++){x+=.2;r.observe(f(++n,x,40));}
  expect(r.snapshot().routeTurnReached).toBe(false);
  // The player is still physically grounded at the threshold and
  // legitimately paints enough new cells without another movement key.
  r.observe(f(++n,x,70));
  expect(r.snapshot().routeTurnReached).toBe(true);
  r.observe(tick(++n,{foot:{x,y:1,z:0,grounded:false,
   alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:200,changedHumanImpactEvents:5,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
 });
});

describe('A1 co-op pre-armed at SOURCE READY waits for real 7/7 physical start',()=>{
 const a1=(t:number,playing:boolean,rejoined:boolean)=>tick(t,{
  realSourceMatchPlaying:playing,
  allSevenSourceCpuPhysicallyRejoined:rejoined,
  ink:{changedHumanImpactCells:500,changedHumanImpactEvents:9,
   sourceOnly:true,scoreablePromotionCount:0},
  ally:{allyId:'A1',qaOptIn:true,realOriginalSourceOnly:true,
   genuineOriginalA1AimChangedImpactCells:60,
   genuineOriginalA1AimImpactEvents:3,scoreablePromotionCount:0}
 });
 it('does not count STAGING or six rejoined CPUs toward mission time',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.arm('ALLY_SYNC',true)).toBe(true);
  for(const t of [1,60,1000])r.observe(a1(t,false,t>=1000));
  r.observe(a1(1001,true,false));
  expect(r.snapshot()).toMatchObject({status:'ARMED',elapsedTicks:0,
   humanChangedImpactCells:0,actualOriginalA1ChangedImpactCells:0});
  r.observe(a1(1002,true,true));
  expect(r.snapshot()).toMatchObject({status:'RUNNING',elapsedTicks:0,
   humanChangedImpactCells:0,actualOriginalA1ChangedImpactCells:0});
  r.observe(a1(1003,true,true));
  expect(r.snapshot().elapsedTicks).toBe(1);
  expect(r.snapshot().originalA1CooperativeGoalSatisfied).toBe(false);
 });
 it('rejects pre-arming other variants and stops on real pause or authority drift',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.arm('CLASSIC',true)).toBe(false);
  expect(r.snapshot().status).toBe('IDLE');
  expect(r.arm('ALLY_SYNC',true)).toBe(true);
  r.observe(a1(1,false,false));
  r.observe(a1(2,false,false));
  expect(r.snapshot().status).toBe('ARMED');
  r.observe({...a1(3,false,false),paused:true});
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.arm('ALLY_SYNC',true)).toBe(true);
  r.observe({...a1(4,true,true),scoreableSurfaces:1});
  expect(r.snapshot().status).toBe('ABORTED');
 });
 it('does not depend on synthetic tick advancement or false pointer lock',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('ALLY_SYNC',true);
  r.observe({...a1(1,true,true),inputLocked:false});
  expect(r.snapshot()).toMatchObject({status:'ARMED',elapsedTicks:0});
  r.observe(a1(2,true,true));
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().officialWinner).toBe('NONE');
 });
});

describe('F3 in-world Q native practice repeat, never restart real 180s',()=>{
 const safe=()=>({mode:'combat' as const,phase:'PLAYING',paused:false,
  stopReason:null,pointerLocked:true,nativeTick:5200,remainingSeconds:90,
  hp:100,grounded:true,registeredOriginalFoot:true,cpuRejoined:7,
  stage:[25,17,26,0],practiceStatus:'CLEAR' as const,
  practiceVariant:'CLASSIC' as const,surveyActive:false,galleryActive:false});
 it('accepts only terminal genuine source circuit/combat missions',()=>{
  expect(b25MayQuickRetryInRealSourceWorld(safe())).toBe(true);
  expect(b25MayQuickRetryInRealSourceWorld({...safe(),mode:'circuit',
   practiceStatus:'TIME_UP',practiceVariant:'PAINT_RELAY'})).toBe(true);
 });
 it('rejects wrong mode, authority, physical foot, CPU, timer and state',()=>{
  const bad=[
   {mode:null},{mode:'coop'},{mode:'frontline'},
   {phase:'TIME_UP'},{paused:true},{stopReason:'STOP'},
   {pointerLocked:false},{nativeTick:0},{remainingSeconds:59},
   {hp:0},{grounded:false},{registeredOriginalFoot:false},
   {cpuRejoined:6},{stage:[25,17,26,1]},
   {practiceStatus:'RUNNING'},{practiceStatus:'ARMED'},
   {practiceVariant:'ALLY_SYNC'},{surveyActive:true},{galleryActive:true}
  ];
  for(const patch of bad)
   expect(b25MayQuickRetryInRealSourceWorld({
    ...safe(),...patch
   } as Parameters<typeof b25MayQuickRetryInRealSourceWorld>[0])).toBe(false);
 });
 it('local restart resets only mission baseline, not original match counters',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.arm()).toBe(true);
  r.observe(tick(10));
  r.observe(tick(3610));
  expect(r.snapshot().status).toBe('TIME_UP');
  expect(r.arm('CLASSIC')).toBe(true);
  r.observe(tick(3611,{ink:{changedHumanImpactCells:600,
   changedHumanImpactEvents:9,sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().humanChangedImpactCells).toBe(0);
  expect(r.snapshot().officialWinner).toBe('NONE');
  r.observe(tick(3612,{ink:{changedHumanImpactCells:605,
   changedHumanImpactEvents:10,sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().humanChangedImpactCells).toBe(5);
  expect(r.snapshot().physicalStageModifications).toBe(0);
 });
});


describe('F3 SOURCE_SWEEP: real per-original-surface projectile ink quotas',()=>{
 const ids=[
  'UndertowT21D:spawn-high-positive-z:paint',
  'UndertowT21D:first-drop-landing-positive-z:paint',
  'UndertowT21D:right-low-route-ramp-positive-z:paint'
 ] as const;
 const frame=(t:number,counts:readonly number[],extra:Partial<B25PracticeFrame>={})=>
  tick(t,{
   foot:{x:t*.16,y:1,z:0,grounded:true,alive:true,
    realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:counts.reduce((a,b)=>a+b,0),
    changedHumanImpactEvents:counts.reduce((a,b)=>a+b,0)>0?3:0,
    sourceOnly:true,scoreablePromotionCount:0,
    originalImpactChangedCellsBySurface:counts.map((n,i)=>({
     surfaceId:ids[i]!,changedCells:n,certifiedOriginal:true
    }))},
   ...extra
  });
 it('CLEAR requires 60 fresh cells EACH on three source surfaces and 12m ground',()=>{
  const r=new UndertowF3SourcePaintRun();expect(r.arm('SOURCE_SWEEP')).toBe(true);
  r.observe(frame(1,[0,0,0]));
  for(let i=2;i<=95;i++)
   r.observe(frame(i,i<32?[60,0,0]:i<62?[60,60,0]:[60,60,60]));
  expect(r.snapshot()).toMatchObject({
   status:'CLEAR',originalSweepSurfaces:3,
   qualifiedOriginalSweepSurfaces:3,sweepCellsPerOriginalSurface:60,
   humanChangedImpactCells:180,officialWinner:'NONE',
   sourceScoreablePromotions:0,physicalStageModifications:0
  });
  expect(r.arm('SOURCE_SWEEP')).toBe(true);
  expect(r.snapshot()).toMatchObject({
   originalSweepSurfaces:0,qualifiedOriginalSweepSurfaces:0,
   completedRealPracticeRuns:1
  });
 });
 it('178+1+1 cannot win even with 180 real cells and 12m grounded travel',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('SOURCE_SWEEP');
  r.observe(frame(1,[0,0,0]));
  for(let i=2;i<=95;i++)r.observe(frame(i,[178,1,1]));
  expect(r.snapshot()).toMatchObject({
   status:'RUNNING',originalSweepSurfaces:3,
   qualifiedOriginalSweepSurfaces:1,humanChangedImpactCells:180,
   completedRealPracticeRuns:0,officialWinner:'NONE'
  });
  expect(r.snapshot().realGroundedTravelMeters).toBeGreaterThanOrEqual(12);
 });
 it('only new post-arm source ink counts; original preexisting paint is not credit',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('SOURCE_SWEEP');
  r.observe(frame(1,[200,120,60]));
  for(let i=2;i<=95;i++)r.observe(frame(i,[260,180,119]));
  expect(r.snapshot()).toMatchObject({
   status:'RUNNING',qualifiedOriginalSweepSurfaces:2,
   humanChangedImpactCells:179,officialWinner:'NONE'
  });
  r.observe(frame(96,[260,180,120]));
  expect(r.snapshot()).toMatchObject({status:'CLEAR',
   qualifiedOriginalSweepSurfaces:3});
 });
 it('rejects fabricated, duplicated, uncertified, absent or resetting source ledger',()=>{
  const changed=(value:number,rows:NonNullable<B25PracticeFrame['ink']['originalImpactChangedCellsBySurface']>)=>
   ({changedHumanImpactCells:value,changedHumanImpactEvents:1,
    sourceOnly:true as const,scoreablePromotionCount:0 as const,
    originalImpactChangedCellsBySurface:rows});
  const variants=[
   changed(100,[{surfaceId:ids[0],changedCells:60,certifiedOriginal:true}]),
   changed(60,[{surfaceId:ids[0],changedCells:60,certifiedOriginal:true},
    {surfaceId:ids[0],changedCells:0,certifiedOriginal:true}]),
   changed(60,[{surfaceId:'UndertowT21D:unknown:paint',
    changedCells:60,certifiedOriginal:false}]),
   changed(60,[])
  ];
  for(const invalidInk of variants){
   const r=new UndertowF3SourcePaintRun();r.arm('SOURCE_SWEEP');
   r.observe(frame(1,[0,0,0]));
   r.observe(frame(2,[60,0,0],{ink:invalidInk}));
   expect(r.snapshot().status).toBe('ABORTED');
   expect(r.snapshot().completedRealPracticeRuns).toBe(0);
  }
  const r=new UndertowF3SourcePaintRun();r.arm('SOURCE_SWEEP');
  r.observe(frame(1,[0,0,0]));
  r.observe(frame(2,[80,0,0]));r.observe(frame(3,[79,0,0]));
  expect(r.snapshot().status).toBe('ABORTED');
 });
});
