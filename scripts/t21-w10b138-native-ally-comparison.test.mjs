import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync('scripts/t21-w10b138-native-ally-comparison.mjs','utf8');
const workflow=readFileSync('.github/workflows/t21-w10b138-native-ally-comparison.yml','utf8');
test('B138 isolated FIXED and opt-in rally real Chromium 180s',()=>{
 assert.match(code,/\['FIXED_DEFAULT','ALLY_RALLY'\]/);
 assert.match(code,/t21W10B137=allyRally/);
 assert.match(code,/finishRound\('FIXED'\)/);
 assert.match(code,/n\.matchState==='TIME_UP'/);
 assert.match(code,/Input\.dispatchKeyEvent/);
 assert.match(code,/n\.cpu\.physicalRejoins\.length!==7/);
 assert.match(code,/n\.cpu\.physicalFootRelocations!==0/);
 assert.match(code,/realA1RapierFoot/);
 assert.match(code,/realHumanKccBody/);
 assert.match(workflow,/variant: \[FIXED_DEFAULT, ALLY_RALLY\]/);
});
test('B138 never authorizes synthetic movement, source promotion or publication',()=>{
 assert.doesNotMatch(code,/qaDriveTicks\(/);
 assert.doesNotMatch(code,/\.teleport\(/);
 assert.doesNotMatch(code,/\.setTranslation\(/);
 assert.doesNotMatch(code,/this\.matchState='PLAYING'/);
 assert.match(code,/n\.sourceScoreablePromotions!==0/);
 assert.match(code,/n\.productionAuthorized!==false/);
 assert.match(code,/n\.unrestricted4v4Certified!==false/);
 assert.match(code,/noSyntheticPhysicsTick:true/);
});
