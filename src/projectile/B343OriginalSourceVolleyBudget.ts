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
  // Existing B192 CPU combat is source-only and still requires REAL
  // Recast paths, original supported feet and same-side encounter.
  next.searchParams.set('t21W10B192','humanCombat');
  // B112 is read-only authentic Rapier foot support evidence.
  next.searchParams.set('t21W10B112','humanGround');
  next.searchParams.set('t21W10B203','fullRound');
  next.searchParams.set('t21W10B343','sourceVolleyAtomic');
  // Proven research modules are reused only in user-selected SOURCE
  // play. B348 is a project angular hypothesis, NOT Nintendo parity.
  // B351 feedback requires actual native projectile-induced CPU HP loss.
  next.searchParams.set('t21W10B345','sourceShooterOpening');
  next.searchParams.set('t21W10B346','nativeShooterPhysicsWitness');
  next.searchParams.set('t21W10B348','sourceShooterAccuracyCandidate');
  next.searchParams.set('t21W10B351','realCpuHitCue');
  next.searchParams.set('t21W10B355','realInkHud');
  next.searchParams.set('t21W10B356','realImpactReticle');
 }
 return next.href;
}
