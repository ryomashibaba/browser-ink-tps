// One real wall brush, split across physically connected atlas tile seams. No new projectile.
export function f4WallContinuationBrushes(source,neighbors,event,runs,backed){
 const prefix="F4ProvisionalWall:",paint=1,wall=8;
 if(!source?.id.startsWith(prefix)||!(source.baseFlags&paint)||!(source.baseFlags&wall)||
  ![event.centerU,event.centerV,event.radiusU,event.radiusV,event.angle].every(Number.isFinite)||
  event.radiusU<=0||event.radiusV<=0||!runs.length)return [];
 const n=source.widthCells,m=source.heightCells,c=source.cellSize;
 if(c!==.125||n!==48||m!==48||source.widthMeters!==6||source.heightMeters!==6)return [];
 const cos=Math.cos(event.angle),sin=Math.sin(event.angle);
 const radiusUSq=event.radiusU**2,radiusVSq=event.radiusV**2;
 if(!Number.isFinite(radiusUSq)||!Number.isFinite(radiusVSq)||radiusUSq<=0||radiusVSq<=0)return [];
 // Accepted runs from actual owner raster (including already owned cells).
 const left=new Uint8Array(m),right=new Uint8Array(m),bottom=new Uint8Array(n),top=new Uint8Array(n);
 for(const run of runs){
  const {row,startX,endXExclusive:end}=run;
  if(![row,startX,end].every(Number.isInteger)||row<0||row>=m||startX<0||end>n||end<=startX)continue;
  if(startX===0)left[row]=1;if(end===n)right[row]=1;
  if(row===0)bottom.fill(1,startX,end);if(row===m-1)top.fill(1,startX,end);
 }
 const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
 const eq=(a,b)=>Math.abs(a-b)<=1e-6;
 const result=[];
 for(const s of neighbors){
  if(s===source||!s.id.startsWith(prefix)||!(s.baseFlags&paint)||!(s.baseFlags&wall)||
     s.cellSize!==c||s.widthCells!==n||s.heightCells!==m||s.widthMeters!==6||s.heightMeters!==6||
     !eq(dot(s.uAxis,source.uAxis),1)||!eq(dot(s.vAxis,source.vAxis),1)||
     !eq(dot(s.normal,source.normal),1))continue;
  const delta={x:s.center.x-source.center.x,y:s.center.y-source.center.y,z:s.center.z-source.center.z};
  if(!eq(dot(delta,source.normal),0))continue;
  const du=dot(delta,source.uAxis),dv=dot(delta,source.vAxis);
  let border,neighborCell;
  if(eq(du,6)&&eq(dv,0)){border=right;neighborCell=i=>[0,i];}
  else if(eq(du,-6)&&eq(dv,0)){border=left;neighborCell=i=>[n-1,i];}
  else if(eq(du,0)&&eq(dv,6)){border=top;neighborCell=i=>[i,0];}
  else if(eq(du,0)&&eq(dv,-6)){border=bottom;neighborCell=i=>[i,m-1];}
  else continue;
  const u=event.centerU-du,v=event.centerV-dv;
  // At least one physically authorized cell on each side of the seam
  // must belong to the SAME original brush footprint. No corner jump.
  let connected=false;
  for(let i=0;i<border.length;i++){
   if(!border[i])continue;
   const [x,y]=neighborCell(i),dx=(x+.5)*c-u,dy=(y+.5)*c-v;
   const a=dx*cos+dy*sin,b=-dx*sin+dy*cos;
   if(a*a/radiusUSq+b*b/radiusVSq<=1&&backed(s,x,y)){connected=true;break;}
  }
  if(connected)result.push({surfaceId:s.id,centerU:u,centerV:v});
  if(result.length===4)break;
 }
 return result;
}
