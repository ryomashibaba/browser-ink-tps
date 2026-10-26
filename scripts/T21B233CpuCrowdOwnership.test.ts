import {beforeAll,describe,it,expect} from 'vitest';
import {initializeRapier} from '../src/physics/RapierStagePhysics';
import {initializeRecastNavigation} from '../src/navigation/RecastStageNavigation';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as CI688}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {b233RunRealCrowdOwnershipQa} from '../src/ai/B233CpuCrowdKccOwnershipQa';
import type {B230LocalGapPlan,B230Side,B230Direction}
 from '../src/ai/B230CpuLocalGapQaActuator';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';

function stage(side:B230Side,nav:boolean):StageDefinition{
 const names=nav?['floor-concrete01','slope00-outer',
  'floor-concrete02','slope00-inner','slope01']:
  ['floor-concrete01','slope00-outer'];
 const extra:StageSolidDefinition[]=names.map(n=>{
  const face=CI688.find(f=>f.id==='underpass-route-'+n+
   (side==='POSITIVE_Z'?'-positive-z':'-negative-z'));
  if(!face)throw Error('B233_MISSING_CI688_FACE');
  const v=face.mesh.vertices;
  const size:StageVector3=[
   Math.max(...v.map(p=>p[0]))-Math.min(...v.map(p=>p[0])),
   Math.max(...v.map(p=>p[1]))-Math.min(...v.map(p=>p[1])),
   Math.max(...v.map(p=>p[2]))-Math.min(...v.map(p=>p[2]))
  ];
  return {id:(nav?'B231_QA:':'B230_QA:')+face.id,
   center:[0,0,0],size,material:'medium',render:false,
   cameraBlocker:false,projectileBlocker:false,
   collisionEnabled:true,navigationEnabled:nav,triangleMesh:face.mesh};
 });
 return {metadata:{id:nav?'b231-native-crowd-proxy-qa':
  'b230-exact-source-local-cpu-qa',
  displayName:'B233 native Crowd and same-body Rapier owned QA',
  worldBounds:ORIGINAL.worldBounds,teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
  teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
  tacticalNodes:[],splatZones:[]},
  solids:[...ORIGINAL.solids,...extra],
  paintSurfaces:ORIGINAL.paintSurfaces,navigationLinks:ORIGINAL.navigationLinks};
}
function pt(x:number,y:number,z:number,side:B230Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
function plan(side:B230Side,direction:B230Direction):B230LocalGapPlan{
 return {side,direction,permitPhysicalLocalJump:true,
  start:direction==='FLOOR_TO_SLOPE'?pt(-6,3,23.4,side):
   pt(-6,3+(19.5-17)/3,17,side),
  target:direction==='FLOOR_TO_SLOPE'?
   pt(-6,3+(19.5-19.1)/3,19.1,side):pt(-6,3,21.9,side)};
}
beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B233 actual native Crowd → same KCC jump → fresh native Crowd ownership',()=>{
 it('audits four original mirrored route continuations as one strict QA pipeline',()=>{
  expect(ORIGINAL.solids).toHaveLength(25);
  expect(ORIGINAL.paintSurfaces).toHaveLength(17);
  expect(ORIGINAL.navigationLinks).toHaveLength(26);
  expect(ORIGINAL.activationReady).toBe(false);
  const results=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const)
   for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'] as const)
    results.push(b233RunRealCrowdOwnershipQa(
     stage(side,false),stage(side,true),plan(side,direction)));
  console.log('B233_NATIVE_CROWD_TO_SAME_PHYSICAL_KCC_TO_CROWD',
   JSON.stringify({results,qaOnly:true,
    realCpuAgentSystemInstantiated:false,
    originalStageUnchanged:'25/17/26/0',
    originalRecastFirstGapDisconnected:true,
    realOpposingRoutesCertified:'0/12',
    noOffmeshOrFakeGeometry:true,officialWinner:'NONE',
    productionAuthorized:false}));
  expect(results).toHaveLength(4);
  // First genuine continuous native CI #40311198089 measured 4/4.
  // Make every ownership boundary, original source foot, no-Recast-walk
  // gap and physically moving postjump agent a hard regression gate.
  expect(results.every(x=>
   x.completed&&x.cause==='QA_NATIVE_CROWD_TO_KCC_JUMP_TO_CROWD'&&
   x.initialSourceFootVerified&&x.approachNativeRecastPathReached&&
   x.approachCrowdActualKccFrames>=12&&
   x.approachOriginalSourceFootFrames===x.approachCrowdActualKccFrames&&
   x.approachActualKccTravelMeters>=.48&&
   x.preJumpCrowdRemoved&&x.sourceOwnedTakeoff&&x.oneRealJump&&
   x.actualRapierAirborne&&x.realSourceLanding18Ticks&&
   x.landingNativeCrowdHold&&x.rejoinedCrowdLocalPathReached&&
   x.resumedCrowdPhysicalKccFrames>=10&&
   x.rejoinedPhysicalTravelMeters>=.45&&
   x.nativeCrossGapRecastConnected===false&&
   x.originalStage==='25/17/26/0'&&
   x.realCpuOpponentRoutesCertified==='0/12'&&
   x.sourceOnlySandbox===true&&
   x.originalCpuAgentSystemUsed===false&&
   x.productionAuthorized===false&&x.officialWinner==='NONE')).toBe(true);
  console.log('B233_TRUE_CROWD_KCC_JUMP_CROWD_FULL_SOURCE_SEQUENCE_4_PASS',
   JSON.stringify({originalMirroredDirections:4,realCrowdApproaches:4,
    exactSourceGroundedPhysicalJumps:4,
    trueNativeCrowdRejoinsAndMotion:4,
    artificialWalkableNavBridge:0,realLiveCpuAgentSystemInstantiated:false,
    certifiedOpponentCrossings:'0/12',productionAuthorized:false}));
 },120000);
 it('prevents accidental stage/authority promotion and unapproved jump',()=>{
  const source=stage('POSITIVE_Z',false);
  const nav=stage('POSITIVE_Z',true);
  const goal=plan('POSITIVE_Z','FLOOR_TO_SLOPE');
  expect(()=>b233RunRealCrowdOwnershipQa(source,nav,
   {...goal,permitPhysicalLocalJump:false}))
   .toThrow('B233_PHYSICAL_JUMP_PERMISSION_MISSING');
  expect(()=>b233RunRealCrowdOwnershipQa({
   ...source,metadata:{...source.metadata,id:'live-stage'}},nav,goal))
   .toThrow('B233_STAGE_OR_AUTHORITY_NOT_ISOLATED');
  const fake=[...source.solids];fake[26]={...fake[26]!,navigationEnabled:true};
  expect(()=>b233RunRealCrowdOwnershipQa({...source,solids:fake},nav,goal))
   .toThrow('B233_EXACT_CI688_SOURCE_PROVENANCE_FAILED');
 },120000);
});
