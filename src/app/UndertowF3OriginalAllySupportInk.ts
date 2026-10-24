/** B150: source-only A1 ink aim proposals. This never moves actors,
 * creates terrain, authorizes scoreable turf, or proves actual paint.
 */
export type B150Foot=Readonly<{x:number;y:number;z:number}>;
export function eligibleB150OriginalAllyInk(x:{
 nativeTick:number;approvedTick:number;cpu:B150Foot;human:B150Foot;
 approvedGoal:B150Foot;approvedHuman:B150Foot;
}):boolean{
 const {cpu:a,human:h,approvedGoal:g,approvedHuman:old}=x;
 if(!Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    !Number.isSafeInteger(x.approvedTick)||x.approvedTick<0||
    x.approvedTick>x.nativeTick||x.nativeTick-x.approvedTick>60||
    [a,h,g,old].some(p=>![p.x,p.y,p.z].every(Number.isFinite)||
     p.z<33||p.y<2.7||p.y>5.25))return false;
 const distance=Math.hypot(a.x-h.x,a.z-h.z);
 return distance>=1.7&&distance<=2.45&&
  Math.abs(a.y-h.y)<=.30&&
  Math.hypot(a.x-g.x,a.z-g.z)<=.40&&
  Math.abs(a.y-g.y)<=.22&&
  Math.hypot(h.x-old.x,h.z-old.z)<=.25&&
  Math.abs(h.y-old.y)<=.10&&
  Math.hypot(g.x-h.x,g.z-h.z)>=1.7;
}
/** Directions face AWAY from real human. Samples are NOT shot orders:
 * every result must be checked against actual original paint + Rapier.
 */
export function b150OriginalAllyInkCandidates(
 cpu:B150Foot,human:B150Foot
):readonly B150Foot[]{
 const dx=cpu.x-human.x,dz=cpu.z-human.z,length=Math.hypot(dx,dz);
 if(!Number.isFinite(length)||length<1.7||
    ![cpu.y,human.y].every(Number.isFinite))return [];
 const ux=dx/length,uz=dz/length,angles=[0,Math.PI/4,-Math.PI/4,Math.PI/2,-Math.PI/2];
 const output:B150Foot[]=[];
 for(const radius of [2.4,1.9,3.1])for(const theta of angles){
  const c=Math.cos(theta),s=Math.sin(theta);
  output.push({x:cpu.x+radius*(ux*c-uz*s),y:cpu.y,
   z:cpu.z+radius*(uz*c+ux*s)});
 }
 return output;
}
