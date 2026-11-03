#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b413AuditFullOriginalShotRefillReshot}
 from './t21-b413-native-source-fire-refill-reshoot.mjs';
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 if(!dir)throw Error('B413_ACTUAL_NATIVE_CHROMIUM_ARTIFACT_REQUIRED');
 const get=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const audit=b413AuditFullOriginalShotRefillReshot(
  get('b413-real-original-ink-fire-refill-fire.json'),
  get('b410-independent-true-original-active-verdict.json'),
  get('b412-independent-real-original-squid-swim.json'),
  get('b411-independent-native-hud-verdict.json'),
  get('b409-one-original-route-180s.json'));
 writeFileSync(join(dir,'b413-independent-original-ink-economy-verdict.json'),
  JSON.stringify(audit,null,2)+'\n');
 console.log('B413_INDEPENDENT_REAL_NATIVE_INK_SHOT_REFILL_RESHOT',JSON.stringify(audit));
}
