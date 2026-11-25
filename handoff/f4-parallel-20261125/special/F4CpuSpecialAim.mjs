// CPU-only aim admission; no synthetic contact, damage or launch.
export function cpuTornadoAim(origin,target,cast,lob){
 if(![origin,target].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))return null;
 const floor=cast([target[0],target[1]+.08,target[2]],[target[0],target[1]-2.2,target[2]]);
 if(!floor||!Array.isArray(floor.point)||floor.point.length!==3||!floor.point.every(Number.isFinite)||!Number.isFinite(floor.normal?.[1])||floor.normal[1]<.55)return null;
 const p=floor.point,delta=p.map((v,i)=>v-origin[i]),distance=Math.hypot(...delta);
 const aim=lob(delta,distance,12,12,2.1);
 if(!aim)return null;
 const horizontal=Math.hypot(delta[0],delta[2]),velocity=12*Math.hypot(aim[0],aim[2]);
 if(horizontal<.1||velocity<.01)return null;
 const flight=horizontal/velocity;
 if(flight>2.1)return null;
 let last=origin;
 const end=Math.min(2.1,flight+.15),steps=Math.ceil(end/.10);
 for(let i=1;i<=steps;i++){
  const t=end*i/steps,point=origin.map((v,j)=>v+12*aim[j]*t-(j===1?6*t*t:0));
  const hit=cast(last,point);
  if(hit){
   if(!Array.isArray(hit.point)||hit.point.length!==3||!hit.point.every(Number.isFinite)||!Number.isFinite(hit.normal?.[1])||hit.normal[1]<.55)return null;
   return Math.hypot(...hit.point.map((v,j)=>v-p[j]))<=.8?aim:null;
  }
  last=point;
 }
 return null;
}
