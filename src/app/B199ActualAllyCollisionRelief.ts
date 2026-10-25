/** B199 — only an already-audited ORIGINAL local patrol foot may be
 * proposed to move physically rejoined A1 out of actual human's capsule.
 * This pure DENY/rank step has zero movement or stage authority.
 */
export type B199OriginalFoot=Readonly<{x:number;y:number;z:number}>;
export function b199ActualAllyCollisionReliefCandidates(input:{
 enabled:boolean;allySyncPracticeRunning:boolean;humanGrounded:boolean;
 humanActive:boolean;cpuRejoined:boolean;
 human:B199OriginalFoot;cpu:B199OriginalFoot;
 existingAuditedSourceFeet:readonly B199OriginalFoot[];
}):B199OriginalFoot[]{
 const {human:h,cpu:a}=input;
 const finite=(p:B199OriginalFoot)=>[p.x,p.y,p.z].every(Number.isFinite);
 if(!input.enabled||!input.allySyncPracticeRunning||!input.humanGrounded||
    !input.humanActive||!input.cpuRejoined||!finite(h)||!finite(a)||
    h.z<33||a.z<33||h.y<2.7||h.y>5.25||
    a.y<2.7||a.y>5.25||Math.abs(h.y-a.y)>.30)return [];
 const separation=Math.hypot(h.x-a.x,h.z-a.z);
 // Only when truly close; leave natural safe ~2m ally shooting alone.
 if(separation>1.65)return [];
 return input.existingAuditedSourceFeet.filter(g=>{
  if(!finite(g)||g.z<33||g.y<2.7||g.y>5.25||
    Math.abs(g.y-a.y)>.35||Math.abs(g.y-h.y)>.35)return false;
  const hDist=Math.hypot(g.x-h.x,g.z-h.z);
  const aDist=Math.hypot(g.x-a.x,g.z-a.z);
  // Sideways goal stays outside physical human approach lane.
  return hDist>=3&&hDist<=12&&aDist>=1.8&&aDist<=14&&
    Math.abs(g.x-h.x)>=1.65;
 }).sort((u,v)=>{
  const du=Math.hypot(u.x-h.x,u.z-h.z);
  const dv=Math.hypot(v.x-h.x,v.z-h.z);
  return Math.abs(du-3.5)-Math.abs(dv-3.5)||
   du-dv||u.x-v.x||u.z-v.z;
 });
}
