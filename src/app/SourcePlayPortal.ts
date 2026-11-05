import {b384SourceCircuitHref} from './B384SourceCircuit';
import {b207CombatRoundUrl} from './B207SourceCombatRound';
import {sourceCoopNavigationUrl,sourceCoopEligible} from './B193SourceCoopMode';

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
/** Real keyboard R shares the same finished-session gate as clicking the
 * real replay button. Never propagate R to legacy in-world reset(). */
export type SourceReplayHotkeyAction='UNRELATED'|SourceFinishedReplayAction;
export function sourceReplayHotkeyAction(
 input:SourceFinishedReplayEvidence&{
  code:string;repeat:boolean;modified:boolean;editing:boolean;
 }
):SourceReplayHotkeyAction{
 if(input.code!=='KeyR'||sourcePlayPortalReturnUrl(input.href)===null)
  return 'UNRELATED';
 if(input.repeat||input.modified||input.editing)return 'BLOCK';
 return sourceFinishedReplayAction(input);
}
