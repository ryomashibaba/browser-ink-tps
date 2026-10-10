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

/* Phase12R: original source edge incidence + face normal angles.
   Identical XYZ is not original OBJ-ID welding or runtime connection. */
const minus=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross3=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot3=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function point(v:V):string{
 if(v.some(x=>!Number.isFinite(x)))throw Error('PHASE12R_NONFINITE_SOURCE_XYZ');
 return v.map(x=>Object.is(x,-0)?0:x).join(',');
}
const edgeKey=(a:V,b:V):string=>JSON.stringify([point(a),point(b)].sort());
const pairKey=(a:number,b:number):string=>[a,b].sort((x,y)=>x-y).join(':');
function side(m:Mesh):'LEFT'|'RIGHT'{
 const x=m.vertices.reduce((v,p)=>v+p[0],0)/m.vertices.length;
 if(!Number.isFinite(x)||Math.abs(x)<.5)throw Error('PHASE12R_AMBIGUOUS_ORIGINAL_HALF');
 return x<0?'LEFT':'RIGHT';
}
type E={face:number;normal:V};
type Indexed={mesh:Mesh;edges:Map<string,E[]>;points:Set<string>;faces:Set<string>;ids:Set<number>};
function indexMesh(m:Mesh):Indexed{
 const edges=new Map<string,E[]>(),points=new Set<string>(),
   faces=new Set<string>(),ids=new Set<number>();
 const idXYZ=new Map<number,string>(),usedFaces=new Set<number>();
 expect(m.vertices).toHaveLength(m.originalSourceTriangleCount*3);
 expect(m.originalOBJVertexIdTriples).toHaveLength(m.originalSourceTriangleCount);
 expect(m.originalGlobalFaceIndices).toHaveLength(m.originalSourceTriangleCount);
 for(let i=0;i<m.originalSourceTriangleCount;i++){
  const xyz=m.vertices.slice(i*3,i*3+3) as V[];
  const objIds=m.originalOBJVertexIdTriples[i]!;
  const face=m.originalGlobalFaceIndices[i]!;
  expect(objIds).toHaveLength(3);expect(usedFaces.has(face)).toBe(false);usedFaces.add(face);
  const n=cross3(minus(xyz[1]!,xyz[0]!),minus(xyz[2]!,xyz[0]!));
  const length=Math.hypot(...n);
  if(!(length>1e-12))throw Error('PHASE12R_DEGENERATE_ORIGINAL_FACE');
  const normal:V=[n[0]/length,n[1]/length,n[2]/length];
  faces.add(JSON.stringify(xyz.map(point).sort()));
  for(let t=0;t<3;t++){
   const v=xyz[t]!, k=point(v), id=objIds[t]!;
   if(idXYZ.has(id))expect(idXYZ.get(id)).toBe(k);
   idXYZ.set(id,k);points.add(k);ids.add(id);
   const v2=xyz[(t+1)%3]!;
   if(k===point(v2))throw Error('PHASE12R_ZERO_SOURCE_TRIANGLE_EDGE');
   const ek=edgeKey(v,v2),incidence=edges.get(ek)||[];
   incidence.push({face,normal});edges.set(ek,incidence);
  }
 }
 return {mesh:m,edges,points,faces,ids};
}
function audit(a:Indexed,b:Indexed){
 const common=[...a.edges.keys()].filter(k=>b.edges.has(k)).sort();
 const coincidentFaces=[...a.faces].filter(k=>b.faces.has(k));
 const commonPositions=[...a.points].filter(k=>b.points.has(k));
 const sharedIDs=[...a.ids].filter(x=>b.ids.has(x));
 let bothBoundary=0,nonBoundary=0,angleSamples=0,coplanar=0,crease=0;
 let minimum=Infinity,maximum=-Infinity;
 const witnesses:{edgeKey:string;faceA:number;faceB:number;unsignedAngleDeg:number;
  originalAIncidence:number;originalBIncidence:number}[]=[];
 for(const k of common){
  const ea=a.edges.get(k)!,eb=b.edges.get(k)!;
  if(ea.length===1&&eb.length===1)bothBoundary++;else nonBoundary++;
  for(const x of ea)for(const y of eb){
   const theta=Math.acos(Math.max(-1,Math.min(1,dot3(x.normal,y.normal))))*180/Math.PI;
   const acute=Math.min(theta,180-theta);
   if(!Number.isFinite(acute))throw Error('PHASE12R_NORMAL_INVALID');
   minimum=Math.min(minimum,acute);maximum=Math.max(maximum,acute);
   if(acute<0.1)coplanar++;else crease++;
   angleSamples++;
   if(witnesses.length<3)witnesses.push({edgeKey:k,faceA:x.face,faceB:y.face,
    unsignedAngleDeg:Number(acute.toFixed(6)),
    originalAIncidence:ea.length,originalBIncidence:eb.length});
  }
 }
 return {a:a.mesh.originalMinFace,b:b.mesh.originalMinFace,side:side(a.mesh),
  exactCommonPositionCount:commonPositions.length,exactGeometricEdgeCount:common.length,
  exactGeometricFaceCount:coincidentFaces.length,sharedOriginalOBJVertexIDCount:sharedIDs.length,
  bothSourceBoundaryEdgeCount:bothBoundary,
  internalOrNonManifoldEdgeCount:nonBoundary,normalFacePairObservations:angleSamples,
  coplanarWithinPointOneDegreeObservations:coplanar,nonCoplanarCreaseObservations:crease,
  minUnsignedDihedralDeg:Number.isFinite(minimum)?Number(minimum.toFixed(6)):null,
  maxUnsignedDihedralDeg:Number.isFinite(maximum)?Number(maximum.toFixed(6)):null,
  witnesses,physicalWeldOrWalkableFloorProven:false};
}
type Row=ReturnType<typeof audit>;
function checkQ(rows:readonly Row[]){
 const file=process.env.T21_PHASE12Q_REPORT_INPUT;
 if(!file){
  if(process.env.GITHUB_ACTIONS)throw Error('PHASE12R_REQUIRED_PHASE12Q_GATE_NOT_SUPPLIED');
  return {validated:false,matched:0};
 }
 if(!existsSync(file))throw Error('PHASE12R_PINNED_PHASE12Q_JSON_MISSING');
 const data=JSON.parse(readFileSync(file,'utf8')) as {
  originalSourceSHA256:string;sameSideUnorderedPairs:number;mirroredPairChecks:number;
  originalSharedIDPairs:number;physicalWeldOrWalkableFloorProven:boolean;
  phase12PCrossCheck:{priorReportVerified:boolean;priorPairs:number;priorContacts:number};
  rows:{a:number;b:number;exactCommonPositionCount:number;
   exactGeometricEdgeCount:number;exactGeometricFaceCount:number;sharedOriginalOBJVertexIDCount:number}[]};
 expect(data.originalSourceSHA256).toBe(PIN);
 expect(data.sameSideUnorderedPairs).toBe(110);
 expect(data.mirroredPairChecks).toBe(110);
 expect(data.originalSharedIDPairs).toBe(0);
 expect(data.physicalWeldOrWalkableFloorProven).toBe(false);
 expect(data.phase12PCrossCheck).toMatchObject({priorReportVerified:true,priorPairs:80,priorContacts:32});
 expect(data.rows).toHaveLength(110);
 const q=new Map(data.rows.map(r=>[pairKey(r.a,r.b),r]));
 expect(q.size).toBe(110);
 for(const r of rows){
  const v=q.get(pairKey(r.a,r.b));expect(v).toBeDefined();
  expect(r.exactCommonPositionCount).toBe(v!.exactCommonPositionCount);
  expect(r.exactGeometricEdgeCount).toBe(v!.exactGeometricEdgeCount);
  expect(r.exactGeometricFaceCount).toBe(v!.exactGeometricFaceCount);
  expect(r.sharedOriginalOBJVertexIDCount).toBe(v!.sharedOriginalOBJVertexIDCount);
 }
 return {validated:true,matched:rows.length};
}
describe('T21 Phase12R independent original-source edge incidence and surface angles',()=>{
 it('holds source-only, T20 production, T21 inactive, 64 walk and 42-point boundary',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);
  expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(all).toHaveLength(22);
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  const faceIds=new Set<number>();
  for(const m of all){
   expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
   for(const f of m.originalGlobalFaceIndices){expect(faceIds.has(f)).toBe(false);faceIds.add(f);}
  }
  expect(faceIds.size).toBe(488);
 });
 it('distinguishes original geometric boundary edges, coplanar and 90-degree crease',()=>{
  const fake=(id:number,ids:number[],xyz:V[]):Mesh=>({
   originalMinFace:id,originalMirrorMinFace:id,originalSourceTriangleCount:1,
   originalGlobalFaceIndices:[id],originalOBJVertexIdTriples:[ids],vertices:xyz,
   reviewOnly:true,runtimePromotionAuthorized:false,
   gameplayFloorCollisionPaintNavScoringAuthority:'NONE'});
  const a=indexMesh(fake(1,[1,2,3],[[-2,0,0],[-1,0,0],[-2,1,0]]));
  const flat=indexMesh(fake(2,[4,5,6],[[-1,0,0],[-2,0,0],[-1,1,0]]));
  const wall=indexMesh(fake(3,[7,8,9],[[-1,0,0],[-2,0,0],[-2,0,1]]));
  expect(audit(a,flat)).toMatchObject({exactGeometricEdgeCount:1,
   sharedOriginalOBJVertexIDCount:0,bothSourceBoundaryEdgeCount:1,
   coplanarWithinPointOneDegreeObservations:1,nonCoplanarCreaseObservations:0});
  expect(audit(a,wall)).toMatchObject({exactGeometricEdgeCount:1,
   sharedOriginalOBJVertexIDCount:0,bothSourceBoundaryEdgeCount:1,
   coplanarWithinPointOneDegreeObservations:0,nonCoplanarCreaseObservations:1});
 });
 it('audits 110 original-source pairs independently of Q and validates mirror angle invariance',()=>{
  const s=all.map(indexMesh),rows:Row[]=[];
  for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++){
   if(side(s[i]!.mesh)===side(s[j]!.mesh))rows.push(audit(s[i]!,s[j]!));
  }
  expect(rows).toHaveLength(110);
  expect(rows.filter(r=>r.side==='LEFT')).toHaveLength(55);
  expect(rows.filter(r=>r.side==='RIGHT')).toHaveLength(55);
  const lookup=new Map(rows.map(r=>[pairKey(r.a,r.b),r]));
  const original=new Map(all.map(x=>[x.originalMinFace,x]));
  expect(lookup.size).toBe(110);
  for(const row of rows){
   const mirror=lookup.get(pairKey(original.get(row.a)!.originalMirrorMinFace,
    original.get(row.b)!.originalMirrorMinFace));
   expect(mirror).toBeDefined();
   expect(mirror!.side).not.toBe(row.side);
   for(const name of ['exactCommonPositionCount','exactGeometricEdgeCount',
    'exactGeometricFaceCount','bothSourceBoundaryEdgeCount',
    'internalOrNonManifoldEdgeCount','normalFacePairObservations',
    'coplanarWithinPointOneDegreeObservations','nonCoplanarCreaseObservations'] as const)
    expect(mirror![name]).toBe(row[name]);
   if(row.minUnsignedDihedralDeg!==null){
    expect(mirror!.minUnsignedDihedralDeg).not.toBeNull();
    expect(Math.abs(mirror!.minUnsignedDihedralDeg!-row.minUnsignedDihedralDeg))
     .toBeLessThan(0.0002);
    expect(Math.abs(mirror!.maxUnsignedDihedralDeg!-row.maxUnsignedDihedralDeg!))
     .toBeLessThan(0.0002);
   }
   expect(row.sharedOriginalOBJVertexIDCount).toBe(0);
   expect(row.physicalWeldOrWalkableFloorProven).toBe(false);
  }
  const crossCheck=checkQ(rows);
  const result={version:'T21_PHASE12R_ORIGINAL_SOURCE_BOUNDARY_EDGE_AND_DIHEDRAL_V1',
   originalSourceSHA256:PIN,reviewOnly:true,originalReviewParts:22,originalSourceFaces:488,
   sameSideOriginalPairs:110,mirrorChecks:110,originalSourceIDWeldProven:false,
   physicalWeldOrWalkableFloorProven:false,collisionPaintNavScoringCPUAuthority:'NONE',
   runtimePromotionAuthorized:false,visualFreezeApproved:false,
   unrenderedOriginalComponentsOnHold:28,
   sharedGeometricEdgePairs:rows.filter(r=>r.exactGeometricEdgeCount>0).length,
   originalBoundaryToBoundaryPairs:rows.filter(r=>r.bothSourceBoundaryEdgeCount>0).length,
   nearCoplanarPairs:rows.filter(r=>r.coplanarWithinPointOneDegreeObservations>0).length,
   creasePairs:rows.filter(r=>r.nonCoplanarCreaseObservations>0).length,
   crossCheckQ:crossCheck,rows};
  if(process.env.T21_PHASE12R_REPORT)
   writeFileSync(process.env.T21_PHASE12R_REPORT,JSON.stringify(result,null,2));
  console.log('T21_PHASE12R_SOURCE_ONLY_EDGE_ANGLE',
   JSON.stringify({pairs:110,geometricEdgePairs:result.sharedGeometricEdgePairs,
    boundaryPairs:result.originalBoundaryToBoundaryPairs,mirrorChecks:110,crossCheckQ:crossCheck}));
 });
});
