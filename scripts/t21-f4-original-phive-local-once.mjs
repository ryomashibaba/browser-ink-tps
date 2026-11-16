#!/usr/bin/env node
/**
 * F4: one LOCAL-ONLY 7.2.0 Turf collision candidate comparison.
 * Builds the B499 ORIGINAL 42-face reference from CURRENT checkout,
 * then audits a user-owned, independently converted Phive OBJ+JSON.
 * NO original assets, private B499 JSON, game state or collision are
 * uploaded to GitHub. This does NOT authorize any playable collider.
 */
import {existsSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,extname,isAbsolute,join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=dirname(fileURLToPath(import.meta.url));
const checkout=resolve(here,'..');
const inside=(p,root)=>p===root||p.startsWith(root+sep);
const fail=s=>{throw Error('F4_ORIGINAL_PHIVE_LOCAL_HOLD_'+s)};
export function localPhiveArgs(argv,root=checkout){
 if(argv.length%2!==0||argv.length<6)
  fail('REQUIRE_--phive-obj_--phive-materials_--output');
 const args={};
 for(let i=0;i<argv.length;i+=2){
  const k=argv[i],v=argv[i+1];
  if(!['--phive-obj','--phive-materials','--output','--b499','--python'].includes(k)||
     typeof v!=='string'||!v||k in args)fail('BAD_OPTION_'+String(k));
  args[k]=v;
 }
 if(!args['--phive-obj']||!args['--phive-materials']||!args['--output'])
  fail('REQUIRED_FILE_MISSING');
 const inputs=['--phive-obj','--phive-materials','--b499'].filter(k=>k in args);
 const out=resolve(args['--output']);
 if(extname(out).toLowerCase()!=='.json'||inside(out,root)||existsSync(out))
  fail('OUTPUT_MUST_BE_NEW_PRIVATE_JSON_OUTSIDE_REPO');
 const files={};
 for(const k of inputs){
  const p=resolve(args[k]);
  if(inside(p,root)||!existsSync(p)||!statSync(p).isFile())
   fail('INPUT_MUST_BE_EXISTING_PRIVATE_FILE_OUTSIDE_REPO_'+k);
  files[k]=p;
 }
 if(!isAbsolute(out)||Object.values(files).includes(out))
  fail('INPUT_OUTPUT_COLLISION');
 if(extname(files['--phive-obj']).toLowerCase()!=='.obj'||
    extname(files['--phive-materials']).toLowerCase()!=='.json')
  fail('CONVERTED_PHIVE_OBJ_AND_JSON_REQUIRED');
 return {obj:files['--phive-obj'],materials:files['--phive-materials'],
  b499:files['--b499']??null,out,python:args['--python']??null};
}
export function buildLocalCommand(config,workDir=checkout,privateB499=null){
 const probe=resolve(workDir,'scripts/f4_phive_original_collision_probe.py');
 const args=[probe,'--b499',config.b499??privateB499,
  '--phive-obj',config.obj,'--phive-materials',config.materials,
  '--output',config.out];
 if(!args[2])fail('UNAVAILABLE_PINNED_42_FACE_REFERENCE');
 const windows=process.platform==='win32';
 const bin=config.python??(windows?'py':'python3');
 return {bin,args:config.python?args:(windows?['-3',...args]:args)};
}
function run(cmd,cwd=checkout,env=process.env){
 const p=spawnSync(cmd.bin,cmd.args,{
  cwd,env,encoding:'utf8',timeout:150000,maxBuffer:8*1024*1024,
  windowsHide:true,shell:false});
 if(p.error)fail('LOCAL_COMMAND_'+p.error.code);
 if(p.status!==0)fail('LOCAL_COMMAND_EXIT_'+p.status+
   '_'+String(p.stderr??'').slice(-900).replace(/\r?\n/g,' '));
 return p.stdout;
}
export function verifyLocalOnce(argv){
 const cfg=localPhiveArgs(argv);
 const dir=mkdtempSync(join(tmpdir(),'t21-f4-phive-local-'));
 try{
  let b499=cfg.b499;
  if(!b499){
   const vitest=resolve(checkout,'node_modules/vitest/vitest.mjs');
   if(!existsSync(vitest))
    fail('LOCAL_DEPENDENCIES_REQUIRED_NO_NETWORK_INSTALL_ATTEMPTED');
   b499=join(dir,'private-original-42face-b499.json');
   run({bin:process.execPath,args:[vitest,'run',
    'src/app/B499OriginalEightSeamsLiveRapierRecast.test.ts']},
    checkout,{...process.env,T21_B499_REPORT_PATH:b499});
   if(!existsSync(b499))fail('REAL_CURRENT_B499_REPORT_NOT_CREATED');
  }
  const stdout=run(buildLocalCommand(cfg,checkout,b499));
  return {verdict:'HOLD_COLLISION_PROVENANCE_NOT_VERIFIED',
   privateOutput:cfg.out,comparison:stdout.trim()};
 }finally{
  rmSync(dir,{recursive:true,force:true});
 }
}
if(process.argv[1]&&resolve(process.argv[1])===
   fileURLToPath(import.meta.url)){
 try{
  const result=verifyLocalOnce(process.argv.slice(2));
  console.log(JSON.stringify(result));
 }catch(err){
  console.error(String(err));process.exitCode=1;
 }
}
