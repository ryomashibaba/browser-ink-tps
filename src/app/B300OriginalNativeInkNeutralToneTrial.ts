/** B300 research-only GPU uniform trial on the 17 *existing* source
 * PaintSurface ShaderMaterials. Team colors and ink atlas stay immutable. */
export const B300_NATIVE_NEUTRAL_TONES={
 ORIGINAL:[.24,.27,.31],
 SLATE:[.40,.47,.52],
 STONE:[.51,.57,.62]
} as const;
export type B300NativeTone=keyof typeof B300_NATIVE_NEUTRAL_TONES;
export type B300NativeToneGate=Readonly<{
 optIn:boolean;paused:boolean;pointerLocked:boolean;stopped:boolean;
 originalFullRound:boolean;phase:string;nativeTick:number;
 actualHumanShots:number;actualOwnedPaintCells:number;
 sourceBoundary:readonly [number,number,number,number];
 meshCount:number;visibleMeshes:number;registeredOwnerObjectsExact:boolean;
 originalActorStyle:boolean;relocatedActors:number;
 current:B300NativeTone;requested:B300NativeTone;
 startedAtTick:number|null;
}>;
export function b300NativeToneEligible(s:B300NativeToneGate):boolean{
 const transition=(s.current==='ORIGINAL'&&s.requested==='SLATE'&&
   s.startedAtTick===null)||
  (s.current==='SLATE'&&s.requested==='STONE'&&
   s.startedAtTick===s.nativeTick)||
  (s.current==='STONE'&&s.requested==='ORIGINAL'&&
   s.startedAtTick===s.nativeTick);
 return transition&&s.optIn&&s.paused&&!s.pointerLocked&&!s.stopped&&
  s.originalFullRound&&s.nativeTick>=42&&
  (s.phase==='STAGING'||s.phase==='PLAYING')&&
  s.actualHumanShots>0&&s.actualOwnedPaintCells>0&&
  s.sourceBoundary.join('/')==='25/17/26/0'&&s.meshCount===17&&
  s.visibleMeshes===17&&s.registeredOwnerObjectsExact&&
  s.originalActorStyle&&s.relocatedActors===0;
}
