import type {StageVector3} from '../StageDefinition';
/** Phase12K: FOUR complete, exact source-only meshes (2 mirror pairs), selected
 * from Phase12J's 44 independently accepted source components. NO new faces,
 * inferred floors, physical attachment, paint, navigation or gameplay authority.
 * Original Face IDs, OBJ vertex IDs and Float64 XYZ are losslessly embedded.
 */
const PACKED="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";
const ROWS=[[13154,13198,"Fld_Temple01_CellingBase_1__PillarOld00","Fld_Temple01_PillarOld00",22,231.77954099347312,"f5fa5e6c0a057b70f61a26c698a1cf622f1808f7def6bb76b18dd9d6f41ae5b2"],[13198,13154,"Fld_Temple01_CellingBase_1__PillarOld00","Fld_Temple01_PillarOld00",22,231.7795409934732,"95a371aa343ee1951121e0423848d1bd08c65d1953b760d2f6cb84c945bb785e"],[63834,63858,"Fld_Temple01_mesh08_low97_1__PillarCutPlane00","Fld_Temple01_PillarCutPlane00",24,26.83962787931359,"df5b1413d664d0e913f9408c96da69e0c33e797f7c8d5860f29051794a1274fa"],[63858,63834,"Fld_Temple01_mesh08_low97_1__PillarCutPlane00","Fld_Temple01_PillarCutPlane00",24,26.839627879313575,"d005b23941bd20464e789e5e355d64927e72f810a7356f04bbbf002546ca63db"]] as const;
export interface UndertowPhase12KOriginalNeighborMesh {
 readonly id:string; readonly sourceComponentId:string;
 readonly originalMinFace:number; readonly originalMirrorMinFace:number;
 readonly sourceObject:string; readonly sourceMaterial:string;
 readonly originalSourceTriangleCount:number; readonly originalSource3DAreaSquareMeters:number;
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly reviewGroup:'OLD'|'CUT'; readonly reviewOnly:true;
 readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE';
}
async function unpack():Promise<readonly UndertowPhase12KOriginalNeighborMesh[]>{
 if(typeof DecompressionStream==='undefined')throw Error('Phase12K native deflate unavailable');
 const bytes=Uint8Array.from(atob(PACKED),c=>c.charCodeAt(0));
 const ab=new ArrayBuffer(bytes.byteLength);new Uint8Array(ab).set(bytes);
 const array=await new Response(new Blob([ab]).stream().pipeThrough(
   new DecompressionStream('deflate'))).arrayBuffer();
 if(array.byteLength!==8096)throw Error('Phase12K original source packed byte count drift');
 const dv=new DataView(array),meshes:UndertowPhase12KOriginalNeighborMesh[]=[];
 let cursor=0;
 for(const [minFace,mirror,object,material,count,area,hash] of ROWS){
   const faces:number[]=[],ids:number[][]=[],vertices:StageVector3[]=[];
   for(let k=0;k<count;k++){
     if(cursor+88>dv.byteLength)throw Error('Phase12K packed source overrun');
     const face=dv.getUint32(cursor,true);
     if(face!==minFace+k)throw Error('Phase12K noncontiguous original Face IDs');
     const triple=[dv.getUint32(cursor+4,true),dv.getUint32(cursor+8,true),
       dv.getUint32(cursor+12,true)];
     faces.push(face);ids.push(triple);
     for(let n=0;n<3;n++){
       const xyz:StageVector3=[
         dv.getFloat64(cursor+16+n*24,true),
         dv.getFloat64(cursor+24+n*24,true),
         dv.getFloat64(cursor+32+n*24,true)
       ];
       if(xyz.some(x=>!Number.isFinite(x)))throw Error('Phase12K nonfinite original vertex');
       vertices.push(xyz);
     }
     cursor+=88;
   }
   meshes.push(Object.freeze({
      id:'t21-phase12k-original-neighbor-'+minFace,
      sourceComponentId:object+'|'+material+'|original-minface-'+minFace,
      originalMinFace:minFace,originalMirrorMinFace:mirror,
      sourceObject:object,sourceMaterial:material,
      originalSourceTriangleCount:count,originalSource3DAreaSquareMeters:area,
      originalComponentFaceAndOBJVertexIDHash:hash,
      originalGlobalFaceIndices:faces,originalOBJVertexIdTriples:ids,vertices,
      reviewGroup:material==='Fld_Temple01_PillarOld00'?'OLD' as const:'CUT' as const,
      reviewOnly:true as const,runtimePromotionAuthorized:false as const,
      gameplayFloorCollisionPaintNavScoringAuthority:'NONE' as const
   }));
 }
 if(cursor!==dv.byteLength||meshes.length!==4)
   throw Error('Phase12K exact source component count drift');
 return Object.freeze(meshes);
}
export const UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS=await unpack();
export const UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS_SUMMARY=Object.freeze({
 originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
 originalPackedFloat64FaceVertexIDDigest:'447baf35dfbab26e12f310842d309ee2162b86de1791afea2ea6e52251275c75',
 componentCount:4,mirrorPairCount:2,originalTriangleCount:92,
 totalOriginal3DAreaSquareMeters:UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS
 .reduce((a,b)=>a+b.originalSource3DAreaSquareMeters,0),
 originalOldCount:2,originalCutCount:2,
 frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:18,
 defaultVisible:false as const,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});
