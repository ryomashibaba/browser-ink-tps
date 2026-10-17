#!/usr/bin/env node
/**
 * F4E103W persistent QA engine. Reads original Browser Ink TPS only.
 * No source upload, GitHub push, production deploy, geometry or collider changes.
 */
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync,lstatSync,mkdirSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname,join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const VERSION='F4E103W.1';
const ORIGINAL='T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff';
const LAST_KIT='BrowserInkTPS_F4E103V_Crowd_Stage_Hotfix';
const CRITICAL=['src/player/PlayerController.ts',
 'src/app/UndertowF3PlayablePreviewApp.ts',
 'src/physics/RapierStagePhysics.ts','src/player/PlayerCharacterPhysics.ts',
 'src/stage/undertow/UndertowPhase14QHumanCrowdAnchor.ts',
 'src/app/UndertowF3NativeHumanCrowd.ts','package.json','tsconfig.json'];
const digest=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const inside=(a,b)=>resolve(a)===resolve(b)||resolve(a).startsWith(resolve(b)+sep);
function atomicJson(path,data){
 mkdirSync(dirname(path),{recursive:true});
 const tmp=path+'.'+process.pid+'.tmp';
 writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
 renameSync(tmp,path);
}
function folder(p,label){
 if(!existsSync(p))throw Error('HOLD_'+label+'_MISSING');
 if(!lstatSync(p).isDirectory()||lstatSync(p).isSymbolicLink())
  throw Error('HOLD_'+label+'_NOT_REAL_DIRECTORY');
}
export function options(args,env=process.env){
 const accepted=new Set(['--mode','--root','--project','--kit']);
 const map={};
 for(let i=0;i<args.length;i++){
  if(!accepted.has(args[i])||!args[i+1]||args[i+1].startsWith('--')||map[args[i]])
   throw Error('HOLD_INVALID_OR_DUPLICATE_ARGUMENT_'+args[i]);
  map[args[i]]=args[++i];
 }
 const mode=map['--mode']??'check';
 if(!['check','run','self-test'].includes(mode))throw Error('HOLD_UNSUPPORTED_MODE');
 const home=env.USERPROFILE??homedir();
 const root=resolve(map['--root']??join(env.LOCALAPPDATA??join(home,'.local','share'),'InkTPS-QA'));
 const project=resolve(map['--project']??join(home,'Downloads',ORIGINAL));
 const kit=resolve(map['--kit']??join(home,'Downloads',LAST_KIT));
 if([project,kit].some(p=>inside(root,p)||inside(p,root))||inside(project,kit)||inside(kit,project))
  throw Error('HOLD_OVERLAPPING_QA_OR_SOURCE_PATHS');
 return {mode,root,project,kit};
}
function hashes(project){
 const entries={};
 for(const name of CRITICAL){
  const path=join(project,name);
  if(!existsSync(path)||lstatSync(path).isSymbolicLink())
   throw Error('HOLD_ORIGINAL_FILE_UNREADABLE_'+name);
  entries[name]=digest(path);
 }
 return entries;
}
async function runPreviousV({project,root,kit}){
 const runner=join(kit,'scripts','run-f4e103v.mjs');
 if(!existsSync(runner))throw Error('HOLD_OLD_V_RUNNER_MISSING');
 const output=join(root,'runs');
 mkdirSync(output,{recursive:true});
 return await new Promise(ok=>{
  let finished=false,tail='';
  const child=spawn(process.execPath,[runner,'--project',project,'--output-root',output,'--routes','2'],{
   cwd:kit,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe'],env:{...process.env,CI:'1'}});
  const log=x=>tail=(tail+String(x)).slice(-30000);
  child.stdout?.on('data',log);child.stderr?.on('data',log);
  const done=(status,detail)=>{
   if(finished)return;finished=true;clearTimeout(timer);
   writeFileSync(join(root,'F4E103W_LAST_CONSOLE.log'),tail);
   ok({status,detail});
  };
  child.on('error',e=>done('HOLD_CHILD_SPAWN',String(e)));
  child.on('exit',(code,signal)=>done(code===0?'CHILD_EXIT_ZERO':'HOLD_CHILD_NONZERO',{code,signal}));
  const timer=setTimeout(()=>{try{child.kill()}catch{}done('HOLD_CHILD_TIMEOUT',240000)},240000);
 });
}
export async function main(args=process.argv.slice(2),env=process.env){
 const cfg=options(args,env);
 if(cfg.mode==='self-test')return {status:'PASS_SELF_TEST',version:VERSION};
 mkdirSync(cfg.root,{recursive:true});
 const finalPath=join(cfg.root,'F4E103W_LAST_REPORT.json');
 const report={schema:'t21-f4e103w-persistent-qa/v1',version:VERSION,
  timestamp:new Date().toISOString(),mode:cfg.mode,status:'HOLD_NOT_STARTED',
  sourceFilesChanged:false,sourceUploaded:false,githubPushed:false,productionDeployed:false,
  isolatedBuildPassed:false,liveKccObserved:false,crowdProjectionObserved:false,warnings:[]};
 let before=null;
 try{
  folder(cfg.project,'ORIGINAL_GAME');
  folder(cfg.kit,'F4E103V_KIT');
  before=hashes(cfg.project);
  if(!existsSync(join(cfg.kit,'scripts','run-f4e103v.mjs')))
   throw Error('HOLD_F4E103V_SCRIPT_MISSING');
  report.status='PASS_PREFLIGHT_READONLY';
  if(cfg.mode==='run'){
   report.child=await runPreviousV(cfg);
   const previous=join(cfg.root,'runs','F4E103V_LAST_REPORT.json');
   if(existsSync(previous)){
    const v=JSON.parse(readFileSync(previous,'utf8'));
    report.isolatedBuildPassed=v.isolatedBuildValidated===true&&v.actualGameBuildPassed===true;
    report.liveKccObserved=v.liveKccObserved===true;
    report.crowdProjectionObserved=v.crowdAuditObserved===true;
    report.status=v.status??'HOLD_OLD_KIT_WITHOUT_STATUS';
    report.routes=v.routeResults?.length??0;
   }else report.status='HOLD_OLD_KIT_NO_REPORT';
   if(report.child.status!=='CHILD_EXIT_ZERO')report.warnings.push('CHILD_FAILED_OR_TIMED_OUT');
  }
 }catch(error){
  report.status=String(error?.message??error).slice(0,300);
 }finally{
  if(before){
   try{
    const after=hashes(cfg.project);
    report.sourceFilesChanged=Object.keys(before).some(k=>before[k]!==after[k]);
    if(report.sourceFilesChanged)report.status='CRITICAL_ORIGINAL_SOURCE_CHANGED';
   }catch(e){report.status='HOLD_ORIGINAL_SOURCE_RECHECK_FAILED';report.warnings.push(String(e))}
  }
  atomicJson(finalPath,report);
  console.log('F4E103W_STATUS',report.status);
  console.log('F4E103W_RESULT',finalPath);
  console.log('ORIGINAL_SOURCE_UNMODIFIED',!report.sourceFilesChanged);
 }
 return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await main();
 if(result.status.startsWith('CRITICAL_'))process.exitCode=2;
}
