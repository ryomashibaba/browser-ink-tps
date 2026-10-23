import test from 'node:test';
import assert from 'node:assert/strict';
import {latestQaReport,makeLiveState} from './t21-continuity-state.mjs';
const sha='a'.repeat(40);
test('numeric report order',()=>{
 assert.equal(latestQaReport(['W10-B9-old.md','W10-B126-new.md','W10-B99-mid.md']).number,126);
});
test('source report verdict remains explicitly unverified',()=>{
 const x=makeLiveState({head:sha,names:['W10-B126-test.md'],load:()=>[
  '**W10-B126 verdict: A PASS**','Next W10-B127',
  'https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39934149377'].join('\n')});
 assert.match(x,/B126/);assert.match(x,/B127/);
 assert.match(x,/39934149377/);
 assert.match(x,/正式4対4: HOLD/);
 assert.match(x,/CI・JSONと要照合/);
});
test('missing report never invents proof',()=>{
 const x=makeLiveState({head:sha,names:[],load:()=>{throw Error('unexpected')}});
 assert.match(x,/不明/);
 assert.match(x,/Actions: 確認できない/);
});
test('invalid SHA is rejected',()=>{
 assert.throws(()=>makeLiveState({head:'bad',names:[],load:()=>''}),/INVALID_QA_HEAD_SHA/);
});
