/** Low-arc launch matching ProjectileSystem's fixed-step semi-implicit gravity.
 * Returns only a direction; actual stage and actor intersections remain authoritative. */
export function fixedStepLaunch(dx:number, dy:number, dz:number, speed:number, gravity:number, dt:number, life:number): {x:number;y:number;z:number}|null {
 if (![dx,dy,dz,speed,gravity,dt,life].every(Number.isFinite) || speed<=0 || gravity<=0 || dt<=0 || life<=dt) return null;
 const horizontal=Math.hypot(dx,dz);
 if (horizontal<1e-5) return null;
 // Projectile movement on tick k uses vy - k*g*dt. Within a tick,
 // collision is tested along the segment between consecutive positions.
 const required=(t:number)=>{
  const ticks=Math.floor(t/dt);
  const fraction=t/dt-ticks;
  const drop=gravity*dt*dt*(ticks*(ticks+1)/2+(ticks+1)*fraction);
  return (horizontal/t)**2+((dy+drop)/t)**2-speed**2;
 };
 let left=horizontal/speed;
 if (required(left)<=0) return {x:dx/(left*speed),y:(dy+gravity*dt*dt*(Math.floor(left/dt)*(Math.floor(left/dt)+1)/2+(Math.floor(left/dt)+1)*(left/dt-Math.floor(left/dt))))/(left*speed),z:dz/(left*speed)};
 // The last tick expires before it moves; do not promise unreachable arcs.
 const limit=life-dt;
 while(left<limit){
  const right=Math.min(limit,left+dt/2);
  const next=required(right);
  if(next<=0){
   let a=left,b=right;
   for(let i=0;i<30;i++){const m=(a+b)/2;if(required(m)>0)a=m;else b=m;}
   const t=(a+b)/2, n=Math.floor(t/dt), fraction=t/dt-n;
   const drop=gravity*dt*dt*(n*(n+1)/2+(n+1)*fraction);
   return {x:dx/(t*speed),y:(dy+drop)/(t*speed),z:dz/(t*speed)};
  }
  left=right;
 }
 return null;
}
