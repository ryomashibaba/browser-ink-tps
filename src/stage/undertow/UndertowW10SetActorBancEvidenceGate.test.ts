import {describe,it,expect} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {auditW10SetActorBancEvidence}
 from './UndertowW10SetActorBancEvidenceGate';
describe('W10-B11: original SetActor Banc evidence is missing and fail-closed',()=>{
 it('reports exact eight unresolved FldObj source mesh identities',()=>{
  const absent=auditW10SetActorBancEvidence(undefined);
  expect(absent.hold).toBe('HOLD_NO_BANC_PAYLOAD');
  expect(absent.sourceStatus).toBe('ABSENT');
  expect(absent.knownSetClasses).toHaveLength(5);
  expect(absent.stillUnboundOriginalObjects).toHaveLength(8);
  expect(new Set(absent.stillUnboundOriginalObjects.map(x=>
   x.sourceComponentId)).size).toBe(8);
  expect(absent.stillUnboundOriginalObjects.filter(x=>
   x.modelSide==='POSITIVE_Z')).toHaveLength(4);
  expect(absent.stillUnboundOriginalObjects.filter(x=>
   x.modelSide==='NEGATIVE_Z')).toHaveLength(4);
  expect(absent.stillUnboundOriginalObjects.every(x=>
   !x.originalSetInstanceIdentified&&
   !x.actorTransformBoundToMesh&&
   !x.originalLayerActivationVerified&&
   !x.sourceSolidPromotionAuthorized)).toBe(true);
  // These minimal parser-fixture coordinates are NOT original stage actors,
  // nor authentic archive payloads, and are never sent into gameplay.
  const synthetic={stageRowId:'Vss_Temple01',Actors:[
   {Gyaml:'Lft_FldObj_Temple01_PntSet',Translate:[0,0,0],
    Rotate:[0,0,0],Scale:[1,1,1],Layer:'TEST_ONLY'},
   {Gyaml:'Lft_FldObj_Temple01_PntSet',Translate:[1,2,3],
    Rotate:[0,0,0],Scale:[1,1,1],Layer:'TEST_ONLY'},
   {Gyaml:'Lft_FldObj_Temple01_VlfSet',Translate:[0,0,0],
    Rotate:[0,0,0],Scale:[0,1,1],Layer:'TEST_ONLY'},
   {Gyaml:'UnrelatedActor',Translate:[0,0,0],
    Rotate:[0,0,0],Scale:[1,1,1],Layer:'TEST_ONLY'}
  ]};
  const trial=auditW10SetActorBancEvidence(synthetic,'SYNTHETIC_FIXTURE');
  expect(trial.hold).toBe('HOLD_INSTANCE_IDENTITY_UNBOUND');
  expect(trial.payloadStructureValid).toBe(true);
  expect(trial.recognizedSetActorCount).toBe(3);
  expect(trial.validRecognizedSetActorCount).toBe(2);
  expect(trial.malformedRecognizedSetActorCount).toBe(1);
  expect(trial.unrecognizedActorClassCount).toBe(1);
  expect(trial.stillUnboundOriginalObjects).toEqual(
   absent.stillUnboundOriginalObjects);
  const spoofed=auditW10SetActorBancEvidence({
   ...synthetic,stageRowId:'Vss_Nagasaki03'},
   'UNVERIFIED_DECODED_BANC');
  expect(spoofed.hold).toBe('HOLD_WRONG_STAGE_IDENTITY');
  expect(auditW10SetActorBancEvidence({
   stageRowId:'Vss_Temple01',Actors:{}},
   'UNVERIFIED_DECODED_BANC').hold).toBe('HOLD_INVALID_BANC_STRUCTURE');
  for(const x of [absent,trial,spoofed]){
   expect(x.originalBancAuthenticityProven).toBe(false);
   expect(x.originalStageLayoutRecovered).toBe(false);
   expect(x.originalKccCrossingReplayed).toBe(false);
   expect(x.realSetActorEnablementProven).toBe(false);
   expect(x.inputCoordinatesReflectedOrPersisted).toBe(false);
   expect(x.gameplayConnectionsApproved).toBe(0);
   expect(x.newRuntimeSolids).toBe(0);
   expect(x.newNavLinks).toBe(0);
   expect(x.newScoreableSurfaces).toBe(0);
   expect(x.productionAuthorized).toBe(false);
  }
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_W10B11_SET_ACTOR_INTAKE',JSON.stringify({
   absent,syntheticFixture:{
    hold:trial.hold,recognized:trial.recognizedSetActorCount,
    valid:trial.validRecognizedSetActorCount,
    malformed:trial.malformedRecognizedSetActorCount,
    sourceAuthenticated:false,originalActorsIncluded:false
   },rawBancDataInPublicCi:false,productionAuthorized:false
  }));
 });
});
