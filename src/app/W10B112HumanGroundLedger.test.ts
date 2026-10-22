import {describe,expect,it} from 'vitest';
import {W10B112HumanGroundLedger,classifyB115UnsupportedRayContext,
 type B112FootSample}
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
 it('B114 five true-source rays remain immutable read-only evidence through snapshots',()=>{
  const q=new W10B112HumanGroundLedger();
  const v=frame(120,8.4,true);
  const footprint={
   status:'READ_ONLY_FIVE_ORIGINAL_RAPIER_RAYS' as const,
   nativeTick:120,originalBody:[0,8.4,64] as [number,number,number],
   mode:'HUMAN' as const,radiusMeters:.4,
   probes:[{name:'CENTER' as const,offsetX:0,offsetZ:0,
    sourceSolidId:'source-floor',gapMeters:.03,closeSourceSupport:true},
    ...(['FRONT','BACK','LEFT','RIGHT'] as const).map(name=>({
     name,offsetX:0,offsetZ:0,sourceSolidId:null,
     gapMeters:null,closeSourceSupport:false}))],
   observedSourceSolidIds:['source-floor'],
   nearCenter:true,nearPerimeter:false,
   classification:'CENTER_ONLY_SOURCE_RAY' as const,
   noActorMutation:true as const,originalGeometryAdded:0 as const,
   originalFloorHoleCertified:false as const,
   genuineCapsuleContactCertified:false as const
  };
  q.observe({...v,footprint});
  expect(q.snapshot().lastOriginalFootprint?.classification)
   .toBe('CENTER_ONLY_SOURCE_RAY');
  expect(q.snapshot().actualNativeFeet[0]!.footprint?.probes).toHaveLength(5);
  q.resetOnRespawn();
  expect(q.snapshot().lastOriginalFootprint).toBeNull();
  expect(q.snapshot().sourceFloorHoleCertified).toBe(false);
 });
 it('B115 distinguishes existing edge ray from absent ray without certifying KCC contact',()=>{
  const q=new W10B112HumanGroundLedger();
  q.observe(frame(1,8.4,true));
  const first={tick:2,center:[0,8.4,64] as [number,number,number],
   grounded:false,mode:'HUMAN' as const,
   sourceSolidId:null,sourceSupportGapMeters:null};
  const build=(tick:number,centerY:number,edge:boolean):B112FootSample=>{
   const center:[number,number,number]=[0,centerY,64];
   const r=.32;
   const probes=([
    {name:'CENTER',offsetX:0,offsetZ:0,sourceSolidId:null,gapMeters:null,
     closeSourceSupport:false},
    {name:'FRONT',offsetX:0,offsetZ:-r,sourceSolidId:null,gapMeters:null,
     closeSourceSupport:false},
    {name:'BACK',offsetX:0,offsetZ:r,sourceSolidId:null,gapMeters:null,
     closeSourceSupport:false},
    {name:'LEFT',offsetX:-r,offsetZ:0,
     sourceSolidId:edge?'original-edge':null,gapMeters:edge?.1:null,
     closeSourceSupport:edge},
    {name:'RIGHT',offsetX:r,offsetZ:0,sourceSolidId:null,gapMeters:null,
     closeSourceSupport:false}
   ] as const);
   return {...first,tick,center,footprint:{
    status:'READ_ONLY_FIVE_ORIGINAL_RAPIER_RAYS' as const,
    nativeTick:tick,originalBody:[...center] as [number,number,number],
    radiusMeters:.4,mode:'HUMAN' as const,
    probes,observedSourceSolidIds:edge?['original-edge']:[],
    nearCenter:false,nearPerimeter:edge,
    classification:edge?'EDGE_ONLY_SOURCE_RAY' as const:
     'NO_NEAR_ORIGINAL_SOURCE_RAY' as const,
    noActorMutation:true as const,originalGeometryAdded:0 as const,
    originalFloorHoleCertified:false as const,
    genuineCapsuleContactCertified:false as const
   }};
  };
  for(let tick=2;tick<=17;tick++)q.observe(build(tick,8.4-(tick-2)*.06,true));
  const v=q.snapshot();
  expect(v.suspicionCount).toBe(1);
  expect(v.suspicions[0]!.unsupportedRayVsKccContext)
   .toBe('EDGE_RAY_VISIBLE_BUT_KCC_UNGROUNDED');
  expect(v.suspicions[0]!.nativeFootprintAtDetection?.observedSourceSolidIds)
   .toEqual(['original-edge']);
  expect(v.suspicions[0]!.rayHitDoesNotProveKccCollision).toBe(true);
  expect(v.sourceFloorHoleCertified).toBe(false);
  expect(classifyB115UnsupportedRayContext(build(20,7,false)))
   .toBe('NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED');
  expect(classifyB115UnsupportedRayContext(frame(20,7,false,null)))
   .toBe('FIVE_RAY_WITNESS_NOT_AVAILABLE');
  q.resetOnRespawn();
  expect(q.snapshot().suspicions[0]!.nativeFootprintAtDetection?.probes).toHaveLength(5);
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
