import {describe,it,expect} from 'vitest';
import {b219TriageOriginalNavmeshSourceFailure as triage}
 from './B219OriginalUnderpassDisconnection';
import {b218OriginalRouteFaceChainSeams}
 from './B218OriginalRouteFaceChainSeams';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
const b218=()=>b218OriginalRouteFaceChainSeams();
const b159=()=>({
 source:'CI688_EXACT_SOURCE_FACES_VS_UNMODIFIED_NATIVE_RECAST_AND_RAPIER' as const,
 originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE' as const,
 sourceOriginalFaceCount:42 as const,originalComponentCount:10 as const,
 attemptedRealNavMeshProjectionQueries:42 as const,
 realOriginalStageRayQueries:42 as const,
 priorCi691ExperimentalFivePerSideInsertionReachedGoal:false as const,
 addedStageGeometry:0 as const,addedOffmeshLinks:0 as const,
 addedScoreableRegions:0 as const,
 originalTwoTeamTraversalCertified:false as const,
 productionAuthorized:false as const,
 components:FACES.map(f=>({id:f.id,side:f.side,
   originalFaceCount:f.mesh.indices.length/3,
   nearNavMeshSamples035m:0,rayHitRegisteredOriginalSolidCount:0,
   exactSourceComponentColliderHitCount:0}))
});
describe('B219 actual original source gap & native face projection triage',()=>{
 it('ranks eight immutable source seams and retains full HOLD',()=>{
  const result=triage(b218(),b159());
  expect(result.results).toHaveLength(8);
  expect(result.firstCandidateToInspect?.inspectionPriority).toBe(
   Math.min(...result.results.map(x=>x.inspectionPriority)));
  expect(result.results.every(x=>!x.actualNativePathFound&&
   !x.actualHumanKccTraversalProven)).toBe(true);
  expect(result.addedGeometry).toBe(0);
  expect(result.addedNavLinks).toBe(0);
  expect(result.productionAuthorized).toBe(false);
 });
 it('a real source gap cannot be misdiagnosed as native traversability',()=>{
  const g=b218(),source=b159();
  const report=triage(g,source);
  for(const row of report.results){
   if(row.exactSourceGapMeters>.3)
    expect(row.diagnosis).toBe('EXACT_ORIGINAL_TRIANGLE_GAP_OVER_30CM');
  }
 });
 it('known too-far original nav projection and exact source face contact differ',()=>{
  const g=b218(),data=b159();
  const hit=g.seams.find(x=>x.gapMeters<=.3);
  if(!hit)return; // Source may prove every gap >.30m.
  const first=triage(g,data).results.find(x=>x.from===hit.from);
  expect(first?.diagnosis).toBe(
    'CLOSE_ORIGINAL_FACES_BUT_SOURCE_NAV_PROJECTION_INCOMPLETE');
  data.components.forEach(x=>{x.nearNavMeshSamples035m=x.originalFaceCount;});
  const next=triage(g,data).results.find(x=>x.from===hit.from);
  expect(next?.diagnosis).toBe(
   'CLOSE_SOURCE_FACES_NOT_CERTIFIED_AS_CONNECTED_NAVMESH');
  expect(next?.actualNativePathFound).toBe(false);
 });
 it('does not accept a manufactured route, invalid rays or source face count',()=>{
  const g=b218(),data=b159();
  expect(()=>triage({...g,productionAuthorized:true as false},data))
   .toThrow();
  expect(()=>triage(g,{...data,addedOffmeshLinks:1 as 0})).toThrow();
  const wrong=b159();
  wrong.components[0]!.nearNavMeshSamples035m=99;
  expect(()=>triage(g,wrong)).toThrow();
 });
});
