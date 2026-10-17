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
import {CpuKitSystem} from '../ai/CpuKitSystem';
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
import {buildF3eOriginalSourceCoverage}
 from './UndertowF3EOriginalSourceCoverage';
import {UndertowF3ESourceSurvey} from './UndertowF3ESourceSurvey';
import {loadF3gWholeSource,F3H_SOURCE_VISUAL_MODES,
 type F3HSourceVisualMode,type F3GPackManifest}
 from './UndertowF3GWholeSourcePreview';
import {loadF3iEnvironmentReview,type F3iEnvironmentManifest}
 from './UndertowF3IEnvironmentPreview';
import {loadF3kGallery} from './UndertowF3KFamilyGallery';
import {loadF3lTexturedSource} from './UndertowF3LTexturedSourcePreview';
import {buildF3OriginalOpticalStructures}
 from './UndertowF3OriginalSourceContext';

const STEP=1/60;
const PROJECT='Undertow T21 · F3 Play Lab';
export class UndertowF3PlayablePreviewApp{
 static async boot(canvas:HTMLCanvasElement,ui:HTMLElement){
  const qaParams=new URL(location.href).searchParams;
  if(qaParams.has('t21CpuKits')&&
     (qaParams.get('t21CpuKits')!=='qa'||qaParams.get('t21QaDrive')!=='source'))
   throw Error('T21_F3_CPU_KITS_REQUIRE_EXPLICIT_SOURCE_QA');
  if(qaParams.get('t21Play')!=='preview'||
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
 /** Explicit source QA only. Never enabled by ordinary T20/T21 routes. */
 private readonly cpuKitQaEnabled=new URL(location.href).searchParams.get('t21QaDrive')==='source'&&
  new URL(location.href).searchParams.get('t21CpuKits')==='qa';
 private readonly cpuKit:CpuKitSystem|null;
 private cpuKitArtificialGaugeArms=0;
 private cpuKitManualSubQa=0;
 private cpuKitManualSpecialQa=0;
 private readonly traffic:UndertowF3SourceTraffic;
 private readonly humanCrowd:UndertowF3NativeHumanCrowd;
 private readonly player:PlayerController;
 private readonly resources:PlayerResources;
 private readonly camera:ThirdPersonCamera;
 private readonly playerCameraEntity:Entity;
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
 private readonly sourceCompletion:ReturnType<typeof buildF3eOriginalSourceCoverage>;
 private wholeSourceStatus:'OFF'|'LOADING'|'READY'|'MISSING'|'ERROR'='OFF';
 private wholeSourceTriangles=0;
 private wholeSourceGroups=0;
 private wholeSourceError='';
 private wholeSourceRoot:Entity|null=null;
 private sourceVisualMode:F3HSourceVisualMode='SOLID';
 private sourceSetVisualMode:((mode:F3HSourceVisualMode)=>F3HSourceVisualMode)|null=null;
 private sourceCoverage:F3GPackManifest['coverage'];
 private environmentRoot:Entity|null=null;
 private environmentManifest:F3iEnvironmentManifest|null=null;
 private environmentError='';
 private familyGallery:Awaited<ReturnType<typeof loadF3kGallery>>=null;
 private galleryIndex=-1;
 private galleryWasPaused=false;
 private galleryError='';
 private texturedF3l:Awaited<ReturnType<typeof loadF3lTexturedSource>>=null;
 private texturedF3lStatus:'OFF'|'LOADING'|'READY'|'MISSING'|'ERROR'='OFF';
 private texturedF3lError='';
 private texturedF3lActive=false;
 private readonly survey:UndertowF3ESourceSurvey;
 private surveyWasPaused=false;
 private readonly surveyButton:HTMLButtonElement;
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
  this.playerCameraEntity=cameraEntity;
  this.survey=new UndertowF3ESourceSurvey(app,cameraEntity,world.id,this.rawStage);
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
  this.sourceCompletion=buildF3eOriginalSourceCoverage(app,stage);
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
  this.cpu.useF3dOriginalSourceGoals(this.traffic);
  this.projectiles=new ProjectileSystem(app,surfaces,this.physics,
   this.coordinator,this.resources,combatTargets,this.cpu,
   this.feedback,this.stats);
  // Uses the real existing weapon/ink/physics systems, but only on the
  // explicit F3 + source QA route. No scoreable promotion is authorized.
  this.cpuKit=this.cpuKitQaEnabled ? new CpuKitSystem(app,surfaces,
   this.physics,this.coordinator,this.projectiles,this.cpu,
   this.feedback,this.stats) : null;
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
   '<button id="t21-f3-structures" type="button">Original source: ON</button>'+
   '<button id="t21-f3-completion" type="button">Source terrain study: ON</button>'+
   '<button id="t21-f3g-full" type="button" hidden>Full source OBJ: ON</button>'+ 
   '<button id="t21-f3h-visual-mode" type="button" hidden>F3H view: SOLID (H)</button>'+ 
   '<button id="t21-f3i-environment" type="button" hidden>F3I source backdrop: OFF (B)</button>'+ 
   '<button id="t21-f3k-gallery" type="button" hidden>Source parts showroom (G)</button>'+ 
   '<button id="t21-f3l-textured" type="button" hidden>F3L original textures: OFF (T)</button></div>'+
   '<p style="color:#adc6d4;margin:9px 0 0">'+
   'Click stage to lock mouse · WASD move · Space jump · Shift squid · Left mouse fire · Esc release pointer</p>'+
   '<p style="color:#ffd8a0;margin:8px 0 0">'+
   'F3G: full original static OBJ is OPTICAL ONLY. Unverified floor fragments are NOT walkable; Turf score and central navigation are not authorized.</p>';
  ui.appendChild(this.panel);
  this.status=this.panel.querySelector('#t21-f3-live') as HTMLElement;
  this.panel.querySelector('#t21-f3-pause')?.addEventListener('click',()=>this.togglePause());
  this.panel.querySelector('#t21-f3-reset')?.addEventListener('click',()=>this.restart());
  this.panel.querySelector('#t21-f3-structures')?.addEventListener('click',()=>{
   this.structures.root.enabled=!this.structures.root.enabled;
   const btn=this.panel.querySelector('#t21-f3-structures') as HTMLButtonElement;
   btn.textContent='Original source: '+(this.structures.root.enabled?'ON':'OFF');
  });
  this.panel.querySelector('#t21-f3-completion')?.addEventListener('click',()=>{
   this.sourceCompletion.root.enabled=!this.sourceCompletion.root.enabled;
   const btn=this.panel.querySelector('#t21-f3-completion') as HTMLButtonElement;
   btn.textContent='Source terrain study: '+
    (this.sourceCompletion.root.enabled?'ON':'OFF');
  });
  this.panel.querySelector('#t21-f3g-full')?.addEventListener('click',()=>{
   if(!this.wholeSourceRoot)return;
   const currentlyOn=this.wholeSourceRoot.enabled||!!this.texturedF3l?.root.enabled;
   const next=!currentlyOn;
   this.wholeSourceRoot.enabled=next&&!this.texturedF3lActive;
   if(this.texturedF3l)this.texturedF3l.root.enabled=next&&this.texturedF3lActive;
   this.sourceCompletion.root.enabled=!this.wholeSourceRoot.enabled;
   this.structures.root.enabled=!this.wholeSourceRoot.enabled;
   const btn=this.panel.querySelector('#t21-f3g-full') as HTMLButtonElement;
   btn.textContent='Full source OBJ: '+((this.wholeSourceRoot.enabled||!!this.texturedF3l?.root.enabled)?'ON':'OFF');
   const ref=this.panel.querySelector('#t21-f3-completion') as HTMLButtonElement;
   ref.textContent='Source terrain study: '+
    (this.sourceCompletion.root.enabled?'ON':'OFF');
   const optical=this.panel.querySelector('#t21-f3-structures') as HTMLButtonElement;
   optical.textContent='Original source: '+
    (this.structures.root.enabled?'ON':'OFF');
   this.refresh();
  });
  this.panel.querySelector('#t21-f3h-visual-mode')?.addEventListener('click',()=>
   this.cycleSourceVisualMode());
  this.panel.querySelector('#t21-f3i-environment')?.addEventListener('click',()=>
   this.toggleF3iEnvironment());
  this.panel.querySelector('#t21-f3k-gallery')?.addEventListener('click',()=>
   this.cycleSourceGallery());
  this.panel.querySelector('#t21-f3l-textured')?.addEventListener('click',()=>
   this.toggleTexturedF3l());
  this.surveyButton=document.createElement('button');
  this.surveyButton.id='t21-f3-source-survey';
  this.surveyButton.textContent='SURVEY STAGE (V) · next viewpoint';
  this.surveyButton.style.cssText='position:fixed;bottom:16px;left:16px;'+
   'z-index:55;pointer-events:auto;border:1px solid #49cedb;'+
   'border-radius:8px;background:#051627;color:#e0fbff;'+
   'box-shadow:0 10px 28px #0008;padding:10px 15px;'+
   'font:700 12px ui-monospace,monospace;cursor:pointer';
  this.surveyButton.addEventListener('click',()=>this.toggleSurvey());
  ui.appendChild(this.surveyButton);
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
   if(ev.code==='KeyV')this.toggleSurvey();
   if(ev.code==='KeyH')this.cycleSourceVisualMode();
   if(ev.code==='KeyB')this.toggleF3iEnvironment();
   if(ev.code==='KeyG')this.cycleSourceGallery();
   if(ev.code==='KeyT')this.toggleTexturedF3l();
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
   armCpuKitsQa:()=>this.armCpuKitsQa(),
   fireCpuKitQa:(kind:'SUB'|'SPECIAL')=>this.fireCpuKitQa(kind),
   resume:()=>{if(!this.stopReason)this.paused=false;this.refresh();return this.snapshot();},
   restart:()=>{this.restart();return this.snapshot();}};
  (window as unknown as {__t21F3?:typeof api}).__t21F3=api;
  app.on('update',(dt:number)=>this.update(dt));
  window.addEventListener('resize',()=>app.resizeCanvas());
  this.camera.update(this.player.getPosition(this.visual));
  this.refresh();
  app.start();
  if(new URL(location.href).searchParams.get('t21FullSource')==='review')
   void this.loadWholeSource();
 }

 private async loadWholeSource(){
  if(this.wholeSourceStatus!=='OFF')return;
  this.wholeSourceStatus='LOADING';
  this.refresh();
  try{
   const installed=await loadF3gWholeSource(this.app);
   this.wholeSourceRoot=installed.root;
   this.wholeSourceTriangles=installed.manifest.includedOriginalTriangles;
   this.wholeSourceGroups=installed.manifest.groups.length;
   this.sourceCoverage=installed.manifest.coverage;
   this.sourceSetVisualMode=installed.setVisualMode;
   this.sourceSetVisualMode(this.sourceVisualMode);
   // Avoid duplicate translucent layers obscuring actual source forms.
   this.sourceCompletion.root.enabled=false;
   this.structures.root.enabled=false;
   const f3eButton=this.panel.querySelector('#t21-f3-completion') as HTMLButtonElement|null;
   if(f3eButton)f3eButton.textContent='Source terrain study: OFF';
   const f3Button=this.panel.querySelector('#t21-f3-structures') as HTMLButtonElement|null;
   if(f3Button)f3Button.textContent='Original source: OFF';
   this.wholeSourceStatus='READY';
   const button=this.panel.querySelector('#t21-f3g-full') as HTMLButtonElement|null;
   if(button){button.hidden=false;button.textContent='Full source OBJ: ON';}
   const modeButton=this.panel.querySelector('#t21-f3h-visual-mode') as HTMLButtonElement|null;
   if(modeButton)modeButton.hidden=false;
   try{
    const environment=await loadF3iEnvironmentReview(this.app);
    if(environment){
     this.environmentRoot=environment.root;
     this.environmentManifest=environment.manifest;
     // F3J scenery is visible BY DEFAULT only inside the existing
     // exact-SHA T21 full-source review gate. No stage registration.
     environment.root.enabled=true;
     this.canvas.dataset.t21F3iEnvironment='ON';
     const btn=this.panel.querySelector('#t21-f3i-environment') as HTMLButtonElement|null;
     if(btn&&environment.manifest.backgroundTriangleCount>0){
      btn.hidden=false;
      btn.textContent='F3J source scenery: ON (B)';
     }
    }
   }catch(error){
    // F3I failures do not turn off an independently certified F3G source scene.
    this.environmentError=String(error).slice(0,240);
   }
   try{
    this.familyGallery=await loadF3kGallery(this.app);
    const button=this.panel.querySelector('#t21-f3k-gallery') as HTMLButtonElement|null;
    if(button&&this.familyGallery)button.hidden=false;
   }catch(error){
    this.galleryError=String(error).slice(0,240);
   }
   this.texturedF3lStatus='LOADING';
   try{
    this.texturedF3l=await loadF3lTexturedSource(this.app);
    this.texturedF3lStatus=this.texturedF3l?'READY':'MISSING';
    const button=this.panel.querySelector('#t21-f3l-textured') as HTMLButtonElement|null;
    if(button&&this.texturedF3l)button.hidden=false;
   }catch(error){
    this.texturedF3lStatus='ERROR';
    this.texturedF3lError=String(error).slice(0,240);
   }
  }catch(e){
   this.wholeSourceError=String(e).slice(0,320);
   this.wholeSourceStatus=this.wholeSourceError.includes('NOT_INSTALLED_HTTP_404')
    ?'MISSING':'ERROR';
  }
  this.refresh();
 }

 private toggleTexturedF3l(){
  if(!this.texturedF3l||!this.wholeSourceRoot||
     this.texturedF3lStatus!=='READY'||this.galleryIndex>=0)return;
  const visible=this.wholeSourceRoot.enabled||this.texturedF3l.root.enabled;
  this.texturedF3lActive=!this.texturedF3lActive;
  this.wholeSourceRoot.enabled=visible&&!this.texturedF3lActive;
  this.texturedF3l.root.enabled=visible&&this.texturedF3lActive;
  const button=this.panel.querySelector('#t21-f3l-textured') as HTMLButtonElement|null;
  if(button)button.textContent='F3L original textures: '+
   (this.texturedF3lActive?'ON':'OFF')+' (T)';
  this.canvas.dataset.t21F3lOriginalTexture=this.texturedF3lActive?'ON':'OFF';
  this.refresh();
 }
 private cycleSourceVisualMode(){
  if(!this.sourceSetVisualMode||this.wholeSourceStatus!=='READY')return;
  const index=F3H_SOURCE_VISUAL_MODES.indexOf(this.sourceVisualMode);
  const next=F3H_SOURCE_VISUAL_MODES[(index+1)%F3H_SOURCE_VISUAL_MODES.length]!;
  this.sourceVisualMode=this.sourceSetVisualMode(next);
  const button=this.panel.querySelector('#t21-f3h-visual-mode') as HTMLButtonElement|null;
  if(button)button.textContent='F3H view: '+next+' (H)';
  this.canvas.dataset.t21F3hVisualMode=next;
  this.refresh();
 }
 private toggleF3iEnvironment(){
  if(!this.environmentRoot||!this.environmentManifest||
     this.wholeSourceStatus!=='READY'||
     this.environmentManifest.backgroundTriangleCount===0)return;
  this.environmentRoot.enabled=!this.environmentRoot.enabled;
  const btn=this.panel.querySelector('#t21-f3i-environment') as HTMLButtonElement|null;
  if(btn)btn.textContent='F3J source scenery: '+
   (this.environmentRoot.enabled?'ON':'OFF')+' (B)';
  this.canvas.dataset.t21F3iEnvironment=this.environmentRoot.enabled?'ON':'OFF';
  this.refresh();
 }
 private cycleSourceGallery(){
  if(!this.familyGallery||this.wholeSourceStatus!=='READY'||
     this.survey.snapshot().active)return;
  const total=this.familyGallery.manifest.components.length;
  if(this.galleryIndex===total-1){
   this.familyGallery.close();
   this.galleryIndex=-1;
   this.playerCameraEntity.enabled=true;
   this.paused=this.galleryWasPaused;
  }else{
   if(this.galleryIndex===-1){
    this.galleryWasPaused=this.paused;
    this.paused=true;
    if(document.pointerLockElement===this.canvas)document.exitPointerLock();
    this.playerCameraEntity.enabled=false;
   }
   this.galleryIndex++;
   this.familyGallery.open(this.galleryIndex);
  }
  const button=this.panel.querySelector('#t21-f3k-gallery') as HTMLButtonElement|null;
  if(button)button.textContent=this.galleryIndex<0
   ?'Source parts showroom (G)'
   :'F3K ['+(this.galleryIndex+1)+'/'+total+'] '+
    this.familyGallery.manifest.components[this.galleryIndex]!.family+' (G)';
  this.canvas.dataset.t21F3kShowroom=this.galleryIndex<0?'CLOSED':'OPEN';
  this.refresh();
 }
 private toggleSurvey(){
  if(this.galleryIndex>=0)return;
  const wasSurvey=this.survey.snapshot().active;
  if(!wasSurvey)this.surveyWasPaused=this.paused;
  const now=this.survey.cycle();
  this.paused=now.active?true:this.surveyWasPaused;
  this.panel.style.display=now.active?'none':'';
  this.surveyButton.textContent=now.active
   ?'SURVEY: '+now.view+' · next (V)'
   :'SURVEY STAGE (V) · next viewpoint';
  this.refresh();
 }
 private togglePause(){
  if(this.survey.snapshot().active||this.galleryIndex>=0)return;
  if(this.stopReason)return;
  this.paused=!this.paused;
  this.refresh();
 }
 private restart(){
  this.stopReason=null;this.paused=false;this.respawnFrames=0;
  this.resources.reset();
  this.projectiles.reset();
  this.cpuKit?.reset();
  this.cpuKitArtificialGaugeArms=0;
  this.cpuKitManualSubQa=0;
  this.cpuKitManualSpecialQa=0;
  this.coordinator.clear();
  // The source-grounded preview uses the same seven real bots. A full
  // actor reset is a deliberate manual restart, not a mid-fall teleport.
  this.cpu.reset(Team.A);
  // The traffic director is one-shot and records true recovery. A page
  // reload rebuilds the deterministic native source routes and systems.
  window.location.reload();
 }
 /** Deliberately artificial gauge: only QA, paused, source patrol unlocked. */
 private armCpuKitsQa(){
  if(!this.cpuKitQaEnabled||!this.cpuKit||!this.paused||
     document.pointerLockElement===this.canvas||this.stopReason||
     !this.traffic.snapshot().freeCombatEnabled)
   throw Error('T21_F3_CPU_KIT_ARTIFICIAL_GAUGE_FORBIDDEN');
  const armed=this.cpu.forceKitQaReady();
  if(armed)this.cpuKitArtificialGaugeArms++;
  this.refresh();
  return {armed,artificial:true,source:'MANUAL_QA_ONLY',
   authorizedForNormalScoring:false,kitEnabled:this.cpuKitQaEnabled};
 }
 /** One explicit user/QA action from A2's real KCC-approved foot.
  * Never an autonomous engagement claim, coordinate guess or teleport.
  */
 private fireCpuKitQa(kind:'SUB'|'SPECIAL'){
  if(!this.cpuKitQaEnabled||!this.cpuKit||!this.paused||
     document.pointerLockElement===this.canvas||this.stopReason||
     this.matchState!=='PLAYING'||
     !this.traffic.snapshot().freeCombatEnabled||
     this.cpuKitArtificialGaugeArms<1||
     (kind!=='SUB'&&kind!=='SPECIAL'))
   throw Error('T21_F3_MANUAL_CPU_KIT_EFFECT_QA_FORBIDDEN');
  const requested=this.cpu.queueSourceCpuKitQaAction('A2',kind);
  let accepted=requested;
  if(requested)this.cpu.drainKitRequests(request=>{
   const queued=this.cpuKit!.queue(request);
   if(!queued)accepted=false;
   return queued;
  });
  if(accepted){
   if(kind==='SUB')this.cpuKitManualSubQa++;
   else this.cpuKitManualSpecialQa++;
  }
  this.refresh();
  return {requested,accepted,kind,actor:'A2',manualSourceQa:true,
   requiresPhysicalAdvance:true,normalEnemyEncounterVerified:false,
   sourceScoreablePromotions:0};
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
   this.projectiles.render(1);this.cpuKit?.render(1);
   this.camera.update(this.visual);
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
    // The default remains reject/rollback. Only opt-in QA uses the genuine
    // weapon execution path; 17 paintable surfaces remain UNSCORED.
    this.cpu.drainKitRequests(request=>this.cpuKit?.queue(request)??false);
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
    this.cpuKit?.fixedUpdate(seconds);
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
   this.cpuKit?.render(report.alpha);
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
   originalSourceStudy:this.sourceCompletion.manifest,
   originalSourceStudyVisible:this.sourceCompletion.root.enabled,
   sourceOpticalStructuresVisible:this.structures.root.enabled,
   sourceSurvey:this.survey.snapshot(),
   fullSource:{status:this.wholeSourceStatus,
    sourceOriginalTriangles:this.wholeSourceTriangles,
    sourceMaterialGroups:this.wholeSourceGroups,
    visualMode:this.sourceVisualMode,coverage:this.sourceCoverage??null,
    enabled:this.wholeSourceRoot?.enabled??false,
    sourceOnly:true,realPhysicsAdded:0,realNavigationLinksAdded:0,
    sourceError:this.wholeSourceError,
    productionAuthorized:false},
   environmentF3i:{
    status:this.environmentManifest?'READY':this.environmentError?'ERROR':'UNAVAILABLE',
    candidateTriangles:this.environmentManifest?.backgroundTriangleCount??0,
    unplacedActorObjects:this.environmentManifest?.actorObjectCount??0,
    unplacedActorFaces:this.environmentManifest?.actorFaceCount??0,
    sourceAssetFamilies:this.environmentManifest?.macroFamilyCount??0,
    topSourceAssetFamilies:this.environmentManifest?.macroAssetFamilies?.slice(0,8)??[],
    stageCoordinatesVerified:false,actorPlacementsVerified:false,
    visible:this.environmentRoot?.enabled??false,
    stageSolidsAdded:0,sourceOnly:true,productionAuthorized:false,
    error:this.environmentError},
   sourceGalleryF3k:{
    status:this.familyGallery?'READY':this.galleryError?'ERROR':'UNAVAILABLE',
    selection:this.galleryIndex,
    totalFamilies:this.familyGallery?.manifest.components.length??0,
    selectedFamily:this.galleryIndex>=0
     ?this.familyGallery?.manifest.components[this.galleryIndex]?.family??null:null,
    sourceOnly:true,instanceMatricesRecovered:false,
    originalActorPlacements:0,realPhysicsAdded:0,
    realNavigationLinksAdded:0,scoreableSurfacesAdded:0,
    productionAuthorized:false,error:this.galleryError},
   texturedSourceF3l:{status:this.texturedF3lStatus,
    enabled:this.texturedF3l?.root.enabled??false,
    materialGroups:this.texturedF3l?.manifest.materials.length??0,
    verifiedTextures:this.texturedF3l?.gate.verifiedTextures??0,
    totalOriginalTriangles:this.texturedF3l?.manifest.totalTriangles??0,
    sourceUVOnly:true,physicsSolidsAdded:0,scoreableSurfacesAdded:0,
    instanceMatricesRecovered:false,productionAuthorized:false,
    sourceError:this.texturedF3lError},
   sourceScoreablePromotions:0,sourceGeometryChanged:false,
   productionAuthorized:false,visualFreezeApproved:false,
   unrestricted4v4Certified:false,
   player:{position:[pos.x,pos.y,pos.z],mode:this.player.currentMode,
    hp:this.resources.currentHp,ink:this.stats.playerInk},
   cpu:progress,humanCrowd:this.humanCrowd.snapshot,
   cpuKitQa:{enabled:this.cpuKitQaEnabled,artificialGaugeArms:this.cpuKitArtificialGaugeArms,
    cpuSubUses:this.stats.cpuSubUses,cpuSpecialActivations:this.stats.cpuSpecialActivations,
    activeSubEffects:this.stats.cpuActiveSubs,
    activeSpecialEffects:this.stats.cpuActiveSpecialEffects,
    subProjectilesLaunched:this.stats.cpuSubProjectilesLaunched,
    specialEffectsExecuted:this.stats.cpuSpecialEffectsExecuted,
    specialPaintRequestsEnqueued:this.stats.cpuSpecialPaintRequestsEnqueued,
    manualSubRequests:this.cpuKitManualSubQa,
    manualSpecialRequests:this.cpuKitManualSpecialQa,
    autonomousEncounterVerified:false,
    sourceOnly:true,scoreablePromotions:0,normalPlaySpecialsCertified:false},
   cpuContinuity:this.cpu.qaContinuitySnapshot(),
   cpuPaintRequests:this.stats.cpuPaintRequests,
   cpuCombatHits:this.stats.cpuCombatHits,
   cpuSplats:this.stats.cpuSplats,
   paintEventsPerSecond:this.stats.paintEventsPerSecond,
   cpuShots:this.stats.cpuShots,
   cpuSourceTurfShots:this.stats.cpuSourceTurfShots,
   cpuSourceTurfShotsByActor:this.cpu.qaTurfShotSnapshot(),
   cpuProjectilePaintHits:this.stats.cpuProjectilePaintHits,
   cpuInkCellsChanged:this.stats.cpuInkCellsChanged,
   cpuImpactInkCellsChanged:this.stats.cpuImpactInkCellsChanged,
   shotsFired:this.stats.shotsFired,
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
   'ACTUAL CPU FOOT · '+state.cpuContinuity.suspectedStallCount+
    ' suspected stalls (>5s, goal >1.5m) / peak '+
    state.cpuContinuity.longestStallSeconds.toFixed(1)+'s · QA ONLY',
   state.cpuContinuity.suspectedStallCount>0
    ?'STALLED CPU · '+state.cpuContinuity.actors
      .filter(a=>a.suspectedNavigationStall)
      .map(a=>a.id+':'+a.stationarySeconds.toFixed(1)+'s/'+
        a.actualTravelMeters.toFixed(1)+'m actual').join(' · ')
    :'',
   'Traffic · '+(p.freeCombatEnabled?'SOURCE-LOCAL PATROL':'SAFE STAGED DESCENT'),
   state.cpuKitQa.enabled
    ?'CPU KITS QA · real effects ON / artificial gauge arms '+
      state.cpuKitQa.artificialGaugeArms+
      ' / subs '+state.cpuKitQa.cpuSubUses+
      ' / specials '+state.cpuKitQa.cpuSpecialActivations+
      ' / effects '+state.cpuKitQa.specialEffectsExecuted+
      ' / manual '+(state.cpuKitQa.manualSubRequests+state.cpuKitQa.manualSpecialRequests)+
      ' · 0 scoreable surfaces':'',
   'SOURCE PATROL · '+p.sourcePatrol.realGoalRequests+' goals / '+
    p.sourcePatrol.travelMeters.toFixed(1)+'m · '+p.sourcePatrol.auditedTargets+' audited',
   'F3G WHOLE SOURCE · '+this.wholeSourceStatus+
    (this.wholeSourceStatus==='READY'?' / '+
     this.wholeSourceTriangles+' original triangles':'')+
    ' · NO WALK / INK / NAV',
   'F3H SOURCE VIEW · '+this.sourceVisualMode+
    ' / whole-scene optical-only (H to compare)',
   this.sourceCoverage?'F3H SOURCE COVERAGE · '+
    this.sourceCoverage.staticObjectCount+' static objects | '+
    'Z+/center/Z- '+Object.values(this.sourceCoverage.regionTriangles).join('/')+
    ' triangles | unplaced actor faces '+this.sourceCoverage.unplacedFldObjFaceCount+
    ' · NO ACTOR PLACEMENT':'',
   this.environmentManifest?'F3I SOURCE BACKDROP · '+
    this.environmentManifest.backgroundTriangleCount+' source triangles ('+
    (this.environmentRoot?.enabled?'VISIBLE':'OFF')+') · OBJ SPACE / NOT REGISTERED':'' ,
   this.environmentManifest?'F3J UNPLACED SOURCE ASSETS · '+
    this.environmentManifest.actorObjectCount+' source objects in '+
    (this.environmentManifest.macroFamilyCount??'?')+
    ' families · NO PLACEMENT MATRICES':'' ,
   this.environmentManifest?.macroAssetFamilies?.length?
    'F3J PRIORITY ORIGINAL FAMILIES · '+
    this.environmentManifest.macroAssetFamilies.slice(0,4)
     .map(x=>x.family+'('+x.sourceMeshVariants+' meshes)').join(' · '):'',
   this.environmentError?'F3I SOURCE ERROR · '+this.environmentError:'',
   this.galleryIndex>=0&&this.familyGallery?'F3K ORIGINAL MESH ['+
    (this.galleryIndex+1)+'/'+this.familyGallery.manifest.components.length+'] · '+
    this.familyGallery.manifest.components[this.galleryIndex]!.family+
    ' · NORMALIZED DISPLAY / NOT WORLD POSITION':'',
   this.galleryError?'F3K SOURCE ERROR · '+this.galleryError:'',
   this.texturedF3lStatus!=='OFF'?'F3L UV ALBEDO · '+
    this.texturedF3lStatus+' / '+(this.texturedF3lActive?'TEXTURED':'FLAT')+
    ' (T) · optical-only / NO collision':'',
   'F3F SOURCE ONLY · 8 original underpass pieces (NOT walkable)'+
    ' · unresolved gap '+state.originalSourceStudy.unresolvedUnderpassOriginalGapMeters.toFixed(2)+'m',
   'F3F SOURCE SHAPE · '+state.originalSourceStudy.sourceComponents+
    ' components / '+state.originalSourceStudy.originalTriangles+
    ' real triangles · NO GAME COLLISION',
   'Original optical structures · '+state.originalSourceOpticalStructures+
    ' (non-colliding) | triangles '+state.originalSourceOpticalTriangles,
   'Real drops · '+p.physicalFirstDrops.length+
    ' | original links '+p.originalSourceLinksUsed,
   'CPU paint '+state.cpuPaintRequests+' · CPU hits '+state.cpuCombatHits+
    ' · CPU splats '+state.cpuSplats,
   'REAL CPU TURF FIRE · '+state.cpuSourceTurfShots+
    ' source-floor shots / '+state.cpuProjectilePaintHits+
    ' physical paint impacts (QA only)',
   'REAL CPU INK · '+state.cpuImpactInkCellsChanged+
    ' impact-recolored cells / '+state.cpuInkCellsChanged+
    ' all CPU-recolored cells · 0 scoreable',
   'TURF SHOTS BY ACTOR · '+Object.entries(state.cpuSourceTurfShotsByActor)
    .map(([id,shots])=>id+':'+shots).join(' · '),
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
