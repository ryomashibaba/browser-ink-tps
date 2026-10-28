import test from 'node:test';
import assert from 'node:assert/strict';
import {
 B284_GAME_ROWS,B284_SNAPSHOTS,auditB284GameSceneRows,verifyB284PinnedUpstream
} from './t21-b284-stage-identity-provenance.mjs';
function good(){
 return {
  snapshots:B284_SNAPSHOTS.map(version=>({version,rows:B284_GAME_ROWS.map(t=>({
   __RowId:t.id,Label:t.label,SequenceName:'Versus',PreloadResources:[t.resource]
  }))})),
  loader:'"Undertow Spillway": "Vss_Nagasaki03",\n"Camp Triggerfish": "Vss_Temple01"'
 };
}
test('three independent pinned game-data rows defeat third-party convenience naming',()=>{
 const v=good(),r=auditB284GameSceneRows(v.snapshots,v.loader);
 assert.equal(r.identityVerdict,'TEMPLE01_CONFIRMED_REMODELED_UNDERTOW');
 assert.equal(r.sceneEvidence.length,3);
 assert.equal(r.floorLine00OriginalGameCollisionRoleAuthenticated,false);
 assert.equal(r.authenticatedUnderpassRoute,false);
 assert.deepEqual(r.registeredStageAuthority,[25,17,26,0]);
 assert.equal(r.productionAuthorized,false);
 assert.equal(r.unrestricted4v4Certified,false);
});
test('any swapped stage, missing version or unrecognized model fails closed',()=>{
 const v=good();v.snapshots[0].rows[0].Label='チョウザメ造船';
 assert.throws(()=>auditB284GameSceneRows(v.snapshots,v.loader),/IDENTITY_MISMATCH/);
 const u=good();u.snapshots[1].rows[0].PreloadResources=['Model/Fld_Nagasaki03.bfres'];
 assert.throws(()=>auditB284GameSceneRows(u.snapshots,u.loader),/IDENTITY_MISMATCH/);
 const m=good();m.snapshots.pop();
 assert.throws(()=>auditB284GameSceneRows(m.snapshots,m.loader),/THREE_PINNED/);
});
test('KiTrix is read as a conflicting convenience mapping, never game authority',()=>{
 const v=good();v.loader='"Undertow Spillway": "Vss_Temple01"';
 assert.throws(()=>auditB284GameSceneRows(v.snapshots,v.loader),/KITRIX_CONTRADICTION_DRIFT/);
});
test('remote fetcher resolves all four SHA-pinned sources, never a moving branch',async()=>{
 const v=good(),urls=[];
 const response=await verifyB284PinnedUpstream(async url=>{
  urls.push(url);
  const part=url.match(/\/data\/mush\/(720|920|1130)\/SceneInfo.json$/);
  if(part)return JSON.stringify(v.snapshots.find(x=>x.version===part[1]).rows);
  return v.loader;
 });
 assert.equal(response.sceneEvidence.length,3);
 assert.equal(urls.length,4);
 for(const u of urls)assert.match(u,/\/[a-f0-9]{40}\//);
});
