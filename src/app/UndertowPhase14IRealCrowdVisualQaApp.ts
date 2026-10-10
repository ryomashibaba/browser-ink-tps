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
import {PlayerController} from '../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {PlayerResources} from '../combat/PlayerResources';
import {CombatTargetSystem} from '../combat/CombatTargetSystem';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {defineTestSurfaces} from '../stage/TestStage';
import {nearestT21SourceSupportedLanding} from '../stage/undertow/UndertowPhase14ECpuHandoff';
import type {PlayerInput} from '../input/PlayerInput';
import type {ThirdPersonCamera} from '../camera/ThirdPersonCamera';
import type {PaintRequest} from '../ink/PaintCoordinator';
import type {CpuFireRequest} from '../ai/CpuAgentSystem';
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
 phase:'14I'|'14K'|'14L'|'14P';frame:number;mode:'REAL_RECAST_CROWD_UNFORCED';
 renderer:'webgl2';transitionCount:number;transitions:Transition[];
 cpu:FrameEntry[];activeRapierBodies:number;
 paintRequests:number;shootingRequests:number;tacticalRetargets:number;
 stageId:string;activationAuthorized:false;humanVisualFreezeApproved:false;
 sourceGeometryPromoted:false;
 completedOriginalDropIds:readonly string[];
 completedOriginalDropRecords:readonly {id:string;frame:number;footY:number}[];
 sourceContext:T21Phase14KVisualManifest|null;
 cameraAudit:null|{mode:'SOURCE_RAPIER_CAMERA_QUERY';position:[number,number,number];focus:[number,number,number];blockedBy:string|null};
 human:null|{actualPlayerController:true;mode:string;grounded:boolean;
  foot:[number,number,number];render:[number,number,number];hp:number;
  originalLandingSolid:string;scriptedMovement:boolean};
 originalAuthorizedShotIds:readonly string[];
 originalSourcePaintRequests:number;
 actualCpuProjectileHits:number;
 gameplayScoresUnapproved:true;sharedDynamicColliderWorld:false;
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
  if(!['phase14i','phase14k','phase14l','phase14p'].includes(new URL(location.href).searchParams.get('t21Qa')??'')||
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

 private readonly phase14p=new URL(location.href).searchParams.get('t21Qa')==='phase14p';
 private readonly phase14l=['phase14l','phase14p'].includes(
   new URL(location.href).searchParams.get('t21Qa')??'');
 private readonly phase14k=['phase14k','phase14l','phase14p'].includes(
   new URL(location.href).searchParams.get('t21Qa')??'');
 private readonly stage=undertowT21dConnectivityQaStage();
 private readonly sourceContext:T21Phase14KVisualManifest|null;
 private readonly camera:Entity;
 private readonly cameraPhysics:RapierStagePhysics|null;
 private readonly stats=new PerformanceStats();
 private readonly ink=new GameplayInkSystem();
 private readonly navigation=new RecastStageNavigation(this.stage,this.stats);
 private readonly adapter=new UndertowPhase14ECpuHandoff(this.stage,true);
 private readonly selected:QaBot[];
 private readonly cpu:CpuAgentSystem;
 private readonly transitions:Transition[]=[];
 private readonly completedOriginalDropRecords=new Map<string,{id:string;frame:number;footY:number}>();
 private readonly lastPositions=new Map<string,Vec3>();
 private readonly maxStep=new Map<string,number>();
 private frame=0;
 private player:PlayerController|null=null;
 private playerPhysics:RapierStagePhysics|null=null;
 private playerResources:PlayerResources|null=null;
 private projectiles:ProjectileSystem|null=null;
 private readonly sourcePaintRequests:PaintRequest[]=[];
 private readonly cpuShotIds:string[]=[];
 private readonly qaInput={moveX:0,moveY:0,squidHeld:false,jumpHeld:false,
   consumeJump:()=>false};

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
  const camera=new Entity(this.phase14p?'Phase14P:EightActorsCamera':
   this.phase14l?'Phase14L:Camera':
   this.phase14k?'Phase14K:Camera':'Phase14I:Camera');
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

  const enqueue=(request:PaintRequest)=>{
   if(!this.phase14p)throw Error('T21_PHASE14I_UNAUTHORIZED_PAINT');
   if(!this.stage.paintSurfaces.some(surface=>surface.id===request.surfaceId))
    throw Error('T21_PHASE14P_NON_SOURCE_PAINT_SURFACE');
   this.sourcePaintRequests.push(request);
  };
  // Record ONLY the real CpuAgentSystem-triggered calls; never call observe
  // ourselves. This is evidence of an actual Recast offmesh discontinuity.
  const observe=this.adapter.observe.bind(this.adapter);
  this.adapter.observe=(id,from,to,dt)=>{
   const accepted=observe(id,from,to,dt);
   if(accepted){
    const side=id.startsWith('A')?'positive-z':id.startsWith('B')?'negative-z':null;
    if(!side)throw Error('T21_PHASE14I_UNEXPECTED_CPU_INTERCEPT');
    const audit=auditPhase14CrowdFrame(from,to,dt);
    if(!audit.suspectedInstantTransition)throw Error('T21_PHASE14I_NOT_REAL_OFFMESH');
    this.transitions.push({id,side,frame:this.frame+1,
     rawStepMeters:audit.travelledMeters,physical:true});
   }
   return accepted;
  };
  this.cpu=new CpuAgentSystem(app,this.navigation,this.ink,
   {enqueue} as unknown as PaintCoordinator,this.stats,this.stage,Team.A,this.adapter);
  // QA-only headless isolation of A1/B1; retains the canonical seven-CPU
  // CpuAgentSystem spawning path. Other five do not participate in movement.
  const bots=(this.cpu as unknown as {bots:QaBot[]}).bots;
  this.selected=(this.phase14l?['A1','A2','A3','B1','B2','B3','B4']:
    ['A1','B1']).map(id=>{
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
  const scenarioSides:readonly Side[]=this.phase14l?
    this.selected.map(b=>b.id.startsWith('A')?'positive-z':'negative-z'):
    SIDES;
  for(const [i,side] of scenarioSides.entries()){
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
   if(this.phase14l&&scenarioSides.indexOf(side)!==i)continue;
   const marker=new Entity('Phase14I:RENDER_ONLY_LANDING_MARKER:'+side);
   marker.addComponent('render',{type:'cylinder',material:material(
    i===0?[.12,.84,.94]:[.96,.22,.74])});
   marker.setLocalScale(1.15,.06,1.15);
   marker.setPosition(link.end[0],link.end[1]+.03,link.end[2]);
   app.root.addChild(marker);
  }
  if(this.phase14p){
   const livePhysics=new RapierStagePhysics(DT,this.stage);
   livePhysics.step();
   this.playerPhysics=livePhysics;
   const cameraInput={getFlatForward:(out:Vec3)=>out.set(0,0,1)}
    as ThirdPersonCamera;
   const player=new PlayerController(app,livePhysics,this.qaInput as PlayerInput,
    cameraInput,this.ink,this.stats);
   this.player=player;
   player.setTeam(Team.A);
   const sourceLink=this.stage.navigationLinks!.find(l=>
     l.id==='first-drop-negative-z-3')!;
   const originalLanding=this.stage.solids.find(s=>
     s.id==='UndertowT21D:first-drop-landing-negative-z')!;
   const actualFoot=nearestT21SourceSupportedLanding(originalLanding,{
    x:sourceLink.start[0],y:sourceLink.start[1],z:sourceLink.start[2]
   });
   player.teleport(new Vec3(actualFoot.x,
    actualFoot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    actualFoot.z));
   const surfaces=defineTestSurfaces(this.ink,this.stage);
   if(surfaces.length!==17||surfaces.some(s=>s.isScoreable))
    throw Error('T21_PHASE14P_SOURCE_SCOREABILITY_UNAPPROVED');
   const resources=new PlayerResources(this.stats);
   this.playerResources=resources;
   const feedback={
    updateChargeVisual:()=>{},shot:()=>{},impact:()=>{},
    stringerFuse:()=>{},stringerBurst:()=>{},melee:()=>{},beam:()=>{}
   };
   this.projectiles=new ProjectileSystem(app,surfaces,livePhysics,
    {enqueue} as PaintCoordinator,resources,
    new CombatTargetSystem(app,this.stats),this.cpu,feedback as never,this.stats);
  }
  const cameraSide=new URL(location.href).searchParams.get('qaSide')==='negative-z'
   ?'negative-z':'positive-z';
  const cameraLink=this.stage.navigationLinks!.find(l=>
    l.id==='first-drop-'+cameraSide+'-3')!;
  camera.setPosition(cameraLink.end[0]+9,13,cameraLink.end[2]+16);
  camera.lookAt(cameraLink.end[0],5.2,cameraLink.end[2]);
  panel.innerHTML='';
  const label=document.createElement('div');
  label.id=this.phase14p?'t21-phase14p-panel':
   this.phase14l?'t21-phase14l-panel':
   this.phase14k?'t21-phase14k-panel':'t21-phase14i-panel';
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
  if(this.phase14p){
   canvas.dataset.t21Phase14pReady='READY';
   canvas.dataset.t21Phase14pRenderer=renderer;
   canvas.dataset.t21Phase14pSide=cameraSide;
   canvas.dataset.t21Phase14pActivation='FORBIDDEN';
  }
  if(this.phase14l){
   canvas.dataset.t21Phase14lReady='READY';
   canvas.dataset.t21Phase14lRenderer=renderer;
   canvas.dataset.t21Phase14lSide=cameraSide;
   canvas.dataset.t21Phase14lActivation='FORBIDDEN';
  }
  const api={
   snapshot:()=>this.snapshot(),
   advance:(count:number)=>this.advance(count),
   advanceUntil:(id:string,state:string,limit:number)=>this.advanceUntil(id,state,limit)
  };
  (window as unknown as {__t21Phase14I?:typeof api}).__t21Phase14I=api;
  if(this.phase14k&&!this.phase14l)
   (window as unknown as {__t21Phase14K?:typeof api}).__t21Phase14K=api;
  if(this.phase14l&&!this.phase14p)
   (window as unknown as {__t21Phase14L?:typeof api}).__t21Phase14L=api;
  if(this.phase14p)
   (window as unknown as {__t21Phase14P?:typeof api}).__t21Phase14P=api;
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
  const previousStates=this.selected.map(b=>b.mobilityState);
  if(this.phase14p){
   this.qaInput.moveY=this.frame>=100&&this.frame<118?.1:0;
   const before=this.player!.getPosition();
   this.player!.computeFixed(DT);
   this.playerPhysics!.step();
   this.player!.syncAfterPhysics(DT);
   const after=this.player!.getPosition();
   if(![after.x,after.y,after.z].every(Number.isFinite)||
     after.distance(before)>.60)
    throw Error('T21_PHASE14P_REAL_PLAYER_KCC_DISCONTINUITY');
   if(this.frame===380){
    if(this.completedOriginalDropRecords.size!==7)
     throw Error('T21_PHASE14P_CPU_RECOVERIES_NOT_COMPLETE');
    const bots=(this.cpu as unknown as {bots:QaBot[]}).bots;
    for(const b of bots){
     b.thinkRemaining=900;b.paintRemaining=900;b.fireRemaining=900;
     b.agent?.resetMoveTarget();
    }
    bots.find(b=>b.id==='B1')!.fireRemaining=0;
   }
  }
  const readyToShoot=this.phase14p&&this.frame>=380;
  const humanPosition=this.player?.getPosition()??new Vec3(0,7.5,0);
  this.cpu.fixedUpdate(DT,true,Team.A,humanPosition,readyToShoot);
  if(this.phase14p){
   this.cpu.drainFireRequests((request:CpuFireRequest)=>{
    if(!readyToShoot)throw Error('T21_PHASE14P_EARLY_CPU_SHOT');
    this.cpuShotIds.push(request.sourceId);
    this.projectiles!.queueCpuShot(request);
   });
   this.cpu.drainKitRequests(()=>false);
   this.projectiles!.fixedUpdate(DT,false,false,humanPosition,
    new Vec3(0,0,1),Team.A,humanPosition,false,readyToShoot);
  }
  this.cpu.render(1);
  this.frame++;
  if(this.phase14k)this.followPhase14KCamera();
  for(const [i,bot] of this.selected.entries()){
   if(previousStates[i]==='FIRST_DROP_REJOIN'&&bot.mobilityState==='GROUND'&&
     !this.completedOriginalDropRecords.has(bot.id))
    this.completedOriginalDropRecords.set(bot.id,{id:bot.id,frame:this.frame,footY:bot.position.y});
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
  const preferredId=new URL(location.href).searchParams.get('qaSide')==='negative-z'?'B1':'A1';
  const target=this.phase14p&&preferredId==='B1'?
   this.player!.getPosition():
   this.selected.find(bot=>bot.id===preferredId)!.position;
  const focus=new Vec3(target.x,target.y+.76,target.z);
  const desired=this.phase14p&&preferredId==='A1'?
   new Vec3(target.x,target.y+13,target.z-16):
   new Vec3(target.x+9,target.y+10,target.z+16);
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
  const label=this.panel.querySelector(this.phase14p?'#t21-phase14p-panel':
    this.phase14l?'#t21-phase14l-panel':
    this.phase14k?'#t21-phase14k-panel':'#t21-phase14i-panel');
  if(label)this.refreshLabel(label as HTMLElement);
 }
 private refreshLabel(label:HTMLElement){
  const snap=this.snapshot();
  label.textContent=(this.phase14p?'T21 Phase14P — 7 REAL CPU + REAL PLAYER + PROJECTILE WEBGL2 QA ONLY\n':
   this.phase14l?'T21 Phase14L — SEVEN REAL CPU + RAPIER WEBGL2 QA ONLY\n':
   this.phase14k?'T21 Phase14K — ORIGINAL SOURCE VISUAL + CAMERA QA ONLY\n':'T21 Phase14I — REAL RECAST CROWD / WEBGL2 QA ONLY\n')+
   'Original one-way links -> real Rapier KCC -> verified Crowd settle\n'+
   'NO source/gameplay promotion. NO human Visual Freeze approval.\n'+
   'frame '+snap.frame+'  real interrupts '+snap.transitionCount+
   '  bodies '+snap.activeRapierBodies+'  camera '+this.canvas.dataset.t21Phase14iSide+'\n'+
   snap.cpu.map(b=>b.id+' '+b.state+' y='+b.foot[1].toFixed(3)).join('\n')+
   (snap.human?'\nPLAYER real KCC footY='+snap.human.foot[1].toFixed(3)+
     ' HP='+snap.human.hp+' grounded='+snap.human.grounded+
     ' shots='+snap.originalAuthorizedShotIds.join(','): '');
  this.canvas.dataset.t21Phase14iFrame=String(this.frame);
 }
 private snapshot():Snapshot{
  return {
   phase:this.phase14p?'14P':this.phase14l?'14L':this.phase14k?'14K':'14I',
   frame:this.frame,mode:'REAL_RECAST_CROWD_UNFORCED',
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
   completedOriginalDropIds:[...this.completedOriginalDropRecords.keys()],
   completedOriginalDropRecords:[...this.completedOriginalDropRecords.values()],
   sourceContext:this.sourceContext,
   human:this.player?(()=>{
    const p=this.player!.getPosition();
    return {actualPlayerController:true as const,
      mode:this.player!.currentMode,grounded:this.stats.playerGrounded,
      foot:coords(new Vec3(p.x,p.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,p.z)),
      render:coords(p),hp:this.playerResources!.currentHp,
      originalLandingSolid:'UndertowT21D:first-drop-landing-negative-z',
      scriptedMovement:true
    };
   })():null,
   originalAuthorizedShotIds:[...this.cpuShotIds],
   originalSourcePaintRequests:this.sourcePaintRequests.length,
   actualCpuProjectileHits:this.stats.cpuPlayerHits,
   gameplayScoresUnapproved:true,
   sharedDynamicColliderWorld:false,
   cameraAudit:this.phase14k?(()=>{
     const pos=this.camera.getPosition();
     const preferredId=new URL(location.href).searchParams.get('qaSide')==='negative-z'?'B1':'A1';
     const selected=this.phase14p&&preferredId==='B1'?
       this.player!.getPosition():
       this.selected.find(bot=>bot.id===preferredId)!.position;
     const focus=new Vec3(selected.x,selected.y+.76,selected.z);
     const desired=this.phase14p&&preferredId==='A1'?
       new Vec3(selected.x,selected.y+13,selected.z-16):
       new Vec3(selected.x+9,selected.y+10,selected.z+16);
     return {
       mode:'SOURCE_RAPIER_CAMERA_QUERY' as const,
       position:coords(pos),focus:coords(focus),
       blockedBy:this.cameraPhysics!.castStageSegment(focus,
         desired,'camera')?.solidId??null
     };
   })():null
  };
 }
}
