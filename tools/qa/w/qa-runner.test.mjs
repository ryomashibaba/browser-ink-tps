import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {main,options} from './qa-runner.mjs';

const files=[
 'src/player/PlayerController.ts','src/app/UndertowF3PlayablePreviewApp.ts',
 'src/physics/RapierStagePhysics.ts','src/player/PlayerCharacterPhysics.ts',
 'src/stage/undertow/UndertowPhase14QHumanCrowdAnchor.ts',
 'src/app/UndertowF3NativeHumanCrowd.ts','package.json','tsconfig.json'
];
test('W2 check requires no previous ZIP kit and creates permanent test launcher',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'inktps-w2-check-'));
 const home=join(dir,'home'),root=join(dir,'qa'),project=join(dir,'original'),kit=join(dir,'absent-kit');
 mkdirSync(home,{recursive:true});
 for(const name of files){
  const abs=join(project,name);
  mkdirSync(abs.slice(0,abs.lastIndexOf(process.platform==='win32'?'\\':'/')),{recursive:true});
  writeFileSync(abs,'mock-source-contents');
 }
 try{
  const result=await main(['--mode','check','--root',root,'--project',project,'--kit',kit],{USERPROFILE:home});
  assert.equal(result.status,'PASS_PREFLIGHT_READONLY');
  assert.equal(result.sourceFilesChanged,false);
  assert.equal(result.liveKccObserved,false);
  assert.equal(existsSync(join(root,'RUN_INKTPS_QA_TEST.cmd')),true);
  const cmd=readFileSync(join(root,'RUN_INKTPS_QA_TEST.cmd'),'ascii');
  assert.match(cmd,/RUN_INKTPS_QA.cmd/);
  assert.match(cmd,/ run/);
  assert.match(cmd,/\r\n/);
  assert.equal(JSON.parse(readFileSync(join(root,'F4E103W_LAST_REPORT.json'))).status,'PASS_PREFLIGHT_READONLY');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('W2 refuses to put QA output under original source',()=>{
 assert.throws(()=>options(['--project','/x/project','--root','/x/project/qa','--kit','/x/kit']),
 /HOLD_OVERLAPPING/);
});
