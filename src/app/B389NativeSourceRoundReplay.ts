/** B389: explicitly user-chosen new SOURCE world, retaining only the existing
 * human weapon choice. Never persist game state, actors, paint or ticks.
 */
import {WEAPON_ORDER,type WeaponId} from '../weapons/WeaponCatalog';
import {b384SourceCircuitHref,b384SourceCircuitSelected} from './B384SourceCircuit';

export type B389ReplayAction={
 readonly paused:boolean;
 readonly pointerLocked:boolean;
 readonly stopReason:string|null;
 readonly matchState:string;
 readonly weaponId:string;
 readonly sourceBoundary:readonly number[];
};
/** Existing full-round stage authority must be intact; play must be paused
 * or naturally TIME_UP. Only a real button/explicit restart may navigate. */
export function b389NativeNewRoundHref(
 href:string, action:B389ReplayAction
):string|null{
 let u:URL;
 try{u=new URL(href)}catch{return null}
 if(!b384SourceCircuitSelected(u.searchParams)||
    action.sourceBoundary.join(',')!=='25,17,26,0'||
    action.pointerLocked||action.stopReason||
    !WEAPON_ORDER.includes(action.weaponId as WeaponId)||
    !['PLAYING','TIME_UP'].includes(action.matchState)||
    (action.matchState==='PLAYING'&&!action.paused))return null;
 const native=b384SourceCircuitHref(href,true);
 if(!native)return null;
 const next=new URL(native);
 next.searchParams.set('t21W10B389',action.weaponId);
 return next.href;
}
/** B472: source-ONLY real 12-weapon boot for all four existing portal
 * modes. The legacy B384 circuit remains unchanged; every OTHER mode
 * requires EXACT original launcher parameters and no unexpected QA or
 * production flags. This grants only a native human weapon at STAGING.
 * No mode, actor, path, score, clock or source authority is expanded.
 */
export function b389NativeBootWeapon(
 params:URLSearchParams
):WeaponId|null{
 const id=params.get('t21W10B389');
 if(!id||!WEAPON_ORDER.includes(id as WeaponId))return null;
 if(b384SourceCircuitSelected(params))return id as WeaponId;
 const common=['t21Play','t21QaDrive','t21W10B183',
  't21W10B203','t21W10B389'];
 if(params.get('t21Play')!=='preview'||
    params.get('t21QaDrive')!=='source'||
    params.get('t21W10B183')!=='firstDropPlay'||
    params.get('t21W10B203')!=='fullRound')return null;
 const combat=params.get('t21W10B192')==='humanCombat';
 const coop=params.get('t21W10B193')==='allyCoop';
 if(combat===coop)return null;
 const frontline=params.get('t21W10B441')==='sourceFrontline'&&
  params.get('t21W10B448')==='realA3Front';
 const required=coop?[...common,'t21W10B193']:
  [...common,'t21W10B112','t21W10B192',
   ...(frontline?['t21W10B441','t21W10B448']:[])];
 if(combat&&params.get('t21W10B112')!=='humanGround')return null;
 const actual=[...params.keys()].sort().join('|');
 if(actual!==required.sort().join('|'))return null;
 return id as WeaponId;
}
