import {b384SourceCircuitHref} from './B384SourceCircuit';
import {b207CombatRoundUrl} from './B207SourceCombatRound';

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
 for(const destination of [circuit,combat]){
  const u=new URL(destination);
  if(u.origin!==portal.origin||u.pathname!==root.pathname||
    u.searchParams.get('t21Play')!=='preview'||
    u.searchParams.get('t21QaDrive')!=='source'||
    u.searchParams.get('t21W10B203')!=='fullRound'||
    u.searchParams.get('t21W10B192')!=='humanCombat'||
    u.searchParams.has('t21QaInput')||u.hash)
    throw Error('T21_SOURCE_PORTAL_UNSAFE_DESTINATION');
 }
 return {circuit,combat};
}
