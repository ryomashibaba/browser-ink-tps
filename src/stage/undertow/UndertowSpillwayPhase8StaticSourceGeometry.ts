import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';
import { T21_PHASE8_ORIGINAL_STATIC_SOURCE_GZIP_B64 } from './UndertowSpillwayPhase8OriginalPacked';

/**
 * T21 Phase8: preserve all original Temple01 triangle faces, their winding,
 * Float64 XYZ, Y ranges, and identities without asserting that the geometry
 * represents in-game closed support solids, floors, colliders or routes.
 *
 * First 8 = four mirror pairs of central high/mid towers; next 4 = two
 * pairs of flank upper supports; final 4 = two pairs of source-facing
 * floor-edge liners. These last pieces are NOT additional floor area.
 */
const TOWER_PREFIX="Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|";
const FLANK_PREFIX="Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|";
const EDGE_PREFIX="Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|";
const RECORDS=[["v338",125.29143241284822,9.4,21.4],["v100",125.29143241284821,9.4,21.4],["v129",125.29143241284821,9.4,21.4],["v337",125.2914324128482,9.4,21.4],["v264",125.29143241284824,3.4000000000000004,15.399999999999999],["v184",125.29143241284824,3.4000000000000004,15.399999999999999],["v255",125.29143241284817,3.4000000000000004,15.399999999999999],["v177",125.29143241284821,3.4000000000000004,15.399999999999999],["v172",24.32040289936535,3.5,11.5],["v174",24.320402899365344,3.5,11.5],["v175",24.320402899365323,3.5,11.5],["v173",24.320402899365316,3.5,11.5],["v30",28.002169649589153,5,7],["v1061",28.002169649589153,5,7],["v197",17.600465819698332,0.5,2.5],["v590",17.600465819698332,0.5,2.5]] as const;

export type UndertowPhase8StructuralKind=
  'CENTRAL_TOWER'|'FLANK_HIGH_SUPPORT'|'SIDE_EDGE_LINER';
export interface UndertowPhase8OriginalStructure {
  readonly id:string;
  readonly pairId:number;
  readonly sourceComponentId:string;
  readonly sourceMaterial:'Fld_Temple01_Pillar00'|'Fld_Temple01_PillarBase04'|'Fld_Temple01_FloorLine02';
  readonly kind:UndertowPhase8StructuralKind;
  readonly side:'POSITIVE_Z'|'NEGATIVE_Z';
  readonly areaSquareMeters:number;
  readonly yRange:readonly [number,number];
  readonly vertices:readonly StageVector3[];
  readonly sourceXYZAuthority:'BYTE_EXACT_PINNED_TEMPLE01_FLOAT64';
  readonly visibleReviewOnly:true;
  readonly actorPlacement:'STATIC_SOURCE_NOT_ACTIVE_GAME_PROOF';
  readonly floorCollisionPaintNavScoringAuthority:'NONE';
  readonly runtimePromotionAuthorized:false;
}
async function loadOriginalSource():Promise<readonly UndertowPhase8OriginalStructure[]>{
  if(typeof DecompressionStream==='undefined')
    throw new Error('T21 Phase8 static source review requires standard browser gzip decoding');
  const zipped=Uint8Array.from(atob(T21_PHASE8_ORIGINAL_STATIC_SOURCE_GZIP_B64),char=>char.charCodeAt(0));
  const source=new ArrayBuffer(zipped.byteLength);
  new Uint8Array(source).set(zipped);
  const bytes=await new Response(
    new Blob([source]).stream().pipeThrough(new DecompressionStream('gzip'))
  ).arrayBuffer();
  if(bytes.byteLength!==5680)
    throw new Error('T21 Phase8 source-gzip length must match independently pinned original');
  const data=new DataView(bytes);
  const dict:number[]=[];
  for(let i=0;i<229;i++){
    const n=data.getFloat64(i*8,true);
    if(!Number.isFinite(n))throw new Error('T21 Phase8 original source contains nonfinite coordinates');
    dict.push(n);
  }
  let at=229*8;
  const meshes=RECORDS.map(([suffix,area,minY,maxY],i)=>{
    const n=data.getUint16(at,true);at+=2;
    const expected=i<8?66:i<12?21:6;
    if(n!==expected||n%3!==0)throw new Error('T21 Phase8 original triangle count drift '+i);
    const vertices:StageVector3[]=[];
    for(let k=0;k<n;k++){
      const x=dict[data.getUint16(at,true)];at+=2;
      const y=dict[data.getUint16(at,true)];at+=2;
      const z=dict[data.getUint16(at,true)];at+=2;
      if(x===undefined||y===undefined||z===undefined)
        throw new Error('T21 Phase8 original dictionary index invalid '+i);
      vertices.push([x,y,z]);
    }
    const kind:UndertowPhase8StructuralKind=i<8?'CENTRAL_TOWER'
      :i<12?'FLANK_HIGH_SUPPORT':'SIDE_EDGE_LINER';
    const prefix=i<8?TOWER_PREFIX:i<12?FLANK_PREFIX:EDGE_PREFIX;
    const mat=i<8?'Fld_Temple01_Pillar00' as const
      :i<12?'Fld_Temple01_PillarBase04' as const
      :'Fld_Temple01_FloorLine02' as const;
    return Object.freeze({
      id:'t21-phase8-original-static-'+String(i+1).padStart(2,'0'),
      pairId:Math.floor(i/2)+1,
      sourceComponentId:prefix+suffix,
      sourceMaterial:mat,kind,
      side:(vertices.reduce((sum,v)=>sum+v[2],0)>=0?'POSITIVE_Z':'NEGATIVE_Z') as 'POSITIVE_Z'|'NEGATIVE_Z',
      areaSquareMeters:area,
      yRange:[minY,maxY] as const,
      vertices,
      sourceXYZAuthority:'BYTE_EXACT_PINNED_TEMPLE01_FLOAT64' as const,
      visibleReviewOnly:true as const,
      actorPlacement:'STATIC_SOURCE_NOT_ACTIVE_GAME_PROOF' as const,
      floorCollisionPaintNavScoringAuthority:'NONE' as const,
      runtimePromotionAuthorized:false as const
    });
  });
  if(at!==bytes.byteLength)throw new Error('T21 Phase8 packed source unexpected trailer');
  return Object.freeze(meshes);
}
export const UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES=await loadOriginalSource();
export const UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY=Object.freeze({
  originalComponentCount:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.length,
  centralTowerCount:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.filter(x=>x.kind==='CENTRAL_TOWER').length,
  flankSupportCount:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.filter(x=>x.kind==='FLANK_HIGH_SUPPORT').length,
  edgeLinerCount:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.filter(x=>x.kind==='SIDE_EDGE_LINER').length,
  originalVertexCount:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.reduce((sum,m)=>sum+m.vertices.length,0),
  originalSource3DAreaSquareMeters:UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.reduce((sum,m)=>sum+m.areaSquareMeters,0),
  mirrorPairCount:8,
  reviewOnly:true as const,
  runtimePromotionAuthorized:false as const
});
type XZ=readonly [number,number];
function insideHard([x,z]:XZ):boolean{
  const poly=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[j]!,b=poly[i]!;
    const cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0]);
    const dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1]);
    if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21Phase8OriginalSourceErrors():readonly string[]{
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES;
  const s=UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY;
  if(meshes.length!==16||s.originalVertexCount!==636||
     s.centralTowerCount!==8||s.flankSupportCount!==4||s.edgeLinerCount!==4||
     s.mirrorPairCount!==8||s.runtimePromotionAuthorized)
    errors.push('Phase8 source inventory count drift');
  const ids=new Set<string>();
  for(const m of meshes){
    if(ids.has(m.sourceComponentId))errors.push('Phase8 source ID reused');
    ids.add(m.sourceComponentId);
    if(m.floorCollisionPaintNavScoringAuthority!=='NONE'||m.runtimePromotionAuthorized)
      errors.push('Phase8 source promoted to game '+m.id);
    const ys=m.vertices.map(x=>x[1]);
    if(Math.min(...ys)!==m.yRange[0]||Math.max(...ys)!==m.yRange[1])
      errors.push('Phase8 original source height changed '+m.id);
    for(let i=0;i<m.vertices.length;i+=3){
      const tri=m.vertices.slice(i,i+3);
      const samples:XZ[]=tri.map(v=>[v[0],v[2]]);
      samples.push([(tri[0]![0]+tri[1]![0]+tri[2]![0])/3,
                    (tri[0]![2]+tri[1]![2]+tri[2]![2])/3]);
      if(samples.some(x=>!insideHard(x))){errors.push('Phase8 source triangle sample outside outline '+m.id);break;}
    }
  }
  for(let i=0;i<meshes.length;i+=2){
    const a=meshes[i]!,b=meshes[i+1]!;
    if(a.side===b.side||a.pairId!==b.pairId||
       a.yRange[0]!==b.yRange[0]||a.yRange[1]!==b.yRange[1]||
       Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)
      errors.push('Phase8 source pair shape/y/area mismatch '+a.pairId);
    for(const p of a.vertices){
      if(Math.min(...b.vertices.map(q=>Math.hypot(
        p[0]+q[0]-0.229368288528164,
        p[1]-q[1],
        p[2]+q[2]-0.194564295456822)))>0.0002){
        errors.push('Phase8 original near-mirror XYZ unmatched '+a.pairId);break;
      }
    }
  }
  return errors;
}
