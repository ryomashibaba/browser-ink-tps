import {describe,expect,it} from 'vitest';
import {b211RealNativeRoster,type B211NativeInput} from './B211NativeBattleRoster';
import {b286CompactNativeRoster} from './B286SourceCompactTeam';

function input():B211NativeInput{
 return {
  selected:true,tick:0,stage:[25,17,26,0],matchState:'STAGING',
  paused:true,stopReason:null,humanHp:100,
  humanDirectHits:0,humanDirectSplats:0,cpuSplats:0,cpuRespawns:0,
  cpu:['A1','A2','A3','B1','B2','B3','B4'].map(id=>({
   id,mobilityState:'GROUND',rejoined:false,
   lifeState:'ACTIVE' as const,hp:100,physicalFoot:[0,7.5,id[0]==='A'?40:-40]
  }))
 };
}
describe('B286 source team compact HUD, native read-only roster',()=>{
 it('reports real no-rejoin READY condition instead of invented 4v4',()=>{
  const v=b286CompactNativeRoster(b211RealNativeRoster(input()));
  expect(v).toMatchObject({
   tick:0,allyActive:0,enemyActive:0,notJoined:7,phase:'PAUSED',
   sourceScoreable:0,officialWinner:'NONE',
   originalCrossTeamEncounterCertified:false,gameplayWrites:0,
   actorsRelocated:0
  });
  expect(v?.detail).toContain('REJOINING 7/7');
 });
 it('reports genuine ally/enemy status and independently observed splats',()=>{
  const d=input();d.tick=190;d.matchState='PLAYING';d.paused=false;
  d.cpu=d.cpu.map(x=>({...x,rejoined:true}));
  d.cpu[5]={...d.cpu[5]!,lifeState:'SPLATTED',hp:0};
  d.cpuRespawns=2;
  const result=b286CompactNativeRoster(b211RealNativeRoster(d));
  expect(result).toMatchObject({allyActive:3,enemyActive:3,
   splatted:1,notJoined:0,phase:'PLAYING'});
  expect(result?.detail).toContain('REAL SPLATS 1');
  expect(result?.counts).toBe('ALLIES 3/3  ·  OPPONENTS 3/4');
 });
 it('fails closed without validated B211 model or source authority',()=>{
  expect(b286CompactNativeRoster(null)).toBeNull();
  const d=input();d.stage=[25,17,26,1];
  expect(b286CompactNativeRoster(b211RealNativeRoster(d))).toBeNull();
  d.stage=[25,17,26,0];d.cpu=d.cpu.slice(0,6);
  expect(b286CompactNativeRoster(b211RealNativeRoster(d))).toBeNull();
  const v=b211RealNativeRoster(input())!;
  expect(b286CompactNativeRoster({...v,officialWinner:'TEAM_A'} as typeof v)).toBeNull();
  expect(b286CompactNativeRoster({...v,rows:[...v.rows].reverse()})).toBeNull();
 });
});
