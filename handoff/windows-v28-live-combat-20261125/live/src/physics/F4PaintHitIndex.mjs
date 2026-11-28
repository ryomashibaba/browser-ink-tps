// F4 only: static conservative XZ bins, preserving input order. No hit authority.
export function buildF4PaintHitIndex(surfaces,tolerance){
 if(!Number.isFinite(tolerance)||tolerance<0)return null;
 const bins=new Map(),cell=8;let assignments=0;
 for(const s of surfaces){
  const {x,z}=s.center;
  const r=Math.hypot(s.widthMeters*.5,s.heightMeters*.5,tolerance)+.001;
  if(![x,z,r].every(Number.isFinite)||r<=0)return null;
  const x0=Math.floor((x-r)/cell),x1=Math.floor((x+r)/cell),
    z0=Math.floor((z-r)/cell),z1=Math.floor((z+r)/cell);
  if(![x0,x1,z0,z1].every(Number.isSafeInteger))return null;
  const count=(x1-x0+1)*(z1-z0+1);
  if(count>4096||assignments+count>262144)return null;
  assignments+=count;
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){
   const key=i+':'+j,bin=bins.get(key);
   if(bin)bin.push(s);else bins.set(key,[s]);
  }
 }
 return {surfaces,length:surfaces.length,bins,cell};
}
export function queryF4PaintHitIndex(index,surfaces,point){
 if(!index||index.surfaces!==surfaces||index.length!==surfaces.length||
    ![point.x,point.y,point.z].every(Number.isFinite))return surfaces;
 const x=Math.floor(point.x/index.cell),z=Math.floor(point.z/index.cell);
 if(!Number.isSafeInteger(x)||!Number.isSafeInteger(z))return surfaces;
 return index.bins.get(x+':'+z)??[];
}
