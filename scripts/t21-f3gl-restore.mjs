/**
 * T21 locally restored optical Temple01 stage: F3G/F3I/F3K/F3L only.
 * Raw original OBJ, MTL and textures stay on this machine; never commit,
 * push, publish, or treat a visible face as an original gameplay collider.
 * Opt-in from PLAY_ORIGINAL_STAGE_WINDOWS.cmd, never the normal launcher.
 */
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdtemp,mkdir,rm,rename,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {convertF3gOriginal,PINNED_TEMPLE01_SHA256}
 from './t21-f3g-source-pack.mjs';
import {convertF3iSceneInventory} from './t21-f3i-scene-inventory.mjs';
import {convertF3lOriginal,F3L_KITRIX_COMMIT}
 from './t21-f3l-textured-source.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const PUBLIC=join(ROOT,'public');
const DEST=join(PUBLIC,'t21-f3g-source');
const OBJ_BYTES=43263289;
const UPSTREAM='kirakira-dev/KiTrix';
const RAW='https://raw.githubusercontent.com/'+UPSTREAM+'/'+F3L_KITRIX_COMMIT+
 '/stages/Vss_Temple01/';
const OBJ_URL='https://media.githubusercontent.com/media/'+UPSTREAM+
 '/main/stages/Vss_Temple01/Vss_Temple01.obj';
const SHA=(data)=>createHash('sha256').update(data).digest('hex');
const exists=async p=>{try{await stat(p);return true;}catch(e){
 if(e?.code==='ENOENT')return false;throw e;}};
const exactFile=async(base,name,bytes,hash)=>{
 if(!/^[A-Za-z0-9_.-]{1,128}$/.test(name)||!
  Number.isSafeInteger(bytes)||bytes<1||bytes>200000000||
  !/^[a-f0-9]{64}$/.test(hash))
  throw Error('T21_LOCAL_ORIGINAL_UNTRUSTED_FILE_METADATA_'+name);
 const buf=await readFile(join(base,name));
 if(buf.byteLength!==bytes||SHA(buf)!==hash)
  throw Error('T21_LOCAL_ORIGINAL_ASSET_MISMATCH_'+name);
 return buf;
};

/** Read-only manifest gate: no geometry, paint, nav or actor elevation. */
export function t21OriginalOpticalManifestsValid(flat,uv,environment,gallery){
 return !!flat&&flat.schema==='T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1'&&
  flat.sourceSHA256===PINNED_TEMPLE01_SHA256&&
  flat.verifiedAgainstPinnedSource===true&&
  flat.includedOriginalTriangles===57578&&
  flat.stagePlayableAuthority==='NONE'&&
  flat.stageCollisionSolidsAdded===0&&flat.stagePaintSurfacesAdded===0&&
  flat.navigationLinksAdded===0&&flat.scoreableSurfacesAdded===0&&
  flat.inferredFloorOrRouteAdded===0&&flat.productionAuthorization===false&&
  Array.isArray(flat.groups)&&flat.groups.length===7&&
  !!uv&&uv.schema==='T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1'&&
  uv.sourceSHA256===PINNED_TEMPLE01_SHA256&&
  uv.sourceRepositoryCommit===F3L_KITRIX_COMMIT&&
  uv.verifiedAgainstPinnedSource===true&&
  uv.totalTriangles===57578&&uv.materials?.length===54&&
  uv.textureFiles?.length>=8&&uv.textureFiles?.length<=20&&
  uv.textures?.length===uv.textureFiles.length&&
  uv.stagePlayableAuthority==='NONE'&&uv.physicsSolidsAdded===0&&
  uv.navigationLinksAdded===0&&uv.scoreableSurfacesAdded===0&&
  uv.actorMatricesRecovered===false&&uv.productionAuthorization===false&&
  !!environment&&environment.schema==='T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1'&&
  environment.sourceSHA256===PINNED_TEMPLE01_SHA256&&
  environment.actorPlacementRecovered===false&&
  environment.stageCollisionSolidsAdded===0&&
  environment.stagePlayableAuthority==='NONE'&&
  !!gallery&&gallery.schema==='T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1'&&
  gallery.sourceSHA256===PINNED_TEMPLE01_SHA256&&
  gallery.stagePlayableAuthority==='NONE'&&
  gallery.actorPlacementRecovered===false&&
  gallery.stageCollisionSolidsAdded===0&&
  gallery.productionAuthorization===false;
}

async function verifyLocalPack(dir){
 const [flat,uv,environment,gallery]=await Promise.all([
  'manifest.json','f3l-original-textured.json',
  'f3i-environment.json','f3k-family-gallery.json'
 ].map(async n=>JSON.parse(await readFile(join(dir,n),'utf8'))));
 if(!t21OriginalOpticalManifestsValid(flat,uv,environment,gallery))
  throw Error('T21_LOCAL_ORIGINAL_SOURCE_AUTHORITY_OR_MANIFEST_INVALID');
 const fileEntries=[
  ...flat.groups.map(x=>({file:x.file,bytes:x.bytes,sha256:x.sha256})),
  ...uv.materials,
  ...environment.previewBin?[environment.previewBin]:[],
  ...gallery.components
 ];
 for(const f of fileEntries)await exactFile(dir,f.file,f.bytes,f.sha256);
 const names=new Set();
 for(const x of uv.textures){
  if(!uv.textureFiles.includes(x.file)||names.has(x.file)||
     !/^[A-Za-z0-9_.-]+_Alb\.png$/.test(x.file))
   throw Error('T21_LOCAL_ORIGINAL_UNTRUSTED_TEXTURE');
  names.add(x.file);
  const png=await exactFile(join(dir,'f3l-textures'),x.file,x.bytes,x.sha256);
  if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
   throw Error('T21_LOCAL_ORIGINAL_NOT_PNG_'+x.file);
 }
 if(names.size!==uv.textureFiles.length||
    uv.textureFiles.some(x=>!names.has(x)))
  throw Error('T21_LOCAL_ORIGINAL_TEXTURE_COVERAGE_INVALID');
 return {triangles:uv.totalTriangles,materials:uv.materials.length,
  textures:names.size,stagePlayableAuthority:'NONE',collisionSolidsAdded:0};
}
async function download(url,maxBytes){
 const res=await fetch(url,{headers:{
  'User-Agent':'browser-ink-tps-local-source-restore'},
  signal:AbortSignal.timeout(160000),redirect:'follow'});
 if(!res.ok||!res.body)
  throw Error('T21_LOCAL_ORIGINAL_UPSTREAM_HTTP_'+res.status);
 const size=Number(res.headers.get('content-length'));
 if(Number.isFinite(size)&&size>maxBytes)
  throw Error('T21_LOCAL_ORIGINAL_TOO_LARGE_HEADER');
 const chunks=[];let length=0;
 for await(const chunk of res.body){
  const buf=Buffer.from(chunk);
  length+=buf.byteLength;
  if(length>maxBytes)throw Error('T21_LOCAL_ORIGINAL_TOO_LARGE_BODY');
  chunks.push(buf);
 }
 return Buffer.concat(chunks,length);
}

export async function restoreLocalOriginalOptics(){
 if(await exists(DEST)){
  const proven=await verifyLocalPack(DEST);
  console.log('T21_ORIGINAL_REVIEW_REUSING_VERIFIED_LOCAL_PACK',
   JSON.stringify(proven));
  return proven;
 }
 await mkdir(PUBLIC,{recursive:true});
 let temp=null,staging=null;
 try{
  temp=await mkdtemp(join(tmpdir(),'t21-original-optical-'));
  staging=await mkdtemp(join(PUBLIC,'.t21-stage-'));
  const obj=join(temp,'Vss_Temple01.obj');
  const orig=await download(OBJ_URL,OBJ_BYTES);
  if(orig.length!==OBJ_BYTES||SHA(orig)!==PINNED_TEMPLE01_SHA256)
   throw Error('T21_ORIGINAL_43MB_OBJ_SHA256_NOT_PINNED');
  await writeFile(obj,orig); // OS TEMP only; deleted even if conversion fails.
  const mtl=join(temp,'Vss_Temple01.mtl');
  await writeFile(mtl,await download(RAW+'Vss_Temple01.mtl',250000));
  const flat=await convertF3gOriginal({input:obj,output:staging});
  const env=await convertF3iSceneInventory({input:obj,output:staging});
  const uv=await convertF3lOriginal({input:obj,mtl,output:staging});
  if(flat.includedOriginalTriangles!==57578||
     env.actorPlacementRecovered!==false||uv.totalTriangles!==57578)
   throw Error('T21_ORIGINAL_RESTORED_SOURCE_PARITY_FAIL');
  await mkdir(join(staging,'f3l-textures'),{recursive:true});
  const textures=[];
  // Bounded sequential download from immutable upstream commit. The source
  // file stays local; no artifact or original asset goes to GitHub.
  for(const name of uv.textureFiles){
   if(!/^[A-Za-z0-9_.-]+_Alb\.png$/.test(name))
    throw Error('T21_ORIGINAL_UNTRUSTED_TEXTURE_FILENAME');
   const data=await download(RAW+'textures/'+name,10000000);
   if(data.length<60||
      data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
    throw Error('T21_ORIGINAL_PINNED_TEXTURE_INVALID_'+name);
   await writeFile(join(staging,'f3l-textures',name),data);
   textures.push({file:name,bytes:data.length,sha256:SHA(data)});
  }
  await writeFile(join(staging,'f3l-original-textured.json'),
   JSON.stringify({...uv,textures},null,2)+'\n');
  const result=await verifyLocalPack(staging);
  if(await exists(DEST))throw Error('T21_ORIGINAL_TARGET_APPEARED_NO_OVERWRITE');
  await rename(staging,DEST); // Same filesystem; no partially installed pack.
  staging=null;
  console.log('T21_ORIGINAL_PINNED_UV_RESTORED_LOCAL_ONLY',
   JSON.stringify({...result,sourceSha256:PINNED_TEMPLE01_SHA256}));
  return result;
 }finally{
  if(temp)await rm(temp,{recursive:true,force:true});
  if(staging)await rm(staging,{recursive:true,force:true});
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 restoreLocalOriginalOptics().catch(e=>{
  console.error('T21_ORIGINAL_RESTORE_HOLD_NO_SOURCE_PROMOTION',String(e));
  process.exitCode=1;
 });
}
