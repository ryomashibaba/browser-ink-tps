/** B273: real CDP keyboard --> native Rapier KCC source-support transfer.
 * Never programmatically move actor, grant paint, change camera, or add colliders.
 * Positive evidence ONLY if genuine grounded support changes in source QA.
 */
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export const B273_SOURCE='25/17/26/0';
export const B273_MAX_KEY_LEGS=8;
export const B273_TRUE_KEY_TICKS=24;
const upper='UndertowT21D:spawn-high-positive-z';
const near=([x,y,z],[a,b,c])=>Math.hypot(x-a,y-b,z-c);
export function b273InspectNativeKccSample(x){
 const p=x?.player?.position;
 if(x?.paused!==false||x?.stopReason||
  !['PLAYING','STAGING'].includes(x?.matchState)||
  x?.originalSourceSolids!==25||x?.originalPaintSurfaces!==17||
  x?.originalSourceNavigationLinks!==26||x?.sourceScoreablePromotions!==0||
  !Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)||
  !Number.isSafeInteger(x.tick)||x.tick<1)
  throw Error('B273_GENUINE_ORIGINAL_KCC_STATE_MISSING');
 const ledger=x.b112OriginalHumanGround;
 if(!ledger||ledger.enabled!==true)
  throw Error('B273_REAL_SOURCE_GROUND_TELEMETRY_NOT_ENABLED');
 const support=ledger.genuineKccGrounded===true&&
  typeof ledger.lastOriginalSourceHitId==='string'&&
  ledger.lastOriginalSourceHitId.startsWith('UndertowT21D:')&&
  Number.isFinite(ledger.lastOriginalSourceGapMeters)&&
  Math.abs(ledger.lastOriginalSourceGapMeters)<=.22
  ?ledger.lastOriginalSourceHitId:null;
 const arrived=support!==null&&support!==upper&&
  p[1]>=2.9&&p[1]<=7.8;
 return {tick:x.tick,worldMeters:[...p],supportId:support,
  kccGrounded:ledger.genuineKccGrounded===true,
  realSourceGapMeters:ledger.lastOriginalSourceGapMeters??null,
  originalLowerSupportReached:arrived,
  sourceNotChanged:true};
}
export function b273AuditContinuousKeyboardLegs(samples){
 if(!Array.isArray(samples)||samples.length<2||
  samples.length>B273_MAX_KEY_LEGS+1)
  throw Error('B273_NO_BOUNDED_TRUE_NATIVE_KEYBOARD_TRACE');
 const stage=samples.map(b273InspectNativeKccSample),legs=[];
 for(let i=1;i<stage.length;i++){
  const a=stage[i-1],b=stage[i],delta=b.tick-a.tick;
  if(delta<1||delta>60)throw Error('B273_INVALID_TRUE_NATIVE_TICK_STEP');
  const length=near(a.worldMeters,b.worldMeters);
  if(!Number.isFinite(length)||length>6.5)
   throw Error('B273_UNTRUSTED_PHYSICAL_MOVEMENT_JUMP');
  legs.push({fromTick:a.tick,toTick:b.tick,
   startOriginalSupportId:a.supportId,endOriginalSupportId:b.supportId,
   displacementMeters:+length.toFixed(4),
   actualEndWorldMeters:b.worldMeters,
   trueGroundedAtEnd:b.kccGrounded,
   actuallyLowerOriginalSupport:b.originalLowerSupportReached});
 }
 const first=stage[0],last=stage.at(-1);
 return {initialOriginalGroundSupport:first.supportId,
  supportedOriginalGroundTransitions:legs.filter(x=>
   x.startOriginalSupportId!==x.endOriginalSupportId&&
   x.endOriginalSupportId!==null),
  actualVerifiedLowerSupportReached:stage.some(x=>x.originalLowerSupportReached),
  actualNativeTickSpan:last.tick-first.tick,
  actualFullMotionMeters:legs.reduce((n,x)=>n+x.displacementMeters,0),
  worldDisplacementMeters:near(first.worldMeters,last.worldMeters),
  routeIsContinuousUnderTrueKeyboard:true,
  noActorTeleportOrSyntheticInk:true,
  lowerOriginalRouteCertifiedOnlyOnActualGround:true,
  syntheticOriginalNavLinksAdded:0,
  original4v4Certified:false,artAccepted:false,
  productionAuthorized:false,legs};
}
export async function captureB273NativeKccDrop({evaluate,cmd,waitUntil,screenshot,output}){
 const first=await evaluate('window.__t21F3.snapshot()');
 const initial=b273InspectNativeKccSample(first);
 if(initial.supportId!==upper||initial.worldMeters[1]<8.1||
    initial.worldMeters[1]>9.6)
  throw Error('B273_REAL_NATIVE_START_NOT_GROUNDED_UPPER_SOURCE');
 const samples=[first],key={key:'w',code:'KeyW',
  windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
 const before=await screenshot('B273_REAL_KCC_A_UPPER_PRE_INPUT');
 let stopReason='EIGHT_BOUND_TRUE_KEY_STAGES_COMPLETED';
 for(let i=0;i<B273_MAX_KEY_LEGS;i++){
  const from=samples.at(-1);
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
  let next;
  try{
   next=await waitUntil(async()=>{
    const s=await evaluate('window.__t21F3.snapshot()');
    if(s?.stopReason)
     return s; // Real game state captured and reported, not synthesized.
    return s.tick>=from.tick+B273_TRUE_KEY_TICKS?s:false;
   },45000);
  }finally{
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
  }
  if(next.stopReason){stopReason='TRUE_GAME_STOP_'+next.stopReason;
   samples.push(next);break;}
  b273InspectNativeKccSample(next);
  samples.push(next);
  const step=b273AuditContinuousKeyboardLegs(samples);
  if(step.actualVerifiedLowerSupportReached){
   stopReason='REAL_KCC_LOWER_SOURCE_SUPPORT_OBSERVED';break;}
  if(step.legs.at(-1)?.displacementMeters<.07){
   stopReason='NATIVE_COLLISION_OR_MOVEMENT_STALL';break;}
 }
 const trace=b273AuditContinuousKeyboardLegs(samples);
 const after=await screenshot('B273_REAL_KCC_B_AFTER_KEYBOARD');
 if(trace.actualNativeTickSpan<1||
    trace.actualFullMotionMeters<.1)
  throw Error('B273_REAL_NATIVE_NO_KCC_MOTION');
 const report={schema:'B273_NATIVE_REAL_KEYBOARD_RAPIER_SUPPORT_TRANSFER',
  source:B273_SOURCE,sourceOriginalUvTriangles:57578,
  originalSolids:25,originalPaintSurfaces:17,
  originalNavLinks:26,scoreablePromotions:0,
  actualKeyboard:'CDP_Native_KeyW',
  actualBrowserBasedSimulation:true,
  allEightActorsUntouched:true,
  trueKeyPressStages:trace.legs.length,
  termination:stopReason,preImage:before,postImage:after,
  ...trace,
  noFakeSurfaceReachability:!trace.actualVerifiedLowerSupportReached,
  nativePaintOwnershipWasNotInjected:true,
  originalVisualMeshNotAltered:true,
  unconstrained4v4Certified:false,
  artAccepted:false,productionAuthorized:false};
 writeFileSync(resolve(output,'b273-native-real-source-kcc-transition.json'),
  JSON.stringify(report,null,2));
 console.log('B273_TRUE_NATIVE_KCC_TRANSITION_OBSERVED',JSON.stringify({
  stages:trace.legs.length,
  totalActualMeters:trace.actualFullMotionMeters,
  distinctSourceSupportIds:[...new Set(trace.legs.map(x=>x.endOriginalSupportId))],
  actualLowerSupportReached:trace.actualVerifiedLowerSupportReached,
  termination:stopReason,productionAuthorized:false}));
 return report;
}
