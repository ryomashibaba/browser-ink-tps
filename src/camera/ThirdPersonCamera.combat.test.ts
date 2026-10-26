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
 return {view:new ThirdPersonCamera(canvas as never,entity as never,[],physics as never),from,direction};
}
function fixtureCpu(stats:PerformanceStats){
 const target={id:'UNIT_ONLY_B1',team:Team.B,position:new Vec3(0,0,10),
  hp:100,lifeState:'ACTIVE',mobilityState:'GROUND',weaponGuarding:false,
  hpRecoveryDelaySeconds:0};
 const cpu=Object.create(CpuAgentSystem.prototype) as CpuAgentSystem;
 Object.assign(cpu,{bots:[target],stats,b213SourceCounterfireEnabled:false});
 return {cpu,target};
}
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
  expect(stats.humanCpuDirectHits).toBe(0);
  target.position.x=2;expect(view.getAimTarget().z).toBeGreaterThan(70);
  target.position.x=0;target.lifeState='SPLATTED';expect(view.getAimTarget().z).toBeGreaterThan(70);
  target.lifeState='ACTIVE';target.team=Team.A;expect(view.getAimTarget().z).toBeGreaterThan(70);
 });
 it('never queries beyond original world cover and gives cover priority at ties',()=>{
  const block=new Vec3(.495,1.06,-1),{view}=camera(block);
  const {cpu}=fixtureCpu(new PerformanceStats());view.enableSourcePracticeControls();
  view.enableSourceCombatAim((a,b)=>cpu.findNearestCombatHit(a,b,Team.A));
  expect(view.getAimTarget().equals(block)).toBe(true);
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
