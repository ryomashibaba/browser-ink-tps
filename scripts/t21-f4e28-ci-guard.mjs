#!/usr/bin/env node
/**
 * F4E28 public-repository CI guard: baseline build + screenshot proof ONLY.
 * Does NOT validate F4E27 local patches, original-Banc actor placement,
 * 57,578 static source pack, walkable geometry, or Visual Freeze.
 * No raw original OBJ, Face IDs, videos, BYML or frozen assets are uploaded.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {execFileSync} from 'node:child_process';

const captureDir=process.env.T21_F3_SHOT_DIR||'/tmp/t21-f4e28-ci-safe-baseline';
const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
function assert(ok,why){if(!ok)throw Error('F4E28_CI_GUARD_'+why);}
function verifyHtml(html){
  assert(!html.includes('/@vite/client'),'DEVELOPMENT_CLIENT');
  assert(!html.includes('/node_modules/.vite/'),'VITE_OPTIMIZE_DEP');
  assert(/\/browser-ink-tps\/assets\/[^"']+\.js/.test(html),'MISSING_VERSIONED_JS');
  assert(/\/browser-ink-tps\/assets\/[^"']+\.css/.test(html),'MISSING_VERSIONED_CSS');
  return {immutableAssets:true,base:'/browser-ink-tps/'};
}
function verifyEvidence(report,readPNG){
  assert(report?.status==='PASS_REAL_CHROME','NOT_PASS_REAL_CHROME');
  assert(report.renderer==='webgl2','NOT_WEBGL2');
  assert(report.originalSourceSolids===25,'FROZEN_SOLIDS_CHANGED');
  assert(report.scoreablePromotions===0,'SCOREABLE_PROMOTION');
  assert(report.productionAuthorized===false,'PRODUCTION_AUTHORIZED');
  assert(report.unrestricted4v4Certified===false,'UNPROVEN_4V4_CLAIM');
  assert(Array.isArray(report.frames)&&report.frames.length>=2,'MISSING_COMPARISON_FRAMES');
  const hashes=new Set();
  for(const frame of report.frames){
    assert(/^[A-Za-z0-9_-]+$/.test(frame.name),'UNSAFE_FRAME_NAME');
    const png=readPNG(frame.name);
    assert(png.length>=10000,'TRUNCATED_PNG');
    assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'NOT_PNG');
    assert(png.readUInt32BE(16)===1600&&png.readUInt32BE(20)===900,'WRONG_DIMENSIONS');
    const sha=digest(png);
    assert(sha===frame.sha256,'FRAME_HASH_MISMATCH');
    hashes.add(sha);
  }
  assert(hashes.size>=2,'IDENTICAL_FRAMES');
  return {status:'PASS_BASELINE_BROWSER_ONLY',renderer:'webgl2',frameCount:report.frames.length,distinctFrames:hashes.size,sourceSolids:25,sourcePack57578Verified:false,actorBancPlacementVerified:false,visualFreezeApproved:false,productionAuthorized:false};
}
const mode=process.argv[2];
try{
  if(mode==='privacy'){
    // Path-scoped. This does NOT constitute copyright clearance for source-code
    // diffs, but catches accidental staging of explicit locally-only evidence.
    const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
    const forbidden=paths.filter(p=>/(^|\/)(EVIDENCE\/ORIGINALS|qa\/f4e8\/source_pack|qa\/f4e18\/references|qa\/f4e7\/portable_truth)\//i.test(p) || /\.(?:mp4|obj|face-ids\.bin)$/i.test(p));
    assert(forbidden.length===0,'PRIVATE_EVIDENCE_TRACKED:'+forbidden.length);
    console.log('F4E29_PUBLIC_SOURCE_ONLY_PATH_GUARD_PASS',paths.length);
  }else if(mode==='self-test'){
    const html='<script src="/browser-ink-tps/assets/test.js"></script><link href="/browser-ink-tps/assets/test.css">';
    verifyHtml(html);
    for(const unsafe of [html+' /@vite/client',html+' /node_modules/.vite/deps/']){
      let threw=false;try{verifyHtml(unsafe);}catch{threw=true;}assert(threw,'NEGATIVE_HTML_NOT_REJECTED');
    }
    const png=n=>{const b=Buffer.alloc(10050,n);Buffer.from([137,80,78,71,13,10,26,10]).copy(b,0);b.writeUInt32BE(1600,16);b.writeUInt32BE(900,20);return b;};
    const a=png(0),b=png(1);
    const base={status:'PASS_REAL_CHROME',renderer:'webgl2',originalSourceSolids:25,scoreablePromotions:0,productionAuthorized:false,unrestricted4v4Certified:false,frames:[{name:'a',sha256:digest(a)},{name:'b',sha256:digest(b)}]};
    verifyEvidence(base,name=>name==='a'?a:b);
    let rejected=false;try{verifyEvidence({...base,frames:[base.frames[0],base.frames[0]]},()=>a);}catch{rejected=true;}
    assert(rejected,'DUPLICATE_FRAMES_NOT_REJECTED');
    console.log('F4E28_CI_GUARD_SELF_TEST_PASS');
  }else if(mode==='build'){
    const html=readFileSync(resolve('dist/index.html'),'utf8');
    console.log('F4E28_BUILD_ASSET_PASS',JSON.stringify(verifyHtml(html)));
  }else if(mode==='evidence'){
    mkdirSync(captureDir,{recursive:true});
    const evidence=JSON.parse(readFileSync(join(captureDir,'t21-f3-browser-evidence.json'),'utf8'));
    const summary=verifyEvidence(evidence,name=>readFileSync(join(captureDir,name+'.png')));
    writeFileSync(join(captureDir,'f4e28-safe-qa-report.json'),JSON.stringify(summary,null,2));
    console.log('F4E28_SAFE_BASELINE_PASS',JSON.stringify(summary));
  }else throw Error('Usage: node scripts/t21-f4e28-ci-guard.mjs privacy|self-test|build|evidence');
}catch(error){
  if(mode==='evidence'){
    mkdirSync(captureDir,{recursive:true});
    writeFileSync(join(captureDir,'f4e28-safe-qa-report.json'),JSON.stringify({status:'BLOCKED',reason:String(error?.message||error),sourcePack57578Verified:false,originalBancPlacementVerified:false,productionAuthorized:false},null,2));
  }
  console.error(String(error?.stack||error));process.exitCode=1;
}
