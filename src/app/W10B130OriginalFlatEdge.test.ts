import {describe,it,expect} from 'vitest';
import {inspectB130OriginalFlatSource as f} from './W10B130OriginalFlatEdge';
import {inspectB124ActualRaisedSourceBoundary as raised}
 from './W10B124OriginalRaisedSourceBoundary';
import {originalRaisedSourceEdgeStatus as status}
 from './UndertowF3OriginalEdgeGuidance';
const r='UndertowT21D:right-low-team-a';
const l='UndertowT21D:first-drop-landing-positive-z';
const b=(x:number,y:number,z:number)=>[x,y,z] as const;
const probe=(position:readonly [number,number,number],id:string|null)=>
 f({nativeTick:500,actualRapierBody:position,actualRapierSupportId:id});
const pack=(w:NonNullable<ReturnType<typeof probe>>,id=w.actualNamedOriginalSolidId)=>({
 nativeTick:500,nativeKccGrounded:true,realOriginalFootSolidId:id,
 actualRaisedFootprint:null,actualOriginalFlatFootprint:w,
 stageAuthority:[25,17,26,0] as const,matchState:'PLAYING' as const,
 paused:false,stopReason:null,activeHuman:true
});
describe('B130 real registered source polygon edge guide',()=>{
 it('reproduces exact B124 geometry on two genuinely reached Rapier positions',()=>{
  for(const pos of [
   b(6.0372467041015625,5.394600868225098,38.68196487426758),
   b(6.2972092628479,5.395079135894775,36.603267669677734)
  ]){
   const actual=probe(pos,r)!,old=raised({nativeTick:500,actualRapierBody:pos});
   expect(actual.distanceToOriginalPolygonBoundaryMeters)
    .toBeCloseTo(old.distanceToOriginalSourcePolygonBoundaryMeters,8);
   expect(actual.insideRegisteredOriginalXZFootprint).toBe(true);
   expect(actual.originalFlatVerticalBandWithin22cm).toBe(true);
  }
 });
 it('warns on real Y3 first-drop lower floor independently of Y4.5 slab',()=>{
  const value=probe(b(.8607550859451294,3.8949995040893555,49.67649841308594),l)!;
  expect(value.insideRegisteredOriginalXZFootprint).toBe(true);
  expect(value.distanceToOriginalPolygonBoundaryMeters).toBeGreaterThan(.65);
  expect(value.distanceToOriginalPolygonBoundaryMeters).toBeLessThan(1.2);
  const ui=status(pack(value));
  expect(ui.severity).toBe('NEAR_EDGE');
  expect(ui.authenticNamedOriginalSupport).toBe(l);
  expect(ui.original4v4Certified).toBe(false);
 });
 it('real B127 endpoint remains edge risk, never a physical correction',()=>{
  const w=probe(b(6.2972092628479,5.395079135894775,36.603267669677734),r)!;
  const h=status(pack(w));
  expect(h.severity).toBe('EDGE_RISK');
  expect(h.originalRaisedFloorEdgeMeters).toBeLessThan(.65);
  expect(h.playerPhysicsModified).toBe(false);
 });
 it('refuses missing support, wrong solid, non-native tick and authority drift',()=>{
  const w=probe(b(.860755,3.895,49.6765),l)!;
  expect(status(pack(w,r)).showCaution).toBe(false);
  expect(status({...pack(w),nativeKccGrounded:false}).showCaution).toBe(false);
  expect(status({...pack(w),nativeTick:501}).showCaution).toBe(false);
  expect(status({...pack(w),stageAuthority:[25,17,26,1]}).showCaution).toBe(false);
  expect(status({...pack(w),matchState:'TIME_UP'}).showCaution).toBe(false);
 });
 it('rejects wrong height, outside polygon and unsupported source meshes',()=>{
  const y=probe(b(.860755,5.395,49.6765),l)!;
  expect(status(pack(y)).showCaution).toBe(false);
  const outside=probe(b(50,3.895,49.6765),l)!;
  expect(status(pack(outside)).showCaution).toBe(false);
  expect(probe(b(3,3.895,48),'UndertowT21D:unknown')).toBeNull();
  expect(probe(b(7,4.5,49),'UndertowT21D:right-low-route-ramp-positive-z')).toBeNull();
  expect(()=>probe(b(NaN,5.4,49),r)).toThrow('B130_FROZEN_NATIVE_SOURCE_AUTHORITY');
 });
});
