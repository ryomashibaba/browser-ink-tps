/**
 * Phase14I REAL Recast->CpuAgentSystem->Rapier->Crowd PlayCanvas WebGL2 QA.
 * Strictly opt-in via ?t21Qa=phase14i, inactive T21-D partial geometry only.
 * Unlike Phase14F, there is NO hand-authored/forced adapter.observe call.
 * This scene captures genuine offmesh Crowd events and physical CPU render
 * transforms. Source markers are render-only and have zero game authority.
 */
import {
 AppBase,AppOptions,CameraComponentSystem,Color,ContainerHandler,
 createGraphicsDevice,DEVICETYPE_WEBGL2,Entity,FILLMODE_FILL_WINDOW,
 LightComponentSystem,RenderComponentSystem,RESOLUTION_AUTO,
 StandardMaterial,TextureHandler,Vec3
} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import type {PaintCoordinator} from '../ink/PaintCoordinator';
import {Team} from '../ink/types';
import {initializeRecastNavigation,RecastStageNavigation} from '../navigation/RecastStageNavigation';
import {initializeRapier} from '../physics/RapierStagePhysics';
import {auditPhase14CrowdFrame} from '../stage/undertow/UndertowPhase14CrowdMotionAudit';
import {buildPhase14KSourceVisualLayer,type T21Phase14KVisualManifest} from './UndertowPhase14KSourceStageLayer';
import {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {UndertowPhase14ECpuHandoff} from '../stage/undertow/UndertowPhase14ECpuHandoff';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';

const DT=1/60;
const SIDES=['positive-z','negative-z'] as const;
type Side=typeof SIDES[number];
type QaBot={
 id:string;agent:CrowdAgent|null;entity:Entity;position:Vec3;
 previousPosition:Vec3;mobilityState:string;lifeState:'ACTIVE'|'SPLATTED';
 respawnRemainingSeconds:number;thinkRemaining:number;
 paintRemaining:number;fireRemaining:number;
};
type Transition={id:string;side:Side;frame:number;rawStepMeters:number;physical:true};
type FrameEntry={id:string;state:string;hasCrowd:boolean;foot:[number,number,number];
 visual:[number,number,number];deltaMeters:number};
type Snapshot={
 phase:'14I'|'14K';frame:number;mode:'REAL_RECAST_CROWD_UNFORCED';
 renderer:'webgl2';transitionCount:number;transitions:Transition[];
 cpu:FrameEntry[];activeRapierBodies:number;
 paintRequests:number;shootingRequests:number;tacticalRetargets:number;
 stageId:string;activationAuthorized:false;humanVisualFreezeApproved:false;
 sourceGeometryPromoted:false;
 sourceContext:T21Phase14KVisualManifest|null;
 cameraAudit:null|{mode:'SOURCE_RAPIER_CAMERA_QUERY';position:[number,number,number];focus:[number,number,number];blockedBy:string|null};
};
function material(rgb:[number,number,number]){
 const m=new StandardMaterial();
 m.diffuse=new Color(...rgb);m.emissive=new Color(rgb[0]*.19,rgb[1]*.19,rgb[2]*.19);
 m.update();return m;
}
function coords(p:Readonly<{x:number;y:number;z:number}>):[number,number,number]{
 return [p.x,p.y,p.z];
}
export class UndertowPhase14IRealCrowdVisualQaApp{
 static async boot(canvas:HTMLCanvasElement,panel:HTMLElement){
  if(!['phase14i','phase14k'].includes(new URL(location.href).searchParams.get('t21Qa')??'')||
     freeze.activationReady!==false)throw Error('T21_PHASE14I_QA_OPT_IN_REQUIRED');
  await Promise.all([initializeRapier(),initializeRecastNavigation()]);
  const device=await createGraphicsDevice(canvas,{
   deviceTypes:[DEVICETYPE_WEBGL2],antialias:true,depth:true,
   stencil:false,powerPreference:'high-performance'
  });
  const options=new AppOptions();
  options.graphicsDevice=device;
  options.componentSystems=[RenderComponentSystem,CameraComponentSystem,LightComponentSystem];
  options.resourceHandlers=[TextureHandler,ContainerHandler];
  const app=new AppBase(canvas);
  app.init(options);
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  return new UndertowPhase14IRealCrowdVisualQaApp(app,canvas,panel);
 }

 private readonly phase14k=new URL(location.href).searchParams.get('t21Qa')==='phase14k';
 private readonly stage=undertowT21dConnectivityQaStage();
 private readonly sourceContext:T21Phase14KVisualManifest|null;
 private readonly camera:Entity;
 private readonly cameraPhysics:RapierStagePhysics|null;
 private readonly stats=new PerformanceStats();
 private readonly navigation=new RecastStageNavigation(this.stage,this.stats);
 private readonly adapter=new UndertowPhase14ECpuHandoff(this.stage,true);
 private readonly selected:QaBot[];
 private readonly cpu:CpuAgentSystem;
 private readonly transitions:Transition[]=[];
 private readonly lastPositions=new Map<string,Vec3>();
 private readonly maxStep=new Map<string,number>();
 private frame=0;

 private constructor(
  private readonly app:AppBase,private readonly canvas:HTMLCanvasElement,
  private readonly panel:HTMLElement
 ){
  if(this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
     this.stage.navigationLinks?.length!==26)throw Error('T21_PHASE14I_SOURCE_DRIFT');
  const world=app.scene.layers.getLayerByName('World');
  if(!world)throw Error('T21_PHASE14I_WORLD_LAYER_MISSING');
  app.scene.ambientLight=new Color(.55,.59,.66);
  const sun=new Entity('Phase14I:Light');
  sun.addComponent('light',{type:'directional',intensity:1.7,color:new Color(1,1,1)});
  sun.setEulerAngles(45,25,0);app.root.addChild(sun);
  const camera=new Entity(this.phase14k?'Phase14K:Camera':'Phase14I:Camera');
  this.camera=camera;
  camera.addComponent('camera',{
   clearColor:new Color(.015,.025,.045,1),nearClip:.1,
   farClip:350,fov:43,layers:[world.id]
  });
  app.root.addChild(camera);
  // Phase14K is a separate URL-gated rendering experiment. Original frozen
  // source solids are displayed only: no collider/paint/nav registration.
  this.sourceContext=this.phase14k?
    buildPhase14KSourceVisualLayer(app,this.stage).manifest:null;
  this.cameraPhysics=this.phase14k?new RapierStagePhysics(DT,this.stage):null;
  this.cameraPhysics?.step();

  const enqueue=(_:unknown)=>{throw Error('T21_PHASE14I_UNAUTHORIZED_PAINT');};
  // Record ONLY the real CpuAgentSystem-triggered calls; never call observe
  // ourselves. This is evidence of an actual Recast offmesh discontinuity.
  const observe=this.adapter.observe.bind(this.adapter);
  this.adapter.observe=(id,from,to,dt)=>{
   const accepted=observe(id,from,to,dt);
   if(accepted){
    const side=id==='A1'?'positive-z':id==='B1'?'negative-z':null;
    if(!side)throw Error('T21_PHASE14I_UNEXPECTED_CPU_INTERCEPT');
    const audit=auditPhase14CrowdFrame(from,to,dt);
    if(!audit.suspectedInstantTransition)throw Error('T21_PHASE14I_NOT_REAL_OFFMESH');
    this.transitions.push({id,side,frame:this.frame+1,
     rawStepMeters:audit.travelledMeters,physical:true});
   }
   return accepted;
  };
  this.cpu=new CpuAgentSystem(app,this.navigation,new GameplayInkSystem(),
   {enqueue} as unknown as PaintCoordinator,this.stats,this.stage,Team.A,this.adapter);
  // QA-only headless isolation of A1/B1; retains the canonical seven-CPU
  // CpuAgentSystem spawning path. Other five do not participate in movement.
  const bots=(this.cpu as unknown as {bots:QaBot[]}).bots;
  this.selected=['A1','B1'].map(id=>{
   const found=bots.find(b=>b.id===id);
   if(!found)throw Error('T21_PHASE14I_CPU_COUNT_DRIFT_'+id);
   return found;
  });
  for(const bot of bots){
   if(this.selected.includes(bot))continue;
   if(bot.agent)this.navigation.removeAgent(bot.agent);
   bot.agent=null;bot.lifeState='SPLATTED';
   bot.respawnRemainingSeconds=9000;bot.entity.enabled=false;
  }
  for(const [i,side] of SIDES.entries()){
   const bot=this.selected[i]!;
   const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>p.id==='first-drop-'+side);
   const link=this.stage.navigationLinks!.find(l=>l.id==='first-drop-'+side+'-3');
   if(probe?.expectation!=='MUST_REACH'||!link||
      link.start[1]!==7.5||link.end[1]!==3||link.bidirectional!==false)
    throw Error('T21_PHASE14I_SOURCE_LINK_UNAPPROVED_'+side);
   const path=this.navigation.auditPath(new Vec3(...probe.from),new Vec3(...probe.to));
   if(!path.reachedTarget)throw Error('T21_PHASE14I_REAL_RECAST_PATH_MISSING_'+side);
   if(bot.agent)this.navigation.removeAgent(bot.agent);
   bot.agent=this.navigation.addAgent(new Vec3(...probe.from));
   const p=bot.agent.position();
   bot.position.set(p.x,p.y,p.z);bot.previousPosition.copy(bot.position);
   bot.entity.setPosition(p.x,p.y+.68,p.z);
   // The real Recast Crowd initiates the original one-way drop; no
   // fabricated initial KCC and no fake physical trigger.
   bot.agent.requestMoveTarget(this.navigation.closestPoint(new Vec3(...probe.to)));
   bot.thinkRemaining=900;bot.paintRemaining=900;bot.fireRemaining=900;
   this.lastPositions.set(bot.id,bot.position.clone());
   this.maxStep.set(bot.id,0);
   const marker=new Entity('Phase14I:RENDER_ONLY_LANDING_MARKER:'+side);
   marker.addComponent('render',{type:'cylinder',material:material(
    i===0?[.12,.84,.94]:[.96,.22,.74])});
   marker.setLocalScale(1.15,.06,1.15);
   marker.setPosition(link.end[0],link.end[1]+.03,link.end[2]);
   app.root.addChild(marker);
  }
  const cameraSide=new URL(location.href).searchParams.get('qaSide')==='negative-z'
   ?'negative-z':'positive-z';
  const cameraLink=this.stage.navigationLinks!.find(l=>
    l.id==='first-drop-'+cameraSide+'-3')!;
  camera.setPosition(cameraLink.end[0]+9,13,cameraLink.end[2]+16);
  camera.lookAt(cameraLink.end[0],5.2,cameraLink.end[2]);
  panel.innerHTML='';
  const label=document.createElement('div');
  label.id='t21-phase14i-panel';
  label.style.cssText='position:absolute;left:16px;top:16px;z-index:50;'+
   'background:rgba(4,14,28,.88);color:#f5f9ff;padding:14px 18px;'+
   'font:14px monospace;border:1px solid #6c9ab8;max-width:590px;'+
   'pointer-events:none;white-space:pre-line;';
  panel.appendChild(label);
  const renderer=(app.graphicsDevice as {deviceType?:string}).deviceType;
  if(renderer!=='webgl2')throw Error('T21_PHASE14I_NO_REAL_WEBGL2');
  canvas.dataset.t21Phase14iReady='READY';
  canvas.dataset.t21Phase14iRenderer=renderer;
  canvas.dataset.t21Phase14iSide=cameraSide;
  canvas.dataset.t21Phase14iActivation='FORBIDDEN';
  if(this.phase14k){
   canvas.dataset.t21Phase14kReady='READY';
   canvas.dataset.t21Phase14kRenderer=renderer;
   canvas.dataset.t21Phase14kSide=cameraSide;
   canvas.dataset.t21Phase14kActivation='FORBIDDEN';
  }
  const api={
   snapshot:()=>this.snapshot(),
   advance:(count:number)=>this.advance(count),
   advanceUntil:(id:string,state:string,limit:number)=>this.advanceUntil(id,state,limit)
  };
  (window as unknown as {__t21Phase14I?:typeof api;__t21Phase14K?:typeof api}).__t21Phase14I=api;
  if(this.phase14k)
   (window as unknown as {__t21Phase14K?:typeof api}).__t21Phase14K=api;
  this.cpu.render(1);
  if(this.phase14k)this.followPhase14KCamera();
  this.refreshLabel(label);
  window.addEventListener('resize',()=>app.resizeCanvas());
  app.start();
 }

 private step(){
  if(this.frame>=650)throw Error('T21_PHASE14I_FRAME_LIMIT_EXCEEDED');
  // No fake frame interpolation or offmesh interception: real CpuAgentSystem,
  // real Recast crowd update, real Rapier KCC when actual link triggers.
  const previous=this.selected.map(b=>b.position.clone());
  this.cpu.fixedUpdate(DT,true,Team.A,new Vec3(0,7.5,0),false);
  this.cpu.render(1);
  this.frame++;
  if(this.phase14k)this.followPhase14KCamera();
  for(const [i,bot] of this.selected.entries()){
   const d=bot.position.distance(previous[i]!);
   this.maxStep.set(bot.id,Math.max(this.maxStep.get(bot.id)??0,d));
   if(d>.6)throw Error('T21_PHASE14I_DISCONTINUOUS_VISIBLE_CPU_'+bot.id+
    '_FRAME_'+this.frame+'_STEP_'+d);
  }
 }
 /** Camera evidence only: follows actual CPU foot with original Rapier query.
  * A hit is reported; no invented collision or gameplay camera is enabled.
  */
 private followPhase14KCamera(){
  const preferred=new URL(location.href).searchParams.get('qaSide')==='negative-z'?1:0;
  const target=this.selected[preferred]!.position;
  const focus=new Vec3(target.x,target.y+.76,target.z);
  const desired=new Vec3(target.x+9,target.y+10,target.z+16);
  const blocker=this.cameraPhysics!.castStageSegment(focus,desired,'camera');
  const k=blocker?Math.max(0,(blocker.distance-.42)/Math.max(1e-7,desired.distance(focus))):1;
  const position=new Vec3(focus.x+(desired.x-focus.x)*k,
    focus.y+(desired.y-focus.y)*k,
    focus.z+(desired.z-focus.z)*k);
  this.camera.setPosition(position);
  this.camera.lookAt(focus);
 }
 private advance(count:number):Snapshot{
  if(!Number.isSafeInteger(count)||count<0||count>300)
   throw Error('T21_PHASE14I_INVALID_STEP_COUNT');
  for(let i=0;i<count;i++)this.step();
  this.updateLabel();return this.snapshot();
 }
 private advanceUntil(id:string,state:string,limit:number):Snapshot{
  if(!this.selected.some(b=>b.id===id)||
     !['GROUND','FIRST_DROP_FALL','FIRST_DROP_REJOIN'].includes(state)||
     !Number.isSafeInteger(limit)||limit<1||limit>300)
   throw Error('T21_PHASE14I_INVALID_ADVANCE_UNTIL');
  const bot=this.selected.find(b=>b.id===id)!;
  if(bot.mobilityState===state)throw Error('T21_PHASE14I_TARGET_ALREADY_REACHED');
  let done=false;
  for(let i=0;i<limit;i++){
   this.step();
   if(bot.mobilityState===state){done=true;break;}
  }
  if(!done)throw Error('T21_PHASE14I_EXPECTED_REAL_STATE_NOT_REACHED_'+id+'_'+state);
  this.updateLabel();return this.snapshot();
 }
 private updateLabel(){
  const label=this.panel.querySelector('#t21-phase14i-panel');
  if(label)this.refreshLabel(label as HTMLElement);
 }
 private refreshLabel(label:HTMLElement){
  const snap=this.snapshot();
  label.textContent=(this.phase14k?'T21 Phase14K — ORIGINAL SOURCE VISUAL + CAMERA QA ONLY\n':'T21 Phase14I — REAL RECAST CROWD / WEBGL2 QA ONLY\n')+
   'Original one-way links -> real Rapier KCC -> verified Crowd settle\n'+
   'NO source/gameplay promotion. NO human Visual Freeze approval.\n'+
   'frame '+snap.frame+'  real interrupts '+snap.transitionCount+
   '  bodies '+snap.activeRapierBodies+'  camera '+this.canvas.dataset.t21Phase14iSide+'\n'+
   snap.cpu.map(b=>b.id+' '+b.state+' y='+b.foot[1].toFixed(3)).join('\n');
  this.canvas.dataset.t21Phase14iFrame=String(this.frame);
 }
 private snapshot():Snapshot{
  return {
   phase:this.phase14k?'14K':'14I',frame:this.frame,mode:'REAL_RECAST_CROWD_UNFORCED',
   renderer:'webgl2',transitionCount:this.transitions.length,
   transitions:this.transitions.map(t=>({...t})),
   cpu:this.selected.map(bot=>{
    const e=bot.entity.getPosition();
    return {
     id:bot.id,state:bot.mobilityState,hasCrowd:bot.agent!==null,
     foot:coords(bot.position),visual:coords(e),
     deltaMeters:this.maxStep.get(bot.id)??0
    };
   }),
   activeRapierBodies:this.adapter.activeCount,
   paintRequests:this.stats.cpuPaintRequests,
   shootingRequests:this.stats.cpuShots,
   tacticalRetargets:this.stats.cpuTacticalRetargets,
   stageId:this.stage.metadata.id,activationAuthorized:false,
   humanVisualFreezeApproved:false,sourceGeometryPromoted:false,
   sourceContext:this.sourceContext,
   cameraAudit:this.phase14k?(()=>{
     const pos=this.camera.getPosition();
     const selected=this.selected[
       new URL(location.href).searchParams.get('qaSide')==='negative-z'?1:0
     ]!.position;
     const focus=new Vec3(selected.x,selected.y+.76,selected.z);
     return {
       mode:'SOURCE_RAPIER_CAMERA_QUERY' as const,
       position:coords(pos),focus:coords(focus),
       blockedBy:this.cameraPhysics!.castStageSegment(focus,
         new Vec3(selected.x+9,selected.y+10,selected.z+16),'camera')?.solidId??null
     };
   })():null
  };
 }
}
