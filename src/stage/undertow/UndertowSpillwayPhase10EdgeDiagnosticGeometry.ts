import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES } from './UndertowSpillwayPhase9DownfaceSourceGeometry';

/**
 * Phase10 original OBJ edge evidence: 48 boundary edges, exact project-XYZ
 * Float64 endpoints, in original Phase9 source component order.
 *
 * The deterministic gzip decodes: one uint8 source index, one uint8 seam tier,
 * then six little-endian binary64 values for the exact endpoint coordinates.
 * Source: Phase10 independent pinned-original-OBJ all-triangle edge join.
 *
 * This is NOT a navigable path, connection, mesh, physical collider, new
 * platform, playable floor/underside, or runtime promotion. A coordinate
 * coincidence is specifically NOT a welded OBJ edge.
 */
const PINNED_DIAGNOSTIC_EDGES_GZIP_B64=[
  'H4sIAAAAAAAC/32QfVRTZRzHdy+DjbN8aaXlwvGyxeVlA8YWI2TtkeXmTkXaIXLk6RaGBxNQkCMZL0c404UE+XaKI2kkllg',
  'GG3GkIN2lmmbR5EQWiKJSDsKwBhahjLp04rl//fb8+fmez/f7PA+P/K22+Jh5RQSiVMKTIRIxCs2P773TFMs0HyCojXEqzC',
  'urXtgccW8kwwONM+3/vMTTKjG/WLV7tGiCzxpQ1/7jMVVJNzWYJ0aGPXbWKGINqKvDPbTDMxiH+Y1tou1lOh5rQMmPtTnnP',
  'lYncFzxl8R55a6TR0JJ23BAmiKZu+3guWnfk55p1oAS/cIuYd5xjofsKzv9qXeGNaAEejlBDja0rmqZTGDmEyrvGwtTHIky',
  'jvReH3CFY/5VZsOZeoECESTlev7dvd0KnORFJx0d2xnkx3C19jdW2DU46em5MKW7eA+Ctgky7GpKx/aNcTgplXTF3/6WQNA',
  '2Qd6voHpueuNxIn7t2bqWO7N6qIkgPWOOF4t93PriJZbC1ACfHmoiyKKlm6j2PBVO5L/nP5gh4CGoCX451EQSy68Ef/jmEg',
  'pp1HPnASTK7XN1utMY+r0b5vzFMZhH1+YGpigMDGu4PzKLDDKcNNAVBDpm9GMMBveeUK4Ow0l5yq/djNHIQNt+DGA7gDjrW',
  'GnzHYpm5pN9toDK8FUGtHs8ZyS0MRLz4uyClUdH0hBs7BoS2Bq+i8Ccn7WsnDptZA2oa49mnbv0/VDMPRqrrpmeM6AuyOAT',
  'n6Rfqvl+lvvF7ijT+UKzgZkUn4q1Tysxv/rUZaH3AwPDJxz6sth0BfeLa8Mm+FNSkx9ja2ljzVaVHCfqu+tdJd1GBtqGDWg',
  '7kMiSiTchqxK/0Ly6xNrvNCAJnXQ+uzoG81jZ8OOWbAOCjWVr+nOHTnG/3imp3TmkNbEG1DVQM/M173MZ5of/nEL0JSNrQF',
  '2QEUSgzfX9MQMahvff4aNJ72ipo0CHOibekV/YwfGXaellr16HgkjIqNvGz3nUEoX52yOv2yV7TewG1FVetcBXeYjCfM2Rp',
  'mudr84ZUBdkCAjr2K1AW7sGzSf7Xxn9JWKhjhFtGPts+L5HMA/3tVmHU3WMgHx4QzN1wh2Fk7jxcY26xAQbxNIih9O7iDM8',
  'TcKcPtrEQNuwAW0LCbmhLsW+KPH/5A89nRCS/oU2GZ3sqr4l2sLx3sNrW8jgZCQk3qIznfU/y3HytJi2Z92W+jF2FdDPXZd',
  'zxp711fGW1lAEbcMGtB1MXPtSuyBDk8jMJ77mhzrUP2mZdU+kWv7+QYX5Gys8mZOByQxszG5pm4kqkGPO19v6pEopa0Bd4x',
  'VdBwtbZZjrqx3PLB+dM6AuyPgXUEu3u2AJAAA='
].join('');
export type UndertowPhase10SeamTier=
  'EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE'|
  'COINCIDENT_XYZ_ONLY_NOT_WELDED'|
  'NO_EXACT_ORIGINAL_EDGE_NEIGHBOR';
export interface UndertowPhase10EdgeEvidence {
  readonly sourceIndex:number;
  readonly sourceComponentId:string;
  readonly kind:string;
  readonly tier:UndertowPhase10SeamTier;
  readonly endpoints:readonly [StageVector3,StageVector3];
  readonly sourceOnlyDiagnostic:true;
  readonly gameplayColliderWalkableConnectivityAuthority:'NONE';
}
async function loadOriginalTopology():Promise<readonly UndertowPhase10EdgeEvidence[]>{
  if(typeof DecompressionStream==='undefined')
    throw new Error('T21 Phase10 edge diagnostic requires native gzip DecompressionStream');
  const encoded=Uint8Array.from(atob(PINNED_DIAGNOSTIC_EDGES_GZIP_B64),x=>x.charCodeAt(0));
  const copy=new ArrayBuffer(encoded.byteLength);
  new Uint8Array(copy).set(encoded);
  const original=await new Response(
    new Blob([copy]).stream().pipeThrough(new DecompressionStream('gzip'))
  ).arrayBuffer();
  if(original.byteLength!==2400)throw new Error('T21 Phase10 original 48-edge fixture byte count changed');
  const dv=new DataView(original);
  const edges:UndertowPhase10EdgeEvidence[]=[];
  for(let offset=0;offset<original.byteLength;offset+=50){
    const sourceIndex=dv.getUint8(offset),classification=dv.getUint8(offset+1);
    const source=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[sourceIndex];
    if(!source)throw new Error('Phase10 original source identity index missing');
    const tier:UndertowPhase10SeamTier=classification===0
      ?'EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE'
      :classification===1?'COINCIDENT_XYZ_ONLY_NOT_WELDED'
      :classification===2?'NO_EXACT_ORIGINAL_EDGE_NEIGHBOR'
      :(()=>{throw new Error('T21 Phase10 invalid source seam tier')})();
    const a:StageVector3=[dv.getFloat64(offset+2,true),dv.getFloat64(offset+10,true),
      dv.getFloat64(offset+18,true)];
    const b:StageVector3=[dv.getFloat64(offset+26,true),dv.getFloat64(offset+34,true),
      dv.getFloat64(offset+42,true)];
    if([...a,...b].some(n=>!Number.isFinite(n)))
      throw new Error('T21 Phase10 original source edge contains nonfinite vertex');
    edges.push(Object.freeze({
      sourceIndex,sourceComponentId:source.sourceComponentId,kind:source.kind,
      tier,endpoints:[a,b] as const,sourceOnlyDiagnostic:true as const,
      gameplayColliderWalkableConnectivityAuthority:'NONE' as const
    }));
  }
  return Object.freeze(edges);
}
export const UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE=await loadOriginalTopology();
export const UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY=Object.freeze({
  boundaryEdges:UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE.length,
  sharedOriginalOBJVertexIDs:UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE.filter(
    x=>x.tier==='EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE').length,
  coordinateOnlySeams:UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE.filter(
    x=>x.tier==='COINCIDENT_XYZ_ONLY_NOT_WELDED').length,
  unmatchedSourceEdges:UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE.filter(
    x=>x.tier==='NO_EXACT_ORIGINAL_EDGE_NEIGHBOR').length,
  reviewOnly:true as const,runtimePromotionAuthorized:false as const
});
export function undertowT21Phase10EdgeErrors():readonly string[]{
  const errors:string[]=[];
  const summary=UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY;
  if(summary.boundaryEdges!==48||summary.sharedOriginalOBJVertexIDs!==0||
     summary.coordinateOnlySeams!==30||summary.unmatchedSourceEdges!==18)
    errors.push('T21 Phase10 pinned OBJ boundary adjacency results changed');
  for(const edge of UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE){
    const source=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[edge.sourceIndex];
    if(!source||source.sourceComponentId!==edge.sourceComponentId||
       edge.gameplayColliderWalkableConnectivityAuthority!=='NONE')
      errors.push('T21 Phase10 source evidence identity/runtime gate failed');
    const sourcePoints=new Set(source?.vertices.map(v=>v.join(','))||[]);
    if(edge.endpoints.some(p=>!sourcePoints.has(p.join(','))))
      errors.push('T21 Phase10 edge endpoint not original source triangle vertex');
  }
  return errors;
}
