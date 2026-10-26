/**
 * B240 isolated native Recast root-cause experiment. Source inputs include
 * the real B239 human-capsule KCC walking contact samples; all generation
 * variants are QA-only, never live CPU parameters.
 */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {Vec3} from 'playcanvas';
import {NavMeshQuery} from 'recast-navigation';
import {generateSoloNavMesh} from 'recast-navigation/generators';
import {beforeAll,describe,expect,it} from 'vitest';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation,
 b240IsolatedOriginalStageTriangleSoup,stageNavigationOffMeshConnections}
 from '../src/navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics}
 from '../src/physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS as P}
 from '../src/player/PlayerCharacterPhysics';
import {b236InspectOriginalSlopeEntrance}
 from '../src/stage/undertow/B236OriginalSlope01IngressAudit';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {b240ReadPinnedSource,b240IsolatedOriginalStage,
 B240_SOURCE_PIN,type Side,type V3,type SourceFace} from './t21-b240-pinned-original-floorline-qa';

interface B239ContactSample {
 tick:number;foot:V3;grounded:boolean;physicalSupportId:string;
 verticalError:number|null;
}
interface B239EvidenceSide {
 side:Side;
 actualKcc:{walking:{
  initialReal25Supported:boolean;teleportsAfterSpawn:number;
  exactSourceIngressPhysicallyTraversed:boolean;maxAirborneFrames:number;
  floorlineSupportGroundedTicks:number;slopeGroundedTicks:number;
  sparseFrames:B239ContactSample[]
 }};
}
const CONFIG=GAME_CONFIG.cpu;
const originalCases=[
 {id:'PRODUCTION_BASELINE',cellSize:.18,cellHeight:.10,radius:2,minRegion:3,mergeRegion:8,slope:52},
 {id:'REGION_ZERO_ONLY',cellSize:.18,cellHeight:.10,radius:2,minRegion:0,mergeRegion:0,slope:52},
 {id:'FINER_CELL_CPU_SAFE_012',cellSize:.12,cellHeight:.10,radius:3,minRegion:3,mergeRegion:8,slope:52},
 {id:'FINER_CELL_CPU_SAFE_009',cellSize:.09,cellHeight:.05,radius:4,minRegion:3,mergeRegion:8,slope:52},
 {id:'FINER_CELL_SAFE_NO_REGION_EROSION',cellSize:.09,cellHeight:.05,radius:4,minRegion:0,mergeRegion:0,slope:52},
 {id:'SLOPE_55_ONLY',cellSize:.18,cellHeight:.10,radius:2,minRegion:3,mergeRegion:8,slope:55},
 {id:'RADIUS_1_DIAGNOSTIC_UNSAFE',cellSize:.18,cellHeight:.10,radius:1,minRegion:3,mergeRegion:8,slope:52},
 {id:'RADIUS_0_DIAGNOSTIC_UNSAFE',cellSize:.18,cellHeight:.10,radius:0,minRegion:3,mergeRegion:8,slope:52}
] as const;
type Case=typeof originalCases[number];
const terminal:Record<Side,V3>={
 POSITIVE_Z:[5.604740142822266,4.599999904632568,35.83282470703125],
 NEGATIVE_Z:[-5.375261306762695,4.599999904632568,-35.627174377441406]
};
const toVec=(v:V3)=>new Vec3(...v);
const d3=(a:V3,b:V3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const numeric=(v:number)=>Number.isFinite(v)?v:null;
function center(t:SourceFace):V3{
 return [0,1,2].map(i=>
  (t.vertices[0][i]!+t.vertices[1][i]!+t.vertices[2][i]!)/3) as unknown as V3;
}
function realSupport(physics:RapierStagePhysics,point:V3){
 const hit=physics.castCharacterFootSupport(
  new Vec3(point[0],point[1]+P.humanFootOffsetMeters+.06,point[2]),
  P.humanFootOffsetMeters,'HUMAN');
 return hit?{id:hit.solidId,diffMeters:Math.abs(point[1]-hit.point.y)}:null;
}
function fromB239(){
 const location=process.env.T21_B239_RESULT_OUTPUT;
 if(!location)throw Error('B240_MISSING_ACTUAL_B239_NATIVE_KCC_WITNESS_JSON');
 const o=JSON.parse(readFileSync(location,'utf8')) as {
  version:string;originalSHA256:string;productionAuthorized:boolean;
  liveCpuCrossTeamRoutesCertified:string;results:B239EvidenceSide[]};
 if(o.version!=='B239_TRUE_NATIVE_ISOLATED_SOURCE_INGRESS_QA_V1'||
  o.originalSHA256!==B240_SOURCE_PIN||o.productionAuthorized!==false||
  o.liveCpuCrossTeamRoutesCertified!=='0/12'||o.results.length!==2)
  throw Error('B240_B239_KCC_PROVENANCE_FAILED');
 for(const row of o.results){
  const w=row.actualKcc.walking;
  if(!w.initialReal25Supported||w.teleportsAfterSpawn!==0||
    !w.exactSourceIngressPhysicallyTraversed||w.maxAirborneFrames!==0||
    w.floorlineSupportGroundedTicks<3||w.slopeGroundedTicks<3||
    w.sparseFrames.filter(f=>f.grounded&&
     f.physicalSupportId?.startsWith('B239_PINNED_ORIGINAL_FLOORLINE:')).length<2||
    !w.sparseFrames.some(f=>f.grounded&&
     f.physicalSupportId?.includes('underpass-route-slope01-')))
   throw Error('B240_PRIOR_REAL_PHYSICAL_CROSSING_NOT_PROVEN_'+row.side);
 }
 return o;
}
function nativeProjection(q:NavMeshQuery,point:V3){
 const p=q.findClosestPoint({x:point[0],y:point[1],z:point[2]});
 if(!p.success||!p.point)return {success:false,distanceMeters:null,nearestPoint:null};
 const nearest:[number,number,number]=[p.point.x,p.point.y,p.point.z];
 return {success:true,distanceMeters:d3(point,nearest),nearestPoint:nearest};
}
function nativePath(q:NavMeshQuery,start:V3,end:V3){
 const from=q.findClosestPoint({x:start[0],y:start[1],z:start[2]});
 const to=q.findClosestPoint({x:end[0],y:end[1],z:end[2]});
 if(!from.success||!to.success||!from.point||!to.point)
  return {querySuccess:false,reachedNativeTarget:false,
   snapStart:null,snapEnd:null,endpointError:null,strict:false,pointCount:0};
 const startNear:[number,number,number]=[from.point.x,from.point.y,from.point.z];
 const endNear:[number,number,number]=[to.point.x,to.point.y,to.point.z];
 const path=q.computePath(from.point,to.point);
 const pts=path.success?path.path:[];
 const last=pts.at(-1);
 const error=last?d3([last.x,last.y,last.z],endNear):Infinity;
 const startSnap=d3(start,startNear),endSnap=d3(end,endNear);
 const nativeReached=path.success&&pts.length>0&&error<=.30;
 return {querySuccess:path.success,reachedNativeTarget:nativeReached,
  snapStart:numeric(startSnap),snapEnd:numeric(endSnap),
  endpointError:numeric(error),pointCount:pts.length,
  strict:nativeReached&&startSnap<=.30&&endSnap<=.30};
}
function generateVariation(stage:ReturnType<typeof b240IsolatedOriginalStage>,
 triangleSoup:ReturnType<typeof b240IsolatedOriginalStageTriangleSoup>,
 config:Case){
 const nav=generateSoloNavMesh(triangleSoup.positions,triangleSoup.indices,{
  cs:config.cellSize,ch:config.cellHeight,walkableSlopeAngle:config.slope,
  walkableHeight:CONFIG.navigationWalkableHeightVoxels,
  walkableClimb:CONFIG.navigationWalkableClimbVoxels,
  walkableRadius:config.radius,maxEdgeLen:24,maxSimplificationError:1.1,
  minRegionArea:config.minRegion,mergeRegionArea:config.mergeRegion,
  maxVertsPerPoly:6,detailSampleDist:6,detailSampleMaxError:1,
  offMeshConnections:stageNavigationOffMeshConnections(stage)
 });
 if(!nav.success)throw Error('B240_GENERATOR_'+nav.error);
 return new NavMeshQuery(nav.navMesh);
}
beforeAll(async()=>{await initializeRecastNavigation();await initializeRapier();});
describe('B240 original FloorLine00 Recast parameter isolation',()=>{
 it('measures KCC-proven original feet and exact source centroids against unchanged native Recast',()=>{
  const seed=b240ReadPinnedSource(),kcc=fromB239();
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  expect(CONFIG.navigationCellSizeMeters).toBe(.18);
  expect(CONFIG.navigationWalkableRadiusVoxels).toBe(2);
  expect(CONFIG.agentRadiusMeters).toBe(.30);
  expect(P.humanRadiusMeters).toBe(.32);
  const all=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const s=seed.sides[side];
   const stage=b240IsolatedOriginalStage(side,s);
   const native=new RecastStageNavigation(stage,new PerformanceStats());
   const physics=new RapierStagePhysics(1/60,stage);physics.step();
   const triangleSoup=b240IsolatedOriginalStageTriangleSoup(stage);
   const evidence=kcc.results.find(x=>x.side===side);
   if(!evidence)throw Error('B240_MISSING_KCC_SIDE_'+side);
   const sourceKccFeet=evidence.actualKcc.walking.sparseFrames.filter(f=>
    f.grounded&&(f.physicalSupportId.startsWith('B239_PINNED_ORIGINAL_FLOORLINE:')||
      f.physicalSupportId.includes('underpass-route-slope01-')));
   const slope=b236InspectOriginalSlopeEntrance(side);
   const actualSlopeFoot:V3=[...slope.topFoot];
   const samples=[
    ...s.triangles.map((f,i)=>({id:'ORIGINAL_CENTROID_'+i,position:center(f),
      expectedOriginalSourceId:'B240_EXACT_SOURCE_FLOORLINE:'+side})),
    ...sourceKccFeet.map(x=>({id:'REAL_KCC_TICK_'+x.tick,
      position:x.foot,expectedOriginalSourceId:
       x.physicalSupportId.startsWith('B239_PINNED_ORIGINAL_FLOORLINE:')?
        'B240_EXACT_SOURCE_FLOORLINE:'+side:
        'B235_EXACT_CI688_QA:underpass-route-slope01-'+
         (side==='POSITIVE_Z'?'positive-z':'negative-z')})),
    {id:'ORIGINAL_SLOPE_UPPER_TARGET',position:actualSlopeFoot,
      expectedOriginalSourceId:'B235_EXACT_CI688_QA:underpass-route-slope01-'+
       (side==='POSITIVE_Z'?'positive-z':'negative-z')}
   ];
   // The B239 samples are measurements from actual KCC motion, not
   // synthetic walkways or samples projected onto the Recast mesh.
   const sourceFootSupports=samples.map(x=>{
    const hit=realSupport(physics,x.position);
    return {sample:x.id,sourceId:hit?.id??null,
     expectedSource:x.expectedOriginalSourceId,
     originalRapierSourceSupported:hit?.id===x.expectedOriginalSourceId&&
      hit.diffMeters<=.20,realSupportHeightError:hit?.diffMeters??null};
   });
   const nativeBaseline=samples.map(x=>({
    sample:x.id,projection:native.auditNavMeshProjection(toVec(x.position))
   }));
   const cases=[];
   for(const cfg of originalCases){
    const availableClearanceMeters=cfg.radius*cfg.cellSize;
    const cpuFootprintValid=availableClearanceMeters>=CONFIG.agentRadiusMeters;
    const realHumanCapsuleValid=availableClearanceMeters>=P.humanRadiusMeters;
    let built=false,error:string|null=null;
    let projections:unknown[]=[],pathToSlope:ReturnType<typeof nativePath>|null=null;
    try{
     const query=generateVariation(stage,triangleSoup,cfg);
     built=true;
     projections=samples.map(x=>{
      const p=nativeProjection(query,x.position);
      const snapSupport=p.nearestPoint?realSupport(physics,p.nearestPoint):null;
      return {sample:x.id,expectedOriginalSourceId:x.expectedOriginalSourceId,
       physicalSourceSupported:sourceFootSupports.find(f=>f.sample===x.id)?.originalRapierSourceSupported,
       nativeProjected:p.success,nativeSnapMeters:p.distanceMeters,
       navNearFootPhysicallyMatchingExactSource:
        p.distanceMeters!==null&&p.distanceMeters<=.30&&
        snapSupport?.id===x.expectedOriginalSourceId&&
        snapSupport.diffMeters<=.20,
       navFootRapierSourceId:snapSupport?.id??null};
     });
     pathToSlope=nativePath(query,terminal[side],actualSlopeFoot);
    }catch(e){error=String(e);}
    cases.push({id:cfg.id,config:cfg,
     effectiveErosionMeters:availableClearanceMeters,
     cpuFootprintValid,realHumanCapsuleValid,
     nativeGenerationSucceeded:built,buildError:error,
     originalSourceFeet:projections,navFromRecordedRightLowToSlope:pathToSlope,
     productionRuntimeChanges:0,realCpuAgentNavigationCertified:false});
   }
   // This is a diagnostic measurement, not a conditional permission to
   // install an unrealistically small radius in production.
   expect(cases[0]?.nativeGenerationSucceeded).toBe(true);
   const measured=cases[0]!;
   const baselinePath=measured.navFromRecordedRightLowToSlope;
   const production= native.auditPath(toVec(terminal[side]),toVec(actualSlopeFoot),.30);
   expect(measured.config.radius).toBe(CONFIG.navigationWalkableRadiusVoxels);
   expect(measured.config.cellSize).toBe(CONFIG.navigationCellSizeMeters);
   expect(baselinePath?.snapEnd).not.toBeNull();
   expect(baselinePath?.snapEnd).toBeCloseTo(production.endSnapDistanceMeters,3);
   expect(baselinePath?.snapEnd).toBeGreaterThan(1.0);
   expect(baselinePath?.strict).toBe(false);
   expect(cases.filter(c=>c.id.startsWith('RADIUS_')).every(c=>!c.cpuFootprintValid)).toBe(true);
   expect(sourceFootSupports.filter(x=>x.sample.startsWith('REAL_KCC_TICK_')&&
    x.originalRapierSourceSupported).length).toBeGreaterThanOrEqual(2);
   all.push({side,originalSHA256:B240_SOURCE_PIN,
    nativeProductionBaselineStrict:false,
    realPhysicalWalkFromB239:true,originalKccSampleTicks:sourceKccFeet.map(x=>x.tick),
    sourceFootSupports,referenceBaselineProjections:nativeBaseline,
    sourceSoupTriangles:triangleSoup.indices.length/3,
    cases,originalSourceFaceIndices:s.triangles.map(t=>t.originalFaceIndex)});
  }
  const report={version:'B240_KCC_GROUNDED_ORIGINAL_SOURCE_RECAST_PARAM_ROOT_CAUSE_V1',
   sourceSHA256:B240_SOURCE_PIN,originalGameStage:'25/17/26/0',
   originalLiveCpuRoutesCertified:'0/12',
   sourceGeometryUnchanged:true,addedOriginalTrianglesPerMirror:2,
   originalLinksStill26:true,realCpuActorsInstantiated:false,
   qaParameterSweepsOnly:true,productionAuthorized:false,
   unrestricted4v4Certified:false,officialWinner:'NONE',results:all};
  const file=process.env.T21_B240_RESULT_OUTPUT;
  if(file){mkdirSync(dirname(file),{recursive:true});
   writeFileSync(file,JSON.stringify(report,null,2));}
  console.log('B240_SOURCE_NATIVE_RECAST_ROOT_CAUSE_REPORT',
   JSON.stringify({version:report.version,sha256:report.sourceSHA256,
    sides:all.map(r=>({side:r.side,kccSampleTicks:r.originalKccSampleTicks,
     sourceSupports:r.sourceFootSupports,
     variants:r.cases.map(c=>({case:c.id,
      effectiveErosionMeters:c.effectiveErosionMeters,
      humanClearanceSafe:c.realHumanCapsuleValid,
      generated:c.nativeGenerationSucceeded,error:c.buildError,
      toSlope:c.navFromRecordedRightLowToSlope,
      sourceSamples:(c.originalSourceFeet as Array<{sample:string;nativeSnapMeters:number|null;navNearFootPhysicallyMatchingExactSource:boolean}>)
       .map(x=>({sample:x.sample,snap:x.nativeSnapMeters,onActualSource:x.navNearFootPhysicallyMatchingExactSource}))}))})),
    officialRoutes:'0/12',productionAuthorized:false}));
 },120000);
});
