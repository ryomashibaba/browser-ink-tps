/** W10-B142: propose a 2m-back waypoint on an ALREADY audited real
 * Recast source path. This is NOT a Rapier movement authorization; caller
 * must re-audit the waypoint's original floor, path and actor collision. */
export type B142Foot=Readonly<{x:number;y:number;z:number}>;
export function chooseB142OriginalAllyStandoff(
 path:readonly B142Foot[],human:B142Foot
):B142Foot|null{
 if(path.length<2||![human.x,human.y,human.z].every(Number.isFinite)||
    path.some(p=>![p.x,p.y,p.z].every(Number.isFinite)))return null;
 const last=path[path.length-1]!;
 if(Math.hypot(last.x-human.x,last.y-human.y,last.z-human.z)>.20)
  return null;
 let remaining=2;
 for(let i=path.length-1;i>0;i--){
  const a=path[i-1]!,b=path[i]!;
  const length=Math.hypot(b.x-a.x,b.z-a.z);
  if(length<=1e-6)continue;
  if(remaining>length){remaining-=length;continue;}
  const f=remaining/length;
  const candidate={x:b.x+(a.x-b.x)*f,
   y:b.y+(a.y-b.y)*f,z:b.z+(a.z-b.z)*f};
  const clearance=Math.hypot(candidate.x-human.x,candidate.z-human.z);
  if(clearance<1.7||clearance>3.5||Math.abs(candidate.y-human.y)>.3)
   return null;
  return candidate;
 }
 return null;
}
