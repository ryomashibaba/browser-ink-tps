import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/**
 * Phase 6 selected vertical high-structure ORIGINAL source faces.
 *
 * Source audit lists seven verified symmetric high-structure pairs. Only the
 * two SealObject00 panels are promoted to the INITIAL renderable review
 * subset. This is intentionally NOT an imagined whole ceiling or high roof.
 * Unselected pairs remain in the exact OBJ evidence artifact, not runtime.
 */
const EXACT_FLOAT64_TRIANGLES=[
  'BgBOmjZNyM8xwAAAAAAAADlAaHRO27fCF0Bmm78vevcuwAAAAAAAADlAv7szW/5gJUBOmjZNyM8xwDMzMzMzs0ZAaHRO27fCF0Bmm78vevcuwAAAAAAAADlAv7szW/5gJUBmm78vevcuwDMzMzMzs0ZAv7szW/5gJUBOmjZNyM8xwDMzMzMzs0ZAaHRO27fCF0A=',
  'BgAakogugAoyQAAAAAAAADlAH6F2/nv7FsD/imPy6WwvQAAAAAAAADlAGtLHbGD9JMAakogugAoyQDMzMzMzs0ZAH6F2/nv7FsD/imPy6WwvQAAAAAAAADlAGtLHbGD9JMD/imPy6WwvQDMzMzMzs0ZAGtLHbGD9JMAakogugAoyQDMzMzMzs0ZAH6F2/nv7FsA='
] as const;
const RECORDS=[
  ['v3','POSITIVE_Z',107.90169371641682] as const,
  ['v2','NEGATIVE_Z',107.9016937164168] as const
];
export interface UndertowPhase6HighSourceMesh {
  id:string;
  pairId:1;
  sourceComponentId:string;
  sourceMaterial:'Fld_Temple01_SealObject00';
  side:'POSITIVE_Z'|'NEGATIVE_Z';
  vertices:readonly StageVector3[];
  yRange:readonly [25,45.4];
  areaSquareMeters:number;
  sourceXYZAuthority:'EXACT_PINNED_TEMPLE01_FLOAT64';
  sourceSemanticAuthority:'STATIC_SOURCE_FACE_ONLY_GAME_ROOF_UNVERIFIED';
  connectivityAuthority:'UNRESOLVED';
  runtimePromotionAuthorized:false;
}
function decode():readonly UndertowPhase6HighSourceMesh[]{
  return Object.freeze(RECORDS.map(([suffix,side,areaSquareMeters],i)=>{
    const data=Uint8Array.from(atob(EXACT_FLOAT64_TRIANGLES[i]!),c=>c.charCodeAt(0));
    if(data.byteLength!==146)throw Error('T21 Phase6 high source original byte count drift');
    const v=new DataView(data.buffer);
    const count=v.getUint16(0,true);
    if(count!==6)throw Error('T21 Phase6 high source vertex count drift');
    const vertices:StageVector3[]=[];
    for(let j=0;j<count;j++){
      const o=2+j*24;
      vertices.push([v.getFloat64(o,true),v.getFloat64(o+8,true),v.getFloat64(o+16,true)]);
    }
    return Object.freeze({
      id:'t21-source-high-structure-phase6-'+String(i+1),
      pairId:1 as const,
      sourceComponentId:'Fld_Temple01_mesh05_low96_1__SealObject00|Fld_Temple01_SealObject00|'+suffix,
      sourceMaterial:'Fld_Temple01_SealObject00' as const,
      side,vertices,areaSquareMeters,yRange:[25,45.4] as const,
      sourceXYZAuthority:'EXACT_PINNED_TEMPLE01_FLOAT64' as const,
      sourceSemanticAuthority:'STATIC_SOURCE_FACE_ONLY_GAME_ROOF_UNVERIFIED' as const,
      connectivityAuthority:'UNRESOLVED' as const,
      runtimePromotionAuthorized:false as const
    });
  }));
}
export const UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES=decode();
export const UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY=Object.freeze({
  registeredOriginalMeshes:UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.length,
  reviewedOriginalSourcePairs:1,
  originalSourceCandidatePairs:7,
  sourceTriangleAreaSquareMeters:UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.reduce((v,m)=>v+m.areaSquareMeters,0),
  reviewOnly:true as const,runtimePromotionAuthorized:false as const
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean{
  const pts=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const a=pts[j]!,b=pts[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
    if(Math.abs(cross)<=1e-8&&dot<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21HighSourcePhase6Errors():readonly string[]{
  const errors:string[]=[];
  const [a,b]=UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES;
  if(!a||!b||UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.length!==2)
    return ['T21 Phase6 source high pair count drift'];
  if(a.side===b.side||Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-7)
    errors.push('T21 Phase6 source pair area/side mismatch');
  for(const mesh of [a,b]){
    if(mesh.runtimePromotionAuthorized||mesh.connectivityAuthority!=='UNRESOLVED')
      errors.push('T21 Phase6 source runtime promotion '+mesh.id);
    const ys=mesh.vertices.map(p=>p[1]);
    if(Math.min(...ys)!==25||Math.max(...ys)!==45.4)
      errors.push('T21 Phase6 source high Y drift '+mesh.id);
    for(let i=0;i<mesh.vertices.length;i+=3){
      const v=mesh.vertices.slice(i,i+3);
      const center:XZ=[v.reduce((s,p)=>s+p[0],0)/3,v.reduce((s,p)=>s+p[2],0)/3];
      if(v.some(p=>!insideHard([p[0],p[2]]))||!insideHard(center)){
        errors.push('T21 Phase6 source original silhouette sample conflict '+mesh.id);break;
      }
    }
  }
  for(const p of a.vertices){
    const n=Math.min(...b.vertices.map(q=>Math.hypot(
      p[0]+q[0]-0.229368288528164,p[1]-q[1],p[2]+q[2]-0.194564295456822)));
    if(n>1e-6){errors.push('T21 Phase6 source true mirror mismatch');break;}
  }
  return errors;
}
