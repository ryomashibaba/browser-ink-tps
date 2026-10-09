import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES } from './UndertowSpillwayPhase9DownfaceSourceGeometry';

/**
 * Phase11: 16 closest source triangles independently extracted from pinned
 * KiTrix Temple01 OBJ, one for each original Phase10 unmatched center edge.
 *
 * Eight 0m source-triangle contacts + eight 0.0255m (2.55cm) separations.
 * No original vertex-ID join (see Phase10). DO NOT use to build walkable
 * connections, collisions, floors, roof caps, paint, or nav routes.
 *
 * Blob payload: 16 little-endian Float64 records each containing
 * [exact3DSegmentTriangleDistance, triangle0XYZ,triangle1XYZ,triangle2XYZ].
 * Triangle coordinates/ordering/distance are original full-precision.
 */
const ORIGINAL_NEAREST_TRIANGLES_GZIP_B64=[
  'H4sIAAAAAAAC/2NggACXsp/sL/i0HCA8IYeN+zRvfYoUP1D5sPn1i5+KcPH5ueVTwjR10MRF4OJQ4xicWUXF56TowOWn7fqfJLac+wBM3MQYBNjh4rf',
  'z2I3XN+nCxT1m1j0QvMELN+9nlfXS9UuMoeZJOIjMzNw4k1viAKq4EFw8XtQix+QNQvxgwMkJN6ZLHGBQN+RYIzPL3nbKmWAfa124vIGGbsmGc8wHGK',
  '/9M1ogowMX96m/V52gy3VgeevlNVJZCPWyyneUnjSzwM3T3LpcteSFHlxeZu7GL24cDDj1bXfQSlj1G6Gex89YaOpMBrh5zx0iXZlOIeTl5/xh43b5t',
  'x+XPQuaJq2NCjOAi/fmP1r52er3fph5i1SSLnzzNITLTzx7tkXyz4/9Jk0VBYcCEPomC19K3W/5c39LVbJWmCtCfZl/Veqr/7/2w+JD/diqyz7MpvD4',
  '8v70yHjrXs4DMHFX96Kf/JnCcPGvfW+9754wgYvPWr7V2qscEb9r20JdK2ZqHoDZ92ci43Y9RQmHhx/va1S2KMLFXcIfN33p0UETF4GLw8xbLVoYovN',
  'eGy6vm7heps+U1wEmDnM3TNypPrnAnlcXLn7XXm9WZxo/3Dyd5peHv2caH4Clv6Qcx76rlyQcUMWF4OKTZJ911WxEiPOqLMwViZd0gMXHvAPMvY+O6s',
  'DlpwsIRX+PYXXIehZVYLBcGy7+WLXP9MZuboemZzVb531BqD8RKf/WWYgNbt6ko8zJLMV6cPlNzonr9k1jxKlPIbBtrlUbQv3iL49O82gwwc07tJDJr',
  'y0EIb+/5aBv6gYGB1z2XOlyOLNI2gAuvm+Po+zj8H/2MPMErm67YsFvCJf/YBUieVPij31Gl1o/lxhC3/4Ew5vrwv7YbxX477aQC6HeScHFuEIGaB4U',
  'RJ+L+DTlhAk8vp7OmPRWx4fbASYOS2cwcc3ps7NU+xDipn6pXw+y8jsAABkOBMEABQAA'
].join('');
const MATERIALS=['Fld_Temple01_FloorLine02','Fld_Temple01_WallMetal00','Fld_Temple01_PillarBase02'] as const;
const MATERIAL_ID=[0,1,2,0,0,0,0,0, 0,1,2,0,0,0,0,0] as const;
const ORIGINAL_FACE_INDEX=[60399,35255,28260,62251,62254,62257,62264,60290,
  61918,35261,25986,61963,61966,61969,61975,61294] as const;
export interface UndertowPhase11NearestSourceTriangle{
  readonly id:string;
  readonly sourceUnderfaceId:string;
  readonly sourceUnderfaceEdgeIndex:number;
  readonly originalCandidateMaterial:string;
  readonly originalCandidateFaceIndex:number;
  readonly originalNormalClass:'ORIGINAL_NEAR_VERTICAL'|'ORIGINAL_DOWN_FACING';
  readonly exactOriginal3DGapMeters:number;
  readonly vertices:readonly StageVector3[];
  readonly sourceAuthority:'PINNED_TEMPLE01_EXACT_ORIGINAL_FLOAT64_TRIANGLE';
  readonly gameplayConnectionAuthority:'NONE';
  readonly reviewDiagnosticOnly:true;
  readonly runtimePromotionAuthorized:false;
}
async function decode():Promise<readonly UndertowPhase11NearestSourceTriangle[]>{
  if(typeof DecompressionStream==='undefined')throw Error('Phase11 source triangles need native gzip decoder');
  const zip=Uint8Array.from(atob(ORIGINAL_NEAREST_TRIANGLES_GZIP_B64),c=>c.charCodeAt(0));
  const buffer=new ArrayBuffer(zip.byteLength);new Uint8Array(buffer).set(zip);
  const data=await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(data.byteLength!==1280)throw Error('T21 Phase11 original source byte drift');
  const dv=new DataView(data);
  return Object.freeze(Array.from({length:16},(_,i)=>{
    const at=i*80;
    const gap=dv.getFloat64(at,true);
    const vertices:StageVector3[]=Array.from({length:3},(_,j)=>[
      dv.getFloat64(at+8+j*24,true),
      dv.getFloat64(at+16+j*24,true),
      dv.getFloat64(at+24+j*24,true)
    ]);
    if(!Number.isFinite(gap)||gap<0||gap>8||
       vertices.flat().some(x=>!Number.isFinite(x)))
      throw Error('T21 Phase11 source triangle corrupted '+i);
    const source=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[i<8?0:1]!;
    return Object.freeze({
      id:'t21-phase11-original-nearest-source-triangle-'+String(i+1).padStart(2,'0'),
      sourceUnderfaceId:source.sourceComponentId,
      sourceUnderfaceEdgeIndex:i%8,
      originalCandidateMaterial:MATERIALS[MATERIAL_ID[i] ?? 0]!,
      originalCandidateFaceIndex:ORIGINAL_FACE_INDEX[i]!,
      originalNormalClass:(i%8>=3&&i%8<=6?'ORIGINAL_DOWN_FACING':'ORIGINAL_NEAR_VERTICAL') as 'ORIGINAL_NEAR_VERTICAL'|'ORIGINAL_DOWN_FACING',
      exactOriginal3DGapMeters:gap,vertices,
      sourceAuthority:'PINNED_TEMPLE01_EXACT_ORIGINAL_FLOAT64_TRIANGLE' as const,
      gameplayConnectionAuthority:'NONE' as const,
      reviewDiagnosticOnly:true as const,
      runtimePromotionAuthorized:false as const
    });
  }));
}
export const UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES=await decode();
export const UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY=Object.freeze({
  centerUnmatchedOriginalEdges:16,
  sourceTouchingZeroMeterEdges:UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES.filter(x=>x.exactOriginal3DGapMeters===0).length,
  source2Point55CentimeterGapEdges:UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES.filter(x=>Math.abs(x.exactOriginal3DGapMeters-0.0255)<1e-10).length,
  reviewOnly:true as const,
  runtimePromotionAuthorized:false as const
});
export function undertowT21Phase11CandidateErrors():readonly string[]{
  const errors:string[]=[];
  const all=UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES;
  if(all.length!==16||UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY.sourceTouchingZeroMeterEdges!==8||
     UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY.source2Point55CentimeterGapEdges!==8)
    errors.push('Phase11 pinned-original 16-edge candidate summary drift');
  const keys=new Set<string>();
  for(const c of all){
    const key=c.sourceUnderfaceId+'#'+c.sourceUnderfaceEdgeIndex;
    if(keys.has(key))errors.push('Phase11 duplicate underside edge candidate');
    keys.add(key);
    if(c.vertices.length!==3||c.vertices.flat().some(x=>!Number.isFinite(x))||
       c.runtimePromotionAuthorized||c.gameplayConnectionAuthority!=='NONE')
      errors.push('Phase11 invalid pinned candidate triangles/authority '+c.id);
  }
  return errors;
}
