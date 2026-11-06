import {describe,it,expect} from 'vitest';
import {b477ActualSourceCpuJoinCue,B477_ORIGINAL_CPU_IDS}
 from './B477ActualSourceCpuJoinCue';
const frame=()=>({
 selected:true,stage:[25,17,26,0] as readonly number[],
 nativeTick:1036,matchState:'STAGING',practiceStatus:'ARMED',
 stopReason:null as string|null,
 physicallyRejoined:['A1','A2','A3','B1','B2','B3'] as readonly string[]
});
describe('B477 real original-source seven-CPU progress, not early start',()=>{
 it('labels exactly six real native joins with the actual missing CPU',()=>{
  expect(B477_ORIGINAL_CPU_IDS).toHaveLength(7);
  expect(b477ActualSourceCpuJoinCue(frame())).toMatchObject({
   joined:6,missing:['B4'],officialWinner:'NONE',
   simulationWrites:0,physicalSourceOnly:true
  });
  expect(b477ActualSourceCpuJoinCue(frame())?.label)
   .toContain('6/7');
  expect(b477ActualSourceCpuJoinCue({...frame(),physicallyRejoined:
   [...B477_ORIGINAL_CPU_IDS]})?.label)
   .toContain('WAIT FOR TRUE NATIVE PLAYING');
 });
 it('shows real 0/7 and 7/7 as observations only, never granting routes',()=>{
  expect(b477ActualSourceCpuJoinCue({...frame(),nativeTick:0,
   physicallyRejoined:[]})?.joined).toBe(0);
  const s=b477ActualSourceCpuJoinCue({...frame(),physicallyRejoined:
   [...B477_ORIGINAL_CPU_IDS]});
  expect(s?.missing).toEqual([]);
  expect(s?.officialWinner).toBe('NONE');
  expect(s?.simulationWrites).toBe(0);
 });
 it('holds false geometry, invalid CPU identities, user session and phase',()=>{
  for(const change of [
   {selected:false},{stage:[25,17,26,1]},
   {stage:[25,17,25,0]},{nativeTick:-1},{nativeTick:0.5},
   {matchState:'PLAYING'},{practiceStatus:'RUNNING'},
   {stopReason:'SOURCE_STOP'},
   {physicallyRejoined:['A1','A1']},
   {physicallyRejoined:['A1','HUMAN']},
   {physicallyRejoined:['FAKE_BOT']},
   {physicallyRejoined:Array(8).fill('A1')}
  ])expect(b477ActualSourceCpuJoinCue({...frame(),...change})).toBeNull();
 });
});
