// Presentation only. No gameplay state or RNG.
export function chooseSlot(slots,priority){
 let free=0,first=-1,weak=-1;
 for(let i=0;i<slots.length;i++){const s=slots[i];if(s.ttl<=0){free++;if(first<0)first=i;}else if(s.mode!=='FUSE'&&(s.priority??0)<priority&&(weak<0||(s.priority??0)<(slots[weak].priority??0)||((s.priority??0)===(slots[weak].priority??0)&&s.ttl<slots[weak].ttl)))weak=i;}
 return first>=0&&(priority>=2||free>10)?first:priority>=2?weak:-1;
}

export function droplet(index,count,phase,speed,up){const a=phase+index*2*Math.PI/count;return [Math.cos(a)*speed,up*(.8+.2*(index%3)),Math.sin(a)*speed];}

export function pose(x,y,z,vx,vy,vz,t,duration,size){return [x+vx*t,y+vy*t-3.2*t*t,z+vz*t,size*(.35+.65*Math.max(0,1-t/duration))];}
