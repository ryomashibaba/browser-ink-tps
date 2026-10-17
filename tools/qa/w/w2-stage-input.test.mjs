import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {patchSources,apply} from './w2-stage-input.mjs';
import {SCHEMA} from './w2-worker.mjs';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';

const base='413a0acdfdb2b0f74550b653fa78fff9c0f5727d';
const file=path=>execFileSync('git',['show',base+':'+path],{encoding:'utf8'});
const playerFile='src/input/PlayerInput.ts';
const appFile='src/app/UndertowF3PlayablePreviewApp.ts';
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

test('changed app pause whitespace is accepted but ambiguous anchors fail closed',()=>{
 const {player,app}=source();
 const space=app.replace(' private paused=false;','  private   paused  =  false ;');
 assert.notEqual(space,app);
 assert.match(patchSources(player,space).app,/t21QaPauseOnBoot/);
 assert.throws(()=>patchSources(player,app.replace(' private paused=false;','')),
  /HOLD_W2_ANCHOR_APP_PAUSED_BOOT/);
 assert.throws(()=>patchSources(player,app.replace(' private paused=false;',
  ' private paused=false;\n private paused=false;')),
 /HOLD_W2_ANCHOR_APP_PAUSED_BOOT_COUNT_2/);
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
  for(const [name,data] of [[playerFile,player],[appFile,app]]){
   const out=join(root,name);
   mkdirSync(dirname(out),{recursive:true});
   writeFileSync(out,data);
  }
 }
 try{
  const result=apply({sandbox,original});
  assert.equal(result.status,'PASS_ISOLATED_APP_ONLY_QA_PATCH_NOT_DEPLOYED');
  assert.equal(result.playerInputSourceUnchanged,true);
  assert.equal(readFileSync(join(sandbox,playerFile),'utf8'),player);
  assert.equal(readFileSync(join(original,appFile),'utf8'),app);
  assert.equal(readFileSync(join(original,playerFile),'utf8'),player);
  assert.notEqual(readFileSync(join(sandbox,appFile),'utf8'),app);
  assert.throws(()=>apply({sandbox:original,original}),/HOLD_W2_ORIGINAL_AND_QA_SANDBOX_OVERLAP/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
