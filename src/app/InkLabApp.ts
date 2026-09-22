import {
  AppBase,
  AppOptions,
  CameraComponentSystem,
  Color,
  ContainerHandler,
  createGraphicsDevice,
  DEVICETYPE_WEBGPU,
  Entity,
  FILLMODE_FILL_WINDOW,
  LightComponentSystem,
  RenderComponentSystem,
  RESOLUTION_AUTO,
  TextureHandler,
  Vec3
} from 'playcanvas';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { FixedStepClock } from '../core/FixedStepClock';
import { PerformanceStats } from '../core/PerformanceStats';
import { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { GpuInkAtlas } from '../ink/GpuInkAtlas';
import { PaintCoordinator } from '../ink/PaintCoordinator';
import { Team } from '../ink/types';
import { PlayerInput } from '../input/PlayerInput';
import { RapierStagePhysics, initializeRapier } from '../physics/RapierStagePhysics';
import { PlayerController } from '../player/PlayerController';
import { ProjectileSystem } from '../projectile/ProjectileSystem';
import { buildTestStage, defineTestSurfaces } from '../stage/TestStage';
import { ControlPanel } from '../ui/ControlPanel';
import { DebugOverlay } from '../ui/DebugOverlay';

export class InkLabApp {
  public static async boot(canvas: HTMLCanvasElement, uiRoot: HTMLElement): Promise<InkLabApp> {
    await initializeRapier();

    const device = await createGraphicsDevice(canvas, {
      deviceTypes: [DEVICETYPE_WEBGPU],
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance'
    });
    device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem];
    options.resourceHandlers = [TextureHandler, ContainerHandler];

    const app = new AppBase(canvas);
    app.init(options);
    app.maxDeltaTime = GAME_CONFIG.simulation.maxFrameDeltaSeconds;
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);

    return new InkLabApp(app, canvas, uiRoot);
  }

  private readonly gameplayInk = new GameplayInkSystem();
  private readonly stats = new PerformanceStats();
  private readonly clock = new FixedStepClock(
    GAME_CONFIG.simulation.tickRate,
    GAME_CONFIG.simulation.maxCatchUpTicksPerFrame,
    GAME_CONFIG.simulation.maxFrameDeltaSeconds
  );

  private readonly atlas: GpuInkAtlas;
  private readonly coordinator: PaintCoordinator;
  private readonly overlay: DebugOverlay;
  private readonly controls: ControlPanel;
  private readonly input: PlayerInput;
  private readonly physics: RapierStagePhysics;
  private readonly cameraController: ThirdPersonCamera;
  private readonly player: PlayerController;
  private readonly projectiles: ProjectileSystem;

  private readonly playerPosition = new Vec3();
  private readonly aimDirection = new Vec3();
  private readonly aimTarget = new Vec3();
  private readonly muzzlePosition = new Vec3();
  private selectedTeam: Team.A | Team.B = Team.A;
  private brushRadius: number = GAME_CONFIG.debug.defaultBrushRadiusMeters;

  private constructor(
    private readonly app: AppBase,
    private readonly canvas: HTMLCanvasElement,
    uiRoot: HTMLElement
  ) {
    const surfaces = defineTestSurfaces(this.gameplayInk);
    const requestedAtlas = resolveAtlasSize(app.graphicsDevice.maxTextureSize);
    this.atlas = new GpuInkAtlas(
      app,
      surfaces,
      requestedAtlas,
      GAME_CONFIG.ink.preferredPixelsPerMeter,
      GAME_CONFIG.ink.atlasGutterPixels
    );

    buildTestStage(app, surfaces, this.atlas);
    const cameraEntity = this.createCamera();
    this.createLighting();

    this.coordinator = new PaintCoordinator(this.gameplayInk, this.atlas, this.stats);
    this.input = new PlayerInput(canvas);
    this.physics = new RapierStagePhysics(this.clock.stepSeconds);
    this.cameraController = new ThirdPersonCamera(canvas, cameraEntity, surfaces);
    this.player = new PlayerController(
      app,
      this.physics,
      this.input,
      this.cameraController,
      this.gameplayInk,
      this.stats
    );
    this.projectiles = new ProjectileSystem(app, surfaces, this.coordinator, this.stats);

    this.controls = new ControlPanel(uiRoot, {
      onTeamChanged: (team) => {
        this.selectedTeam = team;
        this.player.setTeam(team);
      },
      onBrushChanged: (radius) => { this.brushRadius = radius; },
      onStress: (count) => this.enqueueStressTest(count),
      onClear: () => this.coordinator.clear()
    });
    this.selectedTeam = this.controls.selectedTeam;
    this.brushRadius = this.controls.brushRadius;
    this.player.setTeam(this.selectedTeam);

    // Alt+left click preserves the T0-T3 direct-paint QA path without stealing normal fire.
    this.cameraController.onDebugInkClick = ({ hit }) => {
      const stretch = 1.0 + Math.random() * 0.28;
      this.coordinator.enqueue(this.coordinator.makeDebugRequest(
        this.selectedTeam,
        hit.surface.id,
        hit.u,
        hit.v,
        this.brushRadius,
        Math.random() * Math.PI,
        stretch
      ));
    };
    this.cameraController.update(this.player.getPosition(this.playerPosition));

    this.overlay = new DebugOverlay(
      uiRoot,
      app,
      this.clock,
      this.stats,
      this.gameplayInk,
      this.atlas,
      app.graphicsDevice.deviceType
    );

    this.bindMainLoop();
    window.addEventListener('resize', () => app.resizeCanvas());
    app.start();
  }

  private bindMainLoop(): void {
    this.app.on('update', (dt: number) => {
      // Apply the latest mouse yaw/pitch before any fixed ticks so movement does not
      // use the previous render frame's camera basis.
      this.cameraController.update(this.player.getPosition(this.playerPosition));

      const report = this.clock.advance(dt, (tick, stepSeconds) => {
        // T4-T7 fixed-step order:
        // input/state -> KCC desired motion -> Rapier step -> authoritative state
        // -> pooled projectile sweep -> one PaintRequest -> one immutable PaintEvent.
        this.player.computeFixed(stepSeconds);
        this.physics.step();
        this.player.syncAfterPhysics();

        // Keep the camera transform current for every catch-up tick. This prevents
        // render-FPS-dependent aim lag when several 60 Hz ticks run in one frame.
        this.cameraController.update(this.player.getPosition(this.playerPosition));
        this.cameraController.getAimDirection(this.aimDirection);
        this.player.getMuzzlePosition(this.aimDirection, this.muzzlePosition);
        this.cameraController.getAimTarget(this.aimTarget);
        this.aimDirection.copy(this.aimTarget).sub(this.muzzlePosition);
        if (this.aimDirection.lengthSq() > 1e-8) this.aimDirection.normalize();
        this.projectiles.fixedUpdate(
          stepSeconds,
          this.input.fireHeld,
          this.muzzlePosition,
          this.aimDirection,
          this.selectedTeam
        );

        this.coordinator.processTick(tick);
      });

      this.cameraController.update(this.player.getPosition(this.playerPosition));

      const gpu = this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
      this.stats.simulationTicksLastFrame = report.ticks;
      this.stats.droppedSimulationSeconds = report.droppedSeconds;
      this.stats.gpuEventsLastFrame = gpu.events;
      this.stats.gpuPaintBuildMs = gpu.buildMs;
      this.stats.gpuPaintBacklog = this.atlas.backlog;
      this.stats.dirtyTiles = this.gameplayInk.totalDirtyTiles();
      this.stats.frame(dt * 1000);
      this.overlay.update();
    });
  }

  private createCamera(): Entity {
    const world = this.app.scene.layers.getLayerByName('World');
    if (!world) throw new Error('PlayCanvas World layer is unavailable.');

    const camera = new Entity('MainCamera');
    camera.addComponent('camera', {
      clearColor: new Color(...GAME_CONFIG.visual.sky, 1),
      nearClip: 0.1,
      farClip: 120,
      fov: 60,
      layers: [world.id]
    });
    this.app.root.addChild(camera);
    return camera;
  }

  private createLighting(): void {
    this.app.scene.ambientLight = new Color(0.50, 0.55, 0.62);

    const key = new Entity('KeyLight');
    key.addComponent('light', {
      type: 'directional',
      color: new Color(1.0, 0.95, 0.88),
      intensity: 1.4,
      castShadows: true,
      shadowResolution: 2048
    });
    key.setEulerAngles(52, -34, 0);
    this.app.root.addChild(key);

    const fill = new Entity('FillLight');
    fill.addComponent('light', {
      type: 'omni',
      color: new Color(0.25, 0.68, 0.95),
      intensity: 1.8,
      range: 18,
      castShadows: false
    });
    fill.setPosition(-4, 6, 4);
    this.app.root.addChild(fill);
  }

  private enqueueStressTest(count: number): void {
    const surfaces = this.gameplayInk.getSurfaces();
    const requests = [];
    for (let i = 0; i < count; i += 1) {
      const surface = surfaces[Math.floor(Math.random() * surfaces.length)]!;
      const team = Math.random() > 0.5 ? Team.A : Team.B;
      const radius = 0.45 + Math.random() * 1.55;
      requests.push(this.coordinator.makeDebugRequest(
        team,
        surface.id,
        Math.random() * surface.widthMeters,
        Math.random() * surface.heightMeters,
        radius,
        Math.random() * Math.PI * 2,
        0.65 + Math.random() * 0.85
      ));
    }
    this.coordinator.enqueueMany(requests);
  }
}

function resolveAtlasSize(maxTextureSize: number): number {
  const url = new URL(window.location.href);
  const forced = Number(url.searchParams.get('inkAtlas'));
  if (forced === 2048 || forced === 4096) {
    if (forced <= maxTextureSize) return forced;
    console.warn(`Requested inkAtlas=${forced}, but GPU maxTextureSize is ${maxTextureSize}. Falling back.`);
  }

  if (maxTextureSize >= GAME_CONFIG.ink.requestedAtlasSize) return GAME_CONFIG.ink.requestedAtlasSize;
  if (maxTextureSize >= GAME_CONFIG.ink.fallbackAtlasSize) return GAME_CONFIG.ink.fallbackAtlasSize;
  throw new Error(`GPU max texture size ${maxTextureSize} is below the 2048 ink-atlas fallback requirement.`);
}
