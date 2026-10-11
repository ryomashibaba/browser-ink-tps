import type {StageVector3} from '../StageDefinition';
/** Four additional FULL originally connected pieces recovered only from the
 * SHA256-pinned KiTrix Temple01 OBJ, Phase12D strict original 180° mirror
 * pairing and independent 132-mesh + 42-point hard-XZ source gate.
 * Exactly 2 original mirrored pairs / 8 original triangles / 3.5265546m²
 * of ORIGINAL TRIANGLE SURFACE, not new walkable area, roof, collider or fill.
 */
const PACKED='H4sIAAAAAAAC/0t7xcDwtpqV4R0Qvwfi2hD3v86XlBxMjEGA3WFDR5Cnr6b2AZg4AxiIwcU1lfaEsV5XhItvuf0jy65e+0A60NwPQPPeQs2FqYOZC1OHyz5c5vp8YGBwa2dlcAdiDyAWcnT58qtZ9wBEnZAD+8zEjReS+B1g4rNmgoAwXDzrWVSBwXJtuPrHqn2mN3ZzO/gCzQWZ6YlmLi79MHGYflzmKnxkYHjXAQwDIP4AxE9TFltdiVE6APNveNE+89c92g4wcZh/YeKTjCSmTE1UhItHHk2JvPNI20ERaO5HoHnvoObC1MHMhanDZR8uc9s+MTB872Jl+AHEP4F4lcGLbVk/dR1g/ir6tPF7xBXeAzBxWDjAxBmv/TNaIKMDV+9Tf686QZfrQDvQXJCZv9DMxaUfJg7Tj8tcAAhMC8DAAgAA';
const ROWS=[
 [60006,1,1.3484303546664937,2.9000000000000004,5.5,'75ce1a4a8611114a3bd1aca3444f4a52e7da8ee845e6d424b144bb5668151234'],
 [61516,2,0.4148469577716914,4.5,4.9,'955c2888b1c405368db46a7307565563f2a4ef78328a429ab02c132b68a136c1'],
 [61728,1,1.3484303546664864,2.9000000000000004,5.5,'5f5dbc7612e60c2bf78786acbfb64426317883d8708cb88ce98b39558b27ff6f'],
 [62086,2,0.41484695777169217,4.5,4.9,'454e4368a774ee8f05012abac2280417b78d2e4b55666ceb93ed79517b77984b']
] as const;
export interface UndertowPhase12DRecoveredSourceMesh{
 readonly id:string;readonly sourceComponentKey:string;
 readonly sourceObject:'Fld_Temple01_mesh05_low57_1__FloorLine02';
 readonly sourceMaterial:'Fld_Temple01_FloorLine02';
 readonly originalMinFace:number;readonly pairId:number;
 readonly side:'POSITIVE_Z'|'NEGATIVE_Z';
 readonly originalSource3DAreaSquareMeters:number;
 readonly originalProjectYRangeMeters:readonly[number,number];
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly originalEvidenceAuthority:'PINNED_OBJ_FOUR_RECOVERED_COMPLETE_COMPONENTS_GATE_PASS';
 readonly playableFloorNavCollisionPaintScoringAuthority:'NONE';
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
}
async function decode():Promise<readonly UndertowPhase12DRecoveredSourceMesh[]>{
 if(typeof DecompressionStream==='undefined')throw Error('Phase12D source gzip unavailable');
 const zip=Uint8Array.from(atob(PACKED),x=>x.charCodeAt(0));
 const copy=new ArrayBuffer(zip.byteLength);new Uint8Array(copy).set(zip);
 const raw=await new Response(new Blob([copy]).stream().pipeThrough(
    new DecompressionStream('gzip'))).arrayBuffer();
 if(raw.byteLength!==704)throw Error('Phase12D original 8-face packed Float64 evidence drift');
 const dv=new DataView(raw),result:UndertowPhase12DRecoveredSourceMesh[]=[];
 let off=0;
 for(const [minFace,pairId,area,yMin,yMax,hash] of ROWS){
  const faces:number[]=[],originalOBJVertexIdTriples:number[][]=[],vertices:StageVector3[]=[];
  for(let f=0;f<2;f++){
   const id=dv.getUint32(off,true);
   faces.push(id);
   originalOBJVertexIdTriples.push([dv.getUint32(off+4,true),
     dv.getUint32(off+8,true),dv.getUint32(off+12,true)]);
   for(let v=0;v<3;v++){
    const p:StageVector3=[dv.getFloat64(off+16+v*24,true),
       dv.getFloat64(off+24+v*24,true),dv.getFloat64(off+32+v*24,true)];
    if(p.some(x=>!Number.isFinite(x)))throw Error('Phase12D nonfinite original');
    vertices.push(p);
   }
   off+=88;
  }
  if(faces[0]!==minFace||faces[1]!==minFace+1)
    throw Error('Phase12D wrong original face sequence');
  const meanZ=vertices.reduce((s,x)=>s+x[2],0)/vertices.length;
  result.push(Object.freeze({
   id:'t21-phase12d-recovered-original-'+minFace,
   sourceComponentKey:'Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|original-minface-'+minFace,
   sourceObject:'Fld_Temple01_mesh05_low57_1__FloorLine02' as const,
   sourceMaterial:'Fld_Temple01_FloorLine02' as const,
   originalMinFace:minFace,pairId,
   side:meanZ>=0?'POSITIVE_Z' as const:'NEGATIVE_Z' as const,
   originalSource3DAreaSquareMeters:area,
   originalProjectYRangeMeters:[yMin,yMax] as const,
   originalComponentFaceAndOBJVertexIDHash:hash,
   originalGlobalFaceIndices:faces,
   originalOBJVertexIdTriples,vertices,
   originalEvidenceAuthority:'PINNED_OBJ_FOUR_RECOVERED_COMPLETE_COMPONENTS_GATE_PASS' as const,
   playableFloorNavCollisionPaintScoringAuthority:'NONE' as const,
   reviewOnly:true as const,runtimePromotionAuthorized:false as const
  }));
 }
 if(off!==raw.byteLength||result.length!==4||result.reduce((n,c)=>n+c.vertices.length/3,0)!==8)
  throw Error('Phase12D original component count/byte cursor drift');
 return Object.freeze(result);
}
export const UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES=await decode();
export const UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_SUMMARY=Object.freeze({
 originalFullSourceComponentCount:4,mirrorPairCount:2,originalTriangleCount:8,
 original3DTriangleAreaSquareMeters:UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES
   .reduce((s,m)=>s+m.originalSource3DAreaSquareMeters,0),
 existing124DefaultAnd8Phase12COptInUnchanged:true as const,
 defaultVisible:false as const,reviewOnly:true as const,
 gameplayAuthority:'NONE' as const,runtimePromotionAuthorized:false as const
});
export function undertowT21Phase12DRecoveredSourceErrors():readonly string[]{
 const errors:string[]=[],ids=new Set<number>(),faces=new Set<number>();
 const m=UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES;
 if(m.length!==4||m.reduce((n,x)=>n+x.vertices.length/3,0)!==8)
   errors.push('Phase12D expected four complete original components / 8 triangles');
 for(const comp of m){
  if(ids.has(comp.originalMinFace)||comp.vertices.length!==6||
    comp.playableFloorNavCollisionPaintScoringAuthority!=='NONE'||comp.runtimePromotionAuthorized)
    errors.push('Phase12D source component or gameplay authority drift');
  ids.add(comp.originalMinFace);
  for(const id of comp.originalGlobalFaceIndices){
   if(faces.has(id))errors.push('Phase12D duplicate original face '+id);
   faces.add(id);
  }
 }
 for(const pairId of [1,2]){
  const pair=m.filter(x=>x.pairId===pairId);
  if(pair.length!==2||pair[0]!.side===pair[1]!.side||
     Math.abs(pair[0]!.originalSource3DAreaSquareMeters-pair[1]!.originalSource3DAreaSquareMeters)>1e-6)
     errors.push('Phase12D source pair mismatch '+pairId);
 }
 return errors;
}
