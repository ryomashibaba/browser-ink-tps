import {describe,expect,it} from 'vitest';
import {rankOriginalSourceCombatRetreatGoals as rank,
 originalSourceCpuWoundedRecoveryActive as wounded,
 originalSourceCpuMayHoldOwnInk as hold,
 type OriginalSourceRetreatInput} from './OriginalSourceCombatRetreat';

function genuine():OriginalSourceRetreatInput{
 return {
  source:[25,17,26,0],selectedOriginalCombat:true,
  activeGroundedRejoined:true,team:'A',hp:25,maxHp:100,
  realFoot:[0,3,42],originalCandidates:[
   {index:0,foot:[0,3,47],actualOwnOriginalPaintCell:true},
   {index:1,foot:[1,3,50],actualOwnOriginalPaintCell:true},
   {index:2,foot:[0,3,38],actualOwnOriginalPaintCell:true}
  ]
 };
}
describe('F3 original SOURCE low-HP survival goal preference',()=>{
 it('uses only existing OWN native-source feet behind actual actor',()=>{
  expect(rank(genuine())).toEqual([0,1]);
  expect(rank({...genuine(),team:'B',realFoot:[0,3,-42],
   originalCandidates:[
    {index:4,foot:[0,3,-48],actualOwnOriginalPaintCell:true}
   ]})).toEqual([4]);
 });
 it('refuses wrong inventories, production, unsupported and fake ink',()=>{
  for(const patch of [
   {source:[25,17,26,1] as const},
   {source:[26,17,26,0] as const},
   {selectedOriginalCombat:false},
   {activeGroundedRejoined:false},
   {hp:0},{hp:38},{hp:101},{hp:NaN},
   {realFoot:[0,3,20] as const},
   {originalCandidates:[{index:0,foot:[0,3,47] as const,
     actualOwnOriginalPaintCell:false}]},
   {originalCandidates:[{index:0,foot:[0,3,30] as const,
     actualOwnOriginalPaintCell:true}]}
  ])expect(rank({...genuine(),...patch})).toEqual([]);
 });
 it('stays on genuine original OWN ink until native HP reaches 70%',()=>{
  expect(wounded(genuine())).toBe(true);
  expect(hold(genuine(),true)).toBe(true);
  expect(hold(genuine(),false)).toBe(false);
  expect(wounded({...genuine(),hp:55})).toBe(false);
  expect(wounded({...genuine(),hp:55,
   recoveringFromRealDamage:true})).toBe(true);
  expect(rank({...genuine(),hp:55,
   recoveringFromRealDamage:true})).toEqual([0,1]);
  expect(hold({...genuine(),hp:69,
   recoveringFromRealDamage:true},true)).toBe(true);
  expect(hold({...genuine(),hp:70,
   recoveringFromRealDamage:true},true)).toBe(false);
 });
 it('a death, counterfeit source, detached CPU or invented ink cannot hold',()=>{
  for(const patch of [
   {hp:0},{source:[25,17,26,1] as const},
   {activeGroundedRejoined:false},{selectedOriginalCombat:false},
   {realFoot:[0,3,-20] as const}
  ])expect(hold({...genuine(),...patch,
   recoveringFromRealDamage:true},true)).toBe(false);
 });
 it('never proposes a nonexistent, opposite-side or height-changing route',()=>{
  expect(rank({...genuine(),originalCandidates:[
   {index:0,foot:[0,3,-47],actualOwnOriginalPaintCell:true},
   {index:1,foot:[0,4,47],actualOwnOriginalPaintCell:true},
   {index:2,foot:[0,3,63],actualOwnOriginalPaintCell:true},
   {index:3,foot:[0,3,47],actualOwnOriginalPaintCell:true}
  ]})).toEqual([3]);
 });
});
