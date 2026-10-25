/** Real 60Hz enemy-foot velocity predicts only an aim point, never a hit. */
export interface B212Point{readonly x:number;readonly y:number;readonly z:number}
export interface B212Input {
 muzzle:B212Point;actualBody:B212Point;
 currentFoot:B212Point;previousFoot:B212Point;
 dt:number;projectileSpeed:number;
}
export function b212NativeLead(x:B212Input){
 if(![x.muzzle,x.actualBody,x.currentFoot,x.previousFoot]
      .every(p=>[p.x,p.y,p.z].every(Number.isFinite))||
    !Number.isFinite(x.dt)||x.dt<=0||x.dt>1/20||
    !Number.isFinite(x.projectileSpeed)||x.projectileSpeed<3)return null;
 const dx=x.currentFoot.x-x.previousFoot.x;
 const dz=x.currentFoot.z-x.previousFoot.z;
 const speed=Math.hypot(dx,dz)/x.dt;
 const deltaY=Math.abs(x.currentFoot.y-x.previousFoot.y);
 if(!Number.isFinite(speed)||speed<.2||speed>12||deltaY>.12)return null;
 const distance=Math.hypot(x.actualBody.x-x.muzzle.x,
  x.actualBody.z-x.muzzle.z);
 if(distance<1||distance>32)return null;
 const travelSeconds=Math.min(.30,distance/x.projectileSpeed);
 const leadMeters=Math.min(.85,speed*travelSeconds);
 if(leadMeters<.01)return null;
 const scale=leadMeters/speed/x.dt;
 return {aim:{x:x.actualBody.x+dx*scale,y:x.actualBody.y,
    z:x.actualBody.z+dz*scale},leadMeters,travelSeconds};
}
