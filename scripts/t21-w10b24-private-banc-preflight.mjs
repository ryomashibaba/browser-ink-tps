#!/usr/bin/env node
/**
 * W10-B24 — PRIVATE, local-only primary evidence preflight for a locally
 * decoded Vss_Temple01 Banc/SetActor JSON export.
 *
 * No archive extraction, auto-decompression, raw actor coordinate output,
 * game modification, remote fetch, stdout raw JSON, or public asset upload.
 * A schema-valid JSON is NOT authenticated as Nintendo's original Banc.
 * Only a separately provenance-verified primary source could ever advance
 * original placement, collision, nav, scoring or production authority.
 */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative,dirname,join,sep,extname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

export const B24_MAX_BYTES=16*1024*1024;
export const B24_MAX_DISCOVERED=12000;
const CLASSES=[
 'Lft_FldObj_Temple01_PntSet',
 'Lft_FldObj_Temple01_VarSet',
 'Lft_FldObj_Temple01_VclSet',
 'Lft_FldObj_Temple01_VglSet',
 'Lft_FldObj_Temple01_VlfSet'
];
const sourceSideCount=Object.freeze({positiveZ:4,negativeZ:4,totalUnbound:8});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const inside=(parent,child)=>child===parent||child.startsWith(parent+sep);
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const vec3=x=>Array.isArray(x)&&x.length===3&&x.every(v=>
 typeof v==='number'&&Number.isFinite(v));
const valid=x=>record(x)&&typeof x.Gyaml==='string'&&
 vec3(x.Translate)&&vec3(x.Rotate)&&vec3(x.Scale)&&
 x.Scale.every(v=>Math.abs(v)>1e-8)&&
 typeof x.Layer==='string'&&x.Layer.length>0;
function candidateName(rel){
 // Never inspect all unrelated JSON. Only Temple01-named actor exports
 // or JSON located under an explicitly stage-labelled directory.
 const normalized=rel.replaceAll('\\','/');
 return /(?:^|[/_.-])(?:Vss_)?Temple01(?:[/_.-]|$)/i.test(normalized);
}
function inspectCandidate(abs){
 const stat=lstatSync(abs);
 const fileName=basename(abs); // no local absolute paths exported
 if(!stat.isFile()||stat.size>B24_MAX_BYTES)
  return {fileName,sourceSha256:null,decodeState:'HOLD_NOT_REGULAR_OR_OVERSIZED',
   actorCount:0,recognizedSetActorCount:0,validSetActorCount:0};
 const bytes=readFileSync(abs);
 const digest=sha(bytes);
 if(extname(abs).toLowerCase()!=='.json')
  return {fileName,sourceSha256:digest,decodeState:'NEEDS_PRIVATE_OFFLINE_BYML_DECODE',
   actorCount:0,recognizedSetActorCount:0,validSetActorCount:0};
 let data;
 try{
  if(bytes.includes(0))throw Error('BINARY_NOT_JSON');
  data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 }catch{
  return {fileName,sourceSha256:digest,decodeState:'HOLD_UNREADABLE_DECODED_JSON',
   actorCount:0,recognizedSetActorCount:0,validSetActorCount:0};
 }
 const stageIdentityExact=record(data)&&data.stageRowId==='Vss_Temple01';
 const actors=record(data)&&Array.isArray(data.Actors)&&
  data.Actors.length<=20000?data.Actors:null;
 const rows=actors??[];
 const counts=CLASSES.map(gyaml=>{
  const matches=rows.filter(v=>record(v)&&v.Gyaml===gyaml);
  return {gyaml,seen:matches.length,schemaValid:matches.filter(valid).length};
 });
 const recognized=counts.reduce((n,c)=>n+c.seen,0);
 const correctlyShaped=counts.reduce((n,c)=>n+c.schemaValid,0);
 // B60: private-in-memory evidence completeness. Only AGGREGATE COUNTS
 // may leave this process. No GUID, layer name, position, mesh name,
 // coordinate transform, Actor data or repository upload is permitted.
 const primary=rows.filter(a=>record(a)&&a.Gyaml==='Lft_FldObj_Temple01_PntSet');
 const identityKeys=['Hash','Id','ActorHash','InstanceId','GUID','Guid'];
 const modelKeys=['ModelName','UnitConfigName','AssetName','Model','ResourceName','ModelKey'];
 const parentKeys=['ParentHash','ParentId','Parent'];
 const identityKey=(actor)=>{
  for(const field of identityKeys){
   const val=actor[field];
   if((typeof val==='string'&&val.length>0&&val.length<=256)||
      (typeof val==='number'&&Number.isSafeInteger(val)&&val>=0))
    return field+':'+String(val);
  }
  return null;
 };
 const ident=primary.map(identityKey);
 const known=ident.filter(x=>x!==null);
 const keysWithDuplicates=known.length-new Set(known).size;
 const names=(actor,fields)=>fields.some(f=>
  typeof actor[f]==='string'&&actor[f].length>0&&actor[f].length<=256);
 const safeLayers=primary.filter(a=>typeof a.Layer==='string'&&a.Layer.length>0);
 const b60InstanceBindingReadiness={
  status:'HOLD_ACTOR_INSTANCE_TO_PNTSET_MESH_UNBOUND',
  stageIdentityIsSelfClaimedNotAuthenticated:stageIdentityExact,
  pntSetClassActors:primary.length,
  schemaValidPntSetActors:primary.filter(valid).length,
  explicitIdentityPresentCount:known.length,
  duplicateExplicitIdentityCount:keysWithDuplicates,
  validNonemptyLayerCount:safeLayers.length,
  distinctLayerCount:new Set(safeLayers.map(a=>a.Layer)).size,
  actorProvidedModelReferenceHintCount:primary.filter(a=>names(a,modelKeys)).length,
  actorProvidedParentReferenceHintCount:primary.filter(a=>
   parentKeys.some(f=>typeof a[f]==='string'&&a[f].length>0&&a[f].length<=256||
    typeof a[f]==='number'&&Number.isSafeInteger(a[f]))).length,
  originalSourceProvenanceAuthenticated:false,
  originalLayerActiveRuntimeVerified:false,
  originalActorWorldTransformVerified:false,
  exactInstanceToEightUnboundMeshesVerified:false,
  candidateMeshMatchesAuthorized:0,
  stagePhysicsPromoted:0,
  navLinksPromoted:0,
  scoreablePromoted:0,
  nextRequiredEvidence:[
   'LICENSED_OR_USER_AUTHORIZED_ORIGINAL_BANC_PROVENANCE',
   'EXACT_ACTOR_INSTANCE_TO_COMPONENT_REFERENCE',
   'ORIGINAL_ACTIVE_LAYER_BINDING',
   'ORIGINAL_COORDINATE_SPACE_AND_TRANSFORM_PROVENANCE',
   'NATIVE_RAPIER_KCC_AND_RECAST_CONTINUOUS_CROSSING'
  ]
 };
 return {
  fileName,sourceSha256:digest,
  decodeState:!stageIdentityExact?'HOLD_STAGE_IDENTITY_UNBOUND':
   !actors?'HOLD_UNSUPPORTED_ACTORS_STRUCTURE':
   recognized===0?'HOLD_NO_TEMPLE01_SET_ACTORS':
   'DECODED_METADATA_ONLY_INSTANCE_IDENTITY_UNBOUND',
  stageIdentityExact,actorArraySchemaValid:!!actors,
  actorCount:rows.length,recognizedSetActorCount:recognized,
  validSetActorCount:correctlyShaped,
  invalidSetActorCount:recognized-correctlyShaped,
  knownTemple01SetClasses:counts,
  b60InstanceBindingReadiness
 };
}
function collect(root){
 const candidates=[];
 let seen=0;
 function visit(dir,depth){
  if(depth>10)throw Error('B24_DIRECTORY_DEPTH_LIMIT');
  for(const item of readdirSync(dir,{withFileTypes:true})
   .sort((a,b)=>a.name.localeCompare(b.name,'en'))){
   if(++seen>B24_MAX_DISCOVERED)throw Error('B24_DISCOVERY_LIMIT');
   if(item.isSymbolicLink())continue;
   if(item.isDirectory()){
    if(/^(?:node_modules|dist|build|\.git|\.cache|__pycache__)$/i.test(item.name))continue;
    visit(join(dir,item.name),depth+1);
   }else if(item.isFile()){
    const full=join(dir,item.name);
    const rel=relative(root,full);
    if(!candidateName(rel))continue;
    if(/\.(?:json|byml|byml\.zs|zs)$/i.test(item.name))
     candidates.push(inspectCandidate(full));
   }
  }
 }
 visit(root,0);
 return candidates;
}
export function privateBancPreflight(dir){
 const root=resolve(dir);
 if(!existsSync(root)||!lstatSync(root).isDirectory()||
  lstatSync(root).isSymbolicLink())throw Error('B24_PRIVATE_SOURCE_DIRECTORY_REQUIRED');
 const candidates=collect(root);
 const matched=candidates.filter(x=>x.decodeState===
  'DECODED_METADATA_ONLY_INSTANCE_IDENTITY_UNBOUND');
 const hold=matched.length>1?'HOLD_MULTIPLE_UNVERIFIED_BANC_CANDIDATES':
  matched.length===1?'HOLD_BANC_AUTHENTICITY_AND_MESH_BINDING_UNPROVEN':
  candidates.some(x=>x.decodeState==='NEEDS_PRIVATE_OFFLINE_BYML_DECODE')?
   'HOLD_NEEDS_PRIVATE_OFFLINE_BYML_DECODE':
   'HOLD_NO_DECODED_VSS_TEMPLE01_BANC';
 return {
  schema:'T21_W10B24_PRIVATE_BANC_PREFLIGHT_V1',
  expectedOriginalStage:'Vss_Temple01',
  sourceScope:'OWNER_LOCAL_ONLY',
  hold,
  filesScannedByNameOnly:true,
  originalActorsAndTransformsExported:false,
  inputSourceContentsExported:false,
  externalUploadPerformed:false,
  extractionPerformed:false,
  originalBancAuthenticityProven:false,
  meshInstanceIdentityBound:false,
  activeActorLayersCertified:false,
  existingUnboundOriginalPntSetComponents:sourceSideCount,
  frozenStageAuthority:{solids:25,paintable:17,navLinks:26,scoreable:0,
   activationReady:false},
  originalConnectionsPromoted:0,
  newCollisionSolids:0,newNavigationLinks:0,newScoreableSurfaces:0,
  productionAuthorized:false,
  b60PrimarySourceBindingStatus:'HOLD_ACTOR_INSTANCE_TO_PNTSET_MESH_UNBOUND',
  b60ReadinessVersion:'B60_LOCAL_COUNT_ONLY_V1',
  b60NewlyAuthenticatedOriginalActorInstances:0,
  b60NewlyBoundPntSetMeshes:0,
  b60ActorCoordinatesExported:false,
  b60PrivateLayerNamesExported:false,
  candidates
 };
}
export function cli(args){
 const options={};
 while(args.length){
  const key=args.shift();
  if(!['--source','--out'].includes(key)||!args.length||
     args[0].startsWith('--')||options[key])
   throw Error('USAGE: --source <private decoded Banc folder> [--out <local JSON>]');
  options[key]=args.shift();
 }
 if(!options['--source'])throw Error('B24_SOURCE_REQUIRED');
 const source=resolve(options['--source']);
 const report=privateBancPreflight(source);
 if(options['--out']){
  const dest=resolve(options['--out']);
  if(inside(source,dest)||!existsSync(dirname(dest)))
   throw Error('B24_OUTPUT_OUTSIDE_INPUT_AND_PARENT_REQUIRED');
  writeFileSync(dest,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  process.stdout.write('B24_LOCAL_METADATA_ONLY_REPORT_CREATED; '+report.hold+'\n');
 }else process.stdout.write(JSON.stringify(report,null,2)+'\n');
 return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{cli(process.argv.slice(2));}
 catch(e){console.error('B24_PRIVATE_BANC_BLOCKED: '+(e?.message??e));process.exitCode=1;}
}
