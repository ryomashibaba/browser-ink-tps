/** B343 real available projectile slots only; no fabricated physics. */
export function b343CanLaunchSourceVolley(free:number,requested:number):boolean{
 return Number.isSafeInteger(free)&&free>=0&&
  Number.isSafeInteger(requested)&&requested>0&&free>=requested;
}

/** Explicit, clean, new original SOURCE-only shooter practice world. */
export function b343SourceShooterPracticeHref(href:string,enable:boolean):string|null{
 const u=new URL(href);
 if(u.searchParams.get('t21Play')!=='preview'||
    u.searchParams.get('t21QaDrive')!=='source')return null;
 const next=new URL(u.pathname,u.origin);
 next.searchParams.set('t21Play','preview');
 next.searchParams.set('t21QaDrive','source');
 if(enable){
  next.searchParams.set('t21W10B203','fullRound');
  next.searchParams.set('t21W10B343','sourceVolleyAtomic');
  next.searchParams.set('t21W10B355','realInkHud');
  next.searchParams.set('t21W10B356','realImpactReticle');
 }
 return next.href;
}
