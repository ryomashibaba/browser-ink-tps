/** B337 real SOURCE read-only local active cells near genuine human foot.
 * B271's three GLOBAL [center, first, last] footprint cells are designed
 * for optical registration, not locally reachable human mouse aiming.
 * This scans the SAME native PaintSurface grid and actual active mask only.
 * It NEVER writes ink, aim, gameplay positions, stage, HP, or ticks. */
export type B337SurfaceCellRead={
 id:string;widthCells:number;heightCells:number;cellSize:number;
 widthMeters:number;heightMeters:number;ownerGrid:Int8Array;
 isCellActive:(x:number,y:number)=>boolean;
 localToWorld:(u:number,v:number)=>Readonly<{x:number;y:number;z:number}>;
};
export type B337LocalAimCell={
 grid:[number,number];world:[number,number,number];
 originalOwner:number;realCellProvenance:'B337_NATIVE_LOCAL_ACTIVE_GRID';
};
const wrap=(v:number)=>((v+540)%360)-180;
const finite3=(a:readonly number[])=>a.length===3&&a.every(Number.isFinite);
export function b337NativeNearbyActiveSourceCells(input:{
 surface:B337SurfaceCellRead;body:readonly number[];
 camera:readonly number[];footGrid:readonly number[];
 yaw:number;pitch:number;
}):B337LocalAimCell[]{
 const {surface:s,body,camera,footGrid,yaw,pitch}=input;
 if(!s.id.endsWith(':paint')||s.widthCells<1||s.heightCells<1||
  !Number.isSafeInteger(s.widthCells)||!Number.isSafeInteger(s.heightCells)||
  s.widthCells*s.heightCells!==s.ownerGrid.length||
  !(s.cellSize>0&&s.cellSize<=1)||!finite3(body)||!finite3(camera)||
  footGrid.length!==2||!footGrid.every(Number.isSafeInteger)||
  footGrid[0]!<0||footGrid[0]!>=s.widthCells||
  footGrid[1]!<0||footGrid[1]!>=s.heightCells||
  !Number.isFinite(yaw)||!Number.isFinite(pitch))
  throw Error('B337_LOCAL_NATIVE_SOURCE_GRID_INVALID');
 // Runtime finite3() verifies exactly three finite source coordinates.
 // In strict TS, narrow the indexed arrays to tuples only AFTER that guard.
 const [bodyX,,bodyZ]=body as readonly [number,number,number];
 const [cameraX,cameraY,cameraZ]=camera as readonly [number,number,number];
 const radius=Math.min(Math.ceil(9/s.cellSize),90);
 const [fx,fy]=footGrid as [number,number];
 const candidates:Array<B337LocalAimCell&{score:number}>=[];
 for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
  const gx=fx+dx,gy=fy+dy;
  if(gx<0||gy<0||gx>=s.widthCells||gy>=s.heightCells||
   !s.isCellActive(gx,gy))continue;
  const owner=s.ownerGrid[gy*s.widthCells+gx]!;
  if(owner!==0&&owner!==1&&owner!==-1)
   throw Error('B337_INVALID_NATIVE_SOURCE_OWNER');
  const point=s.localToWorld(
   Math.min((gx+.5)*s.cellSize,s.widthMeters),
   Math.min((gy+.5)*s.cellSize,s.heightMeters));
  const world:[number,number,number]=[point.x,point.y,point.z];
  if(!finite3(world))throw Error('B337_NONFINITE_NATIVE_SOURCE_GRID');
  const plan=Math.hypot(world[0]-bodyX,world[2]-bodyZ);
  if(plan<2.5||plan>8)continue;
  const x=world[0]-cameraX,z=world[2]-cameraZ;
  const flat=Math.hypot(x,z);
  if(flat<=.15)continue;
  const targetYaw=Math.atan2(x,z)*180/Math.PI;
  const targetPitch=Math.atan2(world[1]-cameraY,flat)*180/Math.PI;
  const mouseX=Math.round(wrap(targetYaw-yaw)/.22);
  const mouseY=Math.round(-(targetPitch-pitch)/.18);
  if(targetPitch< -78||targetPitch>12||
   Math.abs(mouseX)>720||Math.abs(mouseY)>440)continue;
  const screenX=800+mouseX,screenY=450+mouseY;
  if(screenX<10||screenX>1590||screenY<10||screenY>890)continue;
  candidates.push({grid:[gx,gy],world,originalOwner:owner,
   realCellProvenance:'B337_NATIVE_LOCAL_ACTIVE_GRID',
   score:Math.abs(plan-4.5)+Math.abs(mouseX)*.002+
    Math.abs(mouseY)*.001});
 }
 candidates.sort((a,b)=>a.score-b.score||
  a.grid[0]-b.grid[0]||a.grid[1]-b.grid[1]);
 const selected:B337LocalAimCell[]=[];
 for(const c of candidates){
  if(selected.every(x=>Math.hypot(x.world[0]-c.world[0],
   x.world[2]-c.world[2])>.65)){
   selected.push({grid:c.grid,world:c.world,
    originalOwner:c.originalOwner,
    realCellProvenance:'B337_NATIVE_LOCAL_ACTIVE_GRID'});
  }
  if(selected.length===3)break;
 }
 return selected;
}
