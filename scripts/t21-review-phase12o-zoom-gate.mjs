#!/usr/bin/env node
/** Phase12O real Chrome PNG quantitative source-only optics regression.
 * No invented source polygons, gameplay floor, nav, collision or Visual Freeze.
 */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';

function fail(reason){throw Error('T21_PHASE12O_'+reason);}
const PNG=Buffer.from([137,80,78,71,13,10,26,10]);
const SOURCE_SHA='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';

/** No browser canvas, external Python/Pillow, or image-diff dependency:
 * decode *real* Chrome type-2/6 8-bit PNG with lossless filter reconstruction.
 */
function decode(png){
 if(!Buffer.isBuffer(png)||png.length<100||!png.subarray(0,8).equals(PNG))
   fail('INVALID_PNG_SIGNATURE');
 let offset=8,width=0,height=0,channels=0,bitDepth=0,interlace=0;
 const chunks=[];let sawIHDR=false,sawEnd=false;
 while(offset+12<=png.length){
  const length=png.readUInt32BE(offset),tag=png.toString('ascii',offset+4,offset+8);
  if(length>32_000_000||offset+12+length>png.length)fail('CORRUPT_PNG_CHUNK');
  const data=png.subarray(offset+8,offset+8+length);
  if(tag==='IHDR'){
   if(sawIHDR||length!==13)fail('DUPLICATED_OR_BROKEN_IHDR');
   sawIHDR=true;width=data.readUInt32BE(0);height=data.readUInt32BE(4);
   bitDepth=data[8];channels=data[9]===2?3:data[9]===6?4:0;
   interlace=data[12];
   if(data[10]!==0||data[11]!==0)fail('UNSUPPORTED_PNG_COMPRESSION_OR_FILTER');
  }else if(tag==='IDAT')chunks.push(data);
  else if(tag==='IEND'){sawEnd=true;break;}
  offset+=12+length;
 }
 if(!sawIHDR||!sawEnd||width!==1600||height!==900||
    bitDepth!==8||!channels||interlace!==0||!chunks.length)
   fail('UNSUPPORTED_OR_INCOMPLETE_PLAYCANVAS_PNG');
 const rowWidth=width*channels;
 const raw=inflateSync(Buffer.concat(chunks),{maxOutputLength:20_000_000});
 if(raw.length!==height*(rowWidth+1))fail('PNG_FILTERED_BYTE_SIZE_DRIFT');
 const pixels=new Uint8Array(height*rowWidth);
 for(let row=0;row<height;row++){
  const filter=raw[row*(rowWidth+1)];
  if(filter>4)fail('UNSUPPORTED_PNG_SCANLINE_FILTER');
  const start=row*rowWidth,scan=row*(rowWidth+1)+1;
  for(let i=0;i<rowWidth;i++){
   const a=i>=channels?pixels[start+i-channels]:0;
   const b=row>0?pixels[start-rowWidth+i]:0;
   const c=row>0&&i>=channels?pixels[start-rowWidth+i-channels]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   else if(filter===2)predictor=b;
   else if(filter===3)predictor=Math.floor((a+b)/2);
   else if(filter===4){
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   }
   pixels[start+i]=(raw[scan+i]+predictor)&255;
  }
 }
 return {width,height,channels,pixels};
}
function compare(a,b){
 if(a.width!==b.width||a.height!==b.height)fail('DIFFERENT_RESOLUTION');
 let changed=0,foreground=0,extents=[1600,900,-1,-1];
 for(let i=0;i<a.width*a.height;i++){
  const p=i*a.channels,q=i*b.channels;
  let delta=0,light=0;
  for(let k=0;k<3;k++){
   delta=Math.max(delta,Math.abs(a.pixels[p+k]-b.pixels[q+k]));
   light=Math.max(light,a.pixels[p+k],b.pixels[q+k]);
  }
  if(light>20)foreground++;
  if(delta>=12){
   changed++;
   const x=i%a.width,y=Math.floor(i/a.width);
   extents[0]=Math.min(extents[0],x);
   extents[1]=Math.min(extents[1],y);
   extents[2]=Math.max(extents[2],x);
   extents[3]=Math.max(extents[3],y);
  }
 }
 return {changed,foreground,bbox:changed?extents:null};
}
function fromFile(dir,name){
 const file=resolve(dir,name);
 if(!existsSync(file))fail('MISSING_REAL_PNG_'+name);
 return readFileSync(file);
}
function checkMetadata(items,expectedLabel){
 if(!Array.isArray(items)||items.length!==4)fail(expectedLabel+'_FOUR_CAPTURES_MISSING');
 const seen=new Set();
 const cameras=new Map();
 for(let i=0;i<4;i++){
  const side=i<2?'LEFT':'RIGHT',state=i%2===0?'BASE':'WITH';
  const entry=items[i],label=side+'_'+state;
  if(entry?.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||
    entry.side!==side||
    (entry.detail!==undefined?entry.detail:entry.variant)!==state||
    (entry.visibleOriginalComponents!==undefined?entry.visibleOriginalComponents:entry.visibleOriginalComponents)!==(state==='BASE'?7:11)||
    (entry.visibleOriginalTriangles!==undefined?entry.visibleOriginalTriangles:entry.visibleOriginalTriangles)!==(state==='BASE'?156:244)||
    !entry.cameraKey?.startsWith(side+'|')||
    entry.renderer!=='webgl2'||entry.width!==1600||entry.height!==900||
    entry.authorizesVisualFreeze!==false||
    entry.authorizesGameplayOrStageActivation!==false||
    (entry.defaultSourceMeshes??entry.defaultReviewSourceMeshes)!==124||
    entry.gameplayAuthority!=='NONE')
    fail(expectedLabel+'_SOURCE_ONLY_METADATA_DRIFT_'+label);
  if(expectedLabel==='PHASE12O'&&
    (entry.originalSourceSHA256!==SOURCE_SHA||entry.additionalSourceMeshes!==0||
     entry.sourcePlaneNotPlayableFloor!==true||entry.reviewTargetOriginalYMin!==25.1||
     entry.reviewTargetOriginalYMax!==25.6))
    fail('PHASE12O_ORIGINAL_DETAIL_AUTHORITY_DRIFT');
  if(cameras.has(side)&&cameras.get(side)!==entry.cameraKey)
    fail(expectedLabel+'_CAMERA_UNLOCKED_'+side);
  cameras.set(side,entry.cameraKey);
  if(seen.has(entry.sha256))fail(expectedLabel+'_DUPLICATE_SCREENSHOT_SHA');
  seen.add(entry.sha256);
 }
 return cameras;
}
function verify(manifest,dir){
 if(manifest.status!=='CAPTURED_PENDING_HUMAN_VISUAL_QA'||
    manifest.screenshots?.length!==5||
    manifest.authorizesVisualFreeze!==false||
    manifest.authorizesGameplayOrStageActivation!==false)
    fail('MANDATORY_FIVE_VIEW_FREEZE_DRIFT');
 const prev=manifest.phase12NMirrorComparisonDiagnostics,now=manifest.phase12OOriginalDetailZoomDiagnostics;
 const oldCam=checkMetadata(prev,'PHASE12N'),zoomCam=checkMetadata(now,'PHASE12O');
 const findings={sourceOnly:true,authorizesVisualFreeze:false,bySide:{}};
 for(let i=0;i<4;i++){
  const e=now[i],p=prev[i];
  const exp='T21_PHASE12O_ZOOM_'+e.side+'_'+e.variant+'.png';
  if(e.file!==exp||p.file!=='T21_PHASE12N_MIRROR_'+p.side+'_'+p.detail+'.png')
    fail('ACTUAL_SCREENSHOT_FILENAME_DRIFT');
  for(const rec of [e,p]){
   const bytes=fromFile(dir,rec.file),sha=createHash('sha256').update(bytes).digest('hex');
   if(bytes.length!==rec.bytes||sha!==rec.sha256)fail('SCREENSHOT_SHA_OR_LENGTH_DRIFT_'+rec.file);
  }
 }
 for(const side of ['LEFT','RIGHT']){
  const before=prev.filter(x=>x.side===side),after=now.filter(x=>x.side===side);
  if(before.length!==2||after.length!==2)fail('SIDE_INVENTORY_MISMATCH');
  if(oldCam.get(side)===zoomCam.get(side))fail('ZOOM_CAMERA_IDENTICAL_TO_WIDE_'+side);
  const key=zoomCam.get(side).split('|');
  const widthDist=Number(oldCam.get(side).split('|')[6]);
  const zoomDist=Number(key[6]);
  if(key.length!==7||Math.abs(Number(key[2])-25.35)>.001||
     Number(key[5])!==30||!(zoomDist>=13.5&&zoomDist<=24)||
     !(widthDist>=zoomDist*1.5))
    fail('CAMERA_NOT_GENUINELY_MAGNIFIED_'+side);
  const b=compare(decode(fromFile(dir,before[0].file)),decode(fromFile(dir,before[1].file)));
  const z=compare(decode(fromFile(dir,after[0].file)),decode(fromFile(dir,after[1].file)));
  if(b.changed<300||b.foreground<4000||
     z.changed<1000||z.foreground<4000||
     z.changed<b.changed*1.5)
    fail('INCREASED_REAL_DETAIL_VISIBILITY_NOT_PROVEN_'+side+
      '_old'+b.changed+'_zoom'+z.changed);
  findings.bySide[side]={baselineChangedPixels:b.changed,zoomChangedPixels:z.changed,
    magnificationRatio:Math.round(z.changed/b.changed*100)/100,
    baselineBBox:b.bbox,zoomBBox:z.bbox};
 }
 return findings;
}
if(process.argv.includes('--self-test')){
 let failed=false;
 try{decode(Buffer.from('NOT A PNG'));}catch{failed=true;}
 if(!failed)fail('NEGATIVE_BAD_IMAGE_FALSE_PASS');
 failed=false;
 try{verify({status:'BLOCKED'},'/tmp/no-files');}catch{failed=true;}
 if(!failed)fail('NEGATIVE_BLOCKED_MANIFEST_FALSE_PASS');
 console.log('T21_PHASE12O_NEGATIVE_PATH_SELF_TEST_PASS');
 process.exit(0);
}
const dir=process.env.T21_SCREENSHOT_DIR||'/tmp/t21-review-five-view';
const manifestFile=resolve(dir,'manifest.json');
if(!existsSync(manifestFile))fail('REAL_CHROME_MANIFEST_MISSING');
const findings=verify(JSON.parse(readFileSync(manifestFile,'utf8')),dir);
console.log('T21_PHASE12O_INCREASED_REAL_WEBGL2_DETAIL_VISIBILITY_PASS',JSON.stringify(findings));
