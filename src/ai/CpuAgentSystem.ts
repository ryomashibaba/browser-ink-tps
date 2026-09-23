import type { CrowdAgent } from 'recast-navigation';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import { CpuTacticalDirector, type CpuRole } from './CpuTacticalDirector';
import type { RecastStageNavigation } from '../navigation/RecastStageNavigation';
import type { StageDefinition } from '../stage/StageDefinition';

export interface CpuCombatHit {
  botId: string;
  distance: number;
  point: Vec3;
}

export interface CpuFireRequest {
  sourceId: string;
  team: Team.A | Team.B;
  origin: Vec3;
  target: Vec3;
}

interface CpuBot {
  id: string;
  team: Team.A | Team.B;
  role: CpuRole;
  slot: number;
  agent: CrowdAgent | null;
  entity: Entity;
  previousPosition: Vec3;
  position: Vec3;
  thinkRemaining: number;
  paintRemaining: number;
  fireRemaining: number;
  hp: number;
  ink: number;
  inkRecoveryLockSeconds: number;
  hpRecoveryDelaySeconds: number;
  lifeState: 'ACTIVE' | 'SPLATTED';
  respawnRemainingSeconds: number;
}

export class CpuAgentSystem {
  private readonly bots: CpuBot[] = [];
  private readonly pendingShots: CpuFireRequest[] = [];
  private readonly director: CpuTacticalDirector;
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly goal = new Vec3();
  private readonly samplePoint = new Vec3();
  private readonly targetPoint = new Vec3();
  private activeLastTick = false;

  public constructor(
    private readonly app: AppBase,
    private readonly navigation: RecastStageNavigation,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly coordinator: PaintCoordinator,
    private readonly stats: PerformanceStats,
    private readonly stage: StageDefinition,
    humanTeam: Team.A | Team.B
  ) {
    this.director = new CpuTacticalDirector(gameplayInk, stage);
    this.materialA = makeCpuMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeCpuMaterial(GAME_CONFIG.visual.teamB);
    this.reset(humanTeam);
  }

  public reset(humanTeam: Team.A | Team.B): void {
    for (const bot of this.bots) {
      if (bot.agent) this.navigation.removeAgent(bot.agent);
      bot.entity.destroy();
    }
    this.bots.length = 0;
    this.pendingShots.length = 0;
    this.stats.cpuTacticalRetargets = 0;
    this.stats.cpuPaintRequests = 0;
    this.stats.cpuShots = 0;
    this.stats.cpuCombatHits = 0;
    this.stats.cpuSplats = 0;
    this.stats.cpuRespawns = 0;

    const teamACount = humanTeam === Team.A ? 3 : 4;
    const teamBCount = GAME_CONFIG.cpu.cpuPlayers - teamACount;
    this.spawnTeam(Team.A, teamACount);
    this.spawnTeam(Team.B, teamBCount);
    this.activeLastTick = false;
    this.syncStats();
  }

  public fixedUpdate(
    dt: number,
    matchActive: boolean,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): void {
    if (!matchActive) {
      if (this.activeLastTick) {
        for (const bot of this.bots) bot.agent?.resetMoveTarget();
      }
      this.activeLastTick = false;
      this.syncStats();
      return;
    }

    this.activeLastTick = true;

    for (const bot of this.bots) {
      if (bot.lifeState === 'SPLATTED') {
        bot.respawnRemainingSeconds = Math.max(0, bot.respawnRemainingSeconds - dt);
        if (bot.respawnRemainingSeconds <= 0) this.respawnBot(bot);
        continue;
      }

      this.updateResources(bot, dt);
      if (bot.hp <= 0) {
        this.splatBot(bot);
        continue;
      }

      bot.previousPosition.copy(bot.position);
      bot.thinkRemaining -= dt;
      if (bot.thinkRemaining <= 0) {
        this.director.chooseGoal({
          team: bot.team,
          role: bot.role,
          slot: bot.slot,
          humanTeam,
          currentPosition: bot.position,
          humanPosition
        }, this.goal);
        bot.agent?.requestMoveTarget(this.navigation.closestPoint(this.goal));
        bot.thinkRemaining += GAME_CONFIG.cpu.tacticalThinkSeconds;
        this.stats.cpuTacticalRetargets += 1;
      }
    }

    this.navigation.fixedUpdate(dt);

    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE' || !bot.agent) continue;

      const p = bot.agent.position();
      bot.position.set(p.x, p.y, p.z);

      bot.paintRemaining -= dt;
      if (bot.paintRemaining <= 0) {
        bot.paintRemaining += GAME_CONFIG.cpu.paintCadenceSeconds;
        this.paintAtBot(bot);
      }

      bot.fireRemaining -= dt;
      if (bot.fireRemaining <= 0) {
        bot.fireRemaining += cpuFireInterval(bot);
        this.tryQueueShot(bot, humanTeam, humanPosition, humanActive);
      }
    }

    this.syncStats();
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE') continue;
      const dx = bot.position.x - bot.previousPosition.x;
      const dz = bot.position.z - bot.previousPosition.z;
      const moving = Math.min(1, Math.hypot(dx, dz) / 0.055);
      const phase = performance.now() * 0.008 + bot.slot * 1.7;
      const bob = Math.sin(phase * 1.8) * 0.025 * moving;
      const squash = Math.abs(Math.sin(phase * 1.8)) * 0.025 * moving;
      bot.entity.setPosition(
        bot.previousPosition.x + dx * t,
        bot.previousPosition.y + (bot.position.y - bot.previousPosition.y) * t + 0.68 + bob,
        bot.previousPosition.z + dz * t
      );
      bot.entity.setLocalScale(
        0.58 * (1 + squash),
        0.88 * (1 - squash * 1.35),
        0.58 * (1 + squash)
      );
    }
  }

  public drainFireRequests(consumer: (request: CpuFireRequest) => void): void {
    for (const request of this.pendingShots) consumer(request);
    this.pendingShots.length = 0;
  }

  public forEachMapAgent(
    visitor: (
      id: string,
      team: Team.A | Team.B,
      position: Vec3,
      active: boolean
    ) => void
  ): void {
    for (const bot of this.bots) {
      visitor(bot.id, bot.team, bot.position, bot.lifeState === 'ACTIVE');
    }
  }

  public findNearestCombatHit(
    from: Vec3,
    to: Vec3,
    sourceTeam: Team.A | Team.B
  ): CpuCombatHit | null {
    const segment = to.clone().sub(from);
    const length = segment.length();
    if (length <= 1e-8) return null;
    const direction = segment.mulScalar(1 / length);

    let best: CpuCombatHit | null = null;
    for (const bot of this.bots) {
      if (bot.team === sourceTeam || bot.lifeState !== 'ACTIVE') continue;

      for (const yOffset of GAME_CONFIG.cpu.hitSphereOffsetsMeters) {
        const center = bot.position.clone();
        center.y += yOffset;
        const distance = raySphereDistance(
          from,
          direction,
          length,
          center,
          GAME_CONFIG.cpu.hitRadiusMeters
        );
        if (distance === null || (best && distance >= best.distance)) continue;
        best = {
          botId: bot.id,
          distance,
          point: from.clone().add(direction.clone().mulScalar(distance))
        };
      }
    }
    return best;
  }

  public applyProjectileHit(hit: CpuCombatHit, damage: number): void {
    const bot = this.bots.find((candidate) => candidate.id === hit.botId);
    if (!bot || bot.lifeState !== 'ACTIVE' || bot.hp <= 0) return;

    const previous = bot.hp;
    bot.hp = Math.max(0, bot.hp - damage);
    bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
    if (bot.hp < previous) this.stats.cpuCombatHits += 1;
  }

  public applyAreaDamage(
    center: Vec3,
    radius: number,
    damage: number,
    sourceTeam: Team.A | Team.B
  ): number {
    if (radius <= 0 || damage <= 0) return 0;
    const radiusSq = radius * radius;
    let hits = 0;

    for (const bot of this.bots) {
      if (bot.team === sourceTeam || bot.lifeState !== 'ACTIVE' || bot.hp <= 0) continue;
      const dx = bot.position.x - center.x;
      const dy = bot.position.y + 0.68 - center.y;
      const dz = bot.position.z - center.z;
      if (dx * dx + dy * dy + dz * dz > radiusSq) continue;

      const previous = bot.hp;
      bot.hp = Math.max(0, bot.hp - damage);
      bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
      if (bot.hp < previous) {
        this.stats.cpuCombatHits += 1;
        hits += 1;
      }
    }
    return hits;
  }

  private spawnTeam(team: Team.A | Team.B, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const slot = this.bots.filter((bot) => bot.team === team).length;
      const start = this.spawnPosition(team, slot);
      const agent = this.navigation.addAgent(start);
      const role = roleForSlot(slot);

      const entity = new Entity(`CPU:${team === Team.A ? 'A' : 'B'}:${slot + 1}:${role}`);
      entity.addComponent('render', {
        type: 'capsule',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: true,
        receiveShadows: true
      });
      entity.setLocalScale(0.58, 0.88, 0.58);
      entity.setPosition(start.x, start.y + 0.68, start.z);
      this.app.root.addChild(entity);

      this.bots.push({
        id: `${team === Team.A ? 'A' : 'B'}${slot + 1}`,
        team,
        role,
        slot,
        agent,
        entity,
        previousPosition: start.clone(),
        position: start.clone(),
        thinkRemaining:
          GAME_CONFIG.cpu.tacticalThinkSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        paintRemaining:
          GAME_CONFIG.cpu.paintCadenceSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        fireRemaining:
          GAME_CONFIG.cpu.fireIntervalSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        hp: GAME_CONFIG.combat.playerMaxHp,
        ink: GAME_CONFIG.inkEconomy.capacity,
        inkRecoveryLockSeconds: 0,
        hpRecoveryDelaySeconds: 0,
        lifeState: 'ACTIVE',
        respawnRemainingSeconds: 0
      });
    }
  }

  private updateResources(bot: CpuBot, dt: number): void {
    bot.inkRecoveryLockSeconds = Math.max(0, bot.inkRecoveryLockSeconds - dt);
    bot.hpRecoveryDelaySeconds = Math.max(0, bot.hpRecoveryDelaySeconds - dt);

    this.samplePoint.copy(bot.position);
    this.samplePoint.y += 0.10;
    const sample = this.gameplayInk.sampleWorld(
      this.samplePoint,
      0.48,
      SurfaceFlags.Scoreable,
      SurfaceFlags.Wall
    );
    const relation = !sample || sample.owner === Team.Neutral
      ? 'NEUTRAL'
      : sample.owner === bot.team ? 'OWN' : 'ENEMY';

    if (bot.inkRecoveryLockSeconds <= 0) {
      const rate = relation === 'OWN'
        ? GAME_CONFIG.cpu.ownInkRecoveryPerSecond
        : GAME_CONFIG.inkEconomy.humanRecoveryPerSecond;
      bot.ink = Math.min(GAME_CONFIG.inkEconomy.capacity, bot.ink + rate * dt);
    }

    if (relation === 'ENEMY' && bot.hp > GAME_CONFIG.combat.enemyInkMinimumHp) {
      const damage = Math.min(
        GAME_CONFIG.combat.enemyInkDamagePerSecond * dt,
        bot.hp - GAME_CONFIG.combat.enemyInkMinimumHp
      );
      bot.hp -= damage;
      if (damage > 0) bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
    } else if (bot.hp > 0 && bot.hpRecoveryDelaySeconds <= 0) {
      const rate = relation === 'OWN'
        ? GAME_CONFIG.cpu.ownInkHpRecoveryPerSecond
        : GAME_CONFIG.combat.humanHpRecoveryPerSecond;
      bot.hp = Math.min(GAME_CONFIG.combat.playerMaxHp, bot.hp + rate * dt);
    }
  }

  private tryQueueShot(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): void {
    if (bot.ink + 1e-6 < GAME_CONFIG.inkEconomy.inkPerShot) return;

    const target = this.chooseCombatTarget(bot, humanTeam, humanPosition, humanActive);
    if (!target) return;

    const dx = target.x - bot.position.x;
    const dy = target.y - (bot.position.y + GAME_CONFIG.cpu.muzzleHeightMeters);
    const dz = target.z - bot.position.z;
    if (dx * dx + dy * dy + dz * dz > GAME_CONFIG.cpu.combatRangeMeters ** 2) return;

    bot.ink = Math.max(0, bot.ink - GAME_CONFIG.inkEconomy.inkPerShot);
    bot.inkRecoveryLockSeconds = GAME_CONFIG.inkEconomy.recoveryLockSeconds;

    const origin = new Vec3(
      bot.position.x,
      bot.position.y + GAME_CONFIG.cpu.muzzleHeightMeters,
      bot.position.z
    );
    this.pendingShots.push({
      sourceId: bot.id,
      team: bot.team,
      origin,
      target: target.clone()
    });
    this.stats.cpuShots += 1;
  }

  private chooseCombatTarget(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): Vec3 | null {
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let found = false;

    if (humanActive && humanTeam !== bot.team) {
      const distanceSq = horizontalDistanceSq(bot.position, humanPosition);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        this.targetPoint.copy(humanPosition);
        found = true;
      }
    }

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team === bot.team ||
        candidate.lifeState !== 'ACTIVE'
      ) {
        continue;
      }
      const distanceSq = horizontalDistanceSq(bot.position, candidate.position);
      if (distanceSq >= bestDistanceSq) continue;
      bestDistanceSq = distanceSq;
      this.targetPoint.copy(candidate.position);
      this.targetPoint.y += 0.68;
      found = true;
    }

    if (!found) return null;

    if (bot.role === 'SKIRMISHER' && humanActive && humanTeam !== bot.team) {
      const humanDistanceSq = horizontalDistanceSq(bot.position, humanPosition);
      if (humanDistanceSq <= GAME_CONFIG.cpu.combatRangeMeters ** 2) {
        this.targetPoint.copy(humanPosition);
      }
    }

    return this.targetPoint;
  }

  private paintAtBot(bot: CpuBot): void {
    this.samplePoint.copy(bot.position);
    this.samplePoint.y += 0.10;

    const sample = this.gameplayInk.sampleWorld(
      this.samplePoint,
      0.45,
      SurfaceFlags.Paintable | SurfaceFlags.Scoreable,
      SurfaceFlags.Wall
    );
    if (!sample) return;

    this.coordinator.enqueue({
      source: PaintSource.Cpu,
      team: bot.team,
      surfaceId: sample.surface.id,
      centerU: sample.u,
      centerV: sample.v,
      radiusU: GAME_CONFIG.cpu.paintRadiusMeters * 1.15,
      radiusV: GAME_CONFIG.cpu.paintRadiusMeters,
      angle: 0,
      type: PaintEventType.Foot,
      strength: 0.85
    });
    this.stats.cpuPaintRequests += 1;
  }

  private splatBot(bot: CpuBot): void {
    if (bot.lifeState === 'SPLATTED') return;
    bot.lifeState = 'SPLATTED';
    bot.respawnRemainingSeconds = GAME_CONFIG.match.respawnSeconds;
    bot.entity.enabled = false;
    if (bot.agent) {
      this.navigation.removeAgent(bot.agent);
      bot.agent = null;
    }
    this.stats.cpuSplats += 1;
  }

  private respawnBot(bot: CpuBot): void {
    const start = this.spawnPosition(bot.team, bot.slot);
    bot.agent = this.navigation.addAgent(start);
    bot.position.copy(start);
    bot.previousPosition.copy(start);
    bot.hp = GAME_CONFIG.combat.playerMaxHp;
    bot.ink = GAME_CONFIG.inkEconomy.capacity;
    bot.inkRecoveryLockSeconds = 0;
    bot.hpRecoveryDelaySeconds = 0;
    bot.thinkRemaining = GAME_CONFIG.cpu.tacticalThinkSeconds * 0.25;
    bot.paintRemaining = GAME_CONFIG.cpu.paintCadenceSeconds * 0.5;
    bot.fireRemaining = GAME_CONFIG.cpu.fireIntervalSeconds * 0.5;
    bot.respawnRemainingSeconds = 0;
    bot.lifeState = 'ACTIVE';
    bot.entity.enabled = true;
    bot.entity.setPosition(start.x, start.y + 0.68, start.z);
    this.stats.cpuRespawns += 1;
  }

  private spawnPosition(team: Team.A | Team.B, slot: number): Vec3 {
    const slots = team === Team.A
      ? this.stage.metadata.teamASpawnSlots
      : this.stage.metadata.teamBSpawnSlots;
    const fallback = team === Team.A
      ? this.stage.metadata.teamASpawn
      : this.stage.metadata.teamBSpawn;
    const selected = slots[slot] ?? fallback;
    const desired = new Vec3(selected[0], selected[1], selected[2]);
    const snapped = this.navigation.closestPoint(desired);
    return new Vec3(snapped.x, snapped.y, snapped.z);
  }

  private syncStats(): void {
    let teamA = 0;
    let teamB = 0;
    let painter = 0;
    let skirmisher = 0;
    let anchor = 0;
    let alive = 0;
    let hpTotal = 0;
    let inkTotal = 0;

    for (const bot of this.bots) {
      if (bot.team === Team.A) teamA += 1;
      else teamB += 1;
      if (bot.role === 'PAINTER') painter += 1;
      else if (bot.role === 'SKIRMISHER') skirmisher += 1;
      else anchor += 1;

      if (bot.lifeState === 'ACTIVE') alive += 1;
      hpTotal += bot.hp;
      inkTotal += bot.ink;
    }

    this.stats.cpuAgents = this.bots.length;
    this.stats.cpuTeamA = teamA;
    this.stats.cpuTeamB = teamB;
    this.stats.cpuRoles = `P${painter} / S${skirmisher} / A${anchor}`;
    this.stats.cpuAlive = alive;
    this.stats.cpuAverageHp = this.bots.length > 0 ? hpTotal / this.bots.length : 0;
    this.stats.cpuAverageInk = this.bots.length > 0 ? inkTotal / this.bots.length : 0;
  }
}

function roleForSlot(slot: number): CpuRole {
  const cycle: readonly CpuRole[] = ['PAINTER', 'SKIRMISHER', 'PAINTER', 'ANCHOR'];
  return cycle[slot % cycle.length] ?? 'PAINTER';
}

function cpuFireInterval(bot: CpuBot): number {
  return GAME_CONFIG.cpu.fireIntervalSeconds + (bot.slot % 3) * 0.035;
}

function horizontalDistanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function raySphereDistance(
  origin: Vec3,
  direction: Vec3,
  maxDistance: number,
  center: Vec3,
  radius: number
): number | null {
  const offset = origin.clone().sub(center);
  const b = offset.dot(direction);
  const c = offset.dot(offset) - radius * radius;
  if (c > 0 && b > 0) return null;
  const discriminant = b * b - c;
  if (discriminant < 0) return null;
  const distance = Math.max(0, -b - Math.sqrt(discriminant));
  return distance <= maxDistance ? distance : null;
}

function makeCpuMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0] * 0.82, rgb[1] * 0.82, rgb[2] * 0.82);
  material.emissive = new Color(rgb[0] * 0.12, rgb[1] * 0.12, rgb[2] * 0.12);
  material.useMetalness = true;
  material.metalness = 0.20;
  material.gloss = 0.76;
  material.update();
  return material;
}
