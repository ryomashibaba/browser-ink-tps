import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/**
 * Phase 4: TEN exact source triangle meshes in FIVE mirrored pairs from
 * Temple01's original Fld_Temple01 (static source) objects. Areas and heights
 * come from WHOLE-STAGE source audit, not source recreation or interpolation.
 *
 * The dictionary is a LOSSLESS float64 triple encoding. The unpacked
 * coordinates/triangle order are independently compared byte-exactly to the
 * pinned source OBJ in the PR CI. This geometry has NO runtime collision, kill,
 * scoring, painting, nav links or activation authority.
 */
const FAMILY_PREFIXES=["Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|","Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|"];
const COMPONENTS=[[0,"c0",302.02660908116064,4.5,4.5,105,"NEGATIVE_Z"],[0,"c8",302.0266090811607,4.5,4.5,105,"POSITIVE_Z"],[0,"c1",35.98999390963392,6,6,24,"NEGATIVE_Z"],[0,"c11",35.989993909633824,6,6,24,"POSITIVE_Z"],[0,"c2",13.72710595710804,6,7.5,6,"NEGATIVE_Z"],[0,"c10",13.727105957108062,6,7.5,6,"POSITIVE_Z"],[1,"c0",12.710283293618557,7.5,9,6,"NEGATIVE_Z"],[1,"c29",12.710283293618545,7.5,9,6,"POSITIVE_Z"],[1,"c1",12.710283293618502,7.5,9,6,"NEGATIVE_Z"],[1,"c28",12.710283293618545,7.5,9,6,"POSITIVE_Z"]] as const;
const PACKED_B64=[
  '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'
].join('');

export interface UndertowFlankElevationPhase4Mesh {
  id:string;pairId:number;sourceComponentId:string;sourceMaterial:string;
  side:'POSITIVE_Z'|'NEGATIVE_Z';areaSquareMeters:number;
  yRange:readonly [number,number];vertices:readonly StageVector3[];
  sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1';
  placementAuthority:'STATIC_SOURCE_IDENTITY_ONLY';
  shapeConfidence:'EXACT_TEMPLE01_SOURCE';
  yConfidence:'EXACT_TEMPLE01_SOURCE';
  connectivityConfidence:'UNRESOLVED';
  authority:'EXACT_SOURCE_MESH_REVIEW_ONLY';
  runtimePromotionAuthorized:false;
}
function unpack():readonly UndertowFlankElevationPhase4Mesh[] {
  const data=Uint8Array.from(atob(PACKED_B64), c=>c.charCodeAt(0));
  if(data.byteLength!==2632)throw new Error('T21 flank source byte size drift');
  const view=new DataView(data.buffer);
  const dictionaryLength=view.getUint16(0,true);
  if(dictionaryLength!==216)throw new Error('T21 flank dictionary size drift');
  const dictionary:number[]=[];
  let offset=2;
  for(let i=0;i<dictionaryLength;i++){dictionary.push(view.getFloat64(offset,true));offset+=8;}
  const meshes=COMPONENTS.map(([family,suffix,area,minY,maxY,expectedCount,side],index)=>{
    const count=view.getUint16(offset,true);offset+=2;
    if(count!==expectedCount||count%3!==0||count<3)throw new Error('T21 flank source triangle count drift');
    const vertices:StageVector3[]=[];
    for(let j=0;j<count;j++){
      const ix=data[offset++]!,iy=data[offset++]!,iz=data[offset++]!;
      const x=dictionary[ix]!,y=dictionary[iy]!,z=dictionary[iz]!;
      if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))
        throw new Error('T21 flank source invalid coordinate index');
      vertices.push([x,y,z]);
    }
    return Object.freeze({
      id:'source-flank-phase4-'+String(index+1).padStart(2,'0'),
      pairId:Math.floor(index/2)+1,
      sourceComponentId:FAMILY_PREFIXES[family]!+suffix,
      sourceMaterial:FAMILY_PREFIXES[family]!.split('|')[1]!,
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
  if(offset!==data.byteLength)throw new Error('T21 flank source unexpected trailing bytes');
  return Object.freeze(meshes);
}
export const UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES=unpack();
export const UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY=Object.freeze({
  reviewOnly:true as const,runtimePromotionAuthorized:false as const,
  sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1' as const,
  meshCount:UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES.length,
  pairCount:5,
  sourceTriangleAreaSquareMeters:UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES.reduce((sum,m)=>sum+m.areaSquareMeters,0)
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean {
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
export function undertowT21FlankElevationPhase4Errors():readonly string[] {
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES;
  if(meshes.length!==10||UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.pairCount!==5||
     UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.runtimePromotionAuthorized)
    errors.push('T21 phase4 inventory/authority mismatch');
  const ids=new Set<string>();
  for(const mesh of meshes){
    if(ids.has(mesh.sourceComponentId))errors.push('phase4 duplicate source ID '+mesh.sourceComponentId);
    ids.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized||mesh.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY')
      errors.push('phase4 unsafe runtime flag '+mesh.id);
    const y=mesh.vertices.map(v=>v[1]);
    if(Math.min(...y)!==mesh.yRange[0]||Math.max(...y)!==mesh.yRange[1])
      errors.push('phase4 source Y changed '+mesh.id);
    const meanZ=mesh.vertices.reduce((sum,v)=>sum+v[2],0)/mesh.vertices.length;
    if(mesh.side!==(meanZ>=0?'POSITIVE_Z':'NEGATIVE_Z'))
      errors.push('phase4 source side drift '+mesh.id);
    for(let i=0;i<mesh.vertices.length;i+=3){
      const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
      const samples:XZ[]=[[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
       [(a[0]+b[0])/2,(a[2]+b[2])/2],[(a[0]+c[0])/2,(a[2]+c[2])/2],
       [(b[0]+c[0])/2,(b[2]+c[2])/2],
       [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
      if(samples.some(s=>!insideHard(s))){errors.push('phase4 exterior source sample '+mesh.id);break;}
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.side===b.side||a.pairId!==b.pairId||Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)
      errors.push('phase4 mirrored pair mismatch '+a.pairId);
    for(const v of a.vertices){
      if(Math.min(...b.vertices.map(w=>Math.hypot(
        v[0]+w[0]-0.229368288528164,v[1]-w[1],
        v[2]+w[2]-0.194564295456822)))>1e-6){
        errors.push('phase4 mirrored source vertex mismatch '+a.pairId);break;
      }
    }
  }
  return errors;
}
