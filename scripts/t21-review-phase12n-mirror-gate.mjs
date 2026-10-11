#!/usr/bin/env node
/** Phase12N: independent REAL PNG + locked side-camera A/B source-only gate.
 * Not a visual topology approval, source attachment or gameplay authority.
 */
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const destination=process.env.T21_SCREENSHOT_DIR||'/tmp/t21-review-five-view';
function fail(tag){throw Error('T21_PHASE12N_'+tag);}
function inspect(manifest,read){
 if(manifest.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||
    manifest.authorizesVisualFreeze!==false||
    manifest.authorizesGameplayOrStageActivation!==false||
    manifest.screenshots?.length!==5)fail('FIVE_VIEW_BASELINE_CHANGED');
 const e=manifest.phase12NMirrorComparisonDiagnostics;
 if(!Array.isArray(e)||e.length!==4)fail('FOUR_REAL_MIRROR_SCREENSHOTS_MISSING');
 const seen=new Set(),camera={},hashes={};
 for(let i=0;i<4;i++){
  const side=i<2?'LEFT':'RIGHT',detail=i%2===0?'BASE':'WITH';
  const a=e[i],expected=side+'_'+detail;
  if(a?.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||
     a.side!==side||a.detail!==detail||
     a.visibleOriginalComponents!==(detail==='WITH'?11:7)||
     a.visibleOriginalTriangles!==(detail==='WITH'?244:156)||
     a.renderer!=='webgl2'||a.width!==1600||a.height!==900||
     a.sameCameraWithinSide!==true||
     a.noNewSourceMeshes!==true||a.defaultReviewSourceMeshes!==124||
     a.reviewOnly!==true||a.sourcePlaneNotPlayableFloor!==true||
     a.gameplayAuthority!=='NONE'||a.authorizesVisualFreeze!==false||
     a.authorizesGameplayOrStageActivation!==false||
     a.originalSourceSHA256!=='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046'||
     a.file!=='T21_PHASE12N_MIRROR_'+expected+'.png'||
     !a.cameraKey?.startsWith(side+'|'))fail('CAPTURE_METADATA_'+expected);
  if(camera[side]&&camera[side]!==a.cameraKey)fail('CAMERA_CHANGED_WITHIN_'+side);
  camera[side]=a.cameraKey;
  const buf=read(a.file);
  if(!buf||buf.length<8000||buf.length!==a.bytes||
    !buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||
    buf.readUInt32BE(16)!==1600||buf.readUInt32BE(20)!==900)
    fail('INVALID_REAL_PNG_'+expected);
  const hash=createHash('sha256').update(buf).digest('hex');
  if(hash!==a.sha256||seen.has(hash))fail('DUPLICATE_OR_WRONG_HASH_'+expected);
  seen.add(hash);hashes[expected]=hash;
 }
 // 180-degree mirrored facing is intentional; camera framing centers must
 // preserve original KiTrix pair symmetry about the fixed native axis.
 const l=camera.LEFT.split('|'),r=camera.RIGHT.split('|');
 if(l.length!==7||r.length!==7||
   Math.abs(Number(l[1])+Number(r[1])-.229368288528164)>.02||
   Math.abs(Number(l[3])+Number(r[3])-.194564295456822)>.02||
   Math.abs(Number(l[2])-Number(r[2]))>.02||
   Number(l[5])!==30||Number(r[5])!==30||
   Number(l[4])!==38||Number(r[4])!==218||
   !(Number(l[6])>=26)&&!(Number(r[6])>=26))
   fail('MIRRORED_CAMERA_CENTER_OR_FACING_INVALID');
 return {pairs:2,originalSourceComponentsPerSide:[7,11],
   baseTriangles:156,withTriangles:244,defaultSourceMeshes:124,
   sourceOnly:true,authorizesVisualFreeze:false};
}
if(process.argv.includes('--self-test')){
 const original=inspect.toString();
 if(!original.includes("CAMERA_CHANGED_WITHIN_")||
    !original.includes("DUPLICATE_OR_WRONG_HASH_")||
    !original.includes("MIRRORED_CAMERA_CENTER_OR_FACING_INVALID"))
   fail('NEGATIVE_PATH_GUARDS_MISSING');
 // Intentionally reject a blocked/missing source review manifest.
 let rejected=false;
 try{inspect({status:'BLOCKED',screenshots:[]},()=>null);}catch{rejected=true;}
 if(!rejected)fail('BLOCKED_MANIFEST_FALSE_PASS');
 console.log('T21_PHASE12N_SELF_TEST_PASS');process.exit(0);
}
const p=resolve(destination,'manifest.json');
if(!existsSync(p))fail('SCREENSHOT_MANIFEST_MISSING');
const manifest=JSON.parse(readFileSync(p,'utf8'));
const result=inspect(manifest,(name)=>{
 const p=resolve(destination,name);
 return existsSync(p)?readFileSync(p):null;
});
console.log('T21_PHASE12N_LOCKED_CAMERA_REAL_WEBGL2_SOURCE_ONLY_PASS',result);
