import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';

/**
 * Phase9 exact original DOWNWARD-ORIENTED triangle components from pinned
 * Temple01 OBJ (NOT verified walkable platforms, closed undersides, physics
 * volumes, or game collision/paint/actor placement).
 *
 * Binary64 vertex words and OBJ face triangle order are preserved bytewise in
 * deterministic gzip. DecompressionStream is used for browser review/CI.
 */
const PACKED_ORIGINAL_GZIP=[
  'H4sIAAAAAAAC/3XQf1DTdRzH8S8xvsDNX600nTB+bPHlxwaMfWWIrH1kubEzCTsiR17fwvBQAQU5yfhxwk0XEOSvKw5SUVTwR7ARJwXpvlTTLJqcZIIoKupADGugEcqoy5PP96/398/H53XPz/c+AuKPyryj+mWBiJJ7nfYRCpBfVkT3k/owtnGfG7U+XI69pPS9TYEvBrHnWv/9gFDKsF8p3TWcO8YDHeq02Qe2O/rDsd/byt9WqCJAhzq/V6Zf+EoR',
  'ye2lfwutN55aIYc6LYPu8dIYzvsvTLrecEyCe/WcDq/MBs599hSe/cY5ZYU6extCS6Mf0NijgvxfO6/lgx3oXgGRfLD7dp8tgJ05+TGl9ly1pxT11zavaBqPxE5l/mxg84IQZXv30O5OKfbMkOgjIztI0KGO/83Ytm3rw7EXCDsiHv3iBjrUeVlKdT1wRmAXfPx2VdOTaTXkUMcxYnk/z8X5vPmGnDh3F7jPXbCBas2UY5f8mbUw2ZMAO7bm3rpiM429',
  'q+vShOrKLLAD3UsSzOF7+qx5oYhW/P+9gkIqMzxipRrW94b3yc/mU9j5GT22dns862s/pedrxNhrmWI3dFQL7vu9u0/IEvyxF8Xe72S1WrBDEucty02umhB25mSPyb0kYIUG7RpNH/KrC8Kel5a9/MhQPNo54Gmq/TUQOy91URF1Vgvuy+k19oJjftgdtFHVyGjBDkmMC86EmSdl+F9vrrru5TyuYb9OvFZxeZp7u85g3cUcvYa1qAvDEqXcW6z2H+NN',
  'iHTgfktBXcUWuQS74ulaW36nFuyQRKpYsAEZZfhf9Qn5xl6rBgmZ6ItpZaHYw8SDrxvSNGhRUm/GwBnuLdqFlTsGlDpw31cx9RPxnRj7gccTiLmmBTskgTZV94b20Szx7OOhcedwgSVbhdrGvpRc2s75h4zoulOtQlVbeelLDcHYvxj6xCzcrQP3RaWzXSU1FPakg/W32j/SgR2S4K8b+XbwpSVo5iTA1WIcjFOxxpGHHqZWGvvejcN3A+eo2FfXNVIn',
  '7MHYw0dHaUW+DtwvyLVYnXO5vaPeK72H0YEdkjjdUfaQvznq+clf6u4Dq5te8I5BEk1VrHku50ykT+L3yhj0OZNirb4jwf6mgDGnPhKB+53ZzDu3Jdy+fG1ZhKHZD+yQxK0flLOT6Sh25sTVuLhNcVXJrlkZZ/jnNzn2T5c5UsY9YtjpzS1TwdkS7Dy1qUckE4H70eKO/TnNYuzqMstbvsMisPMf7J8SqPQHAAA='
].join('');
const METAL='Fld_Temple01_pCube21772_1__FloorMetal00|Fld_Temple01_FloorMetal00|';
const FENCE='Fld_Temple01_pPlane157_1__FloorFence00|Fld_Temple01_FloorFence00|';
const MEGALITH='Fld_Temple01_mesh04_low475_1__Megalith00|Fld_Temple01_Megalith00|';
const RECORDS=[
  [METAL,'d0','CENTER_UNDER_METAL',67.7410762742362,4.5255,18],
  [METAL,'d1','CENTER_UNDER_METAL',67.74107627423615,4.5255,18],
  [FENCE,'d5','FLANK_FENCE_UNDER',12.821300878745866,5.800000000000001,6],
  [FENCE,'d15','FLANK_FENCE_UNDER',12.821300878745834,5.800000000000001,6],
  [FENCE,'d25','FLANK_FENCE_UNDER',12.821300878745848,5.800000000000001,6],
  [FENCE,'d35','FLANK_FENCE_UNDER',12.821300878745824,5.800000000000001,6],
  [MEGALITH,'d1','FLANK_MEGALITH_UNDER',8.174654922690337,2.5,6],
  [MEGALITH,'d0','FLANK_MEGALITH_UNDER',8.174654922690275,2.5,6],
  [MEGALITH,'d4','INNER_MEGALITH_UNDER',7.529287428793718,1,6],
  [MEGALITH,'d5','INNER_MEGALITH_UNDER',7.529287428793718,1,6]
] as const;
export interface UndertowT21Phase9DownfaceMesh {
  readonly id:string;
  readonly pairId:number;
  readonly kind:'CENTER_UNDER_METAL'|'FLANK_FENCE_UNDER'|'FLANK_MEGALITH_UNDER'|'INNER_MEGALITH_UNDER';
  readonly sourceComponentId:string;
  readonly sourceMaterial:string;
  readonly vertices:readonly StageVector3[];
  readonly areaSquareMeters:number;
  readonly yRange:readonly [number,number];
  readonly side:'POSITIVE_Z'|'NEGATIVE_Z';
  readonly sourceOrientation:'ORIGINAL_OBJ_NORMAL_Y_LE_-0.65';
  readonly sourceMeaning:'NOT_VERIFIED_GAME_UNDERSIDE_OR_FLOOR';
  readonly gameCollisionPaintNavAndConnectivityAuthority:'NONE';
  readonly runtimePromotionAuthorized:false;
}
async function decode():Promise<readonly UndertowT21Phase9DownfaceMesh[]>{
  if(typeof DecompressionStream==='undefined')throw new Error('T21 Phase9 exact source review needs gzip DecompressionStream');
  const bytes=Uint8Array.from(atob(PACKED_ORIGINAL_GZIP),x=>x.charCodeAt(0));
  const copied=new ArrayBuffer(bytes.byteLength);new Uint8Array(copied).set(bytes);
  const raw=await new Response(new Blob([copied]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(raw.byteLength!==2036)throw new Error('T21 Phase9 pinned original source bytes changed');
  const view=new DataView(raw);
  let offset=0;
  const components=RECORDS.map(([prefix,suffix,kind,area,y,n],i)=>{
    const count=view.getUint16(offset,true);offset+=2;
    if(count!==n||count%3!==0)throw new Error('T21 Phase9 original source triangle count drift');
    const vertices:StageVector3[]=[];
    for(let j=0;j<count;j++){
      const x=view.getFloat64(offset,true),yy=view.getFloat64(offset+8,true),z=view.getFloat64(offset+16,true);
      offset+=24;
      if(!Number.isFinite(x)||!Number.isFinite(yy)||!Number.isFinite(z))
        throw new Error('T21 Phase9 nonfinite original coordinate');
      vertices.push([x,yy,z]);
    }
    return Object.freeze({
      id:'t21-source-downface-phase9-'+String(i+1).padStart(2,'0'),
      pairId:Math.floor(i/2)+1,
      kind,sourceComponentId:prefix+suffix,sourceMaterial:prefix.split('|')[1]!,
      vertices,areaSquareMeters:area,yRange:[y,y] as const,
      side:(vertices.reduce((sum,v)=>sum+v[2],0)>=0?'POSITIVE_Z':'NEGATIVE_Z') as 'POSITIVE_Z'|'NEGATIVE_Z',
      sourceOrientation:'ORIGINAL_OBJ_NORMAL_Y_LE_-0.65' as const,
      sourceMeaning:'NOT_VERIFIED_GAME_UNDERSIDE_OR_FLOOR' as const,
      gameCollisionPaintNavAndConnectivityAuthority:'NONE' as const,
      runtimePromotionAuthorized:false as const
    });
  });
  if(offset!==raw.byteLength)throw new Error('T21 Phase9 trailing original coordinate bytes');
  return Object.freeze(components);
}
export const UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES=await decode();
export const UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY=Object.freeze({
  sourceComponentCount:UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.length,
  sourceVertexCount:UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.reduce((a,m)=>a+m.vertices.length,0),
  original3DTriangleAreaSquareMeters:UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.reduce((a,m)=>a+m.areaSquareMeters,0),
  mirroredPairs:5,
  reviewOnly:true as const,
  runtimePromotionAuthorized:false as const
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean{
  const polygon=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[j]!,b=polygon[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
    if(Math.abs(cross)<=1e-8&&dot<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21Phase9DownfaceErrors():readonly string[]{
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES;
  if(meshes.length!==10||UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY.sourceVertexCount!==84)
    errors.push('T21 Phase9 exact downface count drift');
  const ids=new Set<string>();
  for(const mesh of meshes){
    if(ids.has(mesh.sourceComponentId))errors.push('T21 Phase9 repeated source ID');
    ids.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized||mesh.gameCollisionPaintNavAndConnectivityAuthority!=='NONE')
      errors.push('T21 Phase9 unauthorized game geometry');
    if(mesh.vertices.some(p=>p[1]!==mesh.yRange[0]))
      errors.push('T21 Phase9 original downface source Y changed '+mesh.id);
    for(let i=0;i<mesh.vertices.length;i+=3){
      const v=mesh.vertices.slice(i,i+3);
      const center:XZ=[v.reduce((a,p)=>a+p[0],0)/3,v.reduce((a,p)=>a+p[2],0)/3];
      if(!insideHard(center)||v.some(p=>!insideHard([p[0],p[2]]))){
        errors.push('T21 Phase9 sampled source outside frozen boundary '+mesh.id);break;
      }
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.pairId!==b.pairId||a.side===b.side||
       a.yRange[0]!==b.yRange[0]||Math.abs(a.areaSquareMeters-b.areaSquareMeters)>0.0002)
      errors.push('T21 Phase9 original downface mirror pairing disagreement');
    for(const p of a.vertices){
      const delta=Math.min(...b.vertices.map(q=>Math.hypot(
        p[0]+q[0]-0.229368288528164,p[1]-q[1],p[2]+q[2]-0.194564295456822)));
      if(delta>0.0002){errors.push('T21 Phase9 original downface XYZ mirror mismatch');break;}
    }
  }
  return errors;
}
