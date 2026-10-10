import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';
// Phase12T: source-only EXACT ORIGINAL edge-to-held-neighbor classification.
// Never infer weld, floor, cap, collider, watertight stage or runtime permission.
type V=readonly [number,number,number];
type Face={originalFaceIndex:number;originalOBJVertexIds:readonly number[];
 originalProjectTriangleXYZ:readonly V[]};
type Source={minFace:number;mirrorOriginalMinFace:number;sourceTriangleCount:number;
 faces:readonly Face[];reviewOnly:boolean;runtimePromotionAuthorized:boolean};
type Mesh={readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly originalSourceTriangleCount:number;readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];readonly vertices:readonly V[];
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE'};
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const shown:readonly Mesh[]=[...I,...K,...L,...M];
const usedKLM=new Set([...K,...L,...M].map(x=>x.originalMinFace));
const xyz=(v:V):string=>{
 if(v.length!==3||!v.every(Number.isFinite))throw Error('PHASE12T_NONFINITE_XYZ');
 return v.map(x=>Object.is(x,-0)?0:x).join(',');
};
function idEdge(a:number,b:number):string{
 if(a===b)throw Error('PHASE12T_DUPLICATE_ORIGINAL_ID_ON_EDGE');
 return a<b?a+':'+b:b+':'+a;
}
function geoEdge(a:V,b:V):string{
 const p=xyz(a),q=xyz(b);if(p===q)throw Error('PHASE12T_ZERO_XYZ_EDGE');
 return JSON.stringify([p,q].sort());
}
type Edge={face:number;ids:readonly [number,number];idKey:string;geoKey:string;positions:readonly [V,V]};
function index(faces:readonly Face[]){
 const id=new Map<string,Edge[]>(),geo=new Map<string,Edge[]>(),ids=new Map<number,string>(),faceIds=new Set<number>();
 for(const f of faces){
  if(faceIds.has(f.originalFaceIndex)||f.originalOBJVertexIds.length!==3||f.originalProjectTriangleXYZ.length!==3)
   throw Error('PHASE12T_MALFORMED_OR_DUPLICATE_FACE');
  faceIds.add(f.originalFaceIndex);
  for(let k=0;k<3;k++){
   const a=f.originalOBJVertexIds[k]!,b=f.originalOBJVertexIds[(k+1)%3]!;
   const p=f.originalProjectTriangleXYZ[k]!,q=f.originalProjectTriangleXYZ[(k+1)%3]!;
   if(ids.has(a)&&ids.get(a)!==xyz(p))throw Error('PHASE12T_OBJ_ID_XYZ_DRIFT');
   ids.set(a,xyz(p));
   const e:Edge={face:f.originalFaceIndex,ids:[a,b],idKey:idEdge(a,b),
    geoKey:geoEdge(p,q),positions:[p,q]};
   const list=id.get(e.idKey)||[];list.push(e);id.set(e.idKey,list);
   const geometries=geo.get(e.geoKey)||[];geometries.push(e);geo.set(e.geoKey,geometries);
  }
 }
 return {id,geo};
}
function transform(m:Mesh):Source{
 expect(m.originalGlobalFaceIndices).toHaveLength(m.originalSourceTriangleCount);
 expect(m.originalOBJVertexIdTriples).toHaveLength(m.originalSourceTriangleCount);
 expect(m.vertices).toHaveLength(m.originalSourceTriangleCount*3);
 return {minFace:m.originalMinFace,mirrorOriginalMinFace:m.originalMirrorMinFace,
  sourceTriangleCount:m.originalSourceTriangleCount,reviewOnly:m.reviewOnly,
  runtimePromotionAuthorized:m.runtimePromotionAuthorized,
  faces:Array.from({length:m.originalSourceTriangleCount},(_,i)=>({
   originalFaceIndex:m.originalGlobalFaceIndices[i]!,
   originalOBJVertexIds:m.originalOBJVertexIdTriples[i]!,
   originalProjectTriangleXYZ:m.vertices.slice(i*3,i*3+3)}))};
}
function requirePriorS(rows:{minFace:number;boundary:number}[]){
 const file=process.env.T21_PHASE12S_REPORT_INPUT;
 if(!file){
  if(process.env.T21_PHASE12T_REPORT)throw Error('PHASE12T_S_REQUIRED_BUT_MISSING');
  return {verified:false,parts:0};
 }
 if(!existsSync(file))throw Error('PHASE12T_S_ARTIFACT_NOT_FOUND');
 const s=JSON.parse(readFileSync(file,'utf8')) as {
  originalSourceSHA256:string;originalComponents:number;originalFaces:number;
  originalOBJBoundaryEdges:number;originalClosedBoundaryLoops:number;
  isolatedClosedShellsInOriginalOBJIDTopology:number;
  crossCheckR:{phase12RCrossCheckPerformed:boolean;comparedPairs:number};
  summaries:{minFace:number;sourceOBJBoundaryEdges:number;sourceClosedBoundaryLoops:number}[]};
 expect(s.originalSourceSHA256).toBe(PIN);
 expect(s.originalComponents).toBe(22);expect(s.originalFaces).toBe(488);
 expect(s.originalOBJBoundaryEdges).toBe(524);
 expect(s.originalClosedBoundaryLoops).toBe(22);
 expect(s.isolatedClosedShellsInOriginalOBJIDTopology).toBe(0);
 expect(s.crossCheckR).toMatchObject({phase12RCrossCheckPerformed:true,comparedPairs:110});
 const known=new Map(s.summaries.map(r=>[r.minFace,r]));
 expect(known.size).toBe(22);
 for(const row of rows){
  const r=known.get(row.minFace);expect(r).toBeDefined();
  expect(row.boundary).toBe(r!.sourceOBJBoundaryEdges);
  expect(r!.sourceClosedBoundaryLoops).toBe(1);
 }
 return {verified:true,parts:22};
}
describe('T21 Phase12T pinned original OBJ-ID versus held source XYZ boundary ledger',()=>{
 it('holds T20/T21 inactive and source-only original inventory freeze',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(shown).toHaveLength(22);
  expect(shown.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  for(const m of shown){
   expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
  }
 });
 it('synthetically distinguishes same XYZ with different source OBJ IDs and missing neighbors',()=>{
  const a:Face={originalFaceIndex:1,originalOBJVertexIds:[1,2,3],
   originalProjectTriangleXYZ:[[-2,0,0],[-1,0,0],[-2,1,0]]};
  const b:Face={originalFaceIndex:2,originalOBJVertexIds:[4,5,6],
   originalProjectTriangleXYZ:[[-2,0,0],[-1,0,0],[-2,-1,0]]};
  const c:Face={originalFaceIndex:3,originalOBJVertexIds:[1,2,7],
   originalProjectTriangleXYZ:[[-2,0,0],[-1,0,0],[-2,0,1]]};
  const A=index([a]),B=index([b]),C=index([c]);
  const e=A.id.get(idEdge(1,2))![0]!;
  expect(B.id.has(e.idKey)).toBe(false);expect(B.geo.has(e.geoKey)).toBe(true);
  expect(C.id.has(e.idKey)).toBe(true);expect(C.geo.has(e.geoKey)).toBe(true);
  expect(B.geo.has(geoEdge([-10,0,0],[-11,0,0]))).toBe(false);
  expect(()=>index([{originalFaceIndex:4,originalOBJVertexIds:[9,9,10],
   originalProjectTriangleXYZ:[[-2,0,0],[-2,1,0],[-1,0,0]]}])).toThrow();
 });
 it('audits 524 original source loop edges against 28 unused pinned Phase12J components',()=>{
  const path=process.env.T21_PHASE12J_SOURCE_JSON;
  if(!path){
   if(process.env.T21_PHASE12T_REPORT)throw Error('PHASE12T_REQUIRED_PHASE12J_LEDGER_MISSING');
   return;
  }
  if(!existsSync(path))throw Error('PHASE12T_PHASE12J_LEDGER_NOT_FOUND');
  const j=JSON.parse(readFileSync(path,'utf8')) as {
   originalSourceSHA256:string;selectedFullSourceComponentCount:number;
   selectedOriginalTriangleCount:number;selectedFullOriginalSourceComponents:Source[]};
  expect(j.originalSourceSHA256).toBe(PIN);
  expect(j.selectedFullSourceComponentCount).toBe(44);
  expect(j.selectedOriginalTriangleCount).toBe(972);
  const source=new Map(j.selectedFullOriginalSourceComponents.map(c=>[c.minFace,c]));
  expect(source.size).toBe(44);
  const held=[...source.values()].filter(c=>!usedKLM.has(c.minFace));
  expect(held).toHaveLength(28);
  expect(held.reduce((n,c)=>n+c.sourceTriangleCount,0)).toBe(616);
  // Existing K/L/M opt-in faces are the exact same source originals as the J ledger.
  const bits=(row:readonly number[])=>{
   const b=Buffer.alloc(8*row.length);row.forEach((v,i)=>b.writeDoubleLE(v,i*8));
   return b.toString('hex');
  };
  for(const m of [...K,...L,...M]){
   const c=source.get(m.originalMinFace);expect(c).toBeDefined();
   expect(c!.sourceTriangleCount).toBe(m.originalSourceTriangleCount);
   for(let t=0;t<m.originalSourceTriangleCount;t++){
    const face=c!.faces[t]!;
    expect(face.originalFaceIndex).toBe(m.originalGlobalFaceIndices[t]);
    expect(face.originalOBJVertexIds).toEqual(m.originalOBJVertexIdTriples[t]);
    for(let k=0;k<3;k++)expect(bits(face.originalProjectTriangleXYZ[k]!))
     .toBe(bits(m.vertices[t*3+k]!));
   }
  }
  const unused=held.map(h=>({source:h,edges:index(h.faces)}));
  const parts=shown.map(m=>{const s=transform(m);return {source:s,edges:index(s.faces)};});
  const reports=[] as {minFace:number;mirrorMinFace:number;side:'LEFT'|'RIGHT';
   boundary:number;idMatches:number;xyzOnly:number;noHeldMatch:number;
   otherOptIn:number;heldNeighborMinFaces:number[];
   originalBoundaryEvidence:{sourceFace:number;originalOBJEdge:readonly [number,number];
    originalXYZ:readonly [V,V];classification:string;
    heldSourceWitnesses:{minFace:number;originalFace:number;sharedOriginalOBJIDs:boolean}[]}[]}[];
  for(const p of parts){
   const boundary=[...p.edges.id.values()].filter(a=>a.length===1).map(a=>a[0]!);
   let idMatches=0,xyzOnly=0,noHeldMatch=0,otherOptIn=0;
   const neighbors=new Set<number>();
   const evidence=[] as (typeof reports)[number]['originalBoundaryEvidence'];
   for(const b of boundary){
    const witnesses:{minFace:number;originalFace:number;sharedOriginalOBJIDs:boolean}[]=[];
    for(const h of unused){
     const sameXYZ=h.edges.geo.get(b.geoKey)||[];
     const sameID=new Set((h.edges.id.get(b.idKey)||[]).map(x=>x.face));
     if(sameID.size&&!sameXYZ.length)throw Error('PHASE12T_ORIGINAL_IDS_COORDINATE_CONFLICT');
     for(const e of sameXYZ){
      witnesses.push({minFace:h.source.minFace,originalFace:e.face,
       sharedOriginalOBJIDs:sameID.has(e.face)});
      neighbors.add(h.source.minFace);
     }
    }
    const id=witnesses.some(x=>x.sharedOriginalOBJIDs);
    const classification=id?'EXACT_ORIGINAL_OBJ_ID_EDGE':witnesses.length?
     'EXACT_XYZ_EDGE_SEPARATE_OBJ_IDS':'NO_EXACT_SOURCE_EDGE_IN_HELD28';
    if(id)idMatches++;else if(witnesses.length)xyzOnly++;else noHeldMatch++;
    if(parts.some(x=>x.source.minFace!==p.source.minFace&&x.edges.geo.has(b.geoKey)))otherOptIn++;
    evidence.push({sourceFace:b.face,originalOBJEdge:b.ids,originalXYZ:b.positions,
     classification,heldSourceWitnesses:witnesses.sort((a,b)=>a.minFace-b.minFace||a.originalFace-b.originalFace)});
   }
   const x=p.source.faces.flatMap(f=>f.originalProjectTriangleXYZ);
   const mean=x.reduce((n,v)=>n+v[0],0)/x.length;
   expect(Math.abs(mean)).toBeGreaterThan(.5);
   reports.push({minFace:p.source.minFace,mirrorMinFace:p.source.mirrorOriginalMinFace,
    side:mean<0?'LEFT':'RIGHT',boundary:boundary.length,
    idMatches,xyzOnly,noHeldMatch,otherOptIn,
    heldNeighborMinFaces:[...neighbors].sort((a,b)=>a-b),
    originalBoundaryEvidence:evidence});
  }
  expect(reports).toHaveLength(22);
  const total=(k:'boundary'|'idMatches'|'xyzOnly'|'noHeldMatch'|'otherOptIn')=>
   reports.reduce((n,r)=>n+r[k],0);
  expect(total('boundary')).toBe(524);expect(total('idMatches')).toBe(0);
  expect(total('xyzOnly')).toBe(176);expect(total('noHeldMatch')).toBe(348);
  expect(total('otherOptIn')).toBe(304);
  const refs=new Map(reports.map(x=>[x.minFace,x]));
  expect(refs.size).toBe(22);
  for(const r of reports){
   const twin=refs.get(r.mirrorMinFace);expect(twin).toBeDefined();
   expect(twin!.side).not.toBe(r.side);
   for(const k of ['boundary','idMatches','xyzOnly','noHeldMatch','otherOptIn'] as const)
    expect(twin![k]).toBe(r[k]);
   for(const sourceId of r.heldNeighborMinFaces){
    const opposite=source.get(sourceId);expect(opposite).toBeDefined();
    expect(twin!.heldNeighborMinFaces).toContain(opposite!.mirrorOriginalMinFace);
   }
  }
  const crossCheckS=requirePriorS(reports.map(r=>({minFace:r.minFace,boundary:r.boundary})));
  const result={version:'T21_PHASE12T_PINNED_ORIGINAL_BOUNDARY_TO_HELD_SOURCE_V1',
   originalSourceSHA256:PIN,originalComponents:22,originalFaces:488,
   originalBoundaryEdges:524,sourceOnly:true,reviewOnly:true,
   heldOriginalSourceComponents:28,heldSourceFaces:616,
   exactOriginalOBJIDEdgeMatches:0,exactXYZSeparateOBJIDMatches:176,
   noExactEdgeInHeld28:348,otherOptInGeometricMatches:304,
   mirrorComponentChecks:22,defaultSourceCountHeld:124,sourceWalkCountHeld:64,
   hardOuterXZPointsHeld:42,visualFreezeApproved:false,
   runtimePromotionAuthorized:false,physicalWeldOrWalkableFloorProven:false,
   notAWholeStageGeometryOrCollisionClaim:true,crossCheckS,reports};
  if(process.env.T21_PHASE12T_REPORT)
   writeFileSync(process.env.T21_PHASE12T_REPORT,JSON.stringify(result,null,2));
  console.log('T21_PHASE12T_ORIGINAL_NEIGHBOR_EDGES',JSON.stringify({
   parts:22,boundary:524,heldXYZMatches:176,missingInHeld28:348,
   originalIDShared:0,otherOptIn:304,crossCheckS}));
 });
});