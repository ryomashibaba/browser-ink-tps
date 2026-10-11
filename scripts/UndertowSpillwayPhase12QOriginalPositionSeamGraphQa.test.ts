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

/** Phase12Q: exact-coordinate seam GRAPH, not a game or collision connectivity graph.
 * Independent of Phase12P's triangle-distance calculation. Original XYZ is unchanged.
 * The same 3D position under distinct original OBJ IDs is NOT a source-ID weld.
 */
type V=readonly [number,number,number];
type Mesh={readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly originalSourceTriangleCount:number;readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly V[];readonly reviewOnly:true;
 readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE'};
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const all:readonly Mesh[]=[...I,...K,...L,...M];
type Vertex={xyz:V;ids:Set<number>};
function key(v:V):string{
 if(!v.every(Number.isFinite))throw Error('PHASE12Q_NONFINITE_ORIGINAL_VERTEX');
 return v.map(n=>Object.is(n,-0)?0:n).join(',');
}
function triangleKeys(m:Mesh):string[][]{
 expect(m.vertices).toHaveLength(m.originalSourceTriangleCount*3);
 expect(m.originalOBJVertexIdTriples).toHaveLength(m.originalSourceTriangleCount);
 return Array.from({length:m.originalSourceTriangleCount},(_,i)=>
  m.vertices.slice(i*3,i*3+3).map(key));
}
function vertices(m:Mesh):Map<string,Vertex>{
 const out=new Map<string,Vertex>(),idCoordinate=new Map<number,string>();
 for(let i=0;i<m.vertices.length;i++){
  const pos=m.vertices[i]!,id=m.originalOBJVertexIdTriples[Math.floor(i/3)]![i%3]!;
  const k=key(pos);
  const earlier=idCoordinate.get(id);
  if(earlier!==undefined&&earlier!==k)
   throw Error('PHASE12Q_ORIGINAL_OBJ_ID_MAPPED_TO_CONFLICTING_XYZ');
  idCoordinate.set(id,k);
  const point=out.get(k);
  if(point)point.ids.add(id);
  else out.set(k,{xyz:pos,ids:new Set([id])});
 }
 return out;
}
function geometricEdges(m:Mesh):Set<string>{
 const s=new Set<string>();
 for(const t of triangleKeys(m))for(let i=0;i<3;i++){
  const pair=[t[i]!,t[(i+1)%3]!].sort();
  if(pair[0]!==pair[1])s.add(JSON.stringify(pair));
 }
 return s;
}
function geometricTriangles(m:Mesh):Set<string>{
 return new Set(triangleKeys(m).map(t=>JSON.stringify([...t].sort())));
}
function originalIDs(m:Mesh):Set<number>{
 return new Set(m.originalOBJVertexIdTriples.flat());
}
function side(m:Mesh):'LEFT'|'RIGHT'{
 const average=m.vertices.reduce((s,v)=>s+v[0],0)/m.vertices.length;
 if(!Number.isFinite(average)||Math.abs(average)<.5)
  throw Error('PHASE12Q_AMBIGUOUS_ORIGINAL_MIRROR_SIDE');
 return average<0?'LEFT':'RIGHT';
}
function compare(a:Mesh,b:Mesh){
 if(a===b)throw Error('PHASE12Q_SELF_COMPARISON');
 const va=vertices(a),vb=vertices(b);
 const common=[...va.keys()].filter(k=>vb.has(k)).sort();
 const aIDs=originalIDs(a),bIDs=originalIDs(b);
 const sharedIDs=[...aIDs].filter(id=>bIDs.has(id));
 const ea=geometricEdges(a),eb=geometricEdges(b);
 const edges=[...ea].filter(e=>eb.has(e)).sort();
 const fa=geometricTriangles(a),fb=geometricTriangles(b);
 const faces=[...fa].filter(f=>fb.has(f)).sort();
 const first=common[0]===undefined?null:{
  xyz:va.get(common[0])!.xyz,
  aOriginalVertexIDs:[...va.get(common[0])!.ids].sort((x,y)=>x-y),
  bOriginalVertexIDs:[...vb.get(common[0])!.ids].sort((x,y)=>x-y)
 };
 const contactClass=faces.length?'EXACT_POSITION_TRIANGLE_COINCIDENCE':
  edges.length?'EXACT_POSITION_EDGE_COINCIDENCE':
  common.length?'EXACT_POSITION_VERTEX_ONLY':'NO_EXACT_POSITION_COINDICENCE';
 return {
  a:a.originalMinFace,b:b.originalMinFace,side:side(a),
  exactCommonPositionCount:common.length,
  exactGeometricEdgeCount:edges.length,
  exactGeometricFaceCount:faces.length,
  sharedOriginalOBJVertexIDCount:sharedIDs.length,
  witness:first,contactClass,
  originalOBJIDWeldProven:false,
  geometricSurfaceContactOnly:common.length>0,
  physicalCollisionFloorNavOrPaintAuthorized:false
 };
}
type Row=ReturnType<typeof compare>;
function connectedComponents(sideRows:readonly Row[],parts:readonly Mesh[]){
 const adjacency=new Map<number,Set<number>>(parts.map(p=>[p.originalMinFace,new Set<number>()]));
 for(const row of sideRows)if(row.exactCommonPositionCount){
  adjacency.get(row.a)!.add(row.b);
  adjacency.get(row.b)!.add(row.a);
 }
 const visited=new Set<number>(),components:number[][]=[];
 for(const id of [...adjacency.keys()].sort((a,b)=>a-b)){
  if(visited.has(id))continue;
  const next=[id],group:number[]=[];
  visited.add(id);
  while(next.length){
   const a=next.pop()!;group.push(a);
   for(const b of adjacency.get(a)!)if(!visited.has(b)){visited.add(b);next.push(b);}
  }
  components.push(group.sort((a,b)=>a-b));
 }
 return components.sort((a,b)=>a[0]!-b[0]!);
}
function checkPhase12P(rows:readonly Row[]){
 const file=process.env.T21_PHASE12P_REPORT_INPUT;
 if(!file)return {priorReportVerified:false,priorPairs:0,priorContacts:0};
 if(!existsSync(file))throw Error('PHASE12Q_PHASE12P_INPUT_REPORT_MISSING');
 const p=JSON.parse(readFileSync(file,'utf8')) as {
  originalSourceSHA256:string;evaluatedPairs:number;
  physicalWeldProven:boolean;walkableFloorProven:boolean;
  rows:{a:number;b:number;closestTriangle3DMeters:number;
   closestSourceVertex3DMeters:number;
   originalSharedOBJVertexIDCount:number;originalSharedOBJEdgeCount:number}[]};
 expect(p.originalSourceSHA256).toBe(PIN);
 expect(p.evaluatedPairs).toBe(80);
 expect(p.rows).toHaveLength(80);
 expect(p.physicalWeldProven).toBe(false);
 expect(p.walkableFloorProven).toBe(false);
 const keyRow=(a:number,b:number)=>[a,b].sort((x,y)=>x-y).join(':');
 const pairs=new Map(rows.map(r=>[keyRow(r.a,r.b),r]));
 expect(pairs.size).toBe(110);
 const compared=new Map<string,number>(),directed=new Set<string>();
 let contacts=0;
 for(const original of p.rows){
  const k=keyRow(original.a,original.b);
  const direction=original.a+':'+original.b;
  expect(directed.has(direction)).toBe(false);directed.add(direction);
  const prior=compared.get(k)||0;
  expect(prior).toBeLessThan(2);
  if(prior===1)expect(M.some(x=>x.originalMinFace===original.b)).toBe(true);
  compared.set(k,prior+1);
  const current=pairs.get(k);
  expect(current).toBeDefined();
  expect(M.some(x=>x.originalMinFace===original.a)).toBe(true);
  expect(original.originalSharedOBJVertexIDCount).toBe(current!.sharedOriginalOBJVertexIDCount);
  expect(original.originalSharedOBJEdgeCount).toBe(0);
  if(original.closestTriangle3DMeters<1e-7)contacts++;
  // For the 80 previously measured pairs, zero triangle-distance implies
  // at least one independently established exact source-XYZ vertex witness.
  // This implication is verified for the PINNED source, not universally assumed.
  expect(original.closestTriangle3DMeters<1e-7).toBe(current!.exactCommonPositionCount>0);
  expect(original.closestSourceVertex3DMeters<1e-7).toBe(current!.exactCommonPositionCount>0);
 }
 expect(directed.size).toBe(80);
 expect(compared.size).toBe(68);
 expect([...compared.values()].filter(n=>n===2)).toHaveLength(12);
 expect([...compared.values()].filter(n=>n===1)).toHaveLength(56);
 expect(contacts).toBe(32);
 return {priorReportVerified:true,priorPairs:directed.size,
  priorDistinctUnorderedPairs:compared.size,priorReverseDirectionPairs:12,priorContacts:contacts};
}
describe('T21 Phase12Q independent original-XYZ coincidence and unwelded seam graph',()=>{
 it('preserves T20/T21, complete 22 original source-only parts and hard XZ',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);
  expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(all).toHaveLength(22);
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  const ids=new Set<number>();
  for(const m of all){
   expect(m.reviewOnly).toBe(true);
   expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
   expect(vertices(m).size).toBeGreaterThan(2);
   expect(m.originalGlobalFaceIndices).toHaveLength(m.originalSourceTriangleCount);
   for(const id of m.originalGlobalFaceIndices){
    expect(ids.has(id)).toBe(false);
    ids.add(id);
   }
  }
  expect(ids.size).toBe(488);
 });
 it('separates shared position, original OBJ ID, geometrically shared edge/triangle',()=>{
  const fake=(face:number,ids:number[],v:V[]):Mesh=>({
   originalMinFace:face,originalMirrorMinFace:face,
   originalSourceTriangleCount:1,originalGlobalFaceIndices:[face],
   originalOBJVertexIdTriples:[ids],vertices:v,reviewOnly:true,
   runtimePromotionAuthorized:false,gameplayFloorCollisionPaintNavScoringAuthority:'NONE'
  });
  const a=fake(1,[1,2,3],[[-2,0,0],[-1,0,0],[-2,1,0]]);
  const point=fake(2,[4,5,6],[[-2,0,0],[-3,0,0],[-3,1,0]]);
  const edge=fake(3,[7,8,9],[[-2,0,0],[-1,0,0],[-1,-1,0]]);
  const same=fake(4,[10,11,12],[[-2,1,0],[-1,0,0],[-2,0,0]]);
  const separate=fake(5,[13,14,15],[[-20,0,0],[-21,0,0],[-20,1,0]]);
  expect(compare(a,point)).toMatchObject({exactCommonPositionCount:1,
   exactGeometricEdgeCount:0,sharedOriginalOBJVertexIDCount:0,
   contactClass:'EXACT_POSITION_VERTEX_ONLY'});
  expect(compare(a,edge)).toMatchObject({exactCommonPositionCount:2,
   exactGeometricEdgeCount:1,sharedOriginalOBJVertexIDCount:0,
   contactClass:'EXACT_POSITION_EDGE_COINCIDENCE'});
  expect(compare(a,same)).toMatchObject({exactCommonPositionCount:3,
   exactGeometricFaceCount:1,sharedOriginalOBJVertexIDCount:0,
   contactClass:'EXACT_POSITION_TRIANGLE_COINCIDENCE'});
  expect(compare(a,separate)).toMatchObject({exactCommonPositionCount:0,
   contactClass:'NO_EXACT_POSITION_COINDICENCE'});
 });
 it('audits all 110 unordered same-side original source pairs, mirror invariance and P',()=>{
  const rows:Row[]=[];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
   if(side(all[i]!)!==side(all[j]!))continue;
   rows.push(compare(all[i]!,all[j]!));
  }
  expect(all.filter(x=>side(x)==='LEFT')).toHaveLength(11);
  expect(all.filter(x=>side(x)==='RIGHT')).toHaveLength(11);
  expect(rows).toHaveLength(110);
  expect(rows.filter(r=>r.side==='LEFT')).toHaveLength(55);
  expect(rows.filter(r=>r.side==='RIGHT')).toHaveLength(55);
  expect(rows.every(r=>!r.originalOBJIDWeldProven&&!r.physicalCollisionFloorNavOrPaintAuthorized)).toBe(true);
  // These are distinct original OBJ-ID-connected components, never reinterpret
  // geometric XYZ coincidence as source-ID connectivity.
  expect(rows.every(r=>r.sharedOriginalOBJVertexIDCount===0)).toBe(true);
  const pairKey=(a:number,b:number)=>[a,b].sort((x,y)=>x-y).join(':');
  const lookup=new Map(rows.map(r=>[pairKey(r.a,r.b),r]));
  expect(lookup.size).toBe(110);
  const meshMap=new Map(all.map(m=>[m.originalMinFace,m]));
  let mirrored=0;
  for(const row of rows){
   const mirrorA=meshMap.get(row.a)!.originalMirrorMinFace;
   const mirrorB=meshMap.get(row.b)!.originalMirrorMinFace;
   const twin=lookup.get(pairKey(mirrorA,mirrorB));
   expect(twin).toBeDefined();
   expect(twin!.side).not.toBe(row.side);
   expect(twin!.exactCommonPositionCount).toBe(row.exactCommonPositionCount);
   expect(twin!.exactGeometricEdgeCount).toBe(row.exactGeometricEdgeCount);
   expect(twin!.exactGeometricFaceCount).toBe(row.exactGeometricFaceCount);
   expect(twin!.contactClass).toBe(row.contactClass);
   mirrored++;
  }
  expect(mirrored).toBe(110);
  const left=connectedComponents(rows.filter(r=>r.side==='LEFT'),
    all.filter(m=>side(m)==='LEFT'));
  const right=connectedComponents(rows.filter(r=>r.side==='RIGHT'),
    all.filter(m=>side(m)==='RIGHT'));
  expect(left.flat()).toHaveLength(11);expect(right.flat()).toHaveLength(11);
  const verified=checkPhase12P(rows);
  const classificationCounts=Object.fromEntries(
   [...new Set(rows.map(r=>r.contactClass))].sort().map(k=>
    [k,rows.filter(r=>r.contactClass===k).length]));
  const result={version:'T21_PHASE12Q_EXACT_FLOAT64_POSITION_SEAM_GRAPH_V1',
   originalSourceSHA256:PIN, auditedSourceComponents:22,auditedOriginalFaces:488,
   originalDefaultSourceCountUnchanged:124,walkSourceInventoryUnchanged:64,
   frozenHardXZPoints:42,sourceOnly:true,visualFreezeApproved:false,
   runtimePromotionAuthorized:false,originalUnrenderedComponentsHeld:28,
   originalUnrenderedTrianglesHeld:616,physicalWeldOrWalkableFloorProven:false,
   sameSideUnorderedPairs:110,originalSharedIDPairs:0,
   geometricPositionOnlyContactPairs:rows.filter(r=>r.exactCommonPositionCount>0).length,
   classificationCounts,mirroredPairChecks:mirrored,
   phase12PCrossCheck:verified,
   // GRAPH = exact position coincidence ONLY; NO game connection.
   opticalPositionGraphLeft:left,opticalPositionGraphRight:right,rows};
  if(process.env.T21_PHASE12Q_REPORT)
   writeFileSync(process.env.T21_PHASE12Q_REPORT,JSON.stringify(result,null,2));
  console.log('T21_PHASE12Q_EXACT_SOURCE_XYZ_SEAM_GRAPH',
   JSON.stringify({pairs:110,counts:classificationCounts,
    originalSharedIDPairs:0,phase12PCrossCheck:verified,
    geometricPositionOnlyContactPairs:result.geometricPositionOnlyContactPairs,
    groupsLeft:left,groupsRight:right}));
 });
});
