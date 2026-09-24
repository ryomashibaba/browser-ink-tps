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
  StandardMaterial,
  TextureHandler,
  Vec3
} from 'playcanvas';
import { CpuAgentSystem } from '../ai/CpuAgentSystem';
import { CpuKitSystem } from '../ai/CpuKitSystem';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { CombatTargetSystem } from '../combat/CombatTargetSystem';
import { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { FixedStepClock } from '../core/FixedStepClock';
import { PerformanceStats } from '../core/PerformanceStats';
import { GameFeedback } from '../feedback/GameFeedback';
import { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { GpuInkAtlas } from '../ink/GpuInkAtlas';
import { PaintCoordinator } from '../ink/PaintCoordinator';
import type { PaintSurface } from '../ink/PaintSurface';
import { Team } from '../ink/types';
import { PlayerInput } from '../input/PlayerInput';
import type { GameModeId } from '../match/GameMode';
import { MatchController } from '../match/MatchController';
import { SplatZonesObjectiveSystem } from '../objective/SplatZonesObjectiveSystem';
import { SplatZonesVisualFeedback } from '../objective/SplatZonesVisualFeedback';
import { SuperJumpSystem } from '../mobility/SuperJumpSystem';
import { initializeRecastNavigation, RecastStageNavigation } from '../navigation/RecastStageNavigation';
import { RapierStagePhysics, initializeRapier } from '../physics/RapierStagePhysics';
import { PlayerController } from '../player/PlayerController';
import { ProjectileSystem } from '../projectile/ProjectileSystem';
import { SpecialGaugeSystem } from '../special/SpecialGaugeSystem';
import { auditStageCoordinates } from '../stage/CoordinateAudit';
import {
  buildTestStage,
  defineTestSurfaces,
  PRODUCTION_STAGE_DEFINITION
} from '../stage/TestStage';
import { ControlPanel } from '../ui/ControlPanel';
import { DebugOverlay } from '../ui/DebugOverlay';
import { PlayerHud } from '../ui/PlayerHud';
import { TacticalMap } from '../ui/TacticalMap';
import { SubWeaponSystem } from '../subweapon/SubWeaponSystem';
import {
  subWeaponProfile,
  weaponKit
} from '../weapons/WeaponKitCatalog';

export class InkLabApp {
  public static async boot(canvas: HTMLCanvasElement, uiRoot: HTMLElement): Promise<InkLabApp> {
    await Promise.all([
      initializeRapier(),
      initializeRecastNavigation()
    ]);

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
  private readonly hud: PlayerHud;
  private readonly tacticalMap: TacticalMap;
  private readonly controls: ControlPanel;
  private readonly input: PlayerInput;
  private readonly physics: RapierStagePhysics;
  private readonly cameraController: ThirdPersonCamera;
  private readonly player: PlayerController;
  private readonly resources: PlayerResources;
  private readonly combatTargets: CombatTargetSystem;
  private readonly splatZones: SplatZonesObjectiveSystem;
  private readonly splatZonesVisual: SplatZonesVisualFeedback;
  private readonly match: MatchController;
  private readonly navigation: RecastStageNavigation;
  private readonly cpuAgents: CpuAgentSystem;
  private readonly feedback: GameFeedback;
  private readonly projectiles: ProjectileSystem;
  private readonly cpuKit: CpuKitSystem;
  private readonly subWeapons: SubWeaponSystem;
  private readonly specialGauge: SpecialGaugeSystem;
  private readonly superJump: SuperJumpSystem;

  private readonly playerPosition = new Vec3();
  private readonly cpuHumanPosition = new Vec3();
  private readonly aimDirection = new Vec3();
  private readonly aimTarget = new Vec3();
  private readonly muzzlePosition = new Vec3();
  private readonly coordinateQaMarkers: Entity[] = [];
  private readonly coordinateQaMaterialA = makeQaMarkerMaterial(GAME_CONFIG.visual.teamA);
  private readonly coordinateQaMaterialB = makeQaMarkerMaterial(GAME_CONFIG.visual.teamB);
  private selectedTeam: Team.A | Team.B = Team.A;
  private brushRadius: number = GAME_CONFIG.debug.defaultBrushRadiusMeters;

  private constructor(
    private readonly app: AppBase,
    private readonly canvas: HTMLCanvasElement,
    uiRoot: HTMLElement
  ) {
    const surfaces = defineTestSurfaces(this.gameplayInk, PRODUCTION_STAGE_DEFINITION);
    const requestedAtlas = resolveAtlasSize(app.graphicsDevice.maxTextureSize);
    this.atlas = new GpuInkAtlas(
      app,
      surfaces,
      requestedAtlas,
      GAME_CONFIG.ink.preferredPixelsPerMeter,
      GAME_CONFIG.ink.atlasGutterPixels
    );

    buildTestStage(app, PRODUCTION_STAGE_DEFINITION, surfaces, this.atlas);
    const coordinateAudit = auditStageCoordinates(surfaces, PRODUCTION_STAGE_DEFINITION);
    this.stats.coordinateAudit = coordinateAudit.summary;
    console.info('[CoordinateAudit]', coordinateAudit);

    const cameraEntity = this.createCamera();
    this.createLighting();

    this.coordinator = new PaintCoordinator(this.gameplayInk, this.atlas, this.stats);
    this.input = new PlayerInput(canvas);
    this.physics = new RapierStagePhysics(this.clock.stepSeconds, PRODUCTION_STAGE_DEFINITION);
    this.cameraController = new ThirdPersonCamera(canvas, cameraEntity, surfaces, this.physics);
    this.player = new PlayerController(
      app,
      this.physics,
      this.input,
      this.cameraController,
      this.gameplayInk,
      this.stats
    );
    this.resources = new PlayerResources(this.stats);
    this.combatTargets = new CombatTargetSystem(app, this.stats);
    this.splatZones = new SplatZonesObjectiveSystem(
      this.gameplayInk,
      PRODUCTION_STAGE_DEFINITION,
      this.stats
    );
    this.splatZonesVisual = new SplatZonesVisualFeedback(
      app,
      this.gameplayInk,
      PRODUCTION_STAGE_DEFINITION,
      this.stats
    );
    this.match = new MatchController(
      this.gameplayInk,
      this.stats,
      PRODUCTION_STAGE_DEFINITION,
      this.splatZones
    );
    this.navigation = new RecastStageNavigation(PRODUCTION_STAGE_DEFINITION, this.stats);
    this.cpuAgents = new CpuAgentSystem(
      app,
      this.navigation,
      this.gameplayInk,
      this.coordinator,
      this.stats,
      PRODUCTION_STAGE_DEFINITION,
      this.selectedTeam
    );
    this.feedback = new GameFeedback(app, canvas);
    this.superJump = new SuperJumpSystem(
      app,
      this.player,
      this.feedback,
      this.stats
    );
    this.projectiles = new ProjectileSystem(
      app,
      surfaces,
      this.physics,
      this.coordinator,
      this.resources,
      this.combatTargets,
      this.cpuAgents,
      this.feedback,
      this.stats
    );
    this.cpuKit = new CpuKitSystem(
      app,
      surfaces,
      this.physics,
      this.coordinator,
      this.projectiles,
      this.cpuAgents,
      this.feedback,
      this.stats
    );
    this.subWeapons = new SubWeaponSystem(
      app,
      surfaces,
      this.physics,
      this.coordinator,
      this.resources,
      this.combatTargets,
      this.cpuAgents,
      this.feedback,
      this.stats
    );
    this.specialGauge = new SpecialGaugeSystem(
      surfaces,
      this.coordinator,
      this.combatTargets,
      this.cpuAgents,
      this.feedback,
      this.stats
    );

    this.controls = new ControlPanel(uiRoot, {
      onModeChanged: (mode: GameModeId) => {
        this.match.setGameMode(mode);
        this.restartMatch();
      },
      onTeamChanged: (team) => {
        this.selectedTeam = team;
        this.player.setTeam(team);
        this.superJump.reset();
        this.cpuAgents.reset(team);
        this.cpuKit.reset();
        this.subWeapons.reset();
        this.specialGauge.reset();
      },
      onBrushChanged: (radius) => { this.brushRadius = radius; },
      onWeaponChanged: (weaponId) => this.setPlayerWeaponKit(weaponId),
      onStress: (count) => this.enqueueStressTest(count),
      onRollQaPad: () => {
        this.clearCoordinateQaMarkers();
        this.enqueueRollQaPad();
      },
      onCoordinateQa: () => this.enqueueCoordinateVisualQa(surfaces),
      onRestartMatch: () => this.restartMatch(),
      onSplatQa: () => {
        if (this.match.playerCanAct && !this.superJump.isInvulnerable) {
          this.resources.applyDamage(GAME_CONFIG.match.qaSplatDamage);
        }
      },
      onEndMatchQa: () => {
        this.match.forceEnd();
        this.superJump.cancel();
        this.projectiles.reset();
        this.cpuKit.reset();
        this.subWeapons.reset();
        this.specialGauge.cancelActive();
      },
      onSpecialQaReady: () => this.specialGauge.qaFill(),
      onCpuJumpQa: () => {
        this.cpuAgents.forceSuperJumpQa(
          this.selectedTeam,
          this.superJump.getFocusPosition(this.cpuHumanPosition),
          this.match.playerCanAct && !this.superJump.isInvulnerable
        );
      },
      onCpuAdvancedQa: () => {
        this.cpuKit.reset();
        this.cpuAgents.forceAdvancedWeaponQa();
      },
      onCpuKitQaReady: () => {
        this.cpuAgents.forceKitQaReady();
      },
      onClear: () => {
        this.clearCoordinateQaMarkers();
        this.coordinator.clear();
        this.splatZones.reset();
        this.cpuKit.reset();
        this.cpuAgents.resetKitGauges();
        this.subWeapons.reset();
        this.specialGauge.reset();
      }
    });
    this.selectedTeam = this.controls.selectedTeam;
    this.brushRadius = this.controls.brushRadius;
    this.match.setGameMode(this.controls.selectedMode);
    this.player.setTeam(this.selectedTeam);
    this.setPlayerWeaponKit(this.controls.selectedWeapon);
    this.restartMatch();

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
    this.hud = new PlayerHud(
      uiRoot,
      this.stats,
      this.gameplayInk,
      PRODUCTION_STAGE_DEFINITION,
      () => this.selectedTeam
    );
    this.tacticalMap = new TacticalMap(
      uiRoot,
      PRODUCTION_STAGE_DEFINITION,
      this.gameplayInk,
      this.cpuAgents,
      this.stats,
      () => this.selectedTeam,
      () => this.superJump.canRequest(this.match.playerCanAct),
      (target) => {
        const accepted = this.superJump.request(target, this.selectedTeam);
        if (accepted && document.pointerLockElement !== this.canvas) {
          void this.canvas.requestPointerLock();
        }
        return accepted;
      }
    );

    this.bindMainLoop();
    window.addEventListener('resize', () => app.resizeCanvas());
    app.start();
  }

  private bindMainLoop(): void {
    this.app.on('update', (dt: number) => {
      // Apply the latest mouse yaw/pitch before any fixed ticks so movement does not
      // use the previous render frame's camera basis.
      const cameraDt = Number.isFinite(dt) && dt > 0
        ? Math.min(dt, GAME_CONFIG.simulation.maxFrameDeltaSeconds)
        : 0;
      this.cameraController.update(
        this.superJump.getRenderFocusPosition(this.playerPosition),
        cameraDt
      );

      const report = this.clock.advance(dt, (tick, stepSeconds) => {
        // T4-T11 fixed-step order:
        // match/life state -> optional player KCC motion -> Rapier step -> authoritative player state
        // -> T10 Ink/HP resources + QA combat targets -> pooled projectile sweep
        // -> one PaintRequest -> one immutable PaintEvent.
        this.match.fixedUpdate(stepSeconds, this.resources.currentHp);

        if (this.match.consumeSplatStarted()) {
          this.feedback.splat(
            this.selectedTeam,
            this.player.getPosition(this.playerPosition)
          );
          this.specialGauge.onPlayerSplatted();
          this.superJump.cancel();
          this.player.setLifecycleActive(false);
          this.projectiles.reset();
        }

        if (this.match.consumeRespawnRequest()) {
          this.respawnPlayer();
          this.match.completeRespawn();
        }

        if (this.match.consumeMatchEnded()) {
          this.superJump.cancel();
          this.projectiles.reset();
          this.cpuKit.reset();
          this.subWeapons.reset();
          this.specialGauge.cancelActive();
        }

        const matchPlayerCanAct = this.match.playerCanAct;
        const movementAllowed =
          matchPlayerCanAct && !this.superJump.blocksPlayerControl;
        const dualieSpaceDodge =
          movementAllowed &&
          this.projectiles.currentPlayerWeapon.weaponClass === 'DUALIES' &&
          this.player.currentMode === 'HUMAN' &&
          !this.input.squidHeld &&
          this.input.fireHeld &&
          (this.input.moveX !== 0 || this.input.moveY !== 0) &&
          this.input.consumeJump();

        if (dualieSpaceDodge) {
          this.player.requestWeaponDodge();
        }

        this.player.setWeaponMoveMultiplier(
          this.projectiles.getMovementMultiplier(
            this.input.fireHeld,
            this.input.secondaryHeld
          )
        );
        if (movementAllowed) this.player.computeFixed(stepSeconds);
        if (this.player.consumeWeaponDodgeCompleted()) {
          this.projectiles.notifyDualieDodge();
        }

        this.physics.step();
        this.player.syncAfterPhysics(stepSeconds);
        this.superJump.fixedUpdate(stepSeconds);

        const playerCanAct =
          matchPlayerCanAct && !this.superJump.blocksPlayerControl;
        const playerDamageable =
          matchPlayerCanAct && !this.superJump.isInvulnerable;

        if (matchPlayerCanAct && !this.superJump.isInvulnerable) {
          this.resources.fixedUpdate(
            stepSeconds,
            this.player.currentMode,
            this.player.currentInkRelation
          );
        }
        this.combatTargets.fixedUpdate(stepSeconds);
        const zoneSnapshot = this.splatZones.snapshot();
        this.cpuAgents.setSplatZonesContext(
          this.match.currentMode === 'SPLAT_ZONES',
          zoneSnapshot.control
        );
        this.cpuAgents.fixedUpdate(
          stepSeconds,
          this.match.currentState === 'PLAYING',
          this.selectedTeam,
          this.superJump.getFocusPosition(this.cpuHumanPosition),
          playerDamageable
        );
        this.cpuAgents.drainFireRequests((request) => {
          this.projectiles.queueCpuShot(request);
        });
        this.cpuAgents.drainKitRequests((request) => {
          return this.cpuKit.queue(request);
        });

        // Keep the camera transform current for every catch-up tick. This prevents
        // render-FPS-dependent aim lag when several 60 Hz ticks run in one frame.
        this.cameraController.update(
          this.superJump.getFocusPosition(this.playerPosition)
        );
        this.cameraController.getAimDirection(this.aimDirection);
        this.player.getMuzzlePosition(this.aimDirection, this.muzzlePosition);
        this.cameraController.getAimTarget(this.aimTarget);
        this.projectiles.solvePlayerLaunchDirection(
          this.muzzlePosition,
          this.aimTarget,
          this.aimDirection
        );
        this.projectiles.fixedUpdate(
          stepSeconds,
          this.match.playerCanAct && this.input.fireHeld && this.player.canShoot,
          this.match.playerCanAct && this.input.secondaryHeld && this.player.canShoot,
          this.muzzlePosition,
          this.aimDirection,
          this.selectedTeam,
          this.superJump.getFocusPosition(this.playerPosition),
          playerCanAct,
          playerDamageable
        );

        const subPressed = this.input.consumeSubPressed();
        const specialPressed = this.input.consumeSpecialPressed();
        const activeKit = weaponKit(this.projectiles.currentPlayerWeapon.id);

        if (playerCanAct && subPressed) {
          this.subWeapons.tryThrow(
            activeKit.sub,
            this.selectedTeam,
            this.muzzlePosition,
            this.aimDirection
          );
        }
        if (playerCanAct && specialPressed) {
          this.specialGauge.tryActivate(
            this.selectedTeam,
            this.player.getPosition(this.playerPosition),
            this.aimTarget,
            this.aimDirection
          );
        }

        this.subWeapons.fixedUpdate(stepSeconds);
        this.specialGauge.fixedUpdate(stepSeconds);
        this.cpuKit.fixedUpdate(stepSeconds);

        const paintReport = this.coordinator.processTick(tick);
        this.specialGauge.addHumanScoreablePaint(
          paintReport.humanScoreableAreaMeters2
        );
        this.cpuAgents.addScoreablePaintByActor(
          paintReport.cpuScoreableAreaMeters2ByActor
        );
        this.splatZones.fixedUpdate(
          stepSeconds,
          this.match.currentMode === 'SPLAT_ZONES' &&
            this.match.currentState === 'PLAYING'
        );
      });

      this.superJump.render(report.alpha);
      if (this.superJump.usesExternalPlayerPosition) {
        this.superJump.getRenderFocusPosition(this.playerPosition);
      } else {
        this.player.render(report.alpha, this.playerPosition);
      }
      this.cpuAgents.render(report.alpha);
      this.projectiles.render(report.alpha);
      this.cpuKit.render(report.alpha);
      this.subWeapons.render(report.alpha);
      this.splatZonesVisual.update(this.match.currentMode === 'SPLAT_ZONES');
      this.feedback.update(cameraDt);
      this.cameraController.update(this.playerPosition);

      const gpu = this.atlas.flush(GAME_CONFIG.ink.maxGpuPaintEventsPerFrame);
      this.stats.simulationTicksLastFrame = report.ticks;
      this.stats.droppedSimulationSeconds = report.droppedSeconds;
      this.stats.gpuEventsLastFrame = gpu.events;
      this.stats.gpuPaintBuildMs = gpu.buildMs;
      this.stats.gpuPaintBacklog = this.atlas.backlog;
      this.stats.dirtyTiles = this.gameplayInk.totalDirtyTiles();
      this.stats.frame(dt * 1000);
      this.hud.update();
      this.tacticalMap.update();
      this.overlay.update();
    });
  }

  private setPlayerWeaponKit(weaponId: import('../weapons/WeaponCatalog').WeaponId): void {
    const changed = this.projectiles.currentPlayerWeapon.id !== weaponId;
    if (changed) {
      this.superJump.cancel();
      this.subWeapons.reset();
      this.specialGauge.cancelActive();
    }
    this.projectiles.setPlayerWeapon(weaponId);
    const kit = weaponKit(weaponId);
    this.stats.playerSubWeaponName = subWeaponProfile(kit.sub).displayName;
    this.specialGauge.setSpecial(kit.special);
  }

  private restartMatch(): void {
    this.clearCoordinateQaMarkers();
    this.coordinator.clear();
    this.resources.reset();
    this.combatTargets.reset();
    this.superJump.reset();
    this.projectiles.reset();
    this.cpuKit.reset();
    this.subWeapons.reset();
    this.specialGauge.reset();
    this.match.restart();
    this.cpuAgents.reset(this.selectedTeam);
    this.respawnPlayer();
  }

  private respawnPlayer(): void {
    this.superJump.cancel();
    const spawn = this.match.getSpawnPosition(this.selectedTeam, this.playerPosition);
    this.resources.reset();
    this.player.teleport(spawn);
    this.player.setLifecycleActive(true);
    this.feedback.respawn(this.selectedTeam, spawn);
    this.cameraController.update(this.player.getPosition(this.playerPosition));
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

  private enqueueCoordinateVisualQa(surfaces: readonly PaintSurface[]): void {
    this.clearCoordinateQaMarkers();
    this.coordinator.clear();

    const probes = [
      { u: 0.18, v: 0.18, team: Team.A, radius: 0.30, marker: 0.13 },
      { u: 0.82, v: 0.18, team: Team.A, radius: 0.55, marker: 0.22 },
      { u: 0.82, v: 0.82, team: Team.B, radius: 0.32, marker: 0.14 },
      { u: 0.18, v: 0.82, team: Team.B, radius: 0.58, marker: 0.23 }
    ] as const;

    for (const surface of surfaces) {
      const outward = this.getSurfaceOutwardNormal(surface);
      probes.forEach((probe, index) => {
        const u = surface.widthMeters * probe.u;
        const v = surface.heightMeters * probe.v;
        this.coordinator.enqueue(this.coordinator.makeDebugRequest(
          probe.team,
          surface.id,
          u,
          v,
          probe.radius,
          0,
          1
        ));

        const marker = new Entity(`CoordQA:${surface.id}:${index}`);
        marker.addComponent('render', {
          type: 'sphere',
          material: probe.team === Team.A
            ? this.coordinateQaMaterialA
            : this.coordinateQaMaterialB,
          castShadows: false,
          receiveShadows: false
        });
        marker.setLocalScale(probe.marker, probe.marker, probe.marker);
        const world = surface.localToWorld(u, v);
        world.add(outward.clone().mulScalar(0.10));
        marker.setPosition(world);
        this.app.root.addChild(marker);
        this.coordinateQaMarkers.push(marker);
      });
    }
  }

  private clearCoordinateQaMarkers(): void {
    for (const marker of this.coordinateQaMarkers) marker.destroy();
    this.coordinateQaMarkers.length = 0;
  }

  private getSurfaceOutwardNormal(surface: PaintSurface): Vec3 {
    const spec = PRODUCTION_STAGE_DEFINITION.paintSurfaces.find(
      (candidate) => candidate.id === surface.id
    );
    const solid = spec
      ? PRODUCTION_STAGE_DEFINITION.solids.find((candidate) => candidate.id === spec.backingSolidId)
      : undefined;
    const outward = surface.normal.clone();
    if (!solid) return outward;

    const toSurface = surface.center.clone().sub(new Vec3(
      solid.center[0],
      solid.center[1],
      solid.center[2]
    ));
    if (toSurface.dot(outward) < 0) outward.mulScalar(-1);
    return outward;
  }

  private enqueueRollQaPad(): void {
    const surface = this.gameplayInk.getSurface('main-floor');
    if (!surface) {
      console.warn('Roll QA Pad requires the main-floor PaintSurface.');
      return;
    }

    // Fill the entire main-floor in PaintSurface-local coordinates.
    // CPU rasterization and GPU atlas clipping should both end at the exact surface boundary.
    this.coordinator.enqueue(this.coordinator.makeDebugRequest(
      this.selectedTeam,
      surface.id,
      surface.widthMeters * 0.5,
      surface.heightMeters * 0.5,
      surface.heightMeters,
      0,
      surface.widthMeters / surface.heightMeters
    ));
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


function makeQaMarkerMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.75, rgb[1] * 0.75, rgb[2] * 0.75);
  material.useMetalness = true;
  material.metalness = 0.05;
  material.gloss = 0.92;
  material.update();
  return material;
}
