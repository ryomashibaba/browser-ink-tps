/**
 * W10-B29: choose a read-only original-static-stage optical presentation.
 * No private asset, downloaded mesh or actor transform belongs in this
 * selector. The two actual renderers separately hash-validate their packs.
 */
export type VerifiedSourcePresentation='F3E_REFERENCE'|'F3G_FLAT'|'F3L_ORIGINAL_UV';
export interface SourcePresentationEvidence{
 fullSourceReviewRequested:boolean;
 flatSourceVerified:boolean;
 texturedSourceVerified:boolean;
 prefersFlat:boolean;
 /** Native four-mode gameplay cannot use unsplittable F3G fallback: its
  * DETAIL/METAL groups include unverified FloorLine/FloorFence bridges. */
 nativeRegisteredFloorOnly?:boolean;
}
export function selectVerifiedSourcePresentation(
 e:SourcePresentationEvidence):VerifiedSourcePresentation{
 if(!e.fullSourceReviewRequested||!e.flatSourceVerified)
  return 'F3E_REFERENCE';
 if(e.nativeRegisteredFloorOnly)return e.texturedSourceVerified
  ?'F3L_ORIGINAL_UV':'F3E_REFERENCE';
 if(e.texturedSourceVerified&&!e.prefersFlat)return 'F3L_ORIGINAL_UV';
 return 'F3G_FLAT';
}
export const B29_SOURCE_VISUAL_AUTHORITY=Object.freeze({
 sourceOnly:true,
 staticGeometry:'PINNED_EXACT_ORIGINAL_OBJ_ONLY',
 originalSetActorMatricesRecovered:false,
 newGameplayColliders:0,
 newNavigationLinks:0,
 scoreableSurfaces:0,
 productionAuthorized:false
} as const);

/** F3K is a separately normalized UNPLACED actor-parts showroom, not
 * terrain or a gameplay prop. The genuine four-mode SOURCE game never
 * allocates/fetches these dormant GPU meshes or a second camera. */
export function sourceF3kShowroomEligible(
 explicitFullSourceReview:boolean,nativeFourModeGame:boolean
):boolean{
 return explicitFullSourceReview&&!nativeFourModeGame;
}
