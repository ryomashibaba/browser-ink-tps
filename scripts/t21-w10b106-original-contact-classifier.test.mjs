import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyB106,B106_CLASS as K}
 from './t21-w10b106-original-contact-classifier.mjs';

const complete=(overrides={})=>({
 originalAuthority:true,teleportPerformed:false,original4v4Certified:false,
 stopReason:null,qualified:true,a3HumanProximateRapierRejections:8,
 originalA3DetourLink:'first-drop-positive-z-2',
 sourceFloorEscapeFoot:[-2.17243,7.6,64.52370],
 physicalRejoins:['B4','A1','B1','B3','A3','B2','A2'],
 realA3Rejoined:true,realA2Rejoined:true,freeCombatEnabled:true,
 matchState:'PLAYING',tick:1309,humanFoot:[-.06472,8.39456,63.7065],
 ended:true,...overrides
});
test('B104 real Chrome: original A3 KCC 8 rejects + -2 link + 7/7 is genuine detour recovery',()=>{
 const n=classifyB106(complete());
 assert.equal(n.classification,K.CONTACT_DETOUR);
 assert.equal(n.nativeContactRejections,8);
 assert.equal(n.originalNavLink,'first-drop-positive-z-2');
 assert.equal(n.certified,true);
 assert.equal(n.unrestricted4v4Certified,false);
});
test('B105 real Chrome: 2 KCC rejects + no NavLink + 7/7 is safe direct recovery, NOT detour',()=>{
 const n=classifyB106(complete({
  a3HumanProximateRapierRejections:2,originalA3DetourLink:null,
  sourceFloorEscapeFoot:null,tick:1040,
  humanFoot:[-.04563,8.39479,64.03960]
 }));
 assert.equal(n.classification,K.TRANSIENT_DIRECT);
 assert.equal(n.certified,true);
 assert.equal(n.originalNavLink,null);
});
test('Genuinely no Rapier block followed by direct 7/7 remains no-contact class',()=>{
 assert.equal(classifyB106(complete({
  a3HumanProximateRapierRejections:0,
  originalA3DetourLink:null,sourceFloorEscapeFoot:null
 })).classification,K.NO_CONTACT_DIRECT);
});
test('KCC blocks but not all native CPUs returned: unresolved at true end only',()=>{
 const x=complete({
  physicalRejoins:['B4','A1','B1','B3','A3'],
  realA2Rejoined:false,freeCombatEnabled:false,matchState:'STAGING',
  ended:true,tick:2400
 });
 assert.equal(classifyB106(x).classification,K.UNRESOLVED);
 assert.equal(classifyB106({...x,ended:false}).classification,K.INCOMPLETE);
});
test('Human missed right lane: cannot infer a blocked source path even with raw counts',()=>{
 const x=classifyB106(complete({qualified:false}));
 assert.equal(x.classification,K.CALIBRATION_MISS);
 assert.equal(x.certified,false);
});
test('No Rapier contact cannot be promoted to claimed physical human-obstruction detour',()=>{
 assert.equal(classifyB106(complete({
  a3HumanProximateRapierRejections:0
 })).classification,K.INVALID);
});
test('Invented/unknown original link and missing physical floor escape fail closed',()=>{
 assert.equal(classifyB106(complete({
  originalA3DetourLink:'fabricated-navlink-99'
 })).classification,K.INVALID);
 assert.equal(classifyB106(complete({
  sourceFloorEscapeFoot:[-2.1,7.6,NaN]
 })).classification,K.INVALID);
});
test('Six genuine rejoined CPUs are not 7/7 regardless of contact and link',()=>{
 const x=classifyB106(complete({
  physicalRejoins:['B4','A1','B1','B3','A3','B2'],
  ended:true
 }));
 assert.equal(x.classification,K.UNRESOLVED);
 assert.equal(x.certified,false);
});
test('Duplicate actor, teleport, activation/frozen source drift fail closed',()=>{
 assert.equal(classifyB106(complete({
  physicalRejoins:['B4','A1','A1','B3','A3','B2','A2']
 })).classification,K.INVALID);
 assert.equal(classifyB106(complete({teleportPerformed:true})).classification,K.INVALID);
 assert.equal(classifyB106(complete({originalAuthority:false})).classification,K.INVALID);
 assert.equal(classifyB106(complete({original4v4Certified:true})).classification,K.INVALID);
});
