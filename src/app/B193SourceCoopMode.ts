/** Explicit genuine original-source cooperation. No actor mutations. */
export function sourceCoopEligible(p:URLSearchParams):boolean{
 return p.get('t21Play')==='preview'&&p.get('t21QaDrive')==='source'&&
   p.get('t21W10B193')==='allyCoop'&&
   p.get('t21W10B192')!=='humanCombat';
}
/** Full browser restart, no switching collision or opponent AI mid-tick. */
export function sourceCoopNavigationUrl(current:string,enable:boolean):string{
 const old=new URL(current),dest=new URL(old.pathname,old.origin);
 dest.searchParams.set('t21Play','preview');
 dest.searchParams.set('t21QaDrive','source');
 dest.searchParams.set('t21W10B183','firstDropPlay');
 if(enable)dest.searchParams.set('t21W10B193','allyCoop');
 // Preserve the explicit 180s play choice across true clean-world replays.
 if(old.searchParams.get('t21W10B203')==='fullRound')
  dest.searchParams.set('t21W10B203','fullRound');
 return dest.href;
}

/** B204: UI-only mission arming during genuine pointer-unlocked paused 180s round. */
export function sourceFullRoundCanArmWhilePaused(v:{
 enabled:boolean;paused:boolean;awaitingPointerRelock:boolean;
 realPointerPreviouslyLocked:boolean;matchState:'STAGING'|'PLAYING'|'TIME_UP';
 practiceStatus:'IDLE'|'ARMED'|'RUNNING'|'CLEAR'|'TIME_UP'|'ABORTED';
 stopReason:string|null;
}):boolean{
 return v.enabled&&v.paused&&v.awaitingPointerRelock&&
  v.realPointerPreviouslyLocked&&v.matchState==='PLAYING'&&
  v.practiceStatus==='IDLE'&&!v.stopReason;
}
