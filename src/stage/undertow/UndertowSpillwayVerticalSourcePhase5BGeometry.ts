import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/** Exact ORIGINAL Temple01 source triangles with near-vertical normals.
 * Review-only glass, metal and pillar source; NO collision, paint, nav,
 * connected 3D solid, actor instance or runtime promotion authority.
 * Original unrounded float64 source XYZ is packed little-endian by triangle.
 */
const FAMILIES=["Fld_Temple01_group20361_1__Glass01|Fld_Temple01_Glass01|","Fld_Temple01_group20357_1__WallMetal00|Fld_Temple01_WallMetal00|","Fld_Temple01_pCube21284_1__Glass02|Fld_Temple01_Glass02|","Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|"];
const RECORDS=[[0,"v41",47.2925531859728,3.0999999999999996,5.5,"POSITIVE_Z",6],[0,"v21",47.292553185972785,3.0999999999999996,5.5,"NEGATIVE_Z",6],[1,"v263",47.29255318597279,3.0999999999999996,5.5,"POSITIVE_Z",6],[1,"v264",47.29255318597278,3.0999999999999996,5.5,"NEGATIVE_Z",6],[2,"v1",39.41046098831066,0.5,2.5,"POSITIVE_Z",6],[2,"v0",39.410460988310646,0.5,2.5,"NEGATIVE_Z",6],[0,"v58",21.398132996669485,3,5.5,"NEGATIVE_Z",6],[0,"v59",21.398132996669485,3,5.5,"POSITIVE_Z",6],[1,"v276",21.269796266734186,3,5.5,"NEGATIVE_Z",6],[1,"v277",21.269796266734183,3,5.5,"POSITIVE_Z",6],[3,"v177",19.134815927219282,3.5,10.2,"NEGATIVE_Z",24],[3,"v176",19.134815927219254,3.5,10.2,"POSITIVE_Z",24]] as const;
const SOURCE_FLOAT64_LE_B64=["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"].join('');

export interface UndertowVerticalSourcePhase5BMesh {
  id:string;pairId:number;sourceComponentId:string;sourceMaterial:string;
  side:'POSITIVE_Z'|'NEGATIVE_Z';areaSquareMeters:number;
  yRange:readonly [number,number];vertices:readonly StageVector3[];
  visualKind:'GLASS'|'METAL_WALL'|'PILLAR';
  shapeAuthority:'ORIGINAL_TEMPLE01_VERTICAL_SOURCE_TRIANGLES_ONLY';
  sourceXYZAuthority:'EXACT_SOURCE_FLOAT64';sourceYAuthority:'EXACT_SOURCE_FLOAT64';
  connectivityAuthority:'UNRESOLVED';
  wallCollisionNavPaintScoringAuthority:'NONE';
  runtimePromotionAuthorized:false;
}
function unpack():readonly UndertowVerticalSourcePhase5BMesh[] {
  const bytes=Uint8Array.from(atob(SOURCE_FLOAT64_LE_B64),c=>c.charCodeAt(0));
  if(bytes.byteLength!==2616)throw new Error('Phase5B source binary length mismatch');
  const dv=new DataView(bytes.buffer);let offset=0;
  const meshes=RECORDS.map(([family,suffix,area,minY,maxY,side,count],i)=>{
    const n=dv.getUint16(offset,true);offset+=2;
    if(n!==count||n%3!==0||n<3)throw new Error('Phase5B source triangle count drift');
    const vertices:StageVector3[]=[];
    for(let j=0;j<n;j++){
      const x=dv.getFloat64(offset,true),y=dv.getFloat64(offset+8,true),z=dv.getFloat64(offset+16,true);
      if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))throw new Error('Phase5B source nonfinite XYZ');
      vertices.push([x,y,z]);offset+=24;
    }
    const sourceMaterial=FAMILIES[family]!.split('|')[1]!;
    return Object.freeze({
      id:'source-vertical-phase5b-'+String(i+1).padStart(2,'0'),
      pairId:Math.floor(i/2)+1,sourceComponentId:FAMILIES[family]!+suffix,
      sourceMaterial,side,areaSquareMeters:area,yRange:[minY,maxY] as const,vertices,
      visualKind:(sourceMaterial.includes('Glass')?'GLASS':sourceMaterial.includes('WallMetal')?'METAL_WALL':'PILLAR') as 'GLASS'|'METAL_WALL'|'PILLAR',
      shapeAuthority:'ORIGINAL_TEMPLE01_VERTICAL_SOURCE_TRIANGLES_ONLY' as const,
      sourceXYZAuthority:'EXACT_SOURCE_FLOAT64' as const,
      sourceYAuthority:'EXACT_SOURCE_FLOAT64' as const,
      connectivityAuthority:'UNRESOLVED' as const,
      wallCollisionNavPaintScoringAuthority:'NONE' as const,
      runtimePromotionAuthorized:false as const
    });
  });
  if(offset!==bytes.byteLength)throw new Error('Phase5B source trailing bytes');
  return Object.freeze(meshes);
}
export const UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES=unpack();
export const UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY=Object.freeze({
  reviewOnly:true as const,runtimePromotionAuthorized:false as const,
  meshCount:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.length,pairCount:6,
  glassCount:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.filter(m=>m.visualKind==='GLASS').length,
  metalCount:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.filter(m=>m.visualKind==='METAL_WALL').length,
  pillarCount:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.filter(m=>m.visualKind==='PILLAR').length,
  sourceTriangleAreaSquareMeters:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.reduce((n,m)=>n+m.areaSquareMeters,0)
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean{
  const ring=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[j]!,b=ring[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
    if(Math.abs(cross)<=1e-8&&dot<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21VerticalSourcePhase5BErrors():readonly string[]{
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES;
  const sum=UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY;
  if(meshes.length!==12||sum.pairCount!==6||sum.glassCount!==6||sum.metalCount!==4||
     sum.pillarCount!==2||sum.runtimePromotionAuthorized)errors.push('Phase5B inventory drift');
  const ids=new Set<string>();
  for(const mesh of meshes){
    if(ids.has(mesh.sourceComponentId))errors.push('Phase5B duplicate source ID '+mesh.id);
    ids.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized||mesh.wallCollisionNavPaintScoringAuthority!=='NONE'||
       mesh.connectivityAuthority!=='UNRESOLVED')errors.push('Phase5B unsafe authority '+mesh.id);
    const ys=mesh.vertices.map(p=>p[1]);
    if(Math.min(...ys)!==mesh.yRange[0]||Math.max(...ys)!==mesh.yRange[1])
      errors.push('Phase5B exact source Y changed '+mesh.id);
    if(mesh.side!==(mesh.vertices.reduce((n,p)=>n+p[2],0)>=0?'POSITIVE_Z':'NEGATIVE_Z'))
      errors.push('Phase5B source ownership '+mesh.id);
    for(let i=0;i<mesh.vertices.length;i+=3){
      const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
      const samples:XZ[]=[[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
        [(a[0]+b[0])/2,(a[2]+b[2])/2],[(a[0]+c[0])/2,(a[2]+c[2])/2],
        [(b[0]+c[0])/2,(b[2]+c[2])/2],
        [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
      if(samples.some(p=>!insideHard(p))){errors.push('Phase5B exterior sample '+mesh.id);break;}
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.side===b.side||a.pairId!==b.pairId||
       Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)
      errors.push('Phase5B pair area/side mismatch '+a.pairId);
    for(const p of a.vertices){
      if(Math.min(...b.vertices.map(q=>Math.hypot(
        p[0]+q[0]-0.229368288528164,p[1]-q[1],
        p[2]+q[2]-0.194564295456822)))>1e-6){
        errors.push('Phase5B source mirror XYZ drift '+a.pairId);break;
      }
    }
  }
  return errors;
}
