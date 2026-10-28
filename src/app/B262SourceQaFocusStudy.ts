/** B262: original-source QA overlay focus experiment, never a geometry fix.
 * This gate inherits B261's real paused SOURCE constraints and only changes
 * browser DOM visibility of existing diagnostic controls. */
import {b261SourceGate} from './B261SourceRenderOrderAudit';
export function b262QaFocusEligible(p:URLSearchParams,
 c:Parameters<typeof b261SourceGate>[1],
 raster:string,hiddenMaterial:string|null){
 return p.get('t21B262')==='qaFocusAudit'&&
  b261SourceGate(p,c,raster,hiddenMaterial);
}
export function b262FocusPresentation(on:boolean){
 return Object.freeze({qaPanelHidden:on,restoreButtonVisible:on,
  originalSourceTriangles:57578 as const,
  source:'25/17/26/0' as const,changedOriginalMeshes:0 as const,
  changedMaterialState:0 as const,changedPaintSurfaces:0 as const,
  changedNativeActors:0 as const,changedPhysicsSolids:0 as const,
  changedNavLinks:0 as const,changedScoreable:0 as const,
  diagnosticOnly:true as const,artAccepted:false as const,
  productionAuthorized:false as const});
}
