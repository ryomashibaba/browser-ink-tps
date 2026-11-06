import {describe,it,expect} from 'vitest';
import {b485MayIssueNativeA1OriginalOrder as gate}
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
