// Presentation-only provisional audio; distances in game metres.
export function spatial(lx,ly,lz,fx,fz,x,y,z){
 if(![lx,ly,lz,fx,fz,x,y,z].every(Number.isFinite))return [0,0];
 const dx=x-lx,dy=y-ly,dz=z-lz,d=Math.hypot(dx,dy,dz);
 if(d>=42)return [0,0];
 const h=Math.hypot(dx,dz),f=Math.hypot(fx,fz);
 const pan=h>.05&&f>.05?Math.max(-1,Math.min(1,(dx*-fz+dz*fx)/(h*f)))*Math.min(1,h/3):0;
 const gain=(1/(1+(d/9)**2))*Math.min(1,(42-d)/8);
 return [gain,pan];
}

export function eventTone(kind){
 switch(kind){
 case 'ultraShot':return [180,2.1,.18,'triangle'];
 case 'tripleTornado':return [290,.52,.22,'triangle'];
 case 'chariot':return [110,1.7,.23,'square'];
 case 'blower':return [155,.6,.25,'triangle'];
 case 'waveBreaker':return [420,.55,.19,'sine'];
 case 'greatBarrier':return [330,1.65,.24,'sine'];
 case 'microLaser':return [630,.65,.16,'triangle'];
 case 'ultraStamp':return [115,.46,.19,'triangle'];
 case 'zipcaster':return [520,1.5,.15,'triangle'];
 default:return [350,1.2,.12,'sine'];
 }
}
