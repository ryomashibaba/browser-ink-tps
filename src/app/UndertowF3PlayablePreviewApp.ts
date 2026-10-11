/**
 * F3 source-grounded PLAYABLE LAB PREVIEW. Deliberately unreachable from
 * production/default routes. Genuine human input/KCC, original 25 source
 * solids, original 17 paintable but UNSCORED surfaces, GPU ink, seven
 * original Crowd CPUs, physical Rapier actor collisions and original drops.
 * Not a claim of full Undertow match logic or approved Visual Freeze.
 */
import {
 AppBase,AppOptions,CameraComponentSystem,Color,ContainerHandler,
 createGraphicsDevice,DEVICETYPE_WEBGL2,Entity,FILLMODE_FILL_WINDOW,
 LightComponentSystem,RenderComponentSystem,RESOLUTION_AUTO,
 TextureHandler,Vec3
} from 'playcanvas';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {CombatTargetSystem} from '../combat/CombatTargetSystem';
import {PlayerResources} from '../combat/PlayerResources';
import {ThirdPersonCamera} from '../camera/ThirdPersonCamera';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {FixedStepClock} from '../core/FixedStepClock';
import {PerformanceStats} from '../core/PerformanceStats';
import {GameFeedback} from '../feedback/GameFeedback';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {GpuInkAtlas} from '../ink/GpuInkAtlas';
import {PaintCoordinator} from '../ink/PaintCoordinator';
import {Team} from '../ink/types';
import {PlayerInput} from '../input/PlayerInput';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {PlayerController} from '../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {buildTestStage,defineTestSurfaces} from '../stage/TestStage';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UndertowPhase14ECpuHandoff}
 from '../stage/undertow/UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from '../stage/undertow/UndertowPhase14QSharedActorCollision';
import {planSourceSupportedT21QaSpawnSlots,
 withProvisionalT21QaSpawnMetadata}
 from '../stage/undertow/UndertowPhase14QSourceSpawnPlan';
import {UndertowF3SourceTraffic,type F3TrafficCpu}
 from './UndertowF3SourceTraffic';
import {UndertowF3NativeHumanCrowd} from './UndertowF3NativeHumanCrowd';
import {createF3SourceRadar} from './UndertowF3SourceRadar';
import {buildF3OriginalOpticalStructures}
 from './UndertowF3OriginalSourceContext';

const STEP=1/60;
const PROJECT='Undertow T21 · F3 Play Lab';
export class UndertowF3PlayablePreviewApp{
 static async boot(canvas:HTMLCanvasElement,ui:HTMLElement){
  if(new URL(location.href).searchParams.get('t21Play')!=='preview'||
     frozen.activationReady!==false)
   throw Error('T21_F3_EXPLICIT_NONPRODUCTION_PREVIEW_ONLY');
  await Promise.all([initializeRapier(),initializeRecastNavigation()]);
  const device=await createGraphicsDevice(canvas,{
   deviceTypes:[DEVICETYPE_WEBGL2],antialias:true,depth:true,
   stencil:false,powerPreference:'high-performance'
  });
  const options=new AppOptions();
  options.graphicsDevice=device;
  options.componentSystems=[
   RenderComponentSystem,CameraComponentSystem,LightComponentSystem
  ];
  options.resourceHandlers=[TextureHandler,ContainerHandler];
  const app=new AppBase(canvas);
  app.init(options);
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  return new UndertowF3PlayablePreviewApp(app,canvas,ui);
 }

 private readonly stats=new PerformanceStats();
 private readonly clock=new FixedStepClock(60,8,.25);
 private readonly ink=new GameplayInkSystem();
 private readonly rawStage=undertowT21dConnectivityQaStage();
 private readonly physics:RapierStagePhysics;
 private readonly nav:RecastStageNavigation;
 private readonly shared:UndertowPhase14QSharedActorCollision;
 private readonly cpu:CpuAgentSystem;
 private readonly traffic:UndertowF3SourceTraffic;
 private readonly humanCrowd:UndertowF3NativeHumanCrowd;
 private readonly player:PlayerController;
 private readonly resources:PlayerResources;
 private readonly camera:ThirdPersonCamera;
 private readonly input:PlayerInput;
 private readonly coordinator:PaintCoordinator;
 private readonly atlas:GpuInkAtlas;
 private readonly projectiles:ProjectileSystem;
 private readonly feedback:GameFeedback;
 private readonly humanSpawn:Vec3;
 private readonly panel:HTMLElement;
 private readonly status:HTMLElement;
 private readonly radar:ReturnType<typeof createF3SourceRadar>;
 private readonly structures:ReturnType<typeof buildF3OriginalOpticalStructures>;
 private readonly p=new Vec3();
 private readonly aim=new Vec3();
 private readonly target=new Vec3();
 private readonly muzzle=new Vec3();
 private readonly visual=new Vec3();
 private paused=false;
 private stopReason:string|null=null;
 private respawnFrames=0;
 private renderedFrames=0;
 private matchState:'STAGING'|'PLAYING'|'TIME_UP'='STAGING';
 private remainingSeconds=180;
 private humanSplats=0;
 private humanRespawns=0;
 private constructor(
  private readonly app:AppBase,
  private readonly canvas:HTMLCanvasElement,
  ui:HTMLElement
 ){
  if(this.rawStage.solids!==frozen.solids||
     this.rawStage.paintSurfaces!==frozen.paintSurfaces||
     this.rawStage.navigationLinks!==frozen.navigationLinks||
     frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
     frozen.navigationLinks.length!==26)
    throw Error('T21_F3_IMMUTABLE_SOURCE_PACKAGE_CHANGED');
  const world=app.scene.layers.getLayerByName('World');
  if(!world)throw Error('T21_F3_NO_WORLD_LAYER');
  app.scene.ambientLight=new Color(.55,.64,.70);
  const sun=new Entity('T21F3:Sun');
  sun.addComponent('light',{type:'directional',intensity:1.85,
   color:new Color(1,.96,.88),castShadows:false});
  sun.setEulerAngles(42,24,0);app.root.addChild(sun);
  const cameraEntity=new Entity('T21F3:PlayerCamera');
  cameraEntity.addComponent('camera',{
   clearColor:new Color(.027,.052,.083,1),nearClip:.08,
   farClip:400,fov:63,layers:[world.id]
  });
  app.root.addChild(cameraEntity);
  this.nav=new RecastStageNavigation(this.rawStage,this.stats);
  this.physics=new RapierStagePhysics(STEP,this.rawStage);
  this.physics.step();
  const slots=planSourceSupportedT21QaSpawnSlots(
   this.rawStage,this.nav,this.physics);
  const stage=withProvisionalT21QaSpawnMetadata(this.rawStage,slots);
  const surfaces=defineTestSurfaces(this.ink,stage);
  if(surfaces.length!==17||surfaces.some(s=>s.isScoreable))
   throw Error('T21_F3_UNAUTHORIZED_TURF_SCORING');
  const atlasSize=Math.min(4096,app.graphicsDevice.maxTextureSize);
  if(atlasSize<2048)throw Error('T21_F3_GPU_MIN_ATLAS_2048');
  this.atlas=new GpuInkAtlas(app,surfaces,atlasSize,64,
   GAME_CONFIG.ink.atlasGutterPixels);
  buildTestStage(app,stage,surfaces,this.atlas);
  // Reviewed true-original optical structure triangles only. All 25
  // original Rapier solids remain the sole physical stage authority.
  this.structures=buildF3OriginalOpticalStructures(app);
  this.coordinator=new PaintCoordinator(this.ink,this.atlas,this.stats);
  this.input=new PlayerInput(canvas);
  this.camera=new ThirdPersonCamera(canvas,cameraEntity,surfaces,this.physics);
  this.player=new PlayerController(app,this.physics,this.input,
   this.camera,this.ink,this.stats);
  this.player.setTeam(Team.A);
  this.humanSpawn=new Vec3(
   slots.teamASlots[3]![0],
   slots.teamASlots[3]![1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
   slots.teamASlots[3]![2]
  );
  this.player.teleport(this.humanSpawn);
  this.resources=new PlayerResources(this.stats);
  const combatTargets=new CombatTargetSystem(app,this.stats);
  this.feedback=new GameFeedback(app,canvas);
  this.shared=new UndertowPhase14QSharedActorCollision(this.physics,stage,true);
  const adapter=new UndertowPhase14ECpuHandoff(stage,true);
  // Native eighth Crowd steering neighbour exists ONLY where the true
  // HUMAN Rapier foot is source-supported. Midair has no fake NavMesh foot.
  this.humanCrowd=new UndertowF3NativeHumanCrowd(this.nav,stage);
  this.cpu=new CpuAgentSystem(app,this.nav,this.ink,this.coordinator,
   this.stats,stage,Team.A,adapter,this.shared,this.humanCrowd,true);
  const bots=(this.cpu as unknown as {bots:F3TrafficCpu[]}).bots;
  this.traffic=new UndertowF3SourceTraffic(stage,this.nav,slots,bots);
  this.projectiles=new ProjectileSystem(app,surfaces,this.physics,
   this.coordinator,this.resources,combatTargets,this.cpu,
   this.feedback,this.stats);
  ui.innerHTML='';
  this.panel=document.createElement('section');
  this.panel.id='t21-f3-play-panel';
  this.panel.style.cssText='position:fixed;left:14px;top:14px;z-index:40;'+
   'max-width:390px;color:#eaf9ff;background:rgba(5,15,28,.88);'+
   'border:1px solid rgba(95,225,249,.46);border-radius:14px;'+
   'padding:14px 16px;font:12px/1.45 ui-monospace,monospace;'+
   'box-shadow:0 15px 48px #0008;pointer-events:auto';
  this.panel.innerHTML='<h2 style="font:800 18px system-ui;margin:0 0 7px">'+
   PROJECT+'</h2><p style="margin:0;color:#9ce8ed">'+
   'Playable source-grounded sandbox · not a released T21 match</p>'+
   '<div id="t21-f3-live" style="white-space:pre-line;margin:11px 0"></div>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
   '<button id="t21-f3-pause" type="button">Pause (P)</button>'+
   '<button id="t21-f3-reset" type="button">Reset (R)</button>'+ 
   '<button id="t21-f3-structures" type="button">Original source: ON</button></div>'+
   '<p style="color:#adc6d4;margin:9px 0 0">'+
   'Click stage to lock mouse · WASD move · Space jump · Shift squid · Left mouse fire · Esc release pointer</p>'+
   '<p style="color:#ffd8a0;margin:8px 0 0">'+
   'F3B: native staged CPU descent, then 180-second combat sandbox. Turf score, winner and complete source routes are NOT authorized.</p>';
  ui.appendChild(this.panel);
  this.status=this.panel.querySelector('#t21-f3-live') as HTMLElement;
  this.panel.querySelector('#t21-f3-pause')?.addEventListener('click',()=>this.togglePause());
  this.panel.querySelector('#t21-f3-reset')?.addEventListener('click',()=>this.restart());
  this.panel.querySelector('#t21-f3-structures')?.addEventListener('click',()=>{
   this.structures.root.enabled=!this.structures.root.enabled;
   const btn=this.panel.querySelector('#t21-f3-structures') as HTMLButtonElement;
   btn.textContent='Original source: '+(this.structures.root.enabled?'ON':'OFF');
  });
  const cross=document.createElement('div');
  cross.id='t21-f3-crosshair';
  cross.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);'+
   'z-index:9;pointer-events:none;font:900 28px monospace;'+
   'color:#e9fdff;text-shadow:0 1px 7px #001';
  cross.textContent='+';
  ui.appendChild(cross);
  this.radar=createF3SourceRadar(ui,stage);
  window.addEventListener('keydown',ev=>{
   if(ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey)return;
   if(ev.code==='KeyP')this.togglePause();
   if(ev.code==='KeyR')this.restart();
  });
  const renderer=(app.graphicsDevice as {deviceType?:string}).deviceType;
  if(renderer!=='webgl2')throw Error('T21_F3_REAL_WEBGL2_REQUIRED');
  canvas.dataset.t21F3Ready='READY';
  canvas.dataset.t21F3Renderer=renderer;
  canvas.dataset.t21F3SourceStage=stage.metadata.id;
  canvas.dataset.t21F3Production='FORBIDDEN';
  const api={snapshot:()=>this.snapshot(),
   pause:()=>{this.paused=true;this.refresh();return this.snapshot();},
   advanceQaTicks:(count:number)=>this.advanceQaTicks(count),
   resume:()=>{if(!this.stopReason)this.paused=false;this.refresh();return this.snapshot();},
   restart:()=>{this.restart();return this.snapshot();}};
  (window as unknown as {__t21F3?:typeof api}).__t21F3=api;
  app.on('update',(dt:number)=>this.update(dt));
  window.addEventListener('resize',()=>app.resizeCanvas());
  this.camera.update(this.player.getPosition(this.visual));
  this.refresh();
  app.start();
 }

 private togglePause(){
  if(this.stopReason)return;
  this.paused=!this.paused;
  this.refresh();
 }
 private restart(){
  this.stopReason=null;this.paused=false;this.respawnFrames=0;
  this.resources.reset();
  this.projectiles.reset();
  this.coordinator.clear();
  // The source-grounded preview uses the same seven real bots. A full
  // actor reset is a deliberate manual restart, not a mid-fall teleport.
  this.cpu.reset(Team.A);
  // The traffic director is one-shot and records true recovery. A page
  // reload rebuilds the deterministic native source routes and systems.
  window.location.reload();
 }
 private advanceQaTicks(count:number){
  if(new URL(location.href).searchParams.get('t21QaDrive')!=='source'||
     !this.paused||document.pointerLockElement===this.canvas||
     this.stopReason||!Number.isSafeInteger(count)||count<1||count>96)
   throw Error('T21_F3_QA_PHYSICAL_DRIVE_FORBIDDEN');
  try{
   for(let i=0;i<count&&this.matchState!=='TIME_UP';i++)
    this.stepFixed(++this.clock.tick,STEP);
   this.player.render(1,this.visual);this.cpu.render(1);
   this.projectiles.render(1);this.camera.update(this.visual);
   this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
   this.refresh();
  }catch(error){
   this.stopReason=String(error);this.paused=true;
   this.refresh();throw error;
  }
  return this.snapshot();
 }
 private stepFixed(frame:number,seconds:number){
  // Identical 60Hz physical path for live PlayCanvas and explicit QA clock.
  // No synthetic Crowd state, stage geometry or CPU pose is created.
    // Real keyboard/pointer inputs -> player Rapier KCC -> shared physical
    // CPU collision -> actual Recast/CpuAgentSystem -> projectiles and ink.
    const alive=this.resources.currentHp>0;
    if(alive)this.player.computeFixed(seconds);
    this.physics.step();
    this.player.syncAfterPhysics(seconds);
    if(alive)this.resources.fixedUpdate(
     seconds,this.player.currentMode,this.player.currentInkRelation);
    this.traffic.prepare(frame);
    this.cpu.fixedUpdate(seconds,true,Team.A,
     this.player.getPosition(this.p),alive);
    this.traffic.observe(frame);
    if(this.matchState==='STAGING'&&this.traffic.snapshot().freeCombatEnabled)
     this.matchState='PLAYING';
    if(this.matchState==='PLAYING'){
     this.remainingSeconds=Math.max(0,this.remainingSeconds-seconds);
     if(this.remainingSeconds===0)this.matchState='TIME_UP';
    }
    this.cpu.drainFireRequests(req=>this.projectiles.queueCpuShot(req));
    this.cpu.drainKitRequests(()=>false);
    this.camera.update(this.player.getPosition(this.p));
    this.camera.getAimDirection(this.aim);
    this.player.getMuzzlePosition(this.aim,this.muzzle);
    this.camera.getAimTarget(this.target);
    this.projectiles.solvePlayerLaunchDirection(
      this.muzzle,this.target,this.aim);
    this.projectiles.fixedUpdate(seconds,
      alive&&this.input.fireHeld&&this.player.canShoot,
      alive&&this.input.secondaryHeld&&this.player.canShoot,
      this.muzzle,this.aim,Team.A,this.player.getPosition(this.p),
      alive,alive);
    this.coordinator.processTick(frame);
    if(this.resources.currentHp<=0){
     if(this.respawnFrames===0){
      this.humanSplats++;
      this.player.setLifecycleActive(false);
      this.feedback.splat(Team.A,this.player.getPosition(this.p));
     }
     this.respawnFrames++;
     if(this.respawnFrames>=150){
      this.resources.reset();
      this.player.teleport(this.humanSpawn);
      this.player.setLifecycleActive(true);
      this.humanRespawns++;
      this.respawnFrames=0;
     }
    }else this.respawnFrames=0;
    const physical=this.player.getPosition(this.p);
    // No guessed exterior kill threshold; out-of-world motion is a
    // visible fail-closed hold until the user intentionally restarts.
    if(![physical.x,physical.y,physical.z].every(Number.isFinite)||
        physical.y< -35)
     throw Error('T21_F3_OUTSIDE_AUTHORIZED_PHYSICAL_SOURCE_RESET_REQUIRED');
 }
 private update(dt:number){
  if(this.paused||this.stopReason)return;
  try{
   const cameraDt=Number.isFinite(dt)?Math.min(Math.max(dt,0),.1):0;
   this.camera.update(this.player.getPosition(this.p),cameraDt);
   const report=this.clock.advance(dt,(frame,seconds)=>{
    if(this.matchState!=='TIME_UP')this.stepFixed(frame,seconds);
   });
   if(this.matchState==='TIME_UP')this.paused=true;
   this.player.render(report.alpha,this.visual);
   this.cpu.render(report.alpha);
   this.projectiles.render(report.alpha);
   this.feedback.update(cameraDt);
   this.camera.update(this.visual,cameraDt);
   this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
   this.stats.frame(dt*1000);
   this.renderedFrames++;
   if(this.renderedFrames%12===0)this.refresh();
  }catch(error){
   // Never hide an unsafe source collision or guess a navigation patch.
   // The visible session freezes, preserving the exact failing actor foot.
   this.stopReason=error instanceof Error?error.message:String(error);
   this.paused=true;
   console.error('T21_F3_FAIL_CLOSED',error);
   this.refresh();
  }
 }
 public snapshot(){
  const pos=this.player.getPosition(this.p);
  const progress=this.traffic.snapshot();
  return {
   phase:'F3',renderer:'webgl2',stageId:this.rawStage.metadata.id,
   playableSandbox:true,actualPlayerInput:true,
   originalSourceSolids:this.rawStage.solids.length,
   originalPaintSurfaces:this.rawStage.paintSurfaces.length,
   originalSourceNavigationLinks:this.rawStage.navigationLinks?.length,
   originalSourceOpticalStructures:this.structures.manifest.originalSourceVisualStructures,
   originalSourceOpticalTriangles:this.structures.manifest.originalSourceTriangles,
   sourceOpticalStructuresVisible:this.structures.root.enabled,
   sourceScoreablePromotions:0,sourceGeometryChanged:false,
   productionAuthorized:false,visualFreezeApproved:false,
   unrestricted4v4Certified:false,
   player:{position:[pos.x,pos.y,pos.z],mode:this.player.currentMode,
    hp:this.resources.currentHp,ink:this.stats.playerInk},
   cpu:progress,humanCrowd:this.humanCrowd.snapshot,
   cpuPaintRequests:this.stats.cpuPaintRequests,
   cpuCombatHits:this.stats.cpuCombatHits,
   cpuSplats:this.stats.cpuSplats,
   paintEventsPerSecond:this.stats.paintEventsPerSecond,
   cpuShots:this.stats.cpuShots,shotsFired:this.stats.shotsFired,
   tick:this.clock.tick,paused:this.paused,
   matchState:this.matchState,timeRemainingSeconds:this.remainingSeconds,
   humanSplats:this.humanSplats,humanRespawns:this.humanRespawns,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED' as const,
   stopReason:this.stopReason
  };
 }
 private refresh(){
  const state=this.snapshot();
  const p=state.cpu;
  this.radar.render(state);
  this.status.textContent=[
   'HUMAN · '+state.player.mode+
    '  HP '+Math.round(state.player.hp)+
    '  INK '+Math.round(state.player.ink),
   'SESSION · '+state.matchState+' · '+Math.ceil(state.timeRemainingSeconds)+'s'+
    ' · NO TURF WINNER',
   'HUMAN SPLATS '+state.humanSplats+' / RESPAWNS '+state.humanRespawns,
   'CPU · '+p.physicalRejoins.length+'/7 source drop + recovery',
   'Traffic · '+(p.freeCombatEnabled?'FREE COMBAT':'SAFE STAGED DESCENT'),
   'Original optical structures · '+state.originalSourceOpticalStructures+
    ' (non-colliding) | triangles '+state.originalSourceOpticalTriangles,
   'Real drops · '+p.physicalFirstDrops.length+
    ' | original links '+p.originalSourceLinksUsed,
   'CPU paint '+state.cpuPaintRequests+' · CPU hits '+state.cpuCombatHits+
    ' · CPU splats '+state.cpuSplats,
   'Shots '+state.shotsFired+' | CPU shots '+state.cpuShots+
    ' | paint/s '+state.paintEventsPerSecond.toFixed(1),
   'HUMAN avoidance · '+(state.humanCrowd.active?'NATIVE 8TH CROWD':'AIRBORNE / UNVERIFIED')+
    ' · anchors '+state.humanCrowd.attaches,
   'CPU state · '+p.cpu.map(b=>b.id+':'+
    (b.rejoined?'LOWER':b.mobilityState==='GROUND'?'UPPER':b.mobilityState)).join(' '),
   'Tick '+state.tick+' · '+(state.paused?'PAUSED':'RUNNING'),
   state.stopReason?'SAFE STOP: '+state.stopReason:''
  ].filter(Boolean).join('\n');
  const button=this.panel.querySelector('#t21-f3-pause') as HTMLButtonElement;
  button.textContent=this.paused?'Resume (P)':'Pause (P)';
 }
}
