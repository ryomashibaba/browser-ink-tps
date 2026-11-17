import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {PlayerController,nativeSourceNextJumpBufferSeconds,
 nativeSourceWallReleaseVerticalVelocity,nativeSourceWallSurgeRequested,
 nativeSourceSquidRollJumpRequested} from './PlayerController';

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

describe('Issue #19 SOURCE wall-release and exclusive-motion responsiveness',()=>{
 it('drops only inherited upward wall-climb drive on Shift release',()=>{
  expect(nativeSourceWallReleaseVerticalVelocity('SWIM_WALL',5.4)).toBe(0);
  expect(nativeSourceWallReleaseVerticalVelocity('SURGE_CHARGE',.2)).toBe(0);
  expect(nativeSourceWallReleaseVerticalVelocity('SWIM_WALL',-3)).toBe(-3);
  expect(nativeSourceWallReleaseVerticalVelocity('SURGE',8.2)).toBe(8.2);
  expect(nativeSourceWallReleaseVerticalVelocity('SQUID_ROLL',5.1)).toBe(5.1);
  expect(nativeSourceWallReleaseVerticalVelocity('HUMAN',8.2)).toBe(8.2);
 });
 it('clears leftover upward wall-swim speed while Shift stays down but OWN wall vanishes',()=>{
  // Real OWN-wall probing already rejected the wall; the player must not
  // continue climbing in air solely from the previous physics tick.
  const lastWallState='SWIM_WALL' as const;
  const released=nativeSourceWallReleaseVerticalVelocity(lastWallState,5.4);
  expect(released).toBe(0);
  // Leaving a wall while descending must preserve legitimate falling.
  expect(nativeSourceWallReleaseVerticalVelocity(lastWallState,-2.5))
   .toBe(-2.5);
  // No artificial brake on a real KCC jump/roll or authenticated surge.
  expect(nativeSourceWallReleaseVerticalVelocity('SQUID_DRY',8.2))
   .toBe(8.2);
  expect(nativeSourceWallReleaseVerticalVelocity('SURGE',10.6))
   .toBe(10.6);
 });
 it('retains valid pre-landing Space until real contact and expires at 100ms',()=>{
  expect(nativeSourceNextJumpBufferSeconds(0,true,1/60,true,false))
   .toBeCloseTo(.1);
  expect(nativeSourceNextJumpBufferSeconds(.1,false,.05,true,false))
   .toBeCloseTo(.05);
  expect(nativeSourceNextJumpBufferSeconds(.05,false,.06,true,false))
   .toBe(0);
 });
 it('never carries a Space tap out of dodge/surge/roll or Pointer Lock loss',()=>{
  expect(nativeSourceNextJumpBufferSeconds(.08,true,1/60,true,true))
   .toBe(0);
  expect(nativeSourceNextJumpBufferSeconds(.08,false,1/60,false,false))
   .toBe(0);
  expect(nativeSourceNextJumpBufferSeconds(.08,true,1/60,false,false))
   .toBe(0);
  // Regained live controls need a genuinely new physical press.
  expect(nativeSourceNextJumpBufferSeconds(0,false,1/60,true,false))
   .toBe(0);
 });
});


describe('Issue #19 native SOURCE: short Space survives real squid actions',()=>{
 it('launches a minimum-charge surge for a real one-tick wall Space tap',()=>{
  // Called ONLY after findOwnWallSample establishes an actual OWN wall.
  expect(nativeSourceWallSurgeRequested(false,0,true,true)).toBe(true);
  // The frozen T20 behaviour remains held-key/charged-state only.
  expect(nativeSourceWallSurgeRequested(false,0,true,false)).toBe(false);
  expect(nativeSourceWallSurgeRequested(true,0,false,false)).toBe(true);
  expect(nativeSourceWallSurgeRequested(false,.1,false,false)).toBe(true);
  expect(nativeSourceWallSurgeRequested(false,0,false,true)).toBe(false);
 });
 it('uses only an unexpired real Space buffer for a grounded ink roll',()=>{
  // Controller still requires BOTH genuine KCC grounded and the existing
  // OWN-ink reversed-direction roll window before this predicate is used.
  expect(nativeSourceSquidRollJumpRequested(false,true,.06)).toBe(true);
  expect(nativeSourceSquidRollJumpRequested(false,true,0)).toBe(false);
  expect(nativeSourceSquidRollJumpRequested(false,false,.06)).toBe(false);
  expect(nativeSourceSquidRollJumpRequested(true,false,0)).toBe(true);
  const p=playerProbe(true);
  p.grounded=false;
  p.sourceJumpBufferSeconds=.06;
  // The same buffered Space NEVER invents ground contact in tryJump.
  p.tryJump(false,7.5);
  expect(p.verticalVelocity).toBe(0);
  expect(p.grounded).toBe(false);
 });
 it('still expires and clears native Space on pointer loss or dodge',()=>{
  const expired=nativeSourceNextJumpBufferSeconds(.06,false,.08,true,false);
  expect(nativeSourceSquidRollJumpRequested(false,true,expired)).toBe(false);
  const denied=nativeSourceNextJumpBufferSeconds(.06,true,1/60,false,false);
  expect(nativeSourceSquidRollJumpRequested(false,true,denied)).toBe(false);
  const dodge=nativeSourceNextJumpBufferSeconds(.06,true,1/60,true,true);
  expect(nativeSourceSquidRollJumpRequested(false,true,dodge)).toBe(false);
 });
});
