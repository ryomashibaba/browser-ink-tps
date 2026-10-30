import {describe,it,expect} from 'vitest';
import {WEAPON_ORDER,WEAPON_PROFILES,DEFAULT_WEAPON_ID} from './WeaponCatalog';
import {WEAPON_KITS,SUB_WEAPONS,SPECIAL_WEAPONS} from './WeaponKitCatalog';
import {GAME_CONFIG} from '../config/game/gameConfig';

const originalClassNames=['SHOOTER','DUALIES','CHARGER','BLASTER','ROLLER',
 'BRUSH','SLOSHER','SPLATLING','BRELLA','STRINGER','SPLATANA'];
describe('B342 project weapon foundation (not original-fidelity certification)',()=>{
 it('models 11 distinct weapon families with 12 unique project weapons',()=>{
  expect(WEAPON_ORDER).toHaveLength(12);
  expect(new Set(WEAPON_ORDER).size).toBe(12);
  expect(new Set(WEAPON_ORDER.map(id=>WEAPON_PROFILES[id].weaponClass)))
   .toEqual(new Set(originalClassNames));
  expect(WEAPON_ORDER).toContain(DEFAULT_WEAPON_ID);
  expect(Object.keys(WEAPON_PROFILES).sort()).toEqual([...WEAPON_ORDER].sort());
 });
 it('keeps weapon physics and ink budget finite and defined',()=>{
  for(const id of WEAPON_ORDER){
   const p=WEAPON_PROFILES[id];
   expect(p.id).toBe(id);
   for(const n of [p.fireIntervalSeconds,p.speedMetersPerSecond,
    p.gravityMetersPerSecond2,p.lifeSeconds,p.paintRadiusMeters,
    p.visualDiameterMeters,p.damage,p.inkCost,p.fxScale,p.audioPitch]){
    expect(Number.isFinite(n)&&n>0,id).toBe(true);
   }
   expect(p.inkCost).toBeLessThanOrEqual(GAME_CONFIG.inkEconomy.capacity);
   expect(p.pelletCount).toBeGreaterThan(0);
   expect(Number.isInteger(p.pelletCount)).toBe(true);
   expect(p.spreadDegrees).toBeGreaterThanOrEqual(0);
  }
 });
 it('each main weapon has an implemented project sub/special kit mapping',()=>{
  for(const id of WEAPON_ORDER){
   const kit=WEAPON_KITS[id];
   expect(kit).toBeDefined();
   expect(SUB_WEAPONS[kit.sub]).toBeDefined();
   expect(SPECIAL_WEAPONS[kit.special]).toBeDefined();
  }
 });
 it('distinguishes shooter auto, roller roll and charger charge release',()=>{
  const shooter=WEAPON_PROFILES['pulse-sprayer'];
  const roller=WEAPON_PROFILES['metro-roller'];
  const charger=WEAPON_PROFILES['rail-charger'];
  expect(shooter.weaponClass).toBe('SHOOTER');
  expect(shooter.trigger).toBe('AUTO');
  expect(roller.weaponClass).toBe('ROLLER');
  expect(roller.rollPaintInkCost).toBeGreaterThan(0);
  expect(roller.rollPaintRadiusMeters).toBeGreaterThan(0);
  expect(charger.weaponClass).toBe('CHARGER');
  expect(charger.trigger).toBe('CHARGE_RELEASE');
  expect(charger.chargeSeconds).toBeGreaterThan(charger.minChargeSeconds);
 });
});
