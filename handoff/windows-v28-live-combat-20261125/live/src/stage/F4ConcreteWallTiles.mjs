// Candidate wall tiles are clipped from verified concrete source triangles.
// Their local basis follows the exact vertical plane; no rectangle is invented.
export function extractF4ConcreteWallTiles(vertices,limit=12) {
  const tile=6,cell=.125,n=48,bins=new Map(),planes=new Map();
  if(vertices.length%9||!Number.isInteger(limit)||limit<1||limit>64)throw Error('invalid wall input');
  const inside=(x,y,a,b,c)=>{
    const ab=(b.u-a.u)*(y-a.v)-(b.v-a.v)*(x-a.u);
    const bc=(c.u-b.u)*(y-b.v)-(c.v-b.v)*(x-b.u);
    const ca=(a.u-c.u)*(y-c.v)-(a.v-c.v)*(x-c.u);
    return (ab>=-1e-8&&bc>=-1e-8&&ca>=-1e-8)||
      (ab<=1e-8&&bc<=1e-8&&ca<=1e-8);
  };
  const clip=(polygon,axis,bound,greater)=>{
    const out=[];if(!polygon.length)return out;
    const coord=p=>axis===0?p.u:p.v,accept=p=>greater?coord(p)>=bound-1e-9:coord(p)<=bound+1e-9;
    let a=polygon[polygon.length-1],ain=accept(a);
    for(const b of polygon){
      const bin=accept(b);
      if(ain!==bin){
        const av=coord(a),bv=coord(b),t=Math.max(0,Math.min(1,(bound-av)/(bv-av)));
        out.push({u:a.u+(b.u-a.u)*t,v:a.v+(b.v-a.v)*t,
          x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});
      }
      if(bin)out.push(b);
      a=b;ain=bin;
    }
    return out;
  };
  const probes=[[.0001,.0001],[cell-.0001,.0001],[.0001,cell-.0001],[cell-.0001,cell-.0001],[cell/2,cell/2]];
  for(let i=0;i<vertices.length;i+=9){
    const a={x:vertices[i],y:vertices[i+1],z:vertices[i+2]},
      b={x:vertices[i+3],y:vertices[i+4],z:vertices[i+5]},
      c={x:vertices[i+6],y:vertices[i+7],z:vertices[i+8]};
    if(![a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z].every(Number.isFinite))throw Error('nonfinite wall geometry');
    const abx=b.x-a.x,aby=b.y-a.y,abz=b.z-a.z,
      acx=c.x-a.x,acy=c.y-a.y,acz=c.z-a.z;
    let nx=aby*acz-abz*acy,ny=abz*acx-abx*acz,nz=abx*acy-aby*acx;
    const mag=Math.hypot(nx,ny,nz);if(mag<1e-7||Math.abs(ny)/mag>=.1)continue;
    nx/=mag;ny/=mag;nz/=mag;
    if(nx< -1e-8||(Math.abs(nx)<=1e-8&&nz<0)){nx=-nx;ny=-ny;nz=-nz;}
    // Quantized key merges adjacent source triangles on the same real plane.
    const qx=Math.round(nx*1000)/1000,qy=Math.round(ny*1000)/1000,qz=Math.round(nz*1000)/1000;
    const offset=nx*a.x+ny*a.y+nz*a.z,key=[qx,qy,qz,Math.round(offset*1000)/1000].join(':');
    let plane=planes.get(key);
    if(!plane){
      const qmag=Math.hypot(qx,qy,qz),N=[qx/qmag,qy/qmag,qz/qmag];
      const v=[-N[0]*N[1],1-N[1]*N[1],-N[2]*N[1]],vmag=Math.hypot(...v);
      v[0]/=vmag;v[1]/=vmag;v[2]/=vmag;
      // U x V = N, so PaintSurface's registered normal matches the exact wall.
      const u=[v[1]*N[2]-v[2]*N[1],v[2]*N[0]-v[0]*N[2],v[0]*N[1]-v[1]*N[0]];
      const umag=Math.hypot(...u);u[0]/=umag;u[1]/=umag;u[2]/=umag;
      plane={key,normal:N,uAxis:u,vAxis:v,offset};planes.set(key,plane);
    }
    const project=p=>({u:p.x*plane.uAxis[0]+p.y*plane.uAxis[1]+p.z*plane.uAxis[2],
      v:p.x*plane.vAxis[0]+p.y*plane.vAxis[1]+p.z*plane.vAxis[2],x:p.x,y:p.y,z:p.z});
    const tri=[project(a),project(b),project(c)];
    const minU=Math.min(...tri.map(p=>p.u)),maxU=Math.max(...tri.map(p=>p.u));
    const minV=Math.min(...tri.map(p=>p.v)),maxV=Math.max(...tri.map(p=>p.v));
    const ux=Math.floor(minU/tile),uy=Math.ceil(maxU/tile)-1,vx=Math.floor(minV/tile),vy=Math.ceil(maxV/tile)-1;
    if((uy-ux+1)*(vy-vx+1)>256)continue;
    for(let tu=ux;tu<=uy;tu++)for(let tv=vx;tv<=vy;tv++){
      const tileU=tu*tile,tileV=tv*tile,binKey=key+':'+tu+':'+tv;
      let row=bins.get(binKey);
      if(!row){
        if(bins.size>=1024)throw Error('wall candidate cap');
        row={axis:3,plane:plane.offset,planeKey:key,normal:plane.normal,uAxis:plane.uAxis,vAxis:plane.vAxis,
          minU:tileU,minV:tileV,width:tile,height:tile,mask:new Uint8Array(n*n),positions:[]};
        bins.set(binKey,row);
      }
      let polygon=tri;
      polygon=clip(polygon,0,tileU,true);polygon=clip(polygon,0,tileU+tile,false);
      polygon=clip(polygon,1,tileV,true);polygon=clip(polygon,1,tileV+tile,false);
      for(let p=1;p+1<polygon.length;p++){
        const p0=polygon[0],p1=polygon[p],p2=polygon[p+1];
        row.positions.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);
      }
      const x0=Math.max(0,Math.floor((minU-tileU)/cell)),x1=Math.min(n-1,Math.floor((maxU-tileU)/cell));
      const y0=Math.max(0,Math.floor((minV-tileV)/cell)),y1=Math.min(n-1,Math.floor((maxV-tileV)/cell));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const k=y*n+x;if(row.mask[k]===31)continue;
        const U=tileU+x*cell,V=tileV+y*cell;let bit=1;
        for(const [du,dv] of probes){if(inside(U+du,V+dv,tri[0],tri[1],tri[2]))row.mask[k]|=bit;bit<<=1;}
      }
    }
  }
  const rows=[];
  for(const row of bins.values()){
    let cells=0,maxColumn=0,lowest=Infinity;
    for(let x=0;x<n;x++){let column=0;for(let y=0;y<n;y++){
      const k=y*n+x;row.mask[k]=row.mask[k]===31?1:0;
      if(row.mask[k]){cells++;column++;lowest=Math.min(lowest,row.minV+y*cell);}else column=0;
      maxColumn=Math.max(maxColumn,column);
    }}
    if(cells<64||maxColumn<8)continue;
    rows.push({...row,cells,lowest});
  }
  rows.sort((a,b)=>b.cells-a.cells||a.lowest-b.lowest||a.planeKey.localeCompare(b.planeKey)||a.minU-b.minU||a.minV-b.minV);
  return rows.slice(0,limit);
}
