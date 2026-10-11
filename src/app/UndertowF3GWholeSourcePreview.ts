/**
 * F3G: whole pinned static Temple01 architectural source render ONLY.
 *
 * The renderer is explicitly gated ?t21FullSource=review + T21 F3 preview.
 * It reads a *locally generated* exact-SHA pinned binary pack, never
 * downloads game content at page runtime. Missing pack is nonfatal.
 * It has NO Rapier, Recast, ink, collision, paint or stage-authority imports.
 */
import {BLEND_NONE,BLEND_NORMAL,CULLFACE_NONE,Color,Entity,Mesh,MeshInstance,
 StandardMaterial,type AppBase} from 'playcanvas';
const KINDS=['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const;
type Kind=typeof KINDS[number];
export const F3H_SOURCE_VISUAL_MODES=['SOLID','TRAVERSAL','X_RAY'] as const;
export type F3HSourceVisualMode=typeof F3H_SOURCE_VISUAL_MODES[number];
export const T21_F3G_SOURCE_SHA256=
 'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
export type F3GPackManifest={
 schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1';
 sourceSHA256:string;
 verifiedAgainstPinnedSource:boolean;
 includedOriginalTriangles:number;
 groups:readonly {kind:Kind;file:string;triangles:number;bytes:number;sha256:string}[];
 stagePlayableAuthority:'NONE';
 stageCollisionSolidsAdded:0;
 stagePaintSurfacesAdded:0;
 navigationLinksAdded:0;
 scoreableSurfacesAdded:0;
 inferredFloorOrRouteAdded:0;
 productionAuthorization:false;
 // Counts describe only pinned OBJ source triangles, not runtime gameplay.
 coverage?:{staticObjectCount:number;unplacedFldObjFaceCount:number;
  skippedFldBgFaceCount:number;
  regionTriangles:{positiveZ:number;core:number;negativeZ:number};
  actorPlacementRecovered:false;traversalAuthorityRecovered:false};
};
export function auditF3gPackManifest(m:F3GPackManifest){
 if(m.schema!=='T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1'||
    m.sourceSHA256!==T21_F3G_SOURCE_SHA256||
    m.verifiedAgainstPinnedSource!==true||
    !Number.isSafeInteger(m.includedOriginalTriangles)||
    m.includedOriginalTriangles<1500||
    m.stagePlayableAuthority!=='NONE'||
    m.stageCollisionSolidsAdded!==0||m.stagePaintSurfacesAdded!==0||
    m.navigationLinksAdded!==0||m.scoreableSurfacesAdded!==0||
    m.inferredFloorOrRouteAdded!==0||m.productionAuthorization!==false)
  throw Error('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
 const known=new Set<string>();
 let tris=0;
 for(const g of m.groups){
  if(!KINDS.includes(g.kind)||known.has(g.kind)||
     !/^original-(floor|slope|metal|glass|support|structure|detail)\.bin$/.test(g.file)||
     !Number.isSafeInteger(g.triangles)||g.triangles<1||
     !Number.isSafeInteger(g.bytes)||g.bytes!==g.triangles*36||
     !/^[a-f0-9]{64}$/.test(g.sha256))
   throw Error('T21_F3G_UNSAFE_MESH_GROUP');
  known.add(g.kind);tris+=g.triangles;
 }
 if(m.coverage){
  const c=m.coverage;
  if(!Number.isSafeInteger(c.staticObjectCount)||c.staticObjectCount<1||
     !Number.isSafeInteger(c.unplacedFldObjFaceCount)||c.unplacedFldObjFaceCount<0||
     !Number.isSafeInteger(c.skippedFldBgFaceCount)||c.skippedFldBgFaceCount<0||
     ![c.regionTriangles.positiveZ,c.regionTriangles.core,c.regionTriangles.negativeZ]
      .every(v=>Number.isSafeInteger(v)&&v>=0)||
     Object.values(c.regionTriangles).reduce((a,b)=>a+b,0)!==m.includedOriginalTriangles||
     c.actorPlacementRecovered!==false||c.traversalAuthorityRecovered!==false)
   throw Error('T21_F3H_SOURCE_COVERAGE_UNTRUSTED');
 }
 if(tris!==m.includedOriginalTriangles||m.groups.length<3)
  throw Error('T21_F3G_UNVERIFIED_GROUP_TRIANGLE_TOTAL');
 return {sourceTriangles:tris,sourceGroups:m.groups.length,
  renderOnly:true as const,physicalSolidsAdded:0 as const,
  scoreablePromotions:0 as const,productionAuthorized:false as const};
}
const PALETTE:Record<Kind,{rgb:[number,number,number];opacity:number}>={
 FLOOR:{rgb:[.43,.60,.70],opacity:.80},
 SLOPE:{rgb:[.72,.56,.35],opacity:.83},
 METAL:{rgb:[.26,.45,.53],opacity:.86},
 GLASS:{rgb:[.35,.77,.91],opacity:.31},
 SUPPORT:{rgb:[.39,.48,.58],opacity:.92},
 STRUCTURE:{rgb:[.28,.39,.51],opacity:.91},
 DETAIL:{rgb:[.70,.68,.53],opacity:.73}
};
/** Non-authoritative display presets. SOLID fixes the F3G all-transparent
 * no-depth-write appearance. TRAVERSAL highlights source floor but grants no
 * walkability. X_RAY preserves the prior source overlay for comparison. */
export function f3hSourceMaterialStyle(k:Kind,mode:F3HSourceVisualMode){
 const base=PALETTE[k];
 if(mode==='SOLID'){
  const opacity=k==='GLASS' ? .24 : 1;
  return {opacity,depthWrite:k!=='GLASS',opaque:k!=='GLASS'};
 }
 if(mode==='TRAVERSAL'){
  const opacity:Record<Kind,number>={FLOOR:1,SLOPE:1,METAL:.30,
   GLASS:.12,SUPPORT:.16,STRUCTURE:.13,DETAIL:.20};
  return {opacity:opacity[k],depthWrite:k==='FLOOR'||k==='SLOPE',
   opaque:k==='FLOOR'||k==='SLOPE'};
 }
 return {opacity:base.opacity,depthWrite:false,opaque:false};
}
function sourceMaterial(k:Kind){
 const {rgb}=PALETTE[k];
 const m=new StandardMaterial();
 m.diffuse=new Color(...rgb);
 m.emissive=new Color(rgb[0]*.12,rgb[1]*.12,rgb[2]*.12);
 m.cull=CULLFACE_NONE;
 m.useMetalness=true;m.metalness=.22;m.gloss=.27;
 applySourceMaterialStyle(m,k,'SOLID');return m;
}
function applySourceMaterialStyle(m:StandardMaterial,k:Kind,mode:F3HSourceVisualMode){
 const style=f3hSourceMaterialStyle(k,mode);
 m.opacity=style.opacity;
 m.blendType=style.opaque?BLEND_NONE:BLEND_NORMAL;
 m.depthWrite=style.depthWrite;
 m.update();
}
function flatOriginalNormals(pos:Float32Array):Float32Array{
 const normal=new Float32Array(pos.length);
 for(let i=0;i<pos.length;i+=9){
  const ax=pos[i+3]!-pos[i]!,ay=pos[i+4]!-pos[i+1]!,az=pos[i+5]!-pos[i+2]!;
  const bx=pos[i+6]!-pos[i]!,by=pos[i+7]!-pos[i+1]!,bz=pos[i+8]!-pos[i+2]!;
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  const length=Math.hypot(nx,ny,nz)||1;
  nx/=length;ny/=length;nz/=length;
  for(let j=0;j<9;j+=3){
   normal[i+j]=nx;normal[i+j+1]=ny;normal[i+j+2]=nz;
  }
 }
 return normal;
}
export async function loadF3gWholeSource(app:AppBase){
 const base=new URL('t21-f3g-source/',document.baseURI).toString();
 const response=await fetch(base+'manifest.json',{cache:'no-store'});
 if(!response.ok)throw Error('T21_F3G_SOURCE_PACK_NOT_INSTALLED_HTTP_'+response.status);
 const manifest=await response.json() as F3GPackManifest;
 const certification=auditF3gPackManifest(manifest);
 const root=new Entity('T21F3G:WHOLE_ORIGINAL_SOURCE_OPTICAL_ONLY');
 const materials=new Map<Kind,StandardMaterial>();
 root.enabled=false;
 try{
  for(const group of manifest.groups){
   const response=await fetch(base+group.file);
   if(!response.ok)throw Error('T21_F3G_MESH_FILE_MISSING_'+group.kind);
   const bytes=await response.arrayBuffer();
   if(bytes.byteLength!==group.bytes)throw Error('T21_F3G_MESH_BYTE_COUNT_DRIFT');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
    .map(x=>x.toString(16).padStart(2,'0')).join('');
   if(digest!==group.sha256)throw Error('T21_F3G_PINNED_MESH_HASH_MISMATCH');
   const positions=new Float32Array(bytes);
   const mesh=new Mesh(app.graphicsDevice);
   mesh.setPositions(positions);
   mesh.setNormals(flatOriginalNormals(positions));
   const idx=new Uint32Array(positions.length/3);
   for(let i=0;i<idx.length;i++)idx[i]=i;
   mesh.setIndices(idx);mesh.update();
   const entity=new Entity('T21F3G:SOURCE_'+group.kind+'_NOT_WALKABLE');
   const material=sourceMaterial(group.kind);
   materials.set(group.kind,material);
   entity.addComponent('render',{meshInstances:[
    new MeshInstance(mesh,material)
   ],castShadows:false,receiveShadows:false});
   root.addChild(entity);
  }
 }catch(error){root.destroy();throw error;}
 app.root.addChild(root);
 root.enabled=true;
 return {root,manifest,certification,
  setVisualMode(mode:F3HSourceVisualMode){
   if(!F3H_SOURCE_VISUAL_MODES.includes(mode))throw Error('T21_F3H_INVALID_REVIEW_MODE');
   for(const [kind,material] of materials)applySourceMaterialStyle(material,kind,mode);
   return mode;
  }};
}
