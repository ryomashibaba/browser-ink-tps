import {describe,expect,it} from 'vitest';
import {UndertowF3OwnerGpuTrial,summarizeOwnerRenderSamples,OWNER_PHASE_MS}
 from './UndertowF3OwnerGpuTrial';
import type {OwnerTrialFrame,OwnerQuality} from './UndertowF3OwnerGpuTrial';

const source=(extra:Partial<OwnerTrialFrame>={}):OwnerTrialFrame=>({
 inputActive:true,paused:false,stopped:false,physicsTick:0,realHumanShots:0,
 cpuInkImpacts:0,cpuPatrolMeters:0,
 originalSolids:25,originalPaintSurfaces:17,originalNavLinks:26,
 scoreablePromotions:0,cameraBlocked:false,...extra
});
describe('W10-B22 owner local render trial never mutates source gameplay',()=>{
 it('takes real three 12s phases, real samples, and restores native',()=>{
  const quality:OwnerQuality[]=[];
  let pixels:[number,number]=[1600,900];
  const t=new UndertowF3OwnerGpuTrial(q=>{
   quality.push(q);pixels=q==='NATIVE'?[1600,900]:[1200,675];
  },()=>pixels);
  expect(t.arm()).toBe(true);
  t.frame(100,source({inputActive:false}));
  expect(t.snapshot().status).toBe('ARMED');
  t.frame(200,source()); // genuine pointer-locked play
  for(let i=1;i<=3*OWNER_PHASE_MS/100;i++){
   const now=200+i*100;
   t.frame(now,source({physicsTick:i*6,realHumanShots:i,
    cpuInkImpacts:i*2,cpuPatrolMeters:i*.13}));
  }
  const snapshot=t.snapshot(36500);
  expect(snapshot.status).toBe('COMPLETE');
  const report=t.report() as {phases: {
   label:string;mode:OwnerQuality;sampleCount:number;
   canvasBackingPixels:[number,number];originalPhysicsTicksDelta:number
  }[];originalSourceAuthority:{scoreableSurfaces:number};
    productionAuthorized:boolean;dataTransferredAutomatically:boolean};
  expect(report.phases.map(v=>v.label)).toEqual(['NATIVE_A','PERFORMANCE_B','NATIVE_A2']);
  expect(report.phases.map(v=>v.canvasBackingPixels)).toEqual([
   [1600,900],[1200,675],[1600,900]]);
  expect(report.phases.every(v=>v.sampleCount>=90&&v.originalPhysicsTicksDelta>0)).toBe(true);
  expect(quality).toEqual(['NATIVE','PERFORMANCE','NATIVE']);
  expect(report.originalSourceAuthority.scoreableSurfaces).toBe(0);
  expect(report.productionAuthorized).toBe(false);
  expect(report.dataTransferredAutomatically).toBe(false);
 });
 it('aborts and restores NATIVE on lost pointer lock, not a fake PASS',()=>{
  const modes:OwnerQuality[]=[];
  const t=new UndertowF3OwnerGpuTrial(q=>modes.push(q),()=>[1600,900]);
  t.arm();t.frame(20,source());t.frame(3000,source());
  t.frame(3050,source({inputActive:false}));
  expect(t.snapshot().status).toBe('ABORTED');
  expect(t.snapshot().stopReason).toMatch(/POINTER_UNLOCK/);
  expect(t.report()).toBe(null);
  expect(modes.at(-1)).toBe('NATIVE');
 });
 it('fails closed on source authority drift before reporting performance',()=>{
  const modes:OwnerQuality[]=[];
  const t=new UndertowF3OwnerGpuTrial(q=>modes.push(q),()=>[1600,900]);
  t.arm();t.frame(20,source({scoreablePromotions:1}));
  expect(t.snapshot().status).toBe('ABORTED');
  expect(t.report()).toBe(null);
  expect(modes.at(-1)).toBe('NATIVE');
 });
 it('does not exclude >250ms real slow frames from p95',()=>{
  const p=summarizeOwnerRenderSamples([16,16,18,300,400]);
  expect(p.sampleCount).toBe(5);
  expect(p.p95IntervalMs).toBe(400);
  expect(p.longOver250Ms).toBe(2);
 });
});
