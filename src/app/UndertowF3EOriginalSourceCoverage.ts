/**
 * F3E LARGE-BATCH reconstruction of VISUAL GAPS using verified exact OBJ
 * triangles ALREADY extracted from pinned Temple01 source records.
 *
 * This is a cartographic architectural REFERENCE layer, not collision,
 * floor passability, a navigation graph, paint, death, spawn, Turf area
 * or runtime stage promotion. In particular the underpass is still OPEN.
 * No invented wall/bridge/floor polygons, mirror operations, extrusions,
 * vertex interpolation or transforms are permitted.
 */
import {BLEND_NONE,BLEND_NORMAL,CULLFACE_NONE,calculateNormals,Color,Entity,Mesh,
 MeshInstance,StandardMaterial,type AppBase} from 'playcanvas';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES}
 from '../stage/undertow/UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES}
 from '../stage/undertow/UndertowSpillwaySourceNativeSupplementGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES}
 from '../stage/undertow/UndertowSpillwaySourceNativePhase1Geometry';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES}
 from '../stage/undertow/UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES}
 from '../stage/undertow/UndertowSpillwayFlankElevationPhase4Geometry';
import {UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayBroadStaticSourceGeometry';
import {UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES}
 from '../stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import {UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES}
 from '../stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS}
 from '../stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES}
 from '../stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import {UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES}
 from '../stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';

type Shade='CONCRETE'|'SLOPE'|'WALL'|'GLASS'|'SUPPORT'|'HIGH'|'DETAIL';
export interface F3ESourceFace{
 readonly id:string;
 readonly sourceComponentId:string;
 readonly sourceMaterial:string;
 readonly vertices:readonly StageVector3[];
 readonly shade:Shade;
 readonly originalMesh:true;
 readonly collisionPaintNavigationScoreAuthority:'NONE';
}
export interface F3ECoverageManifest{
 readonly sourceComponents:number;
 readonly originalTriangles:number;
 readonly skippedUnplacedActorComponents:number;
 readonly visualOnlyUnderpassRouteComponents:number;
 readonly originalSourceVerticalAdditions:number;
 readonly originalSourceEdgeLinerAdditions:number;
 readonly unresolvedUnderpassOriginalGapMeters:31.71622721122581;
 readonly categories:Readonly<Record<Shade,number>>;
 readonly sourceOnly:true;
 readonly addedPhysicalSolids:0;
 readonly addedPaintSurfaces:0;
 readonly addedNavigationLinks:0;
 readonly inferredCorridorConnections:0;
 readonly productionAuthorized:false;
}
type SourceRecord={
 readonly id:string;
 readonly vertices:readonly StageVector3[];
 readonly sourceMaterial:string;
 readonly runtimePromotionAuthorized:false;
 readonly sourceComponentId?:string;
 readonly sourceComponentKey?:string;
};
const ORIGINAL_STATIC_ROUTE_STUDIES:readonly SourceRecord[]=
 UNDERTOW_UNDERPASS_ROUTE_COMPONENTS
  // Instanced PntSet routes have no independently captured game placement.
  .filter(m=>!m.sourceObject.startsWith('FldObj_'))
  .map(m=>({
   id:m.id,
   sourceComponentId:'PINNED_TEMPLE01_ROUTE:'+m.sourceObject+'|'+m.id,
   sourceMaterial:m.sourceMaterial,
   vertices:m.mesh.indices.map(i=>m.mesh.vertices[i]!),
   runtimePromotionAuthorized:false as const
  }));
const EXTRA_SOURCE_EDGE_LINERS=
 UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES
  .filter(m=>m.kind==='SIDE_EDGE_LINER');
const GROUPS:readonly (readonly SourceRecord[])[]=[
 UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
 UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
 UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,
 UNDERTOW_T21_SOURCE_BATCH2_MESHES,
 UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES,
 UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES,
 UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES,
 UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES,
 UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES,
 UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES,
 UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS,
 // F3 already renders the other 12 Phase8 source pillars and all
 // 20 Phase7/6 Phase12I structures. Do not draw those twice.
 UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES,
 EXTRA_SOURCE_EDGE_LINERS,
 ORIGINAL_STATIC_ROUTE_STUDIES
];
function shade(material:string):Shade{
 if(material.includes('Glass'))return 'GLASS';
 if(material.includes('Pillar')||material.includes('Megalith'))return 'SUPPORT';
 if(material.includes('SealObject'))return 'HIGH';
 if(material.includes('Wall')||material.includes('Fence'))return 'WALL';
 if(material.includes('Slope'))return 'SLOPE';
 if(material.includes('FloorLine'))return 'DETAIL';
 return 'CONCRETE';
}
/** Manifest has to be pure, so frozen original game authority is inspectable
 * in Vitest without a GPU or app. All coordinates are unchanged Float64. */
export function auditF3eSourceCoverage(stage:StageDefinition){
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    frozen.activationReady!==false||
    stage.solids!==frozen.solids||stage.paintSurfaces!==frozen.paintSurfaces||
    stage.navigationLinks!==frozen.navigationLinks||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26)
  throw Error('T21_F3E_IMMUTABLE_STAGE_AUTHORITY_REQUIRED');
 if(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.runtimePromotionAuthorized!==false||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeInclusionReachedTarget!==false)
   throw Error('T21_F3F_FAILED_UNDERPASS_EXPERIMENT_NOT_PHYSICS_AUTHORITY');
 const parts:F3ESourceFace[]=[];
 const seen=new Set<string>();
 let skipped=0;
 for(const group of GROUPS)for(const m of group){
  if(m.runtimePromotionAuthorized!==false)
   throw Error('T21_F3E_ORIGINAL_SOURCE_RUNTIME_PROMOTION_'+m.id);
  // Eight PntSet/FldObj meshes are NOT proven world-space placements.
  // Never draw a hypothetical placed prop/route for these records.
  if(m.sourceMaterial.includes('FldObj_')||
     (m.sourceComponentId??'').startsWith('FldObj_')){
   skipped++;continue;
  }
  const sourceId=m.sourceComponentId??m.sourceComponentKey;
  if(!sourceId||!m.vertices.length||m.vertices.length%3!==0||
     m.vertices.some(v=>v.length!==3||v.some(n=>!Number.isFinite(n))))
   throw Error('T21_F3E_INCOMPLETE_EXACT_SOURCE_'+m.id);
  // No duplicate source geometry even if an old phase imported a later one.
  if(seen.has(sourceId))continue;
  seen.add(sourceId);
  parts.push(Object.freeze({
   id:m.id,sourceComponentId:sourceId,sourceMaterial:m.sourceMaterial,
   vertices:m.vertices,shade:shade(m.sourceMaterial),originalMesh:true as const,
   collisionPaintNavigationScoreAuthority:'NONE' as const
  }));
 }
 if(parts.length<95||skipped!==8)
  throw Error('T21_F3E_ORIGINAL_SOURCE_COVERAGE_REGRESSION '+
   parts.length+'/'+skipped);
 const categories={
  CONCRETE:0,SLOPE:0,WALL:0,GLASS:0,SUPPORT:0,HIGH:0,DETAIL:0
 };
 for(const p of parts)categories[p.shade]++;
 const manifest:F3ECoverageManifest=Object.freeze({
  sourceComponents:parts.length,
  originalTriangles:parts.reduce((n,p)=>n+p.vertices.length/3,0),
  skippedUnplacedActorComponents:skipped,
  visualOnlyUnderpassRouteComponents:ORIGINAL_STATIC_ROUTE_STUDIES.length,
  originalSourceVerticalAdditions:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.length,
  originalSourceEdgeLinerAdditions:EXTRA_SOURCE_EDGE_LINERS.length,
  unresolvedUnderpassOriginalGapMeters:31.71622721122581,
  categories:Object.freeze(categories),
  sourceOnly:true,addedPhysicalSolids:0,addedPaintSurfaces:0,
  addedNavigationLinks:0,inferredCorridorConnections:0,
  productionAuthorized:false
 });
 return {parts,manifest};
}
/**
 * B28: faithful original-triangle architecture massing, no new geometry.
 * Explicitly do NOT suggest FLOOR or SLOPE passability: they stay
 * translucent in BOTH modes. Only source-backed vertical/static massing
 * draws with a depth-writing opaque material in ARCHITECTURE.
 */
export const F3E_SOURCE_MASSING_MODES=['ARCHITECTURE','HOLOGRAM'] as const;
export type F3eSourceMassingMode=typeof F3E_SOURCE_MASSING_MODES[number];

export function f3eSourceMassingStyle(shade:Shade,mode:F3eSourceMassingMode){
 const reference:Record<Shade,{opacity:number;rgb:[number,number,number]}>={
  CONCRETE:{opacity:.28,rgb:[.42,.66,.79]},
  SLOPE:{opacity:.33,rgb:[.90,.66,.39]},
  WALL:{opacity:.45,rgb:[.56,.73,.87]},
  GLASS:{opacity:.24,rgb:[.26,.80,.92]},
  SUPPORT:{opacity:.47,rgb:[.62,.53,.83]},
  HIGH:{opacity:.38,rgb:[.43,.60,.76]},
  DETAIL:{opacity:.34,rgb:[.95,.87,.37]}
 };
 const mass:Record<Shade,{opacity:number;rgb:[number,number,number];
  opaque:boolean}>={
  CONCRETE:{opacity:.52,rgb:[.44,.55,.61],opaque:false},
  SLOPE:{opacity:.44,rgb:[.65,.57,.41],opaque:false},
  WALL:{opacity:1,rgb:[.39,.56,.64],opaque:true},
  GLASS:{opacity:.17,rgb:[.29,.77,.89],opaque:false},
  SUPPORT:{opacity:1,rgb:[.48,.58,.68],opaque:true},
  HIGH:{opacity:1,rgb:[.43,.52,.63],opaque:true},
  DETAIL:{opacity:.66,rgb:[.81,.72,.46],opaque:false}
 };
 if(mode==='HOLOGRAM'){
  const original=reference[shade];
  return {opacity:original.opacity,rgb:original.rgb,
   opaque:false,depthWrite:false};
 }
 const style=mass[shade];
 return {opacity:style.opacity,rgb:style.rgb,
  opaque:style.opaque,depthWrite:style.opaque};
}
function updateSourceMaterial(m:StandardMaterial,shade:Shade,
 mode:F3eSourceMassingMode){
 const style=f3eSourceMassingStyle(shade,mode);
 const [r,g,b]=style.rgb;
 m.diffuse=new Color(r,g,b);
 m.emissive=new Color(r*.10,g*.11,b*.12);
 m.opacity=style.opacity;
 m.blendType=style.opaque?BLEND_NONE:BLEND_NORMAL;
 m.depthWrite=style.depthWrite;
 m.cull=CULLFACE_NONE;
 m.useMetalness=true;
 m.metalness=shade==='SUPPORT'?.30:.15;
 m.gloss=shade==='GLASS'?.57:.35;
 m.update();
}
function materialFor(shade:Shade,mode:F3eSourceMassingMode){
 const m=new StandardMaterial();
 updateSourceMaterial(m,shade,mode);
 return m;
}
/** 7 GPU batches instead of ~90 independent source draw calls.
 * Geometry retains exact vertices and triangle order; only render batching
 * and purely visual tint are transformed. */
export function buildF3eOriginalSourceCoverage(app:AppBase,stage:StageDefinition){
 const {parts,manifest}=auditF3eSourceCoverage(stage);
 const root=new Entity('T21F3E:EXACT_ORIGINAL_REFERENCE_ONLY_NO_COLLISION');
 app.root.addChild(root);
 let visualMode:F3eSourceMassingMode='ARCHITECTURE';
 const materials=new Map<Shade,StandardMaterial>();
 const categories=Object.keys(manifest.categories) as Shade[];
 for(const kind of categories){
  const items=parts.filter(m=>m.shade===kind);
  if(items.length===0)continue;
  const positions:number[]=[];
  for(const m of items)for(const [x,y,z] of m.vertices)
   positions.push(x,y,z);
  const indices=Array.from({length:positions.length/3},(_,i)=>i);
  const mesh=new Mesh(app.graphicsDevice);
  mesh.setPositions(new Float32Array(positions));
  mesh.setNormals(new Float32Array(calculateNormals(positions,indices)));
  mesh.setIndices(new Uint32Array(indices));
  mesh.update();
  const node=new Entity('T21F3E:SOURCE_'+kind+'_UNVERIFIED_GAME_SURFACE');
  const material=materialFor(kind,visualMode);
  materials.set(kind,material);
  node.addComponent('render',{
   meshInstances:[new MeshInstance(mesh,material)],
   castShadows:false,receiveShadows:false
  });
  root.addChild(node);
 }
 return {
  root,manifest,
  getVisualMode:()=>visualMode,
  setVisualMode(mode:F3eSourceMassingMode){
   if(!F3E_SOURCE_MASSING_MODES.includes(mode))
    throw Error('T21_W10B28_UNAUTHORIZED_SOURCE_VISUAL_MODE');
   if(mode===visualMode)return visualMode;
   for(const [shade,material] of materials)
    updateSourceMaterial(material,shade,mode);
   visualMode=mode;
   return visualMode;
  },
  renderAuthority:{
   source:'EXACT_PINNED_ORIGINAL_TRIANGLES_ONLY' as const,
   originalTriangles:manifest.originalTriangles,
   physicalCollisionAdded:0 as const,
   navigationAdded:0 as const,
   scoreableAdded:0 as const,
   unplacedActorInstancesRecovered:0 as const,
   productionAuthorized:false as const
  }
 };
}
