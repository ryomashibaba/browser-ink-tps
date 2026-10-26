import {describe,it,expect} from 'vitest';
import {fixedStepLaunch} from './FixedStepLaunch';

// Explicit synthetic target coordinates. These test the same integration and
// segment interpolation as ProjectileSystem, not a real SOURCE encounter.
function heightAtX(v:{x:number;y:number;z:number}, speed:number, gravity:number, x:number){
 const dt=1/60; let px=0,py=0,vy=v.y*speed;
 for(let i=0;i<120;i++){
  vy-=gravity*dt;
  const nx=px+v.x*speed*dt, ny=py+vy*dt;
  if(nx>=x)return py+(ny-py)*(x-px)/(nx-px);
  px=nx;py=ny;
 }
 throw Error('target beyond test trajectory');
}
describe('fixed-step CPU ballistic aim',()=>{
 it.each([[10,0,20,13],[8,1,22,5.2],[6,-1,28,4]])('reaches a stationary aim point under the actual tick integration', (x,y,speed,g)=>{
  const v=fixedStepLaunch(x,y,0,speed,g,1/60,1.65)!;
  expect(v).not.toBeNull();
  expect(Math.hypot(v.x,v.y,v.z)).toBeCloseTo(1,6);
  expect(heightAtX(v,speed,g,x)).toBeCloseTo(y,5);
 });
 it('rejects invalid and unreachable solutions without inventing hits',()=>{
  expect(fixedStepLaunch(100,20,0,10,13,1/60,.5)).toBeNull();
  expect(fixedStepLaunch(NaN,0,0,20,13,1/60,1)).toBeNull();
 });
});
import {ProjectileSystem} from './ProjectileSystem';
import {Vec3} from 'playcanvas';
import {weaponProfile,DEFAULT_WEAPON_ID} from '../weapons/WeaponCatalog';

it('the selected source ProjectileSystem corrects the measured baseline drop',()=>{
 const system=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
 const profile=weaponProfile(DEFAULT_WEAPON_ID);
 const before=system.solveLaunchDirection(new Vec3(0,0,0),new Vec3(10,0,0),new Vec3(),profile);
 const oldHeight=heightAtX(before,profile.speedMetersPerSecond,profile.gravityMetersPerSecond2,10);
 system.enableSourceFixedStepAim();
 const after=system.solveLaunchDirection(new Vec3(0,0,0),new Vec3(10,0,0),new Vec3(),profile);
 expect(oldHeight).toBeLessThan(-.01);
 expect(Math.abs(heightAtX(after,profile.speedMetersPerSecond,profile.gravityMetersPerSecond2,10))).toBeLessThan(.00001);
});
