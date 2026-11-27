// F4 CPU decision policy only; the caller owns real weapon/ink/physical authority.
export function chooseRailRelease(s,rail){
 const reset={heldSeconds:0,releaseFraction:null};
 if(!s||typeof rail!=="function"||![s.heldSeconds,s.dt,s.fullSeconds,s.minSeconds,s.distance,s.ink].every(Number.isFinite)||
  s.heldSeconds<0||s.dt<=0||s.fullSeconds<=0||s.minSeconds<0||s.minSeconds>s.fullSeconds||s.distance<=0||s.ink<0)return reset;
 const min=s.minSeconds/s.fullSeconds;
 const full=rail(1),minimum=rail(min);
 if(!full||!minimum||![full.range,full.inkCost,minimum.inkCost].every(Number.isFinite)||
  s.distance>full.range||s.ink+1e-6<minimum.inkCost)return reset;
 const heldSeconds=Math.min(s.fullSeconds,s.heldSeconds+s.dt);
 const fraction=heldSeconds/s.fullSeconds;
 const waiting={heldSeconds,releaseFraction:null};
 if(fraction+1e-8<min)return waiting;
 const shot=rail(fraction);
 if(!shot||![shot.range,shot.inkCost].every(Number.isFinite))return reset;
 const affordable=shot.inkCost<=s.ink+1e-6;
 const reaches=shot.range>=s.distance;
 const fullAffordable=full.inkCost<=s.ink+1e-6;
 // Prefer a full real shot, except when close under pressure or when the
 // actual current tank cannot afford full charge. Never invent a charge.
 const emergency=s.distance<=5||(s.recentlyHit===true&&s.distance<=11);
 const ready=fraction>=1-1e-8||!fullAffordable||emergency&&fraction>=Math.max(min,.35);
 if(ready&&affordable&&reaches)return {heldSeconds,releaseFraction:fraction};
 // An already held charge cannot be dialled down to bypass actual ink cost.
 // Release only if paid; allow recovery rather than locking a dry gun.
 if(!affordable&&!fullAffordable)return reset;
 return waiting;
}

export function reachablePreference(origin,candidates,preferred,range){
 if(!preferred||!origin||!Array.isArray(candidates)||!Number.isFinite(range)||range<=0)return null;
 const c=candidates.find(e=>e.id===preferred),p=c?.body;
 if(!p||![origin.x,origin.y,origin.z,p.x,p.y,p.z].every(Number.isFinite))return null;
 return Math.hypot(p.x-origin.x,p.y-origin.y,p.z-origin.z)<=range?preferred:null;
}


// F4 terrain is multi-level. A fixed original-source vertical band can
// exclude a genuinely reachable exposed body. Use a conservative 3D
// weapon envelope and the caller's actual stage ray, never a hit grant.
export function chooseF4PhysicalSight(origin,candidates,blocked,preferred=null,range=32,preferenceRange=12){
 const empty={actorId:null,target:null,rays:0,coverRejects:0};
 const valid=p=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
 if(!valid(origin)||!Array.isArray(candidates)||typeof blocked!=='function'||!Number.isFinite(range)||range<=0)return empty;
 const reach=Math.min(32,range),pref=Number.isFinite(preferenceRange)?Math.max(0,Math.min(reach,preferenceRange)):0;
 const dist=p=>Math.hypot(p.x-origin.x,p.y-origin.y,p.z-origin.z);
 const ordered=candidates.filter(c=>c?.id&&valid(c.body)).map((c,i)=>({c,i,d:dist(c.body)}))
  .filter(({c})=>[c.body,...(c.alternateHitPoints??[])].some((p,i)=>valid(p)&&
   (i===0||p.x===c.body.x&&p.z===c.body.z&&Math.abs(p.y-c.body.y)<=.4)&&dist(p)>=.2&&dist(p)<=reach))
  .sort((a,b)=>Number(b.c.id===preferred&&b.d<=pref)-Number(a.c.id===preferred&&a.d<=pref)||a.d-b.d||a.i-b.i);
 let rays=0,coverRejects=0;
 for(const {c} of ordered){
  for(const [i,p] of [c.body,...(c.alternateHitPoints??[])].entries()){
   if(!valid(p)||(i>0&&(p.x!==c.body.x||p.z!==c.body.z||Math.abs(p.y-c.body.y)>.4)))continue;
   const distance=dist(p);if(distance<.2||distance>reach)continue;
   rays++;
   if(blocked(origin,p)){coverRejects++;continue;}
   return {actorId:c.id,target:p,rays,coverRejects};
  }
 }
 return {actorId:null,target:null,rays,coverRejects};
}

// F4 cache uses the same 3D envelope as fresh sight. The caller MUST
// reray the returned current physical point; cached visibility is not authority.
export function reuseF4PhysicalSight(cached,frame,origin,candidates,range){
 const valid=p=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 if(!cached?.actorId||!Number.isSafeInteger(cached.frame)||!Number.isSafeInteger(frame)||
    frame<cached.frame||frame-cached.frame>=8||!valid(origin)||!valid(cached.origin)||
    !valid(cached.target)||!Array.isArray(candidates)||!Number.isFinite(range)||range<=0||
    distance(origin,cached.origin)>.20)return null;
 const actor=candidates.find(c=>c?.id===cached.actorId);
 if(!valid(actor?.body))return null;
 const reach=Math.min(32,range);
 let best=null,bestDelta=Infinity;
 for(const [i,p] of [actor.body,...(actor.alternateHitPoints??[])].entries()){
  if(!valid(p)||(i>0&&(p.x!==actor.body.x||p.z!==actor.body.z||Math.abs(p.y-actor.body.y)>.4)))continue;
  const d=distance(origin,p),delta=distance(cached.target,p);
  if(d<.2||d>reach||delta>.20||delta>=bestDelta)continue;
  best=p;bestDelta=delta;
 }
 return best;
}
