/** B303: real PNG-only audit of original source-owned ink visibility.
 * No stage/gameplay changes; rejects fabricated frame dimensions and lost restoration. */
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const SIG=Buffer.from([137,80,78,71,13,10,26,10]);
export function b303DecodeRgbPng(buf){
 if(!Buffer.isBuffer(buf)||!buf.subarray(0,8).equals(SIG))
  throw Error('B303_NOT_REAL_PNG');
 let off=8,width=0,height=0,channels=0,depth=0,interlace=1,idat=[];
 while(off+12<=buf.length){
  const n=buf.readUInt32BE(off),end=off+12+n;
  if(end>buf.length)throw Error('B303_BAD_PNG_CHUNK');
  const type=buf.toString('ascii',off+4,off+8),v=buf.subarray(off+8,off+8+n);
  if(type==='IHDR'){
   width=v.readUInt32BE(0);height=v.readUInt32BE(4);depth=v[8];
   channels=v[9]===2?3:v[9]===6?4:0;interlace=v[12];
  }else if(type==='IDAT')idat.push(v);
  off=end;
  if(type==='IEND')break;
 }
 if(!width||!height||width>4096||height>4096||depth!==8||
    ![3,4].includes(channels)||interlace!==0||!idat.length)
  throw Error('B303_UNSUPPORTED_OR_UNTRUSTED_PNG');
 const stride=width*channels,raw=inflateSync(Buffer.concat(idat));
 if(raw.length!==(stride+1)*height)throw Error('B303_CORRUPT_PNG_ROWS');
 const rgb=Buffer.alloc(width*height*3);
 let prev=Buffer.alloc(stride),pos=0;
 for(let y=0;y<height;y++){
  const filter=raw[pos++],row=Buffer.alloc(stride);
  for(let k=0;k<stride;k++){
   const a=k>=channels?row[k-channels]:0,b=prev[k],c=k>=channels?prev[k-channels]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   else if(filter===2)predictor=b;
   else if(filter===3)predictor=Math.floor((a+b)/2);
   else if(filter===4){
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   }else if(filter!==0)throw Error('B303_UNSUPPORTED_PNG_FILTER');
   row[k]=(raw[pos++]+predictor)&255;
  }
  for(let x=0;x<width;x++){
   let i=(y*width+x)*3,j=x*channels;
   rgb[i]=row[j];rgb[i+1]=row[j+1];rgb[i+2]=row[j+2];
  }
  prev=row;
 }
 return {width,height,rgb};
}
export function b303OwnedInkRasterAudit(original,deep,bright,restored,samples){
 const pngs=[original,deep,bright,restored].map(b303DecodeRgbPng);
 const [{width,height,rgb}]=pngs;
 if(!pngs.every(p=>p.width===width&&p.height===height)||
    width!==1600||height!==900)
  throw Error('B303_NATIVE_FRAME_DIMENSION_MISMATCH');
 const sha=b=>createHash('sha256').update(b).digest('hex');
 if(sha(original)!==sha(restored)||!rgb.equals(pngs[3].rgb))
  throw Error('B303_ORIGINAL_PIXEL_OR_FILE_RESTORE_FAILURE');
 if(!Array.isArray(samples)||samples.length===0||samples.some(s=>
   !Array.isArray(s.screenPx)||s.screenPx.length<2||
   !s.screenPx.slice(0,2).every(Number.isFinite)))
  throw Error('B303_MISSING_GENUINE_SOURCE_OWNER_PROJECTIONS');
 const results=[];
 for(const k of [1,2]){
  const other=pngs[k].rgb,mask=new Uint8Array(width*height);
  let changed=0,diffTotal=0,x0=width,y0=height,x1=-1,y1=-1;
  for(let i=0;i<width*height;i++){
   const p=i*3;
   let d=Math.abs(rgb[p]-other[p])+Math.abs(rgb[p+1]-other[p+1])+
    Math.abs(rgb[p+2]-other[p+2]);
   if(d){mask[i]=1;changed++;diffTotal+=d;const x=i%width,y=Math.floor(i/width);
    if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}
  }
  const nearCount=radius=>samples.filter(s=>{
   const [sx,sy]=s.screenPx,x=Math.round(sx),y=Math.round(sy);
   for(let yy=Math.max(0,y-radius);yy<=Math.min(height-1,y+radius);yy++)
    for(let xx=Math.max(0,x-radius);xx<=Math.min(width-1,x+radius);xx++)
     if(mask[yy*width+xx])return true;
   return false;
  }).length;
  results.push({candidate:k===1?'DEEP':'BRIGHT',
   changedPixels:changed,changedPercent:changed/(width*height)*100,
   meanAbsRgbDelta:diffTotal/(width*height*3),
   pixelBoundingBox:changed?[x0,y0,x1,y1]:null,
   ownerProjectionCentersChanged:nearCount(0),
   ownerProjectionsWithin5pxChanged:nearCount(5),
   sparseStageWideImpact:changed/(width*height)<.01});
 }
 return {schema:'B303_TRUE_NATIVE_OWNER_PROJECTED_TEAM_A_RASTER_AUDIT',
  source:'25/17/26/0',frame:[width,height],actualOwnerProjectedSamples:samples.length,
  originalScreenshotSha256:sha(original),exactRestoration:true,
  candidateStats:results,gameplayOrSourceEdited:false,artAccepted:false,
  official4v4Certified:false,productionAuthorized:false};
}
