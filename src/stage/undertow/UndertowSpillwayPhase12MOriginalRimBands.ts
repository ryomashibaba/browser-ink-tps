import type {StageVector3} from '../StageDefinition';
/** T21 Phase12M exact original PillarObject01 4 planar rim + 4 low band
 * components, 4 mirror pairs. 176 source faces; <IIII9d> packed Float64.
 * Review-only; NOT a playable cap/roof/floor, collision, paint or navigation.
 */
const PACKED="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";
const ROWS=[[44184,44360,3.5812933680600922,"d45cf83b90b10fc7a7d0f672a497ebffd4c23c462e7767d27f0063d6c120b325"],[44228,44294,6.031660075692337,"85f9b283e3f67d437f036411f2c16620be7af5e624a2b5fccce45aba139e0f9e"],[44294,44228,6.0316600756923355,"763b6452e515a97db68879f33a72d02634827ec9d7a57c442142f702c4740ba4"],[44360,44184,3.5812933680600767,"50c57103ea48163a693901b227f9c687a47b464c42071e4b17b62416ea41d030"],[44382,44492,3.5812933680600816,"dae8d49f72cd3a1ef700bd7233b1800a689997c88bcc10bd8d31a725adac0b0a"],[44426,44448,6.031660075692336,"3e562fbff8041b9e6be9874271b14f645cbe2f08875b8a1b78dca6148a0ebc7a"],[44448,44426,6.031660075692336,"baa00effcf40f29e3c2d9c3248d4c4421c255ee9082d5eb621fd6503caf43bca"],[44492,44382,3.5812933680600856,"5d9cfd2b46820831d2bd781c7f321bdd89dbf2e07048210427db191d64f715a2"]] as const;
const SOURCE_OBJECT='Fld_Temple01_group22637_1__PillarObject01';
const SOURCE_MATERIAL='Fld_Temple01_PillarObject01';
export interface UndertowPhase12MOriginalRimBand {
 readonly id:string; readonly sourceComponentId:string;
 readonly originalMinFace:number; readonly originalMirrorMinFace:number;
 readonly sourceObject:string; readonly sourceMaterial:string;
 readonly originalSourceTriangleCount:22; readonly originalSource3DAreaSquareMeters:number;
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[]; readonly reviewGroup:'RIM'|'BAND';
 readonly reviewOnly:true; readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE';
}
async function unpack():Promise<readonly UndertowPhase12MOriginalRimBand[]>{
 if(typeof DecompressionStream==='undefined')throw Error('Phase12M native deflate unavailable');
 const compressed=Uint8Array.from(atob(PACKED),x=>x.charCodeAt(0));
 const ab=new ArrayBuffer(compressed.byteLength);new Uint8Array(ab).set(compressed);
 const buffer=await new Response(new Blob([ab]).stream().pipeThrough(
  new DecompressionStream('deflate'))).arrayBuffer();
 if(buffer.byteLength!==15488)throw Error('Phase12M original record byte count drift');
 const view=new DataView(buffer),out:UndertowPhase12MOriginalRimBand[]=[];
 let offset=0;
 for(const [faceMin,mirror,area,hash] of ROWS){
  const faces:number[]=[],ids:number[][]=[],vertices:StageVector3[]=[];
  for(let i=0;i<22;i++){
   if(offset+88>view.byteLength)throw Error('Phase12M original record overrun');
   const f=view.getUint32(offset,true);
   if(f!==faceMin+i)throw Error('Phase12M original Face IDs drift');
   faces.push(f);
   ids.push([view.getUint32(offset+4,true),
    view.getUint32(offset+8,true),view.getUint32(offset+12,true)]);
   for(let k=0;k<3;k++){
    const p:StageVector3=[view.getFloat64(offset+16+k*24,true),
     view.getFloat64(offset+24+k*24,true),view.getFloat64(offset+32+k*24,true)];
    if(p.some(x=>!Number.isFinite(x)))throw Error('Phase12M source nonfinite vertex');
    vertices.push(p);
   }
   offset+=88;
  }
  out.push(Object.freeze({
   id:'t21-phase12m-original-rim-band-'+faceMin,
   sourceComponentId:SOURCE_OBJECT+'|'+SOURCE_MATERIAL+'|original-minface-'+faceMin,
   originalMinFace:faceMin,originalMirrorMinFace:mirror,sourceObject:SOURCE_OBJECT,
   sourceMaterial:SOURCE_MATERIAL,originalSourceTriangleCount:22 as const,
   originalSource3DAreaSquareMeters:area,originalComponentFaceAndOBJVertexIDHash:hash,
   originalGlobalFaceIndices:faces,originalOBJVertexIdTriples:ids,vertices,
   reviewGroup:area<4?'RIM' as const:'BAND' as const,
   reviewOnly:true as const,runtimePromotionAuthorized:false as const,
   gameplayFloorCollisionPaintNavScoringAuthority:'NONE' as const
  }));
 }
 if(offset!==buffer.byteLength||out.length!==8)
  throw Error('Phase12M original source count drift');
 return Object.freeze(out);
}
export const UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS=await unpack();
export const UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BAND_SUMMARY=Object.freeze({
 originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
 originalPackedFloat64FaceVertexIDDigest:'0c8214798124ae8f3c80c2b81a7d9effe1cb20f0f371e64b3024a3e7ca8e0ea3',
 componentCount:8,mirrorPairCount:4,originalTriangleCount:176,
 rimCount:4,bandCount:4,
 totalOriginal3DAreaSquareMeters:UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS
  .reduce((s,c)=>s+c.originalSource3DAreaSquareMeters,0),
 frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:26,
 defaultVisible:false as const,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});
