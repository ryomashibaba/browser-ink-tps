/**
 * B288: exact-source only paused 180s round actor rendering comparison.
 * This authorizes swapping existing render-only geometry for a frozen
 * visual A/B/A; it NEVER authorizes gameplay, paint, route, score or art.
 */
import {b268VariantAccepted,type B268RenderVariant} from './B268SourceActorComposition';
export type B288FrozenActorStudyWitness={
 url:URLSearchParams;
 selectedNativeCombat:boolean; fullRound:boolean;
 paused:boolean;nativeTick:number;matchState:string;
 stopReason:string|null;pointerLocked:boolean;
 surveyActive:boolean;galleryActive:boolean;nativeRenderer:string;
 originalSolids:number;originalPaint:number;originalLinks:number;
 scoreable:number;cpuActorIds:readonly string[];
 playerRenderInstalled:boolean;sourceVisualsInstalled:number;
 actorBodyRelocations:number;
};
const IDS=['A1','A2','A3','B1','B2','B3','B4'] as const;
export function b288FrozenVisualStudyEligible(w:B288FrozenActorStudyWitness,
 variant:B268RenderVariant):boolean{
 if(!b268VariantAccepted(variant)||variant==='B292_FLOW_SILHOUETTE')return false; // B288 historical study
 const ids=w.cpuActorIds;
 const params=w.url;
 return params.get('t21Play')==='preview'&&
  params.get('t21QaDrive')==='source'&&
  params.get('t21W10B192')==='humanCombat'&&
  params.get('t21W10B203')==='fullRound'&&
  params.get('t21QaInput')!=='deterministic'&&
  w.selectedNativeCombat&&w.fullRound&&w.paused&&
  w.nativeTick===0&&w.matchState==='STAGING'&&!w.stopReason&&
  !w.pointerLocked&&!w.surveyActive&&!w.galleryActive&&
  w.nativeRenderer==='webgl2'&&
  w.originalSolids===25&&w.originalPaint===17&&w.originalLinks===26&&
  w.scoreable===0&&w.actorBodyRelocations===0&&
  ids.length===7&&new Set(ids).size===7&&
  IDS.every(id=>ids.includes(id))&&
  w.playerRenderInstalled&&w.sourceVisualsInstalled===8;
}
export const B288_ART_RESEARCH_AUTHORITY=Object.freeze({
 study:'NATIVE_REAL_SOURCE_FROZEN_RENDER_ONLY_ABA' as const,
 variants:['B248_ORIGINAL','B268_COMPACT','B269_REAR_IDENTITY'] as const,
 originalStage:'25/17/26/0' as const,realActors:8 as const,
 actorBodyRelocations:0 as const,rapierCollidersAdded:0 as const,
 sourceGeometryEdited:0 as const,navLinksAdded:0 as const,
 paintCellsModified:0 as const,scoreablePromotions:0 as const,
 artAccepted:false as const,productionAuthorized:false as const,
 fullFourVsFourCertified:false as const
});
