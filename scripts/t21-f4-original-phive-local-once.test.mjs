import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {localPhiveArgs,buildLocalCommand} from './t21-f4-original-phive-local-once.mjs';

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
