import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,beforeEach,describe,expect,it,vi} from 'vitest';
import {ThirdPersonCamera,type CombatAimQuery} from './ThirdPersonCamera';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {PlayerResources} from '../combat/PlayerResources';
import {CombatTargetSystem} from '../combat/CombatTargetSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {Team} from '../ink/types';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {undertowT21dConnectivityQaStage} from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {nearestT21SourceSupportedLanding} from '../stage/undertow/UndertowPhase14ECpuHandoff';

// Explicit UNIT fixtures, never native encounter evidence. Rendering/DOM only
// are stubs; CPU hit-volume queries, flight and direct HP application are real.
const originalStage=undertowT21dConnectivityQaStage();
let originalPhysics:RapierStagePhysics;
beforeAll(async()=>{
 await initializeRapier();
 originalPhysics=new RapierStagePhysics(1/60,originalStage);originalPhysics.step();
});
beforeEach(()=>{
 vi.stubGlobal('window',{addEventListener:vi.fn()});
 vi.stubGlobal('document',{addEventListener:vi.fn()});
 vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
function camera(blocker:Vec3|null=null){
 const from=new Vec3(.72,1.06,-6),direction=new Vec3(-.72,0,16).normalize();
 const entity={camera:{nearClip:0,farClip:100,
  screenToWorld:(_x:number,_y:number,d:number)=>from.clone().add(direction.clone().mulScalar(d))}};
 const physics={castStageSegment:()=>blocker?{
  point:blocker,distance:from.distance(blocker)}:null};
 const canvas={addEventListener:vi.fn(),getBoundingClientRect:()=>({width:1600,height:900})};
 return {view:new ThirdPersonCamera(canvas as never,entity as never,[],physics as never),from,direction,canvas};
}
function fixtureCpu(stats:PerformanceStats){
 const target={id:'UNIT_ONLY_B1',team:Team.B,position:new Vec3(0,0,10),
  hp:100,lifeState:'ACTIVE',mobilityState:'GROUND',weaponGuarding:false,
  hpRecoveryDelaySeconds:0};
 const cpu=Object.create(CpuAgentSystem.prototype) as CpuAgentSystem;
 Object.assign(cpu,{bots:[target],stats,b213SourceCounterfireEnabled:false});
 return {cpu,target};
}
describe('B367 native projectile damage resolution is REAL CPU HP',()=>{
 it('returns exact immutable observed HP reduction without inventing CPU splat',()=>{
  const stats=new PerformanceStats(),{cpu,target}=fixtureCpu(stats);
  const event={botId:target.id,distance:2,point:new Vec3(0,0,10),
   guarded:false};
  const first=cpu.applyProjectileHit(event,28,'HUMAN');
  expect(first).toMatchObject({botId:target.id,sourceKind:'HUMAN',
   hpBefore:100,hpAfter:72,realHpLoss:28,
   shieldAbsorbed:false,lethalHpZero:false});
  expect(target.hp).toBe(72);expect(stats.humanCpuDirectHits).toBe(1);
  const lethal=cpu.applyProjectileHit(event,100,'HUMAN');
  expect(lethal).toMatchObject({hpBefore:72,hpAfter:0,
   realHpLoss:72,lethalHpZero:true});
  expect(stats.humanCpuDirectHits).toBe(2);
  // The 60Hz CpuAgentSystem native splat lifecycle has NOT run yet.
  expect(target.lifeState).toBe('ACTIVE');
  expect(cpu.applyProjectileHit(event,10,'HUMAN')).toBeNull();
 });
 it('never awards a HUMAN hit for an actual CPU projectile',()=>{
  const stats=new PerformanceStats(),{cpu,target}=fixtureCpu(stats);
  const result=cpu.applyProjectileHit({botId:target.id,
   distance:1,point:new Vec3(),guarded:false},25,'CPU','A1');
  expect(result?.realHpLoss).toBe(25);
  expect(stats.humanCpuDirectHits).toBe(0);
 });
});
describe('SOURCE combat center-ray distance',()=>{
 it('requires source controls and leaves the default camera unchanged',()=>{
  const {view}=camera();const query=vi.fn();
  expect(()=>view.enableSourceCombatAim(query)).toThrow('SOURCE_PRACTICE_REQUIRED');
  expect(view.getAimTarget().z).toBeGreaterThan(70);expect(query).not.toHaveBeenCalled();
 });
 it('uses the exact living enemy intersection without applying damage',()=>{
  const {view,from}=camera(),stats=new PerformanceStats();
  const {cpu,target}=fixtureCpu(stats);view.enableSourcePracticeControls();
  view.enableSourceCombatAim((a,b)=>cpu.findNearestCombatHit(a,b,Team.A));
  const point=view.getAimTarget(),hit=cpu.findNearestCombatHit(from,point.clone().add(new Vec3(0,0,.01)),Team.A);
  expect(point.z).toBeGreaterThan(9.6);expect(point.z).toBeLessThan(10);
  expect(hit?.botId).toBe(target.id);expect(target.hp).toBe(100);
  expect(view.sourceCombatAimSnapshot()).toMatchObject({
   id:target.id,guarded:false});
  expect(view.sourceCombatAimSnapshot()!.distanceMeters).toBeGreaterThan(1);
  expect(stats.humanCpuDirectHits).toBe(0);
  target.position.x=2;expect(view.getAimTarget().z).toBeGreaterThan(70);
  expect(view.sourceCombatAimSnapshot()).toBeNull();
  target.position.x=0;target.lifeState='SPLATTED';expect(view.getAimTarget().z).toBeGreaterThan(70);
  target.lifeState='ACTIVE';target.team=Team.A;expect(view.getAimTarget().z).toBeGreaterThan(70);
 });
 it('never queries beyond original world cover and gives cover priority at ties',()=>{
  const block=new Vec3(.495,1.06,-1),{view}=camera(block);
  const {cpu}=fixtureCpu(new PerformanceStats());view.enableSourcePracticeControls();
  view.enableSourceCombatAim((a,b)=>cpu.findNearestCombatHit(a,b,Team.A));
  expect(view.getAimTarget().equals(block)).toBe(true);
  expect(view.sourceCombatAimSnapshot()).toBeNull();
  const query:CombatAimQuery=(a,b)=>({point:b.clone(),distance:a.distance(b)});
  view.enableSourceCombatAim(query);expect(view.getAimTarget().equals(block)).toBe(true);
 });
 it('rejects malformed queries',()=>{
  const {view}=camera();view.enableSourcePracticeControls();
  for(const distance of [NaN,Infinity,-1,1000]){
   view.enableSourceCombatAim(()=>({point:new Vec3(0,0,10),distance}));
   expect(view.getAimTarget().z).toBeGreaterThan(70);
  }
 });
 it('keeps a real original Rapier landing slab ahead of an occluded test actor',async()=>{
  const stage=originalStage;
  const solid=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-negative-z')!;
  const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
  const foot=nearestT21SourceSupportedLanding(solid,{x:link.start[0],y:link.start[1],z:link.start[2]});
  const physics=originalPhysics;
  const from=new Vec3(foot.x,foot.y+2,foot.z);
  const canvas={addEventListener:vi.fn(),getBoundingClientRect:()=>({width:1600,height:900})};
  const entity={camera:{nearClip:0,farClip:100,
   screenToWorld:(_x:number,_y:number,d:number)=>from.clone().add(new Vec3(0,-d,0))}};
  const view=new ThirdPersonCamera(canvas as never,entity as never,[],physics);
  const {cpu,target}=fixtureCpu(new PerformanceStats());
  target.position.set(foot.x,foot.y-3,foot.z); // explicitly occluded UNIT fixture
  const unbounded=cpu.findNearestCombatHit(from,from.clone().add(new Vec3(0,-8,0)),Team.A);
  expect(unbounded?.botId).toBe(target.id);
  view.enableSourcePracticeControls();view.enableSourceCombatAim((a,b)=>cpu.findNearestCombatHit(a,b,Team.A));
  const aim=view.getAimTarget();
  expect(aim.y).toBeCloseTo(foot.y,2);expect(target.hp).toBe(100);
  expect(physics.castStageSegment(from,aim.clone().add(new Vec3(0,-.1,0)),'ink-projectile')?.solidId).toBe(solid.id);
  expect([stage.solids.length,stage.paintSurfaces.length,stage.navigationLinks!.length]).toEqual([25,17,26]);
 });
 it('corrects far-background ballistic compensation; real projectile alone awards HP damage',()=>{
  function shoot(actorDistance:boolean){
   const stats=new PerformanceStats(),{cpu,target}=fixtureCpu(stats),{view}=camera();
   if(actorDistance){view.enableSourcePracticeControls();view.enableSourceCombatAim((a,b)=>cpu.findNearestCombatHit(a,b,Team.A));}
   const resources=new PlayerResources(stats),app={root:new Entity('UNIT_ONLY')};
   const feedback={shot:vi.fn(),impact:vi.fn(),updateChargeVisual:vi.fn()};
   const projectile=new ProjectileSystem(app as never,[],{castStageSegment:()=>null} as never,
    {enqueue:vi.fn()} as never,resources,new CombatTargetSystem(app as never,stats,false),cpu,feedback as never,stats);
   const body=new Vec3(0,0,0),muzzle=new Vec3(0,.42,.58);
   const aim=projectile.solvePlayerLaunchDirection(muzzle,view.getAimTarget());
   for(let i=0;i<100;i++)projectile.fixedUpdate(1/60,i===0,false,muzzle,aim,Team.A,body,true,false);
   return {hp:target.hp,hits:stats.humanCpuDirectHits};
  }
  expect(shoot(false)).toEqual({hp:100,hits:0});
  const corrected=shoot(true);expect(corrected.hp).toBeLessThan(100);expect(corrected.hits).toBe(1);
 });
});

describe('B375 actual source-only mouse sensitivity',()=>{
 it('leaves frozen default camera at the 1.0x original look rate',()=>{
  const {view,canvas}=camera();
  const key=vi.mocked(window.addEventListener).mock.calls.find(q=>q[0]==='keydown')![1] as (e:any)=>void;
  const move=vi.mocked(document.addEventListener).mock.calls.find(q=>q[0]==='mousemove')![1] as (e:any)=>void;
  Object.assign(document,{pointerLockElement:canvas});
  key({code:'BracketRight',repeat:false,altKey:false,ctrlKey:false,
   metaKey:false,preventDefault:vi.fn()});
  move({movementX:10,movementY:-10});
  const s=view.sourcePracticeViewSnapshot();
  expect(s.sourcePracticeOnly).toBe(false);
  expect(s.sourceAimSensitivityMultiplier).toBe(1);
  expect(s.sourceAimSensitivityAffectsPhysics).toBe(false);
  expect(s.yawDegrees).toBeCloseTo(2.2,5);
  expect(s.pitchDegrees).toBeCloseTo(-10.2,5);
 });
 it('requires genuine source pointer lock; ignores repeat/modifier and clamps sensitivity',()=>{
  const {view,canvas}=camera();
  const key=vi.mocked(window.addEventListener).mock.calls.find(q=>q[0]==='keydown')![1] as (e:any)=>void;
  const move=vi.mocked(document.addEventListener).mock.calls.find(q=>q[0]==='mousemove')![1] as (e:any)=>void;
  const event=(code:string,overrides:Record<string,unknown>={})=>({
   code,repeat:false,altKey:false,ctrlKey:false,metaKey:false,
   preventDefault:vi.fn(),...overrides
  });
  view.enableSourcePracticeControls();
  key(event('BracketRight'));
  expect(view.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier).toBe(1);
  Object.assign(document,{pointerLockElement:canvas});
  key(event('BracketRight',{repeat:true}));
  key(event('BracketRight',{altKey:true}));
  expect(view.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier).toBe(1);
  const accepted=event('BracketRight');key(accepted);
  expect(accepted.preventDefault).toHaveBeenCalledOnce();
  expect(view.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier).toBe(1.25);
  move({movementX:10,movementY:-10});
  expect(view.sourcePracticeViewSnapshot()).toMatchObject({
   sourceAimSensitivityMultiplier:1.25,sourceAimSensitivityAffectsPhysics:false});
  expect(view.sourcePracticeViewSnapshot().yawDegrees).toBeCloseTo(2.75,5);
  expect(view.sourcePracticeViewSnapshot().pitchDegrees).toBeCloseTo(-9.75,5);
  for(let i=0;i<10;i++)key(event('BracketRight'));
  expect(view.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier).toBe(1.75);
  for(let i=0;i<10;i++)key(event('BracketLeft'));
  expect(view.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier).toBe(.5);
  key(event('KeyQ'));
  expect(view.sourcePracticeViewSnapshot().shoulderSide).toBe('LEFT');
  expect([originalStage.solids.length,originalStage.paintSurfaces.length,
   originalStage.navigationLinks?.length]).toEqual([25,17,26]);
 });
});
