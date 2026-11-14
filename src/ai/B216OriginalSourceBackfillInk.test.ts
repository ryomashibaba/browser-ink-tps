import {beforeAll,describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {CpuAgentSystem} from './CpuAgentSystem';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {defineTestSurfaces} from '../stage/TestStage';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {SurfaceFlags,Team} from '../ink/types';
import {b216OriginalFootBackfillCandidates as candidates,
 b216RealSourcePaintShotLineClear as safeShot}
 from './B216OriginalSourceBackfillInk';
const foot={x:0,y:3.1,z:48};
const goal={x:0,y:3.1,z:52};
describe('B216 existing ORIGINAL surface-oriented fallback aim proposals',()=>{
 it('adds 12 bounded local radial candidates without a synthetic path',()=>{
  const c=candidates(foot,goal);expect(c.length).toBe(12);
  expect(c.every(x=>x.radiusMeters>=2.5&&x.radiusMeters<=3.5))
   .toBe(true);
  expect(c.every(x=>Math.hypot(x.x-foot.x,x.z-foot.z)<=3.501))
   .toBe(true);
 });
 it('covers rearward candidates when painted frontal goal is exhausted',()=>{
  const c=candidates(foot,goal);
  expect(c.some(x=>x.z<foot.z)).toBe(true);
  expect(c.some(x=>x.x>foot.x)).toBe(true);
  expect(c.some(x=>x.x<foot.x)).toBe(true);
 });
 it('at a genuine reached goal, uses only LIVE native weapon facing to seek original ink',()=>{
  const actualFacing={x:0,y:0,z:-1};
  const c=candidates(foot,foot,actualFacing);
  expect(c).toHaveLength(24);
  // Only a real reached goal gains the B64-established short radius.
  // Eight native-facing directions complete the full original-foot
  // angular search, but cannot by themselves authorize a single shot.
  expect(c.filter(x=>x.radiusMeters===1.7)).toHaveLength(8);
  expect(c.filter(x=>x.radiusMeters===2.5)).toHaveLength(8);
  expect(c.filter(x=>x.radiusMeters===3.5)).toHaveLength(8);
  const short=c.filter(x=>x.radiusMeters===1.7);
  const hasPoint=(dx:number,dz:number)=>short.some(p=>
   Math.abs(p.x-foot.x-dx)<1e-9&&
   Math.abs(p.z-foot.z-dz)<1e-9);
  expect(hasPoint(0,-1.7)).toBe(true); // real forward
  expect(hasPoint(-1.7/Math.SQRT2,-1.7/Math.SQRT2))
   .toBe(true); // formerly missing forward-left
  expect(new Set(short.map(p=>Math.round(
   ((Math.atan2(p.z-foot.z,p.x-foot.x)+2*Math.PI)%
     (2*Math.PI))*180/Math.PI)))).toEqual(
   new Set([0,45,90,135,180,225,270,315]));
  expect(c.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.z)&&
   Math.hypot(x.x-foot.x,x.z-foot.z)<=3.501)).toBe(true);
  expect(c.some(x=>x.z>foot.z)).toBe(true);
  expect(c.some(x=>x.x>foot.x)).toBe(true);
  expect(c.some(x=>x.x<foot.x)).toBe(true);
  expect(c[0]).not.toHaveProperty('navLink');
  expect(c[0]).not.toHaveProperty('sourceScoreable');
  expect(candidates(foot,foot,{x:0,y:0,z:0})).toEqual([]);
  expect(candidates(foot,foot,{x:NaN,y:0,z:-1})).toEqual([]);
  expect(candidates(foot,foot,{x:0,y:0,z:0.01})).toEqual([]);
  expect(candidates(foot,{...foot,z:foot.z+0.5},actualFacing)).toHaveLength(12);
 });
 it('refuses invalid or missing real source foot heading',()=>{
  expect(candidates(foot,foot)).toEqual([]);
  expect(candidates({...foot,x:NaN},goal)).toEqual([]);
  expect(candidates(foot,{...goal,z:Infinity})).toEqual([]);
 });
 it('does not alter physical actor or original route information',()=>{
  const a=JSON.stringify([foot,goal]),c=candidates(foot,goal);
  expect(JSON.stringify([foot,goal])).toBe(a);
  expect(c[0]).not.toHaveProperty('navLink');
  expect(c[0]).not.toHaveProperty('damage');
  expect(c[0]).not.toHaveProperty('sourceScoreable');
 });
});

describe('B216 genuine registered original-projectile shot vs route authority',()=>{
 const foot={x:1,y:3.1,z:5},target={x:3,y:3.1,z:5};
 const contact=(solidId:string,point:typeof foot)=>({solidId,point});
 const state=()=>({actualFoot:foot,actualTarget:target,
  footSupport:contact('original-a',foot),
  targetSupport:contact('original-b',target),firstStageBlock:null});
 it('allows an unobstructed real cross-solid INK SHOT, not a CPU walk',()=>{
  expect(safeShot(state())).toBe(true);
  expect(safeShot({...state(),targetSupport:contact('original-a',target)}))
    .toBe(true);
 });
 it('refuses missing, distant or forged original Rapier support',()=>{
  expect(safeShot({...state(),footSupport:null})).toBe(false);
  expect(safeShot({...state(),targetSupport:null})).toBe(false);
  expect(safeShot({...state(),footSupport:contact('',foot)})).toBe(false);
  expect(safeShot({...state(),targetSupport:contact('original-b',
   {...target,y:3.6})})).toBe(false);
  expect(safeShot({...state(),actualFoot:{...foot,x:NaN}}))
    .toBe(false);
 });
 it('rejects an original blocking solid between live muzzle and target',()=>{
  const block=contact('original-wall',{x:2,y:3.1,z:5});
  expect(safeShot({...state(),firstStageBlock:block})).toBe(false);
  // A different solid EVEN CLOSE to the target cannot bypass cover.
  expect(safeShot({...state(),firstStageBlock:
   contact('original-wall',{...target,z:5.1})})).toBe(false);
 });
 it('permits only the actual target collider at its observed impact',()=>{
  expect(safeShot({...state(),firstStageBlock:
   contact('original-b',{...target,y:3.15})})).toBe(true);
  expect(safeShot({...state(),firstStageBlock:
   contact('original-b',{...target,z:5.5})})).toBe(false);
 });
});

describe('P2 outer source-ink aim proposals stay untrusted and opt-in',()=>{
 it('retains identical default LOCAL sequence and candidate bounds',()=>{
  const old=candidates(foot,goal);
  expect(candidates(foot,goal,undefined,'LOCAL')).toEqual(old);
  expect(old).toHaveLength(12);
  expect(old.every(v=>v.radiusMeters<=3.5)).toBe(true);
 });
 it('proposes real-foot 4.5m and 5.5m only, without path or hit authority',()=>{
  const x=candidates(foot,goal,undefined,'DISTANT_ORIGINAL_ONLY');
  expect(x).toHaveLength(12);
  expect(new Set(x.map(v=>v.radiusMeters))).toEqual(new Set([4.5,5.5]));
  expect(x.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.z)&&
   Math.hypot(v.x-foot.x,v.z-foot.z)<=5.501)).toBe(true);
  expect(x[0]).not.toHaveProperty('navLink');
  expect(x[0]).not.toHaveProperty('damage');
  expect(x[0]).not.toHaveProperty('sourceScoreable');
  expect(candidates(foot,foot,{x:0,y:0,z:-1},
   'DISTANT_ORIGINAL_ONLY')).toHaveLength(16);
  expect(candidates(foot,foot,undefined,
   'DISTANT_ORIGINAL_ONLY')).toEqual([]);
 });
 it('proposes dense research-only original-foot directions without authorizing a shot',()=>{
  const facing={x:0,y:0,z:-1};
  const x=candidates(foot,foot,facing,'DENSE_ORIGINAL_ONLY');
  expect(x).toHaveLength(96);
  expect(new Set(x.map(p=>p.radiusMeters))).toEqual(
   new Set([1.2,1.7,2.5,3.5,4.5,5.5]));
  for(const radius of [1.2,1.7,2.5,3.5,4.5,5.5])
   expect(x.filter(p=>p.radiusMeters===radius)).toHaveLength(16);
  expect(x.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&
   Math.hypot(p.x-foot.x,p.z-foot.z)<=5.501)).toBe(true);
  expect(x[0]).not.toHaveProperty('navLink');
  expect(x[0]).not.toHaveProperty('sourceScoreable');
  expect(x[0]).not.toHaveProperty('shot');
  expect(candidates(foot,goal,facing,'DENSE_ORIGINAL_ONLY')).toEqual([]);
  expect(candidates(foot,foot,undefined,'DENSE_ORIGINAL_ONLY')).toEqual([]);
  expect(candidates(foot,foot,{x:0,y:0,z:0},
   'DENSE_ORIGINAL_ONLY')).toEqual([]);
 });
 it('rejects invalid heading, position or untrusted band',()=>{
  expect(candidates(foot,goal,undefined,
   'WRONG' as 'LOCAL')).toEqual([]);
  expect(candidates({...foot,x:NaN},goal,undefined,
   'DISTANT_ORIGINAL_ONLY')).toEqual([]);
  expect(candidates(foot,foot,{x:0,y:0,z:0},
   'DISTANT_ORIGINAL_ONLY')).toEqual([]);
 });
});


describe('B216 source CPU no-goal actual Rapier-foot ink continuation',()=>{
 beforeAll(async()=>{await initializeRapier();});
 it('uses ONLY the verified live CPU foot and actual facing when Crowd has no goal',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const ink=new GameplayInkSystem();defineTestSurfaces(ink,stage);
  const originalFoot=new Vec3(-.1,3,51);
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const footSupport=(_:string,p:Vec3)=>physics.castCharacterFootSupport(
   new Vec3(p.x,p.y+offset,p.z),offset,'HUMAN');
  expect(footSupport('A1',originalFoot)?.solidId)
   .toBe('UndertowT21D:first-drop-landing-positive-z');
  const system=Object.create(CpuAgentSystem.prototype) as any;
  const bot={id:'A1',team:Team.A,position:originalFoot,
   weaponId:'pulse-sprayer',agent:{},lifeState:'ACTIVE',
   mobilityState:'GROUND',thinkRemaining:1,
   weaponFacing:new Vec3(0,0,1)};
  system.stage=stage;system.qaMotionGoals=new Map();
  system.f3dSourceGoals={isLiveRejoinedSourceCpu:()=>true};
  system.phase14qGroundCollision={sourceFootSupport:footSupport};
  system.samplePoint=new Vec3();system.gameplayInk=ink;
  system.p2OuterOriginalBackfill=false;
  system.selectedSourceDenseApprovedAims=0; // Object.create skips class fields.
  system.b216RealOriginalFloorSightChecks=0;
  system.b216ApprovedPhysicalSourceAimTargets=0;
  system.b216ApprovedReachedGoalShortRadiusAims=0;
  system.b216OwnedCenterSourceBackfillAims=0;
  system.b216SourceStageAimValidated=(muzzle:{x:number;y:number;z:number},
   target:{x:number;y:number;z:number},realFoot:Vec3)=>{
    const f=footSupport('A1',realFoot);
    const t=footSupport('A1',new Vec3(target.x,target.y,target.z));
    if(!f||!t)return false;
    const first=physics.castStageSegment(
     new Vec3(muzzle.x,muzzle.y,muzzle.z),
     new Vec3(target.x,target.y+.07,target.z),'ink-projectile');
    return safeShot({actualFoot:realFoot,actualTarget:target,
     footSupport:f,targetSupport:t,firstStageBlock:first});
   };
  // Reproduce an actual KCC-rejected Crowd move: previously the stale
  // patrol target remained in qaMotionGoals even after resetMoveTarget.
  // The REAL SOURCE foot remains stationary, but nearby neutral ink may
  // be reacquired without a fake physical/nav goal.
  const staleGoal=new Vec3(0,3,55);
  system.qaMotionGoals.set('A1',staleGoal);
  system.phase14qF2RecoverableSteps=true;
  let agentReset=0;
  bot.agent={
   teleport:()=>{},resetMoveTarget:()=>{agentReset++},
   position:()=>originalFoot.clone()
  };
  system.b35LastNativeTarget=new Map([['A1',{
   agent:bot.agent,goal:staleGoal.clone(),repeat:0
  }]]);
  system.navigation={closestPoint:(p:Vec3)=>p.clone()};
  bot.thinkRemaining=1;
  system.reconcileBlockedT21F2CrowdProxy(bot);
  expect(agentReset).toBe(1);
  expect(bot.thinkRemaining).toBeCloseTo(.20);
  expect(system.b35LastNativeTarget.has('A1')).toBe(false);
  expect(system.qaMotionGoals.get('A1')).toEqual(staleGoal);
  // The old patrol heading is read-only paint context. With its own
  // candidate rays exhausted, the independent real-foot 1.7m band is
  // permitted. Never promote the old moving target into a physical path.
  const realAimSight=system.b216SourceStageAimValidated;
  system.b216SourceStageAimValidated=(muzzle:unknown,target:Vec3,
   actualFoot:Vec3)=>
    Math.hypot(target.x-actualFoot.x,target.z-actualFoot.z)<2&&
    realAimSight(muzzle,target,actualFoot);
  const approved=system.chooseB216ActualOriginalPaintBackfill(bot);
  expect(approved&&Math.hypot(approved.x-originalFoot.x,
   approved.z-originalFoot.z)).toBeLessThan(2);
  expect(approved).not.toBeNull();
  expect(ink.sampleWorld(approved!, .28,SurfaceFlags.Paintable)?.owner)
   .toBe(Team.Neutral);
  expect(system.qaMotionGoals.get('A1')).toEqual(staleGoal);
  expect(bot.position).toEqual(originalFoot);
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  // P2 dense drought recovery must exercise the REAL 25-solid Rapier
  // ray, ORIGINAL active ownerGrid, weapon range, and currently supported
  // CPU foot. A 96-proposal count alone is no evidence of an ink shot.
  // The same true source world and real-foot test that approved the
  // previous B216 target must also approve a local dense proposal.
  expect(system.chooseB216ActualOriginalPaintBackfill(bot,true,true))
   .toBeNull(); // No implicit P2 mode in normal SOURCE.
  system.p2OuterOriginalBackfill=true;
  const dense=system.chooseB216ActualOriginalPaintBackfill(bot,true,true);
  expect(dense).not.toBeNull();
  expect(dense&&Math.hypot(dense.x-originalFoot.x,
   dense.z-originalFoot.z)).toBeLessThan(2);
  expect(ink.sampleWorld(dense!, .28,SurfaceFlags.Paintable)?.owner)
   .toBe(Team.Neutral);
  expect(system.b216ApprovedPhysicalSourceAimTargets).toBeGreaterThan(1);
  expect(system.selectedSourceDenseApprovedAims).toBe(1);
  expect(bot.position).toEqual(originalFoot);
  expect(system.qaMotionGoals.get('A1')).toEqual(staleGoal);
  system.p2OuterOriginalBackfill=false;
  system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>false;
  expect(system.chooseB216ActualOriginalPaintBackfill(bot)).toBeNull();
  system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>true;
  system.phase14qGroundCollision.sourceFootSupport=()=>null;
  expect(system.chooseB216ActualOriginalPaintBackfill(bot)).toBeNull();
  system.phase14qGroundCollision.sourceFootSupport=()=>({
   solidId:'UndertowT21D:unregistered',point:originalFoot});
  expect(system.chooseB216ActualOriginalPaintBackfill(bot)).toBeNull();
  system.phase14qGroundCollision.sourceFootSupport=footSupport;
  bot.weaponFacing.set(0,0,0);
  expect(system.chooseB216ActualOriginalPaintBackfill(bot)).toBeNull();
  bot.weaponFacing.set(0,0,1);bot.mobilityState='FIRST_DROP_FALL';
  expect(system.chooseB216ActualOriginalPaintBackfill(bot)).toBeNull();
 });
});
