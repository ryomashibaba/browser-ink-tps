/** B302 research-only GPU uniform trial on the 17 *existing* source
 * PaintSurface ShaderMaterials. Original Team B, neutral and ink atlas stay immutable. */
export const B302_NATIVE_TEAM_A_TONES={
 ORIGINAL:[.02,.84,.96],
 DEEP:[0,.68,.92],
 BRIGHT:[.16,1,1]
} as const;
export type B302NativeTeamATone=keyof typeof B302_NATIVE_TEAM_A_TONES;
export type B302NativeTeamAGate=Readonly<{
 optIn:boolean;paused:boolean;pointerLocked:boolean;stopped:boolean;
 originalFullRound:boolean;phase:string;nativeTick:number;
 actualHumanShots:number;actualOwnedPaintCells:number;
 sourceBoundary:readonly [number,number,number,number];
 meshCount:number;visibleMeshes:number;registeredOwnerObjectsExact:boolean;
 originalActorStyle:boolean;relocatedActors:number;
 current:B302NativeTeamATone;requested:B302NativeTeamATone;
 startedAtTick:number|null;
}>;
export function b302NativeTeamAEligible(s:B302NativeTeamAGate):boolean{
 const transition=(s.current==='ORIGINAL'&&s.requested==='DEEP'&&
   s.startedAtTick===null)||
  (s.current==='DEEP'&&s.requested==='BRIGHT'&&
   s.startedAtTick===s.nativeTick)||
  (s.current==='BRIGHT'&&s.requested==='ORIGINAL'&&
   s.startedAtTick===s.nativeTick);
 return transition&&s.optIn&&s.paused&&!s.pointerLocked&&!s.stopped&&
  s.originalFullRound&&s.nativeTick>=42&&
  (s.phase==='STAGING'||s.phase==='PLAYING')&&
  s.actualHumanShots>0&&s.actualOwnedPaintCells>0&&
  s.sourceBoundary.join('/')==='25/17/26/0'&&s.meshCount===17&&
  s.visibleMeshes===17&&s.registeredOwnerObjectsExact&&
  s.originalActorStyle&&s.relocatedActors===0;
}
