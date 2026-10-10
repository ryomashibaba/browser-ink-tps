#!/usr/bin/env node
/** T21 Phase13A actual Chrome/WebGL2 screenshot quality baseline, review ONLY. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {join} from 'node:path';

const VIEWS=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];
function req(x,message){if(!x)throw Error('PHASE13A_'+message);}
function decodePng(bytes){
 req(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG_SIGNATURE');
 let offset=8,w=0,h=0,c=0,end=false;const idats=[];
 while(offset<bytes.length){
  req(offset+12<=bytes.length,'PNG_TRUNCATED');
  const length=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);
  req(length<=bytes.length-offset-12,'PNG_BAD_CHUNK');
  const data=bytes.subarray(offset+8,offset+8+length);
  if(kind==='IHDR'){
   w=data.readUInt32BE(0);h=data.readUInt32BE(4);
   req(length===13&&data[8]===8&&[2,6].includes(data[9])&&
    data[10]===0&&data[11]===0&&data[12]===0,'PNG_FORMAT');
   c=data[9]===2?3:4;req(w>0&&h>0&&w<=4000&&h<=2500,'PNG_SIZE');
  }
  if(kind==='IDAT')idats.push(data);
  if(kind==='IEND'){end=true;break;}
  offset+=length+12;
 }
 req(end&&idats.length>0&&c>0,'PNG_MISSING_DATA');
 const raw=inflateSync(Buffer.concat(idats)),stride=w*c;
 req(raw.length===(stride+1)*h,'PNG_RAW_LENGTH');
 const pixels=Buffer.alloc(stride*h);
 let index=0;
 for(let y=0;y<h;y++){
  const filter=raw[index++];req(filter>=0&&filter<=4,'PNG_FILTER');
  for(let x=0;x<stride;x++){
   const v=raw[index++],at=y*stride+x;
   const left=x>=c?pixels[at-c]:0,up=y?pixels[at-stride]:0;
   const ul=y&&x>=c?pixels[at-stride-c]:0;
   let add=0;
   if(filter===1)add=left;
   else if(filter===2)add=up;
   else if(filter===3)add=Math.floor((left+up)/2);
   else if(filter===4){
    const p=left+up-ul,a=Math.abs(p-left),b=Math.abs(p-up),d=Math.abs(p-ul);
    add=a<=b&&a<=d?left:b<=d?up:ul;
   }
   pixels[at]=(v+add)&255;
  }
 }
 return {width:w,height:h,channels:c,pixels};
}
function measure(im){
 const x0=350,x1=im.width-20,y0=40,y1=im.height-35,step=4;
 req(x1>x0&&y1>y0,'ROI_SIZE');
 let samples=0,color=0,lit=0,minx=x1,miny=y1,maxx=x0,maxy=y0;
 for(let y=y0;y<y1;y+=step)for(let x=x0;x<x1;x+=step){
  const p=(y*im.width+x)*im.channels;
  const hi=Math.max(im.pixels[p],im.pixels[p+1],im.pixels[p+2]);
  const lo=Math.min(im.pixels[p],im.pixels[p+1],im.pixels[p+2]);
  samples++;if(hi>=20)lit++;
  if(hi>=90&&hi-lo>=65){color++;minx=Math.min(minx,x);maxx=Math.max(maxx,x);
   miny=Math.min(miny,y);maxy=Math.max(maxy,y);}
 }
 req(color>1200,'BLANK_OR_LOW_CONTRAST_REVIEW_FRAME');
 return {sampleCount:samples,highContrastColoredSamples:color,nonDarkSamples:lit,
  highContrastColoredFraction:Number((color/samples).toFixed(8)),
  highContrastSampleBBoxXY:[minx,miny,maxx,maxy],
  roi:{xMin:x0,xMaxExclusive:x1,yMin:y0,yMaxExclusive:y1,step,
   colorPredicate:'RGB max >=90 AND channel range >=65'},
  interpretation:'2D visual presence only; NOT floor/collision/route connectivity'};
}
function audit(dir,output){
 const mp=join(dir,'manifest.json');req(existsSync(mp),'MANIFEST_MISSING');
 const manifest=JSON.parse(readFileSync(mp,'utf8'));
 req(manifest.status==='CAPTURED_PENDING_HUMAN_VISUAL_QA','NOT_REAL_CAPTURE');
 req(manifest.authorizesVisualFreeze===false&&
  manifest.authorizesGameplayOrStageActivation===false,'RELEASE_GATE_DRIFT');
 req(manifest.rendererBackend==='webgl2','RENDERER_DRIFT');
 req(manifest.source.includes('NOT production'),'PRODUCTION_SCOPE_DRIFT');
 req(Array.isArray(manifest.screenshots)&&manifest.screenshots.length===5,'VIEW_COUNT');
 const seen=new Set();const frames=[];
 for(const view of VIEWS){
  const candidates=manifest.screenshots.filter(s=>s.view===view);
  req(candidates.length===1,'VIEW_MISSING_'+view);
  const s=candidates[0],name='T21_'+view+'_WEBGPU_OR_WEBGL2_REVIEW.png';
  req(s.file===name&&s.width===1600&&s.height===900,'VIEW_METADATA_'+view);
  req(s.humanVisualApproval===false,'VISUAL_APPROVAL_FORGED_'+view);
  const bytes=readFileSync(join(dir,name)),sha=createHash('sha256').update(bytes).digest('hex');
  req(sha===s.sha256&&bytes.length===s.sizeBytes,'VIEW_SHA_SIZE_'+view);
  req(!seen.has(sha),'DUPLICATE_FRAME_'+view);seen.add(sha);
  const decoded=decodePng(bytes);
  req(decoded.width===s.width&&decoded.height===s.height,'PNG_DIMENSIONS_'+view);
  frames.push({view,file:name,sha256:sha,sizeBytes:bytes.length,
   width:decoded.width,height:decoded.height,renderer:s.renderer,...measure(decoded)});
 }
 const report={version:'T21_PHASE13A_REAL_FIVE_VIEW_VISUAL_BASELINE_V1',
  reviewOnly:true,sourceOnly:true,runtimePromotionAuthorized:false,
  authorizesVisualFreeze:false,humanVisualApproval:false,
  gameplayFloorColliderNavPaintScoringAuthority:'NONE',
  sourceManifestStatus:manifest.status,renderingBackend:manifest.rendererBackend,
  screenshotCount:frames.length,frames,
  triagePriority:['P0_ROUTE_READABILITY','P0_CONNECTIVITY_UNVERIFIED_LABELS',
   'P1_SOURCE_MATERIAL_FIDELITY','P1_ELEVATION_SILHOUETTE','P2_REVIEW_PANEL_PRESENTATION'],
  limits:['ROI stats exclude left 350px; not exact UI segmentation',
   'Colored pixels indicate a rendered view, not a finished map or connected floor',
   'Image presence and screenshot hashes do not approve Visual Freeze',
   'Every material and geometry modification requires separate authorization']};
 writeFileSync(output,JSON.stringify(report,null,2));
 console.log('T21_PHASE13A_CAPTURE_BASELINE_PASS',JSON.stringify({
   views:frames.length,coloredSamples:frames.map(f=>[f.view,f.highContrastColoredSamples]),
   output}));
}
function selftest(){
 try{decodePng(Buffer.alloc(10));throw Error('FAILED_TO_REJECT_BAD_PNG')}
 catch(e){req(String(e).includes('PHASE13A_PNG_SIGNATURE'),'NEGATIVE_SIGNATURE');}
 try{measure({width:1600,height:900,channels:3,pixels:Buffer.alloc(1600*900*3)});
  throw Error('FAILED_TO_REJECT_BLANK');}
 catch(e){req(String(e).includes('PHASE13A_BLANK_OR_LOW_CONTRAST_REVIEW_FRAME'),'NEGATIVE_BLANK');}
 console.log('T21_PHASE13A_SYNTHETIC_NEGATIVE_PASS');
}
if(process.argv[2]==='--self-test')selftest();
else if(process.argv[2]==='--audit')audit(process.argv[3]||'/tmp/t21-review-five-view',
 process.argv[4]||'/tmp/t21-review-five-view/T21_PHASE13A_VISUAL_BASELINE.json');
else throw Error('Usage: --self-test | --audit [screenshotDir] [jsonOutput]');
