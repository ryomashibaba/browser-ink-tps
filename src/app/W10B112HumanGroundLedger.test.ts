import {describe,expect,it} from 'vitest';
import {W10B112HumanGroundLedger,type B112FootSample}
 from './W10B112HumanGroundLedger';

const frame=(tick:number,centerY:number,grounded:boolean,
 sourceSolidId:string|null='source-floor'):B112FootSample=>({
 tick,center:[0,centerY,64],grounded,mode:'HUMAN',
 sourceSolidId,
 sourceSupportGapMeters:sourceSolidId===null?null:.03
});
describe('W10-B112 genuine original-source foot support ledger',()=>{
 it('real KCC grounding and observed original support do not fabricate holes',()=>{
  const q=new W10B112HumanGroundLedger();
  for(let tick=1;tick<=20;tick++)q.observe(frame(tick,8.40,true));
  const v=q.snapshot();
  expect(v.suspicionCount).toBe(0);
  expect(v.lastNativeTick).toBe(20);
  expect(v.lastOriginalSourceHitId).toBe('source-floor');
  expect(v.sourceFloorHoleCertified).toBe(false);
  expect(v.originalStageGeometryModified).toBe(false);
 });
 it('observes bounded unsupported downward motion but never declares a floor hole',()=>{
  const q=new W10B112HumanGroundLedger();
  q.observe(frame(1,8.4,true));
  for(let i=0;i<14;i++)
   q.observe(frame(i+2,8.4-i*.045,false,null));
  const v=q.snapshot();
  expect(v.suspicionCount).toBe(1);
  expect(v.suspicions[0]).toMatchObject({
   firstUnsupportedNativeTick:2,previousSupportedBody:[0,8.4,64],
   status:'SUSPECT_UNSUPPORTED_DESCENT_NOT_PROVEN_FLOOR_HOLE',
   playerPositionChangedByMonitor:false,originalStageGeometryModified:false
  });
  expect(v.suspicions[0]!.downwardMeters).toBeGreaterThan(.18);
  expect(v.sourceFloorHoleCertified).toBe(false);
  // Steady continued fall is one event, not unbounded duplicate alerts.
  for(let i=0;i<80;i++)q.observe(frame(16+i,7.7-i*.06,false,null));
  expect(q.snapshot().suspicionCount).toBe(1);
  expect(q.snapshot().actualNativeFeet.length).toBe(24);
 });
 it('original nearby collider ray support cancels a speculative fall',()=>{
  const q=new W10B112HumanGroundLedger();
  q.observe(frame(1,8.4,true));
  for(let i=2;i<=7;i++)q.observe(frame(i,8.4-(i-1)*.05,false,null));
  q.observe(frame(8,8.05,false,'real-original-solid'));
  expect(q.snapshot().suspicionCount).toBe(0);
  expect(q.snapshot().currentUnsupportedNativeTicks).toBe(0);
 });
 it('detects only measured finite ordered native ticks and can reset on respawn',()=>{
  const q=new W10B112HumanGroundLedger();
  q.observe(frame(1,8.4,true));
  expect(()=>q.observe(frame(1,8.4,true))).toThrow('B112_NONMONOTONIC');
  expect(()=>q.observe(frame(2,NaN,false,null))).toThrow('B112_INVALID');
  expect(()=>q.observe({...frame(2,8.3,false,null),
   sourceSupportGapMeters:.15})).toThrow('B112_SOURCE_HIT_ID_GAP_MISMATCH');
  q.reset();q.observe(frame(1,8.4,true));
  expect(q.snapshot().suspicionCount).toBe(0);
 });
});
