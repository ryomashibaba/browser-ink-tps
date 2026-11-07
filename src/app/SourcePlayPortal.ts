import {b384SourceCircuitHref} from './B384SourceCircuit';
import {b207CombatRoundUrl} from './B207SourceCombatRound';
import {sourceCoopNavigationUrl,sourceCoopEligible} from './B193SourceCoopMode';
import {WEAPON_ORDER,DEFAULT_WEAPON_ID,type WeaponId}
 from '../weapons/WeaponCatalog';
import {b389NativeBootWeapon} from './B389NativeSourceRoundReplay';

/** Shared SOURCE-only human weapon preference. Never stores game state. */
export const SOURCE_PLAY_WEAPON_STORAGE_KEY='t21-source-weapon-selection-v1';
export function sourcePlayStoreWeaponSelection(
 storage:Pick<Storage,'setItem'>|null,weaponId:string
):boolean{
 if(!storage||!WEAPON_ORDER.includes(weaponId as WeaponId))return false;
 try{storage.setItem(SOURCE_PLAY_WEAPON_STORAGE_KEY,weaponId);return true;}
 catch{return false;}
}

/** One-click T21 launcher. Keep original T20 index/game untouched.
 * Both modes boot a FRESH native SOURCE-only world. Never grant scoring,
 * actor teleport, geometry, production, or unaudited 4v4 authority. */
export function sourcePlayPortalDestinations(portalUrl:string){
 const portal=new URL(portalUrl);
 if(!['http:','https:'].includes(portal.protocol)||
  !portal.pathname.endsWith('/play-source.html'))
  throw Error('T21_SOURCE_PORTAL_INVALID_ORIGIN');
 // Resolve the project-relative INDEX directory (including Pages-style
 // subpaths). Never carry through arbitrary QA flags or URL fragments.
 const root=new URL('./',portal);
 const eligible=new URL(root.href);
 eligible.searchParams.set('t21Play','preview');
 const circuit=b384SourceCircuitHref(eligible.href,true);
 if(!circuit)throw Error('T21_SOURCE_PORTAL_CIRCUIT_DENIED');
 const combat=b207CombatRoundUrl(root.href);
 const selectedCoop=new URL(root.href);
 selectedCoop.searchParams.set('t21W10B203','fullRound');
 const coop=sourceCoopNavigationUrl(selectedCoop.href,true);
 if(!sourceCoopEligible(new URL(coop).searchParams))
  throw Error('T21_SOURCE_PORTAL_COOP_DENIED');
 for(const destination of [circuit,combat,coop]){
  const u=new URL(destination);
  if(u.origin!==portal.origin||u.pathname!==root.pathname||
    u.searchParams.get('t21Play')!=='preview'||
    u.searchParams.get('t21QaDrive')!=='source'||
    u.searchParams.get('t21W10B203')!=='fullRound'||
    (destination===coop?
     (u.searchParams.get('t21W10B193')!=='allyCoop'||
      u.searchParams.has('t21W10B192')):
     (u.searchParams.get('t21W10B192')!=='humanCombat'||
      u.searchParams.has('t21W10B193')))||
    u.searchParams.has('t21QaInput')||u.hash)
    throw Error('T21_SOURCE_PORTAL_UNSAFE_DESTINATION');
 }
 return {circuit,combat,coop};
}

/** B472: same deliberately selected original human kit in all four actual
 * playable SOURCE entry modes. Defaults leave the old native URLs intact.
 * The only addition is the EXISTING B389 pre-STAGING weapon ID.
 * This is NOT permission for new CPU combat, paths or Turf scoring.
 */
export function sourcePlayWeaponModeDestinations(
 portalUrl:string,requestedWeaponId:string
):Readonly<{circuit:string;combat:string;coop:string;frontline:string}>{
 if(!WEAPON_ORDER.includes(requestedWeaponId as WeaponId))
  throw Error('T21_SOURCE_UNKNOWN_NATIVE_WEAPON');
 const id=requestedWeaponId as WeaponId;
 const base=sourcePlayPortalDestinations(portalUrl);
 const frontend=new URL(portalUrl),root=new URL('./',frontend);
 const safe=(href:string):string=>{
  const u=new URL(href);
  if(u.origin!==frontend.origin||u.pathname!==root.pathname||
     u.searchParams.has('production')||
     u.searchParams.has('scoreable')||
     u.searchParams.has('t21QaInput')||u.hash)
   throw Error('T21_SOURCE_LOADOUT_UNSAFE_TARGET');
  if(id!==DEFAULT_WEAPON_ID){
   u.searchParams.set('t21W10B389',id);
   if(b389NativeBootWeapon(u.searchParams)!==id)
    throw Error('T21_SOURCE_LOADOUT_NATIVE_AUTHORITY_REJECTED');
  }
  return u.href;
 };
 return {circuit:safe(base.circuit),combat:safe(base.combat),
  coop:safe(base.coop),
  frontline:safe(sourcePlayFrontlineResearchUrl(portalUrl))};
}

/** Existing true SOURCE 180s round -> a new mode selection, never
 * an in-world reset/actor relocation or fake official result. */
export function sourcePlayPortalReturnUrl(href:string):string|null{
 try{
  const u=new URL(href),q=u.searchParams;
  if(!['http:','https:'].includes(u.protocol)||
   !(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'))||
   q.get('t21Play')!=='preview'||q.get('t21QaDrive')!=='source'||
   q.get('t21W10B203')!=='fullRound')return null;
  const menu=new URL('./play-source.html',u);
  return menu.origin===u.origin?menu.href:null;
 }catch{return null;}
}

/** Optional user-initiated REAL B441/B448 original-source CPU study.
 * Default SOURCE game modes and original FIXED CPU patrol remain unchanged. */
export function sourcePlayFrontlineResearchUrl(portalUrl:string):string{
 const normal=sourcePlayPortalDestinations(portalUrl);
 const mode=new URL(normal.combat);
 if(mode.searchParams.get('t21W10B203')!=='fullRound'||
    mode.searchParams.get('t21W10B192')!=='humanCombat'||
    mode.searchParams.get('t21QaDrive')!=='source'||
    mode.searchParams.has('t21W10B193'))
  throw Error('T21_FRONTLINE_RESEARCH_REQUIRES_REAL_SOURCE_COMBAT');
 mode.searchParams.set('t21W10B441','sourceFrontline');
 mode.searchParams.set('t21W10B448','realA3Front');
 if(mode.origin!==new URL(portalUrl).origin||
    mode.pathname!==new URL('./',portalUrl).pathname||
    mode.searchParams.has('t21QaInput')||
    mode.searchParams.has('production')||
    mode.searchParams.has('scoreable')||mode.hash)
  throw Error('T21_FRONTLINE_RESEARCH_UNSAFE_URL');
 return mode.href;
}


/** Only a user-visible, genuinely finished SOURCE session can replay.
 * The existing B384 / A1 routes already create a fresh physical world.
 * SOURCE combat (incl. opt-in original frontline) must reload the page,
 * never call the legacy in-world CPU/paint reset before navigation. */
export type SourceFinishedReplayAction='BLOCK'|
 'CLICK_REAL_REPLAY'|'RELOAD_NATIVE_SOURCE_WORLD';
export interface SourceFinishedReplayEvidence {
 href:string;matchState?:string;stopped:boolean;pointerLocked:boolean;
 originalSolids?:number;originalPaint?:number;originalLinks?:number;
 scoreable?:number;finishedVisible:boolean;canClick:boolean;
}
export function sourceFinishedReplayAction(
 input:SourceFinishedReplayEvidence
):SourceFinishedReplayAction{
 if(sourcePlayPortalReturnUrl(input.href)===null||
    input.matchState!=='TIME_UP'||input.stopped||input.pointerLocked||
    input.originalSolids!==25||input.originalPaint!==17||
    input.originalLinks!==26||input.scoreable!==0||
    !input.finishedVisible||!input.canClick)return 'BLOCK';
 const q=new URL(input.href).searchParams;
 if(q.has('production')||q.has('scoreable')||q.has('t21QaInput')||
    q.get('t21W10B183')!=='firstDropPlay')return 'BLOCK';
 const coop=sourceCoopEligible(q);
 const circuit=q.get('t21W10B384')==='loadoutCircuit'&&
    q.get('t21W10B192')==='humanCombat'&&!q.has('t21W10B193');
 const combat=q.get('t21W10B192')==='humanCombat'&&
    !q.has('t21W10B193')&&!q.has('t21W10B384');
 if(coop||circuit)return 'CLICK_REAL_REPLAY';
 return combat?'RELOAD_NATIVE_SOURCE_WORLD':'BLOCK';
}
/**
 * Sprint A: the real TIME_UP button starts a new physical SOURCE world in
 * the SAME existing game mode with the player's actual READY-selected kit.
 * Recognize only the four canonical portal modes. Never copy QA, world
 * state, actor positions, score authority or arbitrary URL flags.
 */
export function sourceFinishedReplayHref(
 input:SourceFinishedReplayEvidence&{weaponId:string}
):string|null{
 if(sourceFinishedReplayAction(input)==='BLOCK'||
    !WEAPON_ORDER.includes(input.weaponId as WeaponId))return null;
 const menu=sourcePlayPortalReturnUrl(input.href);
 if(!menu)return null;
 try{
  const current=new URL(input.href);
  const bootKit=current.searchParams.get('t21W10B389');
  if(bootKit!==null&&
     b389NativeBootWeapon(current.searchParams)!==bootKit)return null;
  const initial=sourcePlayWeaponModeDestinations(
   menu,bootKit??DEFAULT_WEAPON_ID);
  const sameNativeUrl=(a:string,b:string):boolean=>{
   const x=new URL(a),y=new URL(b);
   if(x.origin!==y.origin||x.pathname!==y.pathname||
      x.hash!==''||y.hash!=='')return false;
   const pairs=(u:URL)=>[...u.searchParams.entries()]
    .map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).sort();
   const one=pairs(x),two=pairs(y);
   return one.length===two.length&&one.every((v,i)=>v===two[i]);
  };
  const mode=(Object.keys(initial) as Array<keyof typeof initial>)
   .find(key=>sameNativeUrl(current.href,initial[key]));
  if(!mode)return null;
  return sourcePlayWeaponModeDestinations(menu,input.weaponId)[mode];
 }catch{return null;}
}


export type SourcePlayableMode='circuit'|'combat'|'coop'|'frontline';
/** Only one of the four actual SOURCE launcher URLs can switch modes.
 * Rejects injected parameters, duplicate keys and mixed research flags.
 */
export function sourceCanonicalPlayableMode(href:string):SourcePlayableMode|null{
 const menu=sourcePlayPortalReturnUrl(href);
 if(!menu)return null;
 try{
  const u=new URL(href),initial=u.searchParams.get('t21W10B389');
  if(initial!==null&&b389NativeBootWeapon(u.searchParams)!==initial)
   return null;
  const options=sourcePlayWeaponModeDestinations(menu,initial??DEFAULT_WEAPON_ID);
  const same=(a:string,b:string):boolean=>{
   const x=new URL(a),y=new URL(b);
   if(x.origin!==y.origin||x.pathname!==y.pathname||x.hash||y.hash)
    return false;
   const pairs=(z:URL)=>[...z.searchParams.entries()]
    .map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).sort();
   const left=pairs(x),right=pairs(y);
   return left.length===right.length&&left.every((v,i)=>v===right[i]);
  };
  return (Object.keys(options) as SourcePlayableMode[])
   .find(mode=>same(u.href,options[mode]))??null;
 }catch{return null;}
}
/** A clean NEW SOURCE world retaining only the current human weapon and
 * the explicitly selected one of the four existing modes, not game state.
 */
export function sourceFreshSelectedModeHref(
 href:string,weaponId:string,target:SourcePlayableMode
):string|null{
 if(sourceCanonicalPlayableMode(href)===null||
    !WEAPON_ORDER.includes(weaponId as WeaponId))return null;
 const menu=sourcePlayPortalReturnUrl(href);
 if(!menu)return null;
 try{return sourcePlayWeaponModeDestinations(menu,weaponId)[target]??null}
 catch{return null;}
}
/** User-selected mid-round restart: only an already played, genuinely paused
 * and pointer-unlocked SOURCE-only world. Nothing is reset in place.
 */
export function sourcePausedFreshRoundHref(input:{
 href:string;weaponId:string;matchState:string;paused:boolean;
 everLockedRealPointer:boolean;pointerLocked:boolean;stopped:boolean;
 originalSolids:number;originalPaint:number;originalLinks:number;scoreable:number;
}):string|null{
 if(input.matchState!=='PLAYING'||!input.paused||!input.everLockedRealPointer||
    input.pointerLocked||input.stopped||input.originalSolids!==25||
    input.originalPaint!==17||input.originalLinks!==26||input.scoreable!==0)
  return null;
 const mode=sourceCanonicalPlayableMode(input.href);
 return mode===null?null:sourceFreshSelectedModeHref(input.href,input.weaponId,mode);
}

/** A genuine A1 mission can CLEAR before the 180s world reaches TIME_UP.
 * Exact original physical SOURCE, true paused/unlocked user replay required.
 */
export function sourceCoopPracticeFreshReplayHref(input:{
 href:string;weaponId:string;matchState:string;practiceStatus:string;
 stopped:boolean;pointerLocked:boolean;originalSolids:number;
 originalPaint:number;originalLinks:number;scoreable:number;
}):string|null{
 if(sourceCanonicalPlayableMode(input.href)!=='coop'||
    input.matchState!=='PLAYING'||input.stopped||input.pointerLocked||
    !['CLEAR','TIME_UP','ABORTED'].includes(input.practiceStatus)||
    input.originalSolids!==25||input.originalPaint!==17||
    input.originalLinks!==26||input.scoreable!==0)return null;
 return sourceFreshSelectedModeHref(input.href,input.weaponId,'coop');
}

/** Real keyboard R shares the same finished-session gate as clicking the
 * real replay button. Never propagate R to legacy in-world reset(). */
export type SourceReplayHotkeyAction='UNRELATED'|SourceFinishedReplayAction|
 'NAVIGATE_FRESH_COOP_CLEAR';
export function sourceReplayHotkeyAction(
 input:SourceFinishedReplayEvidence&{
  code:string;repeat:boolean;modified:boolean;editing:boolean;
  practiceStatus?:string;coOpReplayVisible?:boolean;
 }
):SourceReplayHotkeyAction{
 if(input.code!=='KeyR'||sourcePlayPortalReturnUrl(input.href)===null)
  return 'UNRELATED';
 if(input.repeat||input.modified||input.editing)return 'BLOCK';
 const terminal=sourceFinishedReplayAction(input);
 if(terminal!=='BLOCK')return terminal;
 // User-visible co-op CLEAR may happen long before the true 180s TIME_UP.
 // The existing A1 replay BUTTON already creates a fresh world at CLEAR;
 // give R exactly that action, never reset a live native world in-place.
 // Require every original SOURCE key to match the genuine launcher schema.
 const q=new URL(input.href).searchParams;
 const required=['t21Play','t21QaDrive','t21W10B183',
  't21W10B193','t21W10B203'];
 const allowed=new Set([...required,'t21W10B389']);
 const count=required.length+(q.has('t21W10B389')?1:0);
 if(input.matchState!=='PLAYING'||input.practiceStatus!=='CLEAR'||
    input.coOpReplayVisible!==true||input.stopped||input.pointerLocked||
    input.originalSolids!==25||input.originalPaint!==17||
    input.originalLinks!==26||input.scoreable!==0||
    !sourceCoopEligible(q)||q.get('t21W10B183')!=='firstDropPlay'||
    q.get('t21W10B203')!=='fullRound'||
    [...q.keys()].length!==count||
    required.some(key=>!q.has(key))||
    [...q.keys()].some(key=>!allowed.has(key))||
    (q.has('t21W10B389')&&!b389NativeBootWeapon(q)))return 'BLOCK';
 return 'NAVIGATE_FRESH_COOP_CLEAR';
}
