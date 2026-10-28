/** B260: narrow, ORIGINAL source UV material draw attribution only.
 * The material names, counts and kinds must match SHA-pinned F3L manifests.
 * This cannot certify collision, navigability, gameplay or artistic quality. */
import {b259RasterEligible} from './B259SourceRasterLayers';

export const B260_SOURCE_TARGETS=Object.freeze([
 {name:'Fld_Temple01_FloorLine02',kind:'DETAIL',label:'FLOORLINE'},
 {name:'Fld_Temple01_Glass01',kind:'GLASS',label:'GLASS'}
] as const);
export type B260SourceTarget=typeof B260_SOURCE_TARGETS[number]['name'];
export function b260Target(name:string|null){
 return B260_SOURCE_TARGETS.find(t=>t.name===name)??null;
}
export function b260SourceGate(p:URLSearchParams,
 c:Parameters<typeof b259RasterEligible>[1],rasterMask:string){
 return p.get('t21B260')==='materialAudit'&&
  b259RasterEligible(p,c)&&rasterMask==='BASELINE';
}
export function b260DrawVisible(materialName:string,hidden:string|null){
 if(hidden!==null&&!b260Target(hidden))
  throw Error('B260_UNVERIFIED_SOURCE_MATERIAL_NAME');
 return materialName!==hidden;
}
export const B260_SOURCE_AUTHORITY=Object.freeze({
 source:'25/17/26/0' as const,originalUvTriangles:57578 as const,
 renderOnly:true as const,materialBytesChanged:0 as const,
 originalTrianglesModified:0 as const,stageSolidsModified:0 as const,
 paintableSurfacesModified:0 as const,navLinksModified:0 as const,
 scoreableSurfacesModified:0 as const,actorTransformsModified:0 as const,
 worldTicksAdvanced:0 as const,diagnosticOnly:true as const,
 artAccepted:false as const,productionAuthorized:false as const
});
