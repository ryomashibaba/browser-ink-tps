/**
 * Read-only F3C tactical SOURCE scanner. Renders measured frozen original
 * physics-solid bounds and navigation-link ENDPOINTS for orientation. No
 * paths are inferred from map strokes, no nav, paint or score authority.
 */
import type {StageDefinition} from '../stage/StageDefinition';

type Actor={id:string;physicalFoot:[number,number,number];mobilityState:string;rejoined:boolean};
type View={player:{position:number[]};cpu:{cpu:readonly Actor[];
 sourcePatrol:{activeTargets:readonly {id:string;position:readonly number[]}[]}};matchState:string};
const WIDTH=300,HEIGHT=310,HALF=32,GRID=8;
export function createF3SourceRadar(ui:HTMLElement,stage:StageDefinition){
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.navigationLinks?.length!==26)
  throw Error('T21_F3C_RADAR_ONLY_FROZEN_SOURCE');
 const shell=document.createElement('aside');
 shell.id='t21-f3-source-radar';
 shell.style.cssText='position:fixed;right:16px;top:15px;z-index:35;'+
  'width:300px;pointer-events:none;color:#d9f8ff;'+
  'background:linear-gradient(145deg,rgba(7,31,51,.94),rgba(3,11,25,.9));'+
  'border:1px solid rgba(76,225,243,.53);border-radius:16px;'+
  'box-shadow:0 16px 50px #0008, inset 0 0 22px #13b9d011;'+
  'padding:11px 12px;font:11px/1.4 ui-monospace,monospace';
 shell.innerHTML='<div style="display:flex;justify-content:space-between;'+
  'align-items:baseline"><strong style="font:800 13px system-ui;'+
  'letter-spacing:1.3px">SOURCE / TACTICAL</strong>'+
  '<span style="color:#70d4e9">LIVE PHYSICS</span></div>'+
  '<canvas width="300" height="310" id="t21-f3-radar-canvas"'+
  ' style="width:100%;height:310px;display:block"'+
  ' aria-label="Real actor positions and original source bounds"></canvas>'+
  '<div style="color:#a2bacb;font-size:10px;letter-spacing:.2px">'+
  '25 original solids · ● real feet / ◌ audited goals · no cross-gap route</div>';
 ui.appendChild(shell);
 const canvas=shell.querySelector('canvas')!;
 canvas.dataset.originalSourceSolids='25';
 canvas.dataset.originalSourceNavigationLinks='26';
 canvas.dataset.productionAuthority='NONE';
 const ctx=canvas.getContext('2d')!;
 if(!ctx)throw Error('T21_F3C_RADAR_2D_CONTEXT_REQUIRED');
 const linkStarts=stage.navigationLinks!.filter(l=>l.id.startsWith('first-drop-'));
 const solids=stage.solids.map(s=>({
  x:s.center[0],z:s.center[2],
  hx:s.size[0]/2,hz:s.size[2]/2,rot:(s.rotationEulerDegrees?.[1]??0)*Math.PI/180,
  y:s.center[1]
 }));
 const font='11px ui-monospace,monospace';
 let frame=0;
 function render(view:View){
  frame++;
  const x=view.player.position[0]??0,z=view.player.position[2]??0;
  if(![x,z].every(Number.isFinite))return;
  const scale=(HEIGHT-46)/(2*HALF);
  const px=(worldX:number)=>WIDTH/2+(worldX-x)*scale;
  const pz=(worldZ:number)=>HEIGHT/2-(worldZ-z)*scale;
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  const grd=ctx.createLinearGradient(0,0,WIDTH,HEIGHT);
  grd.addColorStop(0,'#071a2d');grd.addColorStop(1,'#102238');
  ctx.fillStyle=grd;ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.save();ctx.beginPath();ctx.rect(10,9,WIDTH-20,HEIGHT-28);ctx.clip();
  ctx.lineWidth=.8;ctx.strokeStyle='rgba(92,151,181,.13)';
  for(let gx=Math.floor((x-HALF)/GRID)*GRID;gx<x+HALF;gx+=GRID){
   ctx.beginPath();ctx.moveTo(px(gx),0);ctx.lineTo(px(gx),HEIGHT);ctx.stroke();
  }
  for(let gz=Math.floor((z-HALF)/GRID)*GRID;gz<z+HALF;gz+=GRID){
   ctx.beginPath();ctx.moveTo(0,pz(gz));ctx.lineTo(WIDTH,pz(gz));ctx.stroke();
  }
  // Flat oriented bounds of the AUTHENTIC 25 solids are cartographic
  // context ONLY; they are not a reconstructed footprint or passability.
  for(const s of solids){
   const cx=px(s.x),cy=pz(s.z);
   const hw=s.hx*scale,hh=s.hz*scale;
   if(cx+hw<0||cx-hw>WIDTH||cy+hh<0||cy-hh>HEIGHT)continue;
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-s.rot);
   ctx.fillStyle='rgba(86,150,187,.13)';
   ctx.strokeStyle='rgba(92,181,222,.24)';
   ctx.lineWidth=.75;ctx.beginPath();
   ctx.rect(-hw,-hh,2*hw,2*hh);ctx.fill();ctx.stroke();ctx.restore();
  }
  for(const link of linkStarts){
   const xx=px(link.start[0]),zz=pz(link.start[2]);
   ctx.fillStyle='rgba(255,195,101,.75)';
   ctx.beginPath();ctx.moveTo(xx,zz-3);ctx.lineTo(xx+3,zz+2);
   ctx.lineTo(xx-3,zz+2);ctx.closePath();ctx.fill();
  }
  // These hollow source-goal rings are actual audited Recast destinations,
  // never a straight-line route or an asserted connection across the gap.
  for(const goal of view.cpu.sourcePatrol.activeTargets){
   const gx=px(goal.position[0]!),gz=pz(goal.position[2]!);
   ctx.strokeStyle=goal.id.startsWith('A')?'rgba(41,238,243,.72)':
     'rgba(255,68,141,.72)';
   ctx.lineWidth=1.6;ctx.setLineDash([3,3]);
   ctx.beginPath();ctx.arc(gx,gz,9,0,Math.PI*2);ctx.stroke();
   ctx.setLineDash([]);
  }
  for(const a of view.cpu.cpu){
   const xx=px(a.physicalFoot[0]),zz=pz(a.physicalFoot[2]);
   const color=a.id.startsWith('A')?'#38e4f3':'#ff448d';
   ctx.shadowColor=color;ctx.shadowBlur=a.rejoined?13:5;
   ctx.fillStyle=color;ctx.beginPath();ctx.arc(xx,zz,a.rejoined?4.1:3.2,0,Math.PI*2);ctx.fill();
   ctx.shadowBlur=0;ctx.font=font;ctx.fillStyle=color;
   ctx.fillText(a.id,xx+6,zz-5);
  }
  const hy=view.player.position[1]??0;
  ctx.strokeStyle='#fff';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.arc(px(x),pz(z),7,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#53f2ff';ctx.beginPath();ctx.arc(px(x),pz(z),3,0,Math.PI*2);ctx.fill();
  ctx.restore();
  ctx.font='10px ui-monospace,monospace';
  ctx.fillStyle='#8dc4d5';ctx.fillText('LOCAL ±32m',13,HEIGHT-10);
  ctx.textAlign='right';ctx.fillText('X '+x.toFixed(1)+' · Z '+z.toFixed(1)+
   ' · Y '+hy.toFixed(1),WIDTH-12,HEIGHT-10);ctx.textAlign='left';
  canvas.dataset.nativeActorCount=String(view.cpu.cpu.length+1);
  canvas.dataset.sourceFrame=String(frame);
 }
 return {render,canvas,sourceGeometryAdded:false as const};
}
