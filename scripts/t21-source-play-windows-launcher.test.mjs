import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const batch=readFileSync(resolve(root,'PLAY_SOURCE_WINDOWS.cmd'),'utf8');
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
 assert.match(batch,/npm\.cmd install --no-audit --no-fund --no-package-lock/);
 assert.match(batch,/if errorlevel 1 goto :FAIL/g);
});
