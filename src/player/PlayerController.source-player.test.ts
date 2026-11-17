import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {PlayerController} from './PlayerController';

// Unit reconstruction of the actual controller methods. No fake SOURCE
// floor, synthetic navigation links, Chromium pass or official match proof.
type PlayerMotionProbe = {
  nativeSourceGroundInkGuard:boolean;
  desired:Vec3;
  velocity:Vec3;
  verticalVelocity:number;
  grounded:boolean;
  sourceJumpBufferSeconds:number;
  applyHorizontalTarget:(speed:number,acceleration:number,dt:number)=>void;
  tryJump:(pressed:boolean,jumpSpeed:number)=>void;
};
function playerProbe(source:boolean):PlayerMotionProbe{
  const probe=Object.create(PlayerController.prototype) as PlayerMotionProbe;
  probe.nativeSourceGroundInkGuard=source;
  probe.desired=new Vec3();
  probe.velocity=new Vec3();
  probe.verticalVelocity=0;
  probe.grounded=false;
  probe.sourceJumpBufferSeconds=0;
  return probe;
}

describe('Issue #19: genuine SOURCE player steering without changing T20 or physics',()=>{
  it('uses one planar acceleration budget for diagonal and axial WASD',()=>{
    const source=playerProbe(true);
    const legacy=playerProbe(false);
    for(const p of [source,legacy])
      p.desired.set(Math.SQRT1_2,0,Math.SQRT1_2);
    source.applyHorizontalTarget(6,12,1/60);
    legacy.applyHorizontalTarget(6,12,1/60);
    expect(Math.hypot(source.velocity.x,source.velocity.z)).toBeCloseTo(.2,7);
    // Explicit unchanged T20 component-wise baseline.
    expect(Math.hypot(legacy.velocity.x,legacy.velocity.z))
      .toBeCloseTo(.2*Math.SQRT2,7);
    for(let i=0;i<100;i++)source.applyHorizontalTarget(6,12,1/60);
    expect(Math.hypot(source.velocity.x,source.velocity.z)).toBeCloseTo(6,7);
  });
  it('bounds abrupt WASD reversal without altering configured top speed',()=>{
    const p=playerProbe(true);
    p.velocity.set(6,0,0);
    p.desired.set(-1,0,0);
    p.applyHorizontalTarget(6,12,1/60);
    expect(p.velocity.x).toBeCloseTo(5.8,7);
    expect(p.velocity.z).toBe(0);
    for(let i=0;i<100;i++)p.applyHorizontalTarget(6,12,1/60);
    expect(p.velocity.x).toBeCloseTo(-6,7);
  });
  it('keeps brief early Space intent until actual KCC ground contact only',()=>{
    const p=playerProbe(true);
    p.sourceJumpBufferSeconds=.07; // last tick genuinely queued Space
    p.grounded=false;
    p.tryJump(false,7.5);
    expect(p.verticalVelocity).toBe(0);
    expect(p.sourceJumpBufferSeconds).toBe(.07);
    p.grounded=true; // actual KCC result, not an invented floor
    p.tryJump(false,7.5);
    expect(p.verticalVelocity).toBe(7.5);
    expect(p.grounded).toBe(false);
    expect(p.sourceJumpBufferSeconds).toBe(0);
    const t20=playerProbe(false);
    t20.sourceJumpBufferSeconds=.07;
    t20.grounded=true;
    t20.tryJump(false,7.5);
    expect(t20.verticalVelocity).toBe(0);
    t20.tryJump(true,7.5);
    expect(t20.verticalVelocity).toBe(7.5);
  });
  it('does not jump when an expired SOURCE buffer has no fresh press',()=>{
    const p=playerProbe(true);
    p.grounded=true;
    p.sourceJumpBufferSeconds=0;
    p.tryJump(false,7);
    expect(p.verticalVelocity).toBe(0);
    expect(p.grounded).toBe(true);
  });
});
