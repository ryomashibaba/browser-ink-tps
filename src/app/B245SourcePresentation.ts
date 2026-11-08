/** B245: display-only reversible SOURCE round / diagnostic HUD. */
import {b384SourceCircuitSelected} from './B384SourceCircuit';
import {b475RealFrontlineReadyMode} from './B475RealFrontlineReadyChallenge';
export type B245View='PLAYER'|'QA';
export function b245InitialSourceView(search:string):B245View {
 const q=new URLSearchParams(search);
 return q.get('t21W10B203')!=='fullRound'||
  q.get('t21QaInput')==='deterministic'||
  q.get('t21Presentation')==='qa'?'QA':'PLAYER';
}
/** Only genuinely opted-in SOURCE 180s PLAYER (B207/B384/B193)
 * may enter the existing A1 co-op new original world. No QA shortcut. */
export function b245SourceFullRoundA1Choice(params:Pick<URLSearchParams,'get'>):boolean{
 return params.get('t21Play')==='preview'&&
  params.get('t21QaDrive')==='source'&&
  params.get('t21W10B203')==='fullRound'&&
  params.get('t21QaInput')!=='deterministic';
}
/** Physical original-circuit goal is shown in normal PLAYER view only
 * for either the historical B343 real shooter or B384 selectable kit. */
export function b245ShouldShowSourceCircuitGoal(search:string):boolean{
 const q=new URLSearchParams(search);
 return q.get('t21QaDrive')==='source'&&
  q.get('t21W10B183')==='firstDropPlay'&&
  q.get('t21W10B192')==='humanCombat'&&
  ((q.get('t21W10B343')==='sourceVolleyAtomic'&&
    q.get('t21W10B384')===null)||
   b384SourceCircuitSelected(q));
}
/** Presentation-only radar policy; undefined B245 data keeps legacy behavior. */
export function b247ShouldCompactSourceRadar(
 pointerLocked:boolean,playerView:boolean,inspectingQa:boolean
):boolean {
 return !inspectingQa&&(pointerLocked||playerView);
}
/** Normal PLAYER may see its original A1/A2/A3 teammate feet, never the
 * unobserved enemy team's exact Rapier coordinates or navigation goals.
 * F8 QA retains complete diagnostic witnesses. No enemy discovery is
 * inferred from ownerGrid paint or a map projection. */
export function b245VisibleNativeSourceRadarCpu(
 actorId:string,playerView:boolean,inspectingQa:boolean
):boolean {
 return !playerView||inspectingQa||
  actorId==='A1'||actorId==='A2'||actorId==='A3';
}
/** B480: undo B338's global PLAYER "display:none!important" ONLY
 * for actual B441 SOURCE focused B476 player practice.
 * No QA/ordinary B207/B384/A1/production change; this is CSS only.
 * The B476 compact dataset is authored from genuine native B25 state.
 */
export function b480FocusedSourcePracticeCss(search:string):string{
 if(!b475RealFrontlineReadyMode(new URLSearchParams(search)))return '';
 return [
  '#ui-root[data-t21-b245-presentation="PLAYER"][data-t21-b338-phase="PLAYING"]',
  '#t21-f3-b25-paint-run[data-t21-b476-compact="true"]',
  '{display:block!important;}',
  // The existing F8 button at bottom-left otherwise covers the newly
  // exposed left-side practice bars. Keep F8 accessible away from them.
  '#ui-root[data-t21-b245-presentation="PLAYER"][data-t21-b338-phase="PLAYING"]',
  '#t21-f3-b245-view-toggle',
  '{left:auto!important;right:14px!important;bottom:200px!important;}'
 ].join(' ');
}
/** F3/F5 original-SOURCE PLAYER sightline, never an ART/source authority.
 * The existing F8 QA mode and native snapshot still expose complete data.
 * Only visual CSS, no event, clock, Actor, projectile, HP, ink or path writes.
 */
export function b245PlayerSightlineCss(search:string):string{
 const q=new URLSearchParams(search);
 if(q.get('t21Play')!=='preview'||q.get('t21QaDrive')!=='source'||
    q.get('t21W10B203')!=='fullRound'||
    q.get('t21QaInput')==='deterministic'||
    q.has('production')||q.has('scoreable'))return '';
 const on='#ui-root[data-t21-b245-presentation="PLAYER"]'+
  '[data-t21-b338-phase="PLAYING"] ';
 return [
  // Real timer, HP/ink bars, native CPU count, no-score warning and
  // critical native danger/splat remain visible throughout actual play.
  on+'#t21-f3-practice-hud',
  '{width:min(306px,calc(100vw - 24px))!important;'+
  'padding:7px 10px 6px!important;box-shadow:0 5px 18px #00162475!important;}',
  on+'#t21-f3-hud-clock','{font-size:20px!important;}',
  // B338 already gives the actual selected weapon controls during play.
  // Old extra keyboard line duplicates these and names unsupported R.
  on+'#t21-f3-player-key-help','{display:none!important;}',
  // Actual native 1600x900 screenshot: 1.45em MAX-HEIGHT clipped
  // B338's padded first line and concealed genuine weapon controls.
  // Let this SAME authoritative guide wrap inside its compact HUD.
  // No QA, physics, Actor, ownerGrid or score changes.
  on+'#t21-f3-b338-source-guide',
  '{max-height:none!important;overflow:visible!important;'+
  'white-space:normal!important;overflow-wrap:break-word!important;'+
  'font-size:9px!important;line-height:1.4!important;}',
  // The native ink gauge remains fully live; detailed B355 in F8 QA.
  on+'#t21-f3-b355-source-ink-readout','{display:none!important;}',
  // B464 still renders every real value/dataset. Keep an unobtrusive
  // one-line LIVE badge in PLAYER; F8 restores the complete four lines.
  on+'#t21-f3-b464-real-cpu-frontline',
  '{width:min(196px,calc(100vw - 24px))!important;'+
  'height:27px!important;max-height:27px!important;'+
  'padding:5px 9px!important;overflow:hidden!important;'+
  'white-space:nowrap!important;text-overflow:ellipsis!important;'+
  'font-size:9px!important;line-height:1.4!important;}',
  // Keep the genuine B25 progress visible and interactive in source play.
  on+'#t21-f3-b25-paint-run[data-t21-b476-compact="true"]',
  '{width:min(222px,calc(100vw - 24px))!important;'+
  'padding:7px 9px!important;}',
  // A3: real 1600x900 co-op image shows redundant "180s continues"
  // and "90s LEFT" around the native clock. ONLY after a genuine
  // original A1 CLEAR, collapse those two text lines in PLAYER.
  // Native B414 ink/OWN gauge, B415 practice outcome and B417 original
  // painted-cell grid remain live and visible; F8 QA stays complete.
  on+'#t21-f3-b195-native-coop[data-t21-b411-active="true"]'+
   '[data-t21-b195-real-source-clear="true"]',
  '{width:min(258px,calc(100vw - 24px))!important;'+
   'padding:6px 9px!important;}',
  on+'#t21-f3-b195-native-coop[data-t21-b411-active="true"]'+
   '[data-t21-b195-real-source-clear="true"] #t21-f3-b195-next,',
  on+'#t21-f3-b195-native-coop[data-t21-b411-active="true"]'+
   '[data-t21-b195-real-source-clear="true"] #t21-f3-b195-time',
  '{display:none!important;}',
  on+'#t21-f3-b195-native-coop[data-t21-b411-active="true"]'+
   '[data-t21-b195-real-source-clear="true"] #t21-f3-b414-native-ink',
  '{margin-top:4px!important;}',
  on+'#t21-f3-b195-native-coop[data-t21-b411-active="true"]'+
   '[data-t21-b195-real-source-clear="true"] #t21-f3-b417-paint-contest',
  '{margin-top:5px!important;}'
 ].join('');
}
export function installB245SourcePresentation(
 ui:HTMLElement,onViewChange:()=>void
):void {
 const q=new URLSearchParams(window.location.search);
 // B75 and other pinned deterministic native QA are unchanged.
 if(q.get('t21W10B203')!=='fullRound'||
    q.get('t21QaInput')==='deterministic')return;
 const style=document.createElement('style');
 style.id='t21-f3-b245-layer-style';
 style.textContent=[
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-play-panel,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-source-survey,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b58-source-session,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b183-real-first-drop,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b205-real-round,',
  // B338: play without a floating practice card; F8 QA or PAUSE restores it.
  '#ui-root[data-t21-b245-presentation="PLAYER"][data-t21-b338-phase="PLAYING"] #t21-f3-b25-paint-run',
  '{display:none!important;}',
  // B338: F8 hides player-only hints synchronously, not after 12 WebGL frames.
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b338-source-guide,',
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b286-source-team',
  '{display:none!important;}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b211-real-battle-roster,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b75-source-ink-live,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b76-human-ink-coach',
  '{display:none!important;}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-practice-hud',
  '{width:min(354px,calc(100vw - 28px));padding:12px 16px;',
  'background:linear-gradient(135deg,rgba(4,21,35,.90),rgba(12,44,58,.87));',
  'border-color:rgba(111,242,233,.63);}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b245-view-toggle',
  '{left:14px;}',
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b245-view-toggle',
  '{left:225px;}',
  '@media(max-width:620px){',
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b245-view-toggle',
  '{left:auto;right:14px;}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-practice-hud',
  '{top:8px;width:min(320px,calc(100vw - 24px));}',
  '}'
 ].join('');
 // B365: unlike the full QA panel, the REAL original-circuit objective
 // must be visible in normal PLAYER view. Source/CPU/gameplay untouched.
 if(b245ShouldShowSourceCircuitGoal(window.location.search)){
  style.textContent+=
   '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b183-real-first-drop'+
   '{display:block!important;max-width:min(300px,calc(100vw - 28px));'+
   'padding:7px 10px;font:750 10px/1.45 system-ui;'+
   'bottom:86px;right:14px;white-space:normal;}';
 }
 // B480: authored after B338's historical hide rule, more specific,
 // and only for a verified B475 B441 research URL.
 style.textContent+=b480FocusedSourcePracticeCss(window.location.search);
 // Last source-only style: PLAYER sightline while PLAYING, F8 QA unaltered.
 style.textContent+=b245PlayerSightlineCss(window.location.search);
 ui.appendChild(style);
 const button=document.createElement('button');
 button.id='t21-f3-b245-view-toggle';
 button.type='button';
 button.setAttribute('aria-label','Toggle source QA evidence view (F8)');
 button.style.cssText='position:fixed;bottom:14px;z-index:72;pointer-events:auto;'+
  'padding:9px 12px;border:1px solid #6cdad9;border-radius:10px;'+
  'background:rgba(4,25,39,.92);color:#dffcff;box-shadow:0 7px 26px #0019;'+
  'font:750 11px/1.2 system-ui;cursor:pointer';
 const apply=(view:B245View,manual:boolean)=>{
  ui.dataset.t21B245Presentation=view;
  ui.dataset.t21B245Inspect=String(manual&&view==='QA');
  button.textContent=view==='PLAYER'?'F8 · QA DETAILS':'F8 · PLAYER VIEW';
  button.setAttribute('aria-pressed',String(view==='QA'));
  button.dataset.nativePhysicsWrites='0';
  onViewChange();
 };
 const toggle=()=>apply(ui.dataset.t21B245Presentation==='QA'?'PLAYER':'QA',true);
 button.addEventListener('click',toggle);
 ui.appendChild(button);
 apply(b245InitialSourceView(window.location.search),false);
 window.addEventListener('keydown',ev=>{
  if(ev.code!=='F8'||ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey)return;
  ev.preventDefault();toggle();
 });
}

/** B388: stored B112 floor suspicion does not mean current player danger. */
export function b388VisibleNativeDescentWarning(f:{
 source12Kit:boolean;playerView:boolean;playing:boolean;paused:boolean;
 tick:number;kccGrounded:boolean|null;originalSupport:string|null;
 unsupportedTicks:number;recordedSuspicions:number;lastDetectionTick:number|null;
}):boolean {
 if(!f.source12Kit||!f.playerView)return f.recordedSuspicions>0;
 if(!f.playing||f.paused||f.kccGrounded!==false||
  f.originalSupport!==null||f.unsupportedTicks<8||
  f.recordedSuspicions<1||!Number.isSafeInteger(f.tick)||
  !Number.isSafeInteger(f.lastDetectionTick))return false;
 const age=f.tick-f.lastDetectionTick!;
 return age>=0&&age<=90;
}
/** Hides a false "floor unverified" warning only when the player's
 * real Rapier body is supported on registered original raised floor.
 * Never hides a true critical or near original edge. */
export function b388SuppressDuplicateRampWarning(f:{
 source12Kit:boolean;playerView:boolean;grounded:boolean;
 footId:string|null;circuitCleared:boolean;rampState:string;
}):boolean{
 return f.source12Kit&&f.playerView&&f.grounded&&
  f.footId==='UndertowT21D:right-low-team-a'&&f.circuitCleared&&
  f.rampState==='ADJACENT_TO_ORIGINAL_RAMP';
}

/** Narrow single-trajectory ORIGINAL SOURCE player guidance (positive Z only).
 * Real 7 CPU native HUMAN: supported landing Z47.68 -> S to Z49.325
 * -> D to right-low FloorConcrete03 X2.052/Z49.810. This is a cue,
 * not full-source navigation, a new floor, altered collision or a winner. */
export function b245RealSourceLocalRampGuide(f:{
 stage:readonly number[];tick:number;phase:string;paused:boolean;
 stopReason:string|null;humanAlive:boolean;humanMode:boolean;
 grounded:boolean;surveying:boolean;body:readonly [number,number,number];
 supportId:string|null;footGap:number|null;yawDegrees:number;
}){
 const off={state:'OFF',text:'',originalSourceOnly:true as const,
  fullStageTraversalCertified:false as const,geometryOrActorWrites:0 as const};
 if(f.stage.join(',')!=='25,17,26,0'||f.phase!=='PLAYING'||
    f.paused||!!f.stopReason||!f.humanAlive||!f.humanMode||
    !f.grounded||f.surveying||!Number.isSafeInteger(f.tick)||f.tick<0||
    !f.body.every(Number.isFinite)||!Number.isFinite(f.yawDegrees)||
    f.footGap===null||!Number.isFinite(f.footGap)||
    Math.abs(f.footGap)>.22)return off;
 const [x,,z]=f.body;
 const lower='UndertowT21D:first-drop-landing-positive-z';
 const ramp='UndertowT21D:right-low-route-ramp-positive-z';
 if(f.supportId===ramp&&x>=1.7&&x<=4&&z>=45&&z<=54)
  return {...off,state:'REGISTERED_RAMP_CONTACT',
   text:'ORIGINAL RAMP FOOT REGISTERED · local contact only · onward route NOT CERTIFIED'};
 if(f.supportId!==lower||x<-.5||x>1.8||z<47||z>50.2)return off;
 const yaw=((f.yawDegrees+180)%360+360)%360-180;
 if(Math.abs(yaw)>8)return {...off,state:'ALIGN_CAMERA',
  text:'SOURCE LANDING · camera not aligned: face centre (-Z) before tested S → D · avoid unsupported edge'};
 if(z<49.3&&x<=.6)return {...off,state:'BACKSTEP_S',
  text:'SOURCE LANDING · STOP W · S back toward Z≈49.3m · then D toward original ramp'};
 if(z>=49.3)return {...off,state:'STRAFE_D',
  text:'SOURCE LANDING · D toward registered FloorConcrete03 ramp · STOP if physical support is lost'};
 return off;
}
