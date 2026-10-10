import {describe,it,expect} from 'vitest';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
describe('Phase14C Crowd 60Hz speed-of-traversal negative authority gate',()=>{
 it('accepts nominal physical 60Hz displacement but detects Recast off-mesh teleport',()=>{
  const start={x:0,y:7.5,z:0};
  const normal=auditPhase14CrowdFrame(start,{x:.065,y:7.495,z:0},1/60);
  expect(normal.suspectedInstantTransition).toBe(false);
  expect(normal.maximumContinuousStepMeters).toBeGreaterThan(.4);
  expect(normal.maximumContinuousStepMeters).toBeLessThan(.6);
  const teleport=auditPhase14CrowdFrame(start,{x:.25,y:3,z:0},1/60);
  expect(teleport.suspectedInstantTransition).toBe(true);
  expect(teleport.verticalChangeMeters).toBe(4.5);
  expect(teleport.impliedSpeedMetersPerSecond).toBeGreaterThan(250);
 });
 it('fails closed on bad timestamps and invalid positions',()=>{
  const p={x:0,y:0,z:0};
  expect(()=>auditPhase14CrowdFrame(p,p,0)).toThrow();
  expect(()=>auditPhase14CrowdFrame(p,{x:NaN,y:0,z:0},1/60)).toThrow();
 });
});
