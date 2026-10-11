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
import {BLEND_NORMAL,CULLFACE_NONE,calculateNormals,Color,Entity,Mesh,
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
 UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS
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
 if(parts.length<55||skipped!==8)
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
  categories:Object.freeze(categories),
  sourceOnly:true,addedPhysicalSolids:0,addedPaintSurfaces:0,
  addedNavigationLinks:0,inferredCorridorConnections:0,
  productionAuthorized:false
 });
 return {parts,manifest};
}
function materialFor(shade:Shade){
 // Source materials are CLASSIFICATION data, not a proof of original
 // in-game textures. Render original forms as unmistakably semitransparent
 // holographic study layers, while real paintable floor stays authoritative.
 const map:Record<Shade,[number,number,number,number]>={
  CONCRETE:[.42,.66,.79,.28],
  SLOPE:[.90,.66,.39,.33],
  WALL:[.56,.73,.87,.45],
  GLASS:[.26,.80,.92,.24],
  SUPPORT:[.62,.53,.83,.47],
  HIGH:[.43,.60,.76,.38],
  DETAIL:[.95,.87,.37,.34]
 };
 const [r,g,b,alpha]=map[shade];
 const m=new StandardMaterial();
 m.diffuse=new Color(r,g,b);
 m.emissive=new Color(r*.16,g*.16,b*.16);
 m.opacity=alpha;m.blendType=BLEND_NORMAL;
 m.depthWrite=false;m.cull=CULLFACE_NONE;
 m.useMetalness=true;m.metalness=.15;m.gloss=.38;
 m.update();return m;
}
/** 7 GPU batches instead of ~90 independent source draw calls.
 * Geometry retains exact vertices and triangle order; only render batching
 * and purely visual tint are transformed. */
export function buildF3eOriginalSourceCoverage(app:AppBase,stage:StageDefinition){
 const {parts,manifest}=auditF3eSourceCoverage(stage);
 const root=new Entity('T21F3E:EXACT_ORIGINAL_REFERENCE_ONLY_NO_COLLISION');
 app.root.addChild(root);
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
  node.addComponent('render',{
   meshInstances:[new MeshInstance(mesh,materialFor(kind))],
   castShadows:false,receiveShadows:false
  });
  root.addChild(node);
 }
 return {root,manifest};
}
