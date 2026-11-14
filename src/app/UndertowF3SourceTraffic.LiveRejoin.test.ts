import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {nativeSourceCpuCanStartActionsBeforeTickEnd}
 from './NativeSourceRoundActionWindow';
import {FixedStepClock} from '../core/FixedStepClock';
import {UndertowF3SourceTraffic,sourceNativeLiveRejoinedCpu,
 sourceNativeEligibleOpponentForCombat,type F3TrafficCpu} from './UndertowF3SourceTraffic';

function fixture(){
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const bots:F3TrafficCpu[]=ids.map(id=>({
  id,team:id.startsWith('A')?Team.A:Team.B,
  position:new Vec3(0,3,id.startsWith('A')?40:-40),
  agent:null,mobilityState:'GROUND',thinkRemaining:0,
  paintRemaining:0,fireRemaining:0,jumpCooldownSeconds:0,
  lifeState:'ACTIVE',hp:100
 }));
 // Observe the real class methods without constructing mock stage solids,
 // routes, Crowd or Rapier. No bot/physics/world state is advanced.
 const traffic:UndertowF3SourceTraffic=
  Object.create(UndertowF3SourceTraffic.prototype);
 const historical=new Set(ids);
 Object.assign(traffic,{
  bots,physicallyRejoined:historical,physicallyFalling:new Set(),
  respawnOriginalDrops:new Set(),cleared:new Set(),released:new Set(),
  lastMoved:new Map(),patrolIndex:new Map(),patrolGoals:new Map(),
  b93UpperDetours:new Map(),routePlan:{distinctFirstDropLinks:[]},
  // The snapshot has accumulated additional observational ledgers since
  // this lightweight lifecycle fixture was introduced. Keep them empty,
  // not undefined, so the read-only snapshot can be exercised honestly.
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map(),
  b467NativeRetargetWitnesses:[],b467LiveSourceGoals:new Map(),
  b470NativeRetargetWitnesses:[],b442LastApprovedFront:new Map(),
  b471ReadOnlyAllyCoverageOrder:()=>null,
  freeCombat:true
 });
 return {traffic,bots,historical};
}
describe('F3 actual native CPU life beats stale F2 physical rejoin cache',()=>{
 it('native live SOURCE human and seven CPU cannot prepaint during the 7/7 STAGING lock',()=>{
  const tick=(matchState:string,locked:boolean,remainingSeconds=180)=>
   nativeSourceCpuCanStartActionsBeforeTickEnd({
    matchState,nativeHumanPrestartLocked:locked,
    remainingSeconds,nativeDtSeconds:1/60,stopReason:null
   });
  expect(tick('STAGING',true)).toBe(false);
  expect(tick('PLAYING',true)).toBe(true);
  expect(tick('PLAYING',true,1/60)).toBe(false);
  expect(tick('TIME_UP',true)).toBe(false);
  // The frozen deterministic and T20 callers without live-source flag
  // continue to use their old staging semantics.
  expect(tick('STAGING',false)).toBe(true);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   matchState:'STAGING',remainingSeconds:180,
   nativeDtSeconds:1/60,stopReason:null
  })).toBe(true);
 });

 it('stops the real 180s SOURCE clock on the exact TIME_UP physics tick inside a slow render-frame catch-up',()=>{
  // The native game callback processes two genuine 60Hz ticks; the
  // 3rd/4th attempts cannot silently increment the clock after TIME_UP.
  const clock=new FixedStepClock(60,4,.12);
  let nativeCount=0,phase:'PLAYING'|'TIME_UP'='PLAYING';
  const started=clock.advance(4/60,(tick,dt)=>{
    expect(phase).toBe('PLAYING');
    expect(dt).toBeCloseTo(1/60);
    nativeCount++;
    if(nativeCount===2)phase='TIME_UP';
    return phase!=='TIME_UP';
  });
  expect(nativeCount).toBe(2);
  expect(clock.tick).toBe(2);
  expect(started.ticks).toBe(2);
  // The 180s end frame renders the ACTUAL final KCC/body pose, not the
  // preceding frame: the native world pauses immediately after this.
  expect(started.alpha).toBe(1);
  const beforeLastRealBodyX=5;
  const lastRealBodyX=5.3;
  const frozenImageX=beforeLastRealBodyX+
   (lastRealBodyX-beforeLastRealBodyX)*started.alpha;
  expect(frozenImageX).toBeCloseTo(lastRealBodyX);
  expect(started.droppedSeconds).toBe(0);
  // All old T20/F3 QA clock clients return void, not false.
  const old=new FixedStepClock(60,4,.12);
  const visited:number[]=[];
  const legacy=old.advance(4/60,tick=>{visited.push(tick)});
  expect(legacy.ticks).toBe(4);
  expect(visited).toEqual([1,2,3,4]);
  expect(old.tick).toBe(4);
  expect(legacy.alpha).toBeCloseTo(0);
  // A partially accumulated normal render still interpolates normally;
  // the final-pose override exists ONLY when the callback returns false.
  const ordinary=new FixedStepClock(60,4,.12);
  const partial=ordinary.advance(1.5/60,()=>undefined);
  expect(partial.ticks).toBe(1);
  expect(partial.alpha).toBeCloseTo(.5);
 });

 it('all seven real living native CPUs retain their true prior rejoin',()=>{
  const {traffic}=fixture();
  expect(traffic.nativeCpuLifecycleFrames().map(c=>c.rejoined))
   .toEqual(Array(7).fill(true));
  expect(traffic.snapshot().physicalRejoins).toHaveLength(7);
 });
 it('immediate genuine HP-zero splat hides B1 BEFORE next traffic.observe()',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState='SPLATTED';bots[3]!.hp=0;
  expect(historical.has('B1')).toBe(true); // stale cache, no fake writes
  expect(traffic.nativeCpuLifecycleFrames()[3]).toMatchObject({
   id:'B1',lifeState:'SPLATTED',hp:0,rejoined:false
  });
  const visible=traffic.snapshot();
  expect(visible.physicalRejoins).toHaveLength(6);
  expect(visible.physicalRejoins).not.toContain('B1');
  expect(visible.cpu[3]).toMatchObject({
   id:'B1',lifeState:'SPLATTED',hp:0,rejoined:false
  });
  expect(historical.has('B1')).toBe(true); // evidence, not navigation edits
 });
 it('unknown life never invents a live CPU return or original patrol goal',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState=undefined;
  expect(sourceNativeLiveRejoinedCpu(bots[3]!,historical)).toBe(false);
  expect(traffic.nativeCpuLifecycleFrames()[3]).toMatchObject({
   id:'B1',lifeState:'UNKNOWN',rejoined:false
  });
  expect(traffic.snapshot().physicalRejoins).not.toContain('B1');
 });
 it('strictly excludes stale, dead and ungrounded real enemy feet before any native path query',()=>{
  const {bots,historical}=fixture();
  const own=bots[0]!,enemy=bots[3]!;
  // This mock is eligibility policy only; no fake full source match.
  enemy.position.set(0,3,40);
  const actorFoot=new Vec3(0,3,42);
  const alive=()=>sourceNativeEligibleOpponentForCombat(
   own,enemy,actorFoot,1,historical);
  expect(alive()).toBe(true);
  enemy.lifeState=undefined;expect(alive()).toBe(false);
  enemy.lifeState='SPLATTED';expect(alive()).toBe(false);
  enemy.lifeState='ACTIVE';enemy.hp=0;expect(alive()).toBe(false);
  expect(sourceNativeLiveRejoinedCpu(enemy,historical)).toBe(false);
  enemy.hp=100;enemy.mobilityState='FALLING';expect(alive()).toBe(false);
  expect(sourceNativeLiveRejoinedCpu(enemy,historical)).toBe(false);
  enemy.mobilityState='GROUND';historical.delete(enemy.id);
  expect(alive()).toBe(false);
  historical.add(enemy.id);expect(alive()).toBe(true);
  enemy.position.z=-40;expect(alive()).toBe(false);
  enemy.position.z=40;enemy.position.y=3.6;expect(alive()).toBe(false);
  enemy.position.y=3;enemy.position.x=Number.NaN;expect(alive()).toBe(false);
  enemy.position.x=0;enemy.hp=Number.NaN;expect(alive()).toBe(false);
  enemy.hp=100;expect(alive()).toBe(true);
  // This is a real physical enemy filter, not ally homing or a free
  // route authorizer; historical B2 original-side state is irrelevant.
  enemy.team=own.team;expect(alive()).toBe(false);
 });
 it('native weapon/kit sight reads current SOURCE HP life and rejoin',()=>{
  const {traffic,bots,historical}=fixture();
  const b1=bots[3]!;
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(true);
  expect(traffic.isLiveRejoinedSourceCpu('MISSING')).toBe(false);
  b1.hp=0;expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(false);
  b1.hp=100;b1.lifeState='SPLATTED';
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(false);
  historical.delete('B1');b1.lifeState='ACTIVE';
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(false);
  historical.add('B1');b1.mobilityState='FIRST_DROP_FALL';
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(false);
  b1.mobilityState='GROUND';
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(true);
 });
 it('invalidates newborn SOURCE CPU old life before traffic.observe, leaving six teammates',()=>{
  const {traffic,bots,historical}=fixture();
  const t:any=traffic;
  t.originalSourceRecoveryIntent=new Set(['B1']);
  t.b443OriginalGoalLocks=new Map([['B1',{target:new Vec3(0,3,-40)}]]);
  t.cleared=new Set(['B1']);
  const b1=bots[3]!;
  b1.lifeState='SPLATTED';b1.hp=0;
  expect(historical.has('B1')).toBe(true);
  traffic.onNativeSourceCpuRespawn('B1');
  b1.position.set(0,9,-40);
  b1.hp=100;b1.lifeState='ACTIVE';
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(false);
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(false);
  expect(traffic.nativeSourceLiveRejoinedIds()).not.toContain('B1');
  expect(historical.has('B1')).toBe(false);
  expect(t.cleared.has('B1')).toBe(false);
  expect(t.b443OriginalGoalLocks.has('B1')).toBe(false);
  expect(t.originalSourceRecoveryIntent.has('B1')).toBe(false);
  expect(traffic.nativeSourceLiveRejoinedIds()).toHaveLength(6);
  expect(traffic.isLiveRejoinedSourceCpu('A1')).toBe(true);
  expect(()=>traffic.onNativeSourceCpuRespawn('B1'))
   .toThrow('T21_F3_SOURCE_RESPAWN_REQUIRES_REAL_SPLATTED_CPU');
  expect(()=>traffic.onNativeSourceCpuRespawn('NOT_A_CPU'))
   .toThrow('T21_F3_SOURCE_RESPAWN_REQUIRES_REAL_SPLATTED_CPU');
  // Fresh genuine F2 fall/rejoin is still the only way to restore it.
  historical.add('B1');
  expect(traffic.isLiveRejoinedSourceCpu('B1')).toBe(true);
 });
 it('normal real source respawn must earn new physical rejoin',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState='SPLATTED';bots[3]!.hp=0;
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(false);
  // Existing real traffic.observe() clears the historical rejoin on splat.
  historical.delete('B1');
  bots[3]!.lifeState='ACTIVE';bots[3]!.hp=100;
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(false);
  expect(traffic.snapshot().physicalRejoins).toHaveLength(6);
  // Only a separately verified original F2 first-drop rejoin may add it.
  historical.add('B1');
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(true);
 });
 it('a genuine A1 splat cancels stale C orders and in-flight goals while six teammates survive',()=>{
  const {traffic,bots,historical}=fixture();
  const t:any=traffic;
  const ids=bots.map(bot=>bot.id);
  t.previousLife=new Map(ids.map(id=>[id,'ACTIVE']));
  t.previous=new Map(bots.map(bot=>[bot.id,bot.mobilityState]));
  t.previousFeet=new Map(bots.map(bot=>[bot.id,bot.position.clone()]));
  t.b34StationarySourceTicks=new Map();
  t.originalSourceRecoveryIntent=new Set(['A1']);
  t.cleared=new Set(ids);
  t.b443OriginalGoalLocks=new Map([['A1',{
   target:new Vec3(0,3,39),firstApprovedTick:5,arrivedSinceTick:20
  }]]);
  t.b442LastApprovedFront=new Map([['A1',{
   target:new Vec3(0,3,39),nativeTick:80
  }]]);
  t.b143ApprovedNativeAllyGoal={target:new Vec3(0,3,39)};
  t.b471AllyOrder={requestedTick:90,goal:new Vec3(0,3,39),
   realAllyFootAtApproval:new Vec3(0,3,40)};
  t.b471OrderStatus='MOVING';
  t.b471SourceDecision='ORIGINAL_GOAL_GRANTED';
  bots[0]!.hp=0;bots[0]!.lifeState='SPLATTED';
  traffic.observe(100);
  expect(historical.has('A1')).toBe(false);
  expect(traffic.nativeCpuLifecycleFrames().filter(bot=>bot.rejoined))
   .toHaveLength(6);
  expect(t.freeCombat).toBe(true);
  expect(t.b471AllyOrder).toBeNull();
  expect(t.b471OrderStatus).toBe('HOLD');
  expect(t.b471SourceDecision).toBe('PHYSICAL_SOURCE_HOLD');
  expect(t.b143ApprovedNativeAllyGoal).toBeNull();
  expect(t.b443OriginalGoalLocks.has('A1')).toBe(false);
  expect(t.b442LastApprovedFront.has('A1')).toBe(false);
  expect(t.originalSourceRecoveryIntent.has('A1')).toBe(false);
 });

});


describe('native physically vetoed original CPU goal escape',()=>{
 it('reroutes only after 90 actual KCC denials onto a separately validated ORIGINAL path',()=>{
  const source:any=Object.create(UndertowF3SourceTraffic.prototype);
  const real=new Vec3(0,3.2,40);
  const first=new Vec3(0,3.2,46),second=new Vec3(2,3.2,45);
  const bot={id:'A2',team:Team.A,position:real,agent:{},
   mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
  Object.assign(source,{
   stage:{metadata:{id:'undertow-t21d-partial-connectivity-qa'}},
   bots:[bot],freeCombat:true,
   respawnOriginalDrops:new Set(),
   physicallyRejoined:new Set(['A2']),
   patrolGoals:new Map([['A2',[first,second]]]),
   patrolIndex:new Map([['A2',0]]),
   realKccRejectedSteps:new Map(),
   hasSourceFootSupport:()=>true,
   hasSourceSupportedRoute:()=>true,
   nav:{auditPath:(from:Vec3,to:Vec3)=>({
    reachedTarget:true,startSnapDistanceMeters:0,
    endSnapDistanceMeters:0,
    nativePathPoints:[from.clone(),to.clone()]
   })},
   realGoalRequests:0,heldRequests:0
  });
  const out=new Vec3(8,8,8);
  expect(source.chooseSourceGoal('A2',real,out)).toBe(true);
  expect(out.equals(first)).toBe(true); // unchanged FIXED baseline
  for(let tick=0;tick<89;tick++)
   source.noteRealSourceKccRejectedStep('A2',real);
  expect(source.realKccRejectedSteps.get('A2')).toBe(89);
  expect(source.chooseSourceGoal('A2',real,out)).toBe(true);
  expect(out.equals(first)).toBe(true);
  source.noteRealSourceKccRejectedStep('A2',real);
  expect(source.chooseSourceGoal('A2',real,out)).toBe(true);
  expect(out.equals(second)).toBe(true);
  expect(source.realKccRejectedSteps.has('A2')).toBe(false);
  expect(source.patrolIndex.get('A2')).toBe(1);
  expect(bot.position.equals(real)).toBe(true); // no fake CPU move
 });
 it('holds unsupported alternative, stale rejoin and zero-motion KCC checks',()=>{
  const source:any=Object.create(UndertowF3SourceTraffic.prototype);
  const foot=new Vec3(0,3,40),a=new Vec3(0,3,45),
   b=new Vec3(3,3,46),out=new Vec3(9,9,9);
  const bot={id:'A3',team:Team.A,position:foot,agent:{},
   mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
  let supported=true,strict=false;
  Object.assign(source,{
   stage:{metadata:{id:'undertow-t21d-partial-connectivity-qa'}},
   bots:[bot],freeCombat:true,
   respawnOriginalDrops:new Set(),
   physicallyRejoined:new Set(['A3']),
   patrolGoals:new Map([['A3',[a,b]]]),
   patrolIndex:new Map([['A3',0]]),
   realKccRejectedSteps:new Map(),
   hasSourceFootSupport:()=>supported,
   hasSourceSupportedRoute:()=>strict,
   nav:{auditPath:(from:Vec3,to:Vec3)=>({
    reachedTarget:true,startSnapDistanceMeters:0,
    endSnapDistanceMeters:0,
    nativePathPoints:[from.clone(),to.clone()]
   })},
   realGoalRequests:0,heldRequests:0
  });
  for(let i=0;i<90;i++)
   source.noteRealSourceKccRejectedStep('A3',foot);
  expect(source.chooseSourceGoal('A3',foot,out)).toBe(false);
  expect(out.equals(new Vec3(9,9,9))).toBe(true);
  expect(source.realKccRejectedSteps.has('A3')).toBe(false);
  // No real motion: the count cannot be cleared by a KCC zero-step.
  for(let i=0;i<50;i++)
   source.noteRealSourceKccRejectedStep('A3',foot);
  source.noteRealSourceKccApprovedStep('A3',foot,foot);
  expect(source.realKccRejectedSteps.get('A3')).toBe(50);
  source.noteRealSourceKccApprovedStep('A3',foot,
   new Vec3(0.03,3,40));
  expect(source.realKccRejectedSteps.has('A3')).toBe(false);
  supported=false;
  source.noteRealSourceKccRejectedStep('A3',foot);
  expect(source.realKccRejectedSteps.has('A3')).toBe(false);
  supported=true;bot.hp=0;
  source.noteRealSourceKccRejectedStep('A3',foot);
  expect(source.realKccRejectedSteps.has('A3')).toBe(false);
  bot.hp=100;source.physicallyRejoined.delete('A3');
  source.noteRealSourceKccRejectedStep('A3',foot);
  expect(source.realKccRejectedSteps.has('A3')).toBe(false);
  strict=true; // No mutation was made from a rejected alternate.
  expect(bot.position.equals(foot)).toBe(true);
 });
});
