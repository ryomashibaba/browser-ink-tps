import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';

const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const OBJECT='Fld_Temple01_CellingBase_1__PillarOld00';
const MATERIAL='Fld_Temple01_PillarOld00';
type V=readonly [number,number,number];
type W={originalFaceIndex:number;originalOBJVertexIds:number[];
  originalProjectedTriangleXYZ:V[];sourceObject:string;sourceMaterial:string;
  kind:string;spanMeters:number;interiorSpanMeters:number};
type WRow={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
  originalProjectedXYZ:V[];contactWitnesses:W[]};
type XFace={originalFaceIndex:number;originalOBJVertexIds:number[];
  sourceObject:string;sourceMaterial:string;startFraction:number;endFraction:number;spanMeters:number};
type XRow={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
  originalProjectedXYZ:V[];sourceCoveringFaces:XFace[];
  noGap:boolean;physicalConnectionAuthorized:false};
type Face={id:number;originalIds:number[];xyz:V[];sourceObject:string;sourceMaterial:string};
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],
  a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const length=(v:V)=>Math.hypot(...v);
function geometry(face:Face){
  expect(face.originalIds).toHaveLength(3);
  expect(face.xyz).toHaveLength(3);
  expect(face.xyz.every(p=>p.length===3&&p.every(Number.isFinite))).toBe(true);
  const [a,b,c]=face.xyz;
  const n=cross(sub(b!,a!),sub(c!,a!)),norm=length(n);
  if(!(norm>1e-10))throw Error('PHASE12Y_SOURCE_DEGENERATE_TRIANGLE');
  return {normal:n.map(v=>v/norm) as unknown as V,area:norm/2};
}
const edge=(a:number,b:number)=>[a,b].sort((u,v)=>u-v).join(':');
const pair=(a:number,b:number)=>[a,b].sort((u,v)=>u-v).join(':');
const rowKey=(r:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[]})=>
  [r.sourcePartMinFace,r.sourceFace,edge(r.originalOBJVertexIds[0]!,r.originalOBJVertexIds[1]!)].join(':');
function directions(face:Face){
  const ids=face.originalIds;
  return new Map(Array.from({length:3},(_,k)=>{
    const a=ids[k]!,b=ids[(k+1)%3]!;
    return [edge(a,b),a<b?1:-1] as const;
  }));
}
function neighbors(faces:Face[]){
  const pairs:{faces:[number,number];sharedOriginalOBJEdge:[number,number];
   oppositeOriginalWinding:boolean;normalDot:number}[]=[];
  for(let a=0;a<faces.length;a++)for(let b=a+1;b<faces.length;b++){
    const A=faces[a]!,B=faces[b]!,left=directions(A),right=directions(B);
    const common=[...left.keys()].filter(k=>right.has(k));
    if(common.length>1)throw Error('PHASE12Y_TWO_SOURCE_FACES_SHARE_MULTIPLE_EDGES');
    if(common.length){
      const ek=common[0]!,e=ek.split(':').map(Number) as [number,number];
      const g=geometry(A).normal,h=geometry(B).normal;
      const dot=g[0]*h[0]+g[1]*h[1]+g[2]*h[2];
      pairs.push({faces:[A.id,B.id],sharedOriginalOBJEdge:e,
        oppositeOriginalWinding:left.get(ek)!==-right.get(ek)!,normalDot:dot});
    }
  }
  return pairs.sort((a,b)=>a.faces[0]-b.faces[0]);
}
describe('T21 Phase12Y original cover face material, downward normal and OBJ-ID adjacency gate',()=>{
 it('freezes T20, T21 review authority, 22 source patches and 64/42 baseline',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];
  expect(all).toHaveLength(22);
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  for(const m of all){
   expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
  }
 });
 it('negative fixtures: source down normal changes under winding reversal; ID adjacency is not XYZ coincidence',()=>{
  const base:Face={id:1,originalIds:[1,2,3],sourceObject:OBJECT,sourceMaterial:MATERIAL,
    xyz:[[0,0,0],[1,0,0],[0,0,1]]};
  const reversed:Face={...base,id:2,originalIds:[1,3,2],
    xyz:[[0,0,0],[0,0,1],[1,0,0]]};
  expect(geometry(base).normal[1]).toBeLessThan(-.999999);
  expect(geometry(reversed).normal[1]).toBeGreaterThan(.999999);
  expect(()=>neighbors([base,reversed])).toThrow('PHASE12Y_TWO_SOURCE_FACES_SHARE_MULTIPLE_EDGES');
  const A:Face={...base,id:3,originalIds:[11,12,13]};
  const B:Face={...base,id:4,originalIds:[21,22,23]};
  expect(neighbors([A,B])).toHaveLength(0);
  const C:Face={...base,id:5,originalIds:[11,12,14],xyz:[[0,0,0],[1,0,0],[0,-1,0]]};
  const shared=neighbors([A,C]);
  expect(shared).toHaveLength(1);
  expect(shared[0]!.oppositeOriginalWinding).toBe(false);
 });
 it('independently rebuilds 8 downward original faces, 4 welded source pairs and 88 target-to-cover geometry references',()=>{
  const W=process.env.T21_PHASE12W_REPORT_INPUT,
    X=process.env.T21_PHASE12X_REPORT_INPUT,
    S=process.env.T21_PHASE12S_REPORT_INPUT,
    out=process.env.T21_PHASE12Y_REPORT;
  if(!W&&!X&&!S&&!out){
    if(process.env.T21_PHASE12Y_REQUIRED==='1')throw Error('PHASE12Y_REQUIRED_SOURCE_EVIDENCE_NOT_SET');
    return;
  }
  if(!W||!X||!S||!out||![W,X,S].every(existsSync))
    throw Error('PHASE12Y_PINNED_SOURCE_ARTIFACT_MISSING');
  const w=JSON.parse(readFileSync(W,'utf8')) as {
    version:string;originalSourceSHA256:string;originalActiveFacesParsed:number;
    runtimePromotionAuthorized:boolean;physicalWeldOrWalkableFloorProven:boolean;rows:WRow[]};
  const x=JSON.parse(readFileSync(X,'utf8')) as {
    version:string;originalSourceSHA256:string;edgesIndependentlyRechecked:number;
    singleFaceFullCoverageEdges:number;twoFaceUnionCoverageEdges:number;
    edgesWithGap:number;runtimePromotionAuthorized:boolean;rows:XRow[]};
  const s=JSON.parse(readFileSync(S,'utf8')) as {
    originalSourceSHA256:string;originalComponents:number;originalFaces:number;
    originalOBJBoundaryEdges:number;summaries:{minFace:number;mirrorMinFace:number}[]};
  expect([w.originalSourceSHA256,x.originalSourceSHA256,s.originalSourceSHA256]).toEqual([PIN,PIN,PIN]);
  expect(w.originalActiveFacesParsed).toBe(70396);
  expect(x.edgesIndependentlyRechecked).toBe(88);
  expect([x.singleFaceFullCoverageEdges,x.twoFaceUnionCoverageEdges,x.edgesWithGap]).toEqual([80,8,0]);
  expect(s.originalComponents).toBe(22);expect(s.originalFaces).toBe(488);
  expect(s.originalOBJBoundaryEdges).toBe(524);
  expect(w.runtimePromotionAuthorized).toBe(false);
  expect(x.runtimePromotionAuthorized).toBe(false);
  expect(w.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(w.rows).toHaveLength(88);expect(x.rows).toHaveLength(88);
  const source=new Map(w.rows.map(r=>[rowKey(r),r]));
  expect(source.size).toBe(88);
  const allFaces=new Map<number,Face>();
  const uses=new Map<number,number>();
  const parts=new Map<number,Set<number>>();
  const partCounts=new Map<number,number>();
  const visited=new Set<string>();
  for(const r of x.rows){
    const id=rowKey(r),original=source.get(id);
    expect(original).toBeDefined();expect(visited.has(id)).toBe(false);
    visited.add(id);
    expect(r.noGap).toBe(true);expect(r.physicalConnectionAuthorized).toBe(false);
    expect(r.originalProjectedXYZ).toEqual(original!.originalProjectedXYZ);
    partCounts.set(r.sourcePartMinFace,(partCounts.get(r.sourcePartMinFace)||0)+1);
    const originalFaces=new Map(original!.contactWitnesses
      .filter(f=>f.kind==='COPLANAR_FACE_INTERIOR_POSITIVE_SPAN')
      .map(f=>[f.originalFaceIndex,f]));
    expect(originalFaces.size).toBe(r.sourceCoveringFaces.length);
    for(const f of r.sourceCoveringFaces){
      const sourceFace=originalFaces.get(f.originalFaceIndex);
      expect(sourceFace).toBeDefined();
      expect(sourceFace!.originalOBJVertexIds).toEqual(f.originalOBJVertexIds);
      expect(sourceFace!.sourceObject).toBe(f.sourceObject);
      expect(sourceFace!.sourceMaterial).toBe(f.sourceMaterial);
      expect(f.sourceObject).toBe(OBJECT);expect(f.sourceMaterial).toBe(MATERIAL);
      expect(f.originalFaceIndex).toBeGreaterThanOrEqual(0);
      expect(f.originalFaceIndex).toBeLessThan(70396);
      expect(f.startFraction).toBeGreaterThanOrEqual(0);
      expect(f.endFraction).toBeLessThanOrEqual(1);
      expect(f.spanMeters).toBeGreaterThan(1e-6);
      expect(f.originalOBJVertexIds.filter(id=>r.originalOBJVertexIds.includes(id))).toHaveLength(0);
      const current:Face={id:f.originalFaceIndex,originalIds:f.originalOBJVertexIds,
       xyz:sourceFace!.originalProjectedTriangleXYZ,sourceObject:f.sourceObject,sourceMaterial:f.sourceMaterial};
      const prior=allFaces.get(current.id);
      if(prior)expect(current).toEqual(prior);
      else allFaces.set(current.id,current);
      uses.set(current.id,(uses.get(current.id)||0)+1);
      const owned=parts.get(r.sourcePartMinFace)||new Set<number>();
      owned.add(current.id);parts.set(r.sourcePartMinFace,owned);
    }
  }
  expect(visited.size).toBe(88);expect(allFaces.size).toBe(8);
  expect(parts.size).toBe(8);expect([...partCounts.values()].every(n=>n===11)).toBe(true);
  const records=[...allFaces.values()].sort((a,b)=>a.id-b.id).map(f=>{
    const geom=geometry(f);
    expect(geom.normal[0]).toBeCloseTo(0,10);
    expect(geom.normal[1]).toBeCloseTo(-1,10);
    expect(geom.normal[2]).toBeCloseTo(0,10);
    expect(geom.area).toBeGreaterThan(21);
    expect(geom.area).toBeLessThan(22);
    expect(f.xyz.every(v=>Math.abs(v[1]-46.5)<1e-10)).toBe(true);
    expect(uses.get(f.id)).toBe(12);
    return {originalFaceIndex:f.id,originalOBJVertexIds:f.originalIds,
     originalProjectedTriangleXYZ:f.xyz,sourceObject:f.sourceObject,sourceMaterial:f.sourceMaterial,
     originalProjectedNormal:geom.normal,originalAreaSquareMeters:geom.area,
     projectedY:46.5,coveringBoundaryOccurrences:uses.get(f.id)!};
  });
  const facePairs=neighbors([...allFaces.values()]);
  expect(facePairs).toHaveLength(4);
  expect(facePairs.every(p=>p.oppositeOriginalWinding)).toBe(true);
  expect(facePairs.every(p=>Math.abs(p.normalDot-1)<1e-10)).toBe(true);
  expect(new Set(facePairs.flatMap(p=>p.faces)).size).toBe(8);
  for(const x of parts.values()){
    expect(x.size).toBe(2);
    expect(facePairs.some(p=>p.faces.every(f=>x.has(f)))).toBe(true);
  }
  const mirror=new Map(s.summaries.map(x=>[x.minFace,x.mirrorMinFace]));
  for(const [p,faces] of parts){
    const other=mirror.get(p);expect(other).toBeDefined();
    expect(parts.has(other!)).toBe(true);
    expect([...faces].some(f=>parts.get(other!)!.has(f))).toBe(false);
  }
  const report={version:'T21_PHASE12Y_ORIGINAL_FACE_MATERIAL_NORMAL_ID_ADJACENCY_V1',
    originalSourceSHA256:PIN,sourceOnly:true,reviewOnly:true,runtimePromotionAuthorized:false,
    originalOBJIDWeldBetweenTargetAndCoverProven:false,physicalWeldOrWalkableFloorProven:false,
    gameplayCollisionPaintNavScoringAuthority:'NONE',originalActiveFacesProvenUpstream:70396,
    priorOriginalSourceComponents:22,priorOriginalSourceTriangles:488,
    originalTargetBoundaryEdges:88,positiveCoveringFaceOccurrences:96,
    uniqueOriginalCoveringSourceFaces:8,originalFacePairsSharingOBJIDEdge:4,
    downwardOriginalFaces:8,allCoveringFacesAtProjectY:46.5,
    originalSourceFamily:OBJECT,originalSourceMaterial:MATERIAL,sourceFaceRecords:records,
    sourceOriginalEdgePairs:facePairs,
    originalTargetToCoveringFaces:[...parts].sort((a,b)=>a[0]-b[0]).map(([p,ids])=>
      ({sourceComponentMinFace:p,mirrorSourceMinFace:mirror.get(p),
        sourceBoundaryEdges:partCounts.get(p),originalCoveringFaceIds:[...ids].sort((a,b)=>a-b)}))};
  writeFileSync(out,JSON.stringify(report,null,2));
  console.log('T21_PHASE12Y_SOURCE_ONLY_DOWNWARD_FACE_IDS',JSON.stringify({
   originalFaces:8,sourceOBJIDAdjacencyPairs:4,originalTargetEdges:88,
   positiveCoveringFaceOccurrences:96,mirrorParts:8,downwardFaces:8}));
 });
});
