// Provisional wall candidates from exact verified concrete triangle positions.
export function extractF4ConcreteWallTiles(vertices,limit=12) {
  // Exact axis-aligned source triangles only. No invented plane or geometry.
  const tile=6,cell=.125,n=48,eps=.002,bins=new Map();
  if(vertices.length%9||!Number.isInteger(limit)||limit<1||limit>64)throw Error("invalid wall input");
  const inside=(x,y,a,b,c)=>{
    const cross=(u,v)=>(v[0]-u[0])*(y-u[1])-(v[1]-u[1])*(x-u[0]);
    const d=[cross(a,b),cross(b,c),cross(c,a)];
    return d.every(q=>q>=-1e-8)||d.every(q=>q<=1e-8);
  };
  for(let i=0;i<vertices.length;i+=9){
    const a=Array.from(vertices.slice(i,i+3)),b=Array.from(vertices.slice(i+3,i+6)),c=Array.from(vertices.slice(i+6,i+9));
    if(![...a,...b,...c].every(Number.isFinite))throw Error("nonfinite wall geometry");
    const dx=b.map((v,j)=>v-a[j]),dy=c.map((v,j)=>v-a[j]);
    const normal=[dx[1]*dy[2]-dx[2]*dy[1],dx[2]*dy[0]-dx[0]*dy[2],dx[0]*dy[1]-dx[1]*dy[0]],mag=Math.hypot(...normal);
    if(mag<1e-7)continue;
    const axis=Math.abs(normal[0])>Math.abs(normal[2])?0:2,u=axis===0?2:0;
    if(Math.abs(normal[axis])/mag<.9999)continue;
    const plane=Math.round(a[axis]*1000)/1000;
    if([a,b,c].some(v=>Math.abs(v[axis]-plane)>eps))continue;
    const tri=[a,b,c].map(v=>[v[u],v[1]]),minU=Math.min(...tri.map(v=>v[0])),maxU=Math.max(...tri.map(v=>v[0])),minV=Math.min(...tri.map(v=>v[1])),maxV=Math.max(...tri.map(v=>v[1]));
    const ux=Math.floor(minU/tile),uy=Math.ceil(maxU/tile)-1,vx=Math.floor(minV/tile),vy=Math.ceil(maxV/tile)-1;
    if((uy-ux+1)*(vy-vx+1)>256)continue;
    for(let tu=ux;tu<=uy;tu++)for(let tv=vx;tv<=vy;tv++){
      const key=[axis,plane,tu,tv].join(":");
      let row=bins.get(key);
      if(!row){if(bins.size>=1024)throw Error("wall candidate cap");row={axis,plane,minU:tu*tile,minV:tv*tile,width:tile,height:tile,mask:new Uint8Array(n*n),positions:[]};bins.set(key,row);}
      row.positions.push(...a,...b,...c);
      const x0=Math.max(0,Math.floor((minU-row.minU)/cell)),x1=Math.min(n-1,Math.floor((maxU-row.minU)/cell)),y0=Math.max(0,Math.floor((minV-row.minV)/cell)),y1=Math.min(n-1,Math.floor((maxV-row.minV)/cell));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const k=y*n+x;
        if(row.mask[k]===31)continue;
        const U=row.minU+x*cell,V=row.minV+y*cell;
        let bit=1;
        for(const [du,dv] of [[.0001,.0001],[cell-.0001,.0001],[.0001,cell-.0001],[cell-.0001,cell-.0001],[cell/2,cell/2]]){
          if(inside(U+du,V+dv,...tri))row.mask[k]|=bit;
          bit<<=1;
        }
      }
    }
  }
  const rows=[];
  for(const row of bins.values()){
    let cells=0,maxColumn=0,lowest=Infinity;
    for(let x=0;x<n;x++){let column=0;for(let y=0;y<n;y++){const k=y*n+x;row.mask[k]=row.mask[k]===31?1:0;if(row.mask[k]){cells++;column++;lowest=Math.min(lowest,row.minV+y*cell);maxColumn=Math.max(maxColumn,column);}else column=0;}}
    // Prefer wide real wall patches with >=1m of vertical coverage.
    if(cells<64||maxColumn<8)continue;
    rows.push({...row,cells,lowest});
  }
  // Keep candidate pool bounded before actual physical floor/backing admission.
  rows.sort((a,b)=>b.cells-a.cells||a.lowest-b.lowest||a.axis-b.axis||a.plane-b.plane||a.minU-b.minU||a.minV-b.minV);
  return rows.slice(0,limit);
}
