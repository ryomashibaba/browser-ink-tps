import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {ProjectileSystem} from './ProjectileSystem';
import {PaintEventType,PaintSource,SurfaceFlags,Team} from '../ink/types';
import {sourceNativeMeleePaintFoot,sourceNativeMeleeStampAllowed}
 from './NativeSourceMeleePaintSupport';

describe('real original SOURCE human roller brush splatana ink',()=>{
 // B448 #43335171546 genuine human KCC foot, not simulated movement.
 const body=new Vec3(.016965974122285843,8.39577865600586,67.74100494384766);
 const id='UndertowT21D:spawn-high-positive-z';
 const original={solidId:id,point:new Vec3(body.x,7.5,body.z)};
 it('replaces actual 0.8938m body-floor mismatch with true original Rapier foot',()=>{
  const foot=sourceNativeMeleePaintFoot(body,true,original);
  expect(body.y-7.502).toBeGreaterThan(.85); // original brush fails
  expect(foot).not.toBeNull();
  expect(Math.abs(foot!.y-7.502)).toBeLessThan(.85);
  expect(foot!.y).toBe(7.5);
  expect(body.y).toBe(8.39577865600586); // no actor relocation
 });
 it('fails closed on missing, airborne and nonphysical support',()=>{
  expect(sourceNativeMeleePaintFoot(body,false,original)).toBeNull();
  expect(sourceNativeMeleePaintFoot(body,true,null)).toBeNull();
  expect(sourceNativeMeleePaintFoot(body,true,{solidId:'',point:original.point})).toBeNull();
  expect(sourceNativeMeleePaintFoot(body,true,{solidId:id,point:new Vec3(0,6,0)})).toBeNull();
  expect(sourceNativeMeleePaintFoot(new Vec3(NaN,8,0),true,original)).toBeNull();
 });
 it('stamps only backed original paint surface without nearer original blocker',()=>{
  const target=new Vec3(body.x+1,7.5,body.z),hit={solidId:id,point:target};
  expect(sourceNativeMeleeStampAllowed(original.point,target,id+':paint',hit,null)).toBe(true);
  expect(sourceNativeMeleeStampAllowed(original.point,target,id+':paint',hit,.5)).toBe(false);
  expect(sourceNativeMeleeStampAllowed(original.point,target,'UndertowT21D:other:paint',hit,null)).toBe(false);
  expect(sourceNativeMeleeStampAllowed(original.point,target,id+':paint',null,null)).toBe(false);
  expect(sourceNativeMeleeStampAllowed(original.point,target,id+':paint',
    {...hit,point:new Vec3(target.x,8.5,target.z)},null)).toBe(false);
 });
});

describe('ProjectileSystem authentic SOURCE melee surface selection',()=>{
 // Isolated overlap fixture, not new original stage data or a native run.
 // Call the actual game method with known original registered IDs.
 const backed='UndertowT21D:first-drop-landing-positive-z:paint';
 const other='UndertowT21D:spawn-high-positive-z:paint';
 function setup(){
  const events:{surfaceId:string}[]=[];
  const state={supported:true,blocker:null as number|null};
  const surface=(id:string,distance:number)=>({
   id,baseFlags:SurfaceFlags.Paintable,
   uAxis:new Vec3(1,0,0),vAxis:new Vec3(0,0,1),
   projectWorldPoint:()=>({inside:true,planeDistance:distance,u:.5,v:.5})
  });
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const internal=game as unknown as {
   surfaces:unknown;physics:unknown;coordinator:unknown;
  };
  internal.surfaces=[surface(other,.02),surface(backed,.07)];
  internal.physics={
   castCharacterFootSupport:()=>state.supported?{
    solidId:'UndertowT21D:first-drop-landing-positive-z',
    point:new Vec3(1,7.5,0)
   }:null,
   castStageSegment:()=>state.blocker===null?null:{distance:state.blocker}
  };
  internal.coordinator={enqueue:(item:{surfaceId:string})=>{
   events.push({surfaceId:item.surfaceId});
  }};
  const paint=(foot?:Vec3)=>{
   const native=game as unknown as {
    paintWorldStamp:(...args:unknown[])=>boolean;
   };
   return native.paintWorldStamp(Team.A,new Vec3(1,7.5,0),
    .5,.3,new Vec3(1,0,0),.8,PaintEventType.Impact,
    PaintSource.Human,undefined,foot);
  };
  return {state,events,paint};
 }
 it('selects original supported surface despite geometrically nearer other layer',()=>{
  const x=setup();
  expect(x.paint(new Vec3(0,7.5,0))).toBe(true);
  expect(x.events).toEqual([{surfaceId:backed}]);
 });
 it('does not paint absent support or across original physical blocker',()=>{
  const x=setup();
  x.state.supported=false;
  expect(x.paint(new Vec3(0,7.5,0))).toBe(false);
  x.state.supported=true;x.state.blocker=.2;
  expect(x.paint(new Vec3(0,7.5,0))).toBe(false);
  expect(x.events).toEqual([]);
 });
 it('preserves the unchanged non-SOURCE planar selection',()=>{
  const x=setup();
  expect(x.paint()).toBe(true);
  expect(x.events).toEqual([{surfaceId:other}]);
 });
});

/** Real CPU melee runs the same physical-foot-to-original-paint gate.
 * Synthetic overlapping surfaces are a negative fixture, not game geometry. */
describe('source CPU original grounded melee cannot ink other layers',()=>{
 const backed='UndertowT21D:first-drop-landing-positive-z:paint';
 const other='UndertowT21D:spawn-high-positive-z:paint';
 function setup(){
  const events:string[]=[];
  const state={supported:true,footY:7.5,blocker:null as number|null};
  const surface=(id:string,planeDistance:number)=>({
   id,baseFlags:SurfaceFlags.Paintable,
   uAxis:new Vec3(1,0,0),vAxis:new Vec3(0,0,1),
   projectWorldPoint:()=>({inside:true,planeDistance,u:.5,v:.5})
  });
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const target=game as unknown as {
   surfaces:unknown;physics:unknown;coordinator:unknown;feedback:unknown;
   stats:unknown;slots:unknown;cpuAimDirection:unknown;
   applyMeleeDamage:()=>void;
   solveLaunchDirection:()=>Vec3;
   executeCpuRollerFlick:(req:unknown,profile:unknown)=>void;
   executeCpuRollerRoll:(req:unknown,profile:unknown)=>void;
   executeCpuBrushSwipe:(req:unknown,profile:unknown)=>void;
   executeCpuSplatanaRelease:(req:unknown,profile:unknown)=>void;
  };
  target.surfaces=[surface(other,.02),surface(backed,.07)];
  target.physics={
   castCharacterFootSupport:(body:Vec3)=>state.supported?{
    solidId:'UndertowT21D:first-drop-landing-positive-z',
    point:new Vec3(body.x,state.footY,body.z)
   }:null,
   castStageSegment:()=>state.blocker===null?null:{distance:state.blocker}
  };
  target.coordinator={enqueue:(paint:{surfaceId:string})=>events.push(paint.surfaceId)};
  target.feedback={melee:()=>{}};
  target.stats={projectilePoolDrops:0};
  target.slots=[];
  target.cpuAimDirection=new Vec3(1,0,0);
  target.applyMeleeDamage=()=>{};
  target.solveLaunchDirection=()=>new Vec3(1,0,0);
  const execute=(action:'FLICK'|'ROLL'|'BRUSH'|'SPLATANA',paid=true)=>{
   const request={
    sourceId:'A1',team:Team.A,weaponId:'ink-saber',
    origin:new Vec3(0,8.3,0),bodyPosition:new Vec3(0,7.5,0),
    target:new Vec3(2,7.5,0),charge:0.3,
    sourceInkTransaction:paid?{
     chargedInkCost:1,expectedInkAfterCharge:70,
     originalRecoveryLockSeconds:0,originalFireRemainingSeconds:0
    }:undefined
   };
   const profile={rollPaintRadiusMeters:.8};
   if(action==='FLICK')target.executeCpuRollerFlick(request,profile);
   if(action==='ROLL')target.executeCpuRollerRoll(request,profile);
   if(action==='BRUSH')target.executeCpuBrushSwipe(request,profile);
   if(action==='SPLATANA')target.executeCpuSplatanaRelease(request,profile);
  };
  return {events,state,execute};
 }
 it('SOURCE four melee actions paint only their real Rapier-backed 17-surface ID',()=>{
  for(const action of ['FLICK','ROLL','BRUSH','SPLATANA'] as const){
   const x=setup();
   x.execute(action);
   expect(x.events.length).toBeGreaterThan(0);
   expect(x.events.every(id=>id===backed)).toBe(true);
  }
 });
 it('SOURCE grounded melee fails closed if physical support missing or displaced',()=>{
  for(const action of ['FLICK','ROLL','BRUSH','SPLATANA'] as const){
   const x=setup();
   x.state.supported=false;x.execute(action);
   expect(x.events).toEqual([]);
   x.state.supported=true;x.state.footY=6.7;x.execute(action);
   expect(x.events).toEqual([]);
  }
 });
 it('does not change uncharged old CPU planar paint selection',()=>{
  const x=setup();
  x.state.supported=false;
  x.execute('ROLL',false);
  expect(x.events).toEqual([other]);
 });
});

describe('SOURCE registered Rapier cover governs genuine melee HP contact',()=>{
 function fixture(){
  const damage={cpu:0,human:0}, state:{block:number|null}={block:.3};
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const actor=game as unknown as {
   nativeSourceHumanPhysicalMode:unknown;physics:unknown;cpuAgents:unknown;
   combatTargets:unknown;resources:unknown;currentHumanDamageable:boolean;
   currentHumanTeam:Team;currentHumanPosition:Vec3;
   currentHumanGuarding:boolean;stats:unknown;
   applyMeleeDamage:(...args:unknown[])=>void;
  };
  actor.nativeSourceHumanPhysicalMode=()=> 'HUMAN';
  actor.physics={castStageSegment:()=>state.block===null?
   null:{distance:state.block}};
  actor.cpuAgents={applyAreaDamage:(
    _center:Vec3,_radius:number,_damage:number,_team:Team,
    clear?:((body:Vec3)=>boolean)
  )=>{if(!clear||clear(new Vec3(.9,.68,0)))damage.cpu++;}};
  actor.combatTargets={applyAreaDamage:()=>{}};
  actor.resources={currentHp:100,applyDamage:()=>{damage.human++;}};
  actor.currentHumanDamageable=true;
  actor.currentHumanTeam=Team.A;
  actor.currentHumanPosition=new Vec3(1,.68,0);
  actor.currentHumanGuarding=false;
  actor.stats={cpuPlayerHits:0};
  const swing=()=>actor.applyMeleeDamage(new Vec3(.8,.68,0),
    2,24,Team.B,new Vec3(0,.68,0));
  return {state,actor,damage,swing};
 }
 it('blocks ghost melee HP across registered original walls',()=>{
  const x=fixture();x.swing();
  expect(x.damage).toEqual({cpu:0,human:0});
  expect(x.actor.stats).toEqual({cpuPlayerHits:0});
 });
 it('allows real clear stage LOS and near-target wall contacts',()=>{
  for(const distance of [null,.99] as const){
   const x=fixture();x.state.block=distance;x.swing();
   expect(x.damage).toEqual({cpu:1,human:1});
  }
 });
 it('leaves non-SOURCE T20 melee rules unchanged',()=>{
  const x=fixture();x.actor.nativeSourceHumanPhysicalMode=null;x.swing();
  expect(x.damage.cpu).toBe(1);
 });
});
describe('CPU real melee line of sight checked before actual HP loss',()=>{
 it('rejects blocked bot, permits clear bot and unchanged nonmelee blast',async()=>{
  const {CpuAgentSystem}=await import('../ai/CpuAgentSystem');
  const sys=Object.create(CpuAgentSystem.prototype) as InstanceType<typeof CpuAgentSystem>;
  const inner=sys as unknown as {bots:unknown;stats:unknown;f3dSourceGoals:unknown};
  const bot={id:'B1',team:Team.B,lifeState:'ACTIVE',hp:100,
   position:new Vec3(1,0,0),mobilityState:'GROUND',
   weaponGuarding:false,hpRecoveryDelaySeconds:0};
  inner.bots=[bot];inner.stats={cpuCombatHits:0};inner.f3dSourceGoals=null;
  const center=new Vec3(1,.68,0),ys:number[]=[];
  expect(sys.applyAreaDamage(center,1.3,24,Team.A,body=>{
   ys.push(body.y);return false;
  })).toBe(0);
  expect(bot.hp).toBe(100);expect(ys).toEqual([.68]);
  expect(sys.applyAreaDamage(center,1.3,24,Team.A,()=>true)).toBe(1);
  expect(bot.hp).toBe(76);
  expect(sys.applyAreaDamage(center,1.3,24,Team.A)).toBe(1);
  expect(bot.hp).toBe(52);
 });
});

describe('native ORIGINAL SOURCE 7-CPU true-capsule area damage',()=>{
 async function fixture(){
  const {CpuAgentSystem}=await import('../ai/CpuAgentSystem');
  const sys=Object.create(CpuAgentSystem.prototype) as InstanceType<typeof CpuAgentSystem>;
  const internal=sys as unknown as {bots:unknown;stats:unknown;f3dSourceGoals:unknown};
  const bot={id:'B1',team:Team.B,lifeState:'ACTIVE',hp:100,
   position:new Vec3(0,0,0),mobilityState:'GROUND',
   weaponGuarding:false,hpRecoveryDelaySeconds:0};
  internal.bots=[bot];internal.stats={cpuCombatHits:0};
  internal.f3dSourceGoals={}; // existing authorized SOURCE stage fixture
  return {sys,bot};
 }
 it('counts genuine near-foot CPU capsule blast contact that center sphere missed',async()=>{
  const x=await fixture();
  const center=new Vec3(0,.07,0);
  expect(x.sys.applyAreaDamage(center,.13,18,Team.A,undefined,true)).toBe(1);
  expect(x.bot.hp).toBe(82);
  const legacy=await fixture();
  expect(legacy.sys.applyAreaDamage(center,.13,18,Team.A)).toBe(0);
  expect(legacy.bot.hp).toBe(100);
 });
 it('genuine capsule hit near upper body and lateral rim; misses outside',async()=>{
  const head=await fixture();
  expect(head.sys.applyAreaDamage(new Vec3(0,1.31,0),.12,25,
    Team.A,undefined,true)).toBe(1);
  expect(head.bot.hp).toBe(75);
  const lateral=await fixture();
  expect(lateral.sys.applyAreaDamage(new Vec3(.38,.68,0),.12,25,
    Team.A,undefined,true)).toBe(1);
  const outside=await fixture();
  expect(outside.sys.applyAreaDamage(new Vec3(.6,.68,0),.12,25,
    Team.A,undefined,true)).toBe(0);
  expect(outside.bot.hp).toBe(100);
 });
 it('keeps own-team immunity and source melee cover veto before real HP',async()=>{
  const x=await fixture();
  expect(x.sys.applyAreaDamage(new Vec3(0,.1,0),.2,30,
    Team.B,undefined,true)).toBe(0);
  expect(x.sys.applyAreaDamage(new Vec3(0,.1,0),.2,30,
    Team.A,()=>false,true)).toBe(0);
  expect(x.bot.hp).toBe(100);
 });
 it('ProjectileSystem forwards real SOURCE physical-mode gate only',()=>{
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const native=game as unknown as {
   nativeSourceHumanPhysicalMode:unknown;cpuAgents:unknown;
   combatTargets:unknown;currentHumanDamageable:boolean;
  };
  const flags:boolean[]=[];
  native.cpuAgents={applyAreaDamage:(
    _point:Vec3,_radius:number,_damage:number,_team:Team,
    _clear?:unknown,capsule?:boolean
  )=>{flags.push(capsule===true);return 0;}};
  native.combatTargets={applyAreaDamage:()=>{}};
  native.currentHumanDamageable=false;
  // Object.create bypasses the real constructor's explicit null default.
  // Reproduce the genuine frozen T20 field initialization before testing.
  native.nativeSourceHumanPhysicalMode=null;
  game.applyExternalAreaDamage(new Vec3(0,0,0),1,10,Team.A);
  native.nativeSourceHumanPhysicalMode=()=> 'HUMAN';
  game.applyExternalAreaDamage(new Vec3(0,0,0),1,10,Team.A);
  expect(flags).toEqual([false,true]);
 });
});
