/**
 * F3G owner-side one-command source preparation.
 * Raw asset is downloaded to OS TEMP and deleted after verified conversion.
 * Nothing is committed, pushed, hosted or fetched during ordinary page load.
 */
import {createHash} from 'node:crypto';
import {open,mkdtemp,rm,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {convertF3gOriginal,PINNED_TEMPLE01_SHA256}
 from './t21-f3g-source-pack.mjs';
const SOURCE_URL=
 'https://media.githubusercontent.com/media/kirakira-dev/KiTrix/main/stages/Vss_Temple01/Vss_Temple01.obj';
const EXPECTED_BYTES=43263289;
const output=resolve('public/t21-f3g-source');
let temp;
try{
 temp=await mkdtemp(join(tmpdir(),'t21-f3g-source-'));
 const file=join(temp,'Vss_Temple01.obj');
 const response=await fetch(SOURCE_URL,{
  signal:AbortSignal.timeout(150000),
  redirect:'follow',
  headers:{'User-Agent':'browser-ink-tps-T21-F3G-source-preparer'}
 });
 if(!response.ok||!response.body)
  throw Error('T21_F3G_PUBLIC_ORIGINAL_NOT_AVAILABLE_HTTP_'+response.status);
 const handle=await open(file,'w');
 const h=createHash('sha256');let size=0;
 try{
  for await(const chunk of response.body){
   const bytes=Buffer.from(chunk);
   size+=bytes.byteLength;
   if(size>EXPECTED_BYTES)throw Error('T21_F3G_ORIGINAL_TOO_LARGE');
   h.update(bytes);
   await handle.write(bytes);
  }
 }finally{await handle.close();}
 const digest=h.digest('hex');
 if(size!==EXPECTED_BYTES||digest!==PINNED_TEMPLE01_SHA256)
  throw Error('T21_F3G_ORIGINAL_ASSET_VERIFICATION_FAILED size='+size+' sha256='+digest);
 const manifest=await convertF3gOriginal({input:file,output});
 if(manifest.sourceSHA256!==digest||manifest.stagePlayableAuthority!=='NONE')
  throw Error('T21_F3G_PREPARE_AUTHORITY_INVALID');
 console.log('F3G_READY',JSON.stringify({
  triangles:manifest.includedOriginalTriangles,
  materials:manifest.groups.length,
  output,
  originalSha256:manifest.sourceSHA256,
  gameplayAuthority:'NONE'
 }));
 console.log('Start npm run dev and open ?t21Play=preview&t21FullSource=review');
}catch(error){
 console.error('F3G_PREPARE_FAILED:',String(error));process.exitCode=1;
}finally{
 if(temp)await rm(temp,{recursive:true,force:true});
}
