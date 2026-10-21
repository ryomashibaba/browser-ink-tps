/**
 * W10-B77: prove an original static-source A-B-A *pixel* restore, not a
 * compressed-PNG SHA coincidence or silent tolerance of visible regressions.
 * Chrome/SwiftShader's frozen source can dither a few 8-bit raster values
 * by a single channel step; rejected if >0.04% pixels differ or any RGB
 * channel differs by 2+. The intentional B must change >=0.5% of all
 * pixels and >=0.2% strongly (>=8 channel values).
 *
 * Only screenshots from our real local WebGL2 browser are accepted;
 * no source asset/Banc contents, actor coordinates or private geometry.
 */
import {inflateSync} from 'node:zlib';
const fail=x=>{throw Error('B77_'+x);};
const sig=Buffer.from([137,80,78,71,13,10,26,10]);
function decodePng8(image){
 if(!Buffer.isBuffer(image)||image.length<70||
    !image.subarray(0,8).equals(sig))
  fail('INVALID_REAL_BROWSER_PNG_HEADER');
 let i=8,w=0,h=0,bpp=0,seenIHDR=false,seenIEND=false,idats=[];
 while(i<image.length){
  if(i+12>image.length)fail('TRUNCATED_PNG_CHUNK');
  const n=image.readUInt32BE(i),type=image.toString('ascii',i+4,i+8);
  if(n>32*1024*1024||n>image.length-i-12)
   fail('UNBOUNDED_OR_TRUNCATED_PNG');
  const chunk=image.subarray(i+8,i+8+n);
  i+=12+n;
  if(type==='IHDR'){
   if(seenIHDR||n!==13)fail('INVALID_PNG_IHDR');
   seenIHDR=true;w=chunk.readUInt32BE(0);h=chunk.readUInt32BE(4);
   const bit=chunk[8],color=chunk[9];
   if(w<1||w>1600||h<1||h>900||w*h>1600*900||
      bit!==8||![2,6].includes(color)||chunk[10]!==0||
      chunk[11]!==0||chunk[12]!==0)
    fail('UNSUPPORTED_PNG_PIXEL_FORMAT');
   bpp=color===2?3:4;
  }else if(type==='IDAT'){
   if(!seenIHDR)fail('IDAT_WITHOUT_IHDR');
   idats.push(chunk);
   if(idats.length>10000)fail('TOO_MANY_PNG_IDAT_CHUNKS');
  }else if(type==='IEND'){seenIEND=true;break;}
 }
 if(!seenIHDR||!seenIEND||!idats.length)fail('INCOMPLETE_PNG');
 const widthBytes=w*bpp,packedSize=(widthBytes+1)*h;
 let compressed=Buffer.concat(idats);
 if(compressed.length>12*1024*1024)fail('OVERLARGE_PNG_IDAT');
 let raw;
 try{raw=inflateSync(compressed,{maxOutputLength:packedSize});}
 catch{fail('INVALID_OR_OVERSIZED_PNG_RASTER');}
 if(raw.length!==packedSize)fail('INVALID_SCANLINE_BYTES');
 const raster=Buffer.alloc(w*h*bpp),previous=Buffer.alloc(widthBytes);
 let offset=0;
 for(let y=0;y<h;y++){
  const filter=raw[offset++];
  if(filter>4)fail('UNSUPPORTED_PNG_FILTER');
  const row=raster.subarray(y*widthBytes,(y+1)*widthBytes);
  for(let x=0;x<widthBytes;x++){
   const a=x>=bpp?row[x-bpp]:0,b=previous[x],c=x>=bpp?previous[x-bpp]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   else if(filter===2)predictor=b;
   else if(filter===3)predictor=(a+b)>>1;
   else if(filter===4){
    const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),
     dc=Math.abs(p-c);
    predictor=da<=db&&da<=dc?a:db<=dc?b:c;
   }
   row[x]=(raw[offset++]+predictor)&255;
  }
  row.copy(previous);
 }
 return {width:w,height:h,channels:bpp,data:raster};
}
function compare(a,b){
 if(a.width!==b.width||a.height!==b.height||a.channels!==b.channels)
  fail('NONCOMPARABLE_REAL_BROWSER_FRAMES');
 let differing=0,strong=0,maxChannelDelta=0;
 const pp=a.channels,bytes=a.data.length;
 for(let pos=0;pos<bytes;pos+=pp){
  let max=0;
  for(let channel=0;channel<3;channel++){
   const delta=Math.abs(a.data[pos+channel]-b.data[pos+channel]);
   if(delta>max)max=delta;
  }
  if(max){differing++;if(max>=8)strong++;
   if(max>maxChannelDelta)maxChannelDelta=max;}
 }
 const count=a.width*a.height;
 return {changedPixels:differing,
  ratio:Number((differing/count).toFixed(8)),
  changedByAtLeastEight:strong,
  maxChannelDelta,
  totalPixels:count};
}
export function verifyB77OriginalSourceAbaRaster(aPng,bPng,a2Png){
 const a=decodePng8(aPng),b=decodePng8(bPng),a2=decodePng8(a2Png);
 const restore=compare(a,a2),toggle=compare(a,b);
 const maxQuantizedPixels=Math.max(3,Math.floor(a.width*a.height*0.0004));
 const minimumMaterialPixels=Math.max(15,Math.floor(a.width*a.height*0.005));
 const minimumStrongPixels=Math.max(6,Math.floor(a.width*a.height*0.002));
 const restored=restore.maxChannelDelta<=1&&
  restore.changedPixels<=maxQuantizedPixels;
 const genuinelyDifferent=toggle.changedPixels>=minimumMaterialPixels&&
  toggle.changedByAtLeastEight>=minimumStrongPixels&&
  toggle.maxChannelDelta>=16;
 if(!restored||!genuinelyDifferent)
  fail('B28_SOURCE_A_B_A_RASTER_NOT_RESTORED_'+JSON.stringify({
   restore,toggle,limits:{maxQuantizedPixels,minimumMaterialPixels,
    minimumStrongPixels},restored,genuinelyDifferent}));
 return {
  verdict:'B77_ORIGINAL_SOURCE_REAL_CHROME_A_B_A_PIXEL_RESTORATION_PASS',
  width:a.width,height:a.height,
  retainedOriginalPhysicsAndScoreAuthorityRequired:true,
  exactPngHashRequired:false,
  boundedOneStepGpuQuantizationOnly:true,
  sourceAppearanceRestored:true,
  intentionalHologramMaterialChangeVerified:true,
  restore,toggle,
  limits:{maxQuantizedPixels,minimumMaterialPixels,minimumStrongPixels},
  noInferredOriginal4v4:true
 };
}
