/**
 * W10-B7: isolated, nav-only experiment for the ten already verified Temple01
 * original underpass floor/slope components, without changing the 25 frozen
 * solids, game physics, paint, off-mesh links, actor routes or production.
 *
 * All five candidates per mirrored side FAILED to connect the partial
 * NavMesh in archived CI #691. This runs a reproducible cumulative-prefix
 * and individual-component isolation to identify exactly which source mesh
 * changes the partial Recast frontier. A partial path is NOT a walkable route.
 */
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../../core/PerformanceStats';
import {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../StageDefinition';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,
 undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT,
 undertowUnderpassRouteStageSolids} from './UndertowSpillwayUnderpassRouteGeometry';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
export type W10CandidateExperimentKind='BASELINE'|'PREFIX'|'ISOLATED';
export interface W10CandidateRecastSnapshot {
 readonly id:string;
 readonly side:Side;
 readonly kind:W10CandidateExperimentKind;
 readonly prefixCount:number;
 readonly sourceComponentIds:readonly string[];
 readonly sourceGraphComponentIds:readonly number[];
 readonly navOnlyAdditionalSolids:number;
 readonly querySuccess:boolean;
 readonly nativePathReached:boolean;
 readonly nativePathPointCount:number;
 readonly nativeEndSnapMeters:number;
 readonly nativeEndpointErrorMeters:number;
 readonly nativeTerminal:StageVector3|null;
 readonly nativeTerminalDistanceToTargetMeters:number|null;
 readonly unchangedProductionRoutes:true;
 readonly kccTraversabilityCertified:false;
 readonly sourcePromoted:false;
 readonly productionAuthorized:false;
}
export interface W10CandidateIsolationResult {
 readonly snapshots:readonly W10CandidateRecastSnapshot[];
 readonly allSourceComponentsAlreadyVerified:true;
 readonly archivedFiveEachSideDidNotConnect:true;
 readonly archivedBaselineEndpointErrorMeters:number;
 readonly archivedCandidateEndpointErrorMeters:number;
 readonly frozenSourceSolidCount:25;
 readonly frozenPaintSurfaceCount:17;
 readonly frozenNavigationLinkCount:26;
 readonly allCandidatesNavOnly:true;
 readonly originalLocalKccTracesReplayed:0;
 readonly productionAuthorized:false;
}

/** Test-only StageDefinition; never mutate objects used by live gameplay. */
function stageWithNavOnlyCandidates(
 base:StageDefinition,chosenIds:ReadonlySet<string>,
 candidateSolids:readonly StageSolidDefinition[]
):StageDefinition{
 const chosen=candidateSolids.filter(s=>
  chosenIds.has(s.id.replace(/^UndertowT21D:/,'')));
 return {
  ...base,metadata:{...base.metadata,
   id:'undertow-w10b7-disposable-nav-isolation'},
  solids:[...base.solids,...chosen.map(s=>({
   ...s,collisionEnabled:false,navigationEnabled:true,
   render:false,projectileBlocker:false,cameraBlocker:false
  }))],
  paintSurfaces:base.paintSurfaces,navigationLinks:base.navigationLinks
 };
}

function record(
 nav:RecastStageNavigation,
 kind:W10CandidateExperimentKind,
 components:readonly typeof UNDERTOW_UNDERPASS_ROUTE_COMPONENTS[number][],
 side:Side,from:StageVector3,to:StageVector3
):W10CandidateRecastSnapshot{
 const path=nav.auditPath(new Vec3(...from),new Vec3(...to));
 const final=path.nativePathPoints.at(-1);
 const terminal=final?[final.x,final.y,final.z] as StageVector3:null;
 return {id:side+'-'+kind+'-'+components.length,side,kind,
  prefixCount:components.length,
  sourceComponentIds:components.map(x=>x.id),
  sourceGraphComponentIds:components.map(x=>x.routeGraphComponentId),
  navOnlyAdditionalSolids:components.length,
  querySuccess:path.querySuccess,nativePathReached:path.reachedTarget&&
   path.startSnapDistanceMeters<=.25&&path.endSnapDistanceMeters<=.25,
  nativePathPointCount:path.pointCount,
  nativeEndSnapMeters:path.endSnapDistanceMeters,
  nativeEndpointErrorMeters:path.endpointErrorMeters,
  nativeTerminal:terminal,
  nativeTerminalDistanceToTargetMeters:terminal?Math.hypot(
   terminal[0]-to[0],terminal[1]-to[1],terminal[2]-to[2]):null,
  unchangedProductionRoutes:true,kccTraversabilityCertified:false,
  sourcePromoted:false,productionAuthorized:false};
}

/** Candidate prefix order is the exact source chain order, not invented links. */
export function auditW10CandidateNavIsolation():W10CandidateIsolationResult{
 const original=undertowT21dConnectivityQaStage();
 const candidates=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS;
 const solids=undertowUnderpassRouteStageSolids();
 if(original.solids.length!==25||original.paintSurfaces.length!==17||
    original.navigationLinks?.length!==26||candidates.length!==10||
    solids.length!==10||candidates.some(c=>c.confidence!=='HIGH')||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.runtimePromotionAuthorized||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.offMeshLinkAuthorized)
  throw Error('W10_B7_FROZEN_OR_SOURCE_AUTHORITY_DRIFT');
 const originalSolidIds=new Set(original.solids.map(s=>s.id));
 if(solids.some(s=>originalSolidIds.has(s.id)))
  throw Error('W10_B7_NAV_ONLY_CANDIDATE_DUPLICATE_SOLID');
 const probes=UNDERTOW_T21D_CONNECTIVITY_PROBES.filter(
  x=>x.id.startsWith('right-low-to-underpass-'));
 if(probes.length!==2)throw Error('W10_B7_MIRRORED_PROBE_DRIFT');
 const bySide=([
  ['POSITIVE_Z',probes.find(p=>p.id.endsWith('positive-z'))],
  ['NEGATIVE_Z',probes.find(p=>p.id.endsWith('negative-z'))]
 ] as const).map(([side,probe])=>{
  if(!probe)throw Error('W10_B7_MISSING_SIDE_PROBE');
  return {side,probe,
   chain:candidates.filter(c=>c.side===side)};
 });
 if(bySide.some(x=>x.chain.length!==5))
  throw Error('W10_B7_MISSING_EXACT_FIVE_SOURCE_FLOORS');
 const snapshots:W10CandidateRecastSnapshot[]=[];
 // Only ten isolated nav additions. No Rapier collision authoring, ever.
 // Evaluate baseline, 5 cumulative prefixes, and all 5 one-component
 // ablations (11 nav builds total, each with the mirrored counterparts).
 const groups:Array<{kind:W10CandidateExperimentKind,componentIds:string[]}>=
  [{kind:'BASELINE',componentIds:[]}];
 for(let n=1;n<=5;n++)groups.push({
  kind:'PREFIX',
  componentIds:bySide.flatMap(x=>x.chain.slice(0,n).map(c=>c.id))
 });
 for(let n=0;n<5;n++)groups.push({
  kind:'ISOLATED',componentIds:bySide.map(x=>x.chain[n]!.id)
 });
 for(const group of groups){
  const stage=stageWithNavOnlyCandidates(
   original,new Set(group.componentIds),solids);
  if(stage.paintSurfaces!==original.paintSurfaces||
     stage.navigationLinks!==original.navigationLinks||
     stage.solids.length!==25+group.componentIds.length||
     stage.solids.slice(0,25).some((s,i)=>s!==original.solids[i])||
     stage.solids.slice(25).some(s=>
      s.collisionEnabled!==false||s.navigationEnabled!==true||
      s.render!==false||s.projectileBlocker!==false))
   throw Error('W10_B7_CANDIDATE_ESCAPED_NAV_ONLY_ISOLATION');
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  for(const side of bySide){
   const active=side.chain.filter(c=>group.componentIds.includes(c.id));
   snapshots.push(record(nav,group.kind,active,
    side.side,side.probe.from,side.probe.to));
  }
 }
 return {snapshots,allSourceComponentsAlreadyVerified:true,
  archivedFiveEachSideDidNotConnect:true,
  archivedBaselineEndpointErrorMeters:
   UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeEndpointErrorMeters,
  archivedCandidateEndpointErrorMeters:
   UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeEndpointErrorMeters,
  frozenSourceSolidCount:25,frozenPaintSurfaceCount:17,
  frozenNavigationLinkCount:26,allCandidatesNavOnly:true,
  originalLocalKccTracesReplayed:0,productionAuthorized:false};
}
