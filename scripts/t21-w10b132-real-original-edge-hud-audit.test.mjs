import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB132RealBrowserEdgeWitness as audit}
 from './t21-w10b132-real-original-edge-hud-audit.mjs';
const R='UndertowT21D:right-low-team-a';
const L='UndertowT21D:first-drop-landing-positive-z';
const sample=(source=R,tick=326)=>({
 stage:'REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP',actualNativeTick:tick,
 matchState:'PLAYING',sourceAuthority:[25,17,26,0],
 originalUnrestricted4v4:false,production:false,stop:null,
 actualKccGrounded:true,actualOriginalRapierSolid:source,
 snapshotWarning:{severity:'EDGE_RISK',showCaution:true,distance:.34,
 source,nativeTick:tick,playerPhysicsModified:false,
 originalGeometryModified:false},
 dom:{visible:true,severity:'EDGE_RISK',nativeTick:tick,
 distance:.34,text:'ORIGINAL FLOOR EDGE · CLOSE · WATCH YOUR STEP',
 officialScoreable:'0',original4v4:'false',floorHole:'false'}
});
test('accept actual native original floor warning only when DOM and source align',()=>{
 const v=audit([sample(L,212),sample(R,326)]);
 assert.equal(v.passed,true);
 assert.deepEqual(v.visibleOriginalSupportIds,[L,R]);
 assert.equal(v.officialTurfScoringAuthorized,false);
});
test('nonphysical, stale, invisible or mismatched browser warning never passes',()=>{
 const baseline=sample();
 for(const change of [
  {actualKccGrounded:false},
  {actualOriginalRapierSolid:'fake-floor'},
  {sourceAuthority:[25,17,26,1]},
  {matchState:'TIME_UP'},
  {production:true},
  {dom:{...baseline.dom,visible:false}},
  {dom:{...baseline.dom,nativeTick:305}},
  {dom:{...baseline.dom,officialScoreable:'1'}},
  {snapshotWarning:{...baseline.snapshotWarning,source:'fake-floor'}},
  {snapshotWarning:{...baseline.snapshotWarning,playerPhysicsModified:true}},
 ]){
  const r=audit([sample(L,200),{...baseline,...change}]);
  // Good earlier L is allowed; corrupt R must not enter any proof array.
  assert.equal(r.visibleOriginalSupportIds.includes(R),false);
  assert.equal(r.matches.some(m=>m.actualGroundedOriginalSupport===R),false);
  if(r.passed)assert.deepEqual(r.visibleOriginalSupportIds,[L]);
 }
});
test('no warning and corrupt source authority stop fail closed',()=>{
 const a=sample();
 assert.equal(audit([a,{...a,actualNativeTick:327,
  snapshotWarning:{...a.snapshotWarning,showCaution:false},
  dom:{...a.dom,visible:false}}]).passed,true);
 const first={...a,snapshotWarning:null,dom:{...a.dom,visible:false}};
 assert.equal(audit([first,{...first,actualNativeTick:327}]).passed,false);
 assert.equal(audit([a,{...a,actualNativeTick:325}]).passed,false);
});

test('bad original authority never borrows a prior good Chrome sample',()=>{
 const good=sample(L,200);
 for(const change of [
  {sourceAuthority:[25,17,26,1]},
  {originalUnrestricted4v4:true},
  {production:true},
  {stop:'NATIVE_STOP'}
 ]){
  const r=audit([good,{...sample(R,300),...change}]);
  assert.equal(r.passed,false);
  assert.equal(r.visibleOriginalSupportIds.includes(R),false);
  assert.deepEqual(r.visibleOriginalSupportIds,[L]);
  assert.match(r.reason,/SOURCE_AUTHORITY_OR_STOP/);
 }
});
