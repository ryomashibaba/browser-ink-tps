/** B190: snapshot the ACTUAL seven original Recast/Rapier CPU participants.
 * This is only preflight/diagnostic evidence, NOT a source route or Turf proof.
 */
export const B190_SOURCE_IDS=Object.freeze(['A1','A2','A3','B1','B2','B3','B4']);
export function b190NativeCpuStartProgress(s){
 const cpu=s?.cpu??null;
 const actors=Array.isArray(cpu?.cpu)?cpu.cpu:[];
 const rejoins=Array.isArray(cpu?.physicalRejoins)?cpu.physicalRejoins:[];
 const ids=B190_SOURCE_IDS;
 const sourceOkay=s?.originalSourceSolids===25&&
  s.originalPaintSurfaces===17&&
  s.originalSourceNavigationLinks===26&&
  s.sourceScoreablePromotions===0&&
  s.productionAuthorized===false&&
  s.unrestricted4v4Certified===false&&
  cpu?.productionAuthorized===false&&
  cpu?.physicalFootRelocations===0;
 const participants=ids.map(id=>{
  const records=actors.filter(a=>a?.id===id);
  const actor=records.length===1?records[0]:null;
  const foot=actor?.physicalFoot;
  const realFoot=Array.isArray(foot)&&foot.length===3&&
   foot.every(Number.isFinite)?[...foot]:null;
  return {
   id,recordsFound:records.length,actualPhysicalFoot:realFoot,
   genuineReleased:actor?.released===true,
   genuineRejoined:actor?.rejoined===true&&rejoins.includes(id),
   mobilityState:actor?.mobilityState??null
  };
 });
 const uniqueRejoins=new Set(rejoins);
 const allSeven=sourceOkay&&rejoins.length===7&&uniqueRejoins.size===7&&
  ids.every(id=>uniqueRejoins.has(id))&&
  actors.length===7&&participants.every(p=>
   p.recordsFound===1&&p.actualPhysicalFoot!==null&&
   p.genuineReleased&&p.genuineRejoined);
 const stage=s?.matchState??'UNKNOWN';
 return {
  realNativeTick:Number.isSafeInteger(s?.tick)?s.tick:null,
  matchState:stage,actualSourceStageValid:sourceOkay,
  originalFrozenSourceOnly:true,scoreableSourceAdded:0,
  existingNativeFreeCombatEnabled:cpu?.freeCombatEnabled===true,
  actualPhysicallyRejoinedCpuIds:rejoins.filter(id=>ids.includes(id)),
  uniqueExpectedPhysicalRejoins:ids.filter(id=>uniqueRejoins.has(id)).length,
  sevenSourceCpuParticipants:participants,
  allSevenSourceCpuPhysicallyRejoined:allSeven,
  nativeSourceStartReady:allSeven&&stage==='PLAYING'&&
   cpu?.freeCombatEnabled===true&&!s?.stopReason,
  outcome:stage==='TIME_UP'?'GAME_TIMEOUT_NO_CIRCUIT_PROOF':
   s?.stopReason?'NATIVE_SOURCE_STOP':
   allSeven&&stage==='PLAYING'&&cpu?.freeCombatEnabled===true?
    'PHYSICAL_CPU_SOURCE_RELEASE_READY':
    'WAIT_REAL_ORIGINAL_CPU_REJOIN'
 };
}
