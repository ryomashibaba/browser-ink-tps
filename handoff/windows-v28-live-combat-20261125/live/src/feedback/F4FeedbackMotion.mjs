// Presentation only. No gameplay state or RNG.
export function chooseSlot(slots,priority){
 let free=0,first=-1,weak=-1;
 for(let i=0;i<slots.length;i++){const s=slots[i];if(s.ttl<=0){free++;if(first<0)first=i;}else if(s.mode!=='FUSE'&&(s.priority??0)<priority&&(weak<0||(s.priority??0)<(slots[weak].priority??0)||((s.priority??0)===(slots[weak].priority??0)&&s.ttl<slots[weak].ttl)))weak=i;}
 // Keep two free slots for real local HP/lifecycle cues (priority 4).
 // Ordinary impact/fuse reserves and protection of existing fuses remain.
 const reserve=priority>=4?0:priority>=2?2:10;
 return first>=0&&free>reserve?first:priority>=2?weak:-1;
}

export function droplet(index,count,phase,speed,up){const a=phase+index*2*Math.PI/count;return [Math.cos(a)*speed,up*(.8+.2*(index%3)),Math.sin(a)*speed];}

// Distance LOD affects only extra decorative droplets, never the central cue.
export function particleBudget(count,distanceSq){
 if(!Number.isSafeInteger(count)||count<=0)return 0;
 if(!Number.isFinite(distanceSq)||distanceSq<0)return count;
 if(distanceSq<=144)return count;
 if(distanceSq<=576)return Math.max(1,Math.ceil(count*.5));
 if(distanceSq<=1764)return Math.min(2,count);
 return 0;
}
export function pose(x,y,z,vx,vy,vz,t,duration,size){
 const remaining=Math.max(0,Math.min(1,1-t/duration));
 return [x+vx*t,y+vy*t-3.2*t*t,z+vz*t,size*remaining*(1.35-.35*remaining)];
}
