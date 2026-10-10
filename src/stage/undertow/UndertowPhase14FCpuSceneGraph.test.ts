import {Entity, Vec3} from 'playcanvas';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {initializeRecastNavigation, RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {
  UndertowPhase14ECpuHandoff,
  nearestT21SourceSupportedLanding
} from './UndertowPhase14ECpuHandoff';

const dt = 1 / 60;
type Side = 'positive-z' | 'negative-z';
interface QaBot {
  id: string;
  agent: CrowdAgent | null;
  entity: Entity;
  position: Vec3;
  previousPosition: Vec3;
  mobilityState: string;
  lifeState: 'ACTIVE' | 'SPLATTED';
  respawnRemainingSeconds: number;
  thinkRemaining: number;
  paintRemaining: number;
  fireRemaining: number;
  specialPoints: number;
}
type QaCpu = Omit<CpuAgentSystem, 'bots' | 'splatBot'> & {
  bots: QaBot[];
  splatBot(bot: QaBot): void;
};
const sides: readonly Side[] = ['positive-z', 'negative-z'];

function createScene() {
  // Keep the real PlayCanvas Entity/GraphNode transforms under test. Only the
  // GPU render-component registry is substituted: Vitest has no GPU/canvas.
  vi.spyOn(Entity.prototype, 'addComponent').mockImplementation(() => null as never);
  const root = new Entity('T21-Phase14F-CPU-QA-only');
  const qaStage = undertowT21dConnectivityQaStage();
  const stats = new PerformanceStats();
  const navigation = new RecastStageNavigation(qaStage, stats);
  const adapter = new UndertowPhase14ECpuHandoff(qaStage, true);
  const ink = new GameplayInkSystem();
  const enqueue = vi.fn();
  const cpu = new CpuAgentSystem(
    {root} as never, navigation, ink, {enqueue} as never,
    stats, qaStage, Team.A, adapter
  ) as unknown as QaCpu;
  const bots = cpu.bots;
  const selected = [bots.find(b => b.id === 'A1')!, bots.find(b => b.id === 'B1')!];
  expect(selected.every(Boolean)).toBe(true);
  // Nonparticipant bots are inert; the scene retains the standard 7-CPU
  // constructor path without changing gameplay spawning or match settings.
  for (const bot of bots) {
    if (selected.includes(bot)) continue;
    bot.lifeState = 'SPLATTED';
    bot.respawnRemainingSeconds = 1000;
  }
  return {root, qaStage, cpu, bots, selected, stats, navigation, adapter, enqueue};
}

function startOriginalFall(
  scene: ReturnType<typeof createScene>, bot: QaBot, side: Side
) {
  const solid = scene.qaStage.solids.find(s =>
    s.id === 'UndertowT21D:first-drop-landing-' + side
  );
  expect(solid).toBeDefined();
  const link = scene.qaStage.navigationLinks!.find(l =>
    l.id === 'first-drop-' + side + '-3'
  )!;
  const landing = nearestT21SourceSupportedLanding(solid!, {
    x: link.start[0], y: link.start[1], z: link.start[2]
  });
  // Deterministic source-supported upper origin. Phase14E separately proves
  // that *real* Crowd offmesh transitions reach this adapter; this fixture
  // isolates CpuAgentSystem's tick/render/lifecycle wiring.
  const source = {x: landing.x, y: 7.5, z: landing.z};
  expect(Math.sign(source.z)).toBe(Math.sign(link.end[2]));
  if (bot.agent) scene.navigation.removeAgent(bot.agent);
  bot.agent = null;
  bot.position.set(source.x, source.y, source.z);
  bot.previousPosition.copy(bot.position);
  bot.thinkRemaining = 0;
  bot.paintRemaining = 0;
  bot.fireRemaining = 0;
  expect(scene.adapter.observe(bot.id, source, {
    x: source.x, y: 3, z: source.z
  }, dt)).toBe(true);
  bot.mobilityState = 'FIRST_DROP_FALL';
  return source;
}

function tick(scene: ReturnType<typeof createScene>, active = true) {
  scene.cpu.fixedUpdate(dt, active, Team.A, new Vec3(0, 7.5, 0), false);
}

afterEach(() => vi.restoreAllMocks());
beforeAll(async () => {
  await Promise.all([initializeRapier(), initializeRecastNavigation()]);
});

describe('T21 Phase14F opt-in CpuAgentSystem / PlayCanvas scene-graph integration', () => {
  it('interpolates TWO simultaneous original-source Rapier drops through actual CPU render(alpha)', () => {
    const scene = createScene();
    for (let i = 0; i < sides.length; i++) {
      startOriginalFall(scene, scene.selected[i]!, sides[i]!);
    }
    expect(scene.adapter.activeCount).toBe(2);
    const travel = new Map<string, {frames: number; maxStep: number}>();
    for (const bot of scene.selected) travel.set(bot.id, {frames: 0, maxStep: 0});
    const started = performance.now();
    for (let frame = 0; frame < 150; frame++) {
      const bothFallingAtTickStart = scene.selected.every(
        bot => bot.mobilityState === 'FIRST_DROP_FALL'
      );
      const previous = scene.selected.map(bot => bot.position.clone());
      tick(scene);
      for (let i = 0; i < scene.selected.length; i++) {
        const bot = scene.selected[i]!;
        const before = previous[i]!;
        const record = travel.get(bot.id)!;
        if (record.frames === 0 || bot.mobilityState === 'FIRST_DROP_FALL') {
          record.frames++;
          record.maxStep = Math.max(record.maxStep, bot.position.distance(before));
        }
        // Physics foot is not the visual capsule center (+0.68m).
        // Falling has zero bob; assert the *real* PlayCanvas transform.
        for (const alpha of [0, 0.5, 1]) {
          scene.cpu.render(alpha);
          const visual = bot.entity.getPosition();
          expect(visual.x).toBeCloseTo(before.x + (bot.position.x - before.x) * alpha, 5);
          const interpolatedY = before.y + (bot.position.y - before.y) * alpha + 0.68;
          // Grounding activates the existing cosmetic bob (<=0.025m). In
          // FIRST_DROP_FALL it is disabled, so strict physics lerp applies.
          if (bot.mobilityState === 'FIRST_DROP_FALL')
            expect(visual.y).toBeCloseTo(interpolatedY, 5);
          else expect(Math.abs(visual.y - interpolatedY)).toBeLessThanOrEqual(0.03);
          expect(visual.z).toBeCloseTo(before.z + (bot.position.z - before.z) * alpha, 5);
        }
      }
      // The first landed agent is allowed to resume actions while its mirrored
      // partner finishes one frame later. Suppression is enforced only while
      // both are still physically falling.
      if (bothFallingAtTickStart) {
      expect(scene.stats.cpuPaintRequests).toBe(0);
      expect(scene.stats.cpuShots).toBe(0);
      expect(scene.stats.cpuSubUses).toBe(0);
      expect(scene.stats.cpuSpecialActivations).toBe(0);
      expect(scene.stats.cpuTacticalRetargets).toBe(0);
      expect(scene.enqueue).not.toHaveBeenCalled();
      const fire: unknown[] = [], kits: unknown[] = [];
      scene.cpu.drainFireRequests(r => fire.push(r));
      scene.cpu.drainKitRequests(r => { kits.push(r); return false; });
      expect(fire).toHaveLength(0);
      expect(kits).toHaveLength(0);
      }
      if (scene.selected.every(bot => bot.mobilityState === 'GROUND')) break;
    }
    const elapsedMs = performance.now() - started;
    for (const bot of scene.selected) {
      expect(bot.mobilityState).toBe('GROUND');
      expect(bot.agent).not.toBeNull();
      expect(travel.get(bot.id)!.frames).toBeGreaterThan(20);
      expect(travel.get(bot.id)!.maxStep).toBeLessThan(0.6);
    }
    expect(scene.adapter.activeCount).toBe(0);
    console.log('T21_PHASE14F_REAL_CPU_SCENE_GRAPH', JSON.stringify({
      bots: scene.selected.map(bot => ({
        id: bot.id, frames: travel.get(bot.id)!.frames,
        maxStepMeters: travel.get(bot.id)!.maxStep,
        finalFoot: {x: bot.position.x, y: bot.position.y, z: bot.position.z}
      })),
      sceneGraph: 'REAL_PLAYCANVAS_ENTITY_TRANSFORMS',
      gpuScreenshotValidated: false,
      physicalAdapter: 'REAL_RAPIER_SOURCE_MASKED',
      renderAlpha: [0, 0.5, 1],
      measuredLoopMs: elapsedMs,
      activationAuthorized: false
    }));
    scene.cpu.reset(Team.A);
    expect(scene.adapter.activeCount).toBe(0);
    expect(scene.root.children.length).toBe(scene.bots.length * 3);
  });

  it('cancels both Rapier bodies on match pause and reset, without duplicating starts', () => {
    const scene = createScene();
    for (let i = 0; i < sides.length; i++)
      startOriginalFall(scene, scene.selected[i]!, sides[i]!);
    tick(scene);
    expect(scene.adapter.activeCount).toBe(2);
    // Active id cannot acquire a second Rapier bridge.
    const first = scene.selected[0]!;
    expect(scene.adapter.observe(first.id,
      {x: first.position.x, y: first.position.y, z: first.position.z},
      {x: first.position.x, y: 3, z: first.position.z}, dt)).toBe(false);
    tick(scene, false);
    expect(scene.adapter.activeCount).toBe(0);
    for (const bot of scene.selected) {
      expect(bot.mobilityState).toBe('GROUND');
      expect(bot.agent).not.toBeNull();
    }
    tick(scene, false);
    scene.cpu.reset(Team.A);
    expect(scene.adapter.activeCount).toBe(0);
    expect(scene.cpu.bots).toHaveLength(7);
    expect(scene.qaStage.navigationLinks).toHaveLength(26);
  });

  it('preserves lower-layer settling across pause and rejects a persistent unsupported Crowd height', () => {
    const scene = createScene();
    const bot = scene.selected[0]!;
    startOriginalFall(scene, bot, 'positive-z');
    for(let i=0;i<120&&bot.mobilityState==='FIRST_DROP_FALL';i++)tick(scene);
    expect(bot.mobilityState).toBe('FIRST_DROP_REJOIN');
    expect(bot.agent).not.toBeNull();
    expect(scene.adapter.activeCount).toBe(0);
    const physicalFoot=bot.position.clone();
    tick(scene,false);
    expect(bot.mobilityState).toBe('FIRST_DROP_REJOIN');
    expect(bot.agent).not.toBeNull();
    expect(bot.position.distance(physicalFoot)).toBeLessThan(1e-6);
    // Negative-path fixture: Crowd is stuck above the original landing.
    // The QA runtime must never move the visible CPU or enable combat.
    const frozenPosition={x:bot.position.x,y:bot.position.y+3,z:bot.position.z};
    vi.spyOn(bot.agent!, 'position').mockImplementation(() => frozenPosition);
    for(let i=0;i<45;i++){
      tick(scene);
      expect(bot.mobilityState).toBe('FIRST_DROP_REJOIN');
      expect(bot.position.distance(physicalFoot)).toBeLessThan(1e-6);
    }
    expect(() => tick(scene)).toThrow('T21_PHASE14H_REJOIN_STABILITY_TIMEOUT');
    expect(bot.agent).toBeNull();
    expect(bot.position.distance(physicalFoot)).toBeLessThan(1e-6);
    expect(scene.stats.cpuPaintRequests).toBe(0);
    expect(scene.stats.cpuShots).toBe(0);
    scene.cpu.reset(Team.A);
    expect(scene.adapter.activeCount).toBe(0);
    expect(freeze.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });

  it('releases a falling CPU on SPLAT, rejects non-60Hz physics, preserves frozen authority', () => {
    const scene = createScene();
    const bot = scene.selected[0]!;
    startOriginalFall(scene, bot, 'positive-z');
    tick(scene);
    expect(scene.adapter.activeCount).toBe(1);
    expect(() => scene.adapter.advance(bot.id, 0.02)).toThrow('60HZ_REQUIRED');
    expect(scene.adapter.activeCount).toBe(1);
    scene.cpu.splatBot(bot); // controlled midair lifecycle injection, not gameplay hit proof
    expect(scene.adapter.activeCount).toBe(0);
    expect(bot.lifeState).toBe('SPLATTED');
    expect(bot.agent).toBeNull();
    scene.cpu.reset(Team.A);
    expect(scene.adapter.activeCount).toBe(0);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(freeze.activationReady).toBe(false);
    expect(scene.qaStage.solids).toHaveLength(25);
    expect(scene.qaStage.paintSurfaces).toHaveLength(17);
    expect(scene.qaStage.navigationLinks).toHaveLength(26);
  });
});
