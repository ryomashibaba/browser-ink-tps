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
 assert.match(normal,/--port 4174 --strictPort --base=\/browser-ink-tps\/ --open="\/browser-ink-tps\/\?t21Play=preview&t21FullSource=review&t21F3Registration=project"/);
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

import {b490ValidateSamePoseFrames,b490LocalComparisonHtml,B490_CAPTURE_AUTHORITY}
 from './t21-f3l-same-pose-gate.mjs';
function b490Sample(on){
 return {tick:1304,paused:true,stopReason:null,matchState:'PLAYING',
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  player:{position:[2.45555,3.93841,50.63159],mode:'HUMAN'},
  cpu:{physicalRejoins:Array(7).fill({}),
   cpu:Array.from({length:7},(_,i)=>({id:'CPU_'+i,
    physicalFoot:[i*2,3,49.7-i]}))},
  nativeKccGrounded:true,
  b112OriginalHumanGround:{lastNativeTick:1304,genuineKccGrounded:true,
   lastOriginalSourceHitId:'UndertowT21D:right-low-route-ramp-positive-z',
   lastOriginalSourceGapMeters:.04239},
  originalSourceStudyVisible:false,sourceOpticalStructuresVisible:false,
  fullSource:{enabled:false},environmentF3i:{visible:false},
  texturedSourceF3l:{status:'READY',enabled:on,totalOriginalTriangles:57578,
   verifiedTextures:19},
  b29VerifiedSourcePresentation:{selected:on?'F3L_ORIGINAL_UV':'F3E_REFERENCE'},
  b399NativeCameraClearance:{cameraOpticalWitness:{
   realCameraEye:[1,5,54],realCameraForward:[.2,-.1,-.97]}}
 };
}
test('B490 verified UV and physical-only frame have identical actual body and camera',()=>{
 const result=b490ValidateSamePoseFrames(b490Sample(true),b490Sample(false));
 assert.equal(result.status,'PASS_SAME_POSE_CAPTURE_READY');
 assert.equal(result.visualAlignmentCertified,false);
 assert.equal(result.unchangedNativeWorld,true);
 assert.equal(B490_CAPTURE_AUTHORITY.geometryWrites,0);
 assert.equal(B490_CAPTURE_AUTHORITY.localOnly,true);
});
test('B490 refuses mistaken visual/geometry success from a moving or unverified world',()=>{
 const uv=b490Sample(true),plain=b490Sample(false);
 for(const [a,b] of [
  [{...uv,tick:1305},plain],
  [uv,{...plain,player:{...plain.player,position:[2.5,3.93,50.63]}}],
  [uv,{...plain,environmentF3i:{visible:true}}],
  [uv,{...plain,sourceScoreablePromotions:1}],
  [uv,{...plain,originalSourceSolids:26}],
  [uv,{...plain,b112OriginalHumanGround:{...plain.b112OriginalHumanGround,
   genuineKccGrounded:false}}],
  [uv,{...plain,b112OriginalHumanGround:{...plain.b112OriginalHumanGround,
   lastOriginalSourceHitId:'UndertowT21D:first-drop-landing-positive-z'}}],
  [uv,{...plain,b112OriginalHumanGround:{...plain.b112OriginalHumanGround,
   lastOriginalSourceGapMeters:.22}}],
  [{...uv,texturedSourceF3l:{...uv.texturedSourceF3l,status:'MISSING'}},plain],
  [uv,{...plain,b29VerifiedSourcePresentation:{selected:'F3L_ORIGINAL_UV'}}],
  [uv,{...plain,b399NativeCameraClearance:{cameraOpticalWitness:{
   realCameraEye:[1.1,5,54],realCameraForward:[.2,-.1,-.97]}}}],
  [{...uv,cpu:{physicalRejoins:Array(6).fill({})}},plain],
  [uv,{...plain,paused:false}],
  [uv,{...plain,nativeKccGrounded:false}],
  [uv,{...plain,b112OriginalHumanGround:{...plain.b112OriginalHumanGround,
   lastNativeTick:1299}}],
  [uv,{...plain,cpu:{...plain.cpu,cpu:plain.cpu.cpu.map((a,i)=>
    i===0?{...a,physicalFoot:[.11,3,49.7]}:a)}}],
  [uv,{...plain,stopReason:'REAL_UNSUPPORTED_FOOT'}]
 ])assert.equal(b490ValidateSamePoseFrames(a,b).status,'HOLD');
});
test('B490 only captures local pictures after real P1 success and never uploads files',()=>{
 const r=readFileSync(resolve(root,'scripts/t21-b440-short-native-original-foot.mjs'),'utf8');
 assert.match(r,/GITHUB_ACTIONS==='true'/);
 assert.match(r,/B490_LOCAL_ONLY_ONE_REAL_RAMP_REQUIRED/);
 assert.match(r,/if\(b490LocalCompare\)await b490CaptureLocalSamePosePair\(\)/);
 assert.match(r,/screenshotsUploaded:false/);
 assert.match(r,/spawn\(process.execPath,/);
 assert.match(r,/B490_NODE_GLOBAL_WEBSOCKET_REQUIRED/);
 assert.match(r,/B490_OWNED_PREVIEW_OR_CDP_PORT_ALREADY_IN_USE/);
 assert.match(r,/mkdtempSync\(join\(tmpdir\(\),'t21-b490-chromium-'\)\)/);
 assert.match(r,/rmSync\(b490OwnedChromeProfile/);
});

test('B490 same-pose report is offline, readable and never certifies stage alignment',()=>{
 const valid=b490ValidateSamePoseFrames(b490Sample(true),b490Sample(false));
 const html=b490LocalComparisonHtml(valid);
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/b490-original-uv-same-pose\.png/);
 assert.match(html,/b490-registered-floor-same-pose\.png/);
 assert.match(html,/native tick: 1304/);
 assert.match(html,/addEventListener\('input'/);
 assert.doesNotMatch(html,/<(?:script|link)[^>]+src="https?:/i);
 assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/);
 assert.throws(()=>b490LocalComparisonHtml({status:'HOLD',nativeTick:1304}));
});
