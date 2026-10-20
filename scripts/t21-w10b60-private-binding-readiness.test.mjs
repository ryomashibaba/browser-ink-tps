import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateBancPreflight,cli} from './t21-w10b24-private-banc-preflight.mjs';

const secret='TOP_SECRET_LAYER_493zz';
const privateActor=(id=1,valid=true)=>({
 Gyaml:'Lft_FldObj_Temple01_PntSet',
 Hash:id,ModelName:'SUPER_PRIVATE_MESH_IDENTIFIER',
 Layer:secret,
 Translate:[-9871.125,8902.375,3492.625],
 Rotate:[.1,.2,.3],Scale:valid?[1,1,1]:[0,1,1]
});
function withPrivateSource(fn){
 const dir=mkdtempSync(join(tmpdir(),'b60-priv-'));
 const source=join(dir,'LOCAL_NEVER_UPLOAD');
 mkdirSync(source);
 try{return fn(dir,source);}finally{rmSync(dir,{recursive:true,force:true});}
}
test('B60 one decoded candidate reports only aggregate evidence; 8 mesh mappings stay unbound',()=>withPrivateSource((dir,source)=>{
 writeFileSync(join(source,'Vss_Temple01_private.json'),
  JSON.stringify({stageRowId:'Vss_Temple01',Actors:[
   privateActor(14),privateActor(14),privateActor(15,false),
   {Gyaml:'Lft_FldObj_Temple01_VlfSet',Translate:[1,2,3],
    Rotate:[1,2,3],Scale:[1,1,1],Layer:'SENSITIVE_OTHER_LAYER'}
  ]}));
 const x=privateBancPreflight(source);
 assert.equal(x.hold,'HOLD_BANC_AUTHENTICITY_AND_MESH_BINDING_UNPROVEN');
 assert.equal(x.b60NewlyBoundPntSetMeshes,0);
 const e=x.candidates[0].b60InstanceBindingReadiness;
 assert.deepEqual([
  e.pntSetClassActors,e.schemaValidPntSetActors,
  e.explicitIdentityPresentCount,e.duplicateExplicitIdentityCount,
  e.validNonemptyLayerCount,e.distinctLayerCount,
  e.actorProvidedModelReferenceHintCount
 ],[3,2,3,1,3,1,3]);
 assert.equal(e.exactInstanceToEightUnboundMeshesVerified,false);
 assert.equal(e.originalActorWorldTransformVerified,false);
 assert.equal(e.candidateMeshMatchesAuthorized,0);
 const exported=JSON.stringify(x);
 for(const privateValue of [
  secret,'SENSITIVE_OTHER_LAYER','SUPER_PRIVATE_MESH_IDENTIFIER',
  '-9871.125','8902.375','3492.625','LOCAL_NEVER_UPLOAD',
  '493zz'
 ])assert.equal(exported.includes(privateValue),false,
  'Private source detail must never be returned');
 assert.deepEqual(x.frozenStageAuthority,{
  solids:25,paintable:17,navLinks:26,scoreable:0,activationReady:false
 });
}));
test('B60 empty source remains HOLD with no false actor/mesh bindings',()=>withPrivateSource((dir,source)=>{
 const x=privateBancPreflight(source);
 assert.equal(x.hold,'HOLD_NO_DECODED_VSS_TEMPLE01_BANC');
 assert.equal(x.candidates.length,0);
 assert.equal(x.b60NewlyAuthenticatedOriginalActorInstances,0);
}));
test('B60 synthetic self-claimed stage and no model reference cannot authenticate a single original mesh',()=>withPrivateSource((dir,source)=>{
 writeFileSync(join(source,'Vss_Temple01_synthetic.json'),
  JSON.stringify({stageRowId:'Vss_Temple01',Actors:[{
   Gyaml:'Lft_FldObj_Temple01_PntSet',
   Layer:'private',Translate:[1,2,3],Rotate:[0,0,0],Scale:[1,1,1]
  }]}));
 const report=privateBancPreflight(source),e=report.candidates[0].b60InstanceBindingReadiness;
 assert.equal(e.pntSetClassActors,1);
 assert.equal(e.explicitIdentityPresentCount,0);
 assert.equal(e.actorProvidedModelReferenceHintCount,0);
 assert.equal(e.originalSourceProvenanceAuthenticated,false);
 assert.equal(e.exactInstanceToEightUnboundMeshesVerified,false);
}));
test('B60 existing ONE-CLICK private workflow writes safe extended JSON outside source tree',()=>withPrivateSource((dir,source)=>{
 writeFileSync(join(source,'Vss_Temple01.json'),
  JSON.stringify({stageRowId:'Vss_Temple01',Actors:[privateActor()]}));
 const out=join(dir,'private-report.json');
 const oldWrite=process.stdout.write;
 try{
  process.stdout.write=()=>true;
  cli(['--source',source,'--out',out]);
 }finally{process.stdout.write=oldWrite;}
 const raw=readFileSync(out,'utf8');
 const outData=JSON.parse(raw);
 assert.equal(outData.b60ReadinessVersion,'B60_LOCAL_COUNT_ONLY_V1');
 assert.equal(outData.externalUploadPerformed,false);
 assert.equal(outData.inputSourceContentsExported,false);
 assert.equal(outData.b60ActorCoordinatesExported,false);
 assert.equal(outData.b60PrivateLayerNamesExported,false);
 assert.equal(raw.includes(secret),false);
 assert.equal(raw.includes('SUPER_PRIVATE_MESH_IDENTIFIER'),false);
 assert.equal(raw.includes('-9871.125'),false);
}));
