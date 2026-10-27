import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {verifyB77OriginalSourceAbaRaster,inspectB252OriginalUvRaster} from './t21-w10b77-source-raster-restore.mjs';
const header=Buffer.from([137,80,78,71,13,10,26,10]);
const ch=(type,payload)=>{
 const name=Buffer.from(type),size=Buffer.alloc(4);
 size.writeUInt32BE(payload.length);
 return Buffer.concat([size,name,payload,Buffer.alloc(4)]);
};
function png(w,h,fn){
 const p=Buffer.alloc(13);p.writeUInt32BE(w,0);p.writeUInt32BE(h,4);
 p[8]=8;p[9]=2;
 const scan=Buffer.alloc(h*(1+w*3));
 for(let y=0;y<h;y++){
  const off=y*(1+w*3);scan[off]=0;
  for(let x=0;x<w;x++){
   const rgb=fn(x,y);
   for(let c=0;c<3;c++)scan[off+1+3*x+c]=rgb[c];
  }
 }
 return Buffer.concat([header,ch('IHDR',p),
  ch('IDAT',deflateSync(scan)),ch('IEND',Buffer.alloc(0))]);
}
const blue=()=>[24,68,123];
const w=160,h=90;
const a=png(w,h,blue);
const b=png(w,h,(x,y)=>x>=20&&x<120&&y>=20&&y<70?
 [168,20,198]:blue());
const a2=png(w,h,(x,y)=>x>=141&&x<144&&y===30?
 [24,69,123]:blue());
test('B77 ignores only three 1-level 8bit browser quantization pixels',()=>{
 const r=verifyB77OriginalSourceAbaRaster(a,b,a2);
 assert.equal(r.sourceAppearanceRestored,true);
 assert.equal(r.restore.changedPixels,3);
 assert.equal(r.restore.maxChannelDelta,1);
 assert.ok(r.toggle.changedPixels>=5000);
 assert.equal(r.noInferredOriginal4v4,true);
});
test('B77 fails on real raster appearance differences despite valid png',()=>{
 const altered=png(w,h,(x,y)=>x===0&&y===0?
 [24,70,123]:blue());
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(a,b,altered),
  /SOURCE_A_B_A_RASTER_NOT_RESTORED/);
 const many=png(w,h,(x,y)=>x<10&&y<3?
 [24,69,123]:blue());
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(a,b,many),
  /SOURCE_A_B_A_RASTER_NOT_RESTORED/);
});
test('B77 cannot mistake absent B change for real hologram switch',()=>{
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(a,a,a),
  /SOURCE_A_B_A_RASTER_NOT_RESTORED/);
});
test('B77 strict PNG raster truncation/format safety',()=>{
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(
  Buffer.from('not png'),b,a2),/INVALID_REAL_BROWSER_PNG_HEADER/);
 const wrong=Buffer.from(a);wrong[25]=3;
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(wrong,b,a2),
  /UNSUPPORTED_PNG_PIXEL_FORMAT/);
 const corrupt=Buffer.from(a);corrupt[0]=0;
 assert.throws(()=>verifyB77OriginalSourceAbaRaster(corrupt,b,a2),
  /INVALID_REAL_BROWSER_PNG_HEADER/);
});

test('B252 reports both visible UV differences and absent contrast without inventing paths',()=>{
 const real=inspectB252OriginalUvRaster(a,b,a2);
 assert.equal(real.appearanceRestored,true);
 assert.equal(real.clearlyDifferent,true);
 assert.equal(real.uvVsFlat.changedPixels,5000);
 assert.equal(real.actorInstancesVerified,false);
 assert.equal(real.navigationCertified,false);
 const blank=inspectB252OriginalUvRaster(a,a,a);
 assert.equal(blank.appearanceRestored,true);
 assert.equal(blank.clearlyDifferent,false);
});
