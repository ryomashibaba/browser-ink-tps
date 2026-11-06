/** B475: a real player chooses the EXISTING B441 nonproduction
 * 180s combat before arming one B25 CLASSIC original-paint practice.
 * This only schedules a genuine 60Hz challenge after physical 7/7
 * rejoin; no source score, actor/path/geometry, or combat permission. */
export function b475RealFrontlineReadyMode(
 p:Pick<URLSearchParams,'get'>
):boolean{
 return p.get('t21Play')==='preview'&&
  p.get('t21QaDrive')==='source'&&
  p.get('t21W10B112')==='humanGround'&&
  p.get('t21W10B183')==='firstDropPlay'&&
  p.get('t21W10B192')==='humanCombat'&&
  p.get('t21W10B203')==='fullRound'&&
  p.get('t21W10B441')==='sourceFrontline'&&
  p.get('t21W10B193')===null&&p.get('t21W10B343')===null&&
  p.get('t21W10B384')===null&&p.get('t21QaInput')===null;
}
export function b475MayArmRealSourceFrontlineReady(
 p:Pick<URLSearchParams,'get'>,f:{
  stage:readonly number[];nativeTick:number;paused:boolean;
  fullRound:boolean;everLockedPointer:boolean;pointerLocked:boolean;
  matchState:string;practiceStatus:string;variant:string;
  stopReason:string|null;
 }
):boolean{
 return b475RealFrontlineReadyMode(p)&&
  f.stage.join(',')==='25,17,26,0'&&
  f.nativeTick===0&&f.paused&&f.fullRound&&
  !f.everLockedPointer&&!f.pointerLocked&&
  f.matchState==='STAGING'&&f.practiceStatus==='IDLE'&&
  f.variant==='CLASSIC'&&f.stopReason===null;
}
