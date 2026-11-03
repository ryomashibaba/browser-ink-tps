#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {b412AuditNativeActualOriginalInkSwim}
 from './t21-b412-native-original-squid-ink-swim.mjs';
const dir=process.argv[2];
if(typeof dir!=='string')throw Error('B412_TRUE_CHROMIUM_DIR_REQUIRED');
const get=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
const v=b412AuditNativeActualOriginalInkSwim(
 get('b412-original-upper-real-own-ink-swim.json'),
 get('b410-independent-true-original-active-verdict.json'),
 get('b411-independent-native-hud-verdict.json'));
writeFileSync(join(dir,'b412-independent-real-original-squid-swim.json'),
 JSON.stringify(v,null,2)+'\n');
console.log('B412_INDEPENDENT_REAL_ORIGINAL_SQUID_SWIM',JSON.stringify(v));
