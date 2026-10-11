import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import {
  UNDERTOW_T21_COVERAGE_LEDGER_V3,
  type CoverageXZ
} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES, undertowT21SourceNativePhase1Errors } from '../src/stage/undertow/UndertowSpillwaySourceNativePhase1Geometry';
import { UNDERTOW_T21_SOURCE_BATCH2_MESHES, undertowT21SourceBatch2Errors } from '../src/stage/undertow/UndertowSpillwaySourceBatch2Geometry';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from '../src/stage/undertow/UndertowSpillwayMacroCoverage';

type P3 = readonly [number, number, number];
interface SourceComponent {
  id: string; sourceMaterial: string; areaSquareMeters: number;
  yRange: readonly [number,number]; mesh: { vertices: P3[] };
}
interface SourceRoute {components:SourceComponent[]}
interface SourceFixture {
  version:string;
  pass18g:{routes:Record<'grate'|'glass',Record<'POSITIVE_Z'|'NEGATIVE_Z',SourceRoute>>};
}
function polygonIncludes([x,z]:CoverageXZ,points:readonly CoverageXZ[]):boolean {
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[j]!,b=points[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    if(Math.abs(cross)<1e-8 && (x-a[0])*(x-b[0])+(z-a[1])*(z-b[1])<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
function containsTri(p:CoverageXZ,a:P3,b:P3,c:P3):boolean {
  const [x,z]=p, d=(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
  if(Math.abs(d)<1e-8)return false;
  const u=((x-a[0])*(c[2]-a[2])-(z-a[2])*(c[0]-a[0]))/d;
  const v=((b[0]-a[0])*(z-a[2])-(b[2]-a[2])*(x-a[0]))/d;
  return u>=-1e-9&&v>=-1e-9&&u+v<=1+1e-9;
}
function componentSamples(mesh:SourceComponent['mesh']):CoverageXZ[]{
  const samples:CoverageXZ[]=[];
  for(let i=0;i+2<mesh.vertices.length;i+=3){
    const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
    samples.push([a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
      [(a[0]+b[0])/2,(a[2]+b[2])/2],
      [(b[0]+c[0])/2,(b[2]+c[2])/2],
      [(c[0]+a[0])/2,(c[2]+a[2])/2],
      [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]);
  }
  return samples;
}
function candidateMissingCells(component:SourceComponent):number {
  const vs=component.mesh.vertices;
  if(vs.length%3!==0)return 0;
  const xs=vs.map(v=>v[0]),zs=vs.map(v=>v[2]);
  const xmin=Math.min(...xs),xmax=Math.max(...xs),zmin=Math.min(...zs),zmax=Math.max(...zs);
  let count=0;
  for(const [x,z] of UNDERTOW_T21_COVERAGE_LEDGER_V3.undisplayedSampleXZ){
    if(x<xmin||x>xmax||z<zmin||z>zmax)continue;
    for(let i=0;i+2<vs.length;i+=3){
      if(containsTri([x,z],vs[i]!,vs[i+1]!,vs[i+2]!)){count++;break;}
    }
  }
  return count;
}

describe('T21 Phase 0 Coverage Ledger v3 / source-only audit',()=>{
  it('keeps incomplete XZ display distinct from floors, Y and connectivity',()=>{
    const audit=UNDERTOW_T21_COVERAGE_LEDGER_V3;
    expect(audit).toMatchObject({version:3,reviewOnly:true,runtimePromotionAuthorized:false,
      gridSampleAuthority:'XZ_CELL_CENTER_APPROXIMATION',
      occupancyAuthority:'XZ_OCCUPANCY_ONLY_NOT_FLOOR',
      provisionalEnvelopesExcluded:2});
    expect(audit.sourceInventory).toHaveLength(64);
    expect(undertowT21SourceNativePhase1Errors()).toEqual([]);
    expect(UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES).toHaveLength(8);
    expect(UNDERTOW_T21_SOURCE_BATCH2_MESHES).toHaveLength(14);
    expect(undertowT21SourceBatch2Errors()).toEqual([]);
    expect(new Set(audit.sourceInventory.map(v=>v.sourceComponentId)).size).toBe(64);
    expect(audit.zones).toHaveLength(5);
    expect(audit.stageCells).toBeGreaterThan(0);
    expect(audit.zones.reduce((n,z)=>n+z.cells,0)).toBe(audit.stageCells);
    expect(audit.zones.reduce((n,z)=>n+z.undisplayed,0)).toBe(audit.undisplayedCells);
    expect(audit.clusters.reduce((n,z)=>n+z.cells,0)).toBe(audit.undisplayedCells);
    expect(audit.undisplayedSampleXZ).toHaveLength(audit.undisplayedCells);
    expect(audit.undisplayedSampleXZ.every(p=>polygonIncludes(p,UNDERTOW_T21_MACRO_OUTER_BOUNDARY))).toBe(true);
    expect(audit.sourceInventory.every(s=>s.yConfidence==='EXACT_TEMPLE01_SOURCE'
      && s.shapeConfidence==='EXACT_TEMPLE01_SOURCE'
      && s.connectivityConfidence==='UNRESOLVED'
      && s.authority==='EXACT_SOURCE_MESH_REVIEW_ONLY')).toBe(true);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    console.log('T21_COVERAGE_V3_BASE',JSON.stringify({
      sampledStageXZSquareMeters:audit.stageCells*0.25,
      sampledUndisplayedXZSquareMeters:audit.undisplayedCells*0.25,
      byZone:audit.zones,
      largestGaps:audit.clusters.slice(0,12),
      geometrySourceMeshes:audit.sourceInventory.length,
      disclaimer:'XZ SAMPLE ONLY; no missing cell is inferred to be an abyss or a flat floor'
    }));
  },60_000);

  it('crosschecks Pass18G local candidate source IDs/Y/material and ranks unshown areas without promoting',()=>{
    const file=process.env.T21_PASS18C_SOURCE_JSON;
    if(!file||!existsSync(file)) {
      console.log('T21_COVERAGE_V3_LOCAL_CANDIDATES: fixture unavailable outside PR audit job');
      return;
    }
    const fixture=JSON.parse(readFileSync(file,'utf8')) as SourceFixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    const shownIds=new Set(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory.map(s=>s.sourceComponentId));
    // Pass18G local search volumes overlap across the centerline. One source
    // component may be listed in both POS/NEG discovery scopes; those are
    // observation scopes, NOT authoritative mesh ownership or symmetry pairs.
    const discovered=new Map<string,{component:SourceComponent;routes:string[];discoveryScopes:string[]}>();
    for(const route of ['glass','grate'] as const) for(const scopeSide of ['POSITIVE_Z','NEGATIVE_Z'] as const)
      for(const component of fixture.pass18g.routes[route][scopeSide].components){
        const previous=discovered.get(component.id);
        if(previous){
          expect(previous.component.sourceMaterial).toBe(component.sourceMaterial);
          expect(previous.component.areaSquareMeters).toBe(component.areaSquareMeters);
          previous.routes.push(route);
          previous.discoveryScopes.push(route+':'+scopeSide);
        } else discovered.set(component.id,{component,routes:[route],discoveryScopes:[route+':'+scopeSide]});
      }
    // Byte-for-byte numerical source equality: review geometry must not be
    // fabricated, mirrored approximately, simplified or silently clipped.
    for(const mesh of UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES){
      const original=discovered.get(mesh.sourceComponentId);
      expect(original, 'missing frozen Pass18C source '+mesh.sourceComponentId).toBeDefined();
      expect(mesh.sourceMaterial).toBe(original!.component.sourceMaterial);
      const sourceCentroidZ=original!.component.mesh.vertices
        .reduce((sum,p)=>sum+p[2],0)/original!.component.mesh.vertices.length;
      expect(mesh.side).toBe(sourceCentroidZ>=0?'POSITIVE_Z':'NEGATIVE_Z');
      expect(mesh.areaSquareMeters).toBeCloseTo(original!.component.areaSquareMeters,9);
      expect(mesh.yRange).toEqual(original!.component.yRange);
      expect(mesh.vertices).toEqual(original!.component.mesh.vertices);
    }
    // Every batch2 float64 vertex, material and Y range must match the
    // independently generated original-source Pass18C payload exactly.
    for(const mesh of UNDERTOW_T21_SOURCE_BATCH2_MESHES) {
      const original=discovered.get(mesh.sourceComponentId);
      expect(original, 'batch2 source missing '+mesh.sourceComponentId).toBeDefined();
      expect(mesh.sourceMaterial).toBe(original!.component.sourceMaterial);
      expect(mesh.areaSquareMeters).toBeCloseTo(original!.component.areaSquareMeters,9);
      expect(mesh.yRange).toEqual(original!.component.yRange);
      expect(mesh.vertices).toEqual(original!.component.mesh.vertices);
      const sourceCentroidZ=original!.component.mesh.vertices
        .reduce((n,p)=>n+p[2],0)/original!.component.mesh.vertices.length;
      expect(mesh.side).toBe(sourceCentroidZ>=0?'POSITIVE_Z':'NEGATIVE_Z');
    }
    // Phase 3 hold applies to BOTH sides of each paired FloorConcrete02
    // inconsistency, even if an individual side happens to be fully inside
    // the 42-vertex silhouette. Never silently ship half a mirrored pair.
    const boundaryPairHold=new Set(
      ['c2','c17','c3','c16'].map(id=>
        'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|'+id));
    const accepted:object[]=[], deferred:object[]=[], deferredPairedBoundary:object[]=[];
    for(const {component,routes,discoveryScopes} of discovered.values()){
      const samples=componentSamples(component.mesh);
      const outside=samples.filter(p=>!polygonIncludes(p,UNDERTOW_T21_MACRO_OUTER_BOUNDARY)).length;
      const sameAsDisplayed=shownIds.has(component.id);
      const newCells=sameAsDisplayed||outside>0?0:candidateMissingCells(component);
      const x=component.mesh.vertices.reduce((v,p)=>v+p[0],0)/component.mesh.vertices.length;
      const z=component.mesh.vertices.reduce((v,p)=>v+p[2],0)/component.mesh.vertices.length;
      const side=z>=0?'POSITIVE_Z':'NEGATIVE_Z';
      const zone=Math.abs(z)<=15?'CENTER':x<=-14?'LEFT_SIDE':x>=14?'RIGHT_SIDE':z>0?'POS':'NEG';
      const material=component.sourceMaterial;
      const phase=material.includes('FloorConcrete')||material.includes('FloorSlope')?
        (Math.abs(z)<35?'PHASE_1':'PHASE_2'):'PHASE_2_OR_4';
      const record={
        id:component.id,material,side,sourceAreaSquareMeters:component.areaSquareMeters,
        yRange:component.yRange,centroidXZ:[x,z],zone,phase,
        approxAdditionalXZSquareMeters:newCells*0.25,
        routes:[...new Set(routes)],discoveryScopes:[...new Set(discoveryScopes)],shapeAuthority:'PASS18C_EXACT_SOURCE',
        yAuthority:'PASS18C_EXACT_SOURCE',connectivityAuthority:'PENDING',
        runtimePromotionAuthorized:false
      };
      if(boundaryPairHold.has(component.id)){
        deferredPairedBoundary.push({...record,
          reason:'FROZEN_MIRROR_PAIR_BOUNDARY_DISAGREEMENT_PHASE_3_HOLD',
          outsideSamples:outside});
      }
      else if(outside>0) deferred.push({...record,reason:'SOURCE_TRIANGLE_EXTENDS_OUTSIDE_FROZEN_HARD_SILHOUETTE',outsideSamples:outside});
      else if(!sameAsDisplayed&&newCells>0)accepted.push(record);
    }
    accepted.sort((a,b)=>{
      const aa=a as {approxAdditionalXZSquareMeters:number;phase:string},bb=b as typeof aa;
      return (aa.phase==='PHASE_1'?0:1)-(bb.phase==='PHASE_1'?0:1)||
        bb.approxAdditionalXZSquareMeters-aa.approxAdditionalXZSquareMeters;
    });
    const output={
      version:3,sourceVersion:fixture.version,reviewOnly:true,runtimePromotionAuthorized:false,
      sourceScope:'PASS18G_LOCAL_CANDIDATES_ONLY_NOT_FULL_STAGE_EXHAUSTIVE',
      sampledCellSizeMeters:UNDERTOW_T21_COVERAGE_LEDGER_V3.cellSizeMeters,
      stageXZ:UNDERTOW_T21_COVERAGE_LEDGER_V3.zones,
      largestGapClusters:UNDERTOW_T21_COVERAGE_LEDGER_V3.clusters.slice(0,30),
      currentSourceMeshCount:shownIds.size,
      sourceLocalCandidateCount:discovered.size,
      candidateAdditionalCount:accepted.length,deferredOuterCount:deferred.length,
      deferredPairedBoundaryCount:deferredPairedBoundary.length,
      rankedAdditionalSourceCandidates:accepted,
      deferredOutsideSilhouette:deferred,
      deferredPairedBoundary,
      note:'Areas from XZ center samples are approximate, do not sum 3D surface area. Stage underlay/provisional XZ not counted. Candidates are not yet in Visual Review and are not approved for gameplay.'
    };
    const dest='/tmp/t21-coverage-ledger-v3.json';
    writeFileSync(dest,JSON.stringify(output,null,2));
    console.log('T21_COVERAGE_V3_LOCAL_SOURCE',JSON.stringify({
      candidates:discovered.size,additional:accepted.length,
      deferredOutside:deferred.length,deferredPairedBoundary:deferredPairedBoundary.length,top:accepted.slice(0,18),
      deferred:deferred.slice(0,8),output:dest
    }));
    expect(shownIds.size).toBe(64);
    expect(deferredPairedBoundary.map(x=>(x as {id:string}).id).sort()).toEqual([...boundaryPairHold].sort());
    expect(accepted.every(row=>(row as {runtimePromotionAuthorized:boolean}).runtimePromotionAuthorized===false)).toBe(true);
  },60_000);
});
