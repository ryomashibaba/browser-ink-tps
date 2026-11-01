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
 it('refuses any fire claim when native HP is not finite',()=>{
  expect(b380NativeWeaponGuidance({...base,hp:NaN}))
   .toContain('HP UNAVAILABLE · NO FIRE CLAIM');
 });
});
