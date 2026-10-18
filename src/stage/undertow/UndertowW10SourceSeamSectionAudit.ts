/**
 * W10-B6 — read-only cross-section of EXISTING source Rapier support between
 * the two partial Recast frontier endpoints. No route, floor, navigation,
 * scoreable paint or opponent contact is inferred from a straight section.
 * The three heights are ONLY observed source-terminal levels and interpolation;
 * they are not inferred original walk elevations or a proposed ramp.
 */
import {Vec3} from 'playcanvas';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageVector3} from '../StageDefinition';
import {UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT}
 from './UndertowSpillwayConnectivityQa';
import {auditW10SourceFrontierPair}
 from './UndertowW10SourceFrontierAudit';

export type W10SectionHeightMode=
 'RIGHT_LOW_SOURCE_Y'|'CENTER_LOW_SOURCE_Y'|'LINEAR_INTERPOLATED_Y';
export interface W10SourceSectionSpan{
 readonly fromMeters:number;
 readonly toMeters:number;
 readonly supported:boolean;
 readonly originalSolidId:string|null;
}
export interface W10SourceSectionBand{
 readonly mode:W10SectionHeightMode;
 readonly sampleSpacingAtMostMeters:0.25;
 readonly totalSampleCount:number;
 readonly supportedSampleCount:number;
 readonly unsupportedSampleCount:number;
 readonly firstUnsupportedDistanceMeters:number|null;
 readonly continuousSupportedFromStartMeters:number;
 readonly contiguousSpans:readonly W10SourceSectionSpan[];
 readonly originalSourceOnly:true;
 readonly routeCertified:false;
}
export interface W10SourceSeamSectionResult{
 readonly sourceEndpointA:StageVector3;
 readonly sourceEndpointB:StageVector3;
 readonly planarDirectDistanceMeters:number;
 readonly bands:readonly W10SourceSectionBand[];
 readonly sourceGraphReference:{
  readonly walkableNodesPerSide:number;
  readonly localGapsPerSide:number;
  readonly strictOrdinaryBridges:number;
  readonly offMeshLinkAuthorized:false;
 };
 readonly mirroredFrontierReachable:false;
 readonly inferredBridgeCount:0;
 readonly authoredNewFloorCount:0;
 readonly authoredNewLinkCount:0;
 readonly productionAuthorized:false;
}

function inspectSourceSection(
 physics:RapierStagePhysics,sourceSolidIds:ReadonlySet<string>,
 from:StageVector3,to:StageVector3,mode:W10SectionHeightMode
):W10SourceSectionBand{
 const horizontal=Math.hypot(to[0]-from[0],to[2]-from[2]);
 const steps=Math.max(1,Math.ceil(horizontal/.25));
 let supportedSampleCount=0,unsupportedSampleCount=0;
 let firstUnsupportedDistanceMeters:number|null=null;
 let firstUnsupportedIndex:number|null=null;
 const spans:W10SourceSectionSpan[]=[];
 let key:string|null|undefined=undefined,spanStart=0;
 for(let i=0;i<=steps;i++){
  const t=i/steps;
  const x=from[0]+(to[0]-from[0])*t;
  const z=from[2]+(to[2]-from[2])*t;
  const y=mode==='RIGHT_LOW_SOURCE_Y'?from[1]:
   mode==='CENTER_LOW_SOURCE_Y'?to[1]:
    from[1]+(to[1]-from[1])*t;
  const hit=physics.castStageSegment(new Vec3(x,y+.65,z),
   new Vec3(x,y-.65,z),'ink-projectile');
  const id=hit&&sourceSolidIds.has(hit.solidId)&&
   Math.abs(hit.point.y-y)<=.15?hit.solidId:null;
  if(id!==null) supportedSampleCount++;
  else{
   unsupportedSampleCount++;
   if(firstUnsupportedIndex===null){
    firstUnsupportedIndex=i;
    firstUnsupportedDistanceMeters=horizontal*t;
   }
  }
  if(key===undefined){key=id;spanStart=i;}
  else if(id!==key){
   spans.push({fromMeters:horizontal*spanStart/steps,
    toMeters:horizontal*(i-1)/steps,supported:key!==null,
    originalSolidId:key});
   key=id;spanStart=i;
  }
 }
 spans.push({fromMeters:horizontal*spanStart/steps,
  toMeters:horizontal,supported:key!==null,
  originalSolidId:key??null});
 return {mode,sampleSpacingAtMostMeters:.25,
  totalSampleCount:steps+1,supportedSampleCount,unsupportedSampleCount,
  firstUnsupportedDistanceMeters,
  continuousSupportedFromStartMeters:firstUnsupportedIndex===null?
   horizontal:horizontal*Math.max(0,firstUnsupportedIndex-1)/steps,
  contiguousSpans:spans,originalSourceOnly:true,routeCertified:false};
}

/**
 * Compare only actual frozen source colliders between the W10-B5 partial
 * endpoints. The archived Pass10B graph additionally excludes decorative
 * FloorLine/FloorFence overlays; these are not bridge authorities here.
 */
export function auditW10SourceSeamSection(
 physics:RapierStagePhysics,nav:RecastStageNavigation,
 from:StageVector3,to:StageVector3,sourceSolidIds:ReadonlySet<string>
):W10SourceSeamSectionResult{
 const pair=auditW10SourceFrontierPair(physics,nav,from,to);
 const start=pair.forward.nativeTerminal?.point;
 const end=pair.reverse.nativeTerminal?.point;
 if(!start||!end||!pair.anyDirectionUnreached)
  throw Error('W10_B6_REQUIRES_DISCONNECTED_REAL_NATIVE_TERMINI');
 const graph=UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeRouteGapAudit;
 if(graph.runtimePromotionAuthorized||graph.offMeshLinkAuthorized||
    graph.strictBridgesAfterFloorLineAndFenceOverlayRemoval!==0)
  throw Error('W10_B6_ARCHIVED_SOURCE_GRAPH_AUTHORITY_CHANGED');
 const heightModes:readonly W10SectionHeightMode[]=[
  'RIGHT_LOW_SOURCE_Y','CENTER_LOW_SOURCE_Y','LINEAR_INTERPOLATED_Y'
 ];
 const bands=heightModes.map(mode=>inspectSourceSection(
  physics,sourceSolidIds,start,end,mode));
 return {sourceEndpointA:start,sourceEndpointB:end,
  planarDirectDistanceMeters:Math.hypot(end[0]-start[0],end[2]-start[2]),
  bands,sourceGraphReference:{
   walkableNodesPerSide:graph.sourceWalkableNodeCountPerSide,
   localGapsPerSide:graph.localGapCountPerSide,
   strictOrdinaryBridges:
    graph.strictBridgesAfterFloorLineAndFenceOverlayRemoval,
   offMeshLinkAuthorized:false
  },mirroredFrontierReachable:false,inferredBridgeCount:0,
  authoredNewFloorCount:0,authoredNewLinkCount:0,
  productionAuthorized:false};
}
