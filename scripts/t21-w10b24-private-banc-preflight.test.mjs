import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateBancPreflight,cli} from './t21-w10b24-private-banc-preflight.mjs';

function fixture(fn){
 const tmp=mkdtempSync(join(tmpdir(),'t21-b24-source-'));
 const source=join(tmp,'owner-original-unshared');
 mkdirSync(source);
 try{fn({tmp,source,put:(name,value)=>{
  const abs=join(source,name);
  writeFileSync(abs,typeof value==='string'?value:JSON.stringify(value));
 }})}finally{rmSync(tmp,{recursive:true,force:true})}
}
const sourceActor=(gyaml='Lft_FldObj_Temple01_PntSet')=>({
 Gyaml:gyaml,Translate:[789.123,234.456,-567.890],
 Rotate:[11.25,22.5,45],Scale:[1,1,1],Layer:'SECRET_PRIVATE_LAYER'
});
test('B24 absent original Banc remains HOLD and original 25/17/26/0',()=>fixture(({source})=>{
 const r=privateBancPreflight(source);
 assert.equal(r.hold,'HOLD_NO_DECODED_VSS_TEMPLE01_BANC');
 assert.equal(r.candidates.length,0);
 assert.deepEqual(r.frozenStageAuthority,
  {solids:25,paintable:17,navLinks:26,scoreable:0,activationReady:false});
 assert.equal(r.productionAuthorized,false);
}));
test('B24 decoded JSON yields a non-authoritative count and cannot leak original actor coordinates',()=>fixture(({source,put})=>{
 put('Vss_Temple01_static.byml.json',{stageRowId:'Vss_Temple01',Actors:[
  sourceActor(),sourceActor('Lft_FldObj_Temple01_VlfSet'),
  {...sourceActor(),Scale:[0,1,1]},
  {...sourceActor('Unrelated'),Translate:[999,999,999]}
 ]});
 const r=privateBancPreflight(source);
 assert.equal(r.hold,'HOLD_BANC_AUTHENTICITY_AND_MESH_BINDING_UNPROVEN');
 assert.equal(r.candidates.length,1);
 assert.equal(r.candidates[0].actorCount,4);
 assert.equal(r.candidates[0].recognizedSetActorCount,3);
 assert.equal(r.candidates[0].validSetActorCount,2);
 assert.equal(r.candidates[0].invalidSetActorCount,1);
 const serialized=JSON.stringify(r);
 for(const privateString of ['789.123','234.456','-567.89','SECRET_PRIVATE_LAYER','999,999,999',
  'original-unshared'])assert.equal(serialized.includes(privateString),false);
 assert.equal(r.originalBancAuthenticityProven,false);
 assert.equal(r.activeActorLayersCertified,false);
 assert.equal(r.newCollisionSolids,0);
 assert.equal(r.originalConnectionsPromoted,0);
}));
test('B24 raw BYML is explicitly undecoded, wrong stage rejected and multiple exports HOLD',()=>fixture(({source,put})=>{
 put('Vss_Temple01_Actors.byml','\0BYML_PRIVATE_EXAMPLE');
 let r=privateBancPreflight(source);
 assert.equal(r.hold,'HOLD_NEEDS_PRIVATE_OFFLINE_BYML_DECODE');
 assert.equal(r.candidates[0].decodeState,'NEEDS_PRIVATE_OFFLINE_BYML_DECODE');
 put('Vss_Temple01_spoof.json',{stageRowId:'Vss_Other',Actors:[sourceActor()]});
 r=privateBancPreflight(source);
 assert.equal(r.candidates.find(x=>x.fileName.includes('spoof')).decodeState,'HOLD_STAGE_IDENTITY_UNBOUND');
 assert.equal(r.hold,'HOLD_NEEDS_PRIVATE_OFFLINE_BYML_DECODE');
 put('Vss_Temple01_A.json',{stageRowId:'Vss_Temple01',Actors:[sourceActor()]});
 put('Vss_Temple01_B.json',{stageRowId:'Vss_Temple01',Actors:[sourceActor()]});
 r=privateBancPreflight(source);
 assert.equal(r.hold,'HOLD_MULTIPLE_UNVERIFIED_BANC_CANDIDATES');
 assert.equal(r.productionAuthorized,false);
}));
test('B24 local report refuses input-tree output and never overwrites',()=>fixture(({tmp,source,put})=>{
 put('Vss_Temple01.json',{stageRowId:'Vss_Temple01',Actors:[sourceActor()]});
 assert.throws(()=>cli(['--source',source,'--out',join(source,'private.json')]),
  /B24_OUTPUT_OUTSIDE_INPUT/);
 const output=join(tmp,'report.json');
 const oldWrite=process.stdout.write;
 try{process.stdout.write=()=>true;
  cli(['--source',source,'--out',output]);
  const r=JSON.parse(readFileSync(output,'utf8'));
  assert.equal(r.inputSourceContentsExported,false);
  assert.equal(r.externalUploadPerformed,false);
  assert.equal(r.originalActorsAndTransformsExported,false);
  assert.throws(()=>cli(['--source',source,'--out',output]),/EEXIST/);
 }finally{process.stdout.write=oldWrite;}
}));
