/**
 * B254: tightly bounded, ORIGINAL native actor RENDER-ONLY source inspection.
 * Never mutate gameplay entities, CPU/Player bodies, KCC, stage, ink, or AI.
 */
export const B254_VISIBILITY_MODES=[
 'ALL','HIDE_CPU','HIDE_PLAYER','HIDE_BOTH'
] as const;
export type B254NativeVisualMode=typeof B254_VISIBILITY_MODES[number];
export function b254ActorRenderFlags(mode:B254NativeVisualMode){
 if(!B254_VISIBILITY_MODES.includes(mode))
  throw Error('B254_UNKNOWN_SOURCE_VISUAL_DIAGNOSTIC');
 return {cpuVisible:mode==='ALL'||mode==='HIDE_PLAYER',
  playerVisible:mode==='ALL'||mode==='HIDE_CPU'};
}
export const B254_NATIVE_VISUAL_AUTHORITY=Object.freeze({
 source:'25/17/26/0',sevenExistingSourceCpuOnly:true,
 visualComponentsEnabledOnly:true,
 gameBodiesMoved:0,sourceNavLinksAdded:0,
 originalScoreablesAdded:0,staticOriginalMeshModified:false,
 sourceBancActorMatricesRecovered:false,productionAuthorized:false
} as const);
