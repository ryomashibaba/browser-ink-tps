import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/**
 * Four large counterpart pairs (8 ORIGINAL static Temple01 floor meshes).
 * The binary source is lossless: original float64 source coordinates are stored
 * once in a dictionary and indexed for each original triangle vertex triple.
 * No inferred surfaces, interpolation, source-Y rounding or hard-edge clipping.
 *
 * All meshes remain VISUAL-REVIEW-ONLY. Original game collision/navigation/
 * paint/scoring, activeness and gameplay connectivity are NOT established.
 * Source-gated by Pass18C WHOLE-STAGE scan, 7-point/triangle outer check,
 * exact mirrored XYZ, area and source-component identity. CI checks all
 * 252 original triple vertices against an independent OBJ export.
 */
const FAMILIES=["Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|","Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|"];
const ROWS=[[0,"c12",214.86558121051675,1.5,1.5,72],[0,"c1",214.8655812105167,1.5,1.5,72],[1,"c8",127.50310454417198,7.5,7.5,24],[1,"c3",127.50310454417183,7.5,7.5,24],[1,"c11",59.696493185435834,9,9,24],[1,"c0",59.69649318543566,9,9,24],[1,"c9",59.427590062978815,3,3,6],[1,"c2",59.427590062978744,3,3,6]] as const;
const PACKED_FLOAT64_DICTIONARY_B64=[
  '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'
].join('');

export interface UndertowBroadStaticSourceMesh {
  id: string; pairId: number;
  sourceComponentId: string;
  sourceMaterial: string;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  areaSquareMeters: number;
  yRange: readonly [number,number];
  vertices: readonly StageVector3[];
  sourceAuditVersion: 'PASS18C_SOURCE_NATIVE_V1';
  placementAuthority: 'STATIC_SOURCE_IDENTITY_ONLY';
  shapeConfidence: 'EXACT_TEMPLE01_SOURCE';
  yConfidence: 'EXACT_TEMPLE01_SOURCE';
  connectivityConfidence: 'UNRESOLVED';
  authority: 'EXACT_SOURCE_MESH_REVIEW_ONLY';
  runtimePromotionAuthorized: false;
}
function decode():readonly UndertowBroadStaticSourceMesh[] {
  const binary=atob(PACKED_FLOAT64_DICTIONARY_B64);
  const bytes=Uint8Array.from(binary, c=>c.charCodeAt(0));
  if(bytes.length!==2214)throw new Error('T21 broad terrain compact source payload size drift');
  const view=new DataView(bytes.buffer);
  let at=0;
  const dictCount=view.getUint16(at,true);at+=2;
  if(dictCount!==180)throw new Error('T21 broad terrain float64 dictionary drift');
  const dict:number[]=[];
  for(let i=0;i<dictCount;i++){dict.push(view.getFloat64(at,true));at+=8;}
  const rows=ROWS.map(([family,suffix,area,minY,maxY,expectedCount],i)=>{
    const count=view.getUint16(at,true);at+=2;
    if(count!==expectedCount||count<3||count%3)throw new Error('T21 broad source triangle count drift');
    const vertices:StageVector3[]=[];
    for(let j=0;j<count;j++){
      const x=dict[bytes[at++]!]!,y=dict[bytes[at++]!]!,z=dict[bytes[at++]!]!;
      if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))throw new Error('T21 broad source nonfinite float');
      vertices.push([x,y,z]);
    }
    const sourceComponentId=FAMILIES[family]!+suffix;
    const side=vertices.reduce((sum,p)=>sum+p[2],0)>=0?'POSITIVE_Z' as const:'NEGATIVE_Z' as const;
    return Object.freeze({
      id:'source-broad-static-'+String(Math.floor(i/2)+1).padStart(2,'0')+'-'+side.toLowerCase(),
      pairId:Math.floor(i/2)+1,
      sourceComponentId,sourceMaterial:FAMILIES[family]!.split('|')[1]!,
      side,areaSquareMeters:area,yRange:[minY,maxY] as const,vertices,
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1' as const,
      placementAuthority:'STATIC_SOURCE_IDENTITY_ONLY' as const,
      shapeConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      yConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      connectivityConfidence:'UNRESOLVED' as const,
      authority:'EXACT_SOURCE_MESH_REVIEW_ONLY' as const,
      runtimePromotionAuthorized:false as const
    });
  });
  if(at!==bytes.length)throw new Error('T21 broad terrain unexpected bytes after decode');
  return Object.freeze(rows);
}
export const UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES=decode();
export const UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY=Object.freeze({
  meshCount:UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES.length,
  pairCount:4,reviewOnly:true as const,runtimePromotionAuthorized:false as const,
  totalSourceAreaSquareMeters:UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES.reduce((sum,m)=>sum+m.areaSquareMeters,0)
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean{
  const ring=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[j]!,b=ring[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
    if(Math.abs(cross)<=1e-8&&dot<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21BroadStaticSourceErrors():readonly string[]{
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES;
  if(meshes.length!==8||UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.pairCount!==4||
    UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.runtimePromotionAuthorized)
    errors.push('broad source inventory authority drift');
  const ids=new Set<string>();
  for(const mesh of meshes){
    if(ids.has(mesh.sourceComponentId))errors.push('broad source duplicate ID '+mesh.sourceComponentId);
    ids.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized||mesh.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY')
      errors.push('broad source runtime promotion '+mesh.id);
    const ys=mesh.vertices.map(p=>p[1]);
    if(Math.min(...ys)!==mesh.yRange[0]||Math.max(...ys)!==mesh.yRange[1])
      errors.push('broad source changed Y '+mesh.id);
    for(let i=0;i+2<mesh.vertices.length;i+=3){
      const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
      const samples:XZ[]=[[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
        [(a[0]+b[0])/2,(a[2]+b[2])/2],[(b[0]+c[0])/2,(b[2]+c[2])/2],
        [(c[0]+a[0])/2,(c[2]+a[2])/2],[(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
      if(samples.some(p=>!insideHard(p))){errors.push('broad source escapes silhouette '+mesh.id);break;}
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.side===b.side||a.pairId!==b.pairId||Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)
      errors.push('broad source mirror pair mismatch '+a.pairId);
    for(const v of a.vertices){
      const nearest=Math.min(...b.vertices.map(w=>Math.hypot(w[0]+v[0]-0.229368288528164,
        w[1]-v[1],w[2]+v[2]-0.194564295456822)));
      if(nearest>1e-6){errors.push('broad source mirror vertex mismatch '+a.pairId);break;}
    }
  }
  return errors;
}
