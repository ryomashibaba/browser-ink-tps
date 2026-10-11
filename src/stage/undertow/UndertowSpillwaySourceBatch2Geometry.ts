import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/**
 * Temple01 Pass18C exact source geometry, batch 2. Fourteen meshes are
 * independently selected as seven verified 180-degree counterpart pairs from
 * the Pass18G local candidate set, preserving EVERY source float64 coordinate.
 *
 * The packed little-endian float64 source payload is LOSSLESS, not a raster,
 * interpolation, rounding, approximation or 3D collider. CI independently
 * compares the DECODED triangle triples against the Pass18C JSON source.
 * FldObj/PntSet meshes are SOURCE CANDIDATES: active in-game actor placement
 * remains unproven; their presence does not prove physical route connectivity.
 */
const FAMILIES = ["Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|","Fld_Temple01_pCube21496_1__FloorGrass00|Fld_Temple01_FloorGrass00|","Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|","FldObj_Temple01_PntSet_pCube21531_1__FloorSlope00|FldObj_Temple01_PntSet_FloorSlope00|","FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01|FldObj_Temple01_PntSet_FloorSlope01|"];
const RECORDS = [[0,"c7",13.767839869794171,3,3,"POSITIVE_Z",24],[0,"c6",13.76783986979418,3,3,"NEGATIVE_Z",24],[1,"c3",15.020767078569932,-1.5,-1.5,"POSITIVE_Z",6],[1,"c1",15.020767078569943,-1.5,-1.5,"NEGATIVE_Z",6],[2,"c9",2.9035650627060043,0,0.7507000000000001,"POSITIVE_Z",3],[2,"c20",2.903565062706007,0,0.7507000000000001,"NEGATIVE_Z",3],[3,"c5",12.710283293618545,-3,-1.5,"NEGATIVE_Z",6],[3,"c2",12.710283293618541,-3,-1.5,"POSITIVE_Z",6],[3,"c6",12.710283293618525,-3,-1.5,"POSITIVE_Z",6],[3,"c1",12.710283293618538,-3,-1.5,"NEGATIVE_Z",6],[4,"c35",17.89784208438056,0.1200000000000001,2.88,"POSITIVE_Z",6],[4,"c118",17.897842084380517,0.1200000000000001,2.88,"NEGATIVE_Z",6],[4,"c33",3.977298240973455,0.16999999999999993,2.9299999999999997,"POSITIVE_Z",6],[4,"c144",3.9772982409734796,0.16999999999999993,2.9299999999999997,"NEGATIVE_Z",6]] as const;
const PACKED_COORDINATES_BASE64 = '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';

export type UndertowSourceBatch2Side = 'POSITIVE_Z' | 'NEGATIVE_Z';
export interface UndertowSourceBatch2Mesh {
  id: string;
  pairId: number;
  sourceComponentId: string;
  sourceMaterial: string;
  side: UndertowSourceBatch2Side;
  areaSquareMeters: number;
  yRange: readonly [number, number];
  vertices: readonly StageVector3[];
  placementAuthority: 'STATIC_MODEL_SOURCE' | 'SET_ACTOR_PLACEMENT_UNRESOLVED';
  shapeConfidence: 'EXACT_TEMPLE01_SOURCE';
  yConfidence: 'EXACT_TEMPLE01_SOURCE';
  connectivityConfidence: 'UNRESOLVED';
  authority: 'EXACT_SOURCE_MESH_REVIEW_ONLY';
  runtimePromotionAuthorized: false;
}
function unpack(): readonly UndertowSourceBatch2Mesh[] {
  const raw = Uint8Array.from(atob(PACKED_COORDINATES_BASE64), c => c.charCodeAt(0));
  const data = new DataView(raw.buffer);
  let offset = 0;
  return Object.freeze(RECORDS.map(([family, suffix, area, minY, maxY, side, vertexCount], i) => {
    if (offset + 2 > raw.byteLength) throw new Error('T21 batch2 truncated source header');
    const count = data.getUint16(offset, true); offset += 2;
    if (count !== vertexCount || count < 3 || count % 3 !== 0) throw new Error('T21 batch2 triangle count drift');
    const vertices: StageVector3[] = [];
    for(let j=0;j<count;j++){
      if(offset + 24 > raw.byteLength)throw new Error('T21 batch2 truncated source XYZ');
      vertices.push([data.getFloat64(offset,true),data.getFloat64(offset+8,true),data.getFloat64(offset+16,true)]);
      offset += 24;
    }
    if(i === RECORDS.length-1 && offset !== raw.byteLength)throw new Error('T21 batch2 trailing untrusted payload');
    const sourceComponentId = FAMILIES[family]! + suffix;
    return Object.freeze({
      id: 'source-terrain-batch2-'+String(Math.floor(i/2)+1).padStart(2,'0')+'-'+side.toLowerCase(),
      pairId: Math.floor(i/2)+1,
      sourceComponentId,
      sourceMaterial:FAMILIES[family]!.split('|')[1]!,
      side,areaSquareMeters:area,
      yRange:[minY,maxY] as const,
      vertices,
      placementAuthority:(family >= 3 ? 'SET_ACTOR_PLACEMENT_UNRESOLVED':'STATIC_MODEL_SOURCE') as
        'STATIC_MODEL_SOURCE' | 'SET_ACTOR_PLACEMENT_UNRESOLVED',
      shapeConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      yConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      connectivityConfidence:'UNRESOLVED' as const,
      authority:'EXACT_SOURCE_MESH_REVIEW_ONLY' as const,
      runtimePromotionAuthorized:false as const
    });
  }));
}
export const UNDERTOW_T21_SOURCE_BATCH2_MESHES = unpack();
export const UNDERTOW_T21_SOURCE_BATCH2_SUMMARY = Object.freeze({
  sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1' as const,
  reviewOnly:true as const,runtimePromotionAuthorized:false as const,
  meshCount:UNDERTOW_T21_SOURCE_BATCH2_MESHES.length,
  pairCount:7,
  sourceAreaSquareMeters:UNDERTOW_T21_SOURCE_BATCH2_MESHES.reduce((n,m)=>n+m.areaSquareMeters,0),
  setActorPlacementPendingCount:UNDERTOW_T21_SOURCE_BATCH2_MESHES.filter(m=>m.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED').length
});
type XZ = readonly [number,number];
function insideHard(p:XZ):boolean {
  const points=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[j]!,b=points[i]!;
    const cross=(p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]);
    const dot=(p[0]-a[0])*(p[0]-b[0])+(p[1]-a[1])*(p[1]-b[1]);
    if(Math.abs(cross)<=1e-8&&dot<=1e-8)return true;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21SourceBatch2Errors():readonly string[] {
  const errors:string[]=[];
  if(UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.meshCount!==14 ||
     UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.pairCount!==7 ||
     UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.runtimePromotionAuthorized ||
     UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.setActorPlacementPendingCount!==8)
    errors.push('T21 batch2 inventory/authority drift');
  const ids=new Set<string>();
  for(const mesh of UNDERTOW_T21_SOURCE_BATCH2_MESHES) {
    if(ids.has(mesh.sourceComponentId))errors.push('reused source ID '+mesh.sourceComponentId);
    ids.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized || mesh.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY')
      errors.push('unsafe source authority '+mesh.id);
    const minY=Math.min(...mesh.vertices.map(p=>p[1])),maxY=Math.max(...mesh.vertices.map(p=>p[1]));
    if(Math.abs(minY-mesh.yRange[0])>1e-12||Math.abs(maxY-mesh.yRange[1])>1e-12)
      errors.push('source Y changed '+mesh.id);
    for(let i=0;i+2<mesh.vertices.length;i+=3){
      const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
      const samples:XZ[]=[[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
        [(a[0]+b[0])/2,(a[2]+b[2])/2],[(b[0]+c[0])/2,(b[2]+c[2])/2],
        [(c[0]+a[0])/2,(c[2]+a[2])/2],[(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
      if(samples.some(p=>!insideHard(p))){errors.push('source exceeds 42-vertex boundary '+mesh.id);break;}
    }
  }
  for(let i=0;i<UNDERTOW_T21_SOURCE_BATCH2_MESHES.length;i+=2){
    const a=UNDERTOW_T21_SOURCE_BATCH2_MESHES[i]!,b=UNDERTOW_T21_SOURCE_BATCH2_MESHES[i+1]!;
    if(a.pairId!==b.pairId||a.side===b.side||Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)
      errors.push('pair id/side/area mismatch '+a.pairId);
    for(const v of a.vertices){
      const nearest=Math.min(...b.vertices.map(w=>Math.hypot(w[0]+v[0]-0.229368288528164,
        w[2]+v[2]-0.194564295456822,w[1]-v[1])));
      if(nearest>1e-6){errors.push('mirror drift '+a.pairId);break;}
    }
  }
  return errors;
}
