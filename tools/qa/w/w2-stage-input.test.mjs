import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {patchSources,patchNativeCrowd,apply} from './w2-stage-input.mjs';
import {SCHEMA} from './w2-worker.mjs';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';

const base='413a0acdfdb2b0f74550b653fa78fff9c0f5727d';
const file=path=>execFileSync('git',['show',base+':'+path],{encoding:'utf8'});
const playerFile='src/input/PlayerInput.ts';
const appFile='src/app/UndertowF3PlayablePreviewApp.ts';
const nativeFile='src/app/UndertowF3NativeHumanCrowd.ts';
const source=()=>({player:file(playerFile),app:file(appFile)});

test('original PlayerInput is byte-for-byte unchanged by isolated QA patch',()=>{
 const {player,app}=source();
 const result=patchSources(player,app);
 assert.equal(result.player,player);
 assert.match(result.app,/T21_QA_DETERMINISTIC_INPUT_FORBIDDEN/);
 assert.match(result.app,/t21QaPauseOnBoot/);
 assert.match(result.app,/Object\.defineProperty\(input,'moveX'/);
 assert.match(result.app,/Object\.defineProperty\(input,'moveY'/);
 assert.match(result.app,/Reflect\.deleteProperty\(input,'moveX'\)/);
 assert.match(result.app,/Reflect\.deleteProperty\(input,'moveY'\)/);
 assert.doesNotMatch(result.app,/new StageSolid/);
 assert.equal(SCHEMA,'t21-f4e103w2-real-kcc-no-pointerlock/v1');
});

test('Windows constructor/spacing difference from real report no longer blocks QA',()=>{
 const {player,app}=source();
 const varied=player.replace(
  '  public constructor(private readonly canvas: HTMLCanvasElement) {',
  '  constructor( readonly canvas: HTMLCanvasElement, private unused = false ) {');
 assert.notEqual(varied,player);
 const result=patchSources(varied,app);
 assert.equal(result.player,varied);
 assert.match(result.app,/private qaDriveTicks/);
});

test('changed getter expression is preserved, not rewritten',()=>{
 const {player,app}=source();
 const variant=player.replace(
  "return (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);",
  'return Number(this.keys.has("KeyD"))-Number(this.keys.has("KeyA"));');
 assert.notEqual(variant,player);
 assert.equal(patchSources(variant,app).player,variant);
});

test('pause/property whitespace and API formatting differences are supported',()=>{
 const {player,app}=source();
 const varied=app.replace(' private paused=false;','  private   paused  =  false ;')
  .replace('const api={snapshot:()=>this.snapshot(),',
    'const api = { snapshot : () => this.snapshot() ,');
 assert.notEqual(varied,app);
 assert.match(patchSources(player,varied).app,/t21QaPauseOnBoot/);
});
test('missing or repeated F3 API anchors are refused before any writes',()=>{
 const {player,app}=source();
 const anchor='const api={snapshot:()=>this.snapshot(),';
 assert.ok(app.includes(anchor));
 assert.throws(()=>patchSources(player,app.replace(anchor,'const otherApi=undefined;')),
  /HOLD_W2_ANCHOR_APP_FROZEN_QA_API_COUNT_0/);
 assert.throws(()=>patchSources(player,app.replace(anchor,anchor+'\n'+anchor)),
  /HOLD_W2_ANCHOR_APP_FROZEN_QA_API_COUNT_2/);
});

test('prepatched/unsupported app or missing real input getters is refused',()=>{
 const {player,app}=source();
 const edited=patchSources(player,app);
 assert.throws(()=>patchSources(player,edited.app),/HOLD_W2_APP_ALREADY_PATCHED/);
 assert.throws(()=>patchSources(player.replace('get moveY','get otherY'),app),
  /HOLD_W2_ORIGINAL_PLAYER_INPUT_GETTERS_UNVERIFIED/);
 assert.throws(()=>patchSources(player,app.replace('T21_F3_QA_PHYSICAL_DRIVE_FORBIDDEN','unknown')),
  /HOLD_W2_NOT_FROZEN_QA_PREVIEW/);
});

test('isolated staging changes only app and never changes original source',()=>{
 const {player,app}=source();
 const dir=mkdtempSync(join(tmpdir(),'w2-isolated-'));
 const original=join(dir,'original');
 const sandbox=join(dir,'sandbox');
 for(const root of [original,sandbox]){
  for(const [name,data] of [[playerFile,player],[appFile,app],[nativeFile,file(nativeFile)]]){
   const out=join(root,name);
   mkdirSync(dirname(out),{recursive:true});
   writeFileSync(out,data);
  }
 }
 try{
  const result=apply({sandbox,original});
  assert.equal(result.status,'PASS_ISOLATED_APP_AND_CROWD_GUARD_NOT_DEPLOYED');
  assert.equal(result.playerInputSourceUnchanged,true);
  assert.equal(readFileSync(join(sandbox,playerFile),'utf8'),player);
  assert.equal(readFileSync(join(original,appFile),'utf8'),app);
  assert.equal(readFileSync(join(original,playerFile),'utf8'),player);
  assert.equal(readFileSync(join(original,nativeFile),'utf8'),file(nativeFile));
  assert.match(readFileSync(join(sandbox,nativeFile),'utf8'),/WITHHELD_NAV_PROJECTION_HORIZONTAL/);
  assert.notEqual(readFileSync(join(sandbox,appFile),'utf8'),app);
  assert.throws(()=>apply({sandbox:original,original}),/HOLD_W2_ORIGINAL_AND_QA_SANDBOX_OVERLAP/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});

test('W3 strict pre-attach projection guard only affects disposable Crowd source',()=>{
 const original=file(nativeFile);
 const patched=patchNativeCrowd(original);
 assert.match(patched,/w3HorizontalOffset<=\.065/);
 assert.match(patched,/!sourceSupported\|\|!boundedStep\|\|!w3Compatible/);
 assert.match(patched,/WITHHELD_NAV_PROJECTION_HORIZONTAL/);
 assert.match(patched,/crowdAvoidanceCertified:false/);
 assert.match(patched,/this\.anchor\.sealAfterCrowdUpdate\(foot\)/);
 assert.throws(()=>patchNativeCrowd(patched),/HOLD_W3_NATIVE_ALREADY_PATCHED/);
 assert.throws(()=>patchNativeCrowd(original.replace('private excluded=0;','private other=0;')),
  /HOLD_W3_NATIVE_ANCHOR_0_COUNT_0/);
 const ambiguous=original.replace('private excluded=0;','private excluded=0;\n private excluded=0;');
 assert.throws(()=>patchNativeCrowd(ambiguous),/HOLD_W3_NATIVE_ANCHOR_0_COUNT_2/);
});

test('W3 fail-closed: unknown native source rejects before any sandbox writes',()=>{
 const {player,app}=source(),dir=mkdtempSync(join(tmpdir(),'w3-fail-closed-'));
 const original=join(dir,'original'),sandbox=join(dir,'sandbox');
 for(const root of [original,sandbox]){
  for(const [name,data] of [[playerFile,player],[appFile,app],[nativeFile,'UNKNOWN_SOURCE']]){
   const target=join(root,name);mkdirSync(dirname(target),{recursive:true});
   writeFileSync(target,data);
  }
 }
 try{
  assert.throws(()=>apply({sandbox,original}),/HOLD_W3_UNVERIFIED_NATIVE_CROWD_SOURCE/);
  assert.equal(readFileSync(join(sandbox,appFile),'utf8'),app);
  assert.equal(readFileSync(join(sandbox,nativeFile),'utf8'),'UNKNOWN_SOURCE');
  assert.equal(readFileSync(join(original,appFile),'utf8'),app);
 }finally{rmSync(dir,{recursive:true,force:true})}
});

test('W3.1 accepts formula formatting differences without changing the source decision',()=>{
 const native=file(nativeFile);
 const changed=native
  .replace('const sourceSupported=Number.isFinite(snap)&&snap<=.22;',
   'const sourceSupported = Number.isFinite(snap) && (snap <= 0.22);')
  .replace('GAME_CONFIG.player.humanSpeedMetersPerSecond/60+.12;',
   '(GAME_CONFIG.player.humanSpeedMetersPerSecond / 60) + 0.12;')
  .replace('if(!sourceSupported||!boundedStep){',
   'if ( !sourceSupported || !boundedStep ) {');
 assert.notEqual(changed,native);
 const patched=patchNativeCrowd(changed);
 assert.match(patched,/WITHHELD_NAV_PROJECTION_HORIZONTAL/);
 assert.match(patched,/!sourceSupported\|\|!boundedStep\|\|!w3Compatible/);
 assert.match(patched,/const sourceSupported = Number\.isFinite\(snap\) && \(snap <= 0\.22\)/);
 assert.match(patched,/const w3HorizontalOffset=Math\.hypot/);
});
test('W3.1 rejects changed guard semantics before writing a sandbox',()=>{
 const native=file(nativeFile);
 const changed=native.replace('if(!sourceSupported||!boundedStep){',
   'if(!sourceSupported||!boundedStep||overrideHumanCollision){');
 assert.notEqual(changed,native);
 assert.throws(()=>patchNativeCrowd(changed),/HOLD_W3_NATIVE_ANCHOR_1_COUNT_0/);
});

test('W3.1 permits reordered snapshot fields but retains explicit noncertification',()=>{
 const native=file(nativeFile);
 const reordered=native.replace(
  'detaches:this.detaches,airborneOrUnverifiableTicks:this.excluded,',
  'airborneOrUnverifiableTicks:this.excluded,detaches:this.detaches,');
 assert.notEqual(reordered,native);
 const patched=patchNativeCrowd(reordered);
 assert.match(patched,/w3GuardedTicks:this.w3GuardedTicks/);
 assert.match(patched,/crowdAvoidanceCertified:false/);
});
