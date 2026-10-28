import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {b277ClassifyNativeInputEvidence,
 b277InstallKeyEventObserver,b277ReadKeyEventObserver}
 from './t21-b277-real-keyboard-diagnostic.mjs';
const event=(code,type='keydown',realTrustedEvent=true)=>({
 code,type,realTrustedEvent,canvasLocked:true,focused:true,hidden:false
});
test('B277 real trusted W and S with reverse and return KCC only diagnose direction',()=>{
 const r=b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:1.2,returnMeters:.9,
  events:[event('KeyW'),event('KeyS')]});
 assert.equal(r.classification,
  'NATIVE_BACKWARD_AND_REENTRY_MOTION_CONFIRMED_INITIAL_FORWARD_BLOCK_UNRESOLVED');
 assert.equal(r.reversePhysicalMotionVerified,true);
 assert.equal(r.returnPhysicalMotionVerified,true);
 assert.equal(r.noSourceConnectivityCertified,true);
 assert.equal(r.official4v4Certified,false);
});
test('B277 cannot promote a key event observed without pointer lock or trust',()=>{
 const r=b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:0,returnMeters:null,
  events:[{...event('KeyW'),realTrustedEvent:false},event('KeyS')]});
 assert.equal(r.originalForwardKeyObserved,false);
 assert.equal(r.classification,'REAL_FORWARD_KEY_EVENT_NOT_OBSERVED');
});
test('B277 trusted real keys without motion remain unresolved KCC or physical obstruction',()=>{
 const r=b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:0,returnMeters:null,
  events:[event('KeyW'),event('KeyS')]});
 assert.equal(r.classification,'TRUSTED_W_AND_S_EVENTS_BUT_NO_PHYSICAL_MOTION');
 assert.equal(r.productionAuthorized,false);
 assert.equal(r.noArtificialActorMovement,true);
});
test('B277 KeyS motion while KeyW does not move is physical directional evidence only',()=>{
 const r=b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:.7,returnMeters:0,
  events:[event('KeyW'),event('KeyS')]});
 assert.equal(r.classification,
  'NATIVE_BACKWARD_MOTION_CONFIRMED_FORWARD_DIRECTION_BLOCK_CANDIDATE');
 assert.equal(r.noSourceConnectivityCertified,true);
});
test('B277 validates non-finite motion and missing event witness',()=>{
 assert.throws(()=>b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:Number.NaN,events:[]}),/INVALID_NATIVE_DIAGNOSTIC/);
 assert.throws(()=>b277ClassifyNativeInputEvidence({
  forwardMeters:0,reverseMeters:0,events:null}),/INVALID_NATIVE_DIAGNOSTIC/);
});
test('B277 instrument only reads events, no synthetic key injection or game setter',async()=>{
 const expressions=[];
 const evaluate=async expression=>{
  expressions.push(expression);
  return expressions.length===1?true:{
   events:[event('KeyW')],canvasLocked:true,focused:true,hidden:false};
 };
 await b277InstallKeyEventObserver(evaluate);
 const x=await b277ReadKeyEventObserver(evaluate);
 assert.equal(x.events.length,1);
 assert.ok(expressions[0].includes("addEventListener"));
 assert.ok(expressions[0].includes("event.isTrusted"));
 assert.ok(!expressions[0].includes("dispatchEvent("));
 assert.ok(!expressions[0].includes("setQaAxis"));
});