import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {b303DecodeRgbPng,b303OwnedInkRasterAudit} from './t21-b303-native-ink-pixel-attribution.mjs';
// Tiny synthetic *decoder fixture*; never an evidence screenshot or art proof.
function fixture(width,height,point){
 const png=[Buffer.from([137,80,78,71,13,10,26,10])];
 const chunk=(tag,data)=>Buffer.concat([Buffer.from([(data.length>>>24)&255,(data.length>>>16)&255,(data.length>>>8)&255,data.length&255]),Buffer.from(tag),data,Buffer.alloc(4)]);
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=2;
 png.push(chunk('IHDR',ihdr));
 const rows=Buffer.alloc((width*3+1)*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const p=y*(width*3+1)+1+x*3;
  if(point&&x===point[0]&&y===point[1])rows[p]=160;
 }
 png.push(chunk('IDAT',deflateSync(rows)));png.push(chunk('IEND',Buffer.alloc(0)));
 return Buffer.concat(png);
}
test('B303 rejects invalid source and performs exact 8-bit PNG RGB decoding',()=>{
 assert.throws(()=>b303DecodeRgbPng(Buffer.from('not png')),/NOT_REAL_PNG/);
 const im=b303DecodeRgbPng(fixture(1600,900,[812,463]));
 assert.equal(im.width,1600);assert.equal(im.height,900);
 assert.equal(im.rgb[(463*1600+812)*3],160);
});
test('B303 uses real projected sample coordinates and rejects altered A2',()=>{
 const a=fixture(1600,900),b=fixture(1600,900,[812,463]);
 const r=b303OwnedInkRasterAudit(a,b,b,a,[{screenPx:[812,463,10]}]);
 assert.equal(r.candidateStats[0].changedPixels,1);
 assert.equal(r.candidateStats[0].ownerProjectionCentersChanged,1);
 assert.equal(r.candidateStats[0].sparseStageWideImpact,true);
 assert.throws(()=>b303OwnedInkRasterAudit(a,b,b,b,[{screenPx:[812,463]}]),/RESTORE_FAILURE/);
 assert.throws(()=>b303OwnedInkRasterAudit(a,b,b,a,[]),/MISSING_GENUINE/);
});
