import {test} from 'node:test';
import assert from 'node:assert/strict';
import {b80ClassifyNativeStall as classify}
 from './t21-w10b80-native-stall-classifier.mjs';
const base={tick:60,renderFrames:80,stop:null,paused:false,
 matchState:'STAGING',visibilityState:'visible'};
test('B80 never passes a 90s native source tick stall',()=>{
 assert.equal(classify(base,{...base},89000),
  'INVESTIGATING_NO_NATIVE_TICK');
 assert.equal(classify(base,{...base},92000),
  'PLAYCANVAS_RENDER_CALLBACKS_NOT_ADVANCING');
 assert.equal(classify(base,{...base,renderFrames:480},92000),
  'FIXED_STEP_CLOCK_NOT_ADVANCING_WHILE_RENDERING');
});
test('B80 identifies actual pause and external page visibility',()=>{
 assert.equal(classify(base,{...base,paused:true},92000),
  'APPLICATION_PAUSED');
 assert.equal(classify(base,{...base,visibilityState:'hidden'},92000),
  'BROWSER_VISIBILITY_THROTTLED');
 assert.equal(classify(base,{...base,stop:'REAL_NATIVE_ERROR'},92000),
  'SOURCE_FAIL_CLOSED_STOP');
});
test('B80 authentic physics advance always defeats a false stall report',()=>{
 assert.equal(classify(base,{...base,tick:61},92000),
  'PHYSICS_RUNNING');
 assert.equal(classify(base,{...base,tick:59},92000),
  'UNEXPECTED_CLOCK_OR_FRAME_REGRESSION');
 assert.equal(classify(base,{...base,renderFrames:78},92000),
  'UNEXPECTED_CLOCK_OR_FRAME_REGRESSION');
 assert.equal(classify(base,{...base,renderFrames:NaN},92000),
  'HOLD_INVALID_NATIVE_WITNESS');
});
