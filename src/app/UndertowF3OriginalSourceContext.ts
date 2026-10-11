/**
 * F3 strictly optical original Temple01 structure context.
 * Only complete previously pinned source triangles. These surfaces may be
 * visually open and are NOT solid, paintable, navigable, or source-gameplay
 * bindings. They do not mutate the 25-solid frozen runtime package.
 */
import {
 BLEND_NORMAL,CULLFACE_NONE,calculateNormals,Color,Entity,Mesh,
 MeshInstance,StandardMaterial,type AppBase
} from 'playcanvas';
import {UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import {UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS}
 from '../stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import type {StageVector3} from '../stage/StageDefinition';

interface SourceVisual{
 id:string;
 vertices:readonly StageVector3[];
 kind:'SUPPORT'|'FRAME'|'TOWER'|'PILLAR';
 verified:true;
}
export function originalF3StructuralInventory():readonly SourceVisual[]{
 const framed=UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.map(mesh=>{
  if(mesh.runtimePromotionAuthorized!==false||
   mesh.gameplayCollisionPaintNavAuthority!=='NONE')
   throw Error('T21_F3_PHASE7_SOURCE_AUTHORITY_DRIFT');
  return {
   id:mesh.id,vertices:mesh.vertices,
   kind:mesh.kind==='SIDE_SUPPORT'?'SUPPORT' as const:'FRAME' as const,
   verified:true as const
  };
 });
 const upper=UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES
  .filter(mesh=>mesh.kind!=='SIDE_EDGE_LINER').map(mesh=>{
   if(mesh.runtimePromotionAuthorized!==false||
    mesh.floorCollisionPaintNavScoringAuthority!=='NONE')
    throw Error('T21_F3_PHASE8_SOURCE_AUTHORITY_DRIFT');
   return {
    id:mesh.id,vertices:mesh.vertices,kind:'TOWER' as const,
    verified:true as const
   };
  });
 const original=UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS.map(mesh=>{
  if(mesh.runtimePromotionAuthorized!==false||
   mesh.gameplayFloorCollisionPaintNavScoringAuthority!=='NONE')
   throw Error('T21_F3_PHASE12I_SOURCE_AUTHORITY_DRIFT');
  return {
   id:mesh.id,vertices:mesh.vertices,kind:'PILLAR' as const,
   verified:true as const
  };
 });
 const all=[...framed,...upper,...original];
 if(framed.length!==20||upper.length!==12||original.length!==6||
    new Set(all.map(m=>m.id)).size!==38)
  throw Error('T21_F3_ORIGINAL_STRUCTURE_INVENTORY_DRIFT');
 for(const m of all)if(m.vertices.length<3||m.vertices.length%3!==0||
    m.vertices.some(v=>v.length!==3||v.some(n=>!Number.isFinite(n))))
  throw Error('T21_F3_NONFINITE_OR_INCOMPLETE_ORIGINAL_STRUCTURE_'+m.id);
 return all;
}
function makeSourceMaterial(kind:SourceVisual['kind']){
 const palette={
  SUPPORT:new Color(.18,.59,.68),FRAME:new Color(.47,.82,.90),
  TOWER:new Color(.42,.53,.66),PILLAR:new Color(.52,.67,.73)
 };
 const tint=palette[kind];
 const m=new StandardMaterial();
 m.diffuse=tint;
 m.emissive=new Color(tint.r*.08,tint.g*.10,tint.b*.12);
 m.blendType=BLEND_NORMAL;
 m.opacity=kind==='FRAME'?.38:.64;
 m.depthWrite=false;
 m.cull=CULLFACE_NONE;
 m.useMetalness=true;m.metalness=.28;m.gloss=.38;
 m.update();return m;
}
export function buildF3OriginalOpticalStructures(app:AppBase){
 const manifest=originalF3StructuralInventory();
 const root=new Entity('T21F3:ORIGINAL_SOURCE_STRUCTURES_VISUAL_ONLY');
 const materials={
  SUPPORT:makeSourceMaterial('SUPPORT'),
  FRAME:makeSourceMaterial('FRAME'),
  TOWER:makeSourceMaterial('TOWER'),
  PILLAR:makeSourceMaterial('PILLAR')
 };
 app.root.addChild(root);
 for(const source of manifest){
  const positions=source.vertices.flatMap(v=>[v[0],v[1],v[2]]);
  const indices=positions.map((_,i)=>i).slice(0,positions.length/3);
  const mesh=new Mesh(app.graphicsDevice);
  mesh.setPositions(new Float32Array(positions));
  mesh.setNormals(new Float32Array(calculateNormals(positions,indices)));
  mesh.setIndices(new Uint32Array(indices));
  mesh.update();
  const instance=new MeshInstance(mesh,materials[source.kind]);
  const node=new Entity('T21F3:ORIGINAL_OPTICAL:'+source.id);
  node.addComponent('render',{
   meshInstances:[instance],castShadows:false,receiveShadows:false
  });
  root.addChild(node);
 }
 return {
  root,manifest:{
   originalSourceVisualStructures:manifest.length,
   originalSourceTriangles:manifest.reduce(
    (n,m)=>n+m.vertices.length/3,0),
   sourceCollisionPaintNavigationAdded:false as const,
   releaseAuthorized:false as const
  }
 };
}
