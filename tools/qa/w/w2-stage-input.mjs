#!/usr/bin/env node
/**
 * W3 - W2.2 input and isolated F3 Crowd projection-guard adaptation.
 * Does NOT modify PlayerInput constructor/getters or the Windows original.
 * The normal input is overridden on its INSTANCE, briefly, only while
 * the explicit frozen nonproduction source QA advances genuine KCC ticks.
 */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readFileSync,writeFileSync,realpathSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';

const playerFile='src/input/PlayerInput.ts';
const previewFile='src/app/UndertowF3PlayablePreviewApp.ts';
const nativeFile='src/app/UndertowF3NativeHumanCrowd.ts';
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
 a=replaceOne(a,/(\bconst\s+api\s*=\s*\{\s*snapshot\s*:\s*\(\s*\)\s*=>\s*this\.snapshot\(\s*\)\s*,)/g,
  (_,apiDeclaration)=>[
  "  // QA-only frozen boot, before the real PlayCanvas update loop starts.",
  "  const qaBoot=new URL(location.href).searchParams;",
  "  if(qaBoot.get('t21Play')==='preview'&&",
  "     qaBoot.get('t21QaDrive')==='source'&&",
  "     qaBoot.get('t21QaInput')==='deterministic'&&",
  "     qaBoot.get('t21KccAudit')==='readOnly'&&",
  "     qaBoot.get('t21QaPauseOnBoot')==='1')this.paused=true;",
  "  "+apiDeclaration,
  "   qaDriveTicks:(x:number,y:number,count:number)=>this.qaDriveTicks(x,y,count),"
  ].join('\n'),
  'APP_FROZEN_QA_API');
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

/**
 * W3: only the isolated QA copy may omit a passive Crowd neighbour whose
 * original NavMesh projection ALREADY exceeds the unchanged 0.065m seal.
 * Never move the real Rapier player or CPU, disable a collision veto, invent
 * source geometry, or certify Crowd avoidance when the proxy is absent.
 */
export function patchNativeCrowd(native){
 if(!native.includes('class UndertowF3NativeHumanCrowd')||
    !native.includes('T21_F3C_HUMAN_NATIVE_CROWD_NONPRODUCTION_ONLY')||
    !native.includes('this.anchor.sealAfterCrowdUpdate(foot)'))
  throw Error('HOLD_W3_UNVERIFIED_NATIVE_CROWD_SOURCE');
 if(native.includes('w3ProjectionGuard')||native.includes('w3HorizontalOffset'))
  throw Error('HOLD_W3_NATIVE_ALREADY_PATCHED');
 // Use only the real existing NavMesh projection and movement guards.
 // Fail closed before writing if a Windows source has renamed any of them.
 if(!/\bconst\s+native\s*=/.test(native)||
    !/\bconst\s+snap\s*=/.test(native)||
    !/\bconst\s+sourceSupported\s*=/.test(native)||
    !/\bconst\s+boundedStep\s*=/.test(native))
  throw Error('HOLD_W3_REQUIRED_NATIVE_VARIABLES_UNVERIFIED');
 const changes=[
  [/private\s+excluded\s*=\s*0\s*;/g,
   m=>m+"\n private w3GuardedTicks=0;\n private w3ProjectionGuard={status:'NOT_MEASURED',horizontalMeters:0,verticalMeters:0,threeDMeters:0,limitHorizontalMeters:.065,productionCertified:false};"],
  // Anchor to the *decision*, not how the source computes its acceptance
  // threshold or KCC stride. Windows originals legitimately vary here.
  // No guard is emitted if the source no longer has this exact fail-closed
  // two-condition decision; unknown semantics remain HOLD.
  [/if\s*\(\s*!\s*sourceSupported\s*\|\|\s*!\s*boundedStep\s*\)\s*\{/g,
   ()=>[
    '  const w3HorizontalOffset=Math.hypot(native.x-foot.x,native.z-foot.z);',
    '  const w3VerticalOffset=Math.abs(native.y-foot.y);',
    '  const w3Compatible=Number.isFinite(w3HorizontalOffset)&&w3HorizontalOffset<=.065;',
    "  this.w3ProjectionGuard={status:!sourceSupported?'SOURCE_UNSUPPORTED':!boundedStep?'STEP_UNVERIFIED':!w3Compatible?'WITHHELD_NAV_PROJECTION_HORIZONTAL':'ELIGIBLE_PROXY',horizontalMeters:w3HorizontalOffset,verticalMeters:w3VerticalOffset,threeDMeters:snap,limitHorizontalMeters:.065,productionCertified:false};",
    '  if(sourceSupported&&boundedStep&&!w3Compatible)this.w3GuardedTicks++;',
    '  if(!sourceSupported||!boundedStep||!w3Compatible){'
   ].join('\n')],
  [/detaches:this\.detaches,airborneOrUnverifiableTicks:this\.excluded,/g,
   m=>m+"\n   w3GuardedTicks:this.w3GuardedTicks,projectionGuard:{...this.w3ProjectionGuard},crowdAvoidanceCertified:false,"]
 ];
 let result=native;
 for(let i=0;i<changes.length;i++){
  const [pattern,replacement]=changes[i],hits=[...result.matchAll(pattern)];
  if(hits.length!==1)throw Error('HOLD_W3_NATIVE_ANCHOR_'+i+'_COUNT_'+hits.length);
  result=result.replace(pattern,replacement);
 }
 if(!result.includes('WITHHELD_NAV_PROJECTION_HORIZONTAL')||
    !result.includes('crowdAvoidanceCertified:false'))
  throw Error('HOLD_W3_GUARD_INCOMPLETE');
 return result;
}

export function apply({sandbox,original}){
 if(!sandbox||!original)throw Error('HOLD_W2_EXPECTS_BOTH_PATHS');
 const root=realpathSync(resolve(sandbox)),src=realpathSync(resolve(original));
 if(root===src||root.startsWith(src+sep)||src.startsWith(root+sep))
  throw Error('HOLD_W2_ORIGINAL_AND_QA_SANDBOX_OVERLAP');
 const playerPath=join(root,playerFile),appPath=join(root,previewFile),nativePath=join(root,nativeFile);
 for(const p of [playerPath,appPath,nativePath]){
  if(!existsSync(p)||lstatSync(p).isSymbolicLink()||!lstatSync(p).isFile())
   throw Error('HOLD_W2_EXPECTED_PLAIN_SANDBOX_SOURCE_MISSING');
 }
 const player=readFileSync(playerPath,'utf8'),app=readFileSync(appPath,'utf8');
 const native=readFileSync(nativePath,'utf8');
 const patched=patchSources(player,app),guarded=patchNativeCrowd(native);
 if(patched.player!==player)throw Error('CRITICAL_W2_PLAYER_INPUT_MODIFIED');
 if(patched.app===app||guarded===native)throw Error('HOLD_W3_ISOLATED_PATCH_UNCHANGED');
 // No write occurs before all source checks have succeeded.
 writeFileSync(appPath,patched.app,'utf8');
 writeFileSync(nativePath,guarded,'utf8');
 return {schema:'t21-f4e103w3-app-crowd-isolated-stage/v1',
  status:'PASS_ISOLATED_APP_AND_CROWD_GUARD_NOT_DEPLOYED',
  changes:[{path:previewFile,oldSha256:sha(app),newSha256:sha(patched.app)},
   {path:nativeFile,oldSha256:sha(native),newSha256:sha(guarded)}],
  playerInputSourceUnchanged:true,geometryModified:false,
  navModified:false,productionAuthorized:false};
}
