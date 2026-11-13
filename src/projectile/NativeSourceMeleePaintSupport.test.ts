import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
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
