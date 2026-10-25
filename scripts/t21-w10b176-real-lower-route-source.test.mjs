import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const driver=()=>readFileSync(new URL('./t21-f3-browser-smoke.mjs',import.meta.url),'utf8');
const wf=()=>readFileSync(new URL('../.github/workflows/t21-w10b59-full-native-session.yml',import.meta.url),'utf8');
test('B176: source-local human descent uses only existing real KCC key inputs',()=>{
 const s=driver();
 assert.ok(s.includes("T21_B176_REAL_NATIVE_HUMAN_DROP==='1'"));
 assert.ok(s.includes("'B176_SOURCE_ONLY_REAL_180S_WITH_SEVEN_CPU_REQUIRED'"));
 assert.ok(s.includes("[['KeyW',200],['KeyD',12],['KeyW',18],['KeyA',12]]"));
 assert.ok(s.includes("type:'keyDown',...keys[code]"));
 assert.ok(s.includes("type:'keyUp',...keys[code]"));
 assert.ok(s.includes("actualKccHorizontalMeters"));
});
test('B176: lower original Rapier support, real CPU count and score HOLD required',()=>{
 const s=driver();
 assert.ok(s.includes("foot?.genuineKccGrounded!==true"));
 assert.ok(s.includes("foot.lastOriginalSourceHitId.startsWith('UndertowT21D:')"));
 assert.ok(s.includes("end.cpu.physicalRejoins.length!==7"));
 assert.ok(s.includes("end.sourceScoreablePromotions!==0"));
 assert.ok(s.includes("B176_REAL_NATIVE_LOWER_SOURCE_NOT_COMPLETED_BEFORE_180S"));
 assert.ok(s.includes("w10b176-real-original-human-first-drop.json"));
 // An explicitly named B210 180s lane must not repeat the B206 unsafe
 // ramp route. Preserve the B176 scripted route and strict native check
 // for its separately authorized source-route CI configuration.
 const B176enabled=wf().includes("T21_B176_REAL_NATIVE_HUMAN_DROP: '1'");
 const B210safe=wf().includes("T21_B210_SAFE_COMBAT_180S: '1'")&&
  wf().includes("T21_B176_REAL_NATIVE_HUMAN_DROP: '0'");
 assert.ok(B176enabled||B210safe);
});
