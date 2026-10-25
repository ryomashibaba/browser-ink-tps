import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const driver=readFileSync(new URL('./t21-f3-browser-smoke.mjs',import.meta.url),'utf8');
const wf=readFileSync(new URL('../.github/workflows/t21-w10b59-full-native-session.yml',import.meta.url),'utf8');
test('B210 real source combat user click, never invented opposing actors',()=>{
 assert.ok(driver.includes("T21_B210_SAFE_COMBAT_180S==='1'"));
 assert.ok(driver.includes("'#t21-f3-b207-combat-round'"));
 assert.ok(driver.includes("selected.combat!=='REAL_SOURCE_ONLY'"));
 assert.ok(driver.includes("selected.url.includes('t21W10B192=humanCombat')"));
 assert.ok(wf.includes("T21_B210_SAFE_COMBAT_180S: '1'"));
 assert.ok(wf.includes("T21_B176_REAL_NATIVE_HUMAN_DROP: '0'"));
 assert.ok(wf.includes("T21_B174_EXPLICIT_SOURCE_SWEEP_180S: '0'"));
});
test('B210 native TIME_UP accepts only human actual source KCC + 7 CPU',()=>{
 assert.ok(driver.includes("terminal.b112OriginalHumanGround"));
 assert.ok(driver.includes("foot?.genuineKccGrounded!==true"));
 assert.ok(driver.includes("terminal.cpu.physicalRejoins.length!==7"));
 assert.ok(driver.includes("activeHumanPairs.length!==7"));
 assert.ok(driver.includes("terminal.shotsFired<1||terminal.cpuSourceTurfShots<1"));
 assert.ok(driver.includes("B61_FALSE_END_BEFORE_180_NATIVE_SECONDS"));
 assert.ok(driver.includes("B210_TRUE_COMBAT_180S_NATIVE_SUPPORT_OR_ACTIVITY_HOLD"));
 assert.ok(driver.includes("unverifiedLowerRampRetainedHOLD:true"));
});
test('B176 real unsafe ramp attempt stays a separate strict test, not auto-PASS',()=>{
 assert.ok(driver.includes("[['KeyW',200],['KeyD',12],['KeyW',18],['KeyA',12]]"));
 assert.ok(driver.includes("if(b176RealDrop&&!b176DescentPassed)"));
 assert.ok(wf.includes("scripts/t21-w10b176-real-lower-route-source.test.mjs"));
});
