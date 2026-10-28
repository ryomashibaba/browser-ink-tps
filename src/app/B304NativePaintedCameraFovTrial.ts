/** B304 genuine native paused camera-lens research, NEVER normal gameplay.
 * FOV-only; not a new view geometry, hitbox, aim, actor or physics source. */
export const B304_REAL_FOV={
 ORIGINAL:63,WIDE:76,FOCUS:52
} as const;
export type B304RealFov=keyof typeof B304_REAL_FOV;
export type B304CameraGate=Readonly<{
 optIn:boolean;paused:boolean;pointerLocked:boolean;stopped:boolean;
 originalFullRound:boolean;phase:string;nativeTick:number;
 shots:number;paintCells:number;
 source:readonly [number,number,number,number];
 renderMeshes:number;visibleMeshes:number;originalActors:boolean;
 relocatedActors:number;current:B304RealFov;requested:B304RealFov;
 startedAtTick:number|null;currentFov:number;
}>;
export function b304CameraEligible(s:B304CameraGate):boolean{
 const seq=(s.current==='ORIGINAL'&&s.requested==='WIDE'&&s.startedAtTick===null)||
   (s.current==='WIDE'&&s.requested==='FOCUS'&&s.startedAtTick===s.nativeTick)||
   (s.current==='FOCUS'&&s.requested==='ORIGINAL'&&s.startedAtTick===s.nativeTick);
 return seq&&s.optIn&&s.paused&&!s.pointerLocked&&!s.stopped&&
   s.originalFullRound&&s.nativeTick>=42&&
   (s.phase==='STAGING'||s.phase==='PLAYING')&&
   s.shots>0&&s.paintCells>0&&s.source.join('/')==='25/17/26/0'&&
   s.renderMeshes===17&&s.visibleMeshes===17&&
   s.originalActors&&s.relocatedActors===0&&
   Number.isFinite(s.currentFov)&&
   Math.abs(s.currentFov-B304_REAL_FOV[s.current])<.0001;
}
