import type {StageVector3} from '../StageDefinition';
/** Phase12C CI #1387: exact SHA-pinned KiTrix Temple01 original source.
 * Eight COMPLETE original OBJ vertex-ID connected components = four mirrored pairs.
 * 70 original triangles. Optional visual-review overlay only; never a game surface.
 * The other eight Phase12B components are HELD by original overlap, hard-XZ or mirror QA.
 */
const B64='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';
const OBJECTS={
 WallMetal00:'Fld_Temple01_group20357_1__WallMetal00',
 FloorLine02:'Fld_Temple01_mesh05_low57_1__FloorLine02',
 GlassEdge00:'Fld_Temple01_pCube21025_1__GlassEdge00'
} as const;
type Family=keyof typeof OBJECTS;
type Row=readonly [number,Family,number,number,number,number,string];
const ROWS:readonly Row[]=[
 [34845,'WallMetal00',21,6.359831909239167,4.8,5.5,'90c2349dcbd0bc845dde6606edf4efde04f93c780fef7173d86c9cb94c1c5993'],
 [34873,'WallMetal00',21,6.359831909239167,4.8,5.5,'b9f52de96bd021ba4c77388a4a8d95126acf066830b647d957dda46dc1c9f135'],
 [60160,'FloorLine02',2,0.5378062449138533,4.55,4.55,'bb46cdb21faa509ce86a58c92245fc57e0cde0407458d079ed1d9843dbc0ee41'],
 [61422,'FloorLine02',2,0.5378062449138368,4.55,4.55,'c54e5cf0827d7f3a50010f4f99524eb1561a3bd0b06952ef4ac72576cd8599b1'],
 [69626,'GlassEdge00',2,0.805005661723619,4.5,4.5,'6c80e91985da4901de3862f4911a20c5bbf3b775e822644a19596e63be0fbd72'],
 [69634,'GlassEdge00',2,0.8050056617236092,4.5,4.5,'0472899e9cdcbe38442a797fe65aea436c7196a63f4d015af468811c7016ecab'],
 [69776,'GlassEdge00',10,0.4736545809297222,4.8058,4.8058,'14d0be4d48da63feda0621df58732c5e2843c0f4c818ba6378dee126d39a8842'],
 [69810,'GlassEdge00',10,0.47365458092972107,4.8058,4.8058,'61bb165acf1f01ae5c3ae2822a2da1234bb7b5702b9cef6ecabed3b1bfda5063']
];
export interface UndertowPhase12COriginalComponent{
 readonly id:string;readonly sourceComponentKey:string;readonly originalSourceObject:string;
 readonly sourceMaterial:string;readonly sourceFamily:Family;
 readonly side:'POSITIVE_Z'|'NEGATIVE_Z';readonly pairId:number;
 readonly original3DAreaSquareMeters:number;readonly originalYRangeMeters:readonly[number,number];
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly proof:'PINNED_ORIGINAL_SOURCE_AND_124_MESH_HARD_XZ_MIRROR_GATES';
 readonly playableFloorCollisionPaintNavAuthority:'NONE';
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
}
async function decode():Promise<readonly UndertowPhase12COriginalComponent[]>{
 if(typeof DecompressionStream==='undefined')throw Error('T21 Phase12C gzip support required');
 const data=Uint8Array.from(atob(B64),x=>x.charCodeAt(0));
 const copy=new ArrayBuffer(data.byteLength);new Uint8Array(copy).set(data);
 const raw=await new Response(new Blob([copy]).stream().pipeThrough(
   new DecompressionStream('gzip'))).arrayBuffer();
 if(raw.byteLength!==6160)throw Error('T21 Phase12C raw 70 original triangle payload drift');
 const v=new DataView(raw);let off=0;
 const result:UndertowPhase12COriginalComponent[]=[];
 for(let i=0;i<ROWS.length;i++){
   const [minface,family,triangleCount,area,minY,maxY,hash]=ROWS[i]!;
   const vertices:StageVector3[]=[],faceIds:number[]=[],vertexTriples:number[][]=[];
   for(let f=0;f<triangleCount;f++){
     if(off+88>raw.byteLength)throw Error('T21 Phase12C missing original triangle');
     const faceId=v.getUint32(off,true);
     const ids=[v.getUint32(off+4,true),v.getUint32(off+8,true),v.getUint32(off+12,true)];
     faceIds.push(faceId);vertexTriples.push(ids);
     for(let j=0;j<3;j++){
       const p:StageVector3=[v.getFloat64(off+16+j*24,true),
           v.getFloat64(off+24+j*24,true),v.getFloat64(off+32+j*24,true)];
       if(p.some(x=>!Number.isFinite(x)))throw Error('T21 Phase12C nonfinite source');
       vertices.push(p);
     }
     off+=88;
   }
   if(faceIds[0]!==minface||new Set(faceIds).size!==triangleCount)
     throw Error('T21 Phase12C original minimum face/identity drift');
   const meanZ=vertices.reduce((s,p)=>s+p[2],0)/vertices.length;
   result.push(Object.freeze({
     id:'phase12c-original-full-'+minface,
     sourceComponentKey:OBJECTS[family]+'|Fld_Temple01_'+family+'|original-minface-'+minface,
     originalSourceObject:OBJECTS[family],sourceMaterial:'Fld_Temple01_'+family,
     sourceFamily:family,side:meanZ>=0?'POSITIVE_Z':'NEGATIVE_Z',
     pairId:Math.floor(i/2)+1,original3DAreaSquareMeters:area,
     originalYRangeMeters:[minY,maxY] as const,
     originalComponentFaceAndOBJVertexIDHash:hash,
     originalGlobalFaceIndices:faceIds,originalOBJVertexIdTriples:vertexTriples,
     vertices,proof:'PINNED_ORIGINAL_SOURCE_AND_124_MESH_HARD_XZ_MIRROR_GATES' as const,
     playableFloorCollisionPaintNavAuthority:'NONE' as const,
     reviewOnly:true as const,runtimePromotionAuthorized:false as const
   }));
 }
 if(off!==raw.byteLength||result.length!==8||result.reduce((s,r)=>s+r.vertices.length/3,0)!==70)
  throw Error('T21 Phase12C full component count/byte cursor drift');
 return Object.freeze(result);
}
export const UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES=await decode();
export const UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY=Object.freeze({
 originalSourceComponentCount:8,originalTriangleCount:70,originalMirrorPairCount:4,
 source3DAreaSquareMeters:UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES
  .reduce((sum,m)=>sum+m.original3DAreaSquareMeters,0),
 excludedSourceComponents:8,existingFullSourceDisplayCountUnchanged:124,
 reviewOnly:true as const,defaultVisible:false as const,
 runtimePromotionAuthorized:false as const
});
export function undertowT21Phase12CEligibleSourceErrors():readonly string[]{
 const out:string[]=[];const seen=new Set<number>();
 const m=UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES;
 if(m.length!==8||m.reduce((sum,x)=>sum+x.vertices.length/3,0)!==70)
  out.push('T21 Phase12C original source cardinality drift');
 for(const c of m){
  if(c.playableFloorCollisionPaintNavAuthority!=='NONE'||c.runtimePromotionAuthorized||
      c.originalGlobalFaceIndices.length*3!==c.vertices.length)
    out.push('T21 Phase12C unauthorized source authority '+c.id);
  for(const face of c.originalGlobalFaceIndices){
   if(seen.has(face))out.push('T21 Phase12C repeated original source face '+face);
   seen.add(face);
  }
 }
 for(let i=0;i<m.length;i+=2){
  if(m[i]!.pairId!==m[i+1]!.pairId||m[i]!.side===m[i+1]!.side||
      Math.abs(m[i]!.original3DAreaSquareMeters-m[i+1]!.original3DAreaSquareMeters)>1e-6)
    out.push('T21 Phase12C source counterpart drift '+(i/2+1));
 }
 return out;
}
