/**
 * F3K isolated original-component showroom, never a game-stage asset loader.
 * Source-local geometry is normalized for inspection; not world registration.
 */
import {CULLFACE_NONE,Color,Entity,Mesh,MeshInstance,StandardMaterial,
 type AppBase} from 'playcanvas';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
export type F3kGalleryManifest={
 schema:'T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1';
 sourceSHA256:string;verifiedAgainstPinnedSource:true;
 sourceGeometrySpace:'ORIGINAL_OBJ_LOCAL_UNPLACED';
 viewerPlacement:'ISOLATED_NORMALIZED_SHOWCASE';
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 instanceMatricesRecovered:false;actorPlacementRecovered:false;
 stageCollisionSolidsAdded:0;navigationLinksAdded:0;
 scoreableSurfacesAdded:0;inferredFloorOrRouteAdded:0;
 components:readonly {
  family:string;representativeObject:string;originalTriangles:number;
  min:number[];max:number[];file:string;bytes:number;sha256:string
 }[];
};
export function auditF3kGalleryManifest(m:F3kGalleryManifest){
 if(m.schema!=='T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1'||
   m.sourceSHA256!==T21_F3G_SOURCE_SHA256||
   m.verifiedAgainstPinnedSource!==true||
   m.sourceGeometrySpace!=='ORIGINAL_OBJ_LOCAL_UNPLACED'||
   m.viewerPlacement!=='ISOLATED_NORMALIZED_SHOWCASE'||
   m.stagePlayableAuthority!=='NONE'||m.productionAuthorization!==false||
   m.instanceMatricesRecovered!==false||m.actorPlacementRecovered!==false||
   m.stageCollisionSolidsAdded!==0||m.navigationLinksAdded!==0||
   m.scoreableSurfacesAdded!==0||m.inferredFloorOrRouteAdded!==0||
   !Array.isArray(m.components)||m.components.length<1||m.components.length>8)
  throw Error('T21_F3K_UNTRUSTED_GALLERY_AUTHORITY');
 let sum=0;
 const families=new Set<string>(),objects=new Set<string>();
 for(let i=0;i<m.components.length;i++){
  const a=m.components[i]!;
  if(!/^[A-Za-z0-9_.-]{1,128}$/.test(a.family)||
     !/^FldObj_Temple01_[A-Za-z0-9_.-]+$/.test(a.representativeObject)||
     families.has(a.family)||objects.has(a.representativeObject)||
     a.file!=='f3k-family-'+String(i+1).padStart(2,'0')+'.bin'||
     !Number.isSafeInteger(a.originalTriangles)||a.originalTriangles<1||
     !Number.isSafeInteger(a.bytes)||a.bytes!==a.originalTriangles*36||
     !/^[0-9a-f]{64}$/.test(a.sha256)||
     !Array.isArray(a.min)||!Array.isArray(a.max)||
     a.min.length!==3||a.max.length!==3||
     a.min.some((v,k)=>!Number.isFinite(v)||Math.abs(v)>10000||v>a.max[k]!)||
     a.max.some(v=>!Number.isFinite(v)||Math.abs(v)>10000))
   throw Error('T21_F3K_INVALID_SOURCE_COMPONENT');
  sum+=a.originalTriangles;
  families.add(a.family);objects.add(a.representativeObject);
 }
 if(sum>100000)throw Error('T21_F3K_SOURCE_MESH_LIMIT');
 return {sourceOnly:true as const,componentCount:m.components.length,
  totalOriginalTriangles:sum,physicalStageEdits:0 as const};
}
function flatNormals(xyz:Float32Array){
 const n=new Float32Array(xyz.length);
 for(let i=0;i<xyz.length;i+=9){
  const ax=xyz[i+3]!-xyz[i]!,ay=xyz[i+4]!-xyz[i+1]!,az=xyz[i+5]!-xyz[i+2]!;
  const bx=xyz[i+6]!-xyz[i]!,by=xyz[i+7]!-xyz[i+1]!,bz=xyz[i+8]!-xyz[i+2]!;
  let x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx;
  const d=Math.hypot(x,y,z)||1;x/=d;y/=d;z/=d;
  for(let q=0;q<9;q+=3){n[i+q]=x;n[i+q+1]=y;n[i+q+2]=z;}
 }
 return n;
}
/** Optional F3K extension to F3G; absent manifest is backwards compatible. */
export async function loadF3kGallery(app:AppBase){
 const base=new URL('t21-f3g-source/',document.baseURI).toString();
 const response=await fetch(base+'f3k-family-gallery.json',{cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('T21_F3K_GALLERY_MANIFEST_HTTP_'+response.status);
 const manifest=await response.json() as F3kGalleryManifest;
 const audit=auditF3kGalleryManifest(manifest);
 const layer=app.scene.layers.getLayerByName('World');
 if(!layer)throw Error('T21_F3K_MISSING_WORLD_RENDER_LAYER');
 const root=new Entity('T21F3K:ISOLATED_SOURCE_GEOMETRY_NOT_ON_STAGE');
 const galleryCamera=new Entity('T21F3K:NON_GAMEPLAY_ISOLATED_CAMERA');
 galleryCamera.addComponent('camera',{
  clearColor:new Color(.018,.033,.055,1),nearClip:.1,farClip:160,
  fov:58,layers:[layer.id]
 });
 galleryCamera.setPosition(926,109,934);
 galleryCamera.lookAt(900,90,900);
 galleryCamera.enabled=false;
 root.setPosition(900,90,900);
 root.enabled=false;
 const models:Entity[]=[];
 try{
  for(const component of manifest.components){
   const binResponse=await fetch(base+component.file);
   if(!binResponse.ok)throw Error('T21_F3K_BIN_MISSING_'+component.file);
   const bytes=await binResponse.arrayBuffer();
   if(bytes.byteLength!==component.bytes)
    throw Error('T21_F3K_BINARY_SIZE_DRIFT_'+component.file);
   const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
    .map(x=>x.toString(16).padStart(2,'0')).join('');
   if(sha!==component.sha256)throw Error('T21_F3K_BINARY_HASH_DRIFT_'+component.file);
   const source=new Float32Array(bytes);
   const center=component.min.map((v,i)=>(v+component.max[i]!)/2);
   const size=Math.max(.0001,...component.min.map((v,i)=>component.max[i]!-v));
   const normalized=new Float32Array(source.length);
   for(let i=0;i<source.length;i++){
    normalized[i]=(source[i]!-center[i%3]!)*(18/size);
    if(!Number.isFinite(normalized[i]))throw Error('T21_F3K_BAD_NORMALIZED_VERTEX');
   }
   const mesh=new Mesh(app.graphicsDevice);
   mesh.setPositions(normalized);mesh.setNormals(flatNormals(normalized));
   const idx=new Uint32Array(normalized.length/3);
   for(let i=0;i<idx.length;i++)idx[i]=i;
   mesh.setIndices(idx);mesh.update();
   const material=new StandardMaterial();
   material.diffuse=new Color(.35,.75,.85);
   material.emissive=new Color(.045,.075,.09);
   material.gloss=.36;material.cull=CULLFACE_NONE;material.update();
   const model=new Entity('T21F3K:UNPLACED_'+component.family+'_NO_COLLIDER');
   model.addComponent('render',{meshInstances:[new MeshInstance(mesh,material)],
    castShadows:false,receiveShadows:false});
   model.enabled=false;
   root.addChild(model);
   models.push(model);
  }
 }catch(error){root.destroy();galleryCamera.destroy();throw error;}
 app.root.addChild(root);
 app.root.addChild(galleryCamera);
 return {root,camera:galleryCamera,manifest,audit,
  open(index:number){
   if(!Number.isSafeInteger(index)||index<0||index>=models.length)
    throw Error('T21_F3K_INVALID_GALLERY_INDEX');
   for(let i=0;i<models.length;i++)models[i]!.enabled=i===index;
   root.enabled=true;galleryCamera.enabled=true;
   return manifest.components[index]!;
  },
  close(){
   galleryCamera.enabled=false;root.enabled=false;
   for(const model of models)model.enabled=false;
  }
 };
}