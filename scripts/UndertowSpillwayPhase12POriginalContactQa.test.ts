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

// T21 Phase12P: source-only OBJECTIVE mesh contact audit, NOT physical connectivity.
type V = readonly [number,number,number];
type Mesh = {readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly originalSourceTriangleCount:number;readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly V[];readonly sourceObject:string;readonly sourceMaterial:string;
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE'};
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const all:readonly Mesh[]=[...I,...K,...L,...M];
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V,b:V):V=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V,k:number):V=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V,b:V):number=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sq=(a:V):number=>dot(a,a);
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function segmentDistance2(p:V,q:V,x:V,y:V):number{
 const u=sub(q,p),v=sub(y,x),w=sub(p,x);
 const a=sq(u),e=sq(v),f=dot(v,w),eps=1e-20;
 if(a<=eps&&e<=eps)return sq(w);
 let s=0,t=0;
 if(a<=eps)t=clamp(f/e);
 else{
  const c=dot(u,w);
  if(e<=eps)s=clamp(-c/a);
  else{
   const b=dot(u,v),den=a*e-b*b;
   s=den>eps?clamp((b*f-c*e)/den):0;
   t=(b*s+f)/e;
   if(t<0){t=0;s=clamp(-c/a);}
   else if(t>1){t=1;s=clamp((b-c)/a);}
  }
 }
 return sq(sub(add(p,mul(u,s)),add(x,mul(v,t))));
}
function pointTriangleDistance2(p:V,t:readonly V[]):number{
 const [a,b,c]=t as [V,V,V],ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
 const d1=dot(ab,ap),d2=dot(ac,ap);
 if(d1<=0&&d2<=0)return sq(ap);
 const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
 if(d3>=0&&d4<=d3)return sq(bp);
 const vc=d1*d4-d3*d2;
 if(vc<=0&&d1>=0&&d3<=0)return sq(sub(p,add(a,mul(ab,d1/(d1-d3)))));
 const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
 if(d6>=0&&d5<=d6)return sq(cp);
 const vb=d5*d2-d1*d6;
 if(vb<=0&&d2>=0&&d6<=0)return sq(sub(p,add(a,mul(ac,d2/(d2-d6)))));
 const va=d3*d6-d5*d4;
 if(va<=0&&d4-d3>=0&&d5-d6>=0)
  return sq(sub(p,add(b,mul(sub(c,b),(d4-d3)/(d4-d3+d5-d6)))));
 const den=va+vb+vc;
 if(Math.abs(den)<1e-24)
  return Math.min(segmentDistance2(p,p,a,b),segmentDistance2(p,p,b,c),
   segmentDistance2(p,p,c,a));
 return sq(sub(p,add(add(a,mul(ab,vb/den)),mul(ac,vc/den))));
}
function segmentPiercesTriangle(p:V,q:V,t:readonly V[]):boolean{
 // Moller-Trumbore: catches interior piercing when all endpoints are separated.
 const [a,b,c]=t as [V,V,V],ray=sub(q,p),e1=sub(b,a),e2=sub(c,a);
 const h=cross(ray,e2),det=dot(e1,h);
 if(Math.abs(det)<1e-12)return false;
 const inv=1/det,s=sub(p,a),u=inv*dot(s,h);
 if(u< -1e-10||u>1+1e-10)return false;
 const v=inv*dot(ray,cross(s,e1));
 if(v< -1e-10||u+v>1+1e-10)return false;
 const alpha=inv*dot(e2,cross(s,e1));
 return alpha>=-1e-10&&alpha<=1+1e-10;
}
function triangleDistance(t:readonly V[],u:readonly V[]):number{
 for(let i=0;i<3;i++){
  if(segmentPiercesTriangle(t[i]!,t[(i+1)%3]!,u)||
     segmentPiercesTriangle(u[i]!,u[(i+1)%3]!,t))return 0;
 }
 let best=Infinity;
 for(const p of t)best=Math.min(best,pointTriangleDistance2(p,u));
 for(const p of u)best=Math.min(best,pointTriangleDistance2(p,t));
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)
  best=Math.min(best,segmentDistance2(t[i]!,t[(i+1)%3]!,
    u[j]!,u[(j+1)%3]!));
 return Math.sqrt(Math.max(0,best));
}
function unique(m:Mesh):Map<number,V>{
 const out=new Map<number,V>();
 for(let f=0;f<m.originalSourceTriangleCount;f++)for(let k=0;k<3;k++){
  const id=m.originalOBJVertexIdTriples[f]![k]!,v=m.vertices[f*3+k]!;
  const prev=out.get(id);
  if(prev)expect(prev).toEqual(v);
  out.set(id,v);
 }
 return out;
}
function faces(m:Mesh):{face:number;xyz:V[]}[]{
 return Array.from({length:m.originalSourceTriangleCount},(_,i)=>({
  face:m.originalGlobalFaceIndices[i]!,xyz:m.vertices.slice(i*3,i*3+3)}));
}
function normalAngle(a:readonly V[],b:readonly V[]):number|null{
 const n=cross(sub(a[1]!,a[0]!),sub(a[2]!,a[0]!));
 const m=cross(sub(b[1]!,b[0]!),sub(b[2]!,b[0]!));
 const denom=Math.sqrt(sq(n)*sq(m));
 return denom>1e-15?Math.acos(Math.max(-1,Math.min(1,dot(n,m)/denom)))*180/Math.PI:null;
}
function contact(a:Mesh,b:Mesh){
 const va=unique(a),vb=unique(b),ids=[...va.keys()].filter(x=>vb.has(x));
 const idsB=new Set(ids);
 const edges=(m:Mesh)=>new Set(m.originalOBJVertexIdTriples.flatMap(row=>
   [[row[0],row[1]],[row[1],row[2]],[row[2],row[0]]].map(pair=>
     [...pair].sort((a,b)=>a!-b!).join(':'))));
 const ea=edges(a),eb=edges(b);
 const sharedEdges=[...ea].filter(e=>eb.has(e)&&e.split(':').every(id=>idsB.has(Number(id))));
 let minVertex=Infinity;
 for(const v of va.values())for(const w of vb.values())
  minVertex=Math.min(minVertex,Math.hypot(...sub(v,w)));
 let minimum=Infinity,bestFaces:[number,number]|null=null,angle:number|null=null;
 const A=faces(a),B=faces(b);
 for(const x of A)for(const y of B){
  const d=triangleDistance(x.xyz,y.xyz);
  if(d<minimum-1e-12){
   minimum=d;bestFaces=[x.face,y.face];angle=normalAngle(x.xyz,y.xyz);
  }
 }
 const classification=sharedEdges.length?'SHARED_ORIGINAL_OBJ_EDGE':
  ids.length?'SHARED_ORIGINAL_OBJ_VERTEX_ONLY':
  minimum<1e-7?'GEOMETRIC_CONTACT_UNWELDED_ORIGINAL_IDS':'SEPARATED_SOURCE_SURFACES';
 return {a:a.originalMinFace,b:b.originalMinFace,originalSharedOBJVertexIDCount:ids.length,
  originalSharedOBJEdgeCount:sharedEdges.length,
  closestSourceVertex3DMeters:Number(minVertex.toFixed(9)),
  closestTriangle3DMeters:Number(minimum.toFixed(9)),closestOriginalFacePair:bestFaces,
  closestFaceNormalAngleDeg:angle===null?null:Number(angle.toFixed(4)),
  classification,physicalWeldOrWalkableSurfaceProven:false};
}
function verifyOriginalJLedger(){
 const file=process.env.T21_PHASE12J_SOURCE_JSON;
 if(!file)return;
 if(!existsSync(file))throw Error('PHASE12P_PINNED_PHASE12J_LEDGER_MISSING');
 const original=JSON.parse(readFileSync(file,'utf8')) as {
  originalSourceSHA256:string;selectedFullSourceComponentCount:number;
  selectedOriginalTriangleCount:number;
  selectedFullOriginalSourceComponents:{minFace:number;sourceTriangleCount:number;
   faces:{originalFaceIndex:number;originalOBJVertexIds:number[];
    originalProjectTriangleXYZ:V[]}[]}[]};
 expect(original.originalSourceSHA256).toBe(PIN);
 expect(original.selectedFullSourceComponentCount).toBe(44);
 expect(original.selectedOriginalTriangleCount).toBe(972);
 const lookup=new Map(original.selectedFullOriginalSourceComponents.map(x=>[x.minFace,x]));
 for(const m of [...K,...L,...M]){
  const c=lookup.get(m.originalMinFace);
  expect(c).toBeDefined();
  expect(c!.sourceTriangleCount).toBe(m.originalSourceTriangleCount);
  for(let f=0;f<m.originalSourceTriangleCount;f++){
   const originalFace=c!.faces[f]!;
   expect(originalFace.originalFaceIndex).toBe(m.originalGlobalFaceIndices[f]);
   expect(originalFace.originalOBJVertexIds).toEqual(m.originalOBJVertexIdTriples[f]);
   const buffer=(arr:readonly number[])=>{
    const b=Buffer.alloc(arr.length*8);
    arr.forEach((v,i)=>b.writeDoubleLE(v,i*8));
    return b.toString('hex');
   };
   for(let k=0;k<3;k++)
    expect(buffer(originalFace.originalProjectTriangleXYZ[k]!))
     .toBe(buffer(m.vertices[f*3+k]!));
  }
 }
}
describe('T21 Phase12P SHA-pinned source-only original OBJ weld/contact evidence gate',()=>{
 it('holds runtime, source inventories and all original Face/vertex records',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect(I).toHaveLength(6);expect(K).toHaveLength(4);
  expect(L).toHaveLength(4);expect(M).toHaveLength(8);
  expect(all).toHaveLength(22);
  expect(all.reduce((s,m)=>s+m.originalSourceTriangleCount,0)).toBe(488);
  const globalFaces=new Set<number>();
  for(const m of all){
   expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
   expect(m.originalGlobalFaceIndices).toHaveLength(m.originalSourceTriangleCount);
   expect(m.originalOBJVertexIdTriples).toHaveLength(m.originalSourceTriangleCount);
   expect(m.vertices).toHaveLength(m.originalSourceTriangleCount*3);
   expect(unique(m).size).toBeGreaterThan(0);
   for(const face of m.originalGlobalFaceIndices){
    expect(globalFaces.has(face)).toBe(false);globalFaces.add(face);
   }
  }
  expect(globalFaces.size).toBe(488);
  verifyOriginalJLedger();
 });
 it('checks synthetic 3D edge piercing, true geometric distance and unwelded IDs',()=>{
  const t:[[number,number,number],[number,number,number],[number,number,number]]=
   [[0,0,0],[2,0,0],[0,2,0]];
  expect(triangleDistance(t,[[.5,.5,-1],[.5,.5,1],[1,1,1]])).toBeLessThan(1e-9);
  expect(triangleDistance(t,[[0,0,2],[2,0,2],[0,2,2]])).toBeCloseTo(2,10);
  expect(triangleDistance(t,[[3,0,0],[3,2,0],[4,0,0]])).toBeCloseTo(1,10);
 });
 it('measures all 8 M rim/bands vs same-side I/K/L/M without promotion',()=>{
  const rows=[] as ReturnType<typeof contact>[];
  const side=(m:Mesh)=>Math.sign(m.vertices.reduce((s,v)=>s+v[0],0)/m.vertices.length);
  for(const m of M)for(const c of all){
   if(m===c||side(m)!==side(c))continue;
   expect(Math.abs(side(m))).toBe(1);expect(Math.abs(side(c))).toBe(1);
   rows.push(contact(m,c));
  }
  expect(rows).toHaveLength(80); // per M: three I + two K + two L + three other M
  const phase12J=rows.filter(r=>!I.some(x=>x.originalMinFace===r.b));
  expect(phase12J).toHaveLength(56);
  expect(phase12J.every(r=>r.originalSharedOBJVertexIDCount===0&&
   r.originalSharedOBJEdgeCount===0)).toBe(true);
  expect(phase12J.filter(r=>r.closestTriangle3DMeters<1e-7).length).toBeGreaterThanOrEqual(28);
  expect(rows.every(r=>!r.physicalWeldOrWalkableSurfaceProven)).toBe(true);
  const result={
   version:'T21_PHASE12P_PINNED_ORIGINAL_OBJ_ID_EDGE_AND_TRIANGLE_DISTANCE_V1',
   originalSourceSHA256:PIN,priorPhase12JFullSourceComponents:44,
   totalAuditedOriginalReviewComponents:22,totalAuditedOriginalFaces:488,
   sourceOnly:true,reviewOnly:true,t21ActivationReady:false,
   physicalWeldProven:false,walkableFloorProven:false,collisionNavPaintAuthorized:false,
   originalUnrenderedComponentsHeld:28,
   evaluatedPairs:rows.length,
   phase12JNonSharedOBJIDPairs:phase12J.length,
   phase12JGeometricContactUnweldedPairs:phase12J.filter(r=>
    r.closestTriangle3DMeters<1e-7).length,
   rows};
  if(process.env.T21_PHASE12P_REPORT)
   writeFileSync(process.env.T21_PHASE12P_REPORT,JSON.stringify(result,null,2));
  console.log('T21_PHASE12P_ORIGINAL_CONTACT_AUDIT',JSON.stringify({
   pairs:result.evaluatedPairs,phase12JNonSharedOBJIDPairs:56,
   geometricUnweldedSourceContacts:result.phase12JGeometricContactUnweldedPairs,
   originalSharedIDsByMToI:rows.filter(r=>I.some(x=>x.originalMinFace===r.b))
    .map(r=>[r.a,r.b,r.originalSharedOBJVertexIDCount,r.closestTriangle3DMeters])
  }));
 });
});
