import {test} from 'node:test';
import assert from 'node:assert/strict';
import {b306AuditSampleScope} from './t21-b306-real-ink-sample-scope.mjs';
const real={originalStageAuthority:'25/17/26/0',nativeTick:94,
 actualHumanShots:10,actualHumanPaintCells:380,paintSampleCount:2,
 sampledProjectedCells:[
  {screenPx:[745,449,13],insideViewport:true,inFront:true,team:'A',surfaceId:'source-floor'},
  {screenPx:[842,522,10],insideViewport:true,inFront:true,team:'A',surfaceId:'source-floor'}]};
const start=[0,8,72],paused={tick:94,player:{position:[0.6,8,71]}};
test('B306 measure only the genuine owner-SAMPLE envelope not filled paint coverage',()=>{
 const out=b306AuditSampleScope(real,start,paused);
 assert.equal(out.shortLocalStudyNotFullSceneReview,true);
 assert.equal(out.sampleEnvelopeNotFilledPaintCoverage,true);
 assert.equal(out.trulySampledOwnerCells,2);
 assert.equal(out.distinctSampledPaintSurfaces.length,1);
 assert.ok(out.derivedOnlyCameraProjection[1].projectedSampleEnvelopeScreenFraction<
   out.derivedOnlyCameraProjection[0].projectedSampleEnvelopeScreenFraction);
 assert.ok(out.derivedOnlyCameraProjection[2].projectedSampleEnvelopeScreenFraction>
   out.derivedOnlyCameraProjection[0].projectedSampleEnvelopeScreenFraction);
});
test('B306 rejects absent/corrupted original ownership or fake projection',()=>{
 assert.throws(()=>b306AuditSampleScope({...real,nativeTick:95},start,paused));
 assert.throws(()=>b306AuditSampleScope({...real,actualHumanShots:0},start,paused));
 assert.throws(()=>b306AuditSampleScope({...real,sampledProjectedCells:[]},start,paused));
 assert.throws(()=>b306AuditSampleScope({...real,
  sampledProjectedCells:[{...real.sampledProjectedCells[0],inFront:false},real.sampledProjectedCells[1]]},start,paused));
});
