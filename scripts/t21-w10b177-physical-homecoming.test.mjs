import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {b177OriginalKccHomeDecision as decide}
 from './t21-w10b177-physical-homecoming.mjs';
const input=()=>({sourceUpperHome:[0,8.395,65.4],
 realKccBody:[0.01,8.4,68.05],realOriginalGrounded:true,
 trueNativeTicks:34});
test('B177 true W34 is NOT enough if measured original KCC is still away',()=>{
 assert.equal(decide(input()).status,'CONTINUE');
 assert.equal(decide({...input(),trueNativeTicks:30}).status,'CONTINUE');
});
test('B177 native key release requires physically grounded actual start position',()=>{
 const r=decide({...input(),realKccBody:[0.01,8.40,65.85],
  trueNativeTicks:60});
 assert.equal(r.status,'ARRIVED');
 assert.ok(r.actualRealKccResidualMeters<=.75);
});
test('B177 never accepts unsupported, excessive, missing or bogus body/ticks',()=>{
 for(const x of [
  {realOriginalGrounded:false},{realKccBody:[0,5.7,70]},
  {realKccBody:[2,8.4,66]},{realKccBody:[0,8.4,64.0]},
  {trueNativeTicks:106},{realKccBody:[NaN,8.4,65.4]},
  {trueNativeTicks:-1}
 ])assert.equal(decide({...input(),...x}).status,'UNSAFE');
});
test('B177 180s browser driver uses real KCC KeyW release not actor reposition',()=>{
 const code=readFileSync(new URL('./t21-f3-browser-smoke.mjs',import.meta.url),'utf8');
 assert.ok(code.includes('const b177TrueUpperHome=played.player.position.slice()'));
 assert.ok(code.includes('b177OriginalKccHomeDecision('));
 assert.ok(code.includes("realHumanB172Leg('KeyW',true)"));
 assert.ok(code.includes("type:'keyUp',...params"));
});
