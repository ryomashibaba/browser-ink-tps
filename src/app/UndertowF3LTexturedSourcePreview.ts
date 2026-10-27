/**
 * F3L source UV/albedo mode. Strictly opt-in nonproduction: all source
 * triangles are exactly the original registered static OBJ; the texture
 * information conveys only appearance, not collision or paint authority.
 */
import {ADDRESS_REPEAT,BLEND_NONE,BLEND_NORMAL,CULLFACE_NONE,Color,Entity,
 FILTER_LINEAR,FILTER_LINEAR_MIPMAP_LINEAR,Mesh,MeshInstance,
 StandardMaterial,Texture,SHADERLANGUAGE_GLSL,Vec3,type AppBase} from 'playcanvas';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
import {B256_APERTURE_FOCUS,b256OpticalMaterialEligible}
 from './B256SourceOpticalAperture';
import {traceB257SourceOpticalRays,type B257OpticalMesh}
 from './B257OriginalSourceDepthAudit';
const MTL_BLOB='93b6d30ecac396e960058d6c71db80aadca10fef';
const UPSTREAM_COMMIT='0611f51b35c9736ee986fb2218461e2585b7875e';
const KINDS=['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const;
type Kind=typeof KINDS[number];
/** Display-only masks. CUTAWAY reveals previously drawn certified Rapier
 * stage meshes behind original static optical imagery: it does not
 * designate ANY original OBJ triangle walkable, paintable or scoreable. */
export const F3L_STAGE_READABILITY_MODES=['ORIGINAL_UV','SOURCE_CUTAWAY','INK_SAFE_REVIEW'] as const;
export type F3lStageReadabilityMode=typeof F3L_STAGE_READABILITY_MODES[number];
export function b253VerifiedInkVisualOptIn(
 search:URLSearchParams,originalTriangles:number,verifiedTextures:number
){
 return search.get('t21Play')==='preview'&&
  search.get('t21FullSource')==='review'&&
  search.get('t21B253')==='liveInk'&&
  search.get('t21QaInput')!=='deterministic'&&
  originalTriangles===57578&&Number.isSafeInteger(verifiedTextures)&&
  verifiedTextures>=8&&verifiedTextures<=20;
}
export function f3lSourceReadabilityStyle(kind:Kind,mode:F3lStageReadabilityMode){
 if(mode==='ORIGINAL_UV'){
  const glass=kind==='GLASS';
  return {opacity:glass?.24:1,depthWrite:!glass,opaque:!glass};
 }
 if(mode==='INK_SAFE_REVIEW'){
  // B253: the visually original static UV plane is NOT a registered
  // paintable/physical floor. Keep it behind actual live ink and KCC.
  const alpha:Record<Kind,number>={
   FLOOR:.12,SLOPE:.20,METAL:.43,GLASS:.09,
   SUPPORT:.86,STRUCTURE:.82,DETAIL:.72
  };
  return {opacity:alpha[kind],depthWrite:false,opaque:false};
 }
 const opacity:Record<Kind,number>={
  FLOOR:.18,SLOPE:.22,METAL:.37,GLASS:.08,
  SUPPORT:.40,STRUCTURE:.36,DETAIL:.24
 };
 return {opacity:opacity[kind],depthWrite:false,opaque:false};
}
function applyF3lReadability(material:StandardMaterial,kind:Kind,
 mode:F3lStageReadabilityMode){
 const style=f3lSourceReadabilityStyle(kind,mode);
 material.opacity=style.opacity;
 material.blendType=style.opaque?BLEND_NONE:BLEND_NORMAL;
 material.depthWrite=style.depthWrite;
 material.update();
}
export type F3lManifest={
 schema:'T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1';
 sourceSHA256:string;sourceMtlBlobSha:string;sourceRepositoryCommit:string;
 verifiedAgainstPinnedSource:true;originalVertexUVOnly:true;
 sourceGeometryRegisteredOnlyToOriginalObj:true;
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 actorMatricesRecovered:false;physicsSolidsAdded:0;
 navigationLinksAdded:0;scoreableSurfacesAdded:0;
 totalTriangles:number;triangleCountWithoutSourceUV:number;
 missingUVVertices:number;groupsRequiringFlatFallback:number;
 textureFiles:readonly string[];
 textures:readonly {file:string;bytes:number;sha256:string}[];
 materials:readonly {name:string;kind:Kind;triangles:number;
  file:string;bytes:number;sha256:string;texture:string|null}[];
};
export function auditF3lManifest(m:F3lManifest){
 if(m.schema!=='T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1'||
  m.sourceSHA256!==T21_F3G_SOURCE_SHA256||m.sourceMtlBlobSha!==MTL_BLOB||
  m.sourceRepositoryCommit!==UPSTREAM_COMMIT||
  m.verifiedAgainstPinnedSource!==true||
  m.originalVertexUVOnly!==true||m.sourceGeometryRegisteredOnlyToOriginalObj!==true||
  m.stagePlayableAuthority!=='NONE'||m.productionAuthorization!==false||
  m.actorMatricesRecovered!==false||m.physicsSolidsAdded!==0||
  m.navigationLinksAdded!==0||m.scoreableSurfacesAdded!==0||
  m.totalTriangles!==57578||
  !Number.isSafeInteger(m.triangleCountWithoutSourceUV)||
  m.triangleCountWithoutSourceUV<0||m.triangleCountWithoutSourceUV>2000||
  !Number.isSafeInteger(m.missingUVVertices)||m.missingUVVertices<0||
  !Number.isSafeInteger(m.groupsRequiringFlatFallback)||
  m.groupsRequiringFlatFallback<0||m.groupsRequiringFlatFallback>54||
  !Array.isArray(m.materials)||m.materials.length<10||m.materials.length>54||
  !Array.isArray(m.textureFiles)||m.textureFiles.length>20||
  !Array.isArray(m.textures)||m.textures.length!==m.textureFiles.length)
  throw Error('T21_F3L_ORIGINAL_SOURCE_UV_NOT_AUTHORIZED');
 const materials=new Set(),textures=new Set<string>();
 let total=0;
 for(let i=0;i<m.materials.length;i++){
  const a=m.materials[i]!;
  if(!/^Fld_Temple01_[A-Za-z0-9_.-]+$/.test(a.name)||
     materials.has(a.name)||!KINDS.includes(a.kind)||
     a.file!=='f3l-original-uv-'+String(i+1).padStart(2,'0')+'.bin'||
     !Number.isSafeInteger(a.triangles)||a.triangles<1||
     !Number.isSafeInteger(a.bytes)||a.bytes!==a.triangles*60||
     !/^[0-9a-f]{64}$/.test(a.sha256)||
     (a.texture!==null&&!/^[A-Za-z0-9_.-]+_Alb\.png$/.test(a.texture)))
   throw Error('T21_F3L_INVALID_SOURCE_MATERIAL_MESH');
  materials.add(a.name);total+=a.triangles;
  if(a.texture)textures.add(a.texture);
 }
 if(total!==57578)throw Error('T21_F3L_MATERIAL_GEOMETRY_PARITY_FAILURE');
 for(const item of m.textures){
  if(!/^[A-Za-z0-9_.-]+_Alb\.png$/.test(item.file)||
     !Number.isSafeInteger(item.bytes)||item.bytes<60||item.bytes>10000000||
     !/^[0-9a-f]{64}$/.test(item.sha256)||
     textures.has('seen:'+item.file))
   throw Error('T21_F3L_UNTRUSTED_SOURCE_TEXTURE');
  textures.add('seen:'+item.file);
 }
 const expected=[...textures].filter(x=>!x.startsWith('seen:')).sort();
 const files=[...m.textureFiles].sort();
 if(expected.length!==files.length||expected.some((name,i)=>name!==files[i])||
    m.textures.some(t=>!files.includes(t.file)))
  throw Error('T21_F3L_TEXTURE_LIST_DRIFT');
 return {triangles:total,materialGroups:m.materials.length,
  verifiedTextures:files.length,physicsSolidsAdded:0 as const,
  sourceOnly:true as const,productionAuthorized:false as const};
}
function normals(points:Float32Array){
 const n=new Float32Array(points.length);
 for(let i=0;i<points.length;i+=9){
  const ax=points[i+3]!-points[i]!,ay=points[i+4]!-points[i+1]!,
   az=points[i+5]!-points[i+2]!;
  const bx=points[i+6]!-points[i]!,by=points[i+7]!-points[i+1]!,
   bz=points[i+8]!-points[i+2]!;
  let x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx;
  const d=Math.hypot(x,y,z)||1;x/=d;y/=d;z/=d;
  for(let k=0;k<9;k+=3){n[i+k]=x;n[i+k+1]=y;n[i+k+2]=z;}
 }
 return n;
}
async function verifiedBuffer(url:string,bytes:number,hash:string){
 const r=await fetch(url,{cache:'no-store'});
 if(!r.ok)throw Error('F3L_MISSING_ORIGINAL_SOURCE_'+r.status);
 const b=await r.arrayBuffer();
 if(b.byteLength!==bytes)throw Error('F3L_SOURCE_FILE_SIZE_MISMATCH');
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)))
  .map(n=>n.toString(16).padStart(2,'0')).join('');
 if(sha!==hash)throw Error('F3L_SOURCE_FILE_HASH_MISMATCH');
 return b;
}

/** Exactly PlayCanvas 2.22.1's standard opacityPS plus one screen-local
 * render-only attenuation term. This changes NO mesh vertices/UV/authority.
 * Never install except under explicit B256 nonproduction URL. */
const B256_OPACITY_GLSL=`
uniform float material_opacity;
uniform float material_alphaDitherScale;
uniform vec4 b256Aperture;
uniform vec2 b256InvViewport;
uniform float b256ApertureStrength;
void getOpacity() {
 dAlpha = material_opacity;
 #ifdef STD_OPACITY_TEXTURE
 dAlpha *= texture2DBias({STD_OPACITY_TEXTURE_NAME}, {STD_OPACITY_TEXTURE_UV}, textureBias).{STD_OPACITY_TEXTURE_CHANNEL};
 #endif
 #ifdef STD_OPACITY_VERTEX
 dAlpha *= clamp(vVertexColor.{STD_OPACITY_VERTEX_CHANNEL}, 0.0, 1.0);
 #endif
 vec2 screenUv=gl_FragCoord.xy*b256InvViewport;
 float aperture=1.0-smoothstep(0.57,1.0,
  length((screenUv-b256Aperture.xy)/b256Aperture.zw));
 dAlpha*=1.0-b256ApertureStrength*aperture;
}
`;
const BASE_COLOR:Record<Kind,[number,number,number]>={
 FLOOR:[.46,.53,.59],SLOPE:[.64,.59,.47],METAL:[.40,.47,.51],
 GLASS:[.32,.67,.76],SUPPORT:[.54,.57,.59],STRUCTURE:[.49,.53,.56],
 DETAIL:[.66,.65,.56]
};
export async function loadF3lTexturedSource(
 app:AppBase,b256Research=false,b257Research=false){
 const base=new URL('t21-f3g-source/',document.baseURI).toString();
 const response=await fetch(base+'f3l-original-textured.json',{cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('T21_F3L_ORIGINAL_MATERIAL_PACK_HTTP_'+response.status);
 const manifest=await response.json() as F3lManifest;
 const gate=auditF3lManifest(manifest);
 const root=new Entity('T21F3L:PINNED_UV_TEXTURES_VISUAL_ONLY');
 root.enabled=false;
 const gpuTextures:Texture[]=[];
 const textureMap=new Map<string,Texture>();
 const materialInstances:{kind:Kind;material:StandardMaterial}[]=[];
 const b256Materials:StandardMaterial[]=[];
 const b257OriginalStaticMeshes:B257OpticalMesh[]=[];
 let b256ApertureRequested=false;
 const applyB256=(width:number,height:number)=>{
  if(width<=0||height<=0||!Number.isFinite(width)||!Number.isFinite(height))
   throw Error('B256_BAD_VIEWPORT');
  for(const m of b256Materials){
   m.setParameter('b256Aperture',B256_APERTURE_FOCUS);
   m.setParameter('b256InvViewport',new Float32Array([1/width,1/height]));
   m.setParameter('b256ApertureStrength',
    b256ApertureRequested&&visualMode==='INK_SAFE_REVIEW'?.87:0);
  }
 };

 let visualMode:F3lStageReadabilityMode='ORIGINAL_UV';
 try{
  const textures=await Promise.all(manifest.textures.map(async file=>{
   const bytes=await verifiedBuffer(base+'f3l-textures/'+file.file,file.bytes,file.sha256);
   const blobUrl=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
   const img=new Image();
   try{
    await new Promise<void>((ok,no)=>{
     img.onload=()=>ok();
     img.onerror=()=>no(Error('F3L_ORIGINAL_PNG_DECODE_FAILED'));
     img.src=blobUrl;
    });
   }finally{URL.revokeObjectURL(blobUrl);}
   const t=new Texture(app.graphicsDevice,{
    name:'F3L_SOURCE_'+file.file,minFilter:FILTER_LINEAR_MIPMAP_LINEAR,
    magFilter:FILTER_LINEAR,addressU:ADDRESS_REPEAT,addressV:ADDRESS_REPEAT,
    mipmaps:true
   });
   t.setSource(img);
   gpuTextures.push(t);
   return [file.file,t] as const;
  }));
  for(const [name,tex] of textures)textureMap.set(name,tex);
  for(const material of manifest.materials){
   const buf=await verifiedBuffer(base+material.file,material.bytes,material.sha256);
   const floats=new Float32Array(buf);
   const pos=new Float32Array(material.triangles*9);
   const uv=new Float32Array(material.triangles*6);
   for(let i=0,j=0,k=0;i<floats.length;i+=5){
    pos[j++]=floats[i]!;pos[j++]=floats[i+1]!;pos[j++]=floats[i+2]!;
    uv[k++]=floats[i+3]!;uv[k++]=floats[i+4]!;
   }
   const mesh=new Mesh(app.graphicsDevice);
   mesh.setPositions(pos);mesh.setNormals(normals(pos));mesh.setUvs(0,uv);
   const idx=new Uint32Array(pos.length/3);
   for(let i=0;i<idx.length;i++)idx[i]=i;
   mesh.setIndices(idx);mesh.update();
   // Only exact, already SHA256-verified source position buffers. No
   // inferred instance transform or synthetic collision.
   if(b257Research)b257OriginalStaticMeshes.push({
    name:material.name,kind:material.kind,vertices:pos
   });
   const m=new StandardMaterial();
   const [red,green,blue]=BASE_COLOR[material.kind];
   const tex=material.texture?textureMap.get(material.texture):undefined;
   m.diffuse=new Color(...(tex?[1,1,1] as [number,number,number]:
    [red,green,blue] as [number,number,number]));
   if(tex)m.diffuseMap=tex;
   m.cull=CULLFACE_NONE;
   m.useMetalness=true;m.metalness=material.kind==='METAL'?.32:.10;
   m.gloss=material.kind==='METAL'?.48:.23;
   applyF3lReadability(m,material.kind,visualMode);
   if(b256Research&&b256OpticalMaterialEligible(material.kind)){
    m.getShaderChunks(SHADERLANGUAGE_GLSL).set('opacityPS',B256_OPACITY_GLSL);
    m.shaderChunksVersion='2.22';
    m.update();
    b256Materials.push(m);
    m.setParameter('b256Aperture',B256_APERTURE_FOCUS);
    m.setParameter('b256InvViewport',new Float32Array([1,1]));
    m.setParameter('b256ApertureStrength',0);
   }
   materialInstances.push({kind:material.kind,material:m});
   const object=new Entity('T21F3L:ORIGINAL_STATIC_'+material.name+'_NO_COLLISION');
   object.addComponent('render',{meshInstances:[new MeshInstance(mesh,m)],
    castShadows:false,receiveShadows:false});
   root.addChild(object);
  }
 }catch(err){
  root.destroy();for(const t of gpuTextures)t.destroy();
  throw err;
 }
 app.root.addChild(root);
 return {
  root,manifest,gate,disable(){root.enabled=false;},
  getReadabilityMode:()=>visualMode,
  setReadabilityMode(mode:F3lStageReadabilityMode){
   if(!F3L_STAGE_READABILITY_MODES.includes(mode))
    throw Error('T21_W10B30_INVALID_SOURCE_REVIEW_VISUAL_MODE');
   if(mode===visualMode)return visualMode;
   for(const entry of materialInstances)
    applyF3lReadability(entry.material,entry.kind,mode);
   visualMode=mode;
   // A different research UV mode must never retain an invisible aperture.
   if(b256Research)applyB256(app.graphicsDevice.width,app.graphicsDevice.height);
   return visualMode;
  },
  auditB257OriginalStaticRay(from:Vec3,to:Vec3){
   if(!b257Research||b257OriginalStaticMeshes.length!==manifest.materials.length)
    throw Error('B257_ORIGINAL_OPTICAL_MESHES_NOT_VERIFIED');
   return traceB257SourceOpticalRays(b257OriginalStaticMeshes,from,to);
  },
  setB256OpticalAperture(on:boolean,width:number,height:number){
   if(!b256Research||b256Materials.length===0||
      (on&&visualMode!=='INK_SAFE_REVIEW'))
    throw Error('B256_NOT_VERIFIED_INK_SAFE_OPTICAL_REVIEW');
   b256ApertureRequested=on;
   applyB256(width,height);
   return {enabled:on,affectedMaterialGroups:b256Materials.length,
    sourceTrianglesUnchanged:57578,originalUvAltered:false,
    physicalSolidsAdded:0,navLinksAdded:0,scoreablesAdded:0,
    researchOnly:true,productionAuthorized:false};
  },
  b30NonGameplayAuthority:{
   fullOriginalSourceTriangles:57578,
   originalUVAndAlbedoUnmodified:true as const,
   sourceOpticalOnly:true as const,
   newCollision:0 as const,
   newNavigation:0 as const,
   scoredTurf:0 as const,
   actorInstanceTransformsRecovered:false as const,
   playableSourceFootpathsCertified:false as const,
   productionAuthorized:false as const
  }
 };
}