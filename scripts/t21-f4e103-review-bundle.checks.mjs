import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBaselineSnapshot} from './t21-f4e103-baseline-snapshot.mjs';
import {buildCandidateZip} from './t21-f4e103-local-bundle.mjs';
import {inspectCandidateArchive} from './t21-f4e103-review-bundle.mjs';

const COMMIT='d'.repeat(40);
function fixture(fn){
 const root=mkdtempSync(join(tmpdir(),'t21-import-review-'));
 const local=join(root,'F4E103F'),baseline=join(root,'old');
 for(const p of [join(local,'src'),join(local,'public'),join(baseline,'src')])mkdirSync(p,{recursive:true});
 writeFileSync(join(local,'RUN_F4E103F.cmd'),'@echo off');
 writeFileSync(join(local,'RESTORE_F4E103E_FROM_F4E103F.cmd'),'@echo off');
 writeFileSync(join(local,'src','actual.ts'),'export const movement = "kcc";\n');
 writeFileSync(join(local,'public','Temple01.obj'),'EXTRACTED_NOT_ELIGIBLE');
 writeFileSync(join(baseline,'src','actual.ts'),'export const movement = "old";\n');
 const snap=join(root,'baseline.json');
 writeFileSync(snap,JSON.stringify(createBaselineSnapshot(baseline,COMMIT)));
 try{return fn({local,snap});}finally{rmSync(root,{recursive:true,force:true});}
}
test('valid private candidate archive means integrity PASS, publication/import still HOLD',()=>
 fixture(({local,snap})=>{
  const {zip}=buildCandidateZip(local,snap);
  const x=inspectCandidateArchive(zip,{expectedBaseline:COMMIT});
  assert.deepEqual({integrity:x.integrity,files:x.fileCount,baseline:x.baselineSha,
    import:x.importDecision,release:x.publicationAuthorization},
    {integrity:'PASS_ARCHIVE_ONLY',files:1,baseline:COMMIT,
     import:'HOLD_MANUAL_SOURCE_REVIEW',release:'NOT_GRANTED'});
  assert(!zip.includes(Buffer.from('EXTRACTED_NOT_ELIGIBLE')));
  assert.throws(()=>inspectCandidateArchive(zip,{expectedBaseline:'b'.repeat(40)}),/WRONG_BASELINE/);
 }));
test('rejects corrupted archive, unsafe manifest authority and wrong local bytes',()=>
 fixture(({local,snap})=>{
  const {zip}=buildCandidateZip(local,snap);
  const broken=Buffer.from(zip);
  const idx=broken.indexOf(Buffer.from('export const movement = "kcc"'));
  assert(idx>0);
  broken[idx]^=0x01;
  assert.throws(()=>inspectCandidateArchive(broken),/CRC_MISMATCH/);
  const brokenFooter=Buffer.from(zip);
  brokenFooter.writeUInt32LE(0,brokenFooter.length-22);
  assert.throws(()=>inspectCandidateArchive(brokenFooter),/EOCD/);
  const truncated=zip.subarray(0,100);
  assert.throws(()=>inspectCandidateArchive(truncated));
 }));
