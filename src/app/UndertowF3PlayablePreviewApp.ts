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
 LightComponentSystem,RenderComponentSystem,RESOLUTION_AUTO,RESOLUTION_FIXED,
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
import {UndertowF3OwnerGpuTrial} from './UndertowF3OwnerGpuTrial';
import {UndertowF3SourceInkFeedback} from './UndertowF3SourceInkFeedback';
import {UndertowF3SourcePaintRun} from './UndertowF3SourcePaintRun';
import {UndertowF3KineticView,B27_SOURCE_BASE_FOV_DEGREES}
 from '../camera/UndertowF3KineticView';
import {PaintCoordinator} from '../ink/PaintCoordinator';
import {SurfaceFlags,Team} from '../ink/types';
import type {CrowdAgent} from 'recast-navigation';
import {PlayerInput} from '../input/PlayerInput';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {PlayerController} from '../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {SubWeaponSystem} from '../subweapon/SubWeaponSystem';
import {weaponKit,subWeaponProfile} from '../weapons/WeaponKitCatalog';
import {buildTestStage,defineTestSurfaces} from '../stage/TestStage';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding}
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
import {createF3PlayableHud} from './UndertowF3PlayableHud';
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
import {selectVerifiedSourcePresentation,B29_SOURCE_VISUAL_AUTHORITY}
 from './UndertowF3VerifiedSourcePresentation';
import {buildF3OriginalOpticalStructures}
 from './UndertowF3OriginalSourceContext';

const STEP=1/60;
type W10B14Actor={
 id:string;position:Vec3;previousPosition:Vec3;entity:Entity;
 lifeState:'ACTIVE'|'SPLATTED';hp:number;
 agent:CrowdAgent|null;
 thinkRemaining:number;paintRemaining:number;fireRemaining:number;
 jumpCooldownSeconds:number;
};
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
 private readonly humanSub:SubWeaponSystem;
 /** Real F-key human practice sub on verified original surfaces only.
  * Deterministic source QA must explicitly opt in to avoid changing
  * B32-B35 baseline or scripted combat tests.
  */
 private readonly b38HumanSubEnabled=(()=>{
  const q=new URL(location.href).searchParams;
  return q.get('t21QaDrive')!=='source'||
   q.get('t21W10B38')==='humanSub';
 })();
 private readonly feedback:GameFeedback;
 private readonly humanSpawn:Vec3;
 private readonly panel:HTMLElement;
 private readonly status:HTMLElement;
 private readonly radar:ReturnType<typeof createF3SourceRadar>;
 private readonly practiceHud:ReturnType<typeof createF3PlayableHud>;
 // B36: normal source-practice can reclaim view-space when pointer-locked.
 // Deterministic source QA keeps its prior DOM layout unless opted in.
 private readonly b36FocusEnabled=(()=>{
  const params=new URL(location.href).searchParams;
  return params.get('t21QaDrive')!=='source'||
   params.get('t21W10B36')==='playFocus';
 })();
 private readonly b25RunCard:HTMLElement;
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
 private readonly b29ExplicitFullSourceReview=
  new URL(location.href).searchParams.get('t21FullSource')==='review';
 private readonly b29PreferFlat=
  new URL(location.href).searchParams.get('t21F3lPref')==='flat';
 private readonly survey:UndertowF3ESourceSurvey;
 private surveyWasPaused=false;
 private readonly surveyButton:HTMLButtonElement;
 private readonly p=new Vec3();
 private readonly aim=new Vec3();
 private readonly target=new Vec3();
 private readonly muzzle=new Vec3();
 private readonly visual=new Vec3();
 // Only the explicit read-only, nonproduction QA route may start frozen.
 // This prevents the native realtime loop from consuming ticks before CDP QA.
 private paused=new URL(location.href).searchParams.get('t21Play')==='preview'&&
  new URL(location.href).searchParams.get('t21QaDrive')==='source'&&
  new URL(location.href).searchParams.get('t21QaInput')==='deterministic'&&
  new URL(location.href).searchParams.get('t21KccAudit')==='readOnly'&&
  new URL(location.href).searchParams.get('t21QaPauseOnBoot')==='1';
 private stopReason:string|null=null;
 private respawnFrames=0;
 private renderedFrames=0;
 // Live frame callback intervals, bounded; not a GPU timer or RTX FPS claim.
 /** Profiling is strictly opt-in on the source QA route; no global game hooks. */
 private readonly b20ProfileEnabled=new URL(location.href).searchParams.get('t21W10B20')==='profile';
 private readonly b20Profile:Record<string,{calls:number;totalMs:number;peakMs:number}>={};
 private b20RenderStartMs=0;
 private readonly sourceFrameIntervalsMs:number[]=[];
 private lastSourceFrameAtMs=Number.NaN;
 private lastRealFirePressMeasured=0;
 private realPointerToAcceptedShotMs:number|null=null;
 private realPointerToShotSamples=0;
 private readonly obstructionNotice:HTMLElement;
 private readonly b23InkFeedback=new UndertowF3SourceInkFeedback();
 private readonly b23PaintMarker:HTMLElement;
 private readonly b25Run=new UndertowF3SourcePaintRun();
 private readonly b27KineticView=new UndertowF3KineticView();
 private readonly b27KineticEnabled=(()=>{
  const q=new URL(location.href).searchParams;
  return q.get('t21Play')==='preview'&&
   (q.get('t21QaDrive')!=='source'||q.get('t21W10B27')==='kinetic');
 })();
 private readonly b25RunButton:HTMLButtonElement;
 private readonly b25RunProgress:HTMLElement;
 private readonly b21QualityButton:HTMLButtonElement;
 private readonly b22Trial:UndertowF3OwnerGpuTrial;
 private readonly b22StartButton:HTMLButtonElement;
 private readonly b22SaveButton:HTMLButtonElement;
 private readonly b22TrialStatus:HTMLElement;
 private sourceRenderQuality:'NATIVE'|'PERFORMANCE'='NATIVE';
 private sourceNativeCanvasResolution:{width:number;height:number}|null=null;
 /** Explicit source-QA-only benchmark; no production or always-on GPU timer. */
 private readonly b21QaEnabled=new URL(location.href).searchParams.get('t21W10B21')==='renderAB';
 private b21ProbeActive=false;
 private b21RenderBegin=0;
 private readonly b21RenderSamplesMs:number[]=[];
 private radarVisible=true;
 private matchState:'STAGING'|'PLAYING'|'TIME_UP'='STAGING';
 private remainingSeconds=180;
 private humanSplats=0;
 private humanRespawns=0;
 /** Browser-only original-floor witness; never a certified 4v4 encounter. */
 private w10b14:{
  target:W10B14Actor;armed:boolean;splatSeen:boolean;
  qaHumanFoot:Vec3;sourceSolidId:string;mouseInputOnly:boolean;
  nativeRespawnFoot:Vec3;
 }|null=null;
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
  if(this.b27KineticEnabled&&cameraEntity.camera?.fov!==B27_SOURCE_BASE_FOV_DEGREES)
   throw Error('T21_B27_ORIGINAL_CAMERA_BASE_FOV_CHANGED');
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
  // Only the nonproduction F3 preview skips no-op idle atlas-camera
  // render-target passes. The production/default GpuInkAtlas remains unchanged.
  this.atlas=new GpuInkAtlas(app,surfaces,atlasSize,64,
   GAME_CONFIG.ink.atlasGutterPixels,true);
  buildTestStage(app,stage,surfaces,this.atlas);
  // Reviewed true-original optical structure triangles only. All 25
  // original Rapier solids remain the sole physical stage authority.
  this.structures=buildF3OriginalOpticalStructures(app);
  this.sourceCompletion=buildF3eOriginalSourceCoverage(app,stage);
  this.canvas.dataset.t21F3eMassingMode=this.sourceCompletion.getVisualMode();
  // Read-only truth: fired shots alone are not proof of real ink impact.
  this.coordinator=new PaintCoordinator(this.ink,this.atlas,this.stats,
   (event,changedCells)=>this.b23InkFeedback.accept(event,changedCells));
  // Ordinary human input remains unchanged; QA-only axis drive is accepted
  // solely by the opt-in nonproduction fixed-tick source laboratory.
  const qa=new URL(location.href).searchParams;
  this.input=new PlayerInput(canvas,
   qa.get('t21Play')==='preview'&&qa.get('t21QaDrive')==='source'&&
   qa.get('t21QaInput')==='deterministic'&&qa.get('t21KccAudit')==='readOnly');
  this.camera=new ThirdPersonCamera(canvas,cameraEntity,surfaces,this.physics);
  this.camera.enableSourcePracticeControls();
  if(this.b27KineticEnabled)
   document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement!==this.canvas)
     this.resetW10B27KineticLens();
   });
  // The real source-only practice has adaptive original-collider camera
  // visibility by default. Deterministic B18 camera regression retains its
  // exact old one-ray budget unless explicitly testing B26.
  if(qa.get('t21QaDrive')!=='source'||
     qa.get('t21W10B26')==='smartVisibility')
   this.camera.enableSourcePracticeSmartOcclusion();
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
  // Optional real-ink ownerGrid goal ranking across ONLY previously
  // audited original-side source foot candidates. Existing fixed
  // trusted-input QA stays deterministic without the explicit B31 flag.
  const b31Params=new URL(location.href).searchParams;
  // W10-B32 measured the genuine B31 adaptive mode below the fixed
  // source-patrol painting throughput in an independent real-Chrome A/B.
  // Keep the new logic available for explicit source-only experiments,
  // but restore proven fixed patrol as the normal user-facing default.
  // Explicit research-only B34 physical-stall escape; proven
  // FIXED source patrol remains the ordinary player default.
  const b34Recover=b31Params.get('t21W10B34')==='stallRecovery';
  const b33StableGoals=b34Recover||
   b31Params.get('t21W10B33')==='stableGoals';
  const b31Enabled=b33StableGoals||
   b31Params.get('t21W10B31')==='inkGoals';
  this.traffic=new UndertowF3SourceTraffic(
   stage,this.nav,slots,bots,this.physics,this.ink,
   b31Enabled,b33StableGoals,b34Recover);
  this.cpu.useF3dOriginalSourceGoals(this.traffic);
  // Original T21 preview retains the verified fixed native steering.
  // Suppress repeated same-goal Recast requests in the explicit B35 lab only.
  if(b31Params.get('t21W10B35')==='nativeTargetRefresh')
   this.cpu.enableB35SourceNativeRetargetSuppression();
  this.projectiles=new ProjectileSystem(app,surfaces,this.physics,
   this.coordinator,this.resources,combatTargets,this.cpu,
   this.feedback,this.stats);
  // Reuse the already-shipped player sub weapon pipeline; this is not
  // a fabricated source Actor, collider, NavLink or scoreable surface.
  this.humanSub=new SubWeaponSystem(app,surfaces,this.physics,
   this.coordinator,this.resources,combatTargets,this.cpu,
   this.feedback,this.stats);
  this.stats.playerSubWeaponName=subWeaponProfile(
   weaponKit(this.projectiles.currentPlayerWeapon.id).sub).displayName;
  // Uses the real existing weapon/ink/physics systems, but only on the
  // explicit F3 + source QA route. No scoreable promotion is authorized.
  this.cpuKit=this.cpuKitQaEnabled ? new CpuKitSystem(app,surfaces,
   this.physics,this.coordinator,this.projectiles,this.cpu,
   this.feedback,this.stats) : null;
  ui.innerHTML='';
  this.panel=document.createElement('section');
  this.panel.id='t21-f3-play-panel';
  this.panel.style.cssText='position:fixed;left:14px;top:14px;z-index:40;'+
   'width:min(330px,calc(100vw - 28px));box-sizing:border-box;'+
   'color:#eaf9ff;background:rgba(5,15,28,.90);'+
   'border:1px solid rgba(95,225,249,.46);border-radius:14px;'+
   'padding:12px 14px;font:12px/1.45 ui-monospace,monospace;'+
   'box-shadow:0 15px 48px #0008;pointer-events:auto';
  this.panel.innerHTML='<h2 style="font:800 16px system-ui;margin:0 0 6px">'+
   PROJECT+'</h2><p style="margin:0;color:#9ce8ed">'+
   'Source-only practice · NOT a scored 4v4 match</p>'+
   '<p style="margin:7px 0 9px;color:#ffcea9;font:700 11px system-ui">'+
   'Two map sectors remain disconnected · no turf winner</p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
   '<button id="t21-f3-pause" type="button">Pause (P)</button>'+
   '<button id="t21-f3-reset" type="button">Reset (R)</button></div>'+
   '<div style="margin-top:9px;padding:8px;border:1px solid #4ad4e277;border-radius:8px">'+
   '<div style="font:700 11px system-ui;color:#a9f1ef">OWNER GPU · 36s LIVE PLAY COMPARISON</div>'+
   '<div id="t21-f3-b22-status" role="status" style="font:11px/1.5 system-ui;'+
   'color:#d3e4e9;margin:5px 0">Optional · 12s Native / 12s 75% / 12s Native</div>'+
   '<button id="t21-f3-b22-start" type="button">START LIVE GPU TRIAL</button>'+
   '<button id="t21-f3-b22-save" type="button" hidden>SAVE LOCAL QA JSON</button>'+
   '</div>'+
   '<details id="t21-f3-diagnostics" style="margin-top:9px;max-height:min(62vh,540px);overflow:auto">'+
   '<summary style="cursor:pointer;color:#80e4ed;font:700 12px system-ui">'+
   'Developer telemetry &amp; source controls</summary>'+
   '<div id="t21-f3-live" style="white-space:pre-line;margin:11px 0;font-size:11px"></div>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
   '<button id="t21-f3-render-quality" type="button">Render quality: NATIVE</button>'+
   '<button id="t21-f3-structures" type="button">Original source: ON</button>'+
   '<button id="t21-f3-completion" type="button">Source terrain study: ON</button>'+
   '<button id="t21-f3g-full" type="button" hidden>Full source OBJ: ON</button>'+ 
   '<button id="t21-f3h-visual-mode" type="button" hidden>F3H view: SOLID (H)</button>'+ 
   '<button id="t21-f3i-environment" type="button" hidden>F3I source backdrop: OFF (B)</button>'+ 
   '<button id="t21-f3k-gallery" type="button" hidden>Source parts showroom (G)</button>'+ 
   '<button id="t21-f3l-textured" type="button" hidden>F3L original textures: OFF (T)</button></div>'+
   '<p style="color:#ffd8a0;margin:8px 0 0">'+
   'Source models are OPTICAL ONLY where collision is unverified. No invented bridge, NavLink or Turf score.</p></details>'+
   '<p style="color:#adc6d4;margin:9px 0 0;font:11px/1.5 system-ui">'+
   'Click to lock mouse · WASD move · Space jump · Shift squid · Left fire · F sub (source practice) · Q shoulder · M radar · Esc release</p>';
  ui.appendChild(this.panel);
  this.status=this.panel.querySelector('#t21-f3-live') as HTMLElement;
  this.b22Trial=new UndertowF3OwnerGpuTrial(
   quality=>this.configureSourceRenderQuality(quality),
   ()=>[this.canvas.width,this.canvas.height]);
  this.b22StartButton=this.panel.querySelector('#t21-f3-b22-start') as HTMLButtonElement;
  this.b22SaveButton=this.panel.querySelector('#t21-f3-b22-save') as HTMLButtonElement;
  this.b22TrialStatus=this.panel.querySelector('#t21-f3-b22-status') as HTMLElement;
  this.b22StartButton.addEventListener('click',()=>{
   if(this.paused||this.stopReason||this.galleryIndex>=0||
      this.survey.snapshot().active||this.matchState==='TIME_UP'||
      document.pointerLockElement===this.canvas||
      ['ARMED','RUNNING'].includes(this.b25Run.snapshot().status)){
    this.b22TrialStatus.textContent='Finish or interrupt Paint Run before GPU comparison.';
    return;
   }
   if(this.b22Trial.arm()){
    this.b22SaveButton.hidden=true;
    this.b22TrialStatus.textContent='ARMED · click game view to lock pointer and play.';
   }
  });
  this.b22SaveButton.addEventListener('click',()=>this.saveW10B22OwnerReport());
  this.b21QualityButton=this.panel.querySelector('#t21-f3-render-quality') as HTMLButtonElement;
  this.b21QualityButton.addEventListener('click',()=>{
   if(document.pointerLockElement===this.canvas||this.stopReason||
      this.galleryIndex>=0||this.survey.snapshot().active||
      ['ARMED','RUNNING'].includes(this.b22Trial.snapshot().status))return;
   this.configureSourceRenderQuality(
    this.sourceRenderQuality==='NATIVE'?'PERFORMANCE':'NATIVE');
  });
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
  this.b23PaintMarker=document.createElement('div');
  this.b23PaintMarker.id='t21-f3-b23-human-ink-confirmation';
  this.b23PaintMarker.dataset.originalSourceOnly='true';
  this.b23PaintMarker.dataset.productionAuthority='NONE';
  this.b23PaintMarker.dataset.scoreablePromotion='0';
  this.b23PaintMarker.setAttribute('aria-label',
   'Actual human ink contact on original paintable surface, not score');
  this.b23PaintMarker.hidden=true;
  this.b23PaintMarker.style.cssText=
   'position:fixed;left:50%;top:calc(50% + 29px);'+
   'transform:translateX(-50%);z-index:11;pointer-events:none;'+
   'min-width:120px;padding:5px 11px;border-radius:20px;'+
   'border:1px solid rgba(88,245,245,.45);'+
   'background:rgba(8,29,43,.83);color:#96f5f5;'+
   'font:800 12px/1.2 system-ui,sans-serif;text-align:center;'+
   'letter-spacing:.8px;text-shadow:0 1px 5px #001;'+
   'box-shadow:0 4px 18px #0019';
  ui.appendChild(this.b23PaintMarker);
  // Warn only on genuine original-stage camera collision. Q remains manual;
  // no invented transparent wall or gameplay physics override.
  this.obstructionNotice=document.createElement('div');
  this.obstructionNotice.id='t21-f3-camera-obstruction';
  this.obstructionNotice.hidden=true;
  this.obstructionNotice.style.cssText='position:fixed;left:50%;top:calc(50% + 72px);'+
   'transform:translateX(-50%);z-index:10;pointer-events:none;'+
   'padding:4px 9px;border-radius:7px;background:rgba(10,25,38,.86);'+
   'color:#fff1bd;font:700 11px system-ui;white-space:nowrap';
  this.obstructionNotice.textContent='CAMERA BLOCKED · Q: change shoulder';
  ui.appendChild(this.obstructionNotice);
  this.practiceHud=createF3PlayableHud(ui);
  const challenge=document.createElement('section');
  challenge.id='t21-f3-b25-paint-run';
  challenge.dataset.sourceOnly='true';
  challenge.dataset.scoreable='0';
  challenge.dataset.productionAuthority='NONE';
  challenge.style.cssText='position:fixed;bottom:18px;right:16px;z-index:39;'+
   'box-sizing:border-box;width:min(256px,calc(100vw - 32px));'+
   'background:linear-gradient(145deg,rgba(6,29,42,.94),rgba(10,39,55,.94));'+
   'border:1px solid rgba(95,232,245,.48);border-radius:12px;'+
   'padding:10px 12px;box-shadow:0 10px 30px #0009;'+
   'color:#edfcff;font:600 11px/1.4 system-ui,sans-serif';
  this.b25RunCard=challenge;
  challenge.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:5px">'+
   '<strong style="letter-spacing:.9px;color:#93f3ee">SOURCE PAINT RUN</strong>'+
   '<small style="color:#ffcb9d;font-size:9px">PRACTICE · UNSCORED</small></div>'+
   '<div id="t21-f3-b25-progress" style="white-space:pre-line;color:#d4edf2;margin:8px 0">'+
   'Paint 180 real cells and travel 12 m on original floor in 60 sim seconds.</div>'+
   '<button id="t21-f3-b25-start" type="button" style="width:100%;'+
   'font:800 11px system-ui;background:#49d6df;color:#092231;'+
   'border:0;border-radius:7px;padding:8px;cursor:pointer">'+
   'START PAINT RUN</button>';
  ui.appendChild(challenge);
  this.b25RunButton=challenge.querySelector('#t21-f3-b25-start') as HTMLButtonElement;
  this.b25RunProgress=challenge.querySelector('#t21-f3-b25-progress') as HTMLElement;
  this.b25RunButton.addEventListener('click',()=>{
   if(document.pointerLockElement===this.canvas||this.paused||this.stopReason||
      this.matchState==='TIME_UP'||this.survey.snapshot().active||
      this.galleryIndex>=0||['ARMED','RUNNING'].includes(this.b22Trial.snapshot().status)){
    this.b25RunProgress.textContent='Exit pause/survey and unlock mouse before arming.';
    return;
   }
   if(this.b25Run.arm()){
    this.b25RunProgress.textContent='ARMED · Click stage to lock mouse, then paint and move.';
    this.b25RunButton.textContent='PAINT RUN ARMED';
    this.b25RunButton.disabled=true;
   }
  });
  document.addEventListener('pointerlockchange',()=>this.refreshB36PlayFocus());
  document.addEventListener('pointerlockchange',()=>{
   if(document.pointerLockElement!==this.canvas&&
      this.b25Run.snapshot().status==='RUNNING'){
    this.b25Run.abort('PLAYER_POINTER_UNLOCKED');
    this.refreshB25PaintRun();
   }
  });
  this.radar=createF3SourceRadar(ui,stage);
  window.addEventListener('keydown',ev=>{
   if(ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey)return;
   if(ev.code==='KeyP')this.togglePause();
   if(ev.code==='KeyR')this.restart();
   if(ev.code==='KeyM'){
     this.radarVisible=!this.radarVisible;
     this.radar.canvas.parentElement!.style.display=
       this.radarVisible?'':'none';
     this.canvas.dataset.t21F3RadarVisible=this.radarVisible?'true':'false';
   }
   // Do not let gameplay G (special request in PlayerInput) open the
   // gallery and disable the camera while actual pointer-locked play runs.
   // Source-review shortcuts are intentionally available only unlocked.
   if(document.pointerLockElement===this.canvas)return;
   if(ev.code==='KeyV')this.toggleSurvey();
   if(ev.code==='KeyH'){
    if(ev.shiftKey)this.toggleW10B28SourceMassing();
    else this.cycleSourceVisualMode();
   }
   if(ev.code==='KeyB')this.toggleF3iEnvironment();
   if(ev.code==='KeyG')this.cycleSourceGallery();
   if(ev.code==='KeyT')this.toggleTexturedF3l();
   if(ev.code==='KeyY')this.toggleW10B30SourceCutaway();
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
   qaDriveTicks:(x:number,y:number,count:number)=>this.qaDriveTicks(x,y,count),
   armCpuKitsQa:()=>this.armCpuKitsQa(),
   fireCpuKitQa:(kind:'SUB'|'SPECIAL')=>this.fireCpuKitQa(kind),
   startW10B14RenderWitness:()=>this.startW10B14RenderWitness(),
   armW10B14RealProjectiles:()=>this.armW10B14RealProjectiles(),
   w10B14RenderWitness:()=>this.w10B14RenderWitness(),
   inspectW10B15NativePad:()=>this.inspectW10B15NativePad(),
   auditW10B16NaturalEnemyAccess:()=>this.auditW10B16NaturalEnemyAccess(),
   startW10B21FrozenRenderProbe:()=>this.startW10B21FrozenRenderProbe(),
   setW10B21FrozenQuality:(quality:'NATIVE'|'PERFORMANCE')=>
    this.setW10B21FrozenQuality(quality),
   resume:()=>{if(!this.stopReason)this.paused=false;this.refresh();return this.snapshot();},
   restart:()=>{this.restart();return this.snapshot();}};
  (window as unknown as {__t21F3?:typeof api}).__t21F3=api;
  app.on('update',(dt:number)=>this.update(dt));
  if(this.b21QaEnabled){
   app.on('prerender',()=>{if(this.b21ProbeActive)this.b21RenderBegin=performance.now();});
   app.on('postrender',()=>{
    if(!this.b21ProbeActive||!this.b21RenderBegin)return;
    const elapsed=performance.now()-this.b21RenderBegin;
    if(elapsed>=0&&Number.isFinite(elapsed)){
     if(this.b21RenderSamplesMs.length===40)this.b21RenderSamplesMs.shift();
     this.b21RenderSamplesMs.push(elapsed);
    }
    this.b21RenderBegin=0;
   });
  }
  if(this.b20ProfileEnabled){
   app.on('prerender',()=>{this.b20RenderStartMs=performance.now();});
   app.on('postrender',()=>this.b20ProfileStop('playcanvasRenderSubmission',
    this.b20RenderStartMs));
  }
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
    // Visible verified original UV textures are the default in explicit
    // full-source review, replacing the previously hidden-until-T behavior.
    // No source pack means the pinned F3G flat stage simply stays active.
    const choice=selectVerifiedSourcePresentation({
     fullSourceReviewRequested:this.b29ExplicitFullSourceReview,
     flatSourceVerified:this.wholeSourceStatus==='READY',
     texturedSourceVerified:this.texturedF3lStatus==='READY'&&!!this.texturedF3l,
     prefersFlat:this.b29PreferFlat
    });
    const wasVisible=!!this.wholeSourceRoot?.enabled;
    if(choice==='F3L_ORIGINAL_UV'&&this.texturedF3l){
     this.texturedF3lActive=true;
     this.wholeSourceRoot!.enabled=false;
     this.texturedF3l.root.enabled=wasVisible;
     this.canvas.dataset.t21F3lOriginalTexture='ON';
     if(button)button.textContent='F3L original textures: ON (T)';
    }else if(this.texturedF3l){
     this.texturedF3l.root.enabled=false;
     this.canvas.dataset.t21F3lOriginalTexture='OFF';
    }
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

 private saveW10B22OwnerReport(){
  const report=this.b22Trial.report();
  if(!report||this.b22Trial.snapshot().status!=='COMPLETE')return;
  const payload={...report,
   exportedAt:new Date().toISOString(),
   browserUserAgent:navigator.userAgent,
   screenPixelRatio:window.devicePixelRatio,
   app:'Browser Ink TPS T21 opt-in source-only practice'};
  const file=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const href=URL.createObjectURL(file);
  const link=document.createElement('a');
  link.href=href;
  link.download='T21_W10B22_OWNER_REAL_GPU_TRIAL.json';
  link.style.display='none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(href),15_000);
 }
 private updateW10B22OwnerTrial(){
  const status=this.b22Trial.snapshot().status;
  if(status!=='ARMED'&&status!=='RUNNING')return;
  // Derive owner-visible state only from the REAL current simulation.
  const progress=this.traffic.snapshot();
  const now=performance.now();
  this.b22Trial.frame(now,{
   inputActive:document.pointerLockElement===this.canvas,
   paused:this.paused,
   stopped:!!this.stopReason,
   physicsTick:this.clock.tick,
   realHumanShots:this.stats.shotsFired,
   cpuInkImpacts:this.stats.cpuProjectilePaintHits,
   cpuPatrolMeters:progress.sourcePatrol.travelMeters,
   originalSolids:this.rawStage.solids.length,
   originalPaintSurfaces:this.rawStage.paintSurfaces.length,
   originalNavLinks:this.rawStage.navigationLinks?.length??0,
   scoreablePromotions:0,
   cameraBlocked:this.camera.sourcePracticeViewSnapshot().geometryClipped
  });
  const trial=this.b22Trial.snapshot(now);
  if(trial.status==='RUNNING')
   this.b22TrialStatus.textContent='LIVE '+trial.label+
    ' · '+trial.secondsLeft+'s left · keep playing; original 4v4 remains HOLD.';
  if(trial.status==='COMPLETE'){
   this.b22TrialStatus.textContent='COMPLETE · NATIVE restored. Save JSON locally.';
   this.b22SaveButton.hidden=false;
  }
  if(trial.status==='ABORTED')
   this.b22TrialStatus.textContent='ABORTED · '+trial.stopReason+
    ' · NATIVE restored. Start again if needed.';
 }
 private configureSourceRenderQuality(quality:'NATIVE'|'PERFORMANCE'){
  if(this.sourceRenderQuality===quality)return;
  if(quality==='PERFORMANCE'){
   // Read true native backing buffer, not guessed CSS or DPR dimensions.
   this.sourceNativeCanvasResolution={width:this.canvas.width,height:this.canvas.height};
   const {width,height}=this.sourceNativeCanvasResolution;
   if(width<300||height<200)throw Error('T21_B21_NATIVE_CANVAS_TOO_SMALL');
   this.app.setCanvasResolution(RESOLUTION_FIXED,
    Math.round(width*.75),Math.round(height*.75));
  }else{
   this.app.setCanvasResolution(RESOLUTION_AUTO);
   this.app.resizeCanvas();
  }
  this.sourceRenderQuality=quality;
  this.b21QualityButton.textContent='Render quality: '+
   (quality==='NATIVE'?'NATIVE':'75% (performance)');
  this.canvas.dataset.t21SourceRenderQuality=quality;
 }
 private b21ProbeSnapshot(){
  const values=this.b21RenderSamplesMs.slice().sort((a,b)=>a-b);
  const quantile=(p:number):number|null=>values.length?
   Number(values[Math.max(0,Math.ceil(p*values.length)-1)]!.toFixed(2)):null;
  return {
   metric:'SAME_SCENE_PRERENDER_TO_POSTRENDER_CPU_WALL_MS_NOT_GPU_TIME',
   enabled:this.b21QaEnabled,active:this.b21ProbeActive,
   quality:this.sourceRenderQuality,
   canvasPixels:[this.canvas.width,this.canvas.height],
   sampleCount:values.length,
   p50Ms:quantile(.5),p95Ms:quantile(.95),
   physicsTick:this.clock.tick,
   scoreableSurfacePromotions:0,originalSourceUnchanged:true
  };
 }
 private startW10B21FrozenRenderProbe(){
  if(!this.b21QaEnabled||!this.paused||this.stopReason||
    document.pointerLockElement===this.canvas||this.clock.tick!==0||
    this.b21ProbeActive||this.galleryIndex>=0||
    this.survey.snapshot().active)
   throw Error('T21_W10B21_FROZEN_SOURCE_ONLY_RENDER_A_B_REQUIRED');
  this.b21ProbeActive=true;
  this.b21RenderSamplesMs.length=0;
  return this.b21ProbeSnapshot();
 }
 private setW10B21FrozenQuality(quality:'NATIVE'|'PERFORMANCE'){
  if(!this.b21QaEnabled||!this.b21ProbeActive||!this.paused||
   this.stopReason||document.pointerLockElement===this.canvas||
   this.clock.tick!==0||(quality!=='NATIVE'&&quality!=='PERFORMANCE'))
   throw Error('T21_W10B21_SOURCE_RENDER_QA_FORBIDDEN');
  this.configureSourceRenderQuality(quality);
  this.b21RenderSamplesMs.length=0;
  return this.b21ProbeSnapshot();
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
 private toggleW10B30SourceCutaway(){
  // A static source floor is NOT certified collision; this optical
  // review makes the already-existing original 25 Rapier floors visible
  // without adding a single collider, route, ink surface or actor pose.
  if(!this.b29ExplicitFullSourceReview||!this.texturedF3l||
     !this.texturedF3l.root.enabled||
     this.texturedF3lStatus!=='READY'||this.galleryIndex>=0||
     this.survey.snapshot().active)return;
  const next=this.texturedF3l.getReadabilityMode()==='ORIGINAL_UV'
   ?'SOURCE_CUTAWAY':'ORIGINAL_UV';
  this.texturedF3l.setReadabilityMode(next);
  this.canvas.dataset.t21F3lReadability=next;
  this.refresh();
 }
 private toggleW10B28SourceMassing(){
  // Same 7 source-verified optical GPU batches; no stage/gameplay writes.
  if(this.wholeSourceRoot?.enabled||this.texturedF3l?.root.enabled)return;
  const next=this.sourceCompletion.getVisualMode()==='ARCHITECTURE'
   ?'HOLOGRAM':'ARCHITECTURE';
  this.sourceCompletion.setVisualMode(next);
  this.canvas.dataset.t21F3eMassingMode=next;
  const button=this.panel.querySelector('#t21-f3-completion') as HTMLButtonElement|null;
  if(button)button.textContent='Source terrain study: '+
   (this.sourceCompletion.root.enabled?'ON':'OFF')+' ['+next+']';
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
  if(this.paused)this.b25Run.abort('SESSION_PAUSED');
  this.refresh();
 }
 /** Read-only live PlayCanvas render-component witness, not pixel-mask proof. */
 private w10B14RenderWitness(){
  const w=this.w10b14;
  if(!w)throw Error('T21_W10B14_RENDER_WITNESS_NOT_STARTED');
  const e=w.target.entity;
  return {
   isolatedBrowserQa:true,originalEnemySpawnCertified:false,
   naturalEnemyEncounterCertified:false,realProjectileDamage:true,
   humanRepositionedForIsolatedQa:true,cpuRepositionedForIsolatedQa:true,
   sourceSolidId:w.sourceSolidId,
   nativeRespawnFoot:w.nativeRespawnFoot.toArray(),
   id:w.target.id,lifeState:w.target.lifeState,hp:w.target.hp,
   entityEnabled:e.enabled,
   entityEnabledInHierarchy:e.enabled&&e.parent?.enabled===true,
   renderComponentPresent:!!e.render,
   renderComponentEnabled:e.render?.enabled===true,
   entityPosition:e.getPosition().toArray(),cpuFoot:w.target.position.toArray(),
   playerPosition:this.player.getPosition().toArray(),
   grounded:this.stats.playerGrounded,
   qaHumanFoot:w.qaHumanFoot.toArray(),
   measuredPlayerFootError:this.player.getPosition().y-
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-w.qaHumanFoot.y,
   shotsFired:this.stats.shotsFired,cpuCombatHits:this.stats.cpuCombatHits,
   cpuSplats:this.stats.cpuSplats,cpuRespawns:this.stats.cpuRespawns,
   firstSplatObserved:w.splatSeen,armed:w.armed,
   actualPointerInputRequired:w.mouseInputOnly,
   pointerLocked:document.pointerLockElement===this.canvas,
   realMouseFireHeld:this.input.fireHeld,
   enemyProjectedScreen:(()=>{
    const cam=this.playerCameraEntity.camera;
    if(!cam)return null;
    const screen=cam.worldToScreen(e.getPosition());
    return {x:screen.x,y:screen.y,z:screen.z};
   })(),
   sourceSolids:this.rawStage.solids.length,
   sourcePaint:this.rawStage.paintSurfaces.length,
   sourceLinks:this.rawStage.navigationLinks?.length,
   scoreablePromotions:0,activationReady:frozen.activationReady,
   stopReason:this.stopReason
  };
 }
 private startW10B14RenderWitness(){
  const q=new URL(location.href).searchParams;
  if(q.get('t21W10B14')!=='render'||
     q.get('t21Play')!=='preview'||q.get('t21QaDrive')!=='source'||
     q.get('t21QaInput')!=='deterministic'||
     q.get('t21KccAudit')!=='readOnly'||!this.paused||
     document.pointerLockElement===this.canvas||this.stopReason||
     this.clock.tick!==0||this.w10b14)
   throw Error('T21_W10B14_PRIVATE_PAUSED_BROWSER_QA_REQUIRED');
  const bots=(this.cpu as unknown as {bots:W10B14Actor[]}).bots;
  if(bots.length!==7)throw Error('T21_W10B14_SEVEN_NATIVE_CPU_REQUIRED');
  const target=bots.find(b=>b.id==='B1');
  if(!target||target.lifeState!=='ACTIVE'||target.hp!==100)
   throw Error('T21_W10B14_ORIGINAL_CPU_B1_NOT_READY');

  const nativeRespawnFoot=target.position.clone();
  // Reuse W10-B13's genuine original first-drop floor rather than
  // weakening a failed physical grounded check on the initial high pad.
  // Both actor placements are isolated QA, not original authored spawns.
  const drop=this.rawStage.navigationLinks?.find(
   link=>link.id==='first-drop-negative-z-3');
  const solid=this.rawStage.solids.find(
   value=>value.id==='UndertowT21D:first-drop-landing-negative-z');
  if(!drop||!solid)throw Error('T21_W10B14_B13_SOURCE_FLOOR_MISSING');
  const foot=nearestT21SourceSupportedLanding(solid,{
   x:drop.start[0],y:drop.start[1],z:drop.start[2]
  });
  const dirs: Array<[number,number]> = [
   [1,0],[-1,0],[0,1],[0,-1],
   [.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]
  ];
  const chosen=dirs.map(([dx,dz])=>{
   const dest=new Vec3(foot.x+dx*1.45,foot.y,foot.z+dz*1.45);
   const wall=this.physics.castStageSegment(
    new Vec3(foot.x,foot.y+
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.4,foot.z),
    new Vec3(dest.x,foot.y+.76,dest.z),'ink-projectile');
   const patch=this.ink.sampleWorld(
    new Vec3(dest.x,foot.y+.06,dest.z),.34,SurfaceFlags.Paintable);
   const nav=this.nav.closestPoint(dest);
   return {dest,wall,patch,nav};
  }).find(p=>p.patch&&!p.wall&&Math.hypot(
   p.nav.x-p.dest.x,p.nav.y-p.dest.y,p.nav.z-p.dest.z)<.35);
  if(!chosen)throw Error('T21_W10B14_B13_CONTACT_LANE_HOLD');
  for(const bot of bots){
   bot.agent?.resetMoveTarget();
   bot.thinkRemaining=900;bot.paintRemaining=900;
   bot.fireRemaining=900;bot.jumpCooldownSeconds=900;
  }
  if(target.agent)this.nav.removeAgent(target.agent);
  target.agent=this.nav.addAgent(chosen.dest);
  const pos=target.agent.position();
  target.position.set(pos.x,pos.y,pos.z);
  target.previousPosition.copy(target.position);
  target.entity.setPosition(pos.x,pos.y+.68,pos.z);
  this.player.teleport(new Vec3(foot.x,
   foot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,foot.z));
  this.w10b14={target,armed:false,splatSeen:false,
   qaHumanFoot:new Vec3(foot.x,foot.y,foot.z),sourceSolidId:solid.id,
   mouseInputOnly:q.get('t21W10B15')==='trustedMouse',
   nativeRespawnFoot};
  this.camera.update(this.player.getPosition(this.visual));
  this.refresh();
  return this.w10B14RenderWitness();
 }
 private armW10B14RealProjectiles(){
  if(!this.w10b14||!this.paused||this.stopReason||
     !this.stats.playerGrounded||this.w10b14.armed||
     this.w10b14.target.lifeState!=='ACTIVE')
   throw Error('T21_W10B14_SOURCE_GROUNDED_ARM_HOLD');
  const body=this.player.getPosition();
  const w=this.w10b14;
  if(Math.abs(body.y-
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-w.qaHumanFoot.y)>.18||
     Math.hypot(body.x-w.qaHumanFoot.x,body.z-w.qaHumanFoot.z)>.3)
   throw Error('T21_W10B14_ACTUAL_PLAYER_KCC_NOT_AT_SOURCE_FOOT');
  w.armed=true;
  return this.w10B14RenderWitness();
 }
 /** Read-only browser witness of unassisted, original-source CPU traffic.
  * No QA enemy foot reposition, aim auto-assistance or target injection. */
 private auditW10B16NaturalEnemyAccess(){
  const q=new URL(location.href).searchParams;
  if(q.get('t21Play')!=='preview'||
     q.get('t21QaDrive')!=='source'||
     q.get('t21W10B16')!=='sourceAutonomy'||
     !this.paused||this.stopReason||
     document.pointerLockElement===this.canvas||this.w10b14||
     this.matchState!=='PLAYING')
   throw Error('T21_W10B16_NATURAL_UNASSISTED_SOURCE_QA_REQUIRED');
  const audit=this.traffic.auditW10B16NaturalEnemyAccess();
  return {...audit,tick:this.clock.tick,
   matchState:this.matchState,
   timeRemainingSeconds:this.remainingSeconds,
   sourcePatrol:this.traffic.snapshot().sourcePatrol,
   b35NativeSourceRetarget:this.cpu.b35NativeSourceRetargetSnapshot(),
   originalCpuWeaponShots:this.stats.cpuShots,
   naturalCpuSourceTurfShots:this.stats.cpuSourceTurfShots,
   nativeCpuTurfInkImpacts:this.stats.cpuProjectilePaintHits,
   inkCellsChanged:this.stats.cpuInkCellsChanged,
   cpuSourceTurfShotsByActor:this.cpu.qaTurfShotSnapshot(),
   nativeCpuSplatCount:this.stats.cpuSplats,
   nativeHumanCombatHits:this.stats.cpuCombatHits,
   sourceAuthorizedNatural4v4:false};
 }
 /** Fixed source-only camera, never an actor or collision reposition.
  * B1 stays splatted during the empty-pad screenshot; the same camera
  * observes B1 again after its native CpuAgentSystem respawn. */
 private inspectW10B15NativePad(){
  const w=this.w10b14;
  if(!w||!w.mouseInputOnly||
     new URL(location.href).searchParams.get('t21W10B15')!=='trustedMouse'||
     !this.paused||this.stopReason||document.pointerLockElement!==null||
     !w.splatSeen||this.stats.cpuSplats!==1)
   throw Error('T21_W10B15_CAMERA_ONLY_INSPECTION_FORBIDDEN');
  const target=w.nativeRespawnFoot.clone().add(new Vec3(0,.68,0));
  const view=target.clone().add(new Vec3(2.3,2.2,5));
  this.playerCameraEntity.setPosition(view);
  this.playerCameraEntity.lookAt(target);
  const screen=this.playerCameraEntity.camera?.worldToScreen(target);
  return {
   cameraOnly:true,sourceOriginalFloor:true,physicalActorsMoved:0,
   geometryModified:false,scoreablePromotions:0,productionAuthorized:false,
   viewPosition:view.toArray(),lookAt:target.toArray(),
   screen:screen?{x:screen.x,y:screen.y,z:screen.z}:null,
   cpuState:w.target.lifeState,cpuEntityEnabled:w.target.entity.enabled,
   cpuRealFoot:w.target.position.toArray(),
   originalSolids:this.rawStage.solids.length,
   originalPaint:this.rawStage.paintSurfaces.length,
   originalLinks:this.rawStage.navigationLinks?.length
  };
 }
 private restart(){
  this.stopReason=null;this.paused=false;this.respawnFrames=0;
  this.resources.reset();
  this.projectiles.reset();
  this.humanSub.reset();
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
  return {armed,artificial:true,artificialInk:true,source:'MANUAL_QA_ONLY',
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
 /**
  * Deterministic source-only QA input; actual PlayerController / Rapier KCC,
  * CPU and 60Hz physics are unchanged. No Pointer Lock or synthetic movement.
  * This method cannot work from regular gameplay, production routes, or
  * while the native real-time game loop is running.
  */
 private qaDriveTicks(x:number,y:number,count:number){
  const qa=new URL(location.href).searchParams;
  if(qa.get('t21Play')!=='preview'||qa.get('t21QaDrive')!=='source'||
     qa.get('t21QaInput')!=='deterministic'||qa.get('t21KccAudit')!=='readOnly'||
     !this.paused||document.pointerLockElement===this.canvas||
     this.stopReason||!Number.isSafeInteger(count)||count<1||count>96)
    throw Error('T21_QA_DETERMINISTIC_INPUT_FORBIDDEN');
  this.input.setQaAxis(x,y);
  try{return this.advanceQaTicks(count);}
  finally{this.input.clearQaAxis();}
 }
 private advanceQaTicks(count:number){
  if(new URL(location.href).searchParams.get('t21QaDrive')!=='source'||
     !this.paused||
     (document.pointerLockElement===this.canvas&&
      !(this.w10b14?.mouseInputOnly===true&&this.w10b14.armed))||
     this.stopReason||!Number.isSafeInteger(count)||count<1||count>96)
   throw Error('T21_F3_QA_PHYSICAL_DRIVE_FORBIDDEN');
  try{
   for(let i=0;i<count&&this.matchState!=='TIME_UP';i++)
    this.stepFixed(++this.clock.tick,STEP);
   this.player.render(1,this.visual);this.cpu.render(1);
   this.projectiles.render(1);this.humanSub.render(1);this.cpuKit?.render(1);
   this.camera.update(this.visual);
   this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
   this.refresh();
  }catch(error){
   this.stopReason=String(error);this.paused=true;
   this.refresh();throw error;
  }
  return this.snapshot();
 }
 private b20ProfileStart(){
  return this.b20ProfileEnabled?performance.now():0;
 }
 private b20ProfileStop(phase:string,started:number){
  if(!this.b20ProfileEnabled||started<=0)return;
  const duration=Math.max(0,performance.now()-started);
  const row=this.b20Profile[phase]??={calls:0,totalMs:0,peakMs:0};
  row.calls++;
  row.totalMs+=duration;
  row.peakMs=Math.max(row.peakMs,duration);
 }
 private b20ProfileSnapshot(){
  return {
   enabled:this.b20ProfileEnabled,
   metric:'CPU_JS_PHASE_WALL_TIME_NOT_GPU_EXECUTION',
   phases:Object.fromEntries(Object.entries(this.b20Profile).map(([name,row])=>
    [name,{calls:row.calls,averageMs:Number((row.totalMs/row.calls).toFixed(3)),
      peakMs:Number(row.peakMs.toFixed(3)),totalMs:Number(row.totalMs.toFixed(2))}]))
  };
 }
 private stepFixed(frame:number,seconds:number){
  // Identical 60Hz physical path for live PlayCanvas and explicit QA clock.
  // No synthetic Crowd state, stage geometry or CPU pose is created.
    // Real keyboard/pointer inputs -> player Rapier KCC -> shared physical
    // CPU collision -> actual Recast/CpuAgentSystem -> projectiles and ink.
    const alive=this.resources.currentHp>0;
    const playerStart=this.b20ProfileStart();
    if(alive)this.player.computeFixed(seconds);
    this.physics.step();
    this.player.syncAfterPhysics(seconds);
    this.b20ProfileStop('rapierAndHumanKcc',playerStart);
    if(alive)this.resources.fixedUpdate(
     seconds,this.player.currentMode,this.player.currentInkRelation);
    if(!this.w10b14)this.traffic.prepare(frame);
    const cpuStart=this.b20ProfileStart();
    this.cpu.fixedUpdate(seconds,true,Team.A,
     this.player.getPosition(this.p),alive&&!this.w10b14);
    this.b20ProfileStop('sevenCpuFixed',cpuStart);
    if(!this.w10b14)this.traffic.observe(frame);
    if(this.matchState==='STAGING'&&this.traffic.snapshot().freeCombatEnabled)
     this.matchState='PLAYING';
    if(this.matchState==='PLAYING'){
     this.remainingSeconds=Math.max(0,this.remainingSeconds-seconds);
     if(this.remainingSeconds===0)this.matchState='TIME_UP';
    }
    const projectileStart=this.b20ProfileStart();
    this.cpu.drainFireRequests(req=>this.projectiles.queueCpuShot(req));
    // The default remains reject/rollback. Only opt-in QA uses the genuine
    // weapon execution path; 17 paintable surfaces remain UNSCORED.
    this.cpu.drainKitRequests(request=>this.cpuKit?.queue(request)??false);
    this.camera.update(this.player.getPosition(this.p));
    const primaryTap=this.input.consumePrimaryPressed();
    const realPointerFire=this.input.fireHeld||primaryTap;
    const subTap=this.input.consumeSubPressed();
    const humanShotsBefore=this.stats.shotsFired;
    if(this.w10b14){
     const w=this.w10b14;
     if(w.target.lifeState==='SPLATTED')w.splatSeen=true;
     if(w.mouseInputOnly){
      // The real CDP mouse event enters PlayerInput under pointer lock.
      // The real camera aims, rather than snapping to the CPU target.
      this.camera.getAimDirection(this.aim);
      this.player.getMuzzlePosition(this.aim,this.muzzle);
      this.camera.getAimTarget(this.target);
      this.projectiles.solvePlayerLaunchDirection(
       this.muzzle,this.target,this.aim);
      this.projectiles.fixedUpdate(seconds,
       alive&&w.armed&&!w.splatSeen&&realPointerFire&&this.player.canShoot&&
        document.pointerLockElement===this.canvas,
       false,this.muzzle,this.aim,Team.A,this.player.getPosition(this.p),
       alive,alive);
     }else{
     this.target.copy(w.target.position).add(new Vec3(0,.68,0));
     this.aim.copy(this.target).sub(this.player.getPosition(this.p)).normalize();
     this.player.getMuzzlePosition(this.aim,this.muzzle);
     this.projectiles.solvePlayerLaunchDirection(
      this.muzzle,this.target,this.aim);
     // Real ProjectileSystem and CPU HP lifecycle. No damage injection.
     this.projectiles.fixedUpdate(seconds,
      alive&&w.armed&&!w.splatSeen&&w.target.lifeState==='ACTIVE',
      false,this.muzzle,this.aim,Team.A,this.player.getPosition(this.p),
      alive,alive);
     }
     if(w.target.lifeState==='SPLATTED')w.splatSeen=true;
    }else{
     this.camera.getAimDirection(this.aim);
     this.player.getMuzzlePosition(this.aim,this.muzzle);
     this.camera.getAimTarget(this.target);
     this.projectiles.solvePlayerLaunchDirection(
      this.muzzle,this.target,this.aim);
     this.projectiles.fixedUpdate(seconds,
      alive&&realPointerFire&&this.player.canShoot,
      alive&&this.input.secondaryHeld&&this.player.canShoot,
      this.muzzle,this.aim,Team.A,this.player.getPosition(this.p),
      alive,alive);
    }
    if(this.stats.shotsFired>humanShotsBefore&&
       this.input.primaryPressSequence>this.lastRealFirePressMeasured){
      this.lastRealFirePressMeasured=this.input.primaryPressSequence;
      // Paused deterministic Chrome QA includes arbitrary CDP wait time,
      // and must never be treated as real-world input latency.
      if(!this.paused&&Number.isFinite(this.input.primaryPressAtMs)){
       this.realPointerToAcceptedShotMs=Math.max(0,
        performance.now()-this.input.primaryPressAtMs);
       this.realPointerToShotSamples++;
      }
    }
    // F is a real keyboard sub throw, not CPU automation, free score or
    // a projectile injected by QA. Original Rapier/paint physics resolve it.
    // Consume even when disabled or splatted: never fire stale buffered F.
    if(this.b38HumanSubEnabled&&subTap&&alive&&this.player.canShoot&&
       document.pointerLockElement===this.canvas&&this.matchState!=='TIME_UP'){
     this.humanSub.tryThrow(
      weaponKit(this.projectiles.currentPlayerWeapon.id).sub,Team.A,
      this.muzzle,this.aim);
    }
    this.humanSub.fixedUpdate(seconds);
    this.cpuKit?.fixedUpdate(seconds);
    this.b20ProfileStop('aimProjectilesAndKits',projectileStart);
    const paintStart=this.b20ProfileStart();
    this.coordinator.processTick(frame);
    this.b20ProfileStop('inkOwnershipTick',paintStart);
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
    const actualHumanInk=this.b23InkFeedback.snapshot(frame);
    const realFoot=this.player.getPosition(this.p);
    if(this.b27KineticEnabled)
     this.b27KineticView.sampleNativeFoot({
      tick:frame,x:realFoot.x,y:realFoot.y,z:realFoot.z,
      grounded:this.stats.playerGrounded,alive:this.resources.currentHp>0,
      sourceOriginalCollisionOnly:
       this.rawStage.solids.length===25&&
       this.rawStage.paintSurfaces.length===17&&
       this.rawStage.navigationLinks?.length===26
     });
    this.b25Run.observe({
     tick:frame,paused:this.paused,stopReason:this.stopReason,
     inputLocked:document.pointerLockElement===this.canvas,
     sessionEnded:this.matchState==='TIME_UP',
     sourceSolids:this.rawStage.solids.length,
     paintableSurfaces:this.rawStage.paintSurfaces.length,
     originalNavLinks:this.rawStage.navigationLinks?.length??0,
     scoreableSurfaces:0,
     foot:{x:realFoot.x,y:realFoot.y,z:realFoot.z,
      grounded:this.stats.playerGrounded,alive:this.resources.currentHp>0,
      realPhysicalOriginalStage:true},
     ink:{changedHumanImpactCells:actualHumanInk.humanChangedCells,
      changedHumanImpactEvents:actualHumanInk.humanChangedImpactCount,
      sourceOnly:actualHumanInk.originalSourceOnly,
      scoreablePromotionCount:0}
    });
    const physical=this.player.getPosition(this.p);
    // No guessed exterior kill threshold; out-of-world motion is a
    // visible fail-closed hold until the user intentionally restarts.
    if(![physical.x,physical.y,physical.z].every(Number.isFinite)||
        physical.y< -35)
     throw Error('T21_F3_OUTSIDE_AUTHORIZED_PHYSICAL_SOURCE_RESET_REQUIRED');
 }
 private update(dt:number){
  this.updateW10B22OwnerTrial();
  if(this.paused||this.stopReason){
   this.lastSourceFrameAtMs=Number.NaN;
   if(this.b27KineticEnabled)this.resetW10B27KineticLens();
   return;
  }
  try{
   const now=performance.now();
   if(Number.isFinite(this.lastSourceFrameAtMs)){
    const interval=now-this.lastSourceFrameAtMs;
    // Slow genuine SwiftShader frames must NOT vanish from p95/p99.
    // Pause/resume is excluded by resetting lastSourceFrameAtMs above.
    if(interval>0&&interval<3000){
     if(this.sourceFrameIntervalsMs.length===180)
      this.sourceFrameIntervalsMs.shift();
     this.sourceFrameIntervalsMs.push(interval);
    }
   }
   this.lastSourceFrameAtMs=now;
   const cameraDt=Number.isFinite(dt)?Math.min(Math.max(dt,0),.1):0;
   // Each fixed tick already updates the real camera before real projectile
   // aiming. The final interpolated visual update also runs below; the
   // extra pre-tick raycast here was redundant every live frame.
   const simulationStart=this.b20ProfileStart();
   const report=this.clock.advance(dt,(frame,seconds)=>{
    if(this.matchState!=='TIME_UP')this.stepFixed(frame,seconds);
   });
   this.b20ProfileStop('fixedClockCatchup',simulationStart);
   if(this.matchState==='TIME_UP')this.paused=true;
   this.stats.simulationTicksLastFrame=report.ticks;
   this.stats.droppedSimulationSeconds=report.droppedSeconds;
   const entityRenderStart=this.b20ProfileStart();
   this.player.render(report.alpha,this.visual);
   this.cpu.render(report.alpha);
   this.projectiles.render(report.alpha);
   this.humanSub.render(report.alpha);
   this.cpuKit?.render(report.alpha);
   this.feedback.update(cameraDt);
   this.camera.update(this.visual,cameraDt);
   if(this.b27KineticEnabled){
    const realPlayerInput=document.pointerLockElement===this.canvas;
    const gpuTrial=this.b22Trial.snapshot().status;
    const excludeBenchmark=gpuTrial==='ARMED'||gpuTrial==='RUNNING';
    if(excludeBenchmark)this.resetW10B27KineticLens();
    const fov=this.b27KineticView.advanceVisual(
     cameraDt,realPlayerInput,
     this.paused||!!this.stopReason||excludeBenchmark);
    const camera=this.playerCameraEntity.camera;
    if(camera)camera.fov=fov;
   }
   this.b20ProfileStop('entityAndCameraPreparation',entityRenderStart);
   const atlasStart=this.b20ProfileStart();
   this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
   this.b20ProfileStop('inkAtlasMeshBuild',atlasStart);
   this.refreshB23PaintFeedback();
   if(this.renderedFrames%6===0)this.refreshB25PaintRun();
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
 private resetW10B27KineticLens(){
  this.b27KineticView.resetVisual();
  const camera=this.playerCameraEntity.camera;
  if(camera)camera.fov=B27_SOURCE_BASE_FOV_DEGREES;
 }
 /** Presentation-only focus: never changes native source physics or
  * authoritative ink, and never hides the actionable GPU A/B trial.
  * Restores every control as soon as pointer lock is released.
  */
 private refreshB36PlayFocus(){
  if(!this.b36FocusEnabled)return;
  const gpu=this.b22Trial.snapshot().status;
  const activeGpuTrial=gpu==='ARMED'||gpu==='RUNNING';
  const focus=document.pointerLockElement===this.canvas&&!activeGpuTrial;
  this.panel.hidden=focus;
  this.surveyButton.hidden=focus;
  // Keep real B25 practice progression visible, but hide its unusable
  // START control while playing without an active practice attempt.
  this.b25RunCard.hidden=focus&&this.b25Run.snapshot().status==='IDLE';
  this.canvas.dataset.t21W10B36PlayFocus=focus?'ON':'OFF';
 }
 private refreshB25PaintRun(){
  const run=this.b25Run.snapshot();
  const button=this.b25RunButton;
  if(run.status==='IDLE')return;
  button.disabled=run.status==='ARMED'||run.status==='RUNNING';
  button.textContent=run.status==='CLEAR'||run.status==='TIME_UP'||
   run.status==='ABORTED'?'RETRY PAINT RUN':'PAINT RUN ACTIVE';
  if(run.status==='ARMED'){
   this.b25RunProgress.textContent='ARMED · Click the stage to play.';
   return;
  }
  const progress='PAINT '+run.humanChangedImpactCells+'/'+
   run.requiredHumanChangedCells+' real cells\nGROUND '+
   run.realGroundedTravelMeters.toFixed(1)+'/'+
   run.requiredRealGroundedTravelMeters+' m';
  this.b25RunProgress.textContent=
   run.status==='CLEAR'?'PRACTICE CLEAR · NOT A MATCH WIN\n'+progress:
   run.status==='TIME_UP'?'PRACTICE TIME UP · NO WINNER\n'+progress:
   run.status==='ABORTED'?'INTERRUPTED · '+run.abortReason+'\n'+progress:
   run.secondsRemaining+'s LEFT · '+progress;
 }
 private refreshB23PaintFeedback(){
  const event=this.b23InkFeedback.snapshot(this.clock.tick);
  const bombFirst=event.showBombConfirmation&&
   (!event.showPaintConfirmation||
    (event.lastBombTick??-1)>=(event.lastImpactTick??-1));
  const visible=bombFirst||event.showPaintConfirmation;
  this.b23PaintMarker.hidden=!visible||
   this.survey.snapshot().active||this.galleryIndex>=0||this.paused||
   !!this.stopReason;
  if(this.b23PaintMarker.hidden)return;
  this.b23PaintMarker.textContent=bombFirst?
   'BOMB INK · +'+event.lastBombChangedCells+' real cells':
   'INK CONTACT · +'+event.lastImpactChangedCells+' cells';
  const age=bombFirst?(event.bombElapsedTicks??0):(event.elapsedTicks??0);
  this.b23PaintMarker.style.opacity=String(Math.max(.2,1-age/36));
 }
 private sourceFrameQualitySnapshot(){
  const values=this.sourceFrameIntervalsMs.slice().sort((a,b)=>a-b);
  const quantile=(p:number):number|null=>values.length?
   Number(values[Math.min(values.length-1,Math.ceil(p*values.length)-1)]!.toFixed(2)):null;
  return {
   metric:'LIVE_PLAYCANVAS_FRAME_CALLBACK_INTERVAL_NOT_GPU_TIME',
   sampleCount:values.length,liveUpdateFrames:this.renderedFrames,p50Ms:quantile(.50),
   p95Ms:quantile(.95),p99Ms:quantile(.99),
   simulationTicksLastFrame:this.stats.simulationTicksLastFrame,
   accumulatedDroppedSimulationSeconds:this.stats.droppedSimulationSeconds,
   actualStageCameraRaycasts:this.camera.sourcePracticeViewSnapshot().cameraRaycasts,
   nativePointerToFirstAcceptedShotMs:this.realPointerToAcceptedShotMs,
   nativePointerShotSamples:this.realPointerToShotSamples,
   excludedPausedQaInputLatency:true,
   verifiedUserRtxFps:false
  };
 }
 public snapshot(){
  const pos=this.player.getPosition(this.p);
  const progress=this.traffic.snapshot();
  return {
   phase:'F3',renderer:'webgl2',stageId:this.rawStage.metadata.id,
   playableSandbox:true,actualPlayerInput:true,
   cameraSourcePractice:this.camera.sourcePracticeViewSnapshot(),
   sourceFrameQuality:this.sourceFrameQualitySnapshot(),
   b21RenderProbe:this.b21ProbeSnapshot(),
   b22OwnerGpuTrial:this.b22Trial.snapshot(performance.now()),
   b23HumanInkFeedback:this.b23InkFeedback.snapshot(this.clock.tick),
   b39HumanBombInk:this.b23InkFeedback.snapshot(this.clock.tick),
   b25SourcePaintRun:this.b25Run.snapshot(),
   b27KineticSourceView:{
    enabled:this.b27KineticEnabled,
    ...this.b27KineticView.snapshot()
   },
   b20CpuPhaseProfile:this.b20ProfileSnapshot(),
   sourceGpuAtlasStatus:this.atlas.sourceIdleCameraStatus(),
   radarVisible:this.radarVisible,
   originalSourceSolids:this.rawStage.solids.length,
   originalPaintSurfaces:this.rawStage.paintSurfaces.length,
   originalSourceNavigationLinks:this.rawStage.navigationLinks?.length,
   originalSourceOpticalStructures:this.structures.manifest.originalSourceVisualStructures,
   originalSourceOpticalTriangles:this.structures.manifest.originalSourceTriangles,
   originalSourceStudy:this.sourceCompletion.manifest,
   b28OriginalSourceMassing:{
    mode:this.sourceCompletion.getVisualMode(),
    visible:this.sourceCompletion.root.enabled,
    ...this.sourceCompletion.renderAuthority
   },
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
   b29VerifiedSourcePresentation:{
    selected:this.texturedF3l?.root.enabled?'F3L_ORIGINAL_UV':
     this.wholeSourceRoot?.enabled?'F3G_FLAT':'F3E_REFERENCE',
    verifiedTexturePreference:this.b29PreferFlat?'FLAT_MANUAL':'UV_WHEN_VERIFIED',
    explicitlyRequestedReview:this.b29ExplicitFullSourceReview,
    fallbackAvailable:this.wholeSourceStatus==='READY',
    ...B29_SOURCE_VISUAL_AUTHORITY
   },
   b30SourcePhysicalReadability:{
    mode:this.texturedF3l?.getReadabilityMode()??'UNAVAILABLE',
    active:!!this.texturedF3l?.root.enabled,
    originalSourceOnly:true,
    ...this.texturedF3l?.b30NonGameplayAuthority,
    originalPhysicsSolids:this.rawStage.solids.length,
    originalPaintSurfaces:this.rawStage.paintSurfaces.length,
    originalNavLinks:this.rawStage.navigationLinks?.length??0,
    certifiedOriginalScoreableSurfaces:0,
    physicalSourceRouteAuthorityUnchanged:true
   },
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
   b38HumanSub:{
    enabled:this.b38HumanSubEnabled,
    input:'REAL_POINTER_LOCKED_KEY_F',
    weapon:subWeaponProfile(weaponKit(this.projectiles.currentPlayerWeapon.id).sub).displayName,
    throws:this.stats.playerSubThrows,
    explosions:this.stats.playerSubExplosions,
    activeOriginalPaintableSurfaces:this.rawStage.paintSurfaces.length,
    originalScoreableSurfaces:0,
    nativeSourcePhysicsOnly:true,officialTurfWinner:false,
    productionAuthorized:false
   },
   cpuKitQa:{enabled:this.cpuKitQaEnabled,artificialGaugeArms:this.cpuKitArtificialGaugeArms,
    artificialInkRefills:this.cpuKitArtificialGaugeArms,
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
  this.refreshB36PlayFocus();
  // A paused, unlocked or failed source session still updates the practice
  // card immediately instead of leaving stale RUNNING text on screen.
  this.refreshB25PaintRun();
  const state=this.snapshot();
  const p=state.cpu;
  if(this.radarVisible)this.radar.render(state);
  this.practiceHud.render(state);
  this.obstructionNotice.hidden=!(
   state.cameraSourcePractice.geometryClipped&&
   state.cameraSourcePractice.cameraDistanceMeters<2);
  this.obstructionNotice.style.display=
   this.survey.snapshot().active||this.galleryIndex>=0?'none':'';
  this.practiceHud.root.style.display=
   this.survey.snapshot().active||this.galleryIndex>=0?'none':'';
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
   'B27 SOURCE MOTION · '+(state.b27KineticSourceView.enabled?'ON':'QA BASELINE')+
    ' / real foot '+state.b27KineticSourceView.nativeGroundSpeedMetersPerSecond+
    'm/s / visual FOV '+state.b27KineticSourceView.fieldOfViewDegrees+
    '° · NO MOVEMENT CHANGE',
   'B25 SOURCE PAINT RUN · '+state.b25SourcePaintRun.status+
    ' / '+state.b25SourcePaintRun.humanChangedImpactCells+
    ' human cells / '+state.b25SourcePaintRun.realGroundedTravelMeters+
    'm genuine grounded · NOT TURF',
   'B23 HUMAN INK · '+state.b23HumanInkFeedback.humanChangedImpactCount+
    ' real changed contacts / '+state.b23HumanInkFeedback.humanChangedCells+
    ' changed cells · UNSCORED',
   'B39 BOMB INK · '+state.b39HumanBombInk.humanBombStampEvents+
    ' original-surface stamps / '+state.b39HumanBombInk.humanBombChangedEvents+
    ' real changed events / '+state.b39HumanBombInk.humanBombChangedCells+
    ' changed cells · UNSCORED',
   'F3 INK ATLAS · '+(state.sourceGpuAtlasStatus.cameraEnabled?'ACTIVE':'IDLE')+
    ' / brush frames '+state.sourceGpuAtlasStatus.brushRenderFrames+
    ' / idle frames '+state.sourceGpuAtlasStatus.idlePostRenderFrames+
    ' / persistent RT; source-only optimization',
   state.b20CpuPhaseProfile.enabled?
    'B20 CPU PROFILE · '+Object.entries(state.b20CpuPhaseProfile.phases)
     .map(([name,p])=>name+' '+p.averageMs.toFixed(1)+'ms').join(' · '):'',
   'REAL FRAME CALLBACK · p50/p95/p99 '+
    [state.sourceFrameQuality.p50Ms,state.sourceFrameQuality.p95Ms,
     state.sourceFrameQuality.p99Ms].map(v=>v===null?'N/A':v.toFixed(1)).join('/')+
    ' ms / '+state.sourceFrameQuality.sampleCount+' frames · NOT GPU TIME',
   '60Hz CLOCK · ticks/frame '+state.sourceFrameQuality.simulationTicksLastFrame+
    ' / dropped '+state.sourceFrameQuality.accumulatedDroppedSimulationSeconds.toFixed(3)+'s',
   'INPUT→SHOT · '+(state.sourceFrameQuality.nativePointerToFirstAcceptedShotMs===null
     ?'not sampled':state.sourceFrameQuality.nativePointerToFirstAcceptedShotMs.toFixed(1)+'ms')+
    ' · event to accepted simulation shot (not display latency)',
   'CAMERA · Q shoulder '+state.cameraSourcePractice.shoulderSide+
    ' / distance '+state.cameraSourcePractice.cameraDistanceMeters.toFixed(1)+
    'm / source-only obstruction guard'+
    ' · RADAR '+(state.radarVisible?'ON':'OFF')+' (M)',
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
   'B30 SOURCE CUTAWAY · '+state.b30SourcePhysicalReadability.mode+
    ' / Y: original UV ↔ see-through optical source · NO NEW FOOTPATH',
   'B29 ORIGINAL STATIC STAGE · '+state.b29VerifiedSourcePresentation.selected+
    ' · pinned UV only / no original actor placements',
   'B28 ORIGINAL ARCHITECTURE · '+state.b28OriginalSourceMassing.mode+
    ' / '+(state.b28OriginalSourceMassing.visible?'VISIBLE':'OFF')+
    ' · Shift+H: source massing / hologram · UNSCORED',
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
