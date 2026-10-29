/** B313 pure plan from REAL B271 active original cells.
 * NEVER sets camera, stage, actor, projectiles or ownership. */
const wrap=x=>((x+540)%360)-180;
export function b313ChooseOriginalActiveAim({cells,body,camera,yaw,pitch}){
 if(!Array.isArray(cells)||cells.length<1||cells.length>3||
  !Array.isArray(body)||body.length!==3||!body.every(Number.isFinite)||
  !Array.isArray(camera)||camera.length!==3||!camera.every(Number.isFinite)||
  !Number.isFinite(yaw)||!Number.isFinite(pitch))
  throw Error('B313_INVALID_REAL_ORIGINAL_FRAME');
 const rows=cells.map((c,index)=>{
  const w=c.world;
  if(!Array.isArray(c.grid)||c.grid.length!==2||
   !c.grid.every(Number.isSafeInteger)||!Array.isArray(w)||
   w.length!==3||!w.every(Number.isFinite))
   throw Error('B313_NOT_NATIVE_B271_ACTIVE_SOURCE_CELL');
  const planar=Math.hypot(w[0]-body[0],w[2]-body[2]);
  const x=w[0]-camera[0],z=w[2]-camera[2],flat=Math.hypot(x,z);
  const targetYaw=Math.atan2(x,z)*180/Math.PI;
  const targetPitch=Math.atan2(w[1]-camera[1],flat)*180/Math.PI;
  const mouseX=Math.round(wrap(targetYaw-yaw)/.22);
  const mouseY=Math.round(-(targetPitch-pitch)/.18);
  const actualCDP=[800+mouseX,450+mouseY];
  return {index,world:w,grid:c.grid,planar,targetYaw,targetPitch,
   mouseX,mouseY,actualCDP,originalActiveSourceCell:true,
   safe:planar<=10&&flat>.15&&Math.abs(mouseX)<=720&&
    Math.abs(mouseY)<=440&&actualCDP[0]>=10&&actualCDP[0]<=1590&&
    actualCDP[1]>=10&&actualCDP[1]<=890&&
    targetPitch>=-78&&targetPitch<=12};
 });
 const sorted=rows.filter(x=>x.safe).sort((a,b)=>
  Math.abs(a.mouseX)-Math.abs(b.mouseX)||a.planar-b.planar);
 return {selected:sorted[0]??null,originalAlternatives:rows,
  source:'25/17/26/0'};
}
export function b313ObservedRealAimMatch(selected,angle){
 return !!selected&&!!angle&&Number.isFinite(angle.yawDegrees)&&
  Number.isFinite(angle.pitchDegrees)&&
  Math.abs(wrap(selected.targetYaw-angle.yawDegrees))<=3&&
  Math.abs(selected.targetPitch-angle.pitchDegrees)<=3;
}
