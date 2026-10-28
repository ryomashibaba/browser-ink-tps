/** B305 draw-only actor-occlusion A-B-A on a genuinely painted paused frame.
 * Existing actor entities remain alive with all gameplay poses unchanged. */
export type B305NativeActorDrawGate=Readonly<{
 optIn:boolean;paused:boolean;pointerLocked:boolean;stopped:boolean;
 fullRound:boolean;phase:string;tick:number;shots:number;paintCells:number;
 source:readonly [number,number,number,number];
 actors:number;visuals:number;originalHumanVisible:number;
 originalActorStyle:boolean;relocations:number;
 hiddenAtTick:number|null;requestHide:boolean;cameraFov:number;
}>;
export function b305NativeActorDrawEligible(s:B305NativeActorDrawGate){
 return s.optIn&&s.paused&&!s.pointerLocked&&!s.stopped&&s.fullRound&&
  s.tick>=42&&(s.phase==='STAGING'||s.phase==='PLAYING')&&
  s.shots>0&&s.paintCells>0&&
  s.source.join('/')==='25/17/26/0'&&s.actors===8&&s.visuals===8&&
  s.originalActorStyle&&s.relocations===0&&s.cameraFov===63&&
  (s.requestHide?s.hiddenAtTick===null&&s.originalHumanVisible===8:
    s.hiddenAtTick===s.tick&&s.originalHumanVisible===0);
}
