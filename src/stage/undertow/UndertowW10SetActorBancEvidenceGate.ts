/**
 * W10-B11: schema-only, read-only gate for FUTURE user-owned and locally
 * decoded Vss_Temple01 Banc/BYML Actors exports. Not an archive decoder.
 *
 * Critically, stage ID, Gyaml class and plausible numeric transforms alone
 * CANNOT authenticate the original Banc file or bind a specific mesh to a
 * set instance. No transforms leave this audit. No actor is spawned, no
 * collider/nav/score mask is changed, no source payload is uploaded.
 *
 * The source layout audit has NO original instance payload in the repo.
 * Synthetic fixtures exercise parsing but have ZERO gameplay authority.
 */
import {UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT}
 from './UndertowSpillwayStageSourceIdentityAudit';
import {UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT}
 from './UndertowSpillwayStageLayoutResolutionAudit';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES}
 from './UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';

type SourceStatus='ABSENT'|'UNVERIFIED_DECODED_BANC'|'SYNTHETIC_FIXTURE';
export type W10B11Hold=
 'HOLD_NO_BANC_PAYLOAD'|'HOLD_INVALID_BANC_STRUCTURE'|
 'HOLD_WRONG_STAGE_IDENTITY'|'HOLD_NO_RECOGNIZED_TEMPLE01_SET'|
 'HOLD_INSTANCE_IDENTITY_UNBOUND';
const KNOWN_SET_CLASSES=[
 'Lft_FldObj_Temple01_PntSet',
 'Lft_FldObj_Temple01_VarSet',
 'Lft_FldObj_Temple01_VclSet',
 'Lft_FldObj_Temple01_VglSet',
 'Lft_FldObj_Temple01_VlfSet'
] as const;
type SetClass=typeof KNOWN_SET_CLASSES[number];
type UnknownRecord=Record<string,unknown>;
function isRecord(x:unknown):x is UnknownRecord{
 return typeof x==='object'&&x!==null&&!Array.isArray(x);
}
function finiteVec3(x:unknown):boolean{
 return Array.isArray(x)&&x.length===3&&x.every(v=>
  typeof v==='number'&&Number.isFinite(v));
}
function validActor(x:unknown):x is UnknownRecord{
 return isRecord(x)&&typeof x.Gyaml==='string'&&x.Gyaml.length>0&&
  finiteVec3(x.Translate)&&finiteVec3(x.Rotate)&&finiteVec3(x.Scale)&&
  (x.Scale as number[]).every(v=>Math.abs(v)>1e-8)&&
  typeof x.Layer==='string'&&x.Layer.length>0;
}
export interface W10B11ActorClassAudit{
 readonly gyaml:SetClass;
 readonly seenActorCount:number;
 readonly schemaValidCount:number;
 readonly schemaInvalidCount:number;
 readonly originalObjectInstanceMatchCertified:false;
}
export interface W10B11SourceComponentHold{
 readonly sourceComponentId:string;
 readonly modelSide:'POSITIVE_Z'|'NEGATIVE_Z';
 readonly expectedActorClass:'Lft_FldObj_Temple01_PntSet';
 readonly originalSetInstanceIdentified:false;
 readonly actorTransformBoundToMesh:false;
 readonly originalLayerActivationVerified:false;
 readonly sourceSolidPromotionAuthorized:false;
}
export interface W10B11EvidenceGateResult{
 readonly sourceStatus:SourceStatus;
 readonly hold:W10B11Hold;
 readonly expectedStageRowId:'Vss_Temple01';
 readonly inputStageIdentityValid:boolean;
 readonly payloadStructureValid:boolean;
 readonly seenActorCount:number;
 readonly unrecognizedActorClassCount:number;
 readonly recognizedSetActorCount:number;
 readonly validRecognizedSetActorCount:number;
 readonly malformedRecognizedSetActorCount:number;
 readonly knownSetClasses:readonly W10B11ActorClassAudit[];
 readonly stillUnboundOriginalObjects:readonly W10B11SourceComponentHold[];
 readonly inputCoordinatesReflectedOrPersisted:false;
 readonly originalBancAuthenticityProven:false;
 readonly realSetActorEnablementProven:false;
 readonly originalKccCrossingReplayed:false;
 readonly originalStageLayoutRecovered:false;
 readonly gameplayConnectionsApproved:0;
 readonly newRuntimeSolids:0;
 readonly newNavLinks:0;
 readonly newScoreableSurfaces:0;
 readonly productionAuthorized:false;
}
function missingSourceHolds():readonly W10B11SourceComponentHold[]{
 const records=UNDERTOW_T21_SOURCE_BATCH2_MESHES.filter(x=>
  x.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED');
 if(records.length!==8||records.some(x=>
  !x.sourceComponentId.startsWith('FldObj_Temple01_PntSet_')))
  throw Error('W10B11_UNEXPECTED_ORIGINAL_SET_ACTOR_CANDIDATES');
 return records.map(x=>({
  sourceComponentId:x.sourceComponentId,modelSide:x.side,
  expectedActorClass:'Lft_FldObj_Temple01_PntSet' as const,
  originalSetInstanceIdentified:false as const,
  actorTransformBoundToMesh:false as const,
  originalLayerActivationVerified:false as const,
  sourceSolidPromotionAuthorized:false as const
 }));
}
/** A decompressed/exported Banc object is passed in memory by a future
 * authorized private loader. This function performs NO I/O or deserialization,
 * and makes no claims about file provenance/authenticity. */
export function auditW10SetActorBancEvidence(
 input:unknown,sourceStatus:SourceStatus='ABSENT'
):W10B11EvidenceGateResult{
 if(frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
  frozen.navigationLinks.length!==26||frozen.activationReady||
  UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT.canonicalCurrentStageRowId!=='Vss_Temple01'||
  UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT.sourcePayloadRecovered)
  throw Error('W10B11_FROZEN_SOURCE_AUTHORITY_DRIFT');
 const missing=missingSourceHolds();
 const root=isRecord(input)?input:null;
 const inputStageIdentityValid=root?.stageRowId==='Vss_Temple01';
 const actors=root?.Actors;
 const payloadStructureValid=Array.isArray(actors)&&actors.length<=20000;
 const records:readonly unknown[]=payloadStructureValid?actors as unknown[]:[];
 const knownSetClasses=KNOWN_SET_CLASSES.map(gyaml=>{
  const clsActors=records.filter(actor=>isRecord(actor)&&actor.Gyaml===gyaml);
  const valid=clsActors.filter(validActor).length;
  return {gyaml,seenActorCount:clsActors.length,
   schemaValidCount:valid,schemaInvalidCount:clsActors.length-valid,
   originalObjectInstanceMatchCertified:false as const};
 });
 const recognizedSetActorCount=knownSetClasses.reduce(
  (v,r)=>v+r.seenActorCount,0);
 const validRecognizedSetActorCount=knownSetClasses.reduce(
  (v,r)=>v+r.schemaValidCount,0);
 const malformedRecognizedSetActorCount=
  recognizedSetActorCount-validRecognizedSetActorCount;
 const unrecognizedActorClassCount=records.filter(x=>
  !isRecord(x)||typeof x.Gyaml!=='string'||
  !KNOWN_SET_CLASSES.some(known=>known===x.Gyaml)).length;
 const hold:W10B11Hold=sourceStatus==='ABSENT'||!root?
  'HOLD_NO_BANC_PAYLOAD':!inputStageIdentityValid?
  'HOLD_WRONG_STAGE_IDENTITY':!payloadStructureValid?
  'HOLD_INVALID_BANC_STRUCTURE':recognizedSetActorCount===0?
  'HOLD_NO_RECOGNIZED_TEMPLE01_SET':
  'HOLD_INSTANCE_IDENTITY_UNBOUND';
 return {sourceStatus,hold,expectedStageRowId:'Vss_Temple01',
  inputStageIdentityValid,payloadStructureValid,
  seenActorCount:records.length,unrecognizedActorClassCount,
  recognizedSetActorCount,validRecognizedSetActorCount,
  malformedRecognizedSetActorCount,knownSetClasses,
  stillUnboundOriginalObjects:missing,
  inputCoordinatesReflectedOrPersisted:false,
  originalBancAuthenticityProven:false,realSetActorEnablementProven:false,
  originalKccCrossingReplayed:false,originalStageLayoutRecovered:false,
  gameplayConnectionsApproved:0,newRuntimeSolids:0,newNavLinks:0,
  newScoreableSurfaces:0,productionAuthorized:false};
}
