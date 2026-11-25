// F4 patrol preference only: no physical, ink, HP or combat authority.
export class F4PatrolNavigation{
 constructor(){this.failed=new Map();this.rejects=new Map();this.visits=new Map();this.tick=-1;}
 valid(p){return !!p&&[p.x,p.y,p.z].every(Number.isFinite);}
 copy(p){return {x:p.x,y:p.y,z:p.z};}
 near(a,b,r){return Math.abs(a.y-b.y)<=.65&&Math.hypot(a.x-b.x,a.z-b.z)<=r;}
 beginTick(t){if(!Number.isSafeInteger(t))return;if(t<this.tick){this.failed.clear();this.rejects.clear();this.visits.clear();}this.tick=t;}
 clear(id){this.failed.delete(id);this.rejects.delete(id);this.visits.delete(id);}
 newGoal(id){this.rejects.delete(id);}
 noteStalled(id,t,foot,goal){
  if(!Number.isSafeInteger(t)||!this.valid(foot)||!this.valid(goal))return;
  const list=(this.failed.get(id)??[]).filter(r=>t>=r.tick&&t-r.tick<180&&!(this.near(foot,r.foot,.25)&&this.near(goal,r.goal,.25)));
  list.push({tick:t,foot:this.copy(foot),goal:this.copy(goal)});this.failed.set(id,list.slice(-6));
 }
 avoids(id,t,foot,goal){
  if(!Number.isSafeInteger(t)||!this.valid(foot)||!this.valid(goal))return true;
  return (this.failed.get(id)??[]).some(r=>t>=r.tick&&t-r.tick<180&&this.near(foot,r.foot,2.5)&&this.near(goal,r.goal,1));
 }
 noteKccReject(id,t,foot,goal){
  if(!Number.isSafeInteger(t)||!this.valid(foot)||!this.valid(goal))return false;
  const old=this.rejects.get(id),same=old&&t>=old.last&&t-old.first<48&&this.near(foot,old.foot,.20)&&this.near(goal,old.goal,.15);
  if(same&&t===old.last)return false;
  const row=same?{...old,last:t,count:old.count+1}:{first:t,last:t,count:1,foot:this.copy(foot),goal:this.copy(goal)};
  if(row.count<3){this.rejects.set(id,row);return false;}
  this.rejects.delete(id);this.noteStalled(id,t,foot,goal);return true;
 }
 noteReached(id,t,foot){
  if(!Number.isSafeInteger(t)||!this.valid(foot))return;
  const list=(this.visits.get(id)??[]).filter(r=>t>=r.tick&&t-r.tick<240&&!this.near(r.foot,foot,.5));
  list.push({tick:t,foot:this.copy(foot)});this.visits.set(id,list.slice(-6));
 }
 rank(id,t,foot,candidates,allies,options={}){
  if(!this.valid(foot))return [];
  const rows=[];
  for(const c of candidates){
   if(!this.valid(c.point)||this.avoids(id,t,foot,c.point)||Math.hypot(c.point.x-foot.x,c.point.z-foot.z)<.35)continue;
   const ink=options.recovering?(c.ink==='OWN'?3:c.ink==='NEUTRAL'?.3:c.ink==='ENEMY'?-2:0):(c.ink==='NEUTRAL'?1.4:c.ink==='ENEMY'?1:c.ink==='OWN'?-.65:0);
   const congestion=points=>points.reduce((sum,a)=>!this.valid(a)||Math.abs(a.y-c.point.y)>.65?sum:sum+Math.max(0,1-Math.hypot(a.x-c.point.x,a.z-c.point.z)/2.5),0);
   const visits=(this.visits.get(id)??[]).filter(r=>t>=r.tick&&t-r.tick<240&&this.near(r.foot,c.point,1.3)).length;
   rows.push({candidate:c,score:ink-1.25*Math.min(2,congestion(allies))-.85*Math.min(2,congestion(options.reservations??[]))-(options.recovering?.2:.8)*Math.min(2,visits)-.09*c.order});
  }
  return rows.sort((a,b)=>b.score-a.score||a.candidate.order-b.candidate.order).map(r=>r.candidate);
 }
}
