/** B411 CDP presentation-only observation, enabled only AFTER true
 * B203 source-only CLEAR and B322 original physical KCC route.
 * Zero game state, actor, source geometry, ink, HP or tick writes.
 */
const fail=s=>{throw Error('B411_REAL_SOURCE_PRESENTATION_HOLD_'+s);};
const need=(v,k)=>{if(!v)fail(k);};
export async function b411EnableAfterNativeRealClear(evaluate,snapshot){
 const n=await snapshot();
 need(n.matchState==='PLAYING'&&!n.paused&&!n.stopReason&&
  n.b25SourcePaintRun?.status==='CLEAR'&&
  n.sourceScoreablePromotions===0&&
  n.originalSourceSolids===25&&n.originalPaintSurfaces===17&&
  n.originalSourceNavigationLinks===26&&
  n.cpu.physicalRejoins.length===7,
  'NO_GENUINE_B203_CLEAR_SEVEN_CPU_SOURCE_MATCH');
 const verdict=await evaluate(`(() => {
  const u=new URL(location.href);
  if(u.searchParams.get('t21B312')!=='genuineSecondHumanPaint'||
     u.searchParams.get('t21W10B203')!=='fullRound'||
     u.searchParams.get('t21B337')!=='localOriginalAim')
   return 'INVALID_READ_ONLY_SOURCE_MODE';
  u.searchParams.set('t21B411','sourceRoundFocus');
  history.replaceState(null,'',u.href);
  return new URL(location.href).searchParams.get('t21B411');
 })()`);
 need(verdict==='sourceRoundFocus','SOURCE_LIVE_HUD_OPTIN');
 return true;
}
const READ=`(() => {
 const n=window.__t21F3.snapshot();
 const root=document.querySelector('#t21-f3-b195-native-coop');
 const card=document.querySelector('#t21-f3-b25-paint-run');
 const toast=document.querySelector('#t21-f3-b168-real-practice-clear');
 const replay=document.querySelector('#t21-f3-b200-replay');
 const flag=new URL(location.href).searchParams;
 const practice=n.b25SourcePaintRun;
 return {
  tick:n.tick,remainingSeconds:n.timeRemainingSeconds,
  matchState:n.matchState,paused:n.paused,
  sourceSolids:n.originalSourceSolids,
  sourcePaintSurfaces:n.originalPaintSurfaces,
  sourceNavigationLinks:n.originalSourceNavigationLinks,
  sourceScoreable:n.sourceScoreablePromotions,
  officialWinner:practice.officialWinner,
  originalSourceOnly:root?.dataset.originalSourceOnly==='true',
  nativeB203FullRound:flag.get('t21W10B203')==='fullRound',
  hudSourceOnly:root?.dataset.originalSourceOnly,
  hudOriginalScoreable:root?.dataset.originalScoreable,
  hudOriginalOfficialWinner:root?.dataset.officialWinner,
  actualPracticeState:practice.status,
  actualPracticeGenuineClear:toast?.dataset.t21B168GenuineClear,
  b411HudEnabled:flag.get('t21B411')==='sourceRoundFocus',
  b411Compact:root?.dataset.t21B411Active==='true',
  hudCompactData:root?.dataset.t21B411Active,
  paintCardCompactData:card?.dataset.t21B411Focused,
  clearToastCompactData:toast?.dataset.t21B411Compact,
  paintCardHidden:card?.hidden,
  clearToastHidden:toast?.hidden,
  replayHidden:replay?.hidden,
  replayDisabled:replay?.disabled,
  hudTop:root?.style.top,hudLeft:root?.style.left,
  hudText:root?.querySelector('#t21-f3-b195-next')?.textContent,
  countdownText:root?.querySelector('#t21-f3-b195-time')?.textContent
 };
})()`;
export async function b411ReadNativeHud(evaluate){return evaluate(READ);}
export async function b411NativeHudSample(label,evaluate,until){
 need(['AFTER_ROUTE','90','TIME_UP'].includes(label),'UNKNOWN_NATIVE_MARKER');
 const last=label==='TIME_UP';
 const native=await until(async()=>{
  const frame=await b411ReadNativeHud(evaluate);
  const phase=last?
   frame.matchState==='TIME_UP'&&frame.b411Compact===false&&
   frame.paintCardHidden===false&&frame.replayHidden===false&&
   frame.replayDisabled===false:
   frame.matchState==='PLAYING'&&frame.b411Compact===true&&
   frame.paintCardHidden===true&&frame.replayHidden===true&&
   frame.replayDisabled===true&&frame.clearToastHidden===true;
  return frame.b411HudEnabled&&phase?frame:false;
 },25000);
 return {label,...native};
}
