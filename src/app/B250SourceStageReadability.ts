/** B250: SOURCE gameplay visual/collision truth (registered materials and
 * exact pinned Glass01 broad-vs-optical triangle display only).
 * No source positions, collision meshes, gameplay paint, physics or nav. */
import {BLEND_NORMAL,CULLFACE_NONE,calculateNormals,Color,Entity,Mesh,
 MeshInstance,StandardMaterial,type AppBase,type Material} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import type {StageDefinition,StageMaterialKey,StageSolidDefinition,
 StageTriangleMeshGeometry,StageVector3}
 from '../stage/StageDefinition';
import {stageSolidTriangleWorldVertices} from '../stage/StageTriangleMesh';
/**
 * The pinned upper-glass visual shell is 102 triangles/side, but only 94
 * triangles/side are in the registered Rapier collision role. Never display
 * all 102 as an equally opaque "walkable" surface.
 *
 * Exact indices, original vertices and frozen role SOLIDS are checked before
 * any visual split. The remaining 8 triangles are optical-only, NOT a floor.
 */
export function b250GlassSourceVisibilityPartition(
 stage:StageDefinition,visual:StageSolidDefinition
):{registered:StageTriangleMeshGeometry;
    opticalOnly:StageTriangleMeshGeometry}|null{
 const match=/^UndertowT21D:upper-glass-(positive-z|negative-z):visual$/
  .exec(visual.id);
 if(!match)return null;
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||visual.render!==true||
    visual.collisionEnabled!==false||visual.navigationEnabled!==false||
    !visual.triangleMesh)
  throw Error('B250_GLASS_PINNED_SOURCE_STAGE_REQUIRED');
 const root='UndertowT21D:upper-glass-'+match[1];
 const collision=stage.solids.find(s=>
  s.id===root+':pass15d-broad-collision-query-runtime');
 const navigation=stage.solids.find(s=>
  s.id===root+':pass15d-broad-navigation-runtime');
 const actual=visual.triangleMesh;
 const broad=collision?.triangleMesh;
 const nav=navigation?.triangleMesh;
 const broadLength=94*3;
 if(!collision||!broad||collision.render!==false||
    collision.collisionEnabled!==true||
    collision.navigationEnabled!==false||
    !navigation||navigation.render!==false||
    navigation.collisionEnabled!==false||
    navigation.navigationEnabled!==true||
    !nav||nav.indices.length!==46*3||
    actual.indices.length!==102*3||broad.indices.length!==broadLength||
    // Same pinned exact-source vertices, never a similarity-based mesh snap.
    actual.vertices!==broad.vertices||actual.vertices!==nav.vertices||
    broad.indices.some((index,i)=>index!==actual.indices[i]))
  throw Error('B250_GLASS_COLLISION_TRIANGLE_AUTHORITY_MISMATCH');
 return {
  registered:{vertices:actual.vertices,indices:actual.indices.slice(0,broadLength)},
  opticalOnly:{vertices:actual.vertices,indices:actual.indices.slice(broadLength)}
 };
}
function b250ExactSourceMesh(app:AppBase,
 data:StageTriangleMeshGeometry):Mesh{
 const positions=data.vertices.flatMap(([x,y,z]:StageVector3)=>[x,y,z]);
 const indices=[...data.indices];
 const mesh=new Mesh(app.graphicsDevice);
 mesh.setPositions(new Float32Array(positions));
 mesh.setNormals(new Float32Array(calculateNormals(positions,indices)));
 mesh.setIndices(new Uint32Array(indices));
 mesh.update();
 return mesh;
}
function b250OpticalOnlyMaterial():StandardMaterial{
 const m=new StandardMaterial();
 m.diffuse=new Color(.84,.59,.34);
 m.emissive=new Color(.09,.055,.026);
 m.blendType=BLEND_NORMAL;m.opacity=.13;m.depthWrite=false;
 m.cull=CULLFACE_NONE;m.useMetalness=false;m.gloss=.14;
 m.update();
 return m;
}
/** Existing registered inkable surfaces only; purely visual SOURCE neutral.
 * No new polygons, collision roles, ink ownership or Turf scoreability. */
export const B250_REGISTERED_SOURCE_NEUTRAL=
 Object.freeze([.42,.49,.54] as const);

/** Registered zero-thickness source collision triangles can be hit from
 * either side by Rapier, but the default opaque material back-face culls.
 * Display exactly those existing faces from both sides in human SOURCE.
 * Glass is eligible ONLY after B250 proves the 94-face/side partition.
 * Never two-side an optical-only face as though it were registered. */
export function b250CollisionFaceNeedsTwoSidedDraw(
 solid:Pick<StageSolidDefinition,'triangleMesh'|'collisionEnabled'>,
 verifiedRegisteredGlassSubset:boolean
):boolean{
 return !!solid.triangleMesh&&(
  solid.collisionEnabled!==false||verifiedRegisteredGlassSubset);
}

export type B250Band='LOWER'|'MIDDLE'|'UPPER';
/** Actual world-space vertical band of an EXISTING source render mesh.
 * A registered slope can have center.y===0 despite vertices at Y=3..4.5.
 * The center transform is still used for ordinary frozen footprint boxes.
 * This is visual classification only, never a collision / support claim. */
export function b250SolidVisualElevationMeters(
 s:Pick<StageSolidDefinition,'center'|'triangleMesh'|'rotationEulerDegrees'>
):number{
 if(!s.triangleMesh)return s.center[1];
 const world=stageSolidTriangleWorldVertices(s);
 if(!world.length)return s.center[1];
 const y=world.map(vertex=>vertex[1]);
 return (Math.min(...y)+Math.max(...y))*.5;
}
export function b250SolidTone(
 s:Pick<StageSolidDefinition,'center'|'material'|'triangleMesh'|'rotationEulerDegrees'>,
 min:number,max:number
):{band:B250Band;rgb:readonly [number,number,number]}{
 const y=b250SolidVisualElevationMeters(s);
 if(![y,min,max].every(Number.isFinite))throw Error('B250_BAD_SOURCE_Y');
 const r=max-min>1e-5?Math.max(0,Math.min(1,(y-min)/(max-min))):.5;
 const band:B250Band=r<.34?'LOWER':r<.68?'MIDDLE':'UPPER';
 const colors:Record<StageMaterialKey,readonly [number,number,number]>={
  dark:[.27,.32,.38],medium:[.36,.42,.47],
  light:[.46,.52,.57],accent:[.31,.60,.68]};
 const lift=band==='UPPER'?.11:band==='MIDDLE'?.055:0;
 const rgb=colors[s.material].map(x=>Math.min(1,x+lift)) as [number,number,number];
 return {band,rgb};
}
export type B250SourceView={
 setEnabled:(on:boolean)=>void;
 snapshot:()=>{enabled:boolean;sourceSolids:25;renderSolids:number;
  materialBindings:number;bands:Record<B250Band,number>;
  glassRegisteredCollisionTriangles:number;
  glassExcludedOpticalTriangles:number;
  authority:'25/17/26/0';productionAuthorized:false};
};
export function installB250SourceView(app:AppBase,camera:Entity,
 stage:StageDefinition):B250SourceView{
 if(stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26)
  throw Error('B250_IMMUTABLE_SOURCE_REQUIRED');
 const root=app.root.findByName('StageRoot');
 if(!root||!camera.camera)throw Error('B250_REGISTERED_RENDER_ROOT_MISSING');
 const visible=stage.solids.filter(s=>s.render);
 const elevations=visible.map(b250SolidVisualElevationMeters);
 const min=Math.min(...elevations);
 const max=Math.max(...elevations);
 const originalAmbient=app.scene.ambientLight.clone();
 const originalClear=camera.camera.clearColor.clone();
 const bindings:{mesh:MeshInstance;before:Material;after:StandardMaterial}[]=[];
 // The opaque ink shader draws over the registered floor's StandardMaterial:
 // tinting ONLY that underneath material cannot improve SOURCE walkability
 // readability. Recolor the existing exact PaintSurface shaders instead.
 // Only original paint backings with registered collision are eligible.
 const sourcePaintMeshes:MeshInstance[]=[];
 for(const paint of stage.paintSurfaces){
  const backing=stage.solids.find(s=>s.id===paint.backingSolidId);
  if(!backing||backing.collisionEnabled===false)continue;
  const paintEntity=root.findByName('PaintSurface:'+paint.id) as Entity|null;
  const meshes=paintEntity?.render?.meshInstances;
  if(!meshes||meshes.length!==1)
   throw Error('B250_REGISTERED_PAINT_RENDER_MISSING_'+paint.id);
  sourcePaintMeshes.push(meshes[0]!);
 }
 if(!sourcePaintMeshes.length)throw Error('B250_NO_REGISTERED_PAINT_RENDER');
 const originalNeutral=new Float32Array(GAME_CONFIG.visual.neutral);
 const legibleNeutral=new Float32Array(B250_REGISTERED_SOURCE_NEUTRAL);
 const excludedOptical=new Set<MeshInstance>();
 let glassRegisteredCollisionTriangles=0;
 let glassExcludedOpticalTriangles=0;
 const bands:Record<B250Band,number>={LOWER:0,MIDDLE:0,UPPER:0};
 function collect(node:Entity):MeshInstance[]{
  return [...(node.render?.meshInstances??[])
    .filter(mesh=>!excludedOptical.has(mesh)),
   ...node.children.flatMap(c=>collect(c as Entity))];
 }
 for(const s of visible){
  const entity=root.findByName(s.id) as Entity|null;
  if(!entity)throw Error('B250_MISSING_SOURCE_SOLID_RENDER_'+s.id);
  const glass=b250GlassSourceVisibilityPartition(stage,s);
  if(glass){
   const originals=entity.render?.meshInstances;
   if(!originals||originals.length!==1)
    throw Error('B250_GLASS_ORIGINAL_SINGLE_MESH_REQUIRED_'+s.id);
   // Existing visual SOURCE vertices only; collision triangles retain the
   // original material. The excluded 8 per side become faint optical-only.
   const registered=new MeshInstance(
    b250ExactSourceMesh(app,glass.registered),originals[0]!.material);
   const ghost=new MeshInstance(
    b250ExactSourceMesh(app,glass.opticalOnly),b250OpticalOnlyMaterial());
   entity.render!.meshInstances=[registered,ghost];
   excludedOptical.add(ghost);
   glassRegisteredCollisionTriangles+=glass.registered.indices.length/3;
   glassExcludedOpticalTriangles+=glass.opticalOnly.indices.length/3;
  }
  const meshes=collect(entity);
  if(!meshes.length)throw Error('B250_EMPTY_SOURCE_SOLID_RENDER_'+s.id);
  const tone=b250SolidTone(s,min,max);
  bands[tone.band]++;
  const m=new StandardMaterial();
  m.diffuse=new Color(...tone.rgb);
  m.emissive=new Color(tone.rgb[0]*.07,tone.rgb[1]*.08,tone.rgb[2]*.09);
  // P1: the exact original ramp / approved glass collision triangles are
  // zero thickness in the render mesh. Rapier can block the character
  // from either side, so never make its registered underside invisible.
  // The separate 8/side optical-only glass faces stay faint and separate.
  if(b250CollisionFaceNeedsTwoSidedDraw(s,glass!==null))
   m.cull=CULLFACE_NONE;
  m.useMetalness=true;m.metalness=.12;m.gloss=.40;m.update();
  for(const mesh of meshes)bindings.push({mesh,before:mesh.material,after:m});
 }
 let enabled=false;
 const setEnabled=(on:boolean)=>{
  enabled=on;
  for(const b of bindings)b.mesh.material=on?b.after:b.before;
  for(const mesh of sourcePaintMeshes)
   mesh.material.setParameter('uNeutralColor',
    on?legibleNeutral:originalNeutral);
  app.scene.ambientLight=on?new Color(.71,.77,.83):originalAmbient;
  camera.camera!.clearColor=on?new Color(.10,.15,.20,1):originalClear;
 };
 setEnabled(true);
 return {setEnabled,snapshot:()=>({
  enabled,sourceSolids:25 as const,renderSolids:visible.length,
  materialBindings:bindings.length,bands:{...bands},
  glassRegisteredCollisionTriangles,glassExcludedOpticalTriangles,
  authority:'25/17/26/0' as const,productionAuthorized:false as const
 })};
}
