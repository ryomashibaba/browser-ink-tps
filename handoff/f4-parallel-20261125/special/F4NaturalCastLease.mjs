// Natural provisional special lifecycle; no new physics, damage, gauge or effects.
export class F4NaturalCastLease {
 #rows=new Map();
 admit(id,lifeId,tick){
  if(typeof id!=="string"||!id||typeof lifeId!=="string"||!lifeId||!Number.isSafeInteger(tick)||tick<0||tick>=10800)return false;
  this.#rows.set(id,{id,lifeId,start:tick,last:tick});return true;
 }
 touch(id,lifeId,tick){
  const r=this.#rows.get(id);
  if(!r||r.lifeId!==lifeId||!Number.isSafeInteger(tick)||tick<r.last||tick>=10800)return false;
  r.last=tick;return true;
 }
 end(id,lifeId){
  const r=this.#rows.get(id);
  if(r?.lifeId!==lifeId)return false;
  return this.#rows.delete(id);
 }
 clear(){this.#rows.clear()}
 due(tick){
  if(!Number.isSafeInteger(tick)||tick<0)return [];
  return [...this.#rows.values()].flatMap(r=>{
   if(tick<r.last)return [];
   const reason=tick-r.start>=600?"natural-cast-timeout":tick-r.last>=60?"natural-input-stalled":null;
   return reason?[{id:r.id,lifeId:r.lifeId,reason}]:[];
  });
 }
}
export function cpuSpecialLaunchAim(origin,target,speed,gravity,lifetime,lob){
 if(![origin,target].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))return null;
 const delta=target.map((v,i)=>v-origin[i]),distance=Math.hypot(...delta);
 if(distance<.01||![speed,gravity,lifetime].every(Number.isFinite)||speed<=0||gravity<0||lifetime<=0)return null;
 if(gravity===0)return distance/speed<=lifetime?delta.map(x=>x/distance):null;
 return lob(delta,distance,speed,gravity,lifetime);
}
