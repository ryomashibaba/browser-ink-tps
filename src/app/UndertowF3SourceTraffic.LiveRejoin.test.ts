import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {proposeB441OriginalFrontline,proposeB441OriginalRampLocalGoals}
 from './B441OriginalSourceFrontline';
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
  realKccRejectedSteps:new Map(),p2BTeamDroughtFoot:new Map(),
  p2BTeamLastFullRouteAuditTick:new Map(),
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
 it('reports only actual original CPU grounded travel rather than an inferred Crowd path',()=>{
  const {traffic}=fixture();
  const t:any=traffic;
  t.realGroundTravelMetersByActor=new Map([['B3',12.5],['B4',3.25]]);
  const v=traffic.snapshot().sourcePatrol.realGroundTravelMetersByActor;
  expect(Object.keys(v)).toHaveLength(7);
  expect(v.B3).toBe(12.5);
  expect(v.B4).toBe(3.25);
  expect(v.B2).toBe(0);
  expect(v.A1).toBe(0);
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
  enemy.position.z=40;enemy.position.y=3.6;
  expect(alive()).toBe(true); // eligible ORIGINAL ramp, route not yet proved
  enemy.position.y=5.4;expect(alive()).toBe(false);
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
   stage:undertowT21dConnectivityQaStage(),
   bots:[bot],freeCombat:true,
   respawnOriginalDrops:new Set(),
   physicallyRejoined:new Set(['A2']),
   originalSourceRecoveryIntent:new Set(),
   b443OriginalGoalLocks:new Map(),
   b442LastApprovedFront:new Map(),
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
   stage:undertowT21dConnectivityQaStage(),
   bots:[bot],freeCombat:true,
   respawnOriginalDrops:new Set(),
   physicallyRejoined:new Set(['A3']),
   originalSourceRecoveryIntent:new Set(),
   b443OriginalGoalLocks:new Map(),
   b442LastApprovedFront:new Map(),
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

it('B441 B1 real KCC-stall tries only another strictly checked ORIGINAL path',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(0,3.2,-40),old=new Vec3(0,3.2,-46),
  alternative=new Vec3(2,3.2,-45),out=new Vec3(9,9,9);
 const bot={id:'B1',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 let strict=true;
 Object.assign(source,{
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  stage:undertowT21dConnectivityQaStage(),bots:[bot],freeCombat:true,
  enableB441SourceFrontline:true,physics:{},
  physicallyRejoined:new Set(['B1']),respawnOriginalDrops:new Set(),
  originalSourceRecoveryIntent:new Set(),
  b443OriginalGoalLocks:new Map(),b442LastApprovedFront:new Map(),
  b441FrontGoals:new Map([['B1',[]]]),
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map([['B1',{}]]),
  b467LiveSourceGoals:new Map(),
  patrolGoals:new Map([['B1',[old,alternative]]]),
  patrolIndex:new Map([['B1',0]]),realKccRejectedSteps:new Map(),
  hasSourceFootSupport:()=>true,hasSourceSupportedRoute:()=>strict,
  nav:{auditPath:(from:Vec3,to:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   nativePathPoints:[from.clone(),to.clone()]
  })},realGoalRequests:0,heldRequests:0
 });
 for(let n=0;n<89;n++)source.noteRealSourceKccRejectedStep('B1',foot);
 expect(source.chooseSourceGoal('B1',foot,out)).toBe(true);
 expect(out.equals(old)).toBe(true);
 source.noteRealSourceKccRejectedStep('B1',foot);
 strict=false;out.set(9,9,9);
 expect(source.chooseSourceGoal('B1',foot,out)).toBe(false);
 expect(out.equals(new Vec3(9,9,9))).toBe(true);
 expect(bot.position.equals(foot)).toBe(true);
 expect(source.patrolIndex.get('B1')).toBe(0);
 strict=true;
 for(let n=0;n<90;n++)source.noteRealSourceKccRejectedStep('B1',foot);
 expect(source.chooseSourceGoal('B1',foot,out)).toBe(true);
 expect(out.equals(alternative)).toBe(true);
 expect(source.patrolIndex.get('B1')).toBe(1);
 expect(source.realKccRejectedSteps.has('B1')).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
});


it('P2 B-team no-aim reroute requires genuinely stationary feet, not moving a few centimeters each sample',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-8,4.6,-44);
 const bot={id:'B2',team:Team.B,position:foot.clone(),agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const b3={id:'B3',team:Team.B,position:foot.clone(),agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 Object.assign(source,{
  bots:[bot,b3],freeCombat:true,sourceInk:{},
  enableB441SourceFrontline:true,
  physicallyRejoined:new Set(['B2','B3']),
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  b137NativeTick:1000
 });
 source.noteRealSourcePaintAimDrought('B2',bot.position,120);
 expect(source.p2BTeamDroughtFoot.get('B2')?.firstStillNativeTick).toBe(1000);
 for(let i=1;i<=5;i++){
  source.b137NativeTick=1000+i*30;
  // Real feet could drift <22cm PER sample but >22cm in total.
  bot.position.x=foot.x+i*.08;
  source.noteRealSourcePaintAimDrought('B2',bot.position,120+i*30);
 }
 expect(source.p2BTeamDroughtFoot.get('B2')?.firstStillNativeTick).toBe(1090);
 expect(source.p2BTeamDroughtFoot.get('B2')?.stillAnchor.x)
  .toBeCloseTo(foot.x+.24);
 source.b137NativeTick=1200;
 source.noteRealSourcePaintAimDrought('B3',b3.position,120);
 expect(source.p2BTeamDroughtFoot.get('B3')?.firstStillNativeTick).toBe(1200);
 expect(source.p2BTeamDroughtFoot.get('B2')?.firstStillNativeTick).toBe(1090);
 source.noteRealSourcePaintAimDrought('B2',bot.position,0);
 expect(source.p2BTeamDroughtFoot.has('B2')).toBe(false);
 expect(source.p2BTeamDroughtFoot.has('B3')).toBe(true);
});


it('B2 real weapon-ready no-aim uses another existing ORIGINAL paint goal only after strict same-side Rapier and Recast approval',()=>{
 const stage=undertowT21dConnectivityQaStage();
 const proposals=proposeB441OriginalFrontline(stage,'B');
 const current=new Vec3(...proposals[0]!.point);
 const other=proposals.find(p=>new Vec3(...p.point).distance(current)>2.5);
 expect(other).toBeDefined();
 const bot={id:'B2',team:Team.B,position:current.clone(),agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 let routeValid=false;
 Object.assign(source,{
  stage,bots:[bot],freeCombat:true,enableB441SourceFrontline:true,
  physics:{},sourceInk:{sampleWorld:()=>({owner:Team.Neutral})},
  physicallyRejoined:new Set(['B2']),respawnOriginalDrops:new Set(),
  originalSourceRecoveryIntent:new Set(),
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  b443OriginalGoalLocks:new Map([['B2',{
   target:current.clone(),firstApprovedTick:900,arrivedSinceTick:null
  }]]),b442LastApprovedFront:new Map(),
  b441FrontGoals:new Map([['B2',[current.clone()]]]),
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map([['B2',{}]]),
  b467LiveSourceGoals:new Map(),b467LastLiveRetryTick:new Map(),
  patrolGoals:new Map([['B2',[current.clone()]]]),patrolIndex:new Map([['B2',0]]),
  realKccRejectedSteps:new Map(),b137NativeTick:1000,
  sourceNativeCharacterFootHit:()=>({
   solidId:'UndertowT21D:right-low-team-b'
  }),
  hasSourceFootSupport:()=>true,
  hasSourceSupportedRoute:()=>routeValid,
  nav:{auditPath:(from:Vec3,to:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   pointCount:2,nativePathPoints:[from.clone(),to.clone()]
  })},realGoalRequests:0,heldRequests:0
 });
 source.noteRealSourcePaintAimDrought('B2',bot.position,120);
 source.b137NativeTick=1120;
 source.noteRealSourcePaintAimDrought('B2',bot.position,150);
 source.b137NativeTick=1121;
 const denied=new Vec3(8,8,8);
 expect(source.chooseSourceGoal('B2',bot.position,denied)).toBe(false);
 expect(denied.equals(new Vec3(8,8,8))).toBe(true);
 // A genuinely denied old path also releases the old lock; this
 // cannot be misreported as a newly approved navigation destination.
 expect(source.b443OriginalGoalLocks.has('B2')).toBe(false);
 // Full physical source and native path checks must independently pass
 // before a new real Crowd target can replace the already audited goal.
 source.b137NativeTick=1242;
 source.noteRealSourcePaintAimDrought('B2',bot.position,180);
 routeValid=true;
 const approved=new Vec3(8,8,8);
 expect(source.chooseSourceGoal('B2',bot.position,approved)).toBe(true);
 expect(approved.distance(current)).toBeGreaterThan(2);
 expect(proposals.some(p=>approved.distance(new Vec3(...p.point))<.01))
  .toBe(true);
 expect(bot.position.equals(current)).toBe(true);
 expect(source.p2BTeamDroughtFoot.has('B2')).toBe(false);
});

it('B4 uses only real B3 Rapier contact to reject a directly blocked ORIGINAL direction',()=>{
 const foot=new Vec3(-6.27816915512085,4.607564449310303,-49.2904167175293);
 const blocked=new Vec3(-5.718484878540039,4.2646484375,-49.52046585083008);
 const b4={id:'B4',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const b3={id:'B3',team:Team.B,position:blocked,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 Object.assign(source,{stage:undertowT21dConnectivityQaStage(),
  bots:[b4,b3],physicallyRejoined:new Set(['B3','B4']),
  realKccRejectedSteps:new Map(),realKccLastActorBlocker:new Map(),
  realKccBTeamRecoveryAnchor:new Map(),
  enableB441SourceFrontline:true,b137NativeTick:300,
  hasSourceFootSupport:()=>true});
 for(let i=0;i<90;i++){
  source.b137NativeTick=300+i;
  source.noteRealSourceKccRejectedStep('B4',foot,['B3']);
 }
 const path=(to:Vec3)=>({nativePathPoints:[foot,to],
  reachedTarget:true,startSnapDistanceMeters:0,
  endSnapDistanceMeters:0,pointCount:2});
 expect(source.kccActorBlocksOriginalRoute('B4',foot,
  path(new Vec3(-2.27,3.158,-50.71)))).toBe(true);
 expect(source.kccActorBlocksOriginalRoute('B4',foot,
  path(new Vec3(-17.2657,4.6,-48.0596)))).toBe(false);
 expect(b3.position.equals(blocked)).toBe(true);
 expect(b4.position.equals(foot)).toBe(true);
 source.b137NativeTick+=121;
 expect(source.kccActorBlocksOriginalRoute('B4',foot,
  path(new Vec3(-2.27,3.158,-50.71)))).toBe(false);
 source.noteRealSourceKccApprovedStep('B4',foot,
  new Vec3(foot.x-.03,foot.y,foot.z));
 expect(source.realKccLastActorBlocker.has('B4')).toBe(true);
 source.noteRealSourceKccApprovedStep('B4',foot,
  new Vec3(foot.x-.26,foot.y,foot.z));
 expect(source.realKccLastActorBlocker.has('B4')).toBe(false);
});

it('B1 real KCC veto prefers a different original same-ramp goal, never a new foot',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-6.161229133605957,4.610357761383057,-49.02988815307617);
 const far=new Vec3(-17.2657470703125,4.599999904632568,-48.05963134765625);
 const near=new Vec3(-4.364792823791504,3.8463597297668457,-49.683570861816406);
 const old=new Vec3(-2.270068883895874,3.1579973697662354,-50.71049118041992);
 const bot={id:'B1',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 Object.assign(source,{
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  stage:undertowT21dConnectivityQaStage(),bots:[bot],freeCombat:true,
  enableB441SourceFrontline:true,
  physics:{castCharacterFootSupport:()=>({})},
  physicallyRejoined:new Set(['B1']),respawnOriginalDrops:new Set(),
  originalSourceRecoveryIntent:new Set(),b443OriginalGoalLocks:new Map(),
  b442LastApprovedFront:new Map(),b441FrontGoals:new Map([['B1',[]]]),
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map([['B1',{}]]),
  b467LiveSourceGoals:new Map(),patrolGoals:new Map([['B1',[far,near,old]]]),
  patrolIndex:new Map([['B1',2]]),
  realKccRejectedSteps:new Map([['B1',90]]),
  hasSourceFootSupport:()=>true,
  sourceNativeCharacterFootHit:(p:Vec3)=>({solidId:
   p.equals(foot)||p.equals(near)?
    'UndertowT21D:right-low-route-ramp-negative-z':
    'UndertowT21D:first-drop-landing-negative-z'}),
  hasSourceSupportedRoute:()=>true,
  nav:{auditPath:(a:Vec3,b:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,nativePathPoints:[a,b]
  })},realGoalRequests:0,heldRequests:0
 });
 const out=new Vec3(7,7,7);
 expect(source.chooseSourceGoal('B1',foot,out)).toBe(true);
 expect(out.equals(near)).toBe(true);
 expect(source.patrolIndex.get('B1')).toBe(1);
 expect(source.realKccRejectedSteps.has('B1')).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
});


it('B2/B4 genuine 120-tick teammate congestion tries only EXISTING original ramp targets',()=>{
 const floor='UndertowT21D:right-low-route-ramp-negative-z';
 const foot=new Vec3(-5.303488254547119,4.285635948181152,-48.5355339050293);
 const b2={id:'B2',team:Team.B,position:foot.clone(),agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const b3={id:'B3',team:Team.B,
  position:new Vec3(-5.80,4.45,-48.89),agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 let fullNativeOriginalRoute=false;
 Object.assign(source,{
  stage:undertowT21dConnectivityQaStage(),bots:[b2,b3],
  physicallyRejoined:new Set(['B2','B3']),
  enableB441SourceFrontline:true,physics:{},
  b137NativeTick:1400,lastMoved:new Map([['B2',1282]]),
  b441FrontGoals:new Map([['B2',[]]]),
  b441OriginalRampGoal:new Map(),b441OriginalRampLastAuditTick:new Map(),
  b441OriginalRampApprovals:0,b441OriginalRampRetentions:0,
  b441OriginalRampRejected:0,realKccRejectedSteps:new Map(),
  sourceNativeCharacterFootHit:()=>({solidId:floor}),
  hasSourceFootSupport:()=>true,
  hasSourceSupportedRoute:()=>fullNativeOriginalRoute,
  kccActorBlocksOriginalRoute:()=>false,
  nav:{auditPath:(a:Vec3,b:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   nativePathPoints:[a.clone(),b.clone()]})},
  realGoalRequests:0
 });
 const out=new Vec3(99,99,99);
 // Proximity alone or 118 stationary ticks is NEVER a route grant.
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(false);
 source.b137NativeTick=1402;
 // 120 stationary ticks may trigger a TRY, not override Rapier support.
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(false);
 expect(out.equals(new Vec3(99,99,99))).toBe(true);
 expect(source.b441OriginalRampGoal.size).toBe(0);
 fullNativeOriginalRoute=true;
 source.b137NativeTick+=60; // existing bounded re-audit cadence
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(true);
 expect(out.equals(foot)).toBe(false);
 const original=proposeB441OriginalRampLocalGoals(
  source.stage,'B').map(p=>new Vec3(...p.point));
 expect(original.some(p=>p.distance(out)<.001)).toBe(true);
 expect(source.b441OriginalRampApprovals).toBe(1);
 expect(b2.position.equals(foot)).toBe(true);
 expect(b3.position.equals(new Vec3(-5.80,4.45,-48.89))).toBe(true);
 // An unblocked or moving CPU cannot bypass the old 36-veto condition.
 source.b441OriginalRampGoal.clear();
 source.realKccRejectedSteps.clear();
 source.b137NativeTick+=60;
 b3.position.set(-15,4.45,-45);
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(false);
 b3.position.set(-5.80,4.45,-48.89);
 source.lastMoved.set('B2',source.b137NativeTick-4);
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(false);
 source.lastMoved.set('B2',1282);
 source.physicallyRejoined.delete('B3');
 expect(source.tryOriginalRampLocalRecovery('B2',foot,out)).toBe(false);
});

it('B4 genuine 90s stalled ramp prefers a distinct existing SAME-SOLID original goal only after strict Recast and Rapier approval',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-6.294005870819092,4.5892939639091495,-49.23163604736328);
 const far=new Vec3(-17.2657470703125,4.599999904632568,-48.05963134765625);
 const near=new Vec3(-4.364792823791504,3.8463597297668457,-49.683570861816406);
 const bot={id:'B4',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 let safe=true;
 Object.assign(source,{
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  stage:undertowT21dConnectivityQaStage(),bots:[bot],freeCombat:true,
  enableB441SourceFrontline:true,
  physics:{castCharacterFootSupport:()=>({})},
  physicallyRejoined:new Set(['B4']),respawnOriginalDrops:new Set(),
  originalSourceRecoveryIntent:new Set(),b443OriginalGoalLocks:new Map(),
  b442LastApprovedFront:new Map(),b441FrontGoals:new Map([['B4',[]]]),
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map([['B4',{}]]),
  b467LiveSourceGoals:new Map(),b467LastLiveRetryTick:new Map(),
  patrolGoals:new Map([['B4',[far,near]]]),
  patrolIndex:new Map([['B4',0]]),
  realKccRejectedSteps:new Map([['B4',90]]),
  realKccLastActorBlocker:new Map(),
  hasSourceFootSupport:()=>true,
  sourceNativeCharacterFootHit:(p:Vec3)=>({solidId:
   p.equals(foot)||p.equals(near)?
    'UndertowT21D:right-low-route-ramp-negative-z':
    'UndertowT21D:right-low-team-b'}),
  hasSourceSupportedRoute:()=>safe,
  nav:{auditPath:(from:Vec3,to:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,nativePathPoints:[from.clone(),to.clone()]
  })},realGoalRequests:0,heldRequests:0
 });
 const out=new Vec3(9,9,9);
 expect(source.chooseSourceGoal('B4',foot,out)).toBe(true);
 expect(out.equals(near)).toBe(true);
 expect(source.patrolIndex.get('B4')).toBe(1);
 expect(source.realKccRejectedSteps.has('B4')).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
 source.patrolIndex.set('B4',0);
 source.realKccRejectedSteps.set('B4',90);
 safe=false;out.set(9,9,9);
 expect(source.chooseSourceGoal('B4',foot,out)).toBe(false);
 expect(out.equals(new Vec3(9,9,9))).toBe(true);
 expect(source.patrolIndex.get('B4')).toBe(0);
 expect(bot.position.equals(foot)).toBe(true);
});

it('B2 real same-team capsule KCC veto rejects only a recently contacted teammate on the original first route',()=>{
 const foot=new Vec3(-5.767031192779541,4.277590274810791,-49.52889633178711);
 const blocked=new Vec3(-6.294005870819092,4.5892939639091495,-49.23163604736328);
 const b2={id:'B2',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const b4={id:'B4',team:Team.B,position:blocked,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 Object.assign(source,{stage:undertowT21dConnectivityQaStage(),
  bots:[b2,b4],physicallyRejoined:new Set(['B2','B4']),
  realKccRejectedSteps:new Map(),realKccLastActorBlocker:new Map(),
  realKccBTeamRecoveryAnchor:new Map(),
  enableB441SourceFrontline:true,b137NativeTick:400,
  hasSourceFootSupport:()=>true});
 for(let i=0;i<90;i++){
  source.b137NativeTick=400+i;
  source.noteRealSourceKccRejectedStep('B2',foot,['B4']);
 }
 const path=(p:Vec3)=>({nativePathPoints:[foot,p],
  reachedTarget:true,startSnapDistanceMeters:0,
  endSnapDistanceMeters:0,pointCount:2});
 expect(source.kccActorBlocksOriginalRoute('B2',foot,
  path(new Vec3(-17.265747,4.6,-48.059631)))).toBe(true);
 expect(source.kccActorBlocksOriginalRoute('B2',foot,
  path(new Vec3(-2.270069,3.158,-50.710491)))).toBe(false);
 // 3cm real KCC jitter is not recovery. A 26cm genuine accepted
 // physical foot step clears the old denied-foot episode.
 source.noteRealSourceKccApprovedStep('B2',foot,
  new Vec3(foot.x+.03,foot.y,foot.z));
 expect(source.kccActorBlocksOriginalRoute('B2',foot,
  path(new Vec3(-17.265747,4.6,-48.059631)))).toBe(true);
 source.noteRealSourceKccApprovedStep('B2',foot,
  new Vec3(foot.x+.26,foot.y,foot.z));
 expect(source.kccActorBlocksOriginalRoute('B2',foot,
  path(new Vec3(-17.265747,4.6,-48.059631)))).toBe(false);
 expect(b2.position.equals(foot)).toBe(true);
 expect(b4.position.equals(blocked)).toBe(true);
});


it('B4 recognizes only true recent unsupported original Rapier KCC and leaves the actual foot unchanged',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-6.294005870819092,4.5892939639091495,-49.23163604736328);
 const bot={id:'B4',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 Object.assign(source,{
  stage:undertowT21dConnectivityQaStage(),bots:[bot],
  enableB441SourceFrontline:true,physicallyRejoined:new Set(['B4']),
  b137NativeTick:1780,realKccRejectedSteps:new Map(),
  realKccBTeamRecoveryAnchor:new Map(),
  realKccLastActorBlocker:new Map(),realKccB4Unsupported:new Map(),
  hasSourceFootSupport:()=>true
 });
 const retry=()=>source.recentRealB4UnsupportedOriginalStep('B4',foot);
 for(let i=0;i<35;i++)source.noteRealSourceKccRejectedStep(
  'B4',foot,[],'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
 expect(retry()).toBe(false);
 source.noteRealSourceKccRejectedStep(
  'B4',foot,[],'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
 expect(retry()).toBe(true);
 source.b137NativeTick+=37;expect(retry()).toBe(false);
 source.b137NativeTick-=37;
 source.noteRealSourceKccRejectedStep('B4',foot,[],'OTHER_RAPIER_CAUSE');
 expect(retry()).toBe(false);
 source.noteRealSourceKccRejectedStep(
  'B4',foot,[],'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
 expect(retry()).toBe(true);
 source.noteRealSourceKccApprovedStep('B4',foot,
  new Vec3(foot.x+.3,foot.y,foot.z));
 expect(retry()).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
});
it('B3 truly unsupported native foot may recheck original ramp even with two distant front goals, but cannot bypass an unobserved veto',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-6.158311367034912,4.59292937040329,
  -48.93313217163086);
 const bot={id:'B3',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 const rampId='UndertowT21D:right-low-route-ramp-negative-z';
 Object.assign(source,{
  stage:undertowT21dConnectivityQaStage(),bots:[bot],
  enableB441SourceFrontline:true,
  physics:{castCharacterFootSupport:()=>({})},
  physicallyRejoined:new Set(['B3']),
  b137NativeTick:3218,
  b441FrontGoals:new Map([['B3',[
   new Vec3(-24.385263365,4.502,-44.321323812),
   new Vec3(-6.185263365,4.502,-37.321323812)]]]),
  b441OriginalRampGoal:new Map(),b441OriginalRampLastAuditTick:new Map(),
  b441OriginalRampApprovals:0,b441OriginalRampRetentions:0,
  b441OriginalRampRejected:0,
  realKccRejectedSteps:new Map(),realKccBTeamRecoveryAnchor:new Map(),
  realKccLastActorBlocker:new Map(),realKccB3Unsupported:new Map(),
  hasSourceFootSupport:()=>true,
  sourceNativeCharacterFootHit:()=>({solidId:rampId}),
  nav:{auditPath:(a:Vec3,b:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,nativePathPoints:[a,b]})},
  hasSourceSupportedRoute:()=>true,
  kccActorBlocksOriginalRoute:()=>false,realGoalRequests:0
 });
 const out=new Vec3(9,9,9);
 for(let i=0;i<36;i++)source.noteRealSourceKccRejectedStep(
  'B3',foot,[],'OTHER_RAPIER_CAUSE');
 expect(source.tryOriginalRampLocalRecovery('B3',foot,out)).toBe(false);
 expect(out.equals(new Vec3(9,9,9))).toBe(true);
 for(let i=0;i<36;i++)source.noteRealSourceKccRejectedStep(
  'B3',foot,[],'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
 expect(source.tryOriginalRampLocalRecovery('B3',foot,out)).toBe(true);
 expect(source.b441OriginalRampApprovals).toBe(1);
 expect(out.equals(new Vec3(9,9,9))).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
 expect(source.b441FrontGoals.get('B3')).toHaveLength(2);
});
it('B3 genuine 90s stalled ORIGINAL ramp retains rejection evidence across small Rapier jitter and reroutes only to another rechecked SOURCE goal',()=>{
 const source:any=Object.create(UndertowF3SourceTraffic.prototype);
 const foot=new Vec3(-6.185220718383789,4.594249048432543,-48.97983169555664);
 const far=new Vec3(-17.2657470703125,4.599999904632568,-48.05963134765625);
 const near=new Vec3(-4.364792823791504,3.8463597297668457,-49.683570861816406);
 const bot={id:'B3',team:Team.B,position:foot,agent:{},
  mobilityState:'GROUND',lifeState:'ACTIVE',hp:100};
 let strict=true;
 Object.assign(source,{
  p2BTeamDroughtFoot:new Map(),p2BTeamLastFullRouteAuditTick:new Map(),
  stage:undertowT21dConnectivityQaStage(),bots:[bot],freeCombat:true,
  enableB441SourceFrontline:true,
  physics:{castCharacterFootSupport:()=>({})},
  physicallyRejoined:new Set(['B3']),respawnOriginalDrops:new Set(),
  originalSourceRecoveryIntent:new Set(),b443OriginalGoalLocks:new Map(),
  b442LastApprovedFront:new Map(),b441FrontGoals:new Map([['B3',[]]]),
  b445FrontlineGates:new Map(),b446LiveFootProbes:new Map([['B3',{}]]),
  b467LiveSourceGoals:new Map(),patrolGoals:new Map([['B3',[far,near]]]),
  patrolIndex:new Map([['B3',0]]),
  realKccRejectedSteps:new Map(),realKccBTeamRecoveryAnchor:new Map(),
  realKccLastActorBlocker:new Map(),
  hasSourceFootSupport:()=>true,
  sourceNativeCharacterFootHit:(p:Vec3)=>({solidId:
   p.equals(foot)||p.equals(near)?
    'UndertowT21D:right-low-route-ramp-negative-z':
    'UndertowT21D:right-low-team-b'}),
  hasSourceSupportedRoute:()=>strict,
  nav:{auditPath:(from:Vec3,to:Vec3)=>({
   reachedTarget:true,startSnapDistanceMeters:0,
   endSnapDistanceMeters:0,nativePathPoints:[from.clone(),to.clone()]
  })},realGoalRequests:0,heldRequests:0
 });
 // Controlled small-step fixture, NOT synthetic native movement proof.
 // These 3cm accepted KCC samples cannot erase real B3's 90 rejected
 // requests while no observed foot advanced 25cm horizontally.
 for(let i=0;i<90;i++){
  source.noteRealSourceKccRejectedStep('B3',foot);
  source.noteRealSourceKccApprovedStep('B3',foot,
   new Vec3(foot.x+.03,foot.y,foot.z));
 }
 expect(source.realKccRejectedSteps.get('B3')).toBe(90);
 expect(source.realKccBTeamRecoveryAnchor.get('B3')?.equals(foot)).toBe(true);
 const out=new Vec3(9,9,9);
 expect(source.chooseSourceGoal('B3',foot,out)).toBe(true);
 expect(out.equals(near)).toBe(true);
 expect(source.realKccRejectedSteps.has('B3')).toBe(false);
 expect(source.realKccBTeamRecoveryAnchor.has('B3')).toBe(false);
 expect(bot.position.equals(foot)).toBe(true);
 // The original strict full-route Rapier/Recast veto is unchanged.
 source.patrolIndex.set('B3',0);
 strict=false;
 for(let i=0;i<90;i++)source.noteRealSourceKccRejectedStep('B3',foot);
 out.set(9,9,9);
 expect(source.chooseSourceGoal('B3',foot,out)).toBe(false);
 expect(out.equals(new Vec3(9,9,9))).toBe(true);
 expect(bot.position.equals(foot)).toBe(true);
 // Unlike 3cm jitter, actual 30cm XZ progress clears the stale witness.
 strict=true;
 for(let i=0;i<22;i++)source.noteRealSourceKccRejectedStep('B3',foot);
 source.noteRealSourceKccApprovedStep('B3',foot,
  new Vec3(foot.x-.30,foot.y,foot.z));
 expect(source.realKccRejectedSteps.has('B3')).toBe(false);
 expect(source.realKccBTeamRecoveryAnchor.has('B3')).toBe(false);
 // Even if each accepted physical step was <2.5cm, the NEXT genuine
 // rejected foot observation cannot retain the old streak once actual
 // horizontal distance from the prior KCC anchor exceeded 25cm.
 for(let i=0;i<22;i++)source.noteRealSourceKccRejectedStep('B3',foot);
 const progressed=new Vec3(foot.x+.26,foot.y,foot.z);
 bot.position=progressed; // controlled test fixture, never a runtime move
 source.noteRealSourceKccRejectedStep('B3',progressed);
 expect(source.realKccRejectedSteps.get('B3')).toBe(1);
 expect(source.realKccBTeamRecoveryAnchor.get('B3')?.equals(progressed))
  .toBe(true);
});
