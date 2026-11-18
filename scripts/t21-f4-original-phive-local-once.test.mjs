import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {localPhiveArgs,buildLocalCommand,
 buildStandalonePhiveConversion} from './t21-f4-original-phive-local-once.mjs';

test('one private original Phive probe uses only existing local files; no shell, network, or gameplay write',()=>{
 const dir=mkdtempSync(join(tmpdir(),'f4-local-'));
 try{
  const root=join(dir,'repo');mkdirSync(root);
  const a=join(dir,'original-physical.obj'),b=join(dir,'original-materials.json');
  const q=join(dir,'f4-private-evidence.json');
  writeFileSync(a,'# test only\n');
  writeFileSync(b,'{}');
  const cfg=localPhiveArgs([
   '--phive-obj',a,'--phive-materials',b,'--output',q],root);
  assert.equal(cfg.b499,null);
  const cmd=buildLocalCommand(cfg,root,join(dir,'b499-private.json'));
  assert.equal(cmd.args.includes('--b499'),true);
  assert.equal(cmd.args.includes('--phive-obj'),true);
  assert.equal(cmd.args.includes('--output'),true);
  assert.equal(cmd.args.includes(q),true);
  assert.equal(cmd.args.some(x=>/[;&|]curl|wget/.test(x)),false);
  assert.match(cmd.args[0],/f4_phive_original_collision_probe\.py$/);
  assert.throws(()=>localPhiveArgs([
   '--phive-obj',a,'--phive-materials',b,'--output',
   join(root,'public-asset.json')],root),/OUTPUT_MUST_BE_NEW_PRIVATE_JSON/);
  assert.throws(()=>localPhiveArgs([
   '--phive-obj',a,'--phive-materials',b,'--output',q,
   '--phive-obj',a],root),/BAD_OPTION/);
  writeFileSync(q,'do not overwrite');
  assert.throws(()=>localPhiveArgs([
   '--phive-obj',a,'--phive-materials',b,'--output',q],root),
   /OUTPUT_MUST_BE_NEW_PRIVATE_JSON/);
  assert.equal(cfg.obj,resolve(a));
 }finally{rmSync(dir,{recursive:true,force:true})}
});

test('standalone original PhiveConverter is private input only and prepares exact existing Python audit',()=>{
 const dir=mkdtempSync(join(tmpdir(),'f4-private-source-binary-'));
 try{
  const repo=join(dir,'repo'),privateDir=join(dir,'owned');
  const converterDir=join(privateDir,'converter');
  mkdirSync(repo);mkdirSync(privateDir);mkdirSync(converterDir);
  const bphsh=join(privateDir,'Vss_Temple01.bphsh');
  const exe=join(converterDir,'PhiveConverter.exe');
  const config=join(converterDir,'fxconfig.json');
  const output=join(privateDir,'F4_SOURCE_ONLY_CANDIDATES.json');
  writeFileSync(bphsh,'SYNTHETIC_TEST_NOT_GAME_ASSET');
  writeFileSync(exe,'SYNTHETIC_TEST_NOT_EXECUTABLE');
  writeFileSync(config,'{}');
  const a=localPhiveArgs(['--phive-bphsh',bphsh,
   '--converter-exe',exe,'--output',output],repo);
  assert.equal(a.obj,null);assert.equal(a.materials,null);
  assert.equal(a.bphsh,resolve(bphsh));
  const tmp=join(dir,'isolated-temp');
  const c=buildStandalonePhiveConversion(a,tmp);
  assert.deepEqual(c.args,['-p',resolve(bphsh),'-o',tmp]);
  assert.equal(c.bin,resolve(exe));assert.equal(c.cwd,resolve(converterDir));
  assert.equal(c.obj,join(tmp,'Vss_Temple01.obj'));
  assert.equal(c.materials,join(tmp,'Vss_Temple01.json'));
  const p=buildLocalCommand({...a,obj:c.obj,materials:c.materials},
   repo,join(privateDir,'b499-private.json'));
  assert.deepEqual(p.args.slice(1,3),['--b499',join(privateDir,'b499-private.json')]);
  assert.equal(p.args.includes(c.obj),true);
  assert.equal(p.args.includes(c.materials),true);
  assert.equal(p.args.includes(bphsh),false);
  const wrapper=readFileSync(resolve('CHECK_F4_PRIVATE_PHIVE_WINDOWS.cmd'),'utf8');
  assert.match(wrapper,/T21_PHIVE_CONVERTER_EXE/);
  assert.match(wrapper,/--phive-bphsh/);
  assert.match(wrapper,/--converter-exe/);
  assert.match(wrapper,/--output/);
  assert.doesNotMatch(wrapper,/\bgit\s+(?:push|merge|reset|checkout|rebase|pull|fetch)\b/i);
  assert.doesNotMatch(wrapper,/curl|wget|powershell|Invoke-WebRequest/i);
  assert.throws(()=>localPhiveArgs(['--phive-bphsh',bphsh,
   '--converter-exe',exe,'--phive-obj',bphsh,'--output',output],repo),
   /REQUIRE_EXACTLY_ONE_PRIVATE_COLLISION_INPUT_MODE/);
  assert.throws(()=>localPhiveArgs(['--phive-bphsh',bphsh,
   '--converter-exe',exe,'--output',join(repo,'forbidden.json')],repo),
   /OUTPUT_MUST_BE_NEW_PRIVATE_JSON_OUTSIDE_REPO/);
  assert.throws(()=>localPhiveArgs(['--phive-bphsh',bphsh,
   '--converter-exe',join(repo,'PhiveConverter.exe'),'--output',output],repo),
   /PRIVATE_FILE_OUTSIDE_REPO/);
  writeFileSync(output,'NO_OVERWRITE');
  assert.throws(()=>localPhiveArgs(['--phive-bphsh',bphsh,
   '--converter-exe',exe,'--output',output],repo),
   /OUTPUT_MUST_BE_NEW_PRIVATE_JSON_OUTSIDE_REPO/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
