#!/usr/bin/env node
/** Actual Phase13D original source-only lens images. NOT gameplay authority. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {decodePng,measure} from './t21-phase13a-real-five-view-visual-baseline.mjs';
const expected=[['WALK_ORIENTED','5/0'],['VERTICAL_HIGH','0/10']];
function ok(x,k){if(!x)throw Error('PHASE13D_'+k);}
function delta(a,b){
 ok(a.width===b.width&&a.height===b.height&&a.channels===b.channels,'DIFFERENT_IMAGE_BOUNDS');
 let total=0,changed=0;
 for(let y=65;y<a.height-55;y+=8)for(let x=365;x<a.width-40;x+=8){
  const i=(y*a.width+x)*a.channels;let d=0;
  for(let k=0;k<3;k++)d=Math.max(d,Math.abs(a.pixels[i+k]-b.pixels[i+k]));
  total++;if(d>32)changed++;
 }
 ok(total>7000&&changed>500,'SOURCE_FAMILY_VIEW_NOT_DISTINCT');
 return {total,changed,changedFraction:Number((changed/total).toFixed(8))};
}
function audit(dir,out){
 const path=join(dir,'manifest.json');ok(existsSync(path),'MISSING_MANIFEST');
 const manifest=JSON.parse(readFileSync(path,'utf8'));
 ok(manifest.status==='CAPTURED_PENDING_HUMAN_VISUAL_QA'&&manifest.rendererBackend==='webgl2',
  'NOT_REAL_REVIEW_BROWSER');
 ok(manifest.authorizesVisualFreeze===false&&manifest.authorizesGameplayOrStageActivation===false,
  'RELEASE_AUTHORITY_DRIFT');
 ok(manifest.screenshots?.length===5&&manifest.phase13BUIFreePairs?.length===2&&
  manifest.phase13CFocusedCameraPairs?.length===2&&manifest.phase13DSourceLensComparisons?.length===2,
  'SOURCE_VIEW_PROVENANCE_MISSING');
 const src=manifest.phase13CFocusedCameraPairs.find(p=>p.view==='OVERVIEW');
 ok(src,'CENTER_FOCUS_REFERENCE_MISSING');
 const hash=b=>createHash('sha256').update(b).digest('hex');
 ok(hash(readFileSync(join(dir,src.focusedFile)))===src.focusedSHA256,'FOCUS_SOURCE_SHA');
 const rows=[],images=[];
 for(const [lens,familySignature] of expected){
  const all=manifest.phase13DSourceLensComparisons.filter(p=>p.lens===lens);
  ok(all.length===1,'EXPECTED_ONE_PAIR_'+lens);const r=all[0];
  ok(r.view==='OVERVIEW'&&r.sourceRootCountSignature===familySignature&&
    r.focusedBaselineFile===src.focusedFile&&r.focusedBaselineSHA256===src.focusedSHA256,
    'WRONG_ORIGINAL_SOURCE_PROVENANCE_'+lens);
  ok(r.cameraPoseKey==='CENTER_FOCUS_OVERVIEW'&&r.reviewMode==='CENTER_FOCUS'&&
   r.reviewPreset==='THREE_DIMENSIONAL'&&r.renderer==='webgl2'&&
   r.legendVisible===true,'NOT_MATCHED_CAMERA_OR_HUD_'+lens);
  ok(r.sourceOnly===true&&r.reviewOnly===true&&r.sourceGeometryChanged===false&&
   r.authorizesVisualFreeze===false&&r.authorizesStageActivation===false&&
   r.gameplayAuthority==='NONE','SOURCE_ONLY_AUTHORITY_'+lens);
  ok(r.width===1600&&r.height===900,'REQUIRED_RESOLUTION_'+lens);
  const bytes=readFileSync(join(dir,r.file));
  ok(bytes.length===r.sizeBytes&&hash(bytes)===r.sha256,'BYTE_PROVENANCE_'+lens);
  const image=decodePng(bytes);ok(image.width===1600&&image.height===900,'PNG_IHDR_'+lens);
  images.push(image);
  const stat=measure(image);
  rows.push({lens,originalSourceRootCounts:familySignature,file:r.file,
   sha256:r.sha256,roiHighContrastSampleCount:stat.highContrastColoredSamples,
   boundingBox:stat.highContrastSampleBBoxXY,sourceOnly:true,gameplayAuthority:'NONE'});
 }
 const comparison=delta(images[0],images[1]);
 const report={version:'T21_PHASE13D_REAL_REVIEW_SOURCE_FAMILY_CONTRAST_V1',
  originalFiveViewsUnchanged:true,phase13BAnd13CPreserved:true,sourceOnly:true,reviewOnly:true,
  runtimePromotionAuthorized:false,authorizesVisualFreeze:false,gameplayAuthority:'NONE',
  modes:rows,comparison,claimLimit:'Original source family visibility only, not exact Y slice or walkable surface'};
 writeFileSync(out,JSON.stringify(report,null,2));
 console.log('T21_PHASE13D_REAL_A_B_PASS',JSON.stringify({
  rows:rows.map(r=>[r.lens,r.roiHighContrastSampleCount]),comparison}));
}
function selftest(){
 const image=v=>({width:1600,height:900,channels:3,pixels:Buffer.alloc(1600*900*3,v)});
 let fail=false;
 try{delta(image(0),image(0));}catch(e){fail=String(e).includes('SOURCE_FAMILY_VIEW_NOT_DISTINCT');}
 ok(fail,'NEGATIVE_NO_CHANGE');
 fail=false;try{delta(image(0),{width:900,height:1600,channels:3,pixels:Buffer.alloc(1600*900*3)});}
 catch(e){fail=String(e).includes('DIFFERENT_IMAGE_BOUNDS');}
 ok(fail,'NEGATIVE_BOUND_DRIFT');
 console.log('T21_PHASE13D_NEGATIVE_QA_PASS');
}
if(process.argv[2]==='--self-test')selftest();
else if(process.argv[2]==='--audit')audit(process.argv[3]||'/tmp/t21-review-five-view',
 process.argv[4]||'/tmp/t21-review-five-view/T21_PHASE13D_SOURCE_LENS_EVIDENCE.json');
else throw Error('Usage --self-test | --audit [captureDir] [outputJson]');
