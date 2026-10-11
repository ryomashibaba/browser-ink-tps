import type {StageVector3} from '../StageDefinition';
/** Phase12L: four complete KiTrix original-source PillarObject01 lower shells,
 * 2 mirror pairs / 88 true original faces. Review-only, OFF in every preset.
 * Packed records <IIII9d> retain exact OBJ Face IDs, vertex IDs and Float64 XYZ.
 * NO inferred surfaces/collision/paint/walkable roofs or floor connectivity. */
const PACKED="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";
const ROWS=[[42926,43624,"Fld_Temple01_group22637_1__PillarObject01","Fld_Temple01_PillarObject01",22,26.615832458580677,"d78458b874bfb3cecc29c5b7c18b9d2b5c36ec230027efbf63f1a5124cc278c6"],[43102,43448,"Fld_Temple01_group22637_1__PillarObject01","Fld_Temple01_PillarObject01",22,26.615832458580677,"7d9ed5faf9ead7fb4a739b511a068f3f6193e023bf6e18b96711aa734c8d1ce6"],[43448,43102,"Fld_Temple01_group22637_1__PillarObject01","Fld_Temple01_PillarObject01",22,26.61583245858068,"3dc03e10592d2e4c15766c0e1b18e0001218eb2ebc677e83505ef9593db8e90e"],[43624,42926,"Fld_Temple01_group22637_1__PillarObject01","Fld_Temple01_PillarObject01",22,26.615832458580684,"d84b6d221718fe13de4d9da60cde1d54edb3955f301f4c5a1fd5dc4353af7e25"]] as const;
export interface UndertowPhase12LOriginalObjectMesh{
 readonly id:string;readonly sourceComponentId:string;
 readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly sourceObject:string;readonly sourceMaterial:string;
 readonly originalSourceTriangleCount:22;readonly originalSource3DAreaSquareMeters:number;
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE';
}
async function unpack():Promise<readonly UndertowPhase12LOriginalObjectMesh[]>{
 if(typeof DecompressionStream==='undefined')throw Error('T21 Phase12L native deflate unavailable');
 const packed=Uint8Array.from(atob(PACKED),x=>x.charCodeAt(0));
 const ab=new ArrayBuffer(packed.byteLength);new Uint8Array(ab).set(packed);
 const result=await new Response(new Blob([ab]).stream().pipeThrough(
  new DecompressionStream('deflate'))).arrayBuffer();
 if(result.byteLength!==7744)throw Error('Phase12L 88 original source triangles packed drift');
 const dv=new DataView(result),parts:UndertowPhase12LOriginalObjectMesh[]=[];
 let o=0;
 for(const [faceMin,mirror,obj,material,count,area,hash] of ROWS){
  const globalFaces:number[]=[],objIds:number[][]=[],vertices:StageVector3[]=[];
  for(let k=0;k<count;k++){
   const id=dv.getUint32(o,true);
   if(id!==faceMin+k)throw Error('Phase12L unapproved original Face ID');
   globalFaces.push(id);
   objIds.push([dv.getUint32(o+4,true),dv.getUint32(o+8,true),dv.getUint32(o+12,true)]);
   for(let n=0;n<3;n++){
    const p:StageVector3=[dv.getFloat64(o+16+n*24,true),
      dv.getFloat64(o+24+n*24,true),dv.getFloat64(o+32+n*24,true)];
    if(p.some(x=>!Number.isFinite(x)))throw Error('Phase12L nonfinite original source');
    vertices.push(p);
   }
   o+=88;
  }
  parts.push(Object.freeze({
   id:'t21-phase12l-original-object-'+faceMin,
   sourceComponentId:obj+'|'+material+'|original-minface-'+faceMin,
   originalMinFace:faceMin,originalMirrorMinFace:mirror,
   sourceObject:obj,sourceMaterial:material,originalSourceTriangleCount:22 as const,
   originalSource3DAreaSquareMeters:area,originalComponentFaceAndOBJVertexIDHash:hash,
   originalGlobalFaceIndices:globalFaces,originalOBJVertexIdTriples:objIds,vertices,
   reviewOnly:true as const,runtimePromotionAuthorized:false as const,
   gameplayFloorCollisionPaintNavScoringAuthority:'NONE' as const
  }));
 }
 if(o!==dv.byteLength)throw Error('Phase12L source tail drift');
 return Object.freeze(parts);
}
export const UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS=await unpack();
export const UNDERTOW_T21_PHASE12L_OBJECT_SUMMARY=Object.freeze({
 originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
 originalPackedFloat64FaceVertexIDDigest:'b1bf7357331125993a0f52c644d8da0dd99633b6aec335bf0452391ac35db817',
 componentCount:4,originalTriangleCount:88,mirrorPairCount:2,
 frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:22,
 defaultVisible:false as const,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});
