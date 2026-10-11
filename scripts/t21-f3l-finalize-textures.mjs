/**
 * Finalize F3L hashed textures fetched from pinned KiTrix commit.
 * No original textures are ever checked into source control.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
const base=resolve(process.argv[2]||'public/t21-f3g-source');
const file=join(base,'f3l-original-textured.json');
const m=JSON.parse(readFileSync(file,'utf8'));
if(m.schema!=='T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1'||
 !Array.isArray(m.textureFiles)||m.textureFiles.length>20||
 m.sourceRepositoryCommit!=='0611f51b35c9736ee986fb2218461e2585b7875e')
 throw Error('F3L_MANIFEST_NOT_PINNED');
const known=new Set();
m.textures=m.textureFiles.map(name=>{
 if(!/^[A-Za-z0-9_.-]+_Alb\.png$/.test(name)||known.has(name))
  throw Error('F3L_UNSAFE_LOCAL_ORIGINAL_TEXTURE');
 known.add(name);
 const bytes=readFileSync(join(base,'f3l-textures',name));
 if(bytes.length<60||bytes.length>10000000||
  bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
  throw Error('F3L_BAD_ORIGINAL_PNG');
 return {file:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
});
writeFileSync(file,JSON.stringify(m,null,2)+'\n');
console.log('F3L_TEXTURE_ASSET_HASHES',JSON.stringify({
 count:m.textures.length,totalBytes:m.textures.reduce((n,a)=>n+a.bytes,0),
 sourceSha256:m.sourceSHA256,physicsAuthority:'NONE'}));
