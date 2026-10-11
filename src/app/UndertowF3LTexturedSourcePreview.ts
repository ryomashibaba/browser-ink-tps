/**
 * F3L source UV/albedo mode. Strictly opt-in nonproduction: all source
 * triangles are exactly the original registered static OBJ; the texture
 * information conveys only appearance, not collision or paint authority.
 */
import {ADDRESS_REPEAT,BLEND_NONE,BLEND_NORMAL,CULLFACE_NONE,Color,Entity,
 FILTER_LINEAR,FILTER_LINEAR_MIPMAP_LINEAR,Mesh,MeshInstance,
 StandardMaterial,Texture,type AppBase} from 'playcanvas';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
const MTL_BLOB='93b6d30ecac396e960058d6c71db80aadca10fef';
const UPSTREAM_COMMIT='0611f51b35c9736ee986fb2218461e2585b7875e';
const KINDS=['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const;
type Kind=typeof KINDS[number];
export type F3lManifest={
 schema:'T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1';
 sourceSHA256:string;sourceMtlBlobSha:string;sourceRepositoryCommit:string;
 verifiedAgainstPinnedSource:true;originalVertexUVOnly:true;
 sourceGeometryRegisteredOnlyToOriginalObj:true;
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 actorMatricesRecovered:false;physicsSolidsAdded:0;
 navigationLinksAdded:0;scoreableSurfacesAdded:0;
 totalTriangles:number;triangleCountWithoutSourceUV:0;
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
  m.totalTriangles!==57578||m.triangleCountWithoutSourceUV!==0||
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
const BASE_COLOR:Record<Kind,[number,number,number]>={
 FLOOR:[.46,.53,.59],SLOPE:[.64,.59,.47],METAL:[.40,.47,.51],
 GLASS:[.32,.67,.76],SUPPORT:[.54,.57,.59],STRUCTURE:[.49,.53,.56],
 DETAIL:[.66,.65,.56]
};
export async function loadF3lTexturedSource(app:AppBase){
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
   const m=new StandardMaterial();
   const [red,green,blue]=BASE_COLOR[material.kind];
   const tex=material.texture?textureMap.get(material.texture):undefined;
   m.diffuse=new Color(...(tex?[1,1,1] as [number,number,number]:
    [red,green,blue] as [number,number,number]));
   if(tex)m.diffuseMap=tex;
   m.cull=CULLFACE_NONE;
   m.useMetalness=true;m.metalness=material.kind==='METAL'?.32:.10;
   m.gloss=material.kind==='METAL'?.48:.23;
   if(material.kind==='GLASS'){
    m.opacity=.24;m.blendType=BLEND_NORMAL;m.depthWrite=false;
   }else{
    m.opacity=1;m.blendType=BLEND_NONE;m.depthWrite=true;
   }
   m.update();
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
 return {root,manifest,gate,disable(){root.enabled=false;}};
}