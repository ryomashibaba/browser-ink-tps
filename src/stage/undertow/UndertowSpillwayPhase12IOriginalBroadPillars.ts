import type {StageVector3} from '../StageDefinition';
/** Six COMPLETE original source-connected 3D PillarOld00 structures; all 132
 * source triangles from SHA-pinned Temple01, after independent 136-mesh,
 * 42-point hard-XZ and source mirror gate. REVIEW ONLY; OFF in all presets.
 * Bytewise exact original XYZ/Face IDs/OBJ vertex IDs, no inferred faces.
 */
const PACKED=[
  "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"
].join('');
const ROWS=[[12934,13110,268.3763106240216,"4f840f4b4a2012e5d17663a6970123a0fa9df814cab0125a31783e14538dd3d1"],[12956,13132,268.3763106240216,"aee3a78b72a1910d0900ca4b6a9a724b16e62ffe03c0007f0f9506fb7205e0aa"],[13110,12934,268.3763106240215,"78f49105039b59018104b4d0d3c31aba2aa6568f51d9c8e980147911d174edbf"],[13132,12956,268.37631062402164,"322c52bafdc3f8156d9bc57b463fc287a485236cf5f048498271c1c8a274e426"],[13176,13220,231.7795409934732,"d32ee5ca3f170a62ecf99ff7bcaed695a920f18b826187825e1796649e55e4aa"],[13220,13176,231.77954099347323,"7d1b8b47434b76e42899e35a45c6b7ba117857ac9f9545dc54d3728beb4339eb"]] as const;

export interface UndertowPhase12IOriginalPillarMesh {
 readonly id:string;readonly sourceComponentId:string;
 readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly sourceObject:'Fld_Temple01_CellingBase_1__PillarOld00';
 readonly sourceMaterial:'Fld_Temple01_PillarOld00';
 readonly originalSourceTriangleCount:22;
 readonly originalSource3DAreaSquareMeters:number;
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE';
}
async function unpack():Promise<readonly UndertowPhase12IOriginalPillarMesh[]>{
 if(typeof DecompressionStream==='undefined')throw Error('T21 Phase12I native deflate unavailable');
 const compressed=Uint8Array.from(atob(PACKED),x=>x.charCodeAt(0));
 const buff=new ArrayBuffer(compressed.byteLength);
 new Uint8Array(buff).set(compressed);
 const array=await new Response(new Blob([buff]).stream().pipeThrough(
   new DecompressionStream('deflate'))).arrayBuffer();
 if(array.byteLength!==11616)throw Error('T21 Phase12I 132 original triangles byte drift');
 const dv=new DataView(array),result:UndertowPhase12IOriginalPillarMesh[]=[];
 let cursor=0;
 for(const [minFace,mirror,area,digest] of ROWS){
   const faces:number[]=[],ids:number[][]=[],vertices:StageVector3[]=[];
   for(let k=0;k<22;k++){
     const fi=dv.getUint32(cursor,true);
     if(fi!==minFace+k)throw Error('T21 Phase12I pinned source original face ID drift');
     const row=[dv.getUint32(cursor+4,true),dv.getUint32(cursor+8,true),
       dv.getUint32(cursor+12,true)];
     faces.push(fi);ids.push(row);
     for(let n=0;n<3;n++){
       const p:StageVector3=[
         dv.getFloat64(cursor+16+n*24,true),
         dv.getFloat64(cursor+24+n*24,true),
         dv.getFloat64(cursor+32+n*24,true)
       ];
       if(p.some(x=>!Number.isFinite(x)))throw Error('T21 Phase12I nonfinite original XYZ');
       vertices.push(p);
     }
     cursor+=88;
   }
   result.push(Object.freeze({
     id:'t21-phase12i-original-pillar-'+minFace,
     sourceComponentId:'Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|original-minface-'+minFace,
     originalMinFace:minFace,originalMirrorMinFace:mirror,
     sourceObject:'Fld_Temple01_CellingBase_1__PillarOld00' as const,
     sourceMaterial:'Fld_Temple01_PillarOld00' as const,
     originalSourceTriangleCount:22 as const,
     originalSource3DAreaSquareMeters:area,
     originalComponentFaceAndOBJVertexIDHash:digest,
     originalGlobalFaceIndices:faces,originalOBJVertexIdTriples:ids,vertices,
     reviewOnly:true as const,runtimePromotionAuthorized:false as const,
     gameplayFloorCollisionPaintNavScoringAuthority:'NONE' as const
   }));
 }
 if(cursor!==array.byteLength)throw Error('T21 Phase12I original source underread');
 return Object.freeze(result);
}
export const UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS=await unpack();
export const UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS_SUMMARY=Object.freeze({
 sourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
 originalPackedFloat64FaceVertexIDDigest:'b158e4843e2c9d3afbe45da481e8383ddd5096f5d022fa7e0ca57dc5bbc4c250',
 componentCount:6,mirrorPairCount:3,originalTriangleCount:132,
 totalOriginal3DAreaSquareMeters:UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS
   .reduce((s,c)=>s+c.originalSource3DAreaSquareMeters,0),
 sourceOriginalMaterial:'Fld_Temple01_PillarOld00',
 frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:12,
 defaultVisible:false as const,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});
