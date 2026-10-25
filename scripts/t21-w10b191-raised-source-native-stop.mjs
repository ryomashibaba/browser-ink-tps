/**
 * B191: match the successful B123 REAL CDP input semantics:
 * release KeyD at first physically verified original raised floor,
 * rather than sliding for the whole 90-tick maximum after arrival.
 * This observes unchanged native Rapier KCC and original source IDs only.
 */
export function b191ActualNativeRaisedOriginalArrival(snapshot,stageName){
 const s=snapshot;
 const source=s?.b112OriginalHumanGround;
 const drop=s?.b183OriginalHumanDescent;
 if(stageName!=='ACTUAL_KEYD_90_ORIGINAL_UPHILL'||
  s?.matchState!=='PLAYING'||s?.stopReason||
  s?.originalSourceSolids!==25||
  s?.originalPaintSurfaces!==17||
  s?.originalSourceNavigationLinks!==26||
  s?.sourceScoreablePromotions!==0||
  s?.productionAuthorized!==false||
  s?.unrestricted4v4Certified!==false||
  source?.genuineKccGrounded!==true||
  source?.lastOriginalSourceHitId!=='UndertowT21D:right-low-team-a'||
  !Number.isFinite(source?.lastOriginalSourceGapMeters)||
  Math.abs(source.lastOriginalSourceGapMeters)>.22||
  drop?.originalFirstDropLocalPracticeClear!==true||
  drop?.actualOriginalRapierLowerLandingId!==
   'UndertowT21D:first-drop-landing-positive-z'||
  !Number.isSafeInteger(drop?.trueNativeLandingTick)||
  !Number.isSafeInteger(s?.tick)||
  s.tick<=drop.trueNativeLandingTick)return false;
 return true;
}
