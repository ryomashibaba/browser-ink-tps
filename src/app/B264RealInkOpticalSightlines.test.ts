import {describe,it,expect} from 'vitest';
import {b264SelectNativeVisibleProjectionSamples,
 b264ClassifyNativePaintSightline,b264SourceRayGate,
 type B264PaintedCellSample}
 from './B264RealInkOpticalSightlines';
const p=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit&t21B260=materialAudit&'+
 't21B261=sortAudit&t21B262=qaFocusAudit&'+
 't21B263=paintProjection&t21B264=inkOpticalRays');
const ctx={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,
 solids:25,paintable:17,links:26,scoreable:0,
 triangles:57578,textures:19,cpuCount:7};
const sample=(i:number,inside=true)=>({
 surfaceId:'NativePaintSurface',team:'A' as const,grid:[i,0] as [number,number],
 world:[1,i,50] as [number,number,number],
 screenPx:[800,i+400,10] as [number,number,number],
 inFront:true,insideViewport:inside
});
describe('B264 real source paint ray comparison',()=>{
 it('requires entire strict paused source chain and B264 opt-in',()=>{
  expect(b264SourceRayGate(p,ctx,'BASELINE',null,false)).toBe(true);
  for(const key of ['t21B264','t21B263','t21B262','t21B261']){
   const q=new URLSearchParams(p);q.delete(key);
   expect(b264SourceRayGate(q,ctx,'BASELINE',null,false)).toBe(false);
  }
  expect(b264SourceRayGate(p,{...ctx,paused:false},'BASELINE',null,false))
   .toBe(false);
  expect(b264SourceRayGate(p,ctx,'BASELINE',null,true)).toBe(false);
 });
 it('bounds real on-screen owned-cell samples without synthetic positions',()=>{
  const inp:B264PaintedCellSample[]=Array.from({length:115},(_,i)=>sample(i));
  const selected=b264SelectNativeVisibleProjectionSamples(inp);
  expect(selected.length).toBeLessThanOrEqual(24);
  expect(selected[0]?.grid).toEqual([0,0]);
  expect(selected.every(s=>inp.includes(s))).toBe(true);
  expect(b264SelectNativeVisibleProjectionSamples([sample(0,false)]))
   .toHaveLength(0);
  expect(()=>b264SelectNativeVisibleProjectionSamples(inp,25))
   .toThrow('B264_UNBOUNDED_OPTICAL_RAY_BUDGET');
 });
 it('distinguishes source optical geometry from physical and opacity',()=>{
  const ray=b264ClassifyNativePaintSightline(12,
   {name:'Glass01',kind:'GLASS',distanceMeters:3.7},
   {solidId:'REAL_STAGE_FLOOR',distanceMeters:11.5});
  expect(ray.opticalBeforePaint).toBe(true);
  expect(ray.physicalBeforePaint).toBe(true);
  expect(ray.opticalKind).toBe('GLASS');
  expect(ray.translucentGlassBlocksPaintCertified).toBe(false);
  expect(ray.realInkFramebufferVisibilityCertified).toBe(false);
  const near=b264ClassifyNativePaintSightline(12,
   {name:'Glass01',kind:'GLASS',distanceMeters:11.99},
   {solidId:'REAL_STAGE_FLOOR',distanceMeters:11.99});
  expect(near.opticalBeforePaint).toBe(false);
  expect(near.physicalBeforePaint).toBe(false);
  expect(near.artAccepted).toBe(false);
 });
 it('rejects nonfinite or out-of-segment manufactured ray data',()=>{
  expect(()=>b264ClassifyNativePaintSightline(NaN,null,null))
   .toThrow('B264_INVALID_SOURCE_RAY_DEPTH');
  expect(()=>b264ClassifyNativePaintSightline(10,
   {name:'g',kind:'GLASS',distanceMeters:11},null))
   .toThrow('B264_INVALID_SOURCE_RAY_DEPTH');
 });
});
