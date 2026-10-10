#!/usr/bin/env node
/** Original-camera UI-free paired PNG evidence; source-only, never runtime QA. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {decodePng,measure} from './t21-phase13a-real-five-view-visual-baseline.mjs';
const views=['OVERVIEW','TOP'];
function must(ok,message){if(!ok)throw Error('PHASE13B_'+message);}
function difference(before,after){
  must(before.width===after.width&&before.height===after.height,'IMG_BOUNDS');
  must(before.channels===after.channels,'IMG_COLOR_FORMAT');
  let outside=0,steady=0,ui=0,changed=0;
  for(let y=60;y<before.height-40;y+=8)for(let x=20;x<before.width-20;x+=8){
    const i=(y*before.width+x)*before.channels;
    const d=Math.max(...[0,1,2].map(c=>Math.abs(before.pixels[i+c]-after.pixels[i+c])));
    if(x>=380){outside++;if(d<=32)steady++;}
    if(x<320){ui++;if(d>=28)changed++;}
  }
  const stable=steady/outside;
  must(outside>5000&&stable>=.8,'SCENE_NOT_CAMERA_MATCHED');
  must(ui>1000&&changed>=80,'REVIEW_PANEL_NOT_HIDDEN');
  return {outsideSamples:outside,outsideStableFraction:Number(stable.toFixed(8)),
    leftUiSamples:ui,leftUiChangedSamples:changed,
    leftUiChangedFraction:Number((changed/ui).toFixed(8))};
}
function audit(dir,out){
 const p=join(dir,'manifest.json');
 must(existsSync(p),'NO_SCREENSHOT_MANIFEST');
 const m=JSON.parse(readFileSync(p,'utf8'));
 must(m.status==='CAPTURED_PENDING_HUMAN_VISUAL_QA'&&
  m.rendererBackend==='webgl2'&&m.authorizesVisualFreeze===false&&
  m.authorizesGameplayOrStageActivation===false,'NO_VALID_REVIEW_CAPTURE');
 must(m.screenshots?.length===5&&m.phase13BUIFreePairs?.length===2,'CANONICAL_FIVE_AND_PAIRS');
 const rows=[];
 for(const view of views){
  const pairs=m.phase13BUIFreePairs.filter(p=>p.view===view);
  must(pairs.length===1,'MISSING_PAIR_'+view);
  const pair=pairs[0],normal=m.screenshots.find(p=>p.view===view);
  must(normal&&pair.baselineFile===normal.file&&pair.baselineSHA256===normal.sha256,
   'SOURCE_PROVENANCE_'+view);
  must(pair.cameraViewBeforeAfterMatched===true&&pair.panelHiddenDuringCapture===true&&
   pair.reviewPreset==='THREE_DIMENSIONAL'&&pair.renderer==='webgl2'&&
   pair.reviewOnly===true&&pair.sourceOnly===true&&
   pair.authorizesVisualFreeze===false&&
   pair.gameplayFloorNavColliderPaintScoringProof===false,'AUTHORITY_OR_CAMERA_'+view);
  must(pair.width===1600&&pair.height===900,'DIMENSIONS_'+view);
  const old=readFileSync(join(dir,normal.file)),newPng=readFileSync(join(dir,pair.uiFreeFile));
  const sha=b=>createHash('sha256').update(b).digest('hex');
  must(old.length===normal.sizeBytes&&sha(old)===normal.sha256,'NORMAL_HASH_'+view);
  must(newPng.length===pair.uiFreeSizeBytes&&sha(newPng)===pair.uiFreeSHA256,
   'UI_FREE_HASH_'+view);
  must(!old.equals(newPng),'SAME_SCREENSHOT_'+view);
  const a=decodePng(old),b=decodePng(newPng);
  must(a.width===1600&&a.height===900&&b.width===1600&&b.height===900,'IHDR_'+view);
  const diff=difference(a,b),display=measure(b);
  rows.push({view,baselineFile:normal.file,uiFreeFile:pair.uiFreeFile,
   baselineSHA256:normal.sha256,uiFreeSHA256:pair.uiFreeSHA256,
   ...diff,uiFreeColoredSamples:display.highContrastColoredSamples,
   cameraMatchedByDOM:true,collisionOrWalkablePathProven:false});
 }
 const report={version:'T21_PHASE13B_SOURCE_ONLY_SAME_CAMERA_UI_FREE_COMPARE_V1',
  reviewOnly:true,sourceOnly:true,runtimePromotionAuthorized:false,
  authorizesVisualFreeze:false,gameplayFloorColliderNavPaintScoringAuthority:'NONE',
  canonicalMandatoryFiveViewsUnchanged:true,sourcePairCount:rows.length,rows};
 writeFileSync(out,JSON.stringify(report,null,2));
 console.log('T21_PHASE13B_UI_FREE_PAIR_PASS '+JSON.stringify(
  rows.map(r=>[r.view,r.outsideStableFraction,r.leftUiChangedSamples])));
}
function selftest(){
 const img=v=>({width:1600,height:900,channels:3,pixels:Buffer.alloc(1600*900*3,v)});
 let rejected=false;
 try{difference(img(0),img(0));}catch(e){rejected=String(e).includes('REVIEW_PANEL_NOT_HIDDEN');}
 must(rejected,'NEGATIVE_NO_UI_CHANGE');
 rejected=false;
 try{difference(img(0),img(255));}catch(e){rejected=String(e).includes('SCENE_NOT_CAMERA_MATCHED');}
 must(rejected,'NEGATIVE_SCENE_CHANGED');
 console.log('T21_PHASE13B_NEGATIVE_SELFTEST_PASS');
}
if(process.argv[2]==='--self-test')selftest();
else if(process.argv[2]==='--audit')audit(process.argv[3]||'/tmp/t21-review-five-view',
 process.argv[4]||'/tmp/t21-review-five-view/T21_PHASE13B_UI_FREE_EVIDENCE.json');
else throw Error('Usage --self-test | --audit [screenshotDir] [outputJson]');
