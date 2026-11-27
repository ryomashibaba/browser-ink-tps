// F4 provisional raster candidates. Actual verified floor triangles only; no collider creation.
export function extractF4FloorTiles(vertices,maxSlopeRadians){
 const cell=.125,tile=8,n=64,groups=new Map(),bins=new Map();
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const sub=(a,b)=>a.map((x,i)=>x-b[i]);
 const norm=a=>{const m=Math.hypot(...a);return m>1e-9?a.map(x=>x/m):null;};
 const probes=[[.0001,.0001],[cell-.0001,.0001],[.0001,cell-.0001],[cell-.0001,cell-.0001],[cell/2,cell/2]];
 const inside=(x,y,t)=>{const side=(a,b)=>(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);const p=side(t[0],t[1]),q=side(t[1],t[2]),s=side(t[2],t[0]);return Math.min(p,q,s)>=-1e-8||Math.max(p,q,s)<=1e-8;};
 if(vertices.length%9||!Number.isFinite(maxSlopeRadians)||maxSlopeRadians<=0||maxSlopeRadians>=Math.PI/2)throw Error("F4 floor input");
 const minY=Math.cos(maxSlopeRadians);
 for(let i=0;i<vertices.length;i+=9){
  const a=[vertices[i],vertices[i+1],vertices[i+2]],b=[vertices[i+3],vertices[i+4],vertices[i+5]],c=[vertices[i+6],vertices[i+7],vertices[i+8]];
  if(![...a,...b,...c].every(Number.isFinite))throw Error("F4 floor nonfinite");
  let normal=norm(cross(sub(b,a),sub(c,a)));if(!normal)continue;
  if(normal[1]<0)normal=normal.map(x=>-x);
  if(normal[1]<minY-1e-6)continue;
  const q=normal.map(x=>Math.round(x*10000)),nv=norm(q);if(!nv)continue;
  const offset=Math.round(dot(nv,a)*200)/200;
  if([a,b,c].some(p=>Math.abs(dot(nv,p)-offset)>.012))continue;
  const key=[...q,offset].join(":");
  let g=groups.get(key);
  if(!g){const u=norm([nv[1],-nv[0],0]),v=cross(nv,u);g={normal:nv,u,v,offset,key};groups.set(key,g);}
  const t=[a,b,c].map(p=>[dot(g.u,p),dot(g.v,p)]);
  const minU=Math.min(...t.map(p=>p[0])),maxU=Math.max(...t.map(p=>p[0])),minV=Math.min(...t.map(p=>p[1])),maxV=Math.max(...t.map(p=>p[1]));
  for(let x=Math.floor(minU/tile);x<Math.ceil(maxU/tile);x++)for(let y=Math.floor(minV/tile);y<Math.ceil(maxV/tile);y++){
   const id=key+":"+x+":"+y;let row=bins.get(id);
   if(!row){if(bins.size>=2048)throw Error("F4 floor candidate limit");row={...g,id,minU:x*tile,minV:y*tile,width:tile,height:tile,mask:new Uint8Array(n*n),positions:[]};bins.set(id,row);}
   row.positions.push(...a,...b,...c);
   const x0=Math.max(0,Math.floor((minU-row.minU)/cell)),x1=Math.min(n-1,Math.floor((maxU-row.minU)/cell)),y0=Math.max(0,Math.floor((minV-row.minV)/cell)),y1=Math.min(n-1,Math.floor((maxV-row.minV)/cell));
   for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++){
    const k=iy*n+ix;if(row.mask[k]===31)continue;
    const U=row.minU+ix*cell,V=row.minV+iy*cell;
    for(let j=0;j<5;j++)if(inside(U+probes[j][0],V+probes[j][1],t))row.mask[k]|=1<<j;
   }
  }
 }
 const result=[];
 for(const row of bins.values()){let cells=0;for(let i=0;i<row.mask.length;i++){row.mask[i]=row.mask[i]===31?1:0;cells+=row.mask[i];}if(cells)result.push({...row,cells});}
 return result;
}
