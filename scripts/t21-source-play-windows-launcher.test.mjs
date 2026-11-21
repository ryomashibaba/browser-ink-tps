import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const batch=readFileSync(resolve(root,'PLAY_SOURCE_WINDOWS.cmd'),'utf8');
const visualPlay=readFileSync(resolve(root,'PLAY_SOURCE_WITH_ORIGINAL_VISUALS_WINDOWS.cmd'),'utf8');
const portal=readFileSync(resolve(root,'play-source.html'),'utf8');
const vite=readFileSync(resolve(root,'vite.config.ts'),'utf8');
const packageFile=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));

test('the one-click Windows launcher uses only the genuine SOURCE portal',()=>{
 assert.match(batch,/pushd "%~dp0"/);
 assert.match(batch,/if not exist "play-source.html" goto :FAIL/);
 assert.match(batch,/if not exist "src\\source-play-main.ts" goto :FAIL/);
 assert.match(batch,/call npm\.cmd run build -- --base=\/browser-ink-tps\//);
 assert.match(batch,/git rev-parse --verify HEAD/);
 assert.match(batch,/git diff --quiet HEAD -- \./);
 assert.match(batch,/set "VITE_T21_LOCAL_SOURCE_HEAD=UNKNOWN"/);
 assert.match(batch,/set "VITE_T21_LOCAL_TRACKED_DIRTY=UNKNOWN"/);
 assert.match(batch,/LOCAL SOURCE CHECKOUT HEAD/);
 assert.match(batch,/if not exist "dist\\play-source.html" goto :FAIL/);
 assert.match(batch,/call npm\.cmd run preview -- --host 127\.0\.0\.1 --port 4173 --strictPort --base=\/browser-ink-tps\/ --open=\/browser-ink-tps\/play-source\.html/);
 assert.match(portal,/id="play-circuit"/);
 assert.match(portal,/id="play-coop"/);
 assert.match(portal,/id="play-combat"/);
 assert.match(vite,/play-source\.html/);
 assert.equal(packageFile.private,true);
});

test('no unintended LAN/production/GitHub/actor permissions in launcher',()=>{
 assert.doesNotMatch(batch,/--host\s+(?:0\.0\.0\.0|::)(?:\s|$)/);
 assert.doesNotMatch(batch,/\bgit\s+(?:push|merge|reset|checkout|rebase|pull|fetch)\b/i);
 assert.doesNotMatch(batch,/\b(?:gh|docker|ssh|scp|curl|wget)\s+/i);
 assert.doesNotMatch(batch,/\b(?:setx|powershell|reg\.exe|schtasks)\b/i);
 assert.match(batch,/--strictPort/);
 assert.match(batch,/if not exist "node_modules\\\.bin\\vite\.cmd"/);
 assert.match(batch,/call npm\.cmd ls --depth=0 --offline >nul 2>nul/);
 assert.match(batch,/if errorlevel 1 goto :INSTALL_SOURCE_DEPS/);
 assert.match(batch,/:INSTALL_SOURCE_DEPS/);
 assert.match(batch,/call npm\.cmd install --no-audit --no-fund --no-package-lock/);
 assert.match(batch,/:DEPS_READY/);
 assert.match(batch,/if errorlevel 1 goto :FAIL/g);
});


test('one-click verified original UV is the SAME genuine four-mode SOURCE game, not static showroom',()=>{
 assert.match(visualPlay,/set "T21_LOCAL_ORIGINAL_PLAY=1"/);
 assert.match(visualPlay,/set "T21_LOCAL_ORIGINAL_REVIEW=0"/);
 assert.match(visualPlay,/call "%~dp0PLAY_SOURCE_WINDOWS\.cmd"/);
 assert.match(batch,/if \/I "%T21_LOCAL_ORIGINAL_PLAY%"=="1" \(/);
 assert.match(batch,/if \/I "%T21_LOCAL_ORIGINAL_REVIEW%"=="1" goto :FAIL/);
 const restoration=batch.match(/node scripts\/t21-f3gl-restore\.mjs/g)??[];
 assert.equal(restoration.length,2);
 assert.match(batch,/call npm\.cmd run preview -- --host 127\.0\.0\.1 --port 4173 --strictPort --base=\/browser-ink-tps\/ --open=\/browser-ink-tps\/play-source\.html/);
 // Browser code already upgrades an ordinary live game to original F3L
 // only AFTER hash-authorized original visual manifests and mesh loading.
 const app=readFileSync(resolve(root,
  'src/app/UndertowF3PlayablePreviewApp.ts'),'utf8');
 assert.match(app,/void this\.loadAvailableNativeOriginalOptics\(\)/);
 assert.match(app,/await loadF3lTexturedSource\(this\.app\)/);
 assert.match(app,/setNativeVerifiedOpticalScene\(true\)/);
 const local=readFileSync(resolve(root,'scripts/t21-f3gl-restore.mjs'),'utf8');
 assert.match(local,/PINNED_TEMPLE01_SHA256/);
 assert.match(local,/verifyLocalPack\(staging\)/);
 assert.match(local,/stagePlayableAuthority:'NONE'/);
 assert.doesNotMatch(visualPlay,/\bgit\s+(?:push|merge|reset|checkout|rebase|pull|fetch)\b/i);
 assert.doesNotMatch(visualPlay,/--host\s+0\.0\.0\.0/);
});

test('F4 one-click restores pinned local source UV and displays grounded optical parity',()=>{
 const f4=readFileSync(resolve(root,'PLAY_F4_ORIGINAL_RETURN_WINDOWS.cmd'),'utf8');
 assert.match(f4,/node scripts\\t21-f3gl-restore\.mjs/);
 assert.match(f4,/if errorlevel 1 goto :UV_HOLD/);
 assert.match(f4,/:UV_PREPARED/);
 assert.match(f4,/Registered stage remains playable/);
 assert.doesNotMatch(f4,/:BAD_VISUAL_SOURCE/);
 assert.match(f4,/f3l-original-textured\.json/);
 assert.match(f4,/--host 127\.0\.0\.1 --port 4176 --strictPort/);
 assert.match(f4,/t21F4Terrain=original/);
 assert.doesNotMatch(f4,/\bgit\s+(?:push|merge|reset|checkout|rebase|pull|fetch)\b/i);
 assert.doesNotMatch(f4,/--host\s+0\.0\.0\.0/);
 const app=readFileSync(resolve(root,'src/app/UndertowF3PlayablePreviewApp.ts'),'utf8');
 assert.match(app,/f4Status\('READY'/);
 assert.match(app,/f4Status\('ERROR'/);
 assert.match(app,/f4SevenPointSupportedSourceTriangles:/);
 assert.match(app,/f4NativeHumanTraversabilityCertified:false/);
 assert.match(app,/f4ExactPhysicalSourceTriangles:/);
 assert.match(app,/await loadF3lTexturedSource\(this\.app\)/);
});

test('F4 owner can save a real native UV/Rapier witness without exporting private assets',()=>{
 const app=readFileSync(resolve(root,'src/app/UndertowF3PlayablePreviewApp.ts'),'utf8');
 assert.match(app,/t21-f4-save-local-uv-witness/);
 assert.match(app,/saveF4LocalUvWitness\(\)/);
 assert.match(app,/T21_F4_LOCAL_NATIVE_UV_FLOOR_WITNESS_V1/);
 assert.match(app,/this\.physics\.castCharacterFootSupport\(/);
 assert.match(app,/actualNativeTick:this\.clock\.tick/);
 assert.match(app,/sourceFilesIncluded:false,automaticUpload:false/);
 assert.match(app,/visualAlignmentApproved:false,nativeTraversalCertified:false/);
 assert.match(app,/document\.pointerLockElement===this\.canvas/);
 assert.match(app,/link\.download='T21_F4_REAL_UV_FLOOR_TICK_'/);
});
