#!/usr/bin/env node
/**
 * Build a hash-only baseline from the checked-out, already public commit.
 * Does not publish source contents or read local Windows data.
 */
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {scanSource} from './t21-f4e103-source-intake.mjs';

export function createBaselineSnapshot(root, commitSha) {
  if (!/^[a-f0-9]{40}$/.test(commitSha || '')) throw Error('PINNED_COMMIT_SHA_REQUIRED');
  const inventory = scanSource(root);
  return {
    schema:'t21-public-baseline/v1',
    commitSha,
    files:inventory.files.filter(x=>/^[a-f0-9]{64}$/.test(x.sha256||''))
      .map(x=>({path:x.path,sha256:x.sha256}))
  };
}
if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if(process.argv.length!==5) throw Error('Usage: node script.mjs <public source checkout> <40-char commit sha> <out JSON>');
    const [, ,root,sha,path] = process.argv;
    writeFileSync(path,JSON.stringify(createBaselineSnapshot(root,sha),null,2)+'\n',{flag:'wx'});
    console.log('PINNED_HASH_ONLY_BASELINE_CREATED (public source only)');
  } catch(e) {console.error('BASELINE_BLOCKED: '+String(e.message||e));process.exitCode=1;}
}
