import {describe,it,expect,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {ProjectileSystem} from './ProjectileSystem';

/** Actual game method, isolated without browser/GPU or synthetic match ticks. */
type PauseState={
 nativeSourceHumanPhysicalMode:(()=> 'HUMAN'|'SQUID')|null;
 wasFireHeld:boolean;chargeSeconds:number;burstShotsRemaining:number;
 splatlingStoredChargeSeconds:number;fireCooldown:number;
 stats:{playerInk:number;shotsFired:number;playerWeaponChargePercent:number;
  playerWeaponChargeRing:number;playerWeaponFirstRingPercent:number};
};
function probe(source:boolean,burst=0){
 const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
 const s=game as unknown as PauseState;
 s.nativeSourceHumanPhysicalMode=source?()=> 'HUMAN':null;
 s.wasFireHeld=true;s.chargeSeconds=1.14;
 s.burstShotsRemaining=burst;s.splatlingStoredChargeSeconds=burst>0?.92:0;
 s.fireCooldown=.13;
 s.stats={playerInk:56,shotsFired:7,playerWeaponChargePercent:94,
  playerWeaponChargeRing:2,playerWeaponFirstRingPercent:83};
 return {game,s};
}
describe('SOURCE native real pause: never interpret focus loss as fire-release',()=>{
 it('discards unreleased charge while preserving ink, cooldown and fired shots',()=>{
  const {game,s}=probe(true);
  game.cancelUnreleasedNativeSourceHumanFire();
  expect(s.wasFireHeld).toBe(false);
  expect(s.chargeSeconds).toBe(0);
  expect(s.stats.playerWeaponChargePercent).toBe(0);
  expect(s.stats.playerWeaponChargeRing).toBe(0);
  expect(s.stats.playerWeaponFirstRingPercent).toBe(0);
  expect([s.stats.playerInk,s.stats.shotsFired,s.fireCooldown]).toEqual([56,7,.13]);
 });
 it('preserves an already committed genuine splatling burst',()=>{
  const {game,s}=probe(true,7);
  game.cancelUnreleasedNativeSourceHumanFire();
  expect(s.wasFireHeld).toBe(false);
  expect(s.chargeSeconds).toBe(0);
  expect([s.burstShotsRemaining,s.splatlingStoredChargeSeconds,s.stats.playerWeaponChargeRing])
   .toEqual([7,.92,2]);
 });
 it('does not affect normal T20/non-authorized QA',()=>{
  const {game,s}=probe(false);
  game.cancelUnreleasedNativeSourceHumanFire();
  expect([s.wasFireHeld,s.chargeSeconds,s.stats.playerWeaponChargePercent])
   .toEqual([true,1.14,94]);
 });
});

describe('native SOURCE real player HP loss and guarded combat reaction',()=>{
 function fixture(){
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const s=game as unknown as Record<string,any>;
  const effect=vi.fn(),damage=vi.fn(()=>23);
  s.nativeSourceHumanPhysicalMode=()=> 'HUMAN';
  s.b367NativeFrame=42;s.nativeHumanDamageCueFrame=-1;
  s.feedback={confirmedNativeHumanDamage:effect};
  s.resources={currentHp:100,applyDamage:damage};
  s.currentHumanDamageable=true;s.currentHumanTeam=Team.A;
  s.currentHumanPosition=new Vec3(0,.9,0);
  s.currentHumanAimDirection=new Vec3(0,0,-1);
  s.currentHumanGuarding=false;
  s.cpuAgents={applyAreaDamage:vi.fn()};
  s.combatTargets={applyAreaDamage:vi.fn()};
  s.physics={castStageSegment:()=>null};
  s.stats={cpuPlayerHits:0,playerWeaponGuardBlocks:0,
   playerWeaponGuardHp:100};
  return {game,s,effect,damage};
 }
 it('shows only actual covered-free SOURCE enemy blast HP loss, once per physics tick',()=>{
  const {game,s,effect,damage}=fixture();
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(damage).toHaveBeenCalledWith(23);
  expect(effect).toHaveBeenCalledOnce();
  expect(effect).toHaveBeenCalledWith(Team.B,expect.any(Vec3),23);
  expect(s.stats.cpuPlayerHits).toBe(1);
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(damage).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledOnce();
  s.b367NativeFrame++;
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(effect).toHaveBeenCalledTimes(2);
 });
 it('does not fake a cue through a real guard, cover, HP floor or frozen T20',()=>{
  const {game,s,effect,damage}=fixture();
  s.currentHumanGuarding=true;s.guardHp=100;
  s.isGuardBlockingPoint=()=>true;
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(damage).not.toHaveBeenCalled();
  s.currentHumanGuarding=false;
  s.physics.castStageSegment=()=>({distance:.1});
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(damage).not.toHaveBeenCalled();
  s.physics.castStageSegment=()=>null;
  s.resources.applyDamage=vi.fn(()=>0);
  (game as any).applyAreaDamage(new Vec3(0,0,0),2,23,Team.B);
  expect(effect).not.toHaveBeenCalled();
  s.nativeSourceHumanPhysicalMode=null;
  (game as any).confirmNativeHumanDamage(20,new Vec3(),Team.B);
  expect(effect).not.toHaveBeenCalled();
 });
});
