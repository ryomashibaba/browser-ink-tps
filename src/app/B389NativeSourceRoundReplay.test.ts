import {describe,it,expect} from 'vitest';
import {b389NativeNewRoundHref,b389NativeBootWeapon,
 type B389ReplayAction} from './B389NativeSourceRoundReplay';
import {b384SourceCircuitHref} from './B384SourceCircuit';
import {sourceCanonicalPlayableMode,sourceFinishedReplayHref}
 from './SourcePlayPortal';
import {DEFAULT_WEAPON_ID,WEAPON_ORDER} from '../weapons/WeaponCatalog';

const circuit=b384SourceCircuitHref(
 'https://example.org/browser-ink-tps/?t21Play=preview',true)!;
const action=(v:Partial<B389ReplayAction>={}):B389ReplayAction=>({
 paused:true,pointerLocked:false,stopReason:null,matchState:'TIME_UP',
 weaponId:DEFAULT_WEAPON_ID,sourceBoundary:[25,17,26,0],...v
});

describe('T21 V28 native SOURCE circuit replay lifecycle',()=>{
 it('fixes default-kit replay falling out of canonical SOURCE mode',()=>{
  expect(sourceCanonicalPlayableMode(circuit)).toBe('circuit');
  const next=b389NativeNewRoundHref(circuit,action());
  expect(next).not.toBeNull();
  expect(new URL(next!).searchParams.has('t21W10B389')).toBe(false);
  expect(sourceCanonicalPlayableMode(next!)).toBe('circuit');
  expect(b389NativeBootWeapon(new URL(next!).searchParams)).toBeNull();
  // A second real TIME_UP session can still use the finished replay gate.
  const second=sourceFinishedReplayHref({
   href:next!,matchState:'TIME_UP',stopped:false,pointerLocked:false,
   originalSolids:25,originalPaint:17,originalLinks:26,scoreable:0,
   finishedVisible:true,canClick:true,weaponId:DEFAULT_WEAPON_ID
  });
  expect(second).not.toBeNull();
  expect(sourceCanonicalPlayableMode(second!)).toBe('circuit');
 });
 it('preserves all 12 selected REAL kits through consecutive clean replays',()=>{
  for(const id of WEAPON_ORDER){
   const first=b389NativeNewRoundHref(circuit,action({weaponId:id}));
   expect(first).not.toBeNull();
   const expected=id===DEFAULT_WEAPON_ID?null:id;
   expect(new URL(first!).searchParams.get('t21W10B389')).toBe(expected);
   expect(sourceCanonicalPlayableMode(first!)).toBe('circuit');
   const second=b389NativeNewRoundHref(first!,action({weaponId:id}));
   expect(second).not.toBeNull();
   expect(sourceCanonicalPlayableMode(second!)).toBe('circuit');
   expect(new URL(second!).searchParams.get('t21W10B389')).toBe(expected);
   expect(new URL(second!).pathname).toBe('/browser-ink-tps/');
  }
 });
 it('never grants a new world from STAGING, active PLAYING or locked input',()=>{
  for(const bad of [
   {matchState:'STAGING'}, {matchState:'PLAYING',paused:false},
   {matchState:'TIME_UP',pointerLocked:true},
   {matchState:'TIME_UP',stopReason:'NATIVE_SOURCE_STOP'},
   {matchState:'PAUSED'}, {weaponId:'forged'},
   {sourceBoundary:[25,17,26,1]},{sourceBoundary:[25,17,25,0]}
  ] as Array<Partial<B389ReplayAction>>){
   expect(b389NativeNewRoundHref(circuit,action(bad))).toBeNull();
  }
  expect(b389NativeNewRoundHref('not a URL',action())).toBeNull();
  expect(b389NativeNewRoundHref(
   'https://example.org/browser-ink-tps/?t21Play=preview',
   action())).toBeNull();
 });
 it('does not carry query injection, hash or official-score claims into replay',()=>{
  const contaminated=circuit+'&production=1&scoreable=99#old';
  const next=b389NativeNewRoundHref(contaminated,action({matchState:'PLAYING'}));
  expect(next).not.toBeNull();
  const u=new URL(next!);
  expect(u.searchParams.has('production')).toBe(false);
  expect(u.searchParams.has('scoreable')).toBe(false);
  expect(u.hash).toBe('');
  expect(sourceCanonicalPlayableMode(next!)).toBe('circuit');
 });
 it('rejects mixed QA/production or duplicate circuit weapon boot authority',()=>{
  const selected=new URL(b384SourceCircuitHref(circuit,true,WEAPON_ORDER[2])!);
  expect(b389NativeBootWeapon(selected.searchParams)).toBe(WEAPON_ORDER[2]);
  for(const extra of [
   ['production','1'],['scoreable','1'],
   ['t21QaInput','deterministic'],
   ['t21W10B389',WEAPON_ORDER[2]!],
   ['t21W10B441','sourceFrontline']
  ] as const){
   const mutated=new URL(selected);
   mutated.searchParams.append(extra[0],extra[1]);
   expect(b389NativeBootWeapon(mutated.searchParams)).toBeNull();
  }
  // Browser can still start with the genuine default loadout.
  expect(b389NativeBootWeapon(new URL(circuit).searchParams)).toBeNull();
 });
});
