/** One real user selection; bootstrap genuine B192 native source combat and B203 full 180s. */
export function b207CombatRoundUrl(current:string):string{
 const old=new URL(current);
 if(old.protocol!=='http:'&&old.protocol!=='https:')
  throw Error('B207_INVALID_NAVIGATION_ORIGIN');
 const next=new URL(old.pathname,old.origin);
 next.searchParams.set('t21Play','preview');
 next.searchParams.set('t21QaDrive','source');
 next.searchParams.set('t21W10B183','firstDropPlay');
 next.searchParams.set('t21W10B192','humanCombat');
 next.searchParams.set('t21W10B203','fullRound');
 return next.href;
}
