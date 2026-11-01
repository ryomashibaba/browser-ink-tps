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
/** A URL is not trusted evidence of previous play. This is only a legal
 * pre-pointer-lock, source-only B378 weapon selection; nothing auto-starts. */
export function b389NativeBootWeapon(
 params:URLSearchParams
):WeaponId|null{
 if(!b384SourceCircuitSelected(params))return null;
 const id=params.get('t21W10B389');
 return id&&WEAPON_ORDER.includes(id as WeaponId)?id as WeaponId:null;
}
