import {WEAPON_ORDER,DEFAULT_WEAPON_ID,type WeaponId}
 from '../weapons/WeaponCatalog';
import {b389NativeBootWeapon} from './B389NativeSourceRoundReplay';
/** One actual user selection; start a FRESH B192 180s SOURCE combat world.
 * Preserve ONLY the validated, currently selected human weapon. Stage,
 * physics, seven CPU, game clock and scoring are always freshly booted. */
export function b207CombatRoundUrl(current:string,weaponId?:string):string{
 const old=new URL(current);
 if(old.protocol!=='http:'&&old.protocol!=='https:')
  throw Error('B207_INVALID_NAVIGATION_ORIGIN');
 if(weaponId!==undefined&&!WEAPON_ORDER.includes(weaponId as WeaponId))
  throw Error('B207_UNKNOWN_NATIVE_SELECTED_WEAPON');
 // The real T21 in-game launcher may be opened as /index.html.
 // Canonical SOURCE portal modes boot the directory URL, not /index.html:
 // without normalization, a genuine 180s session reaches TIME_UP but
 // sourceFinishedReplayAction refuses its otherwise valid replay.
 const gamePath=old.pathname.endsWith('/index.html')?
  old.pathname.slice(0,-'index.html'.length):old.pathname;
 const next=new URL(gamePath,old.origin);
 next.searchParams.set('t21Play','preview');
 next.searchParams.set('t21QaDrive','source');
 next.searchParams.set('t21W10B183','firstDropPlay');
 next.searchParams.set('t21W10B192','humanCombat');
 // Read-only real Rapier five-foot-ray safety ledger on the selected
 // user game. This never changes physics or certifies a route.
 next.searchParams.set('t21W10B112','humanGround');
 next.searchParams.set('t21W10B203','fullRound');
 // The ordinary no-argument launcher keeps its legacy default URL.
 // Other already-owned native kits require the existing B389 exact
 // source-boot contract, never carried over arbitrary query flags.
 if(weaponId&&weaponId!==DEFAULT_WEAPON_ID){
  next.searchParams.set('t21W10B389',weaponId);
  if(b389NativeBootWeapon(next.searchParams)!==weaponId)
   throw Error('B207_SELECTED_NATIVE_WEAPON_NOT_AUTHORIZED');
 }
 return next.href;
}
