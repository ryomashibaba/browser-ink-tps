import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {t21OriginalOpticalManifestsValid} from './t21-f3gl-restore.mjs';
const root=resolve(import.meta.dirname,'..');
const view=readFileSync(resolve(root,'PLAY_ORIGINAL_STAGE_WINDOWS.cmd'),'utf8');
const normal=readFileSync(resolve(root,'PLAY_SOURCE_WINDOWS.cmd'),'utf8');
const source=readFileSync(resolve(root,'scripts/t21-f3gl-restore.mjs'),'utf8');
const ignore=readFileSync(resolve(root,'.gitignore'),'utf8');
test('original stage is explicit, local, and separate from normal game',()=>{
 assert.match(view,/set "T21_LOCAL_ORIGINAL_REVIEW=1"/);
 assert.match(view,/call "%~dp0PLAY_SOURCE_WINDOWS\.cmd"/);
 assert.match(normal,/node scripts\/t21-f3gl-restore\.mjs/);
 assert.match(normal,/--port 4174 --strictPort --base=\/browser-ink-tps\/ --open="\/browser-ink-tps\/\?t21Play=preview&t21FullSource=review"/);
 assert.match(normal,/--port 4173 --strictPort --base=\/browser-ink-tps\/ --open=\/browser-ink-tps\/play-source\.html/);
 assert.doesNotMatch(view,/\bgit\s+(push|merge|reset|pull)\b/i);
 assert.match(ignore,/public\/t21-f3g-source\//);
 assert.match(ignore,/public\/\.t21-stage-\*\//);
});
test('restore preserves all original authority and fails closed',()=>{
 assert.match(source,/await mkdtemp\(join\(tmpdir\(\),'t21-original-optical-'\)\)/);
 assert.match(source,/await rename\(staging,DEST\)/);
 assert.match(source,/PINNED_TEMPLE01_SHA256/);
 assert.match(source,/T21_ORIGINAL_43MB_OBJ_SHA256_NOT_PINNED/);
 assert.match(source,/await rm\(temp,\{recursive:true,force:true\}\)/);
 assert.doesNotMatch(source,/\b(?:git push|git merge|docker)\b/i);
});
const sha='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const flat={schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1',
 sourceSHA256:sha,verifiedAgainstPinnedSource:true,
 includedOriginalTriangles:57578,stagePlayableAuthority:'NONE',
 stageCollisionSolidsAdded:0,stagePaintSurfacesAdded:0,
 navigationLinksAdded:0,scoreableSurfacesAdded:0,
 inferredFloorOrRouteAdded:0,productionAuthorization:false,groups:Array(7).fill({})};
const uv={schema:'T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1',
 sourceSHA256:sha,sourceRepositoryCommit:'0611f51b35c9736ee986fb2218461e2585b7875e',
 verifiedAgainstPinnedSource:true,totalTriangles:57578,
 materials:Array(54).fill({}),textureFiles:Array(19).fill('x'),
 textures:Array(19).fill({}),stagePlayableAuthority:'NONE',
 physicsSolidsAdded:0,navigationLinksAdded:0,scoreableSurfacesAdded:0,
 actorMatricesRecovered:false,productionAuthorization:false};
const env={schema:'T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1',
 sourceSHA256:sha,actorPlacementRecovered:false,
 stageCollisionSolidsAdded:0,stagePlayableAuthority:'NONE'};
const gallery={schema:'T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1',
 sourceSHA256:sha,stagePlayableAuthority:'NONE',
 actorPlacementRecovered:false,stageCollisionSolidsAdded:0,
 productionAuthorization:false};
test('optical manifest gate rejects collider/nav/actor/scoring promotion',()=>{
 assert.equal(t21OriginalOpticalManifestsValid(flat,uv,env,gallery),true);
 for(const values of [
  [{...flat,stageCollisionSolidsAdded:1},uv,env,gallery],
  [flat,{...uv,scoreableSurfacesAdded:1},env,gallery],
  [flat,{...uv,navigationLinksAdded:1},env,gallery],
  [flat,{...uv,actorMatricesRecovered:true},env,gallery],
  [flat,{...uv,productionAuthorization:true},env,gallery],
  [flat,uv,{...env,actorPlacementRecovered:true},gallery],
  [flat,uv,env,{...gallery,productionAuthorization:true}],
  [flat,{...uv,sourceRepositoryCommit:'untrusted'},env,gallery]
 ])assert.equal(t21OriginalOpticalManifestsValid(...values),false);
});
