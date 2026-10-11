/**
 * F3I opt-in diagnostic backdrop from exact-SHA pinned FldBG OBJ-space faces.
 * Deliberately NO Rapier/Recast/paint/stage mutation imports or permission.
 * Visibility starts OFF until reviewer explicitly requests comparison.
 */
import {BLEND_NORMAL,CULLFACE_NONE,Color,Entity,Mesh,MeshInstance,
 StandardMaterial,type AppBase} from 'playcanvas';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
export type F3iEnvironmentManifest={
 schema:'T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1';
 sourceSHA256:string;verifiedAgainstPinnedSource:boolean;
 coordinateSpace:'ORIGINAL_OBJ_UNREGISTERED';
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 stageCollisionSolidsAdded:0;navigationLinksAdded:0;
 scoreableSurfacesAdded:0;inferredFloorOrRouteAdded:0;
 actorPlacementRecovered:false;environmentStageRegistrationRecovered:false;
 traversalAuthorityRecovered:false;
 backgroundTriangleCount:number;backgroundObjectCount:number;
 backgroundFaceCount:number;backgroundExcludedFaces:number;
 actorObjectCount:number;actorFaceCount:number;actorTriangles:number;
 macroFamilyCount?:number;
 macroAssetFamilies?:readonly {family:string;sourceMeshVariants:number;
  sourceFaces:number;sourceTriangles:number;representativeObject:string;
  representativeTriangles:number}[];
 macroFamilyLedgerAuthoritativeForPlacements?:false;
 largestUnplacedActors:readonly {
  name:string;faces:number;triangles:number;min:number[];max:number[]
 }[];
 previewBin:{file:string;bytes:number;sha256:string};
};
export function auditF3iEnvironmentManifest(m:F3iEnvironmentManifest){
 const values=[m.backgroundTriangleCount,m.backgroundObjectCount,m.backgroundFaceCount,
  m.backgroundExcludedFaces,m.actorObjectCount,m.actorFaceCount,m.actorTriangles];
 if(m.schema!=='T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1'||
   m.sourceSHA256!==T21_F3G_SOURCE_SHA256||
   m.verifiedAgainstPinnedSource!==true||
   m.coordinateSpace!=='ORIGINAL_OBJ_UNREGISTERED'||
   m.stagePlayableAuthority!=='NONE'||m.productionAuthorization!==false||
   m.stageCollisionSolidsAdded!==0||m.navigationLinksAdded!==0||
   m.scoreableSurfacesAdded!==0||m.inferredFloorOrRouteAdded!==0||
   m.actorPlacementRecovered!==false||
   m.environmentStageRegistrationRecovered!==false||
   m.traversalAuthorityRecovered!==false||
   !values.every(v=>Number.isSafeInteger(v)&&v>=0)||
   m.backgroundTriangleCount>180000||m.actorObjectCount>5000||
   m.backgroundExcludedFaces>m.backgroundFaceCount||
   m.actorFaceCount>m.actorTriangles||
   m.largestUnplacedActors.length>24||
   m.largestUnplacedActors.length>m.actorObjectCount||
   m.previewBin.file!=='f3i-environment-obj-space.bin'||
   m.previewBin.bytes!==m.backgroundTriangleCount*36||
   !/^[0-9a-f]{64}$/.test(m.previewBin.sha256))
  throw Error('T21_F3I_UNREGISTERED_OR_UNPINNED_ENVIRONMENT_REJECTED');
 if(m.macroAssetFamilies!==undefined||m.macroFamilyCount!==undefined||
   m.macroFamilyLedgerAuthoritativeForPlacements!==undefined){
  if(!Array.isArray(m.macroAssetFamilies)||
    !Number.isSafeInteger(m.macroFamilyCount)||m.macroFamilyCount<1||
    m.macroFamilyCount>m.actorObjectCount||
    m.macroAssetFamilies.length>24||
    m.macroAssetFamilies.length>m.macroFamilyCount||
    m.macroFamilyLedgerAuthoritativeForPlacements!==false)
   throw Error('T21_F3J_UNPLACED_FAMILY_LEDGER_UNTRUSTED');
  const names=new Set();
  for(const a of m.macroAssetFamilies){
   if(!/^[A-Za-z0-9_.-]{1,128}$/.test(a.family)||
      names.has(a.family)||
      !a.representativeObject.startsWith('FldObj_Temple01_')||
      ![a.sourceMeshVariants,a.sourceFaces,a.sourceTriangles,a.representativeTriangles]
       .every(n=>Number.isSafeInteger(n)&&n>=1)||
      a.representativeTriangles>a.sourceTriangles||
      a.sourceMeshVariants>m.actorObjectCount||
      a.sourceFaces>m.actorFaceCount||a.sourceTriangles>m.actorTriangles)
    throw Error('T21_F3J_UNPLACED_FAMILY_LEDGER_UNTRUSTED');
   names.add(a.family);
  }
 }
 for(const a of m.largestUnplacedActors){
  if(typeof a.name!=='string'||!a.name.startsWith('FldObj_Temple01_')||
     !Number.isSafeInteger(a.faces)||a.faces<1||
     !Number.isSafeInteger(a.triangles)||a.triangles<a.faces||
     !Array.isArray(a.min)||!Array.isArray(a.max)||
     a.min.length!==3||a.max.length!==3||
     a.min.some((v,i)=>!Number.isFinite(v)||v>a.max[i]!)||
     a.max.some(v=>!Number.isFinite(v)))
   throw Error('T21_F3I_INVALID_UNPLACED_ACTOR_INVENTORY');
 }
 return {sourceOnly:true as const,candidateTriangles:m.backgroundTriangleCount,
  actorObjectsAwaitingPlacement:m.actorObjectCount,
  stageSolidsAdded:0 as const,scoreableSurfacesAdded:0 as const};
}
function flatNormals(points:Float32Array){
 const normals=new Float32Array(points.length);
 for(let i=0;i<points.length;i+=9){
  const ax=points[i+3]!-points[i]!,ay=points[i+4]!-points[i+1]!,
   az=points[i+5]!-points[i+2]!;
  const bx=points[i+6]!-points[i]!,by=points[i+7]!-points[i+1]!,
   bz=points[i+8]!-points[i+2]!;
  let x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx;
  const d=Math.hypot(x,y,z)||1;x/=d;y/=d;z/=d;
  for(let j=0;j<9;j+=3){normals[i+j]=x;normals[i+j+1]=y;normals[i+j+2]=z;}
 }
 return normals;
}
/** Returns null only when F3I pack is absent (for older safe F3G packs). */
export async function loadF3iEnvironmentReview(app:AppBase){
 const base=new URL('t21-f3g-source/',document.baseURI).toString();
 const response=await fetch(base+'f3i-environment.json',{cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('T21_F3I_ENVIRONMENT_MANIFEST_HTTP_'+response.status);
 const manifest=await response.json() as F3iEnvironmentManifest;
 const gate=auditF3iEnvironmentManifest(manifest);
 const root=new Entity('T21F3I:OBJ_SPACE_BACKGROUND_UNREGISTERED_VISUAL_ONLY');
 root.enabled=false;
 if(manifest.backgroundTriangleCount>0){
  const meshResponse=await fetch(base+manifest.previewBin.file);
  if(!meshResponse.ok)throw Error('T21_F3I_ENVIRONMENT_BIN_HTTP_'+meshResponse.status);
  const bytes=await meshResponse.arrayBuffer();
  if(bytes.byteLength!==manifest.previewBin.bytes)
   throw Error('T21_F3I_ENVIRONMENT_BYTE_COUNT_DRIFT');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
   .map(b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==manifest.previewBin.sha256)
   throw Error('T21_F3I_ENVIRONMENT_BIN_SHA256_MISMATCH');
  const xyz=new Float32Array(bytes);
  const mesh=new Mesh(app.graphicsDevice);
  mesh.setPositions(xyz);mesh.setNormals(flatNormals(xyz));
  const indices=new Uint32Array(xyz.length/3);
  for(let i=0;i<indices.length;i++)indices[i]=i;
  mesh.setIndices(indices);mesh.update();
  const material=new StandardMaterial();
  material.diffuse=new Color(.35,.43,.50);
  material.emissive=new Color(.04,.055,.068);
  material.opacity=.42;
  material.blendType=BLEND_NORMAL;
  material.depthWrite=false;
  material.cull=CULLFACE_NONE;
  material.update();
  const child=new Entity('T21F3I:UNREGISTERED_BACKGROUND_NOT_WALKABLE');
  child.addComponent('render',{meshInstances:[new MeshInstance(mesh,material)],
   castShadows:false,receiveShadows:false});
  root.addChild(child);
 }
 app.root.addChild(root);
 return {root,manifest,gate};
}