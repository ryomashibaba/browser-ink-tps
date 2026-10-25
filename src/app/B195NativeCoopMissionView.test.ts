import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun,type B25PracticeFrame} from './UndertowF3SourcePaintRun';
import {b195NativeCoopMissionView as view} from './B195NativeCoopMissionView';
const real=(tick:number,ink:number,x:number,a1:number,impacts:number):B25PracticeFrame=>({
 tick,paused:false,stopReason:null,inputLocked:true,sessionEnded:false,
 sourceSolids:25,paintableSurfaces:17,originalNavLinks:26,scoreableSurfaces:0,
 foot:{x,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
 ink:{changedHumanImpactCells:ink,changedHumanImpactEvents:ink?4:0,
  sourceOnly:true,scoreablePromotionCount:0},
 ally:{allyId:'A1',qaOptIn:true,realOriginalSourceOnly:true,
  genuineOriginalA1AimChangedImpactCells:a1,
  genuineOriginalA1AimImpactEvents:impacts,scoreablePromotionCount:0}
});
describe('B195 real native A1 co-op play HUD uses accepted physical evidence',()=>{
 it('armed challenge is not a Turf winner',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('ALLY_SYNC');
  const v=view(r.snapshot(),false);
  expect(v.state).toBe('ARMED');expect(v.verifiedClear).toBe(false);
  expect(v.originalScoreable).toBe(0);expect(v.officialWinner).toBe('NONE');
 });
 it('prior A1 history does not appear as genuine newly earned impacts',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('ALLY_SYNC');
  r.observe(real(1,0,0,85,2));
  r.observe(real(2,210,.2,85,2));
  const v=view(r.snapshot(),true);
  expect(v.a1).toBe(0);expect(v.a1Pct).toBe(0);
  expect(v.a1Impacts).toBe(0);expect(v.verifiedClear).toBe(false);
 });
 it('actual human paint and grounded move then true A1 shot impact clear',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('ALLY_SYNC');
  r.observe(real(1,0,0,85,2));
  expect(view(r.snapshot(),true).headline).toContain('PAINT');
  for(let t=2;t<=50;t++)r.observe(real(t,205,(t-1)*.25,85,2));
  let s=view(r.snapshot(),true);
  expect(s.state).toBe('ACTIVE');expect(s.headline).toContain('A1');
  expect(s.a1Pct).toBe(0);
  r.observe(real(51,205,12.5,116,3));
  s=view(r.snapshot(),true);
  expect(s.verifiedClear).toBe(true);
  expect(s.state).toBe('CLEAR');expect(s.a1Pct).toBe(100);
  expect(s.naturalOpponentPathCertified).toBe(false);
 });
 it('never upgrades interrupted source practice into a win',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('ALLY_SYNC');
  r.observe(real(1,0,0,0,0));r.abort('PLAYER_POINTER_UNLOCKED');
  expect(view(r.snapshot(),true).state).toBe('ABORTED');
  expect(view(r.snapshot(),true).verifiedClear).toBe(false);
 });
});
