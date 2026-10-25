import {describe,expect,it} from 'vitest';
import {b199ActualAllyCollisionReliefCandidates as escape} from './B199ActualAllyCollisionRelief';
const p=(x:number,y:number,z:number)=>({x,y,z});
const entry=()=>({
 enabled:true,allySyncPracticeRunning:true,humanGrounded:true,humanActive:true,
 cpuRejoined:true,human:p(.24,3.1,53.70),cpu:p(-.18,3.1,53.25),
 existingAuditedSourceFeet:[p(-.1,3.1,53.8),p(2.8,3.1,51.5),
  p(-3,3.1,50),p(3,3.1,62),p(0,10,53),p(4,3.1,-53)]
});
describe('B199 native source ally collision relief, no waypoint invention',()=>{
 it('acts only at real human and physically landed source A1 overlap',()=>{
  const i=entry();
  expect(escape(i)).toEqual([p(2.8,3.1,51.5),p(-3,3.1,50),p(3,3.1,62)]);
  expect(escape({...i,cpu:p(2.1,3.1,51.7)})).toEqual([]);
  expect(escape({...i,enabled:false})).toEqual([]);
  expect(escape({...i,allySyncPracticeRunning:false})).toEqual([]);
  expect(escape({...i,humanGrounded:false})).toEqual([]);
  expect(escape({...i,cpuRejoined:false})).toEqual([]);
 });
 it('never manufactures a source floor, opposite-side route or actor position',()=>{
  const i=entry();
  const result=escape(i);
  expect(result.every(q=>i.existingAuditedSourceFeet.includes(q))).toBe(true);
  expect(result.every(q=>q.z>=33&&q.y>=2.7&&q.y<=5.25)).toBe(true);
  expect(escape({...i,existingAuditedSourceFeet:[p(0,3.1,54)]})).toEqual([]);
 });
 it('rejects ungrounded height, stale opposing and nonfinite source positions',()=>{
  const i=entry();
  expect(escape({...i,human:p(0,8.39,66)})).toEqual([]);
  expect(escape({...i,cpu:p(0,3.1,-52)})).toEqual([]);
  expect(escape({...i,cpu:p(NaN,3.1,53)})).toEqual([]);
  expect(escape({...i,existingAuditedSourceFeet:[p(NaN,3.1,50)]})).toEqual([]);
 });
});
