import {describe,expect,it} from 'vitest';
import {b380NativeWeaponGuidance} from './B380NativePlayerWeaponGuide';
import type {WeaponClass} from '../weapons/WeaponCatalog';

const base={
 profile:{weaponClass:'SHOOTER' as WeaponClass,displayName:'Test weapon'},
 hp:100,actualDodgeCharges:2,actualChargePercent:45,
 currentMode:'HUMAN' as const,canShoot:true,
 realSubEnabled:true,realSubName:'Snap Bomb',
 sourceMatchState:'PLAYING' as const
};
const classes:WeaponClass[]=[
 'SHOOTER','DUALIES','CHARGER','BLASTER','ROLLER','BRUSH',
 'SLOSHER','SPLATLING','BRELLA','STRINGER','SPLATANA'
];
describe('Real SOURCE weapon controls follow native match and life',()=>{
 it.each(classes)('%s never prompts shooting, dodge or sub during native splat',klass=>{
  const text=b380NativeWeaponGuidance({
   ...base,profile:{...base.profile,weaponClass:klass},hp:0
  });
  expect(text).toContain('SPLATTED · WAIT FOR NATIVE RESPAWN');
  expect(text).not.toContain('LMB');
  expect(text).not.toContain('RMB');
  expect(text).not.toContain('F SUB');
 });
 it('does not advertise firing or sub in true squid form',()=>{
  const text=b380NativeWeaponGuidance({...base,currentMode:'SQUID'});
  expect(text).toContain('RELEASE SHIFT TO FIRE');
  expect(text).not.toContain('LMB');
  expect(text).not.toContain('F SUB');
 });
 it('time up takes precedence over life status and offers real replay',()=>{
  const text=b380NativeWeaponGuidance({
   ...base,hp:0,sourceMatchState:'TIME_UP'
  });
  expect(text).toContain('ROUND FINISHED · REPLAY A NEW SOURCE ROUND');
  expect(text).not.toContain('WAIT FOR NATIVE RESPAWN');
  expect(text).not.toContain('F SUB');
 });
 it('preserves living human native class controls and real sub',()=>{
  const text=b380NativeWeaponGuidance({...base,profile:{
   weaponClass:'DUALIES',displayName:'Twin Comets'
  }});
  expect(text).toContain('RMB DODGE 2/2');
  expect(text).toContain('F SUB Snap Bomb');
 });
 it('shows native 150-tick respawn only from bounded actual evidence',()=>{
  const dying=b380NativeWeaponGuidance({
   ...base,hp:0,actualRespawnTicksRemaining:75
  });
  expect(dying).toContain('75 NATIVE TICKS (1.3s)');
  expect(dying).not.toContain('LMB');
  expect(dying).not.toContain('F SUB');
  for(const invalid of [-1,151,1.5,Infinity,NaN]){
   const blocked=b380NativeWeaponGuidance({
    ...base,hp:0,actualRespawnTicksRemaining:invalid
   });
   expect(blocked).toContain('SPLATTED · WAIT FOR NATIVE RESPAWN');
   expect(blocked).not.toContain('NATIVE TICKS (');
  }
  expect(b380NativeWeaponGuidance({
   ...base,actualRespawnTicksRemaining:75
  })).not.toContain('NATIVE TICKS');
 });
 it('safe stop takes priority over native weapon controls',()=>{
  const stopped=b380NativeWeaponGuidance({...base,nativeStopped:true});
  expect(stopped).toContain('SOURCE SAFE STOP · ACTIONS DISABLED');
  expect(stopped).not.toContain('LMB');
  expect(stopped).not.toContain('F SUB');
  const ended=b380NativeWeaponGuidance({
   ...base,hp:0,sourceMatchState:'TIME_UP',actualRespawnTicksRemaining:75
  });
  expect(ended).toContain('ROUND FINISHED');
  expect(ended).not.toContain('WAIT FOR NATIVE RESPAWN');
 });
 it.each(classes)('%s cannot suggest active controls when native weapon is not ready',klass=>{
  const guidance=b380NativeWeaponGuidance({
   ...base,profile:{...base.profile,weaponClass:klass},canShoot:false
  });
  expect(guidance).toContain('NATIVE WEAPON RECOVERING');
  expect(guidance).not.toContain('LMB');
  expect(guidance).not.toContain('RMB');
  expect(guidance).not.toContain('F SUB');
 });
 it.each(classes)('%s cannot suggest shooting or sub at zero real ink',klass=>{
  const guidance=b380NativeWeaponGuidance({
   ...base,profile:{...base.profile,weaponClass:klass},actualInkRemaining:0
  });
  expect(guidance).toContain('INK EMPTY');
  expect(guidance).not.toContain('LMB');
  expect(guidance).not.toContain('RMB');
  expect(guidance).not.toContain('F SUB');
 });
 it('never invents an ammo count and rejects corrupted native ink',()=>{
  expect(b380NativeWeaponGuidance({...base,actualInkRemaining:60}))
   .toContain('LMB FIRE');
  for(const bad of [-1,NaN,Infinity]){
   const guidance=b380NativeWeaponGuidance({...base,actualInkRemaining:bad});
   expect(guidance).toContain('INK UNAVAILABLE');
   expect(guidance).not.toContain('LMB');
  }
 });
 it('dualies show both real fire and physical dodge',()=>{
  const guidance=b380NativeWeaponGuidance({...base,profile:{
   weaponClass:'DUALIES',displayName:'Twin Comets'
  },actualInkRemaining:81});
  expect(guidance).toContain('LMB FIRE');
  expect(guidance).toContain('RMB DODGE 2/2');
 });
 it('refuses any fire claim when native HP is not finite',()=>{
  expect(b380NativeWeaponGuidance({...base,hp:NaN}))
   .toContain('HP UNAVAILABLE · NO FIRE CLAIM');
 });
});
