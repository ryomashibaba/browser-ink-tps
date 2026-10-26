/**
 * W10-B227: compare actual registered Rapier floor and Recast navigation
 * exactly at the B226 genuine human keyboard waypoints, on both mirrors.
 * The previous 18BH..18CA diagnostics explored grid phase/proxy bounds.
 * This is a NEW physical-vs-nav QA witness, not another Recast parameter
 * sweep, staged connector, synthetic CPU route, or runtime promotion.
 */
import {beforeAll,describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {RecastStageNavigation,initializeRecastNavigation}
 from '../src/navigation/RecastStageNavigation';
import {RapierStagePhysics,initializeRapier}
 from '../src/physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS}
 from '../src/player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from '../src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageVector3,StageSolidDefinition}
 from '../src/stage/StageDefinition';
import {GAME_CONFIG} from '../src/config/game/gameConfig';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type AnchorName='floor01'|'outerSlope'|'floor02'|'innerSlope'|'underpass';
type Anchor=Readonly<{name:AnchorName;id:string;point:StageVector3}>;
const FACE_PREFIX='B227_QA_EXACT_SOURCE:';
function project(x:number,y:number,z:number,side:Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
function anchors(side:Side):readonly Anchor[]{
 const suffix=side==='POSITIVE_Z'?'positive-z':'negative-z';
 return [
  {name:'floor01',id:FACE_PREFIX+'underpass-route-floor-concrete01-'+suffix,
   point:project(-6,3,21.9,side)},
  {name:'outerSlope',id:FACE_PREFIX+'underpass-route-slope00-outer-'+suffix,
   point:project(-6,3+(19.5-19.1)/3,19.1,side)},
  {name:'floor02',id:FACE_PREFIX+'underpass-route-floor-concrete02-'+suffix,
   point:project(-6,4.5,14.30,side)},
  {name:'innerSlope',id:FACE_PREFIX+'underpass-route-slope00-inner-'+suffix,
   point:project(-12.05,3+(10.15-6)/3,10.15,side)},
  // Candidate near lower tip of exact inner source. Only a candidate:
  // actual original registered solid/physical foot support decides.
  {name:'underpass',id:'ORIGINAL_REGISTERED_UNDERPASS_CANDIDATE',
   point:project(-12.1,3,5.5,side)}
 ];
}
function buildQaStage(side:Side|null):StageDefinition{
 const source:StageSolidDefinition[]=side===null?[]:
  FACES.filter(f=>f.side===side).map(f=>{
   const verts=f.mesh.vertices;
   const size:StageVector3=([0,1,2] as const).map(axis=>
    Math.max(...verts.map(v=>v[axis]))-Math.min(...verts.map(v=>v[axis]))
   ) as unknown as StageVector3;
   return {id:FACE_PREFIX+f.id,center:[0,0,0],size,
    material:'medium',render:false,cameraBlocker:false,
    projectileBlocker:false,collisionEnabled:true,
    navigationEnabled:true,triangleMesh:f.mesh};
  });
 return {
  metadata:{id:'b227-real-source-native-interface-'+(side??'25'),
   displayName:'B227 QA native floor/nav interface',
   worldBounds:FROZEN.worldBounds,
   teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
   teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
   tacticalNodes:[],splatZones:[]},
  solids:[...FROZEN.solids,...source],
  paintSurfaces:FROZEN.paintSurfaces,
  navigationLinks:FROZEN.navigationLinks
 };
}
type NavStatus={
 buildSuccess:boolean;buildError:string|null;
 projection:ReadonlyArray<unknown>;
 paths:ReadonlyArray<unknown>;
};
function asPoint(p:StageVector3){return new Vec3(p[0],p[1],p[2]);}
function navCheck(stage:StageDefinition,a:readonly Anchor[]):NavStatus{
 try{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const projection=a.map(v=>{
   const result=nav.auditNavMeshProjection(asPoint(v.point));
   const supportedByNativeNav=result.success&&
    result.distanceMeters!==null&&result.distanceMeters<=.3;
   return {anchor:v.name,sourceExpected:v.id,...result,
    physicalSourceAndNativeNavDoNotImplySamePolygon:true,
    directlyTrusted: supportedByNativeNav};
  });
  const pairs=[
   [0,1],[1,2],[2,3],[3,4],[0,3],[0,4]
  ] as const;
  const paths=pairs.map(([i,j])=>{
   const start=a[i]!,end=a[j]!;
   const r=nav.auditPath(asPoint(start.point),asPoint(end.point),.30);
   const snapped=Number.isFinite(r.startSnapDistanceMeters)&&
    Number.isFinite(r.endSnapDistanceMeters)&&
    r.startSnapDistanceMeters<=.30&&r.endSnapDistanceMeters<=.30;
   return {from:start.name,to:end.name,
    querySuccess:r.querySuccess,pointCount:r.pointCount,
    startSnapMeters:r.startSnapDistanceMeters,
    endSnapMeters:r.endSnapDistanceMeters,
    endpointErrorMeters:r.endpointErrorMeters,
    reachedSnappedTarget:r.reachedTarget,
    directTrustedEndpoints:snapped,
    representationalPathCandidate:snapped&&r.reachedTarget,
    kccCertified:false};
  });
  return {buildSuccess:true,buildError:null,projection,paths};
 }catch(error){
  return {buildSuccess:false,
   buildError:error instanceof Error?error.message:String(error),
   projection:[],paths:[]};
 }
}
function rapierCheck(stage:StageDefinition, a:readonly Anchor[]){
 const physics=new RapierStagePhysics(1/60,stage);
 physics.step();
 const points=a.map(v=>{
  const p=v.point;
  const body=new Vec3(p[0],
   p[1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.06,p[2]);
  const hit=physics.castCharacterFootSupport(
    body,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
  return {anchor:v.name,sourceExpected:v.id,
   hitSolidId:hit?.solidId??null,
   footSurfaceY:hit?.point.y??null,
   expectedModelFloorY:p[1],
   footHeightMismatchMeters:hit?Math.abs(hit.point.y-p[1]):null,
   expectedSourceColliderContact:hit?.solidId===v.id,
   registeredNativeRuntimeColliderContact:!!hit&&
    FROZEN.solids.some(s=>s.id===hit.solidId)};
 });
 return points;
}

beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B227 original human real physical source floor vs production Recast projection',()=>{
 it('audits 25 runtime plus same-side 5 exact CI688 source meshes without promotion',()=>{
  expect(FROZEN.activationReady).toBe(false);
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FACES.filter(f=>f.side==='POSITIVE_Z')).toHaveLength(5);
  expect(FACES.filter(f=>f.side==='NEGATIVE_Z')).toHaveLength(5);
  expect(GAME_CONFIG.cpu.navigationCellSizeMeters).toBe(.18);
  expect(GAME_CONFIG.cpu.navigationWalkableRadiusVoxels).toBe(2);
  const baseline=buildQaStage(null);
  expect(baseline.solids).toHaveLength(25);
  const records=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const qa=buildQaStage(side);
   const a=anchors(side);
   expect(qa.solids).toHaveLength(30);
   expect(qa.solids.slice(0,25)).toEqual(FROZEN.solids);
   expect(qa.paintSurfaces).toEqual(FROZEN.paintSurfaces);
   expect(qa.navigationLinks).toEqual(FROZEN.navigationLinks);
   const baselinePhysical=rapierCheck(baseline,a);
   const exactSourcePhysical=rapierCheck(qa,a);
   const baseNav=navCheck(baseline,a);
   const sourceNav=navCheck(qa,a);
   records.push({side,
    physicalCollider:exactSourcePhysical,
    originalNative25Collider:baselinePhysical,
    originalNative25Recast:baseNav,
    qaExactSourceAddedNav:sourceNav,
    qaSideSourceMeshCount:5,
    physicalAddedSolids:5,liveRuntimeStageModified:false,
    navMeshConfigModified:false,offMeshAdded:0,
    originalOpposingPathsCertified:'0/12'});
  }
  console.log('B227_REAL_NATIVE_ORIGINAL_SOURCE_RAPIER_RECAST_INTERFACE',
   JSON.stringify({schema:'B227_AUDITED_KCC_ANCHORS_VS_NATIVE_RECAST',
    qaOnly:true,stageSourceOriginal:'25/17/26/0',
    runtimePromotionAuthorized:false,
    originalStagePhysicallyModified:false,
    scoreablePromotions:0,
    officialWinner:'NONE',productionAuthorized:false,
    priorCi691FivePlusFiveNavmeshFailurePreserved:true,
    records}));
  expect(records).toHaveLength(2);
  expect(records.every(x=>x.physicalCollider.length===5&&
    x.originalNative25Collider.length===5&&
    x.qaSideSourceMeshCount===5&&x.physicalAddedSolids===5)).toBe(true);
  expect(records.every(x=>x.physicalCollider
   .slice(0,4).every(p=>p.expectedSourceColliderContact))).toBe(true);
  // B227 CI #40296331486: explicitly distinguish two separate failures.
  // The authentic 25-solid runtime lacks these 4 source-face colliders;
  // adding 5 exact faces in *isolated* QA does not make Recast choose a
  // valid native path over all four human-physically proven transitions.
  for(const record of records){
   expect(record.originalNative25Collider.slice(0,4)
     .every(p=>p.hitSolidId===null)).toBe(true);
   expect(record.originalNative25Collider[4]?.registeredNativeRuntimeColliderContact)
    .toBe(true);
   expect(record.originalNative25Recast.buildSuccess).toBe(true);
   expect(record.qaExactSourceAddedNav.buildSuccess).toBe(true);
   expect(record.originalNative25Recast.projection
    .slice(0,4).every(p=>!p.success)).toBe(true);
   expect(record.qaExactSourceAddedNav.projection
    .filter(p=>['floor01','outerSlope','innerSlope','underpass']
     .includes(p.anchor)).every(p=>p.directlyTrusted)).toBe(true);
   const nav=record.qaExactSourceAddedNav.paths;
   const edge=(from:string,to:string)=>nav.find(x=>x.from===from&&x.to===to);
   expect(edge('floor01','outerSlope')?.representationalPathCandidate).toBe(false);
   expect(edge('outerSlope','floor02')?.representationalPathCandidate).toBe(false);
   expect(edge('floor02','innerSlope')?.representationalPathCandidate).toBe(false);
   // Native Recast finds local inner-slope to registered underpass:
   // the KCC has not traversed that fourth link, so not physical proof.
   expect(edge('innerSlope','underpass')?.representationalPathCandidate).toBe(true);
   expect(edge('floor01','underpass')?.representationalPathCandidate).toBe(false);
  }
  console.log('B227_NATIVE_INTERFACE_REGRESSION_PASS',JSON.stringify({
   original25SourceFloorSupports:'0/8',qa30AuthenticSupports:'8/8',
   qa30NativeRecastFourSegmentEdges:'1/4_ON_EACH_SIDE',
   firstGapHumanJumpRequired:true,
   nextTwoGroundedHumanButRecastDisconnected:true,
   finalInnerToRegisteredUnderpassNavOnly:true,
   physicalAndNavigationAreNotInterchangeable:true,
   productionAuthorized:false,officialWinner:'NONE'
  }));
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
 },120000);
});
