// F4 whole-world patrol preferences only. No physics, paint or combat authority.
export class F4PatrolNavigation {
  constructor(){ this.failed = new Map(); }
  clear(id){ this.failed.delete(id); }
  // Real foot and the rejected/expired goal, never a proposed Crowd foot.
  noteStalled(id, tick, foot, goal){
    if(!Number.isSafeInteger(tick)||!this.valid(foot)||!this.valid(goal))return;
    const copy=p=>({x:p.x,y:p.y,z:p.z});
    const list=(this.failed.get(id)??[]).filter(r=>tick>=r.tick&&tick-r.tick<180);
    list.push({tick,foot:copy(foot),goal:copy(goal)});
    this.failed.set(id,list.slice(-6));
  }
  valid(p){return !!p&&[p.x,p.y,p.z].every(Number.isFinite);}
  near(a,b,r){return Math.abs(a.y-b.y)<=.65&&Math.hypot(a.x-b.x,a.z-b.z)<=r;}
  avoids(id,tick,foot,goal){
    if(!Number.isSafeInteger(tick)||!this.valid(foot)||!this.valid(goal))return true;
    return (this.failed.get(id)??[]).some(r=>tick>=r.tick&&tick-r.tick<180&&
      this.near(foot,r.foot,2.5)&&this.near(goal,r.goal,1));
  }
  rank(id,tick,foot,candidates,allies){
    if(!this.valid(foot))return [];
    const rows=[];
    for(const c of candidates){
      if(!this.valid(c.point)||this.avoids(id,tick,foot,c.point))continue;
      const distance=Math.hypot(c.point.x-foot.x,c.point.z-foot.z);
      if(distance<.35)continue;
      // Ink ownership is a read-only preference, not a paint or movement grant.
      const ink=c.ink==='NEUTRAL'?1.4:c.ink==='ENEMY'?1.0:c.ink==='OWN'?-0.65:0;
      let crowd=0;
      for(const a of allies){
        if(!this.valid(a)||Math.abs(a.y-c.point.y)>.65)continue;
        const d=Math.hypot(a.x-c.point.x,a.z-c.point.z);
        crowd+=Math.max(0,1-d/2.5);
      }
      rows.push({candidate:c,score:ink-1.25*Math.min(2,crowd)-.09*c.order});
    }
    return rows.sort((a,b)=>b.score-a.score||a.candidate.order-b.candidate.order).map(r=>r.candidate);
  }
}
