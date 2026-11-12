import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
// @ts-ignore pinned QA RAW is loaded in Node/Vitest; browser tsconfig has no Node types
import {readFileSync,writeFileSync} from 'node:fs';
// @ts-ignore pinned QA RAW is loaded in Node/Vitest; browser tsconfig has no Node types
import {join} from 'node:path';
declare const process:{env:Record<string,string|undefined>};
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PerformanceStats} from '../../core/PerformanceStats';
import {stageSolidTriangleWorldVertices} from '../StageTriangleMesh';
import {stageSolidNavigationEnabled,type StageSolidDefinition}
 from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';

type FootRow={tick:number;id:string;foot:[number,number,number];
 originalRapierSolidId:string;originalRapierHitY:number;
 absFootToRapierY:number;registeredOriginalHit:boolean};
type Sample={tick:number;sourceId:string;originalFloorY:number;
 originalFace:string;exactFaceFloorY:number|null;
 fullNavY:number|null;localNavY:number|null;
 fullNavGapY:number|null;localNavGapY:number|null;
 fullNavSnapXZ:number|null;localNavSnapXZ:number|null;
 physicalFootY:number;physicalFootToGroundGap:number;
 denyOriginalNativePathGap:number|null;};
const ids=['B2','B4'] as const;
const landing='UndertowT21D:first-drop-landing-negative-z';
const ramp='UndertowT21D:right-low-route-ramp-negative-z';
const low='UndertowT21D:right-low-team-b';
const subset=[landing,ramp,low] as const;
const dt=1/60;
const round=(n:number)=>Number(n.toFixed(6));
const rawDir=process.env.T21_B495_EVIDENCE_DIR;
const vec=(p:readonly number[])=>new Vec3(p[0]!,p[1]!,p[2]!);
const quantile=(values:number[],fraction:number)=>
 values.length?round([...values].sort((a,b)=>a-b)[
  Math.floor((values.length-1)*fraction)]!):null;
function exactSolidFaceAt(solid:StageSolidDefinition,x:number,z:number):
 {face:string;y:number}|null{
 if(!solid.triangleMesh){
  // Original lower landing and right-low have known, unrotated
  // source-backed horizontal top boxes. Rapier remains authoritative
  // for actual masked XZ coverage; this helper never grants support.
  if(solid.rotationEulerDegrees?.some(v=>v!==0))return null;
  return {face:solid.id+':TOP_BOX',y:solid.center[1]+solid.size[1]/2};
 }
 const vertices=stageSolidTriangleWorldVertices(solid);
 const mesh=solid.triangleMesh;
 for(let i=0;i<mesh.indices.length;i+=3){
  const a=vertices[mesh.indices[i]!]!;
  const b=vertices[mesh.indices[i+1]!]!;
  const c=vertices[mesh.indices[i+2]!]!;
  const den=(b[2]-c[2])*(a[0]-c[0])+
   (c[0]-b[0])*(a[2]-c[2]);
  if(Math.abs(den)<1e-9)continue;
  const u=((b[2]-c[2])*(x-c[0])+
   (c[0]-b[0])*(z-c[2]))/den;
  const v=((c[2]-a[2])*(x-c[0])+
   (a[0]-c[0])*(z-c[2]))/den;
  const w=1-u-v;
  if(Math.min(u,v,w)<-0.0001||Math.max(u,v,w)>1.0001)continue;
  return {face:solid.id+':TRIANGLE_'+i/3,
   y:u*a[1]+v*b[1]+w*c[1]};
 }
 return null;
}
const summarize=(rows:Sample[])=>{
 const valid=rows.filter(x=>x.fullNavGapY!==null&&x.localNavGapY!==null);
 const values=(k:keyof Sample)=>valid.map(x=>x[k])
  .filter((n):n is number=>typeof n==='number'&&Number.isFinite(n));
 const original=values('originalFloorY');
 const absFull=values('fullNavGapY').map(Math.abs);
 const absLocal=values('localNavGapY').map(Math.abs);
 const delta=valid.map(x=>Math.abs(x.fullNavGapY!)-Math.abs(x.localNavGapY!));
 return {sampleCount:rows.length,fullAndLocalAvailable:valid.length,
  fullNavAbsYGapMedian:quantile(absFull,.5),
  fullNavAbsYGapP95:quantile(absFull,.95),
  fullNavAbsYGapMax:quantile(absFull,1),
  localNavAbsYGapMedian:quantile(absLocal,.5),
  localNavAbsYGapP95:quantile(absLocal,.95),
  localNavAbsYGapMax:quantile(absLocal,1),
  fullVsLocalAbsYGapMedianDifference:quantile(delta,.5),
  fullNavGapOver025Count:absFull.filter(n=>n>.25).length,
  localNavGapOver025Count:absLocal.filter(n=>n>.25).length,
  fullNavSnapXZMax:quantile(values('fullNavSnapXZ'),1),
  localNavSnapXZMax:quantile(values('localNavSnapXZ'),1),
  originalFloorYRange:
   original.length?[quantile(original,0),quantile(original,1)]:null};
};
beforeAll(async()=>Promise.all([initializeRapier(),initializeRecastNavigation()]));
describe('B495 pinned original SOURCE: exact face vs full/local Recast NavMesh elevation',()=>{
 it.skipIf(!rawDir)('compares 25-solid original to isolated 3-solid native nav across genuine B2 B4 footprints and 60 denied paths',()=>{
  const read=(n:string)=>JSON.parse(readFileSync(join(rawDir!,n),'utf8'));
  const actual=read('b454-native-b2-b4-physical-60hz.json');
  const denial=read('b450-first-original-gap-report.json');
  const topo=read('b487-real-original-16-cross-team-route-audit.json');
  const gaps=read('b488-real-original-f4-gap-authority-hold.json');
  expect(actual.schema).toBe('B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1');
  expect(denial.schema).toBe('B451_REAL_B2_B4_ORIGINAL_CONTACT_GAP_CLASSIFICATION_V2');
  expect([actual.source,denial.originalSource,topo.source,gaps.originalSource])
   .toEqual(['25/17/26/0','25/17/26/0','25/17/26/0','25/17/26/0']);
  expect(actual.browserWorldOrigin).toBe(denial.browserOrigin);
  expect([actual.actorWrites,actual.originalSourceGeometryWrites,
   actual.nativeClockWrites,actual.scoreWrites,
   denial.actorWrites,denial.geometryWrites,denial.clockWrites,
   denial.scoreWrites]).toEqual([0,0,0,0,0,0,0,0]);
  expect([topo.nativePathReportedPairs,topo.nativeCredibleEndpointPairs,
   gaps.currentNativeReportedPaths,gaps.currentNativeCredibleEndpointPairs])
    .toEqual([0,0,0,0]);
  expect(freeze.activationReady).toBe(false);
  const stage=undertowT21dConnectivityQaStage();
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  const solids=subset.map(id=>stage.solids.find(x=>x.id===id));
  expect(solids.every(Boolean)).toBe(true);
  expect(solids.every(x=>stageSolidNavigationEnabled(x!))).toBe(true);
  const localStage={...stage,solids:solids as StageSolidDefinition[],
   navigationLinks:[]};
  const physics=new RapierStagePhysics(dt,stage);
  physics.step();
  const full=new RecastStageNavigation(stage,new PerformanceStats());
  const local=new RecastStageNavigation(localStage,new PerformanceStats());
  const actorSummaries:Record<string,unknown>={};
  let faceFailed=0;
  let denied=0,deniedFirstExact=0;
  const worst:Array<Sample&{absFullGap:number}>=[];
  const observe=(tick:number,p:Vec3,originalId:string,
   knownY:number|null,deniedGap:number|null):Sample=>{
   const hit=physics.castStageSegment(
    new Vec3(p.x,p.y+.65,p.z),
    new Vec3(p.x,p.y-.65,p.z),'ink-projectile');
   expect(hit?.solidId).toBe(originalId);
   if(knownY!==null)expect(Math.abs(hit!.point.y-knownY))
    .toBeLessThan(.005);
   const solid=stage.solids.find(x=>x.id===originalId)!;
   const exact=exactSolidFaceAt(solid,p.x,p.z);
   if(!exact||Math.abs(exact.y-hit!.point.y)>.006)faceFailed++;
   const fp=full.auditNavMeshProjection(p);
   const lp=local.auditNavMeshProjection(p);
   const fPoint=fp.nearestPoint,lPoint=lp.nearestPoint;
   const item:Sample={tick,sourceId:originalId,
    originalFloorY:round(hit!.point.y),
    originalFace:exact?.face??'NO_EXACT_SOURCE_FACE',
    exactFaceFloorY:exact?round(exact.y):null,
    fullNavY:fPoint?round(fPoint.y):null,
    localNavY:lPoint?round(lPoint.y):null,
    fullNavGapY:fPoint?round(fPoint.y-hit!.point.y):null,
    localNavGapY:lPoint?round(lPoint.y-hit!.point.y):null,
    fullNavSnapXZ:fPoint?round(Math.hypot(fPoint.x-p.x,
     fPoint.z-p.z)):null,
    localNavSnapXZ:lPoint?round(Math.hypot(lPoint.x-p.x,
     lPoint.z-p.z)):null,
    physicalFootY:round(p.y),
    physicalFootToGroundGap:round(p.y-hit!.point.y),
    denyOriginalNativePathGap:deniedGap===null?null:round(deniedGap)};
   if(item.fullNavGapY!==null){
    worst.push({...item,absFullGap:Math.abs(item.fullNavGapY)});
   }
   return item;
  };
  for(const id of ids){
   const rows=actual.rows[id] as FootRow[];
   expect(rows).toHaveLength(768);
   const scanned:Sample[]=[];
   for(const row of rows){
    expect(row.registeredOriginalHit).toBe(true);
    scanned.push(observe(row.tick,vec(row.foot),
     row.originalRapierSolidId,row.originalRapierHitY,null));
   }
   const groups=Object.fromEntries(subset.map(s=>[
    s,summarize(scanned.filter(r=>r.sourceId===s))]));
   const rejection=denial.perCpu[id].rejectedOriginalRoutes as Array<{
    firstDenied:{xyz:[number,number,number];hitSolidId:string;
     cause:string;verticalGapMeters:number} }>;
   expect(rejection).toHaveLength(30);
   const deniedRows:Sample[]=[];
   for(const entry of rejection){
    const x=entry.firstDenied;
    expect(x.cause).toBe('NATIVE_PATH_RAPIER_HEIGHT_MISMATCH');
    expect(x.hitSolidId).toBe(landing);
    expect(x.verticalGapMeters).toBeGreaterThan(.25);
    const s=observe(-1,vec(x.xyz),landing,null,x.verticalGapMeters);
    expect(Math.abs(Math.abs(s.physicalFootToGroundGap)-
     x.verticalGapMeters)).toBeLessThan(.005);
    deniedRows.push(s);denied++;
    if(s.originalFace.endsWith(':TOP_BOX'))deniedFirstExact++;
   }
   actorSummaries[id]={realFullRateFootRows:rows.length,
    byActualSourceFloor:groups,
    firstDeniedPathPointCount:rejection.length,
    firstDeniedPathPointSummary:summarize(deniedRows),
    highestFullNavYDisagreements:scanned.filter(x=>x.fullNavGapY!==null)
     .sort((a,b)=>Math.abs(b.fullNavGapY!)-Math.abs(a.fullNavGapY!))
     .slice(0,7)};
  }
  worst.sort((a,b)=>b.absFullGap-a.absFullGap);
  const report={schema:'B495_ORIGINAL_FLOOR_FACE_LOCAL_RECAST_HEIGHT_DIFFERENTIAL_V1',
   source:'25/17/26/0',pinnedRealChromiumRunId:43140584988,
   originalSourceGeometryUnchanged:true,
   originalFullStageSolids:25,
   exactLocalSourceSolidIds:subset,
   localStudySolidsCount:3,localStudyNavigationLinks:0,
   recastCellHeightMeters:0.10,recastCellSizeMeters:0.18,
   originalCpuRadiusMeters:.29,
   originalRecastQueryType:'findClosestPoint_only_not_polygon_identity',
   originalPhysicalQueryType:'real_Rapier_castStageSegment',
   originalGeometryFaceType:'source_triangle_or_top_box',
   sourceFaceYDiscrepancies:faceFailed,
   firstDeniedPathPointCount:denied,
   firstDeniedExactOriginalLandingFaceCount:deniedFirstExact,
   worstFullNativeNavElevationGaps:worst.slice(0,12),
   actors:actorSummaries,
   originalOpponentRoutesAuthorized:0,
   originalStageOrNavigationMutations:0,
   realGameplayActorOrTickMutations:0,
   original72CollisionFaceSemanticsCertified:false,
   verdict:'LOCAL_NAV_Y_DIFFERENTIAL_DIAGNOSTIC_ROUTE_HOLD'};
  expect(denied).toBe(60);
  expect(deniedFirstExact).toBe(60);
  expect(faceFailed).toBe(0);
  if(process.env.T21_B495_REPORT_PATH)
   writeFileSync(process.env.T21_B495_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B495_LOCAL_ORIGINAL_NAV_HEIGHT_DIFFERENTIAL',
   JSON.stringify({schema:report.schema,sourceFaceYDiscrepancies:faceFailed,
    firstDeniedPathPointCount:denied,firstDeniedExactOriginalLandingFaceCount:deniedFirstExact,
    actors:actorSummaries,verdict:report.verdict}));
 });
});
