import {describe,it,expect} from 'vitest';
import {b485MayIssueNativeA1OriginalOrder as gate,
 b485MayDwellAtTrueOriginalA1Arrival as dwellGate}
 from './B485RealRepeatA1Command';
const input=()=>({selected:true,nativeTick:1100,lastRealKeyTick:null as number|null,
 genuineKeyRequests:0,lastOrder:'OFF' as const});
describe('B485 authentic SOURCE C key initial plus completed-order retry',()=>{
 it('allows first real order only from original OFF state',()=>{
  expect(gate(input())).toBe(true);
  expect(gate({...input(),selected:false})).toBe(false);
  expect(gate({...input(),lastOrder:'MOVING'})).toBe(false);
  expect(gate({...input(),lastRealKeyTick:1090})).toBe(false);
  expect(gate({...input(),nativeTick:-1})).toBe(false);
 });
 it('forbids overwriting a moving or requested actual Crowd order',()=>{
  for(const lastOrder of ['MOVING','REQUESTED','OFF'] as const)
   expect(gate({...input(),genuineKeyRequests:1,
    nativeTick:1200,lastRealKeyTick:1100,lastOrder})).toBe(false);
  for(const lastOrder of ['ARRIVED','HOLD','EXPIRED'] as const){
   expect(gate({...input(),genuineKeyRequests:1,
    nativeTick:1129,lastRealKeyTick:1100,lastOrder})).toBe(false);
   expect(gate({...input(),genuineKeyRequests:1,
    nativeTick:1130,lastRealKeyTick:1100,lastOrder})).toBe(true);
  }
 });
 it('rejects forged timestamp, future key, invalid command count',()=>{
  const x={...input(),genuineKeyRequests:1,lastOrder:'ARRIVED' as const};
  for(const delta of [
   {lastRealKeyTick:null},{lastRealKeyTick:-1},
   {lastRealKeyTick:1200},{lastRealKeyTick:1100},
   {nativeTick:NaN},{genuineKeyRequests:-1},
   {genuineKeyRequests:1.2},{selected:false}
  ])expect(gate({...x,...delta})).toBe(false);
 });
});

describe('real A1 player-C arrived-foot dwell never adds a new path',()=>{
 const at=(tick:number)=>({
  nativeTick:tick,arrivalTick:1254,
  goal:[-.3513262867927551,3.0999999046325684,52.12720489501953],
  physicalFoot:[-.25,3.0999999046325684,52.15],
  originalSource:[25,17,26,0],enabled:true,
  orderStatus:'ARRIVED' as const,practiceRunning:true,
  rejoined:true,aliveGrounded:true,realFootSupported:true,
  originalGoalSupported:true
 });
 it('uses 120 actual native ticks, then releases the regular CPU patrol',()=>{
  expect(dwellGate(at(1254))).toBe(true);
  expect(dwellGate(at(1373))).toBe(true);
  expect(dwellGate(at(1374))).toBe(false);
  expect(dwellGate(at(1253))).toBe(false);
 });
 it('releases promptly on another C, death, old goal, non-original stage or KCC drift',()=>{
  const x=at(1260);
  for(const delta of [
   {enabled:false},{practiceRunning:false},{rejoined:false},
   {aliveGrounded:false},{realFootSupported:false},
   {originalGoalSupported:false},{orderStatus:'MOVING' as const},
   {orderStatus:'HOLD' as const},{originalSource:[25,17,26,1]},
   {originalSource:[24,17,26,0]},
   {physicalFoot:[-.25,3.5,52.15]},
   {physicalFoot:[-.25,3.1,55.3]},
   {physicalFoot:[NaN,3.1,52]},
   {arrivalTick:1270},{nativeTick:1.2}
  ])expect(dwellGate({...x,...delta})).toBe(false);
 });
});
