/** B277: observe trusted browser keys and real source KCC direction controls.
 * All observations read native browser/PlayCanvas state. No actor teleport,
 * JS event dispatch, synthetic axis, source collider or game-tick alteration.
 */
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {b273InspectNativeKccSample,b273AuditContinuousKeyboardLegs} from './t21-b273-real-native-kcc-transition.mjs';
const witnessCode="(() => {if(window.__t21B277KeyEvidence)return true;const events=[];for(const type of ['keydown','keyup'])window.addEventListener(type,event=>{if(!['KeyW','KeyS'].includes(event.code))return;if(events.length>=16)return;events.push({type:event.type,code:event.code,realTrustedEvent:event.isTrusted===true,canvasLocked:document.pointerLockElement===document.querySelector('#app-canvas'),focused:document.hasFocus(),hidden:document.hidden,nativeWallTime:performance.now()});});window.__t21B277KeyEvidence={events};return true;})()";
const witnessRead="(() => {const e=window.__t21B277KeyEvidence;return e?{events:e.events.slice(),canvasLocked:document.pointerLockElement===document.querySelector('#app-canvas'),focused:document.hasFocus(),hidden:document.hidden}:null;})()";
export async function b277InstallKeyEventObserver(evaluate){
 if(await evaluate(witnessCode)!==true)throw Error('B277_READONLY_KEY_OBSERVER_UNAVAILABLE');
}
export async function b277ReadKeyEventObserver(evaluate){
 const witness=await evaluate(witnessRead);
 if(!witness||!Array.isArray(witness.events))throw Error('B277_KEY_OBSERVER_MISSING');
 return witness;
}
export function b277ClassifyNativeInputEvidence({forwardMeters,reverseMeters,returnMeters,events}){
 if(!Array.isArray(events)||![forwardMeters,reverseMeters].every(Number.isFinite))
  throw Error('B277_INVALID_NATIVE_DIAGNOSTIC');
 const saw=(code,type)=>events.some(e=>e.code===code&&e.type===type&&
  e.realTrustedEvent===true&&e.canvasLocked===true&&e.focused===true&&
  e.hidden===false);
 const originalForwardKeyObserved=saw('KeyW','keydown');
 const originalReverseKeyObserved=saw('KeyS','keydown');
 let classification='UNRESOLVED_NATIVE_INPUT_OR_CONTACT';
 if(!originalForwardKeyObserved)classification='REAL_FORWARD_KEY_EVENT_NOT_OBSERVED';
 else if(!originalReverseKeyObserved)classification='REAL_REVERSE_KEY_EVENT_NOT_OBSERVED';
 else if(reverseMeters>=.1&&Number.isFinite(returnMeters)&&returnMeters>=.1)
  classification='NATIVE_BACKWARD_AND_REENTRY_MOTION_CONFIRMED_INITIAL_FORWARD_BLOCK_UNRESOLVED';
 else if(reverseMeters>=.1)
  classification='NATIVE_BACKWARD_MOTION_CONFIRMED_FORWARD_DIRECTION_BLOCK_CANDIDATE';
 else classification='TRUSTED_W_AND_S_EVENTS_BUT_NO_PHYSICAL_MOTION';
 return {
  classification,
  originalForwardKeyObserved,originalReverseKeyObserved,
  reversePhysicalMotionVerified:reverseMeters>=.1,
  returnPhysicalMotionVerified:Number.isFinite(returnMeters)&&returnMeters>=.1,
  noSourceConnectivityCertified:true,noInjectedKeyboardEvent:true,
  noArtificialActorMovement:true,official4v4Certified:false,
  artAccepted:false,productionAuthorized:false
 };
}
async function realKeyLeg(code,{evaluate,cmd,waitUntil}){
 const start=await evaluate('window.__t21F3.snapshot()');
 b273InspectNativeKccSample(start);
 const c={key:code==='KeyW'?'w':'s',code,
  windowsVirtualKeyCode:code==='KeyW'?87:83,
  nativeVirtualKeyCode:code==='KeyW'?87:83};
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...c});
 let end;
 try{
  end=await waitUntil(async()=>{
   const x=await evaluate('window.__t21F3.snapshot()');
   return x?.stopReason||x?.tick>=start.tick+24?x:false;
  },60000);
 }finally{await cmd('Input.dispatchKeyEvent',{type:'keyUp',...c});}
 if(end?.stopReason)throw Error('B277_TRUE_NATIVE_GAME_STOP_'+end.stopReason);
 const trace=b273AuditContinuousKeyboardLegs([start,end]);
 return {code,realNativeTicks:trace.actualNativeTickSpan,
  realPhysicalMeters:trace.actualFullMotionMeters,
  before:trace.legs[0].startOriginalSupportId,
  after:trace.legs[0].endOriginalSupportId,
  lastWorldMeters:trace.legs[0].actualEndWorldMeters,
  noSyntheticTicks:true};
}
export async function b277CaptureReverseControl({evaluate,cmd,waitUntil,output}){
 const unlocked=await b277ReadKeyEventObserver(evaluate);
 if(unlocked.canvasLocked!==true||unlocked.focused!==true||unlocked.hidden!==false)
  throw Error('B277_REAL_NATIVE_INPUT_NOT_FOCUSED');
 const keyS=await realKeyLeg('KeyS',{evaluate,cmd,waitUntil});
 const keyW=keyS.realPhysicalMeters>=.1?
  await realKeyLeg('KeyW',{evaluate,cmd,waitUntil}):null;
 const events=await b277ReadKeyEventObserver(evaluate);
 const summary=b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:keyS.realPhysicalMeters,
  returnMeters:keyW?.realPhysicalMeters??null,events:events.events});
 const report={schema:'B277_REAL_CHROMIUM_KEYBOARD_DIRECTION_TRIAGE',
  evidence:events.events,reverseControl:keyS,returnControl:keyW,
  ...summary,source:'25/17/26/0',
  nonProductionQa:true,originalLowerRouteCertified:false};
 writeFileSync(resolve(output,'b277-real-native-keyboard-direction-triage.json'),
  JSON.stringify(report,null,2));
 return report;
}