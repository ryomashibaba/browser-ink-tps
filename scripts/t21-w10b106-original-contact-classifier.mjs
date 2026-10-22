/**
 * B106: classify READ-ONLY genuine source Rapier A3 movement evidence.
 *
 * Never infer "sustained" contact duration from a cumulative rejection
 * count. An original NavLink detour is evidence of the chosen recovery
 * action, not evidence that a particular collider remained in contact.
 * This file has no access to gameplay, controls, collision or NavMesh.
 */
export const B106_CLASS={
 CALIBRATION_MISS:'CALIBRATION_MISS',
 NO_CONTACT_DIRECT:'NO_CONTACT_DIRECT_RECOVERY',
 TRANSIENT_DIRECT:'ACTUAL_CONTACT_DIRECT_RECOVERY',
 CONTACT_DETOUR:'ACTUAL_CONTACT_ORIGINAL_LINK_DETOUR_RECOVERY',
 UNRESOLVED:'ACTUAL_CONTACT_UNRESOLVED',
 INCOMPLETE:'OBSERVATION_INCOMPLETE',
 INVALID:'INVALID_ORIGIN_OR_UNSUPPORTED_PROOF'
};

const cpuIds=new Set(['A1','A2','A3','B1','B2','B3','B4']);
const invalid=reason=>({
 classification:B106_CLASS.INVALID,certified:false,reason
});
export function classifyB106(original){
 const x=original??{};
 if(x.originalAuthority!==true||x.teleportPerformed===true||
    x.original4v4Certified!==false||x.stopReason)
  return invalid('Original-source frozen authority or real-session integrity failed');
 if(x.qualified===false)
  return {classification:B106_CLASS.CALIBRATION_MISS,certified:false,
   reason:'Real human did not qualify at original right-lane geometry; no route inference'};
 const kcc=x.a3HumanProximateRapierRejections;
 if(!Number.isSafeInteger(kcc)||kcc<0)
  return invalid('Actual original KCC rejection count absent or invalid');
 const ids=x.physicalRejoins;
 if(!Array.isArray(ids)||ids.some(id=>!cpuIds.has(id))||
    new Set(ids).size!==ids.length)
  return invalid('Physical rejoined actor identities are invalid or duplicated');
 const link=x.originalA3DetourLink??null;
 const escape=x.sourceFloorEscapeFoot??null;
 if(link!==null&&
    (typeof link!=='string'||!/^first-drop-positive-z-\d+$/.test(link)||
     !Array.isArray(escape)||escape.length!==3||
     !escape.every(n=>typeof n==='number'&&Number.isFinite(n))))
  return invalid('Detour requires an actual audited original first-drop link and source-floor escape');
 if(link!==null&&kcc===0)
  return invalid('Source detour cannot certify a physically blocked human case without Rapier evidence');
 const complete=ids.length===7&&x.realA3Rejoined===true&&
  x.realA2Rejoined===true&&x.freeCombatEnabled===true&&
  x.matchState==='PLAYING';
 if(ids.length===7&&!complete)
  return invalid('Seven actors listed without genuine rejoin/play evidence');
 if(!complete){
  if(x.ended===true)
   return {classification:kcc>0?B106_CLASS.UNRESOLVED:B106_CLASS.INCOMPLETE,
    certified:false,reason:'Authentic source session ended before seven physical rejoins',
    nativeContactRejections:kcc,nativeTick:x.tick??null};
  return {classification:B106_CLASS.INCOMPLETE,certified:false,
   reason:'Actual native simulation is still running',
   nativeContactRejections:kcc,nativeTick:x.tick??null};
 }
 const classification=kcc===0?B106_CLASS.NO_CONTACT_DIRECT:
  link===null?B106_CLASS.TRANSIENT_DIRECT:B106_CLASS.CONTACT_DETOUR;
 return {classification,certified:true,
  physicalSevenRejoined:true,
  nativeContactRejections:kcc,
  originalNavLink:link,
  originalSourceEscapeFoot:escape,
  nativeTick:x.tick??null,
  humanFoot:x.humanFoot??null,
  productionAuthorized:false,unrestricted4v4Certified:false};
}
