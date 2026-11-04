import {describe,it,expect} from 'vitest';
import {b420MayLegacyMeleeChase} from './B420SourceMeleePursuitAuthority';
describe('SOURCE melee pursuit preserves the original Recast/Rapier authority',()=>{
 const cases=[
  ['ROLLER',0,6,6.01],
  ['BRUSH',1.15,6,6.01],
  ['SPLATANA',1.05,5.2,5.21]
 ] as const;
 it('blocks all direct closestPoint(enemy) pursuit for SOURCE CPUs, even very close',()=>{
  for(const [weapon] of cases)
   for(const d of [0,0.5,1.2,2,5,6,100])
    expect(b420MayLegacyMeleeChase(weapon,true,d)).toBe(false);
 });
 it('retains old T20 melee distance intervals exactly',()=>{
  expect(b420MayLegacyMeleeChase('ROLLER',false,0)).toBe(true);
  for(const [weapon,lower,top,over] of cases){
   expect(b420MayLegacyMeleeChase(weapon,false,top)).toBe(true);
   expect(b420MayLegacyMeleeChase(weapon,false,over)).toBe(false);
   if(weapon!=='ROLLER'){
    expect(b420MayLegacyMeleeChase(weapon,false,lower)).toBe(false);
    expect(b420MayLegacyMeleeChase(weapon,false,lower+.01)).toBe(true);
   }
  }
 });
 it('refuses impossible target distances',()=>{
  for(const d of [NaN,Infinity,-Infinity,-1]){
   expect(b420MayLegacyMeleeChase('ROLLER',false,d)).toBe(false);
   expect(b420MayLegacyMeleeChase('BRUSH',false,d)).toBe(false);
   expect(b420MayLegacyMeleeChase('SPLATANA',false,d)).toBe(false);
  }
 });
});
