import {describe,it,expect} from 'vitest';
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
