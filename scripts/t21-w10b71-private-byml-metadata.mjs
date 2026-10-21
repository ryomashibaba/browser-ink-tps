/**
 * W10-B71 — bounded local-only raw BYML metadata decoding.
 * User-owned Banc input is NEVER copied or uploaded. No actor positions,
 * original layer names, raw binary data or private GUIDs leave the process.
 * Unsupported variants (v7 hashed dictionaries, external zstd dictionaries)
 * fail closed. Decoding itself NEVER proves Nintendo source authenticity.
 */
import {zstdDecompressSync} from 'node:zlib';
export const B71_MAX_DECOMPRESSED_BYTES=16*1024*1024;
const utf8=new TextDecoder('utf-8',{fatal:true});
const fail=reason=>{throw Error('B71_'+reason);};
function within(p,n,bytes,min=0){
 if(!Number.isSafeInteger(p)||!Number.isSafeInteger(n)||
  p<min||n<0||p>bytes.length||n>bytes.length-p)
  fail('INVALID_BINARY_BOUNDS');
}
export function readB71BymlData(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<16||
  bytes.length>B71_MAX_DECOMPRESSED_BYTES)
  fail('UNSUPPORTED_FILE_LENGTH');
 const magic=bytes.toString('ascii',0,2);
 if(magic!=='YB'&&magic!=='BY')fail('NOT_BYML');
 const little=magic==='YB';
 const u32=p=>{within(p,4,bytes);return little?
  bytes.readUInt32LE(p):bytes.readUInt32BE(p);};
 const s32=p=>{within(p,4,bytes);return little?
  bytes.readInt32LE(p):bytes.readInt32BE(p);};
 const f32=p=>{within(p,4,bytes);return little?
  bytes.readFloatLE(p):bytes.readFloatBE(p);};
 const u64=p=>{within(p,8,bytes);return little?
  bytes.readBigUInt64LE(p):bytes.readBigUInt64BE(p);};
 const s64=p=>{within(p,8,bytes);return little?
  bytes.readBigInt64LE(p):bytes.readBigInt64BE(p);};
 const f64=p=>{within(p,8,bytes);return little?
  bytes.readDoubleLE(p):bytes.readDoubleBE(p);};
 const num24=p=>{within(p,3,bytes);return little?
  bytes[p]+(bytes[p+1]<<8)+(bytes[p+2]<<16):
  (bytes[p]<<16)+(bytes[p+1]<<8)+bytes[p+2];};
 const version=little?bytes.readUInt16LE(2):bytes.readUInt16BE(2);
 if(version<2||version>7)fail('UNSUPPORTED_VERSION');
 const strings=p=>{
  if(p===0)return [];
  within(p,4,bytes,16);
  if(bytes[p]!==0xc2)fail('NOT_BYML_STRING_TABLE');
  const n=num24(p+1);
  if(n>50000)fail('TOO_MANY_STRINGS');
  within(p+4,4*(n+1),bytes);
  let prev=4+4*(n+1);
  const list=[];
  for(let i=0;i<n;i++){
   const a=u32(p+4+4*i),b=u32(p+8+4*i);
   if(a<prev||b<=a||b-a>4096)fail('INVALID_STRING_ENTRY');
   within(p+a,b-a,bytes);
   const last=bytes[p+b-1]===0?b-1:b;
   const value=utf8.decode(bytes.subarray(p+a,p+last));
   if(value.length>4096||value.includes('\0'))
    fail('INVALID_STRING_DATA');
   list.push(value);prev=b;
  }
  return list;
 };
 const names=strings(u32(4)),values=strings(u32(8));
 let budget=100000;
 const seen=new Set();
 const safeInt=val=>(val>=BigInt(Number.MIN_SAFE_INTEGER)&&
  val<=BigInt(Number.MAX_SAFE_INTEGER))?Number(val):val.toString();
 function value(kind,at,depth){
  if(depth>32||--budget<0)fail('TREE_DEPTH_OR_COUNT_LIMIT');
  const v=u32(at);
  if(kind===0xa0){
   if(values[v]===undefined)fail('INVALID_STRING_INDEX');
   return values[v];
  }
  // B74: Nintendo BYML 0xA1/0xA2 are offset-backed private blobs.
  // Bound-check in memory, but NEVER decode or reflect their contents:
  // unrelated embedded resources must not conceal valid Actor rows.
  // Return a constant sentinel; neither length nor bytes are exposed.
  if(kind===0xa1||kind===0xa2){
   if(version<(kind===0xa1?4:5))
    fail('BINARY_VALUE_BEFORE_SUPPORTED_BYML_VERSION');
   within(v,kind===0xa1?4:8,bytes,16);
   const size=u32(v);
   if(size>1024*1024)fail('OPAQUE_BINARY_NODE_TOO_LARGE');
   if(kind===0xa2&&u32(v+4)!==0x1000)
    fail('UNSUPPORTED_EMBEDDED_FILE_ALIGNMENT');
   within(v+(kind===0xa1?4:8),size,bytes,16);
   // An opaque payload can never impersonate an original Actor ID.
   return null;
  }
  if(kind===0xd0)return v!==0;
  if(kind===0xd1)return s32(at);
  if(kind===0xd2){
   const f=f32(at);if(!Number.isFinite(f))fail('NONFINITE_BYML_FLOAT');
   return f;
  }
  if(kind===0xd3)return v;
  if(kind===0xff)return null;
  if(kind===0xd4)return safeInt(s64(v));
  if(kind===0xd5)return safeInt(u64(v));
  if(kind===0xd6){
   const f=f64(v);if(!Number.isFinite(f))fail('NONFINITE_BYML_DOUBLE');
   return f;
  }
  if(kind===0xc0||kind===0xc1)return node(v,depth+1);
  fail('UNSUPPORTED_BYML_TYPE_'+kind.toString(16));
 }
 function node(p,depth){
  if(depth>32||--budget<0)fail('TREE_DEPTH_OR_COUNT_LIMIT');
  within(p,4,bytes,16);
  if(seen.has(p))fail('CYCLIC_SOURCE_NODE');
  seen.add(p);
  try{
   const t=bytes[p],n=num24(p+1);
   if(n>20000)fail('TOO_MANY_NODES');
   if(t===0xc0){
    const base=p+4+Math.ceil(n/4)*4;
    within(p+4,n,bytes);within(base,n*4,bytes);
    return Array.from({length:n},(_,i)=>
     value(bytes[p+4+i],base+i*4,depth));
   }
   if(t===0xc1){
    within(p+4,n*8,bytes);
    const dict=Object.create(null);
    for(let i=0;i<n;i++){
     const pos=p+4+i*8,k=num24(pos),key=names[k];
     if(key===undefined||key.length>150)fail('BAD_KEY_INDEX');
     if(Object.hasOwn(dict,key))fail('DUPLICATE_SOURCE_KEY');
     dict[key]=value(bytes[pos+3],pos+4,depth);
    }
    return dict;
   }
   // v7 hashed dictionaries need independent provenance; never guess.
   fail('UNSUPPORTED_CONTAINER_'+t.toString(16));
  }finally{seen.delete(p);}
 }
 const root=u32(12);
 if(root===0)fail('EMPTY_BYML_NO_ACTORS');
 const data=node(root,0);
 if(!data||Array.isArray(data)||typeof data!=='object')
  fail('ROOT_NOT_DICTIONARY');
 return {data,binaryVersion:version,littleEndian:little};
}
/**
 * B73: A private raw ZSTD dictionary is allowed only when the OWNER
 * already placed it locally. No dictionary may be serialized, uploaded
 * or chosen from external sources; this never certifies stage provenance.
 */
export function decodeB71PrivateBancBuffer(bytes,fileName='',dictionary=null){
 if(!Buffer.isBuffer(bytes)||bytes.length>B71_MAX_DECOMPRESSED_BYTES)
  fail('INPUT_TOO_LARGE');
 if(dictionary!==null&&(!Buffer.isBuffer(dictionary)||
    dictionary.length===0||dictionary.length>512*1024))
  fail('PRIVATE_DICTIONARY_INVALID_LENGTH');
 let data=bytes,compression='NONE';
 if(fileName.toLowerCase().endsWith('.zs')){
  if(bytes.length<4||bytes.readUInt32LE(0)!==0xfd2fb528)
   fail('COMPRESSED_NOT_ZSTD');
  try{
   data=zstdDecompressSync(bytes,{
    maxOutputLength:B71_MAX_DECOMPRESSED_BYTES,
    ...(dictionary?{dictionary}:{}),
    rejectGarbageAfterEnd:true});
  }catch{fail('ZSTD_REQUIRES_DICTIONARY_OR_UNSUPPORTED_FRAME');}
  compression=dictionary?'ZSTD_LOCAL_OWNER_DICTIONARY':
   'ZSTD_LOCAL_NO_DICTIONARY';
 }
 const decoded=readB71BymlData(data);
 return {data:decoded.data,binaryVersion:decoded.binaryVersion,
  binaryEndianness:decoded.littleEndian?'LITTLE':'BIG',
  localCompression:compression};
}
