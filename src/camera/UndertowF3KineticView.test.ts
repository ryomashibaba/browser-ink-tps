import {describe,it,expect} from 'vitest';
import {UndertowF3KineticView,B27_SOURCE_BASE_FOV_DEGREES,
 B27_SOURCE_MAX_FOV_DEGREES} from './UndertowF3KineticView';
import type {SourceKineticFoot} from './UndertowF3KineticView';
const foot=(tick:number,x:number,override:Partial<SourceKineticFoot>={}):SourceKineticFoot=>({
 tick,x,y:5,z:0,grounded:true,alive:true,
 sourceOriginalCollisionOnly:true,...override
});
describe('W10-B27 opt-in real certified source grounded camera pace',()=>{
 it('real 60Hz consecutive human ground movement expands actual bounded lens',()=>{
  const view=new UndertowF3KineticView();
  expect(view.snapshot().fieldOfViewDegrees).toBe(B27_SOURCE_BASE_FOV_DEGREES);
  for(let i=0;i<60;i++){
   view.sampleNativeFoot(foot(i, i*(5.2/60)));
   view.advanceVisual(1/60,true,false);
  }
  const s=view.snapshot();
  expect(s.acceptedGroundedSteps).toBe(59);
  expect(s.nativeGroundSpeedMetersPerSecond).toBeCloseTo(5.2,1);
  expect(s.fieldOfViewDegrees).toBeGreaterThan(65);
  expect(s.fieldOfViewDegrees).toBeLessThanOrEqual(B27_SOURCE_MAX_FOV_DEGREES);
  expect(s.stageGeometryModified).toBe(false);
  expect(s.movementControllerModified).toBe(false);
  expect(s.weaponAimAssistAdded).toBe(false);
 });
 it('standing still decays naturally, never adds fake acceleration',()=>{
  const v=new UndertowF3KineticView();
  for(let i=0;i<45;i++){v.sampleNativeFoot(foot(i,i*.085));
   v.advanceVisual(1/60,true,false);}
  const boosted=v.snapshot().fieldOfViewDegrees;
  for(let i=45;i<70;i++){v.sampleNativeFoot(foot(i,44*.085));
   v.advanceVisual(1/60,true,false);}
  expect(boosted).toBeGreaterThan(65);
  expect(v.snapshot().fieldOfViewDegrees).toBeLessThan(boosted);
  expect(v.snapshot().nativeGroundSpeedMetersPerSecond).toBe(0);
 });
 it('airborne/respawn/teleport cannot mint physical velocity',()=>{
  const v=new UndertowF3KineticView();
  v.sampleNativeFoot(foot(10,0));
  v.sampleNativeFoot(foot(11,100));
  v.advanceVisual(.1,true,false);
  expect(v.snapshot().fieldOfViewDegrees).toBe(63);
  v.sampleNativeFoot(foot(12,100.08,{grounded:false}));
  v.advanceVisual(.1,true,false);
  expect(v.snapshot().fieldOfViewDegrees).toBe(63);
  v.sampleNativeFoot(foot(13,100.08,{alive:false}));
  v.sampleNativeFoot(foot(14,100.08));
  expect(v.snapshot().nativeGroundSpeedMetersPerSecond).toBe(0);
  expect(v.snapshot().ignoredUncertifiedSteps).toBeGreaterThan(0);
 });
 it('fixed-tick gaps, vertical scene gaps and no original collider remove boosts',()=>{
  const v=new UndertowF3KineticView();
  v.sampleNativeFoot(foot(1,0));
  v.sampleNativeFoot(foot(10,.12));
  expect(v.snapshot().nativeGroundSpeedMetersPerSecond).toBe(0);
  v.sampleNativeFoot(foot(11,.15,{y:12}));
  expect(v.snapshot().nativeGroundSpeedMetersPerSecond).toBe(0);
  v.sampleNativeFoot(foot(12,.25,{sourceOriginalCollisionOnly:false}));
  expect(v.snapshot().targetFovDegrees).toBe(63);
 });
 it('pauses and pointer unlock cannot maintain a camera speed advantage',()=>{
  const v=new UndertowF3KineticView();
  for(let i=0;i<60;i++){v.sampleNativeFoot(foot(i,i*.1));v.advanceVisual(1/60,true,false);}
  expect(v.snapshot().fieldOfViewDegrees).toBeGreaterThan(65);
  for(let i=0;i<30;i++)v.advanceVisual(1/60,false,true);
  expect(v.snapshot().fieldOfViewDegrees).toBeLessThan(64);
  v.resetVisual();
  expect(v.snapshot()).toMatchObject({
   fieldOfViewDegrees:63,targetFovDegrees:63,
   nativeGroundSpeedMetersPerSecond:0,
   officialTurfScore:'UNAVAILABLE',
   productionAuthorized:false,
   runtimeCollisionNavOrPaintModified:false
  });
 });
});
