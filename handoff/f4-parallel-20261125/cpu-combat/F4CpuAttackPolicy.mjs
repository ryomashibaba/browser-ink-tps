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
 return Math.abs(p.y-origin.y)<=2.4&&Math.hypot(p.x-origin.x,p.z-origin.z)<=range?preferred:null;
}
