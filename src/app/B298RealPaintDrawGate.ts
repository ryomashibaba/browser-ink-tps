/** B298 same genuine native-pause draw-only 17 PaintSurface A/B/A. */
export type B298Frame={enabled:boolean;paused:boolean;locked:boolean;stopped:boolean;
 fullRound:boolean;tick:number;phase:string;shots:number;cells:number;
 source:readonly [number,number,number,number];
 nativePaintMeshes:number;visibleMeshes:number;ownerReferencesExact:boolean;
 originalActorStyle:boolean;physicalActorRelocations:number;
 hiddenAtTick:number|null;requestHide:boolean};
export function b298PaintDrawEligible(s:B298Frame){
 return s.enabled&&s.paused&&!s.locked&&!s.stopped&&s.fullRound&&
  s.tick>=42&&(s.phase==='STAGING'||s.phase==='PLAYING')&&
  s.shots>0&&s.cells>0&&s.source.join('/')==='25/17/26/0'&&
  s.nativePaintMeshes===17&&s.ownerReferencesExact&&s.originalActorStyle&&
  s.physicalActorRelocations===0&&
  (s.requestHide?s.hiddenAtTick===null&&s.visibleMeshes===17:
   s.hiddenAtTick===s.tick&&s.visibleMeshes===0);
}
