import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';
import { T21_PHASE7_FRAMED_ORIGINAL_GZIP_B64 } from './UndertowSpillwayPhase7OriginalPacked';

/**
 * T21 Phase7 — exactly original Temple01 near-vertical source TRIANGLES.
 *
 * 6 pairs of split-height side support shells + 4 pairs of mid-stage glass
 * frames. All 20 meshes are static ORIGINAL OBJ source components, never
 * authored closed physical solids or a claim of actual in-game collision.
 *
 * The packed payload is gzip of 144 original IEEE754 binary64 scalars (1152
 * bytes) and 20 original triangle component lengths/8-bit coordinate indices
 * (3836 bytes). Coordinate scalars and triangle winding are lossless, even for
 * the ~0.1mm source-model asymmetry in three support mirrored pairs.
 *
 * DecompressionStream is natively available on current desktop browsers and
 * Node 24 CI. Top-level await completes before the review imports meshes.
 */
const SUPPORT_PREFIX="Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|";
const GLASS_PREFIX="Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|";
const RECORDS=[["v339",36.73971553795276,-1,1.4000000000000004],["v1597",36.739628454315174,-1,1.4000000000000004],["v337",30.616429614960634,1.4000000000000004,3.4000000000000004],["v1594",30.61635704526264,1.4000000000000004,3.4000000000000004],["v335",36.73971553795276,3.4000000000000004,5.800000000000001],["v1586",36.739628454315174,3.4000000000000004,5.800000000000001],["v353",36.73962845431516,-1,1.4000000000000004],["v1596",36.73962845431517,-1,1.4000000000000004],["v352",30.61635704526263,1.4000000000000004,3.4000000000000004],["v1588",30.616357045262635,1.4000000000000004,3.4000000000000004],["v348",36.73962845431516,3.4000000000000004,5.800000000000001],["v1585",36.73962845431517,3.4000000000000004,5.800000000000001],["v258",12.574519007453805,3.5,6.199999999999999],["v83",12.574519007453793,3.5,6.199999999999999],["v259",12.108796081251814,6.6,9.2],["v85",12.108796081251802,6.6,9.2],["v257",12.108796081251814,9.6,12.2],["v84",12.108796081251802,9.6,12.2],["v260",12.574519007453812,12.6,15.3],["v86",12.574519007453802,12.6,15.3]] as const;

export interface UndertowPhase7FramedSourceMesh {
  id:string;
  pairId:number;
  sourceComponentId:string;
  sourceMaterial:'Fld_Temple01_PillarBase02'|'Fld_Temple01_Glass00';
  kind:'SIDE_SUPPORT'|'MID_GLASS_FRAME';
  side:'POSITIVE_Z'|'NEGATIVE_Z';
  areaSquareMeters:number;
  yRange:readonly [number,number];
  vertices:readonly StageVector3[];
  sourceXYZAuthority:'EXACT_PINNED_TEMPLE01_FLOAT64';
  sourceSemanticAuthority:'NEAR_VERTICAL_ORIGINAL_TRIANGLES_NOT_SOLID';
  gameplayCollisionPaintNavAuthority:'NONE';
  runtimePromotionAuthorized:false;
}
async function decodeSource():Promise<readonly UndertowPhase7FramedSourceMesh[]>{
  if(typeof DecompressionStream==='undefined')
    throw new Error('T21 Phase7 review needs browser gzip DecompressionStream');
  const zipBytes=Uint8Array.from(atob(T21_PHASE7_FRAMED_ORIGINAL_GZIP_B64),ch=>ch.charCodeAt(0));
  const copied=new ArrayBuffer(zipBytes.byteLength);
  new Uint8Array(copied).set(zipBytes);
  const raw=await new Response(
    new Blob([copied]).stream().pipeThrough(new DecompressionStream('gzip'))
  ).arrayBuffer();
  if(raw.byteLength!==4988)throw new Error('T21 Phase7 original XYZ packed length drift');
  const data=new DataView(raw);
  const dictionary:number[]=[];
  for(let i=0;i<144;i++){
    const value=data.getFloat64(i*8,true);
    if(!Number.isFinite(value))throw new Error('T21 Phase7 original source Float64 nonfinite');
    dictionary.push(value);
  }
  let offset=1152;
  const meshes=RECORDS.map(([suffix,area,minY,maxY],i)=>{
    const count=data.getUint8(offset++);
    const expected=i<12?66:60;
    if(count!==expected||count%3)throw new Error('T21 Phase7 triangle source count drift');
    const vertices:StageVector3[]=[];
    for(let k=0;k<count;k++){
      const x=dictionary[data.getUint8(offset++)];
      const y=dictionary[data.getUint8(offset++)];
      const z=dictionary[data.getUint8(offset++)];
      if(x===undefined||y===undefined||z===undefined)
        throw new Error('T21 Phase7 original source dictionary index overflow');
      vertices.push([x,y,z]);
    }
    const sourceMaterial=i<12?'Fld_Temple01_PillarBase02':'Fld_Temple01_Glass00';
    return Object.freeze({
      id:'t21-source-framed-phase7-'+String(i+1).padStart(2,'0'),
      pairId:Math.floor(i/2)+1,
      sourceComponentId:(i<12?SUPPORT_PREFIX:GLASS_PREFIX)+suffix,
      sourceMaterial,kind:i<12?'SIDE_SUPPORT' as const:'MID_GLASS_FRAME' as const,
      side:(vertices.reduce((sum,p)=>sum+p[2],0)>=0?'POSITIVE_Z':'NEGATIVE_Z') as 'POSITIVE_Z'|'NEGATIVE_Z',
      areaSquareMeters:area,yRange:[minY,maxY] as const,vertices,
      sourceXYZAuthority:'EXACT_PINNED_TEMPLE01_FLOAT64' as const,
      sourceSemanticAuthority:'NEAR_VERTICAL_ORIGINAL_TRIANGLES_NOT_SOLID' as const,
      gameplayCollisionPaintNavAuthority:'NONE' as const,
      runtimePromotionAuthorized:false as const
    });
  });
  if(offset!==raw.byteLength)throw new Error('T21 Phase7 packed triangle trailing bytes');
  return Object.freeze(meshes);
}
export const UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES=await decodeSource();
export const UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY=Object.freeze({
  sourceMeshCount:UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.length,
  sideSupportMeshes:UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.filter(x=>x.kind==='SIDE_SUPPORT').length,
  midGlassFrameMeshes:UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.filter(x=>x.kind==='MID_GLASS_FRAME').length,
  mirrorPairCount:10,
  sourceVertexCount:UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.reduce((n,x)=>n+x.vertices.length,0),
  sourceTriangleAreaSquareMeters:UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.reduce((n,x)=>n+x.areaSquareMeters,0),
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
export function undertowT21Phase7FramedSourceErrors():readonly string[]{
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES;
  if(meshes.length!==20||UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.sourceVertexCount!==1272||
     UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.mirrorPairCount!==10)
    errors.push('Phase7 original source registry count drift');
  const ids=new Set<string>();
  for(const m of meshes){
    if(ids.has(m.sourceComponentId))errors.push('Phase7 duplicate source identity '+m.id);
    ids.add(m.sourceComponentId);
    if(m.runtimePromotionAuthorized||m.gameplayCollisionPaintNavAuthority!=='NONE')
      errors.push('Phase7 unsafe source gameplay authority '+m.id);
    const ys=m.vertices.map(p=>p[1]);
    if(Math.min(...ys)!==m.yRange[0]||Math.max(...ys)!==m.yRange[1])
      errors.push('Phase7 original Y layer drift '+m.id);
    for(let i=0;i<m.vertices.length;i+=3){
      const t=m.vertices.slice(i,i+3);
      const samples:XZ[]=t.map(v=>[v[0],v[2]]);
      samples.push([(t[0]![0]+t[1]![0]+t[2]![0])/3,(t[0]![2]+t[1]![2]+t[2]![2])/3]);
      if(samples.some(q=>!insideHard(q))){errors.push('Phase7 sampled exterior source conflict '+m.id);break;}
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.pairId!==b.pairId||a.side===b.side||
       a.yRange[0]!==b.yRange[0]||a.yRange[1]!==b.yRange[1]||
       Math.abs(a.areaSquareMeters-b.areaSquareMeters)>0.001)
      errors.push('Phase7 original source pair identity/height/area conflict '+a.pairId);
    let max=0;
    for(const p of a.vertices){
      max=Math.max(max,Math.min(...b.vertices.map(q=>Math.hypot(
        p[0]+q[0]-0.229368288528164,p[1]-q[1],
        p[2]+q[2]-0.194564295456822))));
    }
    if(max>0.0002)errors.push('Phase7 original source pair XYZ deviates beyond 0.2mm '+a.pairId);
  }
  return errors;
}
