import {describe,it,expect} from 'vitest';
import {b209OriginalRampEdge,type B209RampFrame} from './B209OriginalRampEdge';
const input=(body:readonly [number,number,number],
 support:string|null='UndertowT21D:right-low-route-ramp-positive-z'):B209RampFrame=>({
 nativeTick:9764,body,stage:[25,17,26,0],nativeKccGrounded:true,
 actualOriginalFootSupportId:support,matchState:'PLAYING',paused:false,stopReason:null
});
describe('B209 exact original ramp edge at genuine native 140-second KCC loss',()=>{
 it('recognizes registered 1.4cm edge with genuine original ramp support',()=>{
  const x=b209OriginalRampEdge(input([.99829518795,3.9612021446,47.4987335205]));
  expect(x.state).toBe('CRITICAL_SOURCE_EDGE');
  expect(x.side).toBe('POSITIVE_Z');
  expect(x.signedOriginalRampEdgeMeters).toBeGreaterThan(0);
  expect(x.signedOriginalRampEdgeMeters).toBeLessThan(.03);
  expect(x.actualSupportWitness).toBe(true);
  expect(x.certifiedFullRoute).toBe(false);
 });
 it('flags actual next unsupported samples outside exact original quad',()=>{
  const x=b209OriginalRampEdge(input([1.015006,3.568278,46.744385],null));
  expect(x.state).toBe('UNVERIFIED_FOOT_SUPPORT');
  expect(x.signedOriginalRampEdgeMeters).toBeLessThan(-.60);
  expect(x.actualSupportWitness).toBe(false);
  const y=b209OriginalRampEdge(input([.7322,2.947,46.214],null));
  expect(y.signedOriginalRampEdgeMeters).toBeLessThan(-1.20);
 });
 it('does not invent a safe collision or route merely from polygon interior',()=>{
  const x=b209OriginalRampEdge(input([3.5,4.4,49],null));
  expect(x.state).toBe('OFF');
  expect(x.actualSupportWitness).toBe(false);
  expect(x.scoreable).toBe(0);expect(x.officialWinner).toBe('NONE');
 });
 it('holds when original authority, clock or game state is invalid',()=>{
  const a=input([.998,3.961,47.499]);
  expect(b209OriginalRampEdge({...a,stage:[26,17,26,0]}).state).toBe('OFF');
  expect(b209OriginalRampEdge({...a,paused:true}).state).toBe('OFF');
  expect(b209OriginalRampEdge({...a,stopReason:'SAFE_STOP'}).state).toBe('OFF');
  expect(b209OriginalRampEdge({...a,matchState:'TIME_UP'}).state).toBe('OFF');
  expect(b209OriginalRampEdge({...a,nativeTick:9764.1}).state).toBe('OFF');
 });
});
