#!/usr/bin/env node
/**
 * F4E103F local candidate bundle, opt-in/offline only.
 * Writes a private, review-required ZIP. NEVER uploads or publishes anything.
 * Only includes source files judged low-risk by preliminary heuristic scan.
 * THIS IS NOT copyright, authenticity or secret clearance.
 */
import {createHash} from 'node:crypto';
import {existsSync, lstatSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {scanSource} from './t21-f4e103-source-intake.mjs';

const MAX_BUNDLE_BYTES=25*1024*1024;
const MAX_FILE_COUNT=2500;
const sha = b => createHash('sha256').update(b).digest('hex');
const contained = (dir, candidate) => candidate===dir || candidate.startsWith(dir+sep);
const TABLE=Array.from({length:256},(_,n)=>{
  let c=n;
  for(let i=0;i<8;i++) c=(c&1)?0xEDB88320^(c>>>1):c>>>1;
  return c>>>0;
});
function crc32(data) {
  let c=0xFFFFFFFF;
  for(const byte of data) c=TABLE[(c^byte)&255]^(c>>>8);
  return (c^0xFFFFFFFF)>>>0;
}
function zipStored(entries) {
  const locals=[],central=[]; let offset=0;
  for(const {name,data} of entries) {
    if(!/^[a-zA-Z0-9_.\-/]+$/.test(name) || name.startsWith('/') ||
       name.split('/').some(x=>x==='..'||x==='')) throw Error('UNSAFE_ZIP_ENTRY');
    const filename=Buffer.from(name,'utf8');
    if(filename.length>0xFFFF) throw Error('ZIP_FILENAME_TOO_LONG');
    const crc=crc32(data),len=data.length;
    const local=Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50,0);
    local.writeUInt16LE(20,4); // version needed
    local.writeUInt16LE(0,8); // uncompressed
    local.writeUInt16LE(0x21,12); // 1980-01-01
    local.writeUInt32LE(crc,14);
    local.writeUInt32LE(len,18);
    local.writeUInt32LE(len,22);
    local.writeUInt16LE(filename.length,26);
    const centralHeader=Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50,0);
    centralHeader.writeUInt16LE(20,4);
    centralHeader.writeUInt16LE(20,6);
    centralHeader.writeUInt16LE(0,10);
    centralHeader.writeUInt16LE(0x21,14);
    centralHeader.writeUInt32LE(crc,16);
    centralHeader.writeUInt32LE(len,20);
    centralHeader.writeUInt32LE(len,24);
    centralHeader.writeUInt16LE(filename.length,28);
    centralHeader.writeUInt32LE(offset,42);
    locals.push(local,filename,data);
    central.push(centralHeader,filename);
    offset+=local.length+filename.length+data.length;
  }
  const directory=Buffer.concat(central);
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(entries.length,8);
  end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(directory.length,12);
  end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,directory,end]);
}
export function buildCandidateZip(source, baseline) {
  const original=resolve(source),base=resolve(baseline);
  if(original===base) throw Error('SOURCE_AND_BASELINE_MUST_DIFFER');
  const report=scanSource(original,base);
  if(!report.windowsLauncherPresent || !report.restoreLauncherPresent)
    throw Error('LOCAL_F4E103F_LAUNCHERS_NOT_BOTH_PRESENT');
  const candidates=report.files.filter(f=>
    (f.change==='NEW'||f.change==='CHANGED_OR_UNVERIFIABLE') &&
    f.review==='MANUAL_CODE_REVIEW' && /^[0-9a-f]{64}$/.test(f.sha256||''));
  if(candidates.length>MAX_FILE_COUNT) throw Error('TOO_MANY_CANDIDATES');
  const entries=[], manifestFiles=[]; let total=0;
  for(const file of candidates) {
    const path=join(original,...file.path.split('/'));
    if(!lstatSync(path).isFile()) throw Error('NONREGULAR_CANDIDATE');
    const bytes=readFileSync(path);
    if(bytes.length!==file.bytes || sha(bytes)!==file.sha256)
      throw Error('SOURCE_CHANGED_DURING_EXPORT');
    total+=bytes.length;
    if(total>MAX_BUNDLE_BYTES) throw Error('BUNDLE_EXCEEDS_25_MIB');
    entries.push({name:'candidate-src/'+file.path,data:bytes});
    manifestFiles.push({path:file.path,bytes:file.bytes,sha256:file.sha256,change:file.change});
  }
  if(entries.length===0) throw Error('NO_LOW_RISK_CHANGED_FILES_TO_REVIEW');
  const manifest={
    schema:'t21-f4e103-private-candidate-bundle/v1',
    localVersion:'UNVERIFIED_F4E103F',
    publicationAuthorized:false,
    assetRightsCleared:false,
    originalGameFilesIncluded:false,
    uploadPerformed:false,
    reviewedByHuman:false,
    baselineSha:'UNVERIFIED_LOCAL_CHECKOUT',
    frozenCountsUnchanged:'NOT_ASSESSED',
    files:manifestFiles,
    excludedCandidateCount:report.files.filter(f=>
      ['NEW','CHANGED_OR_UNVERIFIABLE'].includes(f.change) &&
      f.review!=='MANUAL_CODE_REVIEW').length
  };
  const readme=[
    'PRIVATE F4E103F CANDIDATE SOURCE REVIEW ZIP — NOT A RELEASE.',
    'No file has been approved for public redistribution or GitHub publication.',
    'Local game identity, content license/provenance and FULL source completeness are unverified.',
    'Flagged geometry/source assets, secret-like files, large/binary files are excluded.',
    'Inspect contents and rights BEFORE sharing this ZIP; it is never sent automatically.',
    'Do not apply these candidates over the running Windows F4E103F game.'
  ].join('\n')+'\n';
  const header=[
    {name:'T21_CANDIDATE_MANIFEST.json',data:Buffer.from(JSON.stringify(manifest,null,2)+'\n')},
    {name:'T21_READ_ME_FIRST.txt',data:Buffer.from(readme)}
  ];
  return {zip:zipStored([...header,...entries]),manifest};
}
export function cli(args) {
  const parsed={};
  for(let i=0;i<args.length;i+=2){
    const flag=args[i],value=args[i+1];
    if(!['--source','--baseline','--out'].includes(flag) || !value || value.startsWith('--')||parsed[flag])
      throw Error('Usage: --source <F4E103F folder> --baseline <pinned checked-out GitHub source> --out <new ZIP outside both folders>');
    parsed[flag]=value;
  }
  if(!parsed['--source']||!parsed['--baseline']||!parsed['--out']) throw Error('ALL_THREE_OPTIONS_REQUIRED');
  const source=resolve(parsed['--source']),base=resolve(parsed['--baseline']),out=resolve(parsed['--out']);
  if(contained(source,out)||contained(base,out)) throw Error('OUTPUT_MUST_BE_OUTSIDE_SOURCE_AND_BASELINE');
  if(!existsSync(dirname(out))) throw Error('OUTPUT_DIRECTORY_MISSING');
  if(!out.toLowerCase().endsWith('.zip')) throw Error('OUTPUT_MUST_HAVE_ZIP_EXTENSION');
  if(existsSync(out)) throw Error('REFUSE_TO_OVERWRITE_EXISTING_BUNDLE');
  const {zip,manifest}=buildCandidateZip(source,base);
  writeFileSync(out,zip,{flag:'wx',mode:0o600});
  process.stdout.write(JSON.stringify({status:'PRIVATE_REVIEW_BUNDLE_CREATED_NOT_UPLOADED',
    fileCount:manifest.files.length,bytes:zip.length,sha256:sha(zip)},null,2)+'\n');
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {cli(process.argv.slice(2))}
  catch(e) {console.error('T21_BUNDLE_BLOCKED: '+String(e?.message||e));process.exitCode=1;}
}
