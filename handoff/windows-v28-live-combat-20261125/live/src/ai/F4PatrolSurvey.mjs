// Sparse F4 patrol opportunity shortlist, never paint or movement authority.
export class F4PatrolSurvey {
 constructor(){this.next=new Map();this.lastTick=-1;}
 clear(id){this.next.delete(id);}
 beginTick(tick){if(Number.isSafeInteger(tick)&&tick<this.lastTick)this.next.clear();this.lastTick=tick;}
 // Proposal only. Read actual owner/flag cells; physical backing and native path
 // are checked by the caller for a bounded shortlist before any Crowd request.
 propose(id,tick,surface,u,v,team,paintable,wall,neutral,recovering){
  if(!Number.isSafeInteger(tick)||tick<0||tick<(this.next.get(id)??0))return [];
  if(!surface||![u,v,surface.cellSize,surface.widthMeters,surface.heightMeters].every(Number.isFinite)||
   surface.cellSize<=0||surface.widthMeters<=0||surface.heightMeters<=0||
   !Number.isSafeInteger(surface.widthCells)||!Number.isSafeInteger(surface.heightCells)||
   surface.widthCells<1||surface.heightCells<1||
   (surface.baseFlags&paintable)!==paintable||(surface.baseFlags&wall)!==0||
   !Number.isFinite(surface.normal?.y)||Math.abs(surface.normal.y)<.70)return [];
  this.next.set(id,tick+90);
  const cs=surface.cellSize,W=surface.widthCells,H=surface.heightCells;
  const cell=(x,y)=>{
   if(x<0||y<0||x>=W||y>=H)return null;
   const i=y*W+x,f=surface.flagsGrid[i],o=surface.ownerGrid[i];
   return Number.isFinite(f)&&(f&paintable)===paintable&&(f&wall)===0&&Number.isFinite(o)?o:null;
  };
  const desired=o=>o!==null&&(recovering?o===team:o!==team);
  const step=Math.max(1,Math.round(.65/cs)),seen=new Set(),out=[];
  const phase=(tick+Array.from(id).reduce((sum,ch)=>sum+ch.charCodeAt(0),0))%8;
  for(const radius of [3,5.5]){
   for(let i=0;i<8;i++){
    // Fractional phase rotates the sample set, not just its order.
    const angle=(phase/8+i)*Math.PI/4;
    const x=Math.floor((u+radius*Math.cos(angle))/cs),y=Math.floor((v+radius*Math.sin(angle))/cs),key=y*W+x;
    const owner=cell(x,y);
    if(!desired(owner)||seen.has(key))continue;seen.add(key);
    const neighbors=[[x,y],[x-step,y],[x+step,y],[x,y-step],[x,y+step]];
    let count=0,neutralCount=0;
    for(const [nx,ny] of neighbors){const o=cell(nx,ny);if(desired(o)){count++;if(o===neutral)neutralCount++;}}
    if(count<3)continue;
    // Clamp to the real edge-cell center, never sample outside the rectangle.
    const cu=(x*cs+Math.min((x+1)*cs,surface.widthMeters))*.5;
    const cv=(y*cs+Math.min((y+1)*cs,surface.heightMeters))*.5;
    if(!(cu>=0&&cv>=0&&cu<surface.widthMeters&&cv<surface.heightMeters))continue;
    out.push({u:cu,v:cv,score:count+(recovering?0:.15*neutralCount)-.08*radius});
   }
  }
  return out.sort((a,b)=>b.score-a.score).slice(0,4);
 }
}
