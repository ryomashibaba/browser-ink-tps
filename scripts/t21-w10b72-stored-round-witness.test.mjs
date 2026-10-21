import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditB72OwnerStoredRound} from './t21-w10b72-stored-round-witness.mjs';
const sample=()=>({
 search:'?t21Play=preview&t21W10B68=previewSweep',
 stage:'STAGING',sourceOriginalSolids:25,originalPaintable:17,
 originalLinks:26,scoreable:0,noScore:true,optInSweep:true,
 productionAuthorized:false,b70OwnerOptIn:'REQUIRED',
 b70DataUpload:'NONE',b70Stage:'NOT_FINISHED',
 b70NextUiMode:'SWEEP',persistedSourceRawLength:570,
 stored:{
  sessionSchema:'T21_B70_SESSION_STORAGE_ONLY_V1',
  recordSchema:'T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1',
  mode:'FIXED',real180Seconds:180,tick:11856,
  sourceInk:3615,cpuSourceShots:112,originalActorCount:7,
  noScore:true,noOriginal4v4:true,productionAuthorized:false,
  winner:'NONE',originalCoordFields:false
 },otherNotSaved:true
});
test('B72 validates exact real B70 previous 180s format and honest stage HOLD',()=>{
 const result=auditB72OwnerStoredRound(sample());
 assert.equal(result.verdict,
  'B72_GENUINE_NORMAL_PREVIEW_USER_CLICK_AND_STORED_ROUND_PASS');
 assert.equal(result.realSourceCpuInkCellsChanged,3615);
 assert.equal(result.defaultCpuChanged,false);
 assert.equal(result.original4v4Certified,false);
});
test('B72 catches real prior false failure: outer session schema is not inner round schema',()=>{
 const v=sample();
 v.stored.recordSchema=v.stored.sessionSchema;
 assert.throws(()=>auditB72OwnerStoredRound(v),
  /INVALID_NESTED_REAL_NATIVE_COMPLETED_ROUND/);
});
test('B72 rejects fake player clocks, promoted scores, arbitrary route or leaked source',()=>{
 const values=[
  v=>v.stored.tick=8000,
  v=>v.scoreable=1,
  v=>v.stored.noOriginal4v4=false,
  v=>v.stored.originalCoordFields=true,
  v=>v.otherNotSaved=false,
  v=>v.stored.originalActorCount=8,
  v=>v.persistedSourceRawLength=60000,
  v=>v.b70DataUpload='YES',
  v=>v.search='?t21QaDrive=source',
  v=>v.stored.productionAuthorized=true,
  v=>v.productionAuthorized=true,
  v=>v.stored.winner='WIN',
 ];
 for(const mutate of values){
  const v=sample();mutate(v);
  assert.throws(()=>auditB72OwnerStoredRound(v),/B72_/);
 }
});
