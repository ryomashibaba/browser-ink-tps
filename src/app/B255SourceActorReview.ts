/** B255: frozen review of existing native SOURCE actors; no game authority. */
import {b253VerifiedInkVisualOptIn} from './UndertowF3LTexturedSourcePreview';
export type B255ActorPresentation='CAPSULE'|'HUMANOID';
export interface B255ActorReviewEvidence{
 paused:boolean;staging:boolean;stopped:boolean;fullRound:boolean;
 pointerLocked:boolean;otherStudyActive:boolean;
 inkSafeEnabled:boolean;verifiedUvActive:boolean;
 sourceTriangles:number;verifiedTextures:number;existingCpuActors:number;
 registeredSolids:number;paintableSurfaces:number;genuineLinks:number;
 scoreableSurfaces:number;
}
export function b255ActorReviewEligible(
 params:URLSearchParams,e:B255ActorReviewEvidence
):boolean{
 return params.get('t21B255')==='actorStudy'&&
  b253VerifiedInkVisualOptIn(params,e.sourceTriangles,e.verifiedTextures)&&
  e.paused&&e.staging&&!e.stopped&&!e.fullRound&&!e.pointerLocked&&
  !e.otherStudyActive&&e.inkSafeEnabled&&e.verifiedUvActive&&
  e.existingCpuActors===7&&e.registeredSolids===25&&
  e.paintableSurfaces===17&&e.genuineLinks===26&&
  e.scoreableSurfaces===0;
}
export const B255_ACTOR_REVIEW_AUTHORITY=Object.freeze({
 source:'25/17/26/0',existingActorsOnly:true,
 actorPhysicsModified:false,gameBodiesMoved:0,sourceNavLinksAdded:0,
 scoreableSurfacesAdded:0,originalStageTrianglesModified:0,
 rawOriginalAssetsPublished:false,productionAuthorized:false
} as const);
