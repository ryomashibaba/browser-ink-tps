#!/usr/bin/env node
/**
 * Source-only W10-B15 native CPU respawn pixel witness.
 * Decodes two REAL Chromium Page.captureScreenshot PNGs. No graphics mocks,
 * no browser canvas substitution, no synthesized entity rendering.
 * The camera stays at one identical, fixed source-supported CPU spawn pad.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inflateSync} from 'node:zlib';

const dir=resolve(process.argv[2]||'/tmp/t21-f3-playable-webgl2');
const before=resolve(dir,'W10B15_2_NATIVE_PAD_BEFORE_RESPAWN.png');
const after=resolve(dir,'W10B15_3_NATIVE_PAD_AFTER_RESPAWN.png');
const fail=(why,meta)=>{throw Error('W10B15_PIXEL_'+why+' '+JSON.stringify(meta||{}));};
function decode(file){
 const png=readFileSync(file);
 if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
  fail('NOT_PNG',{file});
 let pos=8,width=0,height=0,bpp=0,depth=0,interlace=0;
 const idat=[];
 while(pos+12<=png.length){
  const n=png.readUInt32BE(pos);
  const type=png.toString('ascii',pos+4,pos+8);
  const p=pos+8;
  if(type==='IHDR'){
   width=png.readUInt32BE(p);height=png.readUInt32BE(p+4);
   depth=png[p+8];bpp=png[p+9]===2?3:png[p+9]===6?4:0;
   interlace=png[p+12];
  }
  if(type==='IDAT')idat.push(png.subarray(p,p+n));
  pos+=12+n;
  if(type==='IEND')break;
 }
 if(width!==1600||height!==900||depth!==8||!bpp||interlace!==0||!idat.length)
  fail('BAD_FRAME_FORMAT',{width,height,depth,bpp,interlace});
 const src=inflateSync(Buffer.concat(idat));
 const bytesPerLine=width*bpp;
 const image=Buffer.alloc(width*height*3);
 let cur=0,prior=Buffer.alloc(bytesPerLine);
 for(let y=0;y<height;y++){
  const filter=src[cur++],line=Buffer.alloc(bytesPerLine);
  if(filter<0||filter>4)fail('PNG_UNSUPPORTED_FILTER',{filter,y});
  for(let i=0;i<bytesPerLine;i++){
   const value=src[cur++];
   const left=i>=bpp?line[i-bpp]:0;
   const top=prior[i];
   const topLeft=i>=bpp?prior[i-bpp]:0;
   let guess=0;
   if(filter===1)guess=left;
   if(filter===2)guess=top;
   if(filter===3)guess=Math.floor((left+top)/2);
   if(filter===4){
    const p=left+top-topLeft;
    const a=Math.abs(p-left),b=Math.abs(p-top),c=Math.abs(p-topLeft);
    guess=a<=b&&a<=c?left:b<=c?top:topLeft;
   }
   line[i]=(value+guess)&255;
  }
  for(let x=0;x<width;x++){
   const srcIdx=x*bpp,dstIdx=(y*width+x)*3;
   image[dstIdx]=line[srcIdx];
   image[dstIdx+1]=line[srcIdx+1];
   image[dstIdx+2]=line[srcIdx+2];
  }
  prior=line;
 }
 return {width,height,image};
}
const earlier=decode(before),later=decode(after);
const isMagenta=(r,g,b)=>r>80&&b>45&&r>g*1.5&&b>g*1.3;
let changed=0,magentaBefore=0,magentaAfter=0,totalDelta=0;
for(let y=290;y<610;y++)for(let x=655;x<945;x++){
 const i=(y*1600+x)*3;
 const [ar,ag,ab]=earlier.image.subarray(i,i+3);
 const [br,bg,bb]=later.image.subarray(i,i+3);
 const delta=Math.abs(ar-br)+Math.abs(ag-bg)+Math.abs(ab-bb);
 totalDelta+=delta;
 if(delta>65)changed++;
 if(isMagenta(ar,ag,ab))magentaBefore++;
 if(isMagenta(br,bg,bb))magentaAfter++;
}
const evidence=JSON.parse(readFileSync(resolve(dir,'w10b15-trusted-input.json'),'utf8'));
if(evidence.status!=='PASS_REAL_CHROME_TRUSTED_MOUSE_INPUT_NATIVE_COMBAT'||
   !evidence.nativePadCameraOnly||!evidence.padEmpty||
   !evidence.padFilled||evidence.padEmpty.cpuState!=='SPLATTED'||
   evidence.padFilled.cpuState!=='ACTIVE'||
   evidence.padEmpty.cpuEntityEnabled!==false||
   evidence.padFilled.cpuEntityEnabled!==true||
   JSON.stringify(evidence.padEmpty.viewPosition)!==
    JSON.stringify(evidence.padFilled.viewPosition)||
   JSON.stringify(evidence.padEmpty.lookAt)!==
    JSON.stringify(evidence.padFilled.lookAt)||
   evidence.naturalEncounterCertified!==false||
   evidence.productionAuthorized!==false)
 fail('CORRUPT_AUTHORITY_OR_CAMERA',{status:evidence.status});
const result={
 method:'Chromium real WebGL2 PNG RGB difference from identical camera',
 roi:[655,290,945,610],
 changedPixels:changed,
 averageChannelDelta:totalDelta/(290*320*3),
 magentaBefore,magentaAfter,magentaGain:magentaAfter-magentaBefore,
 nativeCpuRespawnAndRenderComponentPresent:true,
 physicsActorsRelocatedForPixelComparison:0,
 naturalMapEncounterCertified:false,
 originalScoringCertified:false,
 productionAuthorized:false,
 status:changed>=700&&magentaAfter-magentaBefore>=100?
   'PASS_NATIVE_CPU_VISIBLE_RESPAWN_PIXELS':'HOLD_PIXEL_VISIBILITY_NOT_CERTIFIED'
};
writeFileSync(resolve(dir,'w10b15-framebuffer-difference.json'),JSON.stringify(result,null,2));
console.log('T21_W10B15_NATIVE_CPU_FRAMEBUFFER',JSON.stringify(result));
if(result.status!=='PASS_NATIVE_CPU_VISIBLE_RESPAWN_PIXELS')
 fail('VISIBILITY_HOLD',result);
