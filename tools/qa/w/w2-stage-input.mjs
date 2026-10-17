#!/usr/bin/env node
/**
 * W2.2 - app-only, fail-closed QA adaptation inside a separate Q sandbox.
 * Does NOT modify PlayerInput constructor/getters or the Windows original.
 * The normal input is overridden on its INSTANCE, briefly, only while
 * the explicit frozen nonproduction source QA advances genuine KCC ticks.
 */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readFileSync,writeFileSync,realpathSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';

const playerFile='src/input/PlayerInput.ts';
const previewFile='src/app/UndertowF3PlayablePreviewApp.ts';
const sha=s=>createHash('sha256').update(s).digest('hex');

function replaceOne(source,pattern,replacement,label){
 const matches=[...source.matchAll(pattern)];
 if(matches.length!==1)throw Error('HOLD_W2_ANCHOR_'+label+'_COUNT_'+matches.length);
 return source.replace(pattern,replacement);
}
export function patchSources(player,app){
 if(!/\bclass\s+PlayerInput\b/.test(player)||
    !/\bget\s+moveX\s*\(/.test(player)||
    !/\bget\s+moveY\s*\(/.test(player))
  throw Error('HOLD_W2_ORIGINAL_PLAYER_INPUT_GETTERS_UNVERIFIED');
 if(!/\bclass\s+UndertowF3PlayablePreviewApp\b/.test(app)||
    !app.includes('T21_F3_EXPLICIT_NONPRODUCTION_PREVIEW_ONLY')||
    !app.includes('T21_F3_QA_PHYSICAL_DRIVE_FORBIDDEN'))
  throw Error('HOLD_W2_NOT_FROZEN_QA_PREVIEW');
 if(app.includes('qaDriveTicks')||app.includes('t21QaPauseOnBoot'))
  throw Error('HOLD_W2_APP_ALREADY_PATCHED');
 let a=app;
 a=replaceOne(a,/(\bprivate\s+paused\s*=\s*)false(\s*;)/g,
  (_,head,end)=>head+
  "new URL(location.href).searchParams.get('t21Play')==='preview'&&\n"+
  "  new URL(location.href).searchParams.get('t21QaDrive')==='source'&&\n"+
  "  new URL(location.href).searchParams.get('t21QaInput')==='deterministic'&&\n"+
  "  new URL(location.href).searchParams.get('t21KccAudit')==='readOnly'&&\n"+
  "  new URL(location.href).searchParams.get('t21QaPauseOnBoot')==='1'"+end,
  'APP_PAUSED_BOOT');
 a=replaceOne(a,/(\badvanceQaTicks\s*:\s*\(\s*count\s*:\s*number\s*\)\s*=>\s*this\.advanceQaTicks\(\s*count\s*\)\s*,)/g,
  '$1\n   qaDriveTicks:(x:number,y:number,count:number)=>this.qaDriveTicks(x,y,count),',
  'APP_QA_API');
 const implementation=[
 ' /** W2.2: actual 60Hz PlayerController / Rapier and real CPU fixed ticks.',
 '  * No mouse lock, no teleport, no modification of normal PlayerInput code.',
 '  * Temporary instance getters are ALWAYS removed after the QA tick batch.',
 '  */',
 ' private qaDriveTicks(x:number,y:number,count:number){',
 '  const qa=new URL(location.href).searchParams;',
 "  if(qa.get('t21Play')!=='preview'||qa.get('t21QaDrive')!=='source'||",
 "     qa.get('t21QaInput')!=='deterministic'||qa.get('t21KccAudit')!=='readOnly'||",
 "     qa.get('t21QaPauseOnBoot')!=='1'||",
 '     !this.paused||document.pointerLockElement===this.canvas||',
 '     this.stopReason||!Number.isSafeInteger(count)||count<1||count>96||',
 '     ![x,y].every(Number.isFinite)||Math.abs(x)>1||Math.abs(y)>1)',
 "    throw Error('T21_QA_DETERMINISTIC_INPUT_FORBIDDEN');",
 '  const input=this.input;',
 "  if(Object.getOwnPropertyDescriptor(input,'moveX')||",
 "     Object.getOwnPropertyDescriptor(input,'moveY')||",
 '     !Object.isExtensible(input))',
 "    throw Error('T21_QA_INPUT_OVERRIDE_UNSAFE');",
 '  let appliedX=false;',
 '  try{',
 "   Object.defineProperty(input,'moveX',{configurable:true,get:()=>x});",
 '   appliedX=true;',
 "   Object.defineProperty(input,'moveY',{configurable:true,get:()=>y});",
 '   return this.advanceQaTicks(count);',
 '  }finally{',
 "   if(appliedX)Reflect.deleteProperty(input,'moveX');",
 "   Reflect.deleteProperty(input,'moveY');",
 '  }',
 ' }',
 ''].join('\n');
 a=replaceOne(a,/(\bprivate\s+advanceQaTicks\s*\(\s*count\s*:\s*number\s*\)\s*\{)/g,
  implementation+'$1','APP_QA_METHOD');
 if(!a.includes('T21_QA_INPUT_OVERRIDE_UNSAFE')||
    !a.includes('Reflect.deleteProperty')||
    !a.includes('this.advanceQaTicks(count)'))
  throw Error('HOLD_W2_INPUT_CLEANUP_GUARD_MISSING');
 return {player,app:a};
}
export function apply({sandbox,original}){
 if(!sandbox||!original)throw Error('HOLD_W2_EXPECTS_BOTH_PATHS');
 const root=realpathSync(resolve(sandbox)),src=realpathSync(resolve(original));
 if(root===src||root.startsWith(src+sep)||src.startsWith(root+sep))
  throw Error('HOLD_W2_ORIGINAL_AND_QA_SANDBOX_OVERLAP');
 const playerPath=join(root,playerFile),appPath=join(root,previewFile);
 for(const p of [playerPath,appPath]){
  if(!existsSync(p)||lstatSync(p).isSymbolicLink()||!lstatSync(p).isFile())
   throw Error('HOLD_W2_EXPECTED_PLAIN_SANDBOX_SOURCE_MISSING');
 }
 const player=readFileSync(playerPath,'utf8'),app=readFileSync(appPath,'utf8');
 const patched=patchSources(player,app);
 if(patched.player!==player)throw Error('CRITICAL_W2_PLAYER_INPUT_MODIFIED');
 if(patched.app===app)throw Error('HOLD_W2_APP_NOT_CHANGED');
 // No write occurs before all source checks have succeeded.
 writeFileSync(appPath,patched.app,'utf8');
 return {schema:'t21-f4e103w2-app-only-isolated-stage/v2',
  status:'PASS_ISOLATED_APP_ONLY_QA_PATCH_NOT_DEPLOYED',
  changes:[{path:previewFile,oldSha256:sha(app),newSha256:sha(patched.app)}],
  playerInputSourceUnchanged:true,geometryModified:false,
  navModified:false,productionAuthorized:false};
}
