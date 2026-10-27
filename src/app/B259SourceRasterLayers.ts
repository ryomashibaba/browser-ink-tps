/** B259: renderer attribution only. Hiding optical or physical DISPLAY
 * entities cannot remove Rapier solids, painted cells or certify a route. */
export const B259_RASTER_MASKS=[
 'BASELINE','HIDE_UV_DETAIL','HIDE_UV_GLASS','HIDE_ALL_UV',
 'HIDE_STAGE_SOLIDS','HIDE_PAINT_SURFACES'
] as const;
export type B259RasterMask=typeof B259_RASTER_MASKS[number];
export function b259UvVisible(mask:B259RasterMask,kind:string){
 return mask!=='HIDE_ALL_UV'&&
  !(mask==='HIDE_UV_DETAIL'&&kind==='DETAIL')&&
  !(mask==='HIDE_UV_GLASS'&&kind==='GLASS');
}
export function b259NativeVisible(mask:B259RasterMask,type:'SOLID'|'PAINT'){
 return !(mask==='HIDE_STAGE_SOLIDS'&&type==='SOLID')&&
  !(mask==='HIDE_PAINT_SURFACES'&&type==='PAINT');
}
export function b259RasterEligible(p:URLSearchParams,c:{
 paused:boolean;staging:boolean;stopped:boolean;fullRound:boolean;
 pointerLocked:boolean;otherStudy:boolean;verifiedUv:boolean;inkSafe:boolean;
 humanoid:boolean;b256Active:boolean;cameraBaseline:boolean;
 solids:number;paintable:number;links:number;scoreable:number;
 triangles:number;textures:number;cpuCount:number
}){
 return p.get('t21Play')==='preview'&&p.get('t21FullSource')==='review'&&
  p.get('t21B253')==='liveInk'&&p.get('t21B255')==='actorStudy'&&
  p.get('t21B257')==='depthAudit'&&p.get('t21B258')==='cameraStudy'&&
  p.get('t21B259')==='layerAudit'&&p.get('t21QaInput')!=='deterministic'&&
  c.paused&&c.staging&&!c.stopped&&!c.fullRound&&!c.pointerLocked&&
  !c.otherStudy&&c.verifiedUv&&c.inkSafe&&c.humanoid&&
  !c.b256Active&&c.cameraBaseline&&c.solids===25&&c.paintable===17&&
  c.links===26&&c.scoreable===0&&c.triangles===57578&&
  c.textures>=8&&c.textures<=20&&c.cpuCount===7;
}
export const B259_RASTER_AUTHORITY=Object.freeze({
 source:'25/17/26/0' as const,renderOnly:true as const,
 stageEntitiesRepositioned:0 as const,sourceTrianglesModified:0 as const,
 originalUvAltered:false as const,physicsSolidsAdded:0 as const,
 paintableSurfacesAdded:0 as const,navLinksAdded:0 as const,
 scoreableSurfacesAdded:0 as const,actorTransformsAltered:0 as const,
 hidesAreOnlyDiagnostic:true as const,artAccepted:false as const,
 productionAuthorized:false as const
});
