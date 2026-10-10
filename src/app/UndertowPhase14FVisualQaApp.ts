/**
 * Phase14F GPU evidence only. This app is not reachable from production
 * InkLabApp or stage selection; booted solely through explicit ?t21Qa=phase14f.
 * The source-backed KCC is real, while its initial offmesh interception is a
 * controlled fixture (Phase14E tests the real Recast handoff separately).
 */
import {
  AppBase, AppOptions, CameraComponentSystem, Color, ContainerHandler,
  createGraphicsDevice, DEVICETYPE_WEBGL2, Entity, FILLMODE_FILL_WINDOW,
  LightComponentSystem, RenderComponentSystem, RESOLUTION_AUTO,
  StandardMaterial, TextureHandler, Vec3
} from 'playcanvas';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import type {PaintCoordinator} from '../ink/PaintCoordinator';
import {Team} from '../ink/types';
import {initializeRecastNavigation, RecastStageNavigation} from '../navigation/RecastStageNavigation';
import {initializeRapier} from '../physics/RapierStagePhysics';
import {
  UndertowPhase14ECpuHandoff, nearestT21SourceSupportedLanding
} from '../stage/undertow/UndertowPhase14ECpuHandoff';
import {undertowT21dConnectivityQaStage} from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from '../stage/undertow/UndertowSpillwayBlockoutGeometry';

const STEP = 1 / 60;
const SIDE = ['positive-z', 'negative-z'] as const;
type Side = typeof SIDE[number];
type QaBot = {
  id: string; team: Team.A | Team.B; entity: Entity;
  position: Vec3; previousPosition: Vec3; agent: unknown;
  mobilityState: string; lifeState: string; respawnRemainingSeconds: number;
  thinkRemaining: number; paintRemaining: number; fireRemaining: number;
};
type SceneSnapshot = {
  frame: number; renderer: string; phase14FOnly: true;
  cpu: Array<{id: string; foot: [number, number, number];
    visual: [number, number, number]; state: string; hasCrowd: boolean}>;
  activePhysicalBodies: number; paintRequests: number;
  shootingRequests: number; tacticalRetargets: number;
  activationAuthorized: false; originalDropTriggerProvenInScene: false;
  realGpuPixelsCapturedByBrowser: false;
};
function material(diffuse: [number, number, number]) {
  const m = new StandardMaterial();
  m.diffuse = new Color(...diffuse);
  m.emissive = new Color(diffuse[0] * 0.2, diffuse[1] * 0.2, diffuse[2] * 0.2);
  m.useMetalness = true;
  m.metalness = 0.16;
  m.gloss = 0.5;
  m.update();
  return m;
}
export class UndertowPhase14FVisualQaApp {
  public static async boot(canvas: HTMLCanvasElement, panel: HTMLElement) {
    // Fail closed on every unrelated game/review URL.
    if (new URL(location.href).searchParams.get('t21Qa') !== 'phase14f' ||
        freeze.activationReady !== false)
      throw new Error('T21_PHASE14F_EXPLICIT_QA_ONLY');
    await Promise.all([initializeRapier(), initializeRecastNavigation()]);
    const device = await createGraphicsDevice(canvas, {
      deviceTypes: [DEVICETYPE_WEBGL2],
      antialias: true, depth: true, stencil: false,
      powerPreference: 'high-performance'
    });
    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem];
    options.resourceHandlers = [TextureHandler, ContainerHandler];
    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
    return new UndertowPhase14FVisualQaApp(app, canvas, panel);
  }

  private readonly stats = new PerformanceStats();
  private readonly navigation = new RecastStageNavigation(undertowT21dConnectivityQaStage(), this.stats);
  private readonly stage = undertowT21dConnectivityQaStage();
  private readonly adapter = new UndertowPhase14ECpuHandoff(this.stage, true);
  private readonly cpu: CpuAgentSystem;
  private readonly selected: QaBot[];
  private readonly origins: Array<{side: Side; foot: [number, number, number]}>;
  private frame = 0;

  private constructor(
    private readonly app: AppBase, private readonly canvas: HTMLCanvasElement,
    private readonly panel: HTMLElement
  ) {
    if (this.stage.solids.length !== 25 ||
        this.stage.paintSurfaces.length !== 17 ||
        this.stage.navigationLinks?.length !== 26)
      throw new Error('T21_PHASE14F_STAGE_SOURCE_DRIFT');

    const world = app.scene.layers.getLayerByName('World');
    if (!world) throw new Error('T21_PHASE14F_WORLD_LAYER_MISSING');

    app.scene.ambientLight = new Color(0.54, 0.58, 0.65);
    const sun = new Entity('Phase14F:Light');
    sun.addComponent('light', {type: 'directional', intensity: 1.7, color: new Color(1, 1, 1)});
    sun.setEulerAngles(45, 25, 0);
    app.root.addChild(sun);
    const camera = new Entity('Phase14F:Camera');
    camera.addComponent('camera', {
      clearColor: new Color(0.015, 0.025, 0.045, 1),
      nearClip: 0.1, farClip: 350, fov: 42, layers: [world.id]
    });
    app.root.addChild(camera);

    // No GPU ink atlas or fake scoreable floor is constructed here. Footstep
    // painting is suppressed for the controlled fall, and its counter audited.
    const coordinator = {enqueue: (_: unknown) => {
      throw new Error('T21_PHASE14F_UNAUTHORIZED_PAINT_ENQUEUE');
    }} as unknown as PaintCoordinator;
    this.cpu = new CpuAgentSystem(app, this.navigation, new GameplayInkSystem(),
      coordinator, this.stats, this.stage, Team.A, this.adapter);

    // Private access is deliberately quarantined inside this opt-in QA app.
    // It never changes the CpuAgentSystem production API.
    const bots = (this.cpu as unknown as {bots: QaBot[]}).bots;
    this.selected = ['A1', 'B1'].map(id => {
      const found = bots.find(bot => bot.id === id);
      if (!found) throw new Error('T21_PHASE14F_CPU_INVENTORY_DRIFT_' + id);
      return found;
    });
    for (const bot of bots) {
      if (this.selected.includes(bot)) continue;
      if (bot.agent) this.navigation.removeAgent(bot.agent as never);
      bot.agent = null;
      bot.lifeState = 'SPLATTED';
      bot.respawnRemainingSeconds = 9000;
      bot.entity.enabled = false;
    }
    this.origins = SIDE.map((side, index) => {
      const bot = this.selected[index]!;
      const link = this.stage.navigationLinks?.find(l =>
        l.id === 'first-drop-' + side + '-3');
      const solid = this.stage.solids.find(s =>
        s.id === 'UndertowT21D:first-drop-landing-' + side);
      if (!link || !solid || link.start[1] !== 7.5 || link.end[1] !== 3)
        throw new Error('T21_PHASE14F_ORIGINAL_SOURCE_OR_LINK_CHANGED');
      const original = nearestT21SourceSupportedLanding(solid, {
        x: link.start[0], y: link.start[1], z: link.start[2]
      });
      const source = {x: original.x, y: 7.5, z: original.z};
      if (bot.agent) this.navigation.removeAgent(bot.agent as never);
      bot.agent = null;
      bot.position.set(source.x, source.y, source.z);
      bot.previousPosition.copy(bot.position);
      bot.thinkRemaining = 900;
      bot.paintRemaining = 900;
      bot.fireRemaining = 900;
      if (!this.adapter.observe(bot.id, source,
        {x: source.x, y: 3, z: source.z}, STEP))
        throw new Error('T21_PHASE14F_ORIGINAL_KCC_FIXTURE_REJECTED');
      bot.mobilityState = 'FIRST_DROP_FALL';
      bot.entity.setPosition(source.x, source.y + 0.68, source.z);

      // Optically distinctive original-footprint anchor marker, render-only.
      // NOT an asserted floor surface, production collider, or ink authority.
      const marker = new Entity('Phase14F:DIAGNOSTIC_MARKER:' + side);
      marker.addComponent('render', {
        type: 'cylinder',
        material: material(index === 0 ? [0.12, 0.85, 0.95] : [0.95, 0.24, 0.72])
      });
      marker.setLocalScale(1.15, 0.06, 1.15);
      marker.setPosition(source.x, 3.02, source.z);
      app.root.addChild(marker);
      return {side, foot: [source.x, source.y, source.z]};
    });
    if (this.adapter.activeCount !== 2)
      throw new Error('T21_PHASE14F_EXPECTED_TWO_RAPIER_BRIDGES');

    const requested = new URL(location.href).searchParams.get('qaSide');
    const index = requested === 'negative-z' ? 1 : 0;
    const origin = this.origins[index]!.foot;
    camera.setPosition(origin[0] + 8, 11.5, origin[2] + 16);
    camera.lookAt(origin[0], 5.3, origin[2]);

    panel.innerHTML = '';
    const label = document.createElement('div');
    label.id = 't21-phase14f-panel';
    label.style.cssText = 'position:absolute;left:16px;top:16px;z-index:50;'+
      'background:rgba(4,14,28,.88);color:#f5f9ff;padding:14px 18px;'+
      'font:14px monospace;border:1px solid #6c9ab8;max-width:570px;'+
      'pointer-events:none;white-space:pre-line;';
    panel.appendChild(label);
    this.canvas.dataset.t21Phase14fReady = 'READY';
    this.canvas.dataset.t21Phase14fRenderer =
      (app.graphicsDevice as {deviceType?: string}).deviceType ?? 'unknown';
    this.canvas.dataset.t21Phase14fSide = this.origins[index]!.side;
    this.canvas.dataset.t21Phase14fActivation = 'FORBIDDEN';

    // Camera renders via genuine PlayCanvas WebGL2. Physics steps only when an
    // explicit CDP/human QA command is made, giving reproducible screenshots.
    const qa = {
      advance: (count: number): SceneSnapshot => this.advance(count),
      snapshot: (): SceneSnapshot => this.snapshot()
    };
    (window as unknown as {__t21Phase14F?: typeof qa}).__t21Phase14F = qa;
    this.cpu.render(1);
    this.refreshLabel(label);
    window.addEventListener('resize', () => app.resizeCanvas());
    app.start();
  }

  private refreshLabel(label: HTMLElement) {
    const snap = this.snapshot();
    label.textContent =
      'T21 Phase14F / OPT-IN WEBGL2 QA ONLY\n' +
      'Synthetic offmesh interception; genuine original landing Rapier KCC\n' +
      'No T20/T21 production change. Human Visual Freeze NOT APPROVED.\n' +
      'frame: ' + snap.frame + '  physical bridges: ' + snap.activePhysicalBodies +
      '  side camera: ' + this.canvas.dataset.t21Phase14fSide + '\n' +
      snap.cpu.map(b => b.id + ' ' + b.state + ' footY=' + b.foot[1].toFixed(3)).join('\n');
    this.canvas.dataset.t21Phase14fFrame = String(this.frame);
  }

  private advance(count: number): SceneSnapshot {
    if (!Number.isSafeInteger(count) || count < 0 || count > 180)
      throw new Error('T21_PHASE14F_INVALID_QA_STEP_COUNT');
    for (let i = 0; i < count; i++) {
      this.cpu.fixedUpdate(STEP, true, Team.A, new Vec3(0, 7.5, 0), false);
      this.cpu.render(1);
      this.frame++;
    }
    const label = this.panel.querySelector('#t21-phase14f-panel');
    if (label) this.refreshLabel(label as HTMLElement);
    return this.snapshot();
  }

  private snapshot(): SceneSnapshot {
    const cpu = this.selected.map(b => {
      const visual = b.entity.getPosition();
      return {
        id: b.id,
        foot: [b.position.x, b.position.y, b.position.z] as [number, number, number],
        visual: [visual.x, visual.y, visual.z] as [number, number, number],
        state: b.mobilityState,
        hasCrowd: b.agent !== null
      };
    });
    return {
      frame: this.frame,
      renderer: this.canvas.dataset.t21Phase14fRenderer || 'unknown',
      phase14FOnly: true,
      cpu,
      activePhysicalBodies: this.adapter.activeCount,
      paintRequests: this.stats.cpuPaintRequests,
      shootingRequests: this.stats.cpuShots,
      tacticalRetargets: this.stats.cpuTacticalRetargets,
      activationAuthorized: false,
      originalDropTriggerProvenInScene: false,
      realGpuPixelsCapturedByBrowser: false
    };
  }
}
