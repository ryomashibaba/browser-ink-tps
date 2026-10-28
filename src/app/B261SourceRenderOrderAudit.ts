/** B261 research-only: inspect the REAL opaque/transparent render split.
 * No mesh/material/physics/paint/nav/score state may be changed here. */
import {BLEND_NONE,BLEND_NORMAL,SORTMODE_BACK2FRONT} from 'playcanvas';
import {b260SourceGate} from './B260SourceMaterialAttribution';
export type B261DrawState={
 glass:{name:string;kind:string;layers:readonly number[];visible:boolean;
  blendType:number;depthWrite:boolean;depthTest:boolean;drawBucket:number};
 paint:readonly {name:string;layers:readonly number[];visible:boolean;
  blendType:number;depthWrite:boolean;depthTest:boolean;drawBucket:number}[];
 world:{id:number;opaqueSortMode:number;transparentSortMode:number}
};
export function b261SourceGate(p:URLSearchParams,
 c:Parameters<typeof b260SourceGate>[1],mask:string,hidden:string|null){
 return p.get('t21B261')==='sortAudit'&&
  b260SourceGate(p,c,mask)&&hidden===null;
}
export function classifyB261SourceDrawState(f:B261DrawState){
 if(f.glass.name!=='Fld_Temple01_Glass01'||f.glass.kind!=='GLASS'||
    !f.glass.visible||f.paint.length!==17||
    f.paint.some(p=>!p.name.startsWith('PaintSurface:')||!p.visible)||
    ![f.glass,...f.paint].every(m=>Number.isInteger(m.drawBucket)&&
      m.drawBucket>=0&&m.drawBucket<=255))
  throw Error('B261_UNVERIFIED_ORIGINAL_SOURCE_DRAW_IDENTITY');
 const inWorld=(m:{layers:readonly number[]})=>
  m.layers.length===1&&m.layers[0]===f.world.id;
 const sameWorldLayer=inWorld(f.glass)&&f.paint.every(inWorld);
 const opaqueInk=f.paint.every(p=>p.blendType===BLEND_NONE&&
  p.depthWrite&&p.depthTest);
 const translucentGlass=f.glass.blendType===BLEND_NORMAL&&
  !f.glass.depthWrite&&f.glass.depthTest;
 const backToFront=f.world.transparentSortMode===SORTMODE_BACK2FRONT;
 const separatePasses=sameWorldLayer&&opaqueInk&&translucentGlass;
 return {
  schema:'B261_PINNED_SOURCE_RENDER_PASS_AUDIT' as const,
  source:'25/17/26/0' as const,originalUvTriangles:57578 as const,
  glass:f.glass,paintCount:f.paint.length,paintMaterials:f.paint,
  world:f.world,sameWorldLayer,opaqueInk,translucentGlass,backToFront,
  // Buckets cannot reorder opaque and transparent render subpasses.
  glassBucketCannotReorderOpaquePaint:separatePasses,
  conclusion:separatePasses?'BUCKET_ONLY_HYPOTHESIS_REJECTED':
   'INCONCLUSIVE_REAL_RENDER_ORDER_REQUIRES_REVIEW',
  changedDrawBuckets:0,changedDrawOrders:0,changedMaterials:0,
  changedLayerAssignments:0,changedSourceTriangles:0,
  changedPaintSurfaces:0,changedPhysicsSolids:0,changedNavLinks:0,
  changedScoreable:0,artAccepted:false,productionAuthorized:false
 };
}
