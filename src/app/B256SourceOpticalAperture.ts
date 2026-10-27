/**
 * B256: optical-only screen-local aperture, exclusively for the paused,
 * pinned-source B253 + B255 comparison route.
 * Never changes a renderer's stage/physics/paint/nav/actor authority.
 */
export const B256_APERTURE_FOCUS=new Float32Array([.50,.30,.39,.43]);
export function b256OpticalMaterialEligible(kind:string):boolean{
 return ['METAL','SUPPORT','STRUCTURE','DETAIL'].includes(kind);
}
export function b256SourceOpticalEligible(params:URLSearchParams,e:{
 paused:boolean;staging:boolean;fullRound:boolean;stopReason:boolean;
 pointerLocked:boolean;verifiedUv:boolean;inkSafe:boolean;
 humanoid:boolean;sourceTriangles:number;textures:number;
 solids:number;paintable:number;navLinks:number;scoreable:number;
}):boolean{
 return params.get('t21Play')==='preview'&&
  params.get('t21FullSource')==='review'&&
  params.get('t21B253')==='liveInk'&&
  params.get('t21B255')==='actorStudy'&&
  params.get('t21B256')==='opticalAperture'&&
  params.get('t21QaInput')!=='deterministic'&&
  e.paused&&e.staging&&!e.fullRound&&!e.stopReason&&!e.pointerLocked&&
  e.verifiedUv&&e.inkSafe&&e.humanoid&&
  e.sourceTriangles===57578&&e.textures>=8&&e.textures<=20&&
  e.solids===25&&e.paintable===17&&e.navLinks===26&&e.scoreable===0;
}
export const B256_OPTICAL_AUTHORITY=Object.freeze({
 source:'25/17/26/0',originalUvPositionDataUnmodified:true,
 shadeOnly:true,shaderVersion:'2.22.1',screenLocal:true,
 newRapierSolids:0,newPaintableSurfaces:0,newNavLinks:0,
 scoreableSurfaces:0,sourceInstancePlacementRecovered:false,
 officialBattleCertified:false,productionAuthorized:false
} as const);
