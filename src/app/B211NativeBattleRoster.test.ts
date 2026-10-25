import {describe,it,expect} from 'vitest';
import {b211RealNativeRoster as make,type B211NativeInput} from './B211NativeBattleRoster';
function data():B211NativeInput{return {selected:true,tick:800,
 stage:[25,17,26,0],matchState:'PLAYING',paused:false,stopReason:null,
 humanHp:100,humanDirectHits:0,humanDirectSplats:0,
 cpuSplats:0,cpuRespawns:0,
 cpu:['A1','A2','A3','B1','B2','B3','B4'].map(id=>({
  id,mobilityState:'GROUND',rejoined:true,
  lifeState:'ACTIVE' as const,hp:100,
  physicalFoot:[0,4,id[0]==='A'?40:-40]}))};}
describe('B211 player-visible genuine source combat roster',()=>{
 it('keeps true 3 allies / 4 enemies, no fake battle result',()=>{
  const v=make(data())!;
  expect(v.rows).toHaveLength(7);
  expect(v.rows.filter(x=>x.team==='ALLY')).toHaveLength(3);
  expect(v.rows.filter(x=>x.team==='ENEMY')).toHaveLength(4);
  expect(v).toMatchObject({sourceScoreable:0,officialWinner:'NONE',
   naturalEnemyEncounterCertified:false,realHumanHits:0});
 });
 it('uses actual CPU splat, respawn and HP, never infers a kill',()=>{
  const v=data();v.humanHp=0;v.cpuSplats=1;v.cpuRespawns=1;
  v.cpu=[...v.cpu.slice(0,3),{...v.cpu[3]!,lifeState:'SPLATTED',hp:0},...v.cpu.slice(4)];
  const model=make(v)!;
  expect(model.rows[3]).toMatchObject({id:'B1',status:'SPLAT',hp:null});
  expect(model.realHumanSplats).toBe(0);
  expect(model.cpuRespawns).toBe(1);
  expect(model.text).toContain('YOU SPLATTED');
 });
 it('refuses invented ids, source scoring, invalid HP or fake statistics',()=>{
  expect(make({...data(),stage:[25,17,26,1]})).toBeNull();
  expect(make({...data(),selected:false})).toBeNull();
  expect(make({...data(),cpu:data().cpu.slice(0,6)})).toBeNull();
  expect(make({...data(),cpu:[...data().cpu.slice(0,6),{...data().cpu[6]!,id:'A1'}]})).toBeNull();
  expect(make({...data(),humanDirectSplats:1})).toBeNull();
  expect(make({...data(),cpu:[{...data().cpu[0]!,hp:NaN},...data().cpu.slice(1)]})).toBeNull();
 });
});
