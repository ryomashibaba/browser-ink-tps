/**
 * B251 — readability separation for EXISTING exact-source reference triangles.
 *
 * This opt-in SOURCE full-round mode changes only the material of 38 original
 * F3 optical objects and up to 7 F3e category batches. Their vertices, indices,
 * draw calls, source placement, paint authority and collision are untouched.
 * They are NOT registered Rapier solids or certified traversable terrain.
 */
import {
 BLEND_NORMAL,CULLFACE_NONE,Color,Entity,StandardMaterial,
 type Material,type MeshInstance,type AppBase
} from 'playcanvas';
import {originalF3StructuralInventory} from './UndertowF3OriginalSourceContext';

type OpticalCategory='CONCRETE'|'SLOPE'|'WALL'|'GLASS'|'SUPPORT'|'HIGH'|'DETAIL';
type StructureCategory='SUPPORT'|'FRAME'|'TOWER'|'PILLAR';
type OpticalTint={rgb:readonly [number,number,number];opacity:number};
/** Translucent reference-only separation, never a certified wall or floor. */
export const B251_REFERENCE_TONES:Readonly<Record<OpticalCategory,OpticalTint>>=Object.freeze({
 CONCRETE:{rgb:[.37,.52,.60],opacity:.23},
 SLOPE:{rgb:[.68,.56,.35],opacity:.25},
 WALL:{rgb:[.29,.59,.78],opacity:.75},
 GLASS:{rgb:[.25,.72,.83],opacity:.13},
 SUPPORT:{rgb:[.46,.62,.81],opacity:.75},
 HIGH:{rgb:[.49,.65,.82],opacity:.79},
 DETAIL:{rgb:[.83,.76,.42],opacity:.25}
});
export const B251_STRUCTURE_TONES:Readonly<Record<StructureCategory,OpticalTint>>=Object.freeze({
 SUPPORT:{rgb:[.31,.69,.75],opacity:.66},
 FRAME:{rgb:[.53,.82,.88],opacity:.49},
 TOWER:{rgb:[.44,.61,.81],opacity:.77},
 PILLAR:{rgb:[.57,.72,.84],opacity:.79}
});
export const B251_VISUAL_AUTHORITY=Object.freeze({
 originalSourceOpticalEntities:38,materialOnly:true,
 physicalSolidsAdded:0,paintSurfacesAdded:0,navLinksAdded:0,
 actorRelocations:0,scoreableAdded:0,
 productionAuthorized:false
} as const);
function material(tint:OpticalTint):StandardMaterial{
 const m=new StandardMaterial();
 m.diffuse=new Color(...tint.rgb);
 m.emissive=new Color(tint.rgb[0]*.14,tint.rgb[1]*.14,tint.rgb[2]*.14);
 m.blendType=BLEND_NORMAL;
 m.opacity=tint.opacity;
 m.depthWrite=false;
 m.cull=CULLFACE_NONE;
 m.useMetalness=true;
 m.metalness=.10;
 m.gloss=.36;
 m.update();
 return m;
}
export type B251OpticalView={
 setEnabled:(enabled:boolean)=>void;
 snapshot:()=>{enabled:boolean;existingStructureObjects:number;
  existingReferenceBatches:number;materialBindings:number;
  geometryAdded:0;collidersAdded:0;source:'25/17/26/0';
  certifiedPhysicalStructureAdded:false};
};
export function installB251SourceOpticalSeparation(
 app:AppBase,structuresRoot:Entity,completionRoot:Entity
):B251OpticalView{
 const entries:{mesh:MeshInstance;before:Material;after:StandardMaterial}[]=[];
 const list=originalF3StructuralInventory();
 const opticalPalette=new Map<StructureCategory,StandardMaterial>();
 const referencePalette=new Map<OpticalCategory,StandardMaterial>();
 for(const [kind,tint] of Object.entries(B251_STRUCTURE_TONES) as
   [StructureCategory,OpticalTint][]) opticalPalette.set(kind,material(tint));
 for(const [kind,tint] of Object.entries(B251_REFERENCE_TONES) as
   [OpticalCategory,OpticalTint][]) referencePalette.set(kind,material(tint));
 let structures=0;
 for(const source of list){
  const node=structuresRoot.findByName('T21F3:ORIGINAL_OPTICAL:'+source.id) as Entity|null;
  const meshes=node?.render?.meshInstances;
  if(!meshes?.length)throw Error('B251_MISSING_EXACT_OPTICAL_SOURCE_'+source.id);
  const next=opticalPalette.get(source.kind);
  if(!next)throw Error('B251_UNKNOWN_ORIGINAL_STRUCTURE_KIND');
  for(const mesh of meshes)entries.push({mesh,before:mesh.material,after:next});
  structures++;
 }
 let batches=0;
 for(const [shade,mat] of referencePalette){
  const node=completionRoot.findByName(
   'T21F3E:SOURCE_'+shade+'_UNVERIFIED_GAME_SURFACE') as Entity|null;
  if(!node)continue; // an unused original category has no render batch
  const meshes=node.render?.meshInstances;
  if(!meshes?.length)throw Error('B251_EMPTY_PINNED_REFERENCE_'+shade);
  for(const mesh of meshes)entries.push({mesh,before:mesh.material,after:mat});
  batches++;
 }
 if(structures!==38||batches<4||batches>7)
  throw Error('B251_ORIGINAL_OPTICAL_INVENTORY_DRIFT');
 let enabled=false;
 const setEnabled=(on:boolean)=>{
  enabled=on;
  for(const {mesh,before,after} of entries)mesh.material=on?after:before;
 };
 // B251 art gate: actual 1600x900 same-frame A/B showed insufficient
 // readable-stage improvement. Preserve native source appearance by default;
 // enable only during the explicit frozen-source QA comparison.
 setEnabled(false);
 return {setEnabled,snapshot:()=>({
  enabled,existingStructureObjects:structures,existingReferenceBatches:batches,
  materialBindings:entries.length,geometryAdded:0 as const,
  collidersAdded:0 as const,source:'25/17/26/0' as const,
  certifiedPhysicalStructureAdded:false as const
 })};
}
