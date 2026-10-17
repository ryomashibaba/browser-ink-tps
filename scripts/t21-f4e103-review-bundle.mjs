#!/usr/bin/env node
/** Read-only offline validator for F4E103F candidate ZIPs. No extract, upload, or apply.
 * Passing means archive integrity only, NOT permission to publish or import.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const sha=b=>createHash('sha256').update(b).digest('hex');
const crcTable=Array.from({length:256},(_,v)=>{
 let n=v; for(let j=0;j<8;j++)n=(n&1)?0xedb88320^(n>>>1):n>>>1; return n>>>0;
});
const crc=b=>{let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;};
const requireTrue=(x,m)=>{if(!x)throw Error('BUNDLE_REJECTED_'+m);};
function isSafeEntry(x){
 return typeof x==='string' && x.length>0 && !/[\\\x00-\x1f\x7f]/.test(x) &&
 !x.startsWith('/') && !x.endsWith('/') &&
 x.split('/').every(y=>y&&y!=='.'&&y!=='..') &&
 (x==='T21_CANDIDATE_MANIFEST.json'||x==='T21_READ_ME_FIRST.txt'||
  /^candidate-src\/(?:src|scripts)\/.+\.(?:ts|tsx|mts|cts|js|mjs|cjs|css)$/.test(x)||
  /^candidate-src\/(?:package\.json|tsconfig\.json|vite\.config\.ts|index\.html)$/.test(x));
}
/** Strictly verifies the small ZIP/STORED format produced by this project's exporter. */
export function readStoredZip(buffer){
 requireTrue(buffer.length>=22&&buffer.length<=40*1024*1024,'ARCHIVE_LENGTH');
 const end=buffer.length-22;
 requireTrue(buffer.readUInt32LE(end)===0x06054b50,'EOCD');
 const count=buffer.readUInt16LE(end+10),dirBytes=buffer.readUInt32LE(end+12),
       dirStart=buffer.readUInt32LE(end+16);
 requireTrue(count>=3&&count<=2502&&buffer.readUInt16LE(end+8)===count,'ENTRY_COUNT');
 requireTrue(buffer.readUInt16LE(end+20)===0&&dirStart+dirBytes===end,'DIRECTORY_LOCATION');
 const entries=new Map();
 let p=dirStart;
 for(let i=0;i<count;i++){
  requireTrue(p+46<=end&&buffer.readUInt32LE(p)===0x02014b50,'CENTRAL_HEADER');
  const flags=buffer.readUInt16LE(p+8),method=buffer.readUInt16LE(p+10),
    check=buffer.readUInt32LE(p+16),packed=buffer.readUInt32LE(p+20),
    size=buffer.readUInt32LE(p+24),nameSize=buffer.readUInt16LE(p+28),
    extraSize=buffer.readUInt16LE(p+30),commentSize=buffer.readUInt16LE(p+32),
    localOffset=buffer.readUInt32LE(p+42);
  requireTrue(method===0&&packed===size&&(flags===0||flags===0x800),'UNSUPPORTED_ZIP_FORMAT');
  requireTrue(p+46+nameSize+extraSize+commentSize<=end,'CENTRAL_OVERFLOW');
  const name=buffer.subarray(p+46,p+46+nameSize).toString('utf8');
  requireTrue(isSafeEntry(name)&&!entries.has(name),'DUPLICATE_OR_UNSAFE_NAME');
  requireTrue(localOffset+30<=dirStart&&buffer.readUInt32LE(localOffset)===0x04034b50,'LOCAL_HEADER');
  const ln=buffer.readUInt16LE(localOffset+26),lx=buffer.readUInt16LE(localOffset+28);
  const start=localOffset+30+ln+lx;
  requireTrue(start+size<=dirStart,'LOCAL_OVERFLOW');
  requireTrue(buffer.readUInt16LE(localOffset+8)===0&&buffer.readUInt32LE(localOffset+14)===check &&
              buffer.readUInt32LE(localOffset+18)===packed&&buffer.readUInt32LE(localOffset+22)===size,'LOCAL_METADATA');
  requireTrue(buffer.subarray(localOffset+30,localOffset+30+ln).toString('utf8')===name,'LOCAL_NAME_MISMATCH');
  const content=buffer.subarray(start,start+size);
  requireTrue(crc(content)===check,'CRC_MISMATCH');
  entries.set(name,content);
  p+=46+nameSize+extraSize+commentSize;
 }
 requireTrue(p===end,'CENTRAL_TRAILING_DATA');
 return entries;
}
export function inspectCandidateArchive(bytes,{expectedBaseline=null}={}){
 const entries=readStoredZip(bytes);
 const raw=entries.get('T21_CANDIDATE_MANIFEST.json');
 requireTrue(raw&&entries.has('T21_READ_ME_FIRST.txt'),'MANIFEST_MISSING');
 let m;
 try{m=JSON.parse(raw.toString('utf8'));}catch{throw Error('BUNDLE_REJECTED_INVALID_JSON');}
 requireTrue(m?.schema==='t21-f4e103-private-candidate-bundle/v1','SCHEMA');
 requireTrue(m.publicationAuthorized===false&&m.assetRightsCleared===false&&
             m.reviewedByHuman===false&&m.uploadPerformed===false,'UNSAFE_AUTHORITY_CLAIM');
 requireTrue(Array.isArray(m.files)&&m.files.length===entries.size-2,'FILE_COUNT');
 const baseline=m.baselineSha;
 requireTrue(/^[0-9a-f]{40}$/.test(baseline||''),'BASELINE_UNPINNED');
 if(expectedBaseline)requireTrue(baseline===expectedBaseline,'WRONG_BASELINE');
 const seen=new Set();
 for(const f of m.files){
  requireTrue(typeof f.path==='string'&&!seen.has(f.path),'DUPLICATE_FILE');
  seen.add(f.path);
  const b=entries.get('candidate-src/'+f.path);
  requireTrue(b&&b.length===f.bytes&&sha(b)===f.sha256,'SOURCE_HASH_MISMATCH');
  requireTrue(f.change==='NEW'||f.change==='CHANGED_OR_UNVERIFIABLE','UNEXPECTED_CHANGE_KIND');
 }
 return {integrity:'PASS_ARCHIVE_ONLY',fileCount:m.files.length,baselineSha:baseline,
  originalGameVersion:'UNVERIFIED',publicationAuthorization:'NOT_GRANTED',
  localKccVerified:false,scoreablePromotionVerified:false,importDecision:'HOLD_MANUAL_SOURCE_REVIEW'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==3&&process.argv.length!==4)
   throw Error('Usage: node scripts/t21-f4e103-review-bundle.mjs <private-candidate.zip> [expected40CharacterBaselineSHA]');
  const result=inspectCandidateArchive(readFileSync(process.argv[2]),{expectedBaseline:process.argv[3]??null});
  console.log(JSON.stringify(result,null,2));
 }catch(e){console.error(String(e.message||e));process.exitCode=1;}
}
