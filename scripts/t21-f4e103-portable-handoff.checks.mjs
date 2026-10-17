import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBaselineSnapshot} from './t21-f4e103-baseline-snapshot.mjs';
import {scanSource} from './t21-f4e103-source-intake.mjs';
import {buildCandidateZip} from './t21-f4e103-local-bundle.mjs';

const COMMIT='a'.repeat(40);
function fixture(fn){
  const dir=mkdtempSync(join(tmpdir(),'t21-pinned-baseline-'));
  const local=join(dir,'F4E103F'),base=join(dir,'public-src');
  for(const d of [join(base,'src'),join(local,'src'),join(local,'public')])mkdirSync(d,{recursive:true});
  writeFileSync(join(base,'src','unchanged.ts'),'export const stable=1;\n');
  writeFileSync(join(base,'src','changed.ts'),'export const version="F4E28";\n');
  writeFileSync(join(base,'src','removed.ts'),'export const removed=true;\n');
  writeFileSync(join(local,'src','unchanged.ts'),'export const stable=1;\n');
  writeFileSync(join(local,'src','changed.ts'),'export const version="F4E103F";\n');
  writeFileSync(join(local,'src','extra.ts'),'export const extra=48;\n');
  writeFileSync(join(local,'public','Temple01.obj'),'ORIGINAL_ASSET_DO_NOT_INCLUDE');
  writeFileSync(join(local,'RUN_F4E103F.cmd'),'@echo off');
  writeFileSync(join(local,'RESTORE_F4E103E_FROM_F4E103F.cmd'),'@echo off');
  try{return fn({dir,local,base});} finally{rmSync(dir,{recursive:true,force:true});}
}
test('hash-only pinned baseline matches normal checkout comparison and preserves tested commit',()=>fixture(({dir,local,base})=>{
  const snapshot=createBaselineSnapshot(base,COMMIT);
  assert.equal(snapshot.schema,'t21-public-baseline/v1');
  assert.equal(snapshot.files.length,3);
  assert(!JSON.stringify(snapshot).includes('export const'));
  const manifest=join(dir,'baseline.json');
  writeFileSync(manifest,JSON.stringify(snapshot));
  const checked=scanSource(local,manifest);
  assert.equal(checked.baselineCommitSha,COMMIT);
  assert.equal(checked.baselineFormat,'PINNED_PUBLIC_SHA256_SNAPSHOT');
  const entries=new Map(checked.files.map(f=>[f.path,f]));
  assert.equal(entries.get('src/unchanged.ts').change,'UNCHANGED');
  assert.equal(entries.get('src/changed.ts').change,'CHANGED_OR_UNVERIFIABLE');
  assert.equal(entries.get('src/extra.ts').change,'NEW');
  assert.equal(entries.get('src/removed.ts').change,'REMOVED_FROM_LOCAL');
  const {zip,manifest:privateManifest}=buildCandidateZip(local,manifest);
  assert.equal(privateManifest.baselineSha,COMMIT);
  assert.equal(privateManifest.files.length,2);
  assert(zip.includes(Buffer.from('export const version="F4E103F"')));
  assert(!zip.includes(Buffer.from('ORIGINAL_ASSET_DO_NOT_INCLUDE')));
}));
test('rejects unpinned, malformed and duplicate snapshot entries',()=>fixture(({dir,base,local})=>{
  assert.throws(()=>createBaselineSnapshot(base,'not-a-SHA'),/PINNED_COMMIT/);
  const snapshot=createBaselineSnapshot(base,COMMIT);
  const f=join(dir,'baseline.json');
  writeFileSync(f,JSON.stringify({...snapshot,commitSha:'bad'}));
  assert.throws(()=>scanSource(local,f),/INVALID_BASELINE_SNAPSHOT/);
  writeFileSync(f,JSON.stringify({...snapshot,files:[...snapshot.files,snapshot.files[0]]}));
  assert.throws(()=>scanSource(local,f),/INVALID_BASELINE_ENTRY/);
  writeFileSync(f,JSON.stringify({...snapshot,files:[{path:'../../outside.ts',sha256:'0'.repeat(64)}]}));
  assert.throws(()=>scanSource(local,f),/INVALID_BASELINE_ENTRY/);
}));
