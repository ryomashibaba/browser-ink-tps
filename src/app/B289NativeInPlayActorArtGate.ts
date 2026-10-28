/**
 * B289: real keyboard+projectile+ink happened BEFORE freeze, but comparison
 * is at a single later exact paused frame. No synthetic active gameplay.
 */
import {b268VariantAccepted,type B268RenderVariant} from './B268SourceActorComposition';
import {type B288FrozenActorStudyWitness} from './B288NativeSourceActorArtGate';
export type B289NativeInPlayWitness=B288FrozenActorStudyWitness&{
 acceptedHumanShots:number;actualHumanPaintCells:number;
 genuinePlayerTravelMeters:number;timeRemainingSeconds:number;
};
const ids=['A1','A2','A3','B1','B2','B3','B4'] as const;
export function b289RealSourceInPlayArtEligible(
 w:B289NativeInPlayWitness,mode:B268RenderVariant):boolean{
 const p=w.url;
 return b268VariantAccepted(mode)&&
 p.get('t21B289')==='nativeInPlayActorArt'&&
 p.get('t21Play')==='preview'&&p.get('t21QaDrive')==='source'&&
 p.get('t21W10B192')==='humanCombat'&&
 p.get('t21W10B203')==='fullRound'&&p.get('t21QaInput')!=='deterministic'&&
 w.selectedNativeCombat&&w.fullRound&&w.paused&&!w.pointerLocked&&
 w.nativeTick>=42&&
 (w.matchState==='STAGING'||w.matchState==='PLAYING')&&!w.stopReason&&
 w.acceptedHumanShots>0&&w.actualHumanPaintCells>0&&
 w.genuinePlayerTravelMeters>0.25&&
 w.timeRemainingSeconds>0&&w.timeRemainingSeconds<=180&&
 (w.matchState==='STAGING'?w.timeRemainingSeconds===180:
  w.timeRemainingSeconds<180)&&
 !w.surveyActive&&!w.galleryActive&&w.nativeRenderer==='webgl2'&&
 w.originalSolids===25&&w.originalPaint===17&&
 w.originalLinks===26&&w.scoreable===0&&
 w.actorBodyRelocations===0&&w.playerRenderInstalled&&
 w.sourceVisualsInstalled===8&&w.cpuActorIds.length===7&&
 new Set(w.cpuActorIds).size===7&&
 ids.every(id=>w.cpuActorIds.includes(id));
}
export const B289_NATIVE_ART_AUTHORITY=Object.freeze({
 comparison:'GENUINE_PLAY_AFTER_MOVEMENT_AND_PAINT_PAUSED_ABCA' as const,
 originalSource:'25/17/26/0' as const,
 visualsOnly:true as const,existingActors:8 as const,
 nativeWorldWrites:0 as const,actorRelocations:0 as const,
 navLinksAdded:0 as const,scoreablePromotions:0 as const,
 originalSourceCollidersAdded:0 as const,artAccepted:false as const,
 nativeOpponentRoutesCertified:0 as const,
 unrestricted4v4Certified:false as const,productionAuthorized:false as const
});
