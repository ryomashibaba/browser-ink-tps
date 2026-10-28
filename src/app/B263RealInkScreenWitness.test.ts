import {describe,it,expect} from 'vitest';
import {b263ScreenWitnessGate,b263ReadNativeInkProjection,
 type B263PaintGrid} from './B263RealInkScreenWitness';
const params=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit&t21B260=materialAudit&'+
 't21B261=sortAudit&t21B262=qaFocusAudit&t21B263=paintProjection');
const ctx={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,solids:25,
 paintable:17,links:26,scoreable:0,triangles:57578,textures:19,cpuCount:7};
const grids=()=>Array.from({length:17},(_,i):B263PaintGrid=>({
 id:'source'+i,widthCells:4,heightCells:2,cellSize:1,
 widthMeters:4,heightMeters:2,
 ownerGrid:new Int8Array(i===0?[0,1,-1,0,0,0,0,0]:
  [0,0,0,0,0,0,0,0]),
 isCellActive:()=>true,
 localToWorld:(u,v)=>({x:u,y:0,z:v})
}));
describe('B263 native ink owned cells -> camera, read only',()=>{
 it('is strictly gated by the entire B262 source chain and restored QA state',()=>{
  expect(b263ScreenWitnessGate(params,ctx,'BASELINE',null,false)).toBe(true);
  expect(b263ScreenWitnessGate(params,ctx,'BASELINE',null,true)).toBe(false);
  for(const k of ['t21B263','t21B262','t21B261','t21B260']){
   const p=new URLSearchParams(params);p.delete(k);
   expect(b263ScreenWitnessGate(p,ctx,'BASELINE',null,false)).toBe(false);
  }
  for(const v of [{paused:false},{staging:false},{pointerLocked:true},
   {scoreable:1},{solids:24},{paintable:16},{links:25}]){
   expect(b263ScreenWitnessGate(params,{...ctx,...v},'BASELINE',null,false))
    .toBe(false);
  }
 });
 it('uses original ownerGrid and reports projection, not visibility',()=>{
  const x=b263ReadNativeInkProjection(grids(),
   w=>({x:100+w.x*30,y:100+w.z*30,z:2}),1600,900);
  expect(x.ownedCells).toBe(2);expect(x.ownedA).toBe(1);
  expect(x.ownedB).toBe(1);expect(x.sampledCells).toBe(2);
  expect(x.samplesInsideViewport).toBe(2);
  expect(x.projectionOnly).toBe(true);expect(x.occlusionTested).toBe(false);
  expect(x.paintOwnershipModified).toBe(0);
  expect(x.artAccepted).toBe(false);
  expect(x.samples[0]?.grid).toEqual([1,0]);
 });
 it('rejects invalid owner, inactive footprint, and wrong surface count',()=>{
  const a=grids();a[0]!.ownerGrid[0]=8;
  expect(()=>b263ReadNativeInkProjection(a,w=>w,1600,900))
   .toThrow('B263_UNTRUSTED_NATIVE_INK_OWNER');
  const b=grids();b[0]!.isCellActive=()=>false;
  expect(()=>b263ReadNativeInkProjection(b,w=>w,1600,900))
   .toThrow('B263_PAINTED_OUTSIDE_SOURCE_FOOTPRINT');
  expect(()=>b263ReadNativeInkProjection(grids().slice(1),w=>w,1600,900))
   .toThrow('B263_UNVERIFIED_REAL_PAINT_SURFACE_VIEWPORT');
 });
 it('does not call points behind camera on-screen',()=>{
  const p=b263ReadNativeInkProjection(grids(),
   w=>({x:w.x,y:w.z,z:-1}),1600,900);
  expect(p.samplesInsideViewport).toBe(0);
 });
});
