/** B327: A1 may CLEAR before independent original human source-paint QA starts.
 * This gate permits REAL input only. It never grants a paint PASS.
 * Completed matches, missing source support, or mutated actors still HOLD. */
const LANDING='UndertowT21D:first-drop-landing-positive-z';
const FIRST_HUMAN='UndertowT21D:spawn-high-positive-z:paint';
export function b327CheckGenuinePostClearLowerShot(snapshot,ledger){
 const practiceStatus=snapshot?.b25SourcePaintRun?.status??null;
 const p=snapshot?.player?.position,actual=ledger?.actualBodyMeters;
 const positionOK=Array.isArray(p)&&p.length===3&&
  p.every(Number.isFinite)&&p[0]>=-1.2&&p[0]<=4.8&&
  p[1]>=3.55&&p[1]<=4.65&&p[2]>=46.8&&p[2]<=52.5;
 const sameRealBody=positionOK&&Array.isArray(actual)&&
  actual.length===3&&actual.every(Number.isFinite)&&
  Math.hypot(...p.map((n,i)=>n-actual[i]))<=.15;
 const matchRunning=snapshot?.matchState==='PLAYING'&&
  (practiceStatus==='RUNNING'||practiceStatus==='CLEAR');
 const genuineSource=ledger?.source==='25/17/26/0'&&
  ledger?.realHumanOriginalFootSupported===true&&
  ledger?.genuineHumanOriginalFootSolid===LANDING&&
  ledger?.sourceActorRelocations===0&&
  ledger?.sourceInkRewritten===false&&
  ledger?.playerPositionRewritten===false&&
  ledger?.humanLastPaintedSurface===FIRST_HUMAN&&
  Array.isArray(ledger?.originalRows)&&ledger.originalRows.length===17;
 const reason=!matchRunning?'MATCH_OR_PRACTICE_NOT_ACTIVE':
  !positionOK?'ORIGINAL_LOWER_WORLD_GUARD':
  !sameRealBody?'TRUE_CDP_AND_KCC_BODY_DIVERGED':
  !genuineSource?'TRUE_ORIGINAL_HUMAN_SUPPORT_NOT_PROVEN':
  'ELIGIBLE_FOR_REAL_SHOT_ATTEMPT_ONLY';
 return {schema:'B327_POST_CLEAR_SHOT_ELIGIBILITY',source:'25/17/26/0',
  eligible:reason==='ELIGIBLE_FOR_REAL_SHOT_ATTEMPT_ONLY',reason,
  originalHumanFoot:ledger?.genuineHumanOriginalFootSolid??null,
  practiceStatus,matchState:snapshot?.matchState??null,
  noShootingOrPaintProofGranted:true,original4v4Certified:false,
  artAccepted:false,productionAuthorized:false};
}
