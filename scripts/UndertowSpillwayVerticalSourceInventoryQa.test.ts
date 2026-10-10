import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

interface VerticalSource {
  sourceComponentId:string;
  sourceObject:string;
  sourceMaterial:string;
  sourceAreaSquareMeters:number;
  faceCount:number;
  minSourceFaceIndex:number;
  minAbsNormalY:number;
  maxAbsNormalY:number;
  bboxProjectXYZ:number[];
  yRangeProjectMeters:number[];
  diagnosticPlanZone:string;
  insideHardBoundarySamples:number;
  outsideHardBoundarySamples:number;
  boundarySampleAuthority:string;
  potentialRole:string;
  sourceGeometryAuthority:string;
  placementAuthority:string;
  connectivityConfidence:string;
  paintCollisionNavAuthority:string;
  reviewOnly:true;
  runtimePromotionAuthorized:false;
}
interface VerticalInventory {
  version:string;sourceAuditVersion:string;sourceScope:string;
  sourceVerticalMaxAbsoluteNormalY:number;
  minimum3DSourceAreaSquareMeters:number;
  minimumVerticalSpanMeters:number;
  sourceComponentCount:number;
  rejectedTinyAreaCount:number;
  rejectedInsufficientHeightCount:number;
  zoneStats:Record<string,{candidateCount:number;fullyInside7SamplesCount:number;outOfOutlineCandidateCount:number;sourceTriangleAreaSumSquareMeters:number}>;
  candidates:VerticalSource[];
  sourceTextureAndActorLimit:string;
  boundaryLimit:string;
  noInferredRuntimeAuthority:true;
  reviewOnly:true;runtimePromotionAuthorized:false;
}
const ZONES=['CENTER','POS','NEG','LEFT_SIDE','RIGHT_SIDE'];
describe('T21 Phase5A whole-stage vertical source inventory',()=>{
  it('is a strict source-only, NO runtime stage promotion inventory',()=>{
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    const p=process.env.T21_VERTICAL_SOURCE_JSON;
    if(!p||!existsSync(p)){
      console.log('T21 Phase5A original Temple01 vertical source fixture only supplied in PR CI');
      return;
    }
    const data=JSON.parse(readFileSync(p,'utf8')) as VerticalInventory;
    expect(data).toMatchObject({
      version:'T21_VERTICAL_SOURCE_COMPONENTS_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      sourceScope:'ACTIVE_TEMPLE01_ORIGINAL_SOURCE_TRIANGLES_WITH_STRONGLY_VERTICAL_NORMAL',
      sourceVerticalMaxAbsoluteNormalY:0.32,
      minimum3DSourceAreaSquareMeters:4,
      minimumVerticalSpanMeters:0.8,
      noInferredRuntimeAuthority:true,reviewOnly:true,runtimePromotionAuthorized:false,
      boundaryLimit:'7_SAMPLE_APPROXIMATION_NOT_EXACT_POLYGON_CLIP'
    });
    expect(data.sourceComponentCount).toBe(data.candidates.length);
    expect(data.sourceComponentCount).toBeGreaterThan(5);
    expect(data.rejectedTinyAreaCount).toBeGreaterThanOrEqual(0);
    expect(data.rejectedInsufficientHeightCount).toBeGreaterThanOrEqual(0);
    const ids=new Set(data.candidates.map(v=>v.sourceComponentId));
    expect(ids.size).toBe(data.sourceComponentCount);
    expect(data.candidates.every(c=>
      c.reviewOnly && c.runtimePromotionAuthorized===false &&
      c.sourceAreaSquareMeters>=4 &&
      c.yRangeProjectMeters.length===2 &&
      c.yRangeProjectMeters.every(Number.isFinite) &&
      c.yRangeProjectMeters[1]-c.yRangeProjectMeters[0]>=0.8-1e-9 &&
      c.bboxProjectXYZ.length===6 &&
      c.bboxProjectXYZ.every(Number.isFinite) &&
      c.insideHardBoundarySamples+c.outsideHardBoundarySamples===c.faceCount*7 &&
      c.minAbsNormalY>=0 && c.maxAbsNormalY<=0.32+1e-12 &&
      c.sourceGeometryAuthority==='ORIGINAL_OBJ_VSS_TEMPLE01' &&
      c.potentialRole==='VERTICAL_FACING_SOURCE_COMPONENT_ONLY' &&
      c.connectivityConfidence==='UNRESOLVED' &&
      c.paintCollisionNavAuthority==='NONE' &&
      c.boundarySampleAuthority==='SEVEN_XZ_TRIANGLE_SAMPLES_NOT_EXACT_CONTAINMENT' &&
      ZONES.includes(c.diagnosticPlanZone) &&
      (!c.sourceObject.startsWith('FldObj_')||
       c.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED')
    )).toBe(true);
    expect(Object.keys(data.zoneStats).sort()).toEqual([...ZONES].sort());
    expect(Object.values(data.zoneStats).reduce((sum,z)=>sum+z.candidateCount,0)).toBe(data.sourceComponentCount);
    for(const zone of ZONES){
      const part=data.candidates.filter(x=>x.diagnosticPlanZone===zone);
      const stat=data.zoneStats[zone]!;
      expect(stat.candidateCount).toBe(part.length);
      expect(stat.fullyInside7SamplesCount).toBe(part.filter(x=>x.outsideHardBoundarySamples===0).length);
      expect(stat.outOfOutlineCandidateCount).toBe(part.filter(x=>x.outsideHardBoundarySamples>0).length);
    }
    const zoneRanking=Object.fromEntries(ZONES.map(z=>[z,data.candidates
      .filter(c=>c.diagnosticPlanZone===z && c.outsideHardBoundarySamples===0)
      .slice(0,12).map(c=>({
        id:c.sourceComponentId,sourceMaterial:c.sourceMaterial,area:c.sourceAreaSquareMeters,
        y:c.yRangeProjectMeters,bbox:c.bboxProjectXYZ,actorPlacement:c.placementAuthority
      }))]));
    console.log('T21_PHASE5_VERTICAL_SOURCE',JSON.stringify({
      candidateCount:data.candidates.length,diagnosticZoneCounts:data.zoneStats,
      inside7Samples:data.candidates.filter(x=>x.outsideHardBoundarySamples===0).length,
      outside7Samples:data.candidates.filter(x=>x.outsideHardBoundarySamples>0).length,
      topPerZone:zoneRanking,
      WARNING:'VERTICAL source components are diagnostic, not confirmed active actors, paint/collision walls, or traversable routes.'
    }));
  },60_000);
});