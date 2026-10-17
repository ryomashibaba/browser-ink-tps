import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildCandidateZip,cli} from './t21-f4e103-local-bundle.mjs';

function fixture(fn) {
  const root=mkdtempSync(join(tmpdir(),'t21-bundle-'));
  const source=join(root,'local'),baseline=join(root,'baseline');
  for(const p of [join(source,'src','game'),join(source,'src','private'),join(source,'scripts'),
     join(source,'public'),join(baseline,'src','game')]) mkdirSync(p,{recursive:true});
  writeFileSync(join(source,'RUN_F4E103F.cmd'),'ECHO RUN');
  writeFileSync(join(source,'RESTORE_F4E103E_FROM_F4E103F.cmd'),'ECHO RESTORE');
  writeFileSync(join(source,'src','game','attack.ts'),'export const damage=48;\n');
  writeFileSync(join(baseline,'src','game','attack.ts'),'export const damage=40;\n');
  writeFileSync(join(source,'src','game','same.ts'),'export const same=true;\n');
  writeFileSync(join(baseline,'src','game','same.ts'),'export const same=true;\n');
  writeFileSync(join(source,'src','game','original_geometry.ts'),'const mesh=new Float64Array([1,2,3]);');
  writeFileSync(join(source,'src','private','credential.ts'),'DO_NOT_COPY_SECRET_PATH');
  writeFileSync(join(source,'src','game','secret.ts'),'const bad="github_pat_ABCDEFGHIJKLMNOPQRST12345678";');
  writeFileSync(join(source,'public','Temple01.obj'),'DO_NOT_COPY_EXTRACTED_ASSET');
  writeFileSync(join(source,'src','game','日本語 test.ts'),'export const hello="世界";\n');
  try {return fn({root,source,baseline});}
  finally {rmSync(root,{recursive:true,force:true});}
}
function unzipStored(zip) {
  const entries=new Map();let off=0;
  while(off+30<zip.length && zip.readUInt32LE(off)===0x04034b50){
    assert.equal(zip.readUInt16LE(off+8),0);
    const bytes=zip.readUInt32LE(off+18);
    const filenameSize=zip.readUInt16LE(off+26);
    const extraSize=zip.readUInt16LE(off+28);
    const name=zip.subarray(off+30,off+30+filenameSize).toString();
    const pos=off+30+filenameSize+extraSize;
    const data=zip.subarray(pos,pos+bytes);
    entries.set(name,data.toString('utf8'));
    off=pos+bytes;
  }
  assert.equal(zip.readUInt32LE(off),0x02014b50,'central ZIP directory expected');
  assert(zip.subarray(-22).readUInt32LE(0)===0x06054b50,'ZIP end of central directory expected');
  return entries;
}
test('makes private metadata-and-code candidate ZIP, excluding flagged source and originals',()=>
 fixture(({root,source,baseline})=>{
  const {zip,manifest}=buildCandidateZip(source,baseline);
  const entries=unzipStored(zip);
  assert.equal(manifest.publicationAuthorized,false);
  assert.equal(manifest.assetRightsCleared,false);
  assert.equal(manifest.originalGameFilesIncluded,'UNVERIFIED_CONTENT_REQUIRES_REVIEW');
  assert.equal(manifest.uploadPerformed,false);
  assert.equal(manifest.baselineSha,'UNVERIFIED_LOCAL_CHECKOUT');
  assert(entries.has('T21_CANDIDATE_MANIFEST.json'));
  assert(entries.has('candidate-src/src/game/attack.ts'));
  assert(entries.has('candidate-src/src/game/日本語 test.ts'));
  assert.equal(entries.get('candidate-src/src/game/attack.ts'),'export const damage=48;\n');
  assert(!entries.has('candidate-src/src/game/same.ts'));
  assert(!entries.has('candidate-src/src/game/original_geometry.ts'));
  assert(!entries.has('candidate-src/src/private/credential.ts'));
  assert(!entries.has('candidate-src/src/game/secret.ts'));
  assert(!zip.includes(Buffer.from('DO_NOT_COPY_EXTRACTED_ASSET')));
  assert(!zip.includes(Buffer.from('DO_NOT_COPY_SECRET_PATH')));
  assert(!zip.includes(Buffer.from('github_pat_ABCDEFGHIJKLMNOPQRST12345678')));
  const candidatePaths=manifest.files.map(x=>x.path);
  assert(!candidatePaths.some(x=>x.includes('private')||x.includes('secret')||x.includes('geometry')));
  assert(manifest.excludedCandidateCount>=3);
  const output=join(root,'bundle.zip');
  cli(['--source',source,'--baseline',baseline,'--out',output]);
  assert.deepEqual(readFileSync(output),zip);
  assert.throws(()=>cli(['--source',source,'--baseline',baseline,'--out',output]),/OVERWRITE/);
  assert.throws(()=>cli(['--source',source,'--baseline',baseline,'--out',join(source,'bundle.zip')]),/OUTSIDE/);
  assert.throws(()=>cli(['--source',source,'--baseline',baseline,'--out',join(baseline,'bundle.zip')]),/OUTSIDE/);
  execFileSync('unzip',['-t',output],{stdio:'pipe'});
 })
);
test('requires local launchers and never assumes GitHub baseline is the actual Windows version',()=>
 fixture(({source,baseline})=>{
  assert.throws(()=>buildCandidateZip(baseline,source),/LAUNCHERS_NOT_BOTH_PRESENT/);
  assert.throws(()=>buildCandidateZip(source,source),/MUST_DIFFER/);
 })
);
