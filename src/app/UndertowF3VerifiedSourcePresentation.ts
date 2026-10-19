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
}
export function selectVerifiedSourcePresentation(
 e:SourcePresentationEvidence):VerifiedSourcePresentation{
 if(!e.fullSourceReviewRequested||!e.flatSourceVerified)
  return 'F3E_REFERENCE';
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
