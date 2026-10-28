import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {b273InspectNativeKccSample,b273AuditContinuousKeyboardLegs,b274EnsureNativeKeyboardInput,b279InspectAfterSourceScreenshot}
 from './t21-b273-real-native-kcc-transition.mjs';
function state(tick,z,y=8.4,hit='UndertowT21D:spawn-high-positive-z'){
 return {paused:false,matchState:'STAGING',stopReason:null,
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  player:{position:[.13,y,z]},tick,b112OriginalHumanGround:{
   enabled:true,genuineKccGrounded:true,
   lastOriginalSourceHitId:hit,lastOriginalSourceGapMeters:0.02}};
}
test('actual two keyboard legs on source high do not certify a new support',()=>{
 const r=b273AuditContinuousKeyboardLegs([
  state(201,68),state(225,66.3),state(249,64.6)]);
 assert.equal(r.actualVerifiedLowerSupportReached,false);
 assert.equal(r.legs.length,2);
 assert.equal(r.original4v4Certified,false);
 assert.equal(r.sourceNotChanged,undefined);
});
test('only native lower grounded original support can certify transition',()=>{
 const x=[state(201,68),state(225,66.2),
 state(249,63.5,5.2,'UndertowT21D:right-low-team-a')];
 const r=b273AuditContinuousKeyboardLegs(x);
 assert.equal(r.actualVerifiedLowerSupportReached,true);
 assert.equal(r.supportedOriginalGroundTransitions.length,1);
 assert.equal(r.productionAuthorized,false);
 const fall=state(249,63.5,5.2,'UndertowT21D:right-low-team-a');
 fall.b112OriginalHumanGround.genuineKccGrounded=false;
 assert.equal(b273AuditContinuousKeyboardLegs([x[0],x[1],fall])
   .actualVerifiedLowerSupportReached,false);
});
test('reject unsupported source and an implausible actor teleport',()=>{
 const a=state(201,68);a.originalSourceSolids=26;
 assert.throws(()=>b273InspectNativeKccSample(a),/ORIGINAL_KCC_STATE_MISSING/);
 assert.throws(()=>b273AuditContinuousKeyboardLegs([
  state(201,68),state(225,15)]),/UNTRUSTED_PHYSICAL_MOVEMENT_JUMP/);
});
test('no fake ground ledger may promote a nav endpoint into support',()=>{
 const a=state(201,68);
 a.b112OriginalHumanGround.enabled=false;
 assert.throws(()=>b273InspectNativeKccSample(a),/GROUND_TELEMETRY_NOT_ENABLED/);
 const s=state(201,68);
 s.b112OriginalHumanGround.lastOriginalSourceHitId='Invented:low';
 assert.equal(b273InspectNativeKccSample(s).supportId,null);
});

test('B274 restores source keyboard gate with ONLY real CDP pointer input',async()=>{
 let locked=false;const sent=[];
 const evaluate=async()=>({hasCanvas:true,hasFocus:true,hidden:false,locked});
 const cmd=async(method,params)=>{
  sent.push({method,type:params.type});
  if(params.type==='mouseReleased')locked=true;
 };
 const waitUntil=async(check)=>{const value=await check();assert.ok(value);return value;};
 const r=await b274EnsureNativeKeyboardInput({evaluate,cmd,waitUntil});
 assert.deepEqual(r,{beforeLocked:false,afterLocked:true,
  relockedByRealCdpMouse:true,focusedByRealCdpTabActivation:false});
 assert.deepEqual(sent.map(x=>x.type),['mousePressed','mouseReleased']);
 assert.ok(sent.every(x=>x.method==='Input.dispatchMouseEvent'));
});
test('B274 already-locked real input does not fire extra mouse press',async()=>{
 let calls=0;
 const r=await b274EnsureNativeKeyboardInput({
  evaluate:async()=>({hasCanvas:true,hasFocus:true,hidden:false,locked:true}),
  cmd:async()=>{calls++;},waitUntil:async()=>{calls++;}});
 assert.equal(calls,0);
 assert.equal(r.relockedByRealCdpMouse,false);
});
test('B276 brings an initially unfocused native browser tab to front BEFORE CDP mouse',async()=>{
 let focused=false,locked=false;const sent=[];
 const state=()=>({hasCanvas:true,hasFocus:focused,hidden:false,locked});
 const cmd=async(method,params={})=>{
  sent.push(method+(params.type?':'+params.type:''));
  if(method==='Page.bringToFront')focused=true;
  if(method==='Input.dispatchMouseEvent'&&params.type==='mouseReleased')locked=true;
 };
 const waitUntil=async(check)=>{const found=await check();assert.ok(found);return found;};
 const result=await b274EnsureNativeKeyboardInput({
  evaluate:async()=>state(),cmd,waitUntil});
 assert.deepEqual(sent,[
  'Page.bringToFront',
  'Input.dispatchMouseEvent:mousePressed',
  'Input.dispatchMouseEvent:mouseReleased'
 ]);
 assert.deepEqual(result,{
  beforeLocked:false,afterLocked:true,
  relockedByRealCdpMouse:true,focusedByRealCdpTabActivation:true
 });
});
test('B276 will not simulate keys if the real Chrome tab cannot acquire focus',async()=>{
 const sent=[];
 await assert.rejects(
  b274EnsureNativeKeyboardInput({
   evaluate:async()=>({hasCanvas:true,hasFocus:false,hidden:false,locked:false}),
   cmd:async(method)=>{sent.push(method);},
   waitUntil:async()=>{throw Error('B276_REAL_TAB_FOCUS_TIMEOUT');}
  }),/B276_REAL_TAB_FOCUS_TIMEOUT/);
 assert.deepEqual(sent,['Page.bringToFront']);
});
test('B274 rejects hidden browser without attempting a native key or mouse',async()=>{
 await assert.rejects(b274EnsureNativeKeyboardInput({
  evaluate:async()=>({hasCanvas:true,hasFocus:false,hidden:true,locked:false}),
  cmd:async()=>{throw Error('should not run CDP actions');},
  waitUntil:async()=>{throw Error('should not poll');}
 }),/B274_NATIVE_BROWSER_FOCUS_OR_CANVAS_UNAVAILABLE/);
});

test('B279 excludes 30 native ticks spent capturing original GPU screenshot before KeyW',()=>{
 const before=state(43,67.8927,8.39507);
 const after=state(73,67.8927,8.39507);
 const valid=b279InspectAfterSourceScreenshot(before,after);
 assert.equal(valid.preScreenshotTick,43);
 assert.equal(valid.postScreenshotNativeTick,73);
 assert.equal(valid.unpressedScreenshotTickSpan,30);
 assert.equal(valid.originalSourceSupport,'UndertowT21D:spawn-high-positive-z');
 assert.equal(valid.screenshotTicksNotCountedAsKeyboard,true);
 assert.equal(valid.noArtificialClockChanges,true);
});
test('B279 refuses pre-input actor jump or invalid original support during image capture',()=>{
 assert.throws(()=>b279InspectAfterSourceScreenshot(
  state(43,68),state(42,68)),/NATIVE_PRE_KEY_SOURCE_BASELINE_DRIFT/);
 assert.throws(()=>b279InspectAfterSourceScreenshot(
  state(43,68),state(73,69)),/NATIVE_PRE_KEY_SOURCE_BASELINE_DRIFT/);
 assert.throws(()=>b279InspectAfterSourceScreenshot(
  state(43,68),state(73,68,5.5,'UndertowT21D:right-low-team-a')),
 /NATIVE_PRE_KEY_SOURCE_BASELINE_DRIFT/);
});
