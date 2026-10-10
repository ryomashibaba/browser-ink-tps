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

/** Phase12S: exact original OBJ-ID edge incidence and isolated open-boundary
 * topology audit. No vertex welding (including coincident XYZ), no runtime geometry.
 * A closed isolated ID shell would still NOT authorize a physical collider.
 */
type V=readonly [number,number,number];
type Mesh={readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly originalSourceTriangleCount:number;readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly V[];readonly reviewOnly:true;
 readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE'};
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const parts:readonly Mesh[]=[...I,...K,...L,...M];
type Incident={face:number;sign:number;geometricKey:string};
type Indexed={mesh:Mesh;originalEdges:Map<string,Incident[]>;
 geometricEdges:Map<string,Incident[]>;uniqueIDXYZ:Map<number,string>};
const pos=(v:V):string=>{
 if(!v.every(Number.isFinite))throw Error('PHASE12S_NONFINITE_SOURCE_VERTEX');
 return v.map(x=>Object.is(x,-0)?0:x).join(',');
};
const geoEdge=(a:V,b:V):string=>JSON.stringify([pos(a),pos(b)].sort());
const idEdge=(a:number,b:number):string=>a<b?a+':'+b:b+':'+a;
const pair=(a:number,b:number):string=>[a,b].sort((x,y)=>x-y).join(':');
function side(m:Mesh):'LEFT'|'RIGHT'{
 const a=m.vertices.reduce((n,v)=>n+v[0],0)/m.vertices.length;
 if(!Number.isFinite(a)||Math.abs(a)<.5)throw Error('PHASE12S_ORIGINAL_SIDE_UNKNOWN');
 return a<0?'LEFT':'RIGHT';
}
function sourceIndex(mesh:Mesh):Indexed{
 const originalEdges=new Map<string,Incident[]>(),geometricEdges=new Map<string,Incident[]>(),
  uniqueIDXYZ=new Map<number,string>(),sourceFaces=new Set<number>();
 expect(mesh.originalGlobalFaceIndices).toHaveLength(mesh.originalSourceTriangleCount);
 expect(mesh.originalOBJVertexIdTriples).toHaveLength(mesh.originalSourceTriangleCount);
 expect(mesh.vertices).toHaveLength(mesh.originalSourceTriangleCount*3);
 for(let i=0;i<mesh.originalSourceTriangleCount;i++){
  const ids=mesh.originalOBJVertexIdTriples[i]!,xyz=mesh.vertices.slice(i*3,i*3+3);
  const face=mesh.originalGlobalFaceIndices[i]!;
  expect(ids).toHaveLength(3);expect(xyz).toHaveLength(3);
  if(new Set(ids).size!==3||sourceFaces.has(face))
   throw Error('PHASE12S_DEGENERATE_OR_DUPLICATE_SOURCE_FACE_ID');
  sourceFaces.add(face);
  const u=[xyz[1]![0]-xyz[0]![0],xyz[1]![1]-xyz[0]![1],xyz[1]![2]-xyz[0]![2]];
  const v=[xyz[2]![0]-xyz[0]![0],xyz[2]![1]-xyz[0]![1],xyz[2]![2]-xyz[0]![2]];
  if(Math.hypot(u[1]!*v[2]!-u[2]!*v[1]!,
   u[2]!*v[0]!-u[0]!*v[2]!,u[0]!*v[1]!-u[1]!*v[0]!)<1e-12)
   throw Error('PHASE12S_DEGENERATE_ORIGINAL_TRIANGLE');
  for(let k=0;k<3;k++){
   const id=ids[k]!,p=pos(xyz[k]!);
   if(uniqueIDXYZ.has(id)&&uniqueIDXYZ.get(id)!==p)
    throw Error('PHASE12S_ONE_OBJ_ID_HAS_DIFFERENT_COORDINATES');
   uniqueIDXYZ.set(id,p);
   const next=ids[(k+1)%3]!,g=geoEdge(xyz[k]!,xyz[(k+1)%3]!);
   if(p===pos(xyz[(k+1)%3]!))throw Error('PHASE12S_ZERO_SOURCE_EDGE');
   const signed=id<next?1:-1;
   const entry:Incident={face,sign:signed,geometricKey:g};
   const key=idEdge(id,next),old=originalEdges.get(key)||[];
   old.push(entry);originalEdges.set(key,old);
   const geometrical=geometricEdges.get(g)||[];
   geometrical.push(entry);geometricEdges.set(g,geometrical);
  }
 }
 return {mesh,originalEdges,geometricEdges,uniqueIDXYZ};
}
type Summary=ReturnType<typeof summarize>;
function summarize(i:Indexed){
 let boundary=0,interior=0,nonManifold=0,orientationConflict=0;
 const degree=new Map<number,number>(),boundaryAdjacent=new Map<number,Set<number>>();
 const addNeighbor=(u:number,v:number)=>{
  const s=boundaryAdjacent.get(u)||new Set<number>();s.add(v);boundaryAdjacent.set(u,s);
 };
 for(const [k,faces] of i.originalEdges){
  if(faces.length===1){
   boundary++;
   const [a,b]=k.split(':').map(Number);
   degree.set(a,(degree.get(a)||0)+1);degree.set(b,(degree.get(b)||0)+1);
   addNeighbor(a,b);addNeighbor(b,a);
  }else if(faces.length===2){
   interior++;
   if(faces[0]!.sign===faces[1]!.sign)orientationConflict++;
  }else if(faces.length>2)nonManifold++;
  else throw Error('PHASE12S_INVALID_EDGE_INCIDENCE');
 }
 const seen=new Set<number>();let boundaryNetworks=0,boundaryClosedLoops=0;
 for(const x of boundaryAdjacent.keys()){
  if(seen.has(x))continue;
  const todo=[x],group:number[]=[];seen.add(x);
  while(todo.length){
   const n=todo.pop()!;group.push(n);
   for(const v of boundaryAdjacent.get(n)||[])if(!seen.has(v)){seen.add(v);todo.push(v);}
  }
  boundaryNetworks++;
  if(group.every(n=>degree.get(n)===2))boundaryClosedLoops++;
 }
 const boundaryBranchOrEndVertices=[...degree.values()].filter(n=>n!==2).length;
 const F=i.mesh.originalSourceTriangleCount,V=i.uniqueIDXYZ.size,E=i.originalEdges.size;
 if(3*F!==boundary+2*interior+
  [...i.originalEdges.values()].filter(x=>x.length>2).reduce((s,v)=>s+v.length,0))
  throw Error('PHASE12S_INCIDENCE_EULER_SUM_INVALID');
 return {minFace:i.mesh.originalMinFace,mirrorMinFace:i.mesh.originalMirrorMinFace,
  sourceFaceCount:F,sourceUniqueOBJVertexCount:V,sourceOBJEdgeCount:E,
  sourceOBJBoundaryEdges:boundary,sourceOBJInteriorTwoFaceEdges:interior,
  sourceOBJNonManifoldEdges:nonManifold,sourceOBJSameDirectedInteriorEdges:orientationConflict,
  sourceBoundaryVertexCount:degree.size,sourceBoundaryBranchOrEndVertices:boundaryBranchOrEndVertices,
  sourceBoundaryNetworks:boundaryNetworks,sourceClosedBoundaryLoops:boundaryClosedLoops,
  originalEulerCharacteristic:V-E+F,
  isolatedClosedWindingConsistentOBJIDs:boundary===0&&nonManifold===0&&orientationConflict===0,
  physicalColliderOrWalkableFloorProven:false};
}
function correlateR(indexed:readonly Indexed[]){
 const file=process.env.T21_PHASE12R_REPORT_INPUT;
 if(!file){
  if(process.env.T21_PHASE12S_REPORT)throw Error('PHASE12S_REQUIRED_PHASE12R_REPORT_MISSING');
  return {phase12RCrossCheckPerformed:false,comparedPairs:0};
 }
 if(!existsSync(file))throw Error('PHASE12S_PINNED_PHASE12R_REPORT_NOT_FOUND');
 const r=JSON.parse(readFileSync(file,'utf8')) as {
  originalSourceSHA256:string;sameSideOriginalPairs:number;mirrorChecks:number;
  crossCheckQ:{validated:boolean;matched:number};
  rows:{a:number;b:number;exactGeometricEdgeCount:number;
   bothSourceBoundaryEdgeCount:number;internalOrNonManifoldEdgeCount:number}[]};
 expect(r.originalSourceSHA256).toBe(PIN);
 expect(r.sameSideOriginalPairs).toBe(110);
 expect(r.mirrorChecks).toBe(110);
 expect(r.crossCheckQ).toMatchObject({validated:true,matched:110});
 expect(r.rows).toHaveLength(110);
 const expected=new Map(r.rows.map(row=>[pair(row.a,row.b),row]));
 expect(expected.size).toBe(110);
 let checked=0;
 for(let a=0;a<indexed.length;a++)for(let b=a+1;b<indexed.length;b++){
  const A=indexed[a]!,B=indexed[b]!;
  if(side(A.mesh)!==side(B.mesh))continue;
  const R=expected.get(pair(A.mesh.originalMinFace,B.mesh.originalMinFace));
  expect(R).toBeDefined();
  const shared=[...A.geometricEdges.keys()].filter(k=>B.geometricEdges.has(k));
  const bb=shared.filter(k=>A.geometricEdges.get(k)!.length===1&&
    B.geometricEdges.get(k)!.length===1).length;
  expect(shared.length).toBe(R!.exactGeometricEdgeCount);
  expect(bb).toBe(R!.bothSourceBoundaryEdgeCount);
  expect(shared.length-bb).toBe(R!.internalOrNonManifoldEdgeCount);
  checked++;
 }
 expect(checked).toBe(110);
 return {phase12RCrossCheckPerformed:true,comparedPairs:checked};
}
describe('T21 Phase12S pinned source-only open boundary and non-manifold evidence',()=>{
 it('guards T20 production, T21 inactive, 124/64/42 and original 488-face source-only freeze',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);
  expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(parts).toHaveLength(22);
  expect(parts.reduce((s,x)=>s+x.originalSourceTriangleCount,0)).toBe(488);
  const faces=new Set<number>(),ids=new Set<number>();
  for(const m of parts){
   expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
   const obj=sourceIndex(m);
   for(const f of m.originalGlobalFaceIndices){expect(faces.has(f)).toBe(false);faces.add(f);}
   for(const id of obj.uniqueIDXYZ.keys()){
    expect(ids.has(id)).toBe(false);ids.add(id);
   }
  }
  expect(faces.size).toBe(488);
 });
 it('detects open triangles, correct closed tetrahedral shells, and non-manifold edges',()=>{
  const mock=(faces:{ids:number[];points:V[]}[]):Mesh=>({
   originalMinFace:1,originalMirrorMinFace:2,originalSourceTriangleCount:faces.length,
   originalGlobalFaceIndices:faces.map((_,i)=>i+1),
   originalOBJVertexIdTriples:faces.map(f=>f.ids),
   vertices:faces.flatMap(f=>f.points),
   reviewOnly:true,runtimePromotionAuthorized:false,
   gameplayFloorCollisionPaintNavScoringAuthority:'NONE'});
  const p:V[]=[[-2,0,0],[-1,0,0],[-2,1,0],[-2,0,1]];
  const face=(ids:number[])=>({ids,points:ids.map(x=>p[x-1]!)});
  const open=summarize(sourceIndex(mock([face([1,2,3])])));
  expect(open).toMatchObject({sourceOBJBoundaryEdges:3,sourceOBJInteriorTwoFaceEdges:0,
   sourceOBJNonManifoldEdges:0,sourceClosedBoundaryLoops:1,
   isolatedClosedWindingConsistentOBJIDs:false});
  const tetra=summarize(sourceIndex(mock([
   face([1,3,2]),face([1,2,4]),face([2,3,4]),face([3,1,4])])));
  expect(tetra).toMatchObject({sourceOBJBoundaryEdges:0,sourceOBJInteriorTwoFaceEdges:6,
   sourceOBJNonManifoldEdges:0,sourceOBJSameDirectedInteriorEdges:0,
   originalEulerCharacteristic:2,isolatedClosedWindingConsistentOBJIDs:true});
  const bad=summarize(sourceIndex(mock([
   face([1,2,3]),face([2,1,4]),face([1,2,4])])));
  expect(bad.sourceOBJNonManifoldEdges).toBe(1);
 });
 it('classifies original 22 independent source patches and checks Phase12R source geometry',()=>{
  const indexed=parts.map(sourceIndex),summaries=indexed.map(summarize);
  const map=new Map(summaries.map(s=>[s.minFace,s]));
  expect(map.size).toBe(22);
  for(const s of summaries){
   const mirror=map.get(s.mirrorMinFace);expect(mirror).toBeDefined();
   for(const field of ['sourceFaceCount','sourceUniqueOBJVertexCount','sourceOBJEdgeCount',
    'sourceOBJBoundaryEdges','sourceOBJInteriorTwoFaceEdges','sourceOBJNonManifoldEdges',
    'sourceOBJSameDirectedInteriorEdges','sourceBoundaryVertexCount',
    'sourceBoundaryBranchOrEndVertices','sourceBoundaryNetworks',
    'sourceClosedBoundaryLoops','originalEulerCharacteristic'] as const)
    expect(s[field]).toBe(mirror![field]);
   expect(s.physicalColliderOrWalkableFloorProven).toBe(false);
  }
  const total=(key:'sourceFaceCount'|'sourceOBJBoundaryEdges'|
   'sourceOBJInteriorTwoFaceEdges'|'sourceOBJNonManifoldEdges'|
   'sourceOBJSameDirectedInteriorEdges'|'sourceClosedBoundaryLoops')=>
    summaries.reduce((n,s)=>n+s[key],0);
  expect(total('sourceFaceCount')).toBe(488);
  expect(total('sourceOBJBoundaryEdges')).toBe(524);
  expect(total('sourceOBJInteriorTwoFaceEdges')).toBe(470);
  expect(total('sourceOBJNonManifoldEdges')).toBe(0);
  expect(total('sourceOBJSameDirectedInteriorEdges')).toBe(0);
  expect(total('sourceClosedBoundaryLoops')).toBe(22);
  expect(summaries.every(s=>!s.isolatedClosedWindingConsistentOBJIDs)).toBe(true);
  expect(summaries.every(s=>s.sourceBoundaryBranchOrEndVertices===0)).toBe(true);
  const crossCheckR=correlateR(indexed);
  const report={version:'T21_PHASE12S_PINNED_ORIGINAL_OBJ_ID_BOUNDARY_TOPOLOGY_V1',
   originalSourceSHA256:PIN,sourceOnly:true,originalComponents:22,originalFaces:488,
   originalOBJBoundaryEdges:524,originalOBJInteriorTwoFaceEdges:470,
   originalOBJNonManifoldEdges:0,originalOBJSameDirectedInteriorEdges:0,
   isolatedClosedShellsInOriginalOBJIDTopology:0,originalClosedBoundaryLoops:22,
   mirrorComponentChecks:22,defaultOriginalDisplayHeld:124,walkSourceInventoryHeld:64,
   originalMacroXZPointsHeld:42,unusedSourceComponentsHeld:28,
   originalOBJIDWeldAcrossPatchesProven:false,gameplayCollisionNavPaintScoringAuthority:'NONE',
   visualFreezeApproved:false,runtimePromotionAuthorized:false,
   crossCheckR,summaries};
  if(process.env.T21_PHASE12S_REPORT)
   writeFileSync(process.env.T21_PHASE12S_REPORT,JSON.stringify(report,null,2));
  console.log('T21_PHASE12S_OBJ_ID_OPEN_BOUNDARIES',JSON.stringify({
   components:22,faces:488,boundary:524,interior:470,nonManifold:0,
   loops:22,closedShells:0,checkedR:crossCheckR.comparedPairs}));
 });
});
