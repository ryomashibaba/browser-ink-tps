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
