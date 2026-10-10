#!/usr/bin/env node
/** Phase13C independent actual PNG and camera metadata QA, source review only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {decodePng,measure} from './t21-phase13a-real-five-view-visual-baseline.mjs';
function check(v,s){if(!v)throw Error('PHASE13C_'+s);}
function diff(a,b){
 check(a.width===b.width&&a.height===b.height&&a.channels===b.channels,'DIMENSIONS');
 let sampled=0,changed=0;
 for(let y=60;y<a.height-40;y+=8)for(let x=350;x<a.width-20;x+=8){
  const pos=(y*a.width+x)*a.channels;
  let delta=0;
  for(let c=0;c<3;c++)delta=Math.max(delta,Math.abs(a.pixels[pos+c]-b.pixels[pos+c]));
  sampled++;if(delta>=28)changed++;
 }
 check(sampled>5000&&changed>=400,'NOT_VISUALLY_DISTINCT');
 return {sampled,changed,changedFraction:Number((changed/sampled).toFixed(8))};
}
function audit(dir,out){
 const f=join(dir,'manifest.json');check(existsSync(f),'NO_REAL_MANIFEST');
 const m=JSON.parse(readFileSync(f,'utf8'));
 check(m.status==='CAPTURED_PENDING_HUMAN_VISUAL_QA'&&m.rendererBackend==='webgl2','MISSING_REAL_RENDER');
 check(m.authorizesVisualFreeze===false&&m.authorizesGameplayOrStageActivation===false,'RELEASE_AUTHORITY');
 check(m.screenshots?.length===5&&m.phase13BUIFreePairs?.length===2&&
  m.phase13CFocusedCameraPairs?.length===2,'MISSING_SOURCE_FRAMES');
 const rows=[];
 for(const view of ['OVERVIEW','TOP']){
  const pair=m.phase13CFocusedCameraPairs.filter(x=>x.view===view);
  check(pair.length===1,'DUPLICATE_VIEW_'+view);
  const p=pair[0],base=m.phase13BUIFreePairs.find(x=>x.view===view);
  check(base&&p.uiFreeBaselineFile===base.uiFreeFile&&
   p.uiFreeBaselineSHA256===base.uiFreeSHA256,'MISMATCH_SOURCE_PAIR_'+view);
  check(p.mode==='CENTER_FOCUS'&&p.poseKey==='CENTER_FOCUS_'+view&&
   p.preset==='THREE_DIMENSIONAL'&&p.renderer==='webgl2'&&
   p.sourceOnly===true&&p.reviewOnly===true&&p.runtimePromotionAuthorized===false&&
   p.authorizesVisualFreeze===false&&p.gameplayCameraColliderNavPaintScoreProof===false,'CAMERA_OR_AUTHORITY_'+view);
  check(p.width===1600&&p.height===900,'METADATA_RESOLUTION_'+view);
  const bytes=readFileSync(join(dir,p.focusedFile)),b=readFileSync(join(dir,base.uiFreeFile));
  const hash=x=>createHash('sha256').update(x).digest('hex');
  check(bytes.length===p.focusedSizeBytes&&hash(bytes)===p.focusedSHA256,'FOCUS_SHA_'+view);
  check(hash(b)===base.uiFreeSHA256,'BASE_SHA_'+view);
  check(!bytes.equals(b),'DUPLICATE_CAMERA_IMAGE_'+view);
  const img=decodePng(bytes),before=decodePng(b);
  check(img.width===1600&&img.height===900,'PNG_REAL_RESOLUTION_'+view);
  const d=diff(before,img),now=measure(img),was=measure(before);
  rows.push({view,sourceBaselineFile:base.uiFreeFile,sourceFocusedFile:p.focusedFile,
   sourceBaselineSHA256:base.uiFreeSHA256,focusedSHA256:p.focusedSHA256,
   baselineColoredSamples:was.highContrastColoredSamples,
   focusedColoredSamples:now.highContrastColoredSamples,
   baselineColorBBox:was.highContrastSampleBBoxXY,
   focusedColorBBox:now.highContrastSampleBBoxXY,
   ...d,sourceOnly:true,gameplayFloorNavCollisionProof:false});
 }
 const data={version:'T21_PHASE13C_SOURCE_ONLY_FOCUSED_REAL_REVIEW_V1',
  sourceOnly:true,reviewOnly:true,runtimePromotionAuthorized:false,
  authorizesVisualFreeze:false,gameplayFloorNavCollisionPaintAuthority:'NONE',
  canonicalFiveViewsUnchanged:true,phase13BUIFreePairsUnchanged:true,
  optionalReviewPairs:rows.length,rows,
  caveat:'2D bbox and color counts are diagnostic; no automatic playable-route or artistic approval'};
 writeFileSync(out,JSON.stringify(data,null,2));
 console.log('T21_PHASE13C_REAL_FOCUSED_CAMERA_PASS',JSON.stringify(
  rows.map(x=>[x.view,x.baselineColoredSamples,x.focusedColoredSamples,x.changedFraction])));
}
function selftest(){
 const blank=v=>({width:1600,height:900,channels:3,pixels:Buffer.alloc(1600*900*3,v)});
 let reject=false;
 try{diff(blank(0),blank(0));}catch(e){reject=String(e).includes('NOT_VISUALLY_DISTINCT');}
 check(reject,'NEGATIVE_IDENTICAL_IMAGE');
 reject=false;
 try{diff(blank(0),{width:900,height:1600,channels:3,pixels:Buffer.alloc(1600*900*3)});}
 catch(e){reject=String(e).includes('DIMENSIONS');}
 check(reject,'NEGATIVE_DIMENSIONS');
 console.log('T21_PHASE13C_NEGATIVE_SELFTEST_PASS');
}
if(process.argv[2]==='--self-test')selftest();
else if(process.argv[2]==='--audit')audit(process.argv[3]||'/tmp/t21-review-five-view',
 process.argv[4]||'/tmp/t21-review-five-view/T21_PHASE13C_FOCUSED_CAMERA_EVIDENCE.json');
else throw Error('Usage --self-test | --audit [screenshotDir] [outputJson]');
