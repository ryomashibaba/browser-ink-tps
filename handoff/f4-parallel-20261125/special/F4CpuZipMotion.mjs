// F4 provisional CPU Zipcaster; selects and requests physical actions only.
export function selectCpuZipHook(input,probe){
 const {tick,ready,canStart,grounded,hp,direction,distance}=input;
 if(!ready||!canStart||!grounded||!Number.isInteger(tick)||tick<0||tick>10050||!Number.isFinite(hp)||hp<=0||!Number.isFinite(distance)||distance<3||distance>20||!Array.isArray(direction)||direction.length!==3||!direction.every(Number.isFinite))return null;
 const yaw=Math.atan2(direction[0],direction[2]);if(Math.hypot(direction[0],direction[2])<1e-5)return null;
 let best=null,bestScore=-Infinity;
 for(const angle of [0,-.52,.52,-1.05,1.05])for(const rise of [.18,.48]){
  const ray=[Math.sin(yaw+angle)*Math.cos(rise),Math.sin(rise),Math.cos(yaw+angle)*Math.cos(rise)];
  const c=probe(ray);
  if(!c||c.targetClear!==true||!Number.isFinite(c.targetDistance)||c.targetDistance<1||c.targetDistance>11||!Number.isFinite(c.distance)||c.distance<1||c.distance>18)continue;
  const score=11-c.targetDistance-.15*c.distance-.5*Math.abs(angle);
  if(score>bestScore){best=c;bestScore=score}
 }
 return best;
}
export class CpuZipMotion {
 constructor(candidate,tick,lifeId){
  this.candidate=candidate;this.started=tick;this.lifeId=lifeId;this.phase="OUTBOUND";this.stalls=0;this.lost=0;this.returnTick=null;this.lastTick=tick-1;
 }
 step({tick,lifeId,foot,visible,hp},port){
  const out=(footResult=null,canFire=false)=>({phase:this.phase,foot:footResult,canFire});
  const terminal=()=>["RETURNED","FALL_REQUIRED","CANCELLED"].includes(this.phase);
  if(terminal())return out();
  if(lifeId!==this.lifeId||!Number.isFinite(hp)||hp<=0||tick>=10800){this.phase="CANCELLED";return out()}
  if(!Number.isInteger(tick)||tick<=this.lastTick)return out();
  this.lastTick=tick;
  const c=this.candidate, dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
  if(!Array.isArray(foot)||foot.length!==3||!foot.every(Number.isFinite)){this.phase="FALL_REQUIRED";return out()}
  const startReturn=()=>{
   if(!port.returnClear(foot,c.start,c.supportId)){this.phase="FALL_REQUIRED";return}
   this.phase="RETURN";this.returnTick=tick;this.stalls=0;
  };
  if((tick-this.started>=540||this.stalls>=12||this.lost>=3||hp<=25&&this.phase==="ATTACHED")&&this.returnTick===null)startReturn();
  if(terminal())return out();
  if(this.returnTick!==null&&(tick-this.returnTick>=210||this.stalls>=12)){this.phase="FALL_REQUIRED";return out()}
  if(this.phase==="OUTBOUND"&&dist(foot,c.goal)<=.035)this.phase="CONTACT";
  if(this.phase==="RETURN"&&dist(foot,c.start)<=.035)this.phase="LANDING";
  const contact=this.phase==="CONTACT"||this.phase==="ATTACHED";
  const target=this.phase==="OUTBOUND"?c.goal:c.start;
  let delta=contact?c.normal.map(x=>-.06*x):this.phase==="LANDING"?[0,-.06,0]:target.map((x,i)=>x-foot[i]);
  const len=Math.hypot(...delta),limit=14/60;
  if(len>limit)delta=delta.map(x=>x*limit/len);
  const result=port.move(delta,c);
  if(!result||!Array.isArray(result.foot)||result.foot.length!==3||!result.foot.every(Number.isFinite)||dist(foot,result.foot)>limit+.03){this.stalls++;return out()}
  const moved=dist(foot,result.foot);
  this.stalls=contact?0:moved<.001?this.stalls+1:0;
  if(contact){
   if(result.wallContact===true&&dist(result.foot,c.goal)<=.22){this.phase="ATTACHED";this.lost=0}
   else this.lost++;
  }else if(this.phase==="LANDING"&&result.grounded===true){
   this.phase=result.supportId===c.supportId&&dist(result.foot,c.start)<=.12?"RETURNED":"FALL_REQUIRED";
  }
  return out(result.foot,this.phase==="ATTACHED"&&this.lost===0&&visible===true);
 }
}
