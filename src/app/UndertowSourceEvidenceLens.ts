/** A camera-only original source display lens, never a gameplay floor. */
export type T21EvidenceLens='OFF'|'WALK_ORIENTED'|'VERTICAL_HIGH';
export const WALK_SOURCE_ROOT_KEYS=[
 'sourceNativeRoot','sourceLocalRoot','sourceBatch2Root',
 'broadStaticRoot','flankElevationPhase4Root'
] as const;
export const VERTICAL_SOURCE_ROOT_KEYS=[
 'verticalSourcePhase5BRoot','highSourcePhase6Root','sideSupportsPhase7Root',
 'glassFramesPhase7Root','centralTowersPhase8Root','flankHighPhase8Root',
 'sideEdgePhase8Root','centerDownfacePhase9Root','fenceDownfacePhase9Root',
 'megalithDownfacePhase9Root'
] as const;
export const NON_SOURCE_CONTEXT_ROOT_KEYS=[
 'confirmedRoot','occupancyRoot','provisionalRoot','unresolvedRoot','navRoot'
] as const;
export const EVIDENCE_LENS_GAMEPLAY_AUTHORITY='NONE' as const;
export function expectedEvidenceLensGroupVisibility(mode:Exclude<T21EvidenceLens,'OFF'>){
 if(mode!=='WALK_ORIENTED'&&mode!=='VERTICAL_HIGH')
   throw Error('T21_INVALID_SOURCE_LENS');
 return {walk:mode==='WALK_ORIENTED',vertical:mode==='VERTICAL_HIGH',
  context:false,gameplayFloorOrColliderProven:false} as const;
}
