#!/usr/bin/env node
/** Phase12M: reject missing or fake optional source-only screenshot evidence.
 * Screenshot presence is NOT visual topology approval or gameplay authority.
 */
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const dir=process.env.T21_SCREENSHOT_DIR||'/tmp/t21-review-five-view';
const filepath=resolve(dir,'manifest.json');
if(!existsSync(filepath))throw Error('T21_PHASE12M_REAL_BROWSER_MANIFEST_MISSING');
const m=JSON.parse(readFileSync(filepath,'utf8'));
if(m.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||m.authorizesVisualFreeze!==false||
  m.authorizesGameplayOrStageActivation!==false||m.screenshots?.length!==5)
  throw Error('T21_PHASE12M_MANDATORY_FIVE_VIEW_OR_FREEZE_STATE_DRIFT');
const opts=m.phase12MOriginalRimBandDiagnostics;
if(!Array.isArray(opts)||opts.length!==3)
  throw Error('T21_PHASE12M_ORIGINAL_RIM_BAND_CAPTURE_MISSING');
const unique=new Set();
for(const [i,choice] of ['CONTEXT','RIM','BAND'].entries()){
 const e=opts[i];
 if(e.selection!==choice||e.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||
   e.sourceOriginalComponents!==(choice==='CONTEXT'?22:4)||
   e.originalSourceTriangles!==(choice==='CONTEXT'?488:88)||
   e.sourceRimNotPlayableFloor!==true||e.noPhysicalAttachmentAssertion!==true||
   e.frozenDefaultSourceMeshCount!==124||e.gameplayAuthority!=='NONE'||
   e.authorizesVisualFreeze!==false||
   e.authorizesGameplayOrStageActivation!==false||
   e.renderer!=='webgl2'||e.width!==1600||e.height!==900)
   throw Error('T21_PHASE12M_UNVERIFIED_SOURCE_ONLY_CAPTURE '+JSON.stringify(e));
 const img=resolve(dir,e.file);
 if(!existsSync(img))throw Error('T21_PHASE12M_REAL_PNG_NOT_PRESENT '+choice);
 const buf=readFileSync(img);
 const signature=Buffer.from([137,80,78,71,13,10,26,10]);
 if(buf.length<8000||!buf.subarray(0,8).equals(signature)||
   buf.readUInt32BE(16)!==1600||buf.readUInt32BE(20)!==900||
   buf.length!==e.bytes)
   throw Error('T21_PHASE12M_INVALID_REAL_PNG '+choice);
 const sha=createHash('sha256').update(buf).digest('hex');
 if(sha!==e.sha256||unique.has(sha))
   throw Error('T21_PHASE12M_DUPLICATE_OR_HASH_INVALID '+choice);
 unique.add(sha);
}
console.log('T21_PHASE12M_THREE_OPTIONAL_REAL_WEBGL2_CAPTURES_PASS',{
  selections:opts.map(e=>e.selection),originalContextComponents:22,
  authorizesVisualFreeze:false,gameplayAuthority:'NONE'
});
