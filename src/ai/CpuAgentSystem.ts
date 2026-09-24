import type { CrowdAgent } from 'recast-navigation';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import { CpuTacticalDirector, type CpuRole } from './CpuTacticalDirector';
import { CPU_ADVANCED_QA_WEAPONS, cpuLoadout } from './CpuLoadoutCatalog';
import { weaponProfile, type WeaponId } from '../weapons/WeaponCatalog';
import {
  specialWeaponProfile,
  subWeaponProfile,
  weaponKit,
  type SpecialWeaponId,
  type SubWeaponId
} from '../weapons/WeaponKitCatalog';
import type { RecastStageNavigation } from '../navigation/RecastStageNavigation';
import type { StageDefinition } from '../stage/StageDefinition';

export interface CpuCombatHit {
  botId: string;
  distance: number;
  point: Vec3;
  guarded: boolean;
}

export type CpuWeaponAction =
  | 'PROJECTILE'
  | 'ROLLER_FLICK'
  | 'ROLLER_ROLL'
  | 'BRUSH_SWIPE'
  | 'BRELLA_BURST'
  | 'STRINGER_RELEASE'
  | 'SPLATANA_RELEASE';

export type CpuKitRequest =
  | {
      kind: 'SUB';
      sourceId: string;
      team: Team.A | Team.B;
      position: Vec3;
      target: Vec3;
      direction: Vec3;
      subId: SubWeaponId;
    }
  | {
      kind: 'SPECIAL';
      sourceId: string;
      team: Team.A | Team.B;
      position: Vec3;
      target: Vec3;
      direction: Vec3;
      specialId: SpecialWeaponId;
    };

export interface CpuFireRequest {
  sourceId: string;
  team: Team.A | Team.B;
  origin: Vec3;
  bodyPosition: Vec3;
  target: Vec3;
  weaponId: WeaponId;
  charge: number;
  action: CpuWeaponAction;
}

type CpuMobilityState =
  | 'GROUND'
  | 'JUMP_PREP'
  | 'JUMP_TRAVEL'
  | 'JUMP_LANDING';

interface CpuJumpCandidate {
  id: string;
  position: Vec3;
  isHuman: boolean;
  score: number;
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
  weaponId: WeaponId;
  weaponChargeSeconds: number;
  weaponBurstShotsRemaining: number;
  weaponBurstCooldown: number;
  weaponRollPaintCooldown: number;
  weaponFacing: Vec3;
  weaponGuardHp: number;
  weaponGuardBreakSeconds: number;
  weaponGuarding: boolean;
  guardEntity: Entity;
  hp: number;
  ink: number;
  inkRecoveryLockSeconds: number;
  hpRecoveryDelaySeconds: number;
  lifeState: 'ACTIVE' | 'SPLATTED';
  respawnRemainingSeconds: number;
  mobilityState: CpuMobilityState;
  jumpMarker: Entity;
  jumpStartPosition: Vec3;
  jumpTargetPosition: Vec3;
  jumpTargetId: string;
  jumpPrepRemaining: number;
  jumpTravelElapsed: number;
  jumpActionRemaining: number;
  jumpCooldownSeconds: number;
  jumpRespawnWindowSeconds: number;
  jumpArcHeight: number;
  subCooldownSeconds: number;
  specialPoints: number;
  specialDecisionCooldownSeconds: number;
}

export class CpuAgentSystem {
  private readonly bots: CpuBot[] = [];
  private readonly pendingShots: CpuFireRequest[] = [];
  private readonly pendingKitRequests: CpuKitRequest[] = [];
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
      bot.jumpMarker.destroy();
      bot.guardEntity.destroy();
    }
    this.bots.length = 0;
    this.pendingShots.length = 0;
    this.pendingKitRequests.length = 0;
    this.stats.cpuTacticalRetargets = 0;
    this.stats.cpuPaintRequests = 0;
    this.stats.cpuShots = 0;
    this.stats.cpuCombatHits = 0;
    this.stats.cpuSplats = 0;
    this.stats.cpuRespawns = 0;
    this.stats.cpuSuperJumps = 0;
    this.stats.cpuSuperJumpPrep = 0;
    this.stats.cpuSuperJumpAirborne = 0;
    this.stats.cpuSuperJumpLandings = 0;
    this.stats.cpuSuperJumpCancels = 0;
    this.stats.cpuSuperJumpLast = '-';
    this.stats.cpuWeaponGuardBlocks = 0;
    this.stats.cpuAdvancedQa = 'default';
    this.stats.cpuSubUses = 0;
    this.stats.cpuSpecialActivations = 0;
    this.stats.cpuKitLast = '-';

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
      this.pendingKitRequests.length = 0;
      if (this.activeLastTick) {
        for (const bot of this.bots) {
          bot.agent?.resetMoveTarget();
          this.resetCpuWeaponRuntime(bot);
          if (bot.mobilityState !== 'GROUND') this.cancelCpuJump(bot, true);
        }
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

      bot.jumpCooldownSeconds = Math.max(0, bot.jumpCooldownSeconds - dt);
      bot.jumpRespawnWindowSeconds = Math.max(0, bot.jumpRespawnWindowSeconds - dt);
      bot.subCooldownSeconds = Math.max(0, bot.subCooldownSeconds - dt);
      bot.specialDecisionCooldownSeconds = Math.max(
        0,
        bot.specialDecisionCooldownSeconds - dt
      );
      bot.previousPosition.copy(bot.position);

      if (bot.mobilityState === 'JUMP_TRAVEL' || bot.mobilityState === 'JUMP_LANDING') {
        this.updateCpuJumpAirborne(bot, dt);
        continue;
      }

      this.updateResources(bot, dt);
      if (bot.hp <= 0) {
        this.splatBot(bot);
        continue;
      }

      if (bot.mobilityState === 'JUMP_PREP') {
        bot.jumpPrepRemaining = Math.max(0, bot.jumpPrepRemaining - dt);
        if (bot.jumpPrepRemaining <= 0) this.beginCpuJumpTravel(bot);
        continue;
      }

      bot.thinkRemaining -= dt;
      if (bot.thinkRemaining <= 0) {
        const jumpStarted = this.tryStartTacticalJump(
          bot,
          humanTeam,
          humanPosition,
          humanActive,
          false
        );

        if (!jumpStarted) {
          this.director.chooseGoal({
            team: bot.team,
            role: bot.role,
            slot: bot.slot,
            humanTeam,
            currentPosition: bot.position,
            humanPosition
          }, this.goal);
          bot.agent?.requestMoveTarget(this.navigation.closestPoint(this.goal));
          this.stats.cpuTacticalRetargets += 1;
        }

        bot.thinkRemaining += GAME_CONFIG.cpu.tacticalThinkSeconds;
      }
    }

    this.navigation.fixedUpdate(dt);

    for (const bot of this.bots) {
      if (
        bot.lifeState !== 'ACTIVE' ||
        bot.mobilityState !== 'GROUND' ||
        !bot.agent
      ) {
        continue;
      }

      const p = bot.agent.position();
      bot.position.set(p.x, p.y, p.z);

      bot.paintRemaining -= dt;
      if (bot.paintRemaining <= 0) {
        bot.paintRemaining += GAME_CONFIG.cpu.paintCadenceSeconds;
        this.paintAtBot(bot);
      }

      this.updateCpuWeapon(
        bot,
        dt,
        humanTeam,
        humanPosition,
        humanActive
      );
      this.updateCpuKit(
        bot,
        humanTeam,
        humanPosition,
        humanActive
      );
    }

    this.syncStats();
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE') {
        bot.guardEntity.enabled = false;
        continue;
      }

      const x = lerp(bot.previousPosition.x, bot.position.x, t);
      const y = lerp(bot.previousPosition.y, bot.position.y, t);
      const z = lerp(bot.previousPosition.z, bot.position.z, t);

      if (bot.mobilityState === 'JUMP_TRAVEL' || bot.mobilityState === 'JUMP_LANDING') {
        const total =
          GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;
        const elapsed = bot.mobilityState === 'JUMP_TRAVEL'
          ? bot.jumpTravelElapsed
          : GAME_CONFIG.superJump.travelSeconds +
            (GAME_CONFIG.superJump.actionSeconds - bot.jumpActionRemaining);
        const progress = Math.max(0, Math.min(1, elapsed / Math.max(total, 1e-6)));
        bot.entity.setPosition(x, y + 0.68, z);
        bot.entity.setLocalScale(0.50, 1.02, 0.50);
        bot.entity.setLocalEulerAngles(progress * 720, progress * 300, 0);
        bot.guardEntity.enabled = false;
        continue;
      }

      const dx = bot.position.x - bot.previousPosition.x;
      const dz = bot.position.z - bot.previousPosition.z;
      const moving = bot.mobilityState === 'GROUND'
        ? Math.min(1, Math.hypot(dx, dz) / 0.055)
        : 0;
      const phase = performance.now() * 0.008 + bot.slot * 1.7;
      const bob = Math.sin(phase * 1.8) * 0.025 * moving;
      const squash = Math.abs(Math.sin(phase * 1.8)) * 0.025 * moving;
      bot.entity.setPosition(x, y + 0.68 + bob, z);
      bot.entity.setLocalScale(
        0.58 * (1 + squash),
        0.88 * (1 - squash * 1.35),
        0.58 * (1 + squash)
      );
      bot.entity.setLocalEulerAngles(0, 0, 0);
      this.renderCpuGuard(bot, x, y, z);
    }
  }

  public drainFireRequests(consumer: (request: CpuFireRequest) => void): void {
    for (const request of this.pendingShots) consumer(request);
    this.pendingShots.length = 0;
  }

  public drainKitRequests(consumer: (request: CpuKitRequest) => void): void {
    for (const request of this.pendingKitRequests) consumer(request);
    this.pendingKitRequests.length = 0;
  }

  public isActorActive(actorId: string): boolean {
    const bot = this.bots.find((candidate) => candidate.id === actorId);
    return Boolean(bot && bot.lifeState === 'ACTIVE');
  }

  public addScoreablePaintByActor(
    areaByActor: Readonly<Record<string, number>>
  ): void {
    for (const [actorId, area] of Object.entries(areaByActor)) {
      if (!Number.isFinite(area) || area <= 0) continue;
      const bot = this.bots.find((candidate) => candidate.id === actorId);
      if (!bot) continue;

      const kit = weaponKit(bot.weaponId);
      const required = specialWeaponProfile(kit.special).requiredPoints;
      bot.specialPoints = Math.min(
        required,
        bot.specialPoints +
          area * GAME_CONFIG.special.pointsPerScoreableSquareMeter
      );
    }
    this.syncStats();
  }

  public resetKitGauges(): void {
    for (const bot of this.bots) {
      bot.specialPoints = 0;
      bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
      bot.specialDecisionCooldownSeconds =
        GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    }
    this.pendingKitRequests.length = 0;
    this.stats.cpuKitLast = '-';
    this.syncStats();
  }

  public forceKitQaReady(): boolean {
    let changed = 0;
    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE') continue;
      const special = weaponKit(bot.weaponId).special;
      bot.specialPoints = specialWeaponProfile(special).requiredPoints;
      bot.specialDecisionCooldownSeconds = 0;
      bot.subCooldownSeconds = 0;
      changed += 1;
    }
    if (changed > 0) {
      this.stats.cpuKitLast = 'QA READY';
      this.syncStats();
      return true;
    }
    return false;
  }

  public forceSuperJumpQa(
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): boolean {
    for (const bot of this.bots) {
      if (
        bot.lifeState !== 'ACTIVE' ||
        bot.mobilityState !== 'GROUND' ||
        bot.jumpCooldownSeconds > 0
      ) {
        continue;
      }

      if (this.tryStartTacticalJump(
        bot,
        humanTeam,
        humanPosition,
        humanActive,
        true
      )) {
        return true;
      }
    }
    return false;
  }

  public forceAdvancedWeaponQa(): boolean {
    if (this.bots.length === 0) return false;

    this.pendingKitRequests.length = 0;
    let changed = 0;
    for (let i = 0; i < this.bots.length && i < CPU_ADVANCED_QA_WEAPONS.length; i += 1) {
      const bot = this.bots[i]!;
      bot.weaponId = CPU_ADVANCED_QA_WEAPONS[i]!;
      this.resetCpuWeaponRuntime(bot, true);
      this.resetCpuKitState(bot, true);
      bot.fireRemaining = 0;
      changed += 1;
    }

    if (changed > 0) {
      this.stats.cpuAdvancedQa = 'advanced-5';
      this.syncStats();
      return true;
    }
    return false;
  }

  public forEachMapAgent(
    visitor: (
      id: string,
      team: Team.A | Team.B,
      position: Vec3,
      active: boolean,
      weaponId: WeaponId
    ) => void
  ): void {
    for (const bot of this.bots) {
      visitor(
        bot.id,
        bot.team,
        bot.position,
        bot.lifeState === 'ACTIVE' &&
          (bot.mobilityState === 'GROUND' || bot.mobilityState === 'JUMP_PREP'),
        bot.weaponId
      );
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
      if (
        bot.team === sourceTeam ||
        bot.lifeState !== 'ACTIVE' ||
        isCpuJumpAirborne(bot)
      ) continue;

      if (
        bot.weaponGuarding &&
        bot.weaponGuardBreakSeconds <= 0 &&
        bot.weaponGuardHp > 0 &&
        this.isCpuGuardBlockingPoint(bot, from)
      ) {
        const shieldCenter = bot.position.clone()
          .add(bot.weaponFacing.clone().mulScalar(0.82));
        shieldCenter.y += 0.72;
        const shieldDistance = raySphereDistance(
          from,
          direction,
          length,
          shieldCenter,
          0.82
        );
        if (
          shieldDistance !== null &&
          (!best || shieldDistance < best.distance)
        ) {
          best = {
            botId: bot.id,
            distance: shieldDistance,
            point: from.clone().add(direction.clone().mulScalar(shieldDistance)),
            guarded: true
          };
        }
      }

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
          point: from.clone().add(direction.clone().mulScalar(distance)),
          guarded: false
        };
      }
    }
    return best;
  }

  public applyProjectileHit(hit: CpuCombatHit, damage: number): void {
    const bot = this.bots.find((candidate) => candidate.id === hit.botId);
    if (
      !bot ||
      bot.lifeState !== 'ACTIVE' ||
      bot.hp <= 0 ||
      isCpuJumpAirborne(bot)
    ) return;

    if (hit.guarded && this.absorbCpuGuardDamage(bot, damage)) return;

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
      if (
        bot.team === sourceTeam ||
        bot.lifeState !== 'ACTIVE' ||
        bot.hp <= 0 ||
        isCpuJumpAirborne(bot)
      ) continue;
      const dx = bot.position.x - center.x;
      const dy = bot.position.y + 0.68 - center.y;
      const dz = bot.position.z - center.z;
      if (dx * dx + dy * dy + dz * dz > radiusSq) continue;

      if (
        bot.weaponGuarding &&
        this.isCpuGuardBlockingPoint(bot, center) &&
        this.absorbCpuGuardDamage(bot, damage)
      ) {
        hits += 1;
        continue;
      }

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
      const loadout = cpuLoadout(team, slot);
      const role = loadout.role;

      const entity = new Entity(
        `CPU:${team === Team.A ? 'A' : 'B'}:${slot + 1}:${role}:${loadout.weaponId}`
      );
      entity.addComponent('render', {
        type: 'capsule',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: true,
        receiveShadows: true
      });
      entity.setLocalScale(0.58, 0.88, 0.58);
      entity.setPosition(start.x, start.y + 0.68, start.z);
      this.app.root.addChild(entity);

      const jumpMarker = new Entity(`CPUJumpMarker:${team === Team.A ? 'A' : 'B'}:${slot + 1}`);
      jumpMarker.addComponent('render', {
        type: 'cylinder',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: false,
        receiveShadows: false
      });
      jumpMarker.setLocalScale(0.95, 0.025, 0.95);
      jumpMarker.enabled = false;
      this.app.root.addChild(jumpMarker);

      const guardEntity = new Entity(
        `CPUGuard:${team === Team.A ? 'A' : 'B'}:${slot + 1}`
      );
      guardEntity.addComponent('render', {
        type: 'box',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: false,
        receiveShadows: false
      });
      guardEntity.setLocalScale(1.55, 1.05, 0.08);
      guardEntity.enabled = false;
      this.app.root.addChild(guardEntity);

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
          weaponProfile(loadout.weaponId).fireIntervalSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        weaponId: loadout.weaponId,
        weaponChargeSeconds: 0,
        weaponBurstShotsRemaining: 0,
        weaponBurstCooldown: 0,
        weaponRollPaintCooldown: 0,
        weaponFacing: new Vec3(0, 0, team === Team.A ? -1 : 1),
        weaponGuardHp: 100,
        weaponGuardBreakSeconds: 0,
        weaponGuarding: false,
        guardEntity,
        hp: GAME_CONFIG.combat.playerMaxHp,
        ink: GAME_CONFIG.inkEconomy.capacity,
        inkRecoveryLockSeconds: 0,
        hpRecoveryDelaySeconds: 0,
        lifeState: 'ACTIVE',
        respawnRemainingSeconds: 0,
        mobilityState: 'GROUND',
        jumpMarker,
        jumpStartPosition: start.clone(),
        jumpTargetPosition: start.clone(),
        jumpTargetId: '-',
        jumpPrepRemaining: 0,
        jumpTravelElapsed: 0,
        jumpActionRemaining: 0,
        jumpCooldownSeconds: 0,
        jumpRespawnWindowSeconds: 0,
        jumpArcHeight: GAME_CONFIG.superJump.minArcHeightMeters,
        subCooldownSeconds:
          GAME_CONFIG.cpu.kit.spawnSubCooldownBaseSeconds +
          slot * GAME_CONFIG.cpu.kit.spawnSubCooldownPerSlotSeconds,
        specialPoints: 0,
        specialDecisionCooldownSeconds:
          GAME_CONFIG.cpu.kit.spawnSpecialDecisionBaseSeconds +
          slot * GAME_CONFIG.cpu.kit.spawnSpecialDecisionPerSlotSeconds
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

  private updateCpuKit(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): void {
    if (
      bot.lifeState !== 'ACTIVE' ||
      bot.mobilityState !== 'GROUND' ||
      bot.weaponGuarding ||
      bot.weaponChargeSeconds > 0 ||
      bot.weaponBurstShotsRemaining > 0
    ) {
      return;
    }

    const weapon = weaponProfile(bot.weaponId);
    if (
      weapon.fireIntervalSeconds > 0 &&
      bot.fireRemaining >
        weapon.fireIntervalSeconds *
        GAME_CONFIG.cpu.kit.actionConflictFireIntervalFraction
    ) {
      return;
    }

    const target = this.chooseCombatTarget(
      bot,
      humanTeam,
      humanPosition,
      humanActive
    );
    if (!target) return;

    const kit = weaponKit(bot.weaponId);
    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    const direction = target.clone().sub(bot.position);
    if (direction.lengthSq() <= 1e-8) return;
    direction.normalize();

    const specialProfile = specialWeaponProfile(kit.special);
    const specialReady =
      bot.specialPoints + 1e-6 >= specialProfile.requiredPoints;

    if (
      specialReady &&
      bot.specialDecisionCooldownSeconds <= 0 &&
      this.shouldUseCpuSpecial(bot, kit.special, distance)
    ) {
      this.pendingKitRequests.push({
        kind: 'SPECIAL',
        sourceId: bot.id,
        team: bot.team,
        position: bot.position.clone(),
        target: target.clone(),
        direction: direction.clone(),
        specialId: kit.special
      });
      bot.specialPoints = 0;
      bot.specialDecisionCooldownSeconds =
        GAME_CONFIG.cpu.kit.postSpecialDecisionCooldownSeconds;
      bot.subCooldownSeconds = Math.max(
        bot.subCooldownSeconds,
        GAME_CONFIG.cpu.kit.postSpecialSubLockSeconds
      );
      this.stats.cpuSpecialActivations += 1;
      this.stats.cpuKitLast =
        `${bot.id}:SPECIAL:${specialProfile.shortName}`;
      return;
    }

    if (
      bot.subCooldownSeconds > 0 ||
      distance < GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters ||
      distance > GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters
    ) {
      return;
    }

    const subProfile = subWeaponProfile(kit.sub);
    if (bot.ink + 1e-6 < subProfile.inkCost) return;

    bot.ink = Math.max(0, bot.ink - subProfile.inkCost);
    bot.inkRecoveryLockSeconds = GAME_CONFIG.inkEconomy.recoveryLockSeconds;
    bot.subCooldownSeconds = cpuSubCooldownSeconds(kit.sub, bot.role);

    this.pendingKitRequests.push({
      kind: 'SUB',
      sourceId: bot.id,
      team: bot.team,
      position: bot.position.clone(),
      target: target.clone(),
      direction,
      subId: kit.sub
    });
    this.stats.cpuSubUses += 1;
    this.stats.cpuKitLast =
      `${bot.id}:SUB:${subProfile.shortName}`;
  }

  private shouldUseCpuSpecial(
    bot: CpuBot,
    specialId: SpecialWeaponId,
    distance: number
  ): boolean {
    switch (specialId) {
      case 'turf-pulse':
        return (
          distance <= GAME_CONFIG.cpu.kit.turfPulseMaxDistanceMeters ||
          bot.hp <= GAME_CONFIG.cpu.kit.turfPulseLowHpThreshold
        );
      case 'triple-strike':
        return (
          distance >= GAME_CONFIG.cpu.kit.tripleStrikeMinDistanceMeters &&
          distance <= GAME_CONFIG.cpu.kit.tripleStrikeMaxDistanceMeters
        );
      case 'drift-storm':
        return (
          distance >= GAME_CONFIG.cpu.kit.driftStormMinDistanceMeters &&
          distance <= GAME_CONFIG.cpu.kit.driftStormMaxDistanceMeters
        );
    }
    return false;
  }

  private updateCpuWeapon(
    bot: CpuBot,
    dt: number,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): void {
    const profile = weaponProfile(bot.weaponId);
    bot.fireRemaining = Math.max(0, bot.fireRemaining - dt);
    bot.weaponBurstCooldown = Math.max(0, bot.weaponBurstCooldown - dt);
    bot.weaponRollPaintCooldown = Math.max(0, bot.weaponRollPaintCooldown - dt);
    bot.weaponGuardBreakSeconds = Math.max(0, bot.weaponGuardBreakSeconds - dt);

    if (!bot.weaponGuarding && bot.weaponGuardBreakSeconds <= 0) {
      bot.weaponGuardHp = Math.min(100, bot.weaponGuardHp + 28 * dt);
    }

    const target = this.chooseCombatTarget(
      bot,
      humanTeam,
      humanPosition,
      humanActive
    );

    if (target) this.updateCpuWeaponFacing(bot, target);

    switch (profile.weaponClass) {
      case 'SPLATLING':
        bot.weaponGuarding = false;
        this.updateCpuSplatling(bot, profile, target, dt);
        return;
      case 'CHARGER':
        bot.weaponGuarding = false;
        this.updateCpuCharger(bot, profile, target, dt);
        return;
      case 'ROLLER':
        bot.weaponGuarding = false;
        this.updateCpuRoller(bot, profile, target);
        return;
      case 'BRUSH':
        bot.weaponGuarding = false;
        this.updateCpuBrush(bot, profile, target);
        return;
      case 'BRELLA':
        this.updateCpuBrella(bot, profile, target);
        return;
      case 'STRINGER':
        bot.weaponGuarding = false;
        this.updateCpuStringer(bot, profile, target, dt);
        return;
      case 'SPLATANA':
        bot.weaponGuarding = false;
        this.updateCpuSplatana(bot, profile, target, dt);
        return;
      default:
        bot.weaponGuarding = false;
        bot.weaponChargeSeconds = 0;
        bot.weaponBurstShotsRemaining = 0;
        if (!target || bot.fireRemaining > 0) return;
        if (!this.cpuTargetInRange(bot, target, profile)) return;

        if (this.queueCpuWeaponRequest(bot, target, 0, 'PROJECTILE')) {
          bot.fireRemaining = profile.fireIntervalSeconds;
        } else {
          bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
        }
    }
  }

  private updateCpuRoller(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    if (!target) return;

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    if (distance <= 6.0) {
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }

    if (distance <= 1.45 && bot.weaponRollPaintCooldown <= 0) {
      if (this.queueCpuWeaponRequest(bot, target, 0, 'ROLLER_ROLL')) {
        bot.weaponRollPaintCooldown = 0.075;
      }
      return;
    }

    if (
      distance <= 4.6 &&
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'ROLLER_FLICK')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuBrush(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    if (!target) return;

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    if (distance <= 6.0 && distance > 1.15) {
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }

    if (
      distance <= 2.45 &&
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'BRUSH_SWIPE')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuBrella(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;

    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponGuarding = false;
      return;
    }

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    const canGuard =
      bot.weaponGuardBreakSeconds <= 0 &&
      bot.weaponGuardHp > 0 &&
      distance <= 7.6;
    const lowHp = bot.hp <= 62;
    const postShotGuard =
      bot.fireRemaining > profile.fireIntervalSeconds * 0.34;

    bot.weaponGuarding = canGuard && (lowHp || postShotGuard);
    if (bot.weaponGuarding) return;

    if (
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'BRELLA_BURST')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuStringer(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }
    if (bot.fireRemaining > 0) return;

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    const targetChargeSeconds =
      distance >= 9.5 ? profile.chargeSeconds : profile.firstChargeSeconds;

    bot.weaponChargeSeconds = Math.min(
      targetChargeSeconds,
      bot.weaponChargeSeconds + dt
    );
    if (bot.weaponChargeSeconds + 1e-6 < targetChargeSeconds) return;

    const charge = targetChargeSeconds / Math.max(profile.chargeSeconds, 1e-6);
    if (
      this.queueCpuWeaponRequest(
        bot,
        target,
        charge,
        'STRINGER_RELEASE'
      )
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuSplatana(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    if (distance <= 5.2 && distance > 1.05) {
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }
    if (bot.fireRemaining > 0) return;

    const targetChargeSeconds =
      distance <= 2.25 ? profile.chargeSeconds : 0.16;
    bot.weaponChargeSeconds = Math.min(
      targetChargeSeconds,
      bot.weaponChargeSeconds + dt
    );
    if (bot.weaponChargeSeconds + 1e-6 < targetChargeSeconds) return;

    const charge = targetChargeSeconds / Math.max(profile.chargeSeconds, 1e-6);
    if (
      this.queueCpuWeaponRequest(
        bot,
        target,
        charge,
        'SPLATANA_RELEASE'
      )
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuWeaponFacing(bot: CpuBot, target: Vec3): void {
    bot.weaponFacing.set(
      target.x - bot.position.x,
      0,
      target.z - bot.position.z
    );
    if (bot.weaponFacing.lengthSq() <= 1e-8) {
      bot.weaponFacing.set(0, 0, bot.team === Team.A ? -1 : 1);
    } else {
      bot.weaponFacing.normalize();
    }
  }

  private updateCpuCharger(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    if (bot.fireRemaining > 0) return;

    bot.weaponChargeSeconds = Math.min(
      profile.chargeSeconds,
      bot.weaponChargeSeconds + dt
    );

    if (bot.weaponChargeSeconds + 1e-6 < profile.chargeSeconds) return;

    if (this.queueCpuWeaponRequest(bot, target, 1)) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuSplatling(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number
  ): void {
    if (bot.weaponBurstShotsRemaining > 0) {
      if (!target || !this.cpuTargetInRange(bot, target, profile)) {
        bot.weaponBurstShotsRemaining = 0;
        bot.weaponChargeSeconds = 0;
        return;
      }
      if (bot.weaponBurstCooldown > 0) return;

      if (this.queueCpuWeaponRequest(bot, target, 1)) {
        bot.weaponBurstShotsRemaining -= 1;
        bot.weaponBurstCooldown = profile.burstIntervalSeconds;
      } else {
        bot.weaponBurstShotsRemaining = 0;
        bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
      return;
    }

    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    if (bot.fireRemaining > 0) return;

    bot.weaponChargeSeconds = Math.min(
      profile.firstChargeSeconds,
      bot.weaponChargeSeconds + dt
    );

    if (
      bot.weaponChargeSeconds + 1e-6 <
      Math.max(profile.minChargeSeconds, profile.firstChargeSeconds)
    ) {
      return;
    }

    bot.weaponBurstShotsRemaining = Math.max(
      3,
      Math.round(profile.burstMaxShots * 0.5)
    );
    bot.weaponBurstCooldown = 0;
    bot.weaponChargeSeconds = 0;
    bot.fireRemaining = profile.fireIntervalSeconds;
  }

  private queueCpuWeaponRequest(
    bot: CpuBot,
    target: Vec3,
    charge: number,
    action: CpuWeaponAction = 'PROJECTILE'
  ): boolean {
    const profile = weaponProfile(bot.weaponId);
    const inkCost = cpuWeaponInkCost(profile, action, charge);
    if (bot.ink + 1e-6 < inkCost) return false;

    bot.ink = Math.max(0, bot.ink - inkCost);
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
      bodyPosition: bot.position.clone(),
      target: target.clone(),
      weaponId: bot.weaponId,
      charge,
      action
    });
    this.stats.cpuShots += 1;
    return true;
  }

  private cpuTargetInRange(
    bot: CpuBot,
    target: Vec3,
    profile: ReturnType<typeof weaponProfile>
  ): boolean {
    const range = cpuWeaponRangeMeters(profile);
    return horizontalDistanceSq(bot.position, target) <= range * range;
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
        candidate.lifeState !== 'ACTIVE' ||
        isCpuJumpAirborne(candidate)
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

  private tryStartTacticalJump(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean,
    forced: boolean
  ): boolean {
    if (
      bot.lifeState !== 'ACTIVE' ||
      bot.mobilityState !== 'GROUND' ||
      !bot.agent ||
      bot.jumpCooldownSeconds > 0 ||
      bot.hp < GAME_CONFIG.combat.playerMaxHp * GAME_CONFIG.cpu.superJumpMinHpFraction
    ) {
      return false;
    }

    const respawnRecovery = bot.jumpRespawnWindowSeconds > 0;
    const nearestFriendlyDistance = this.nearestFriendlyDistance(
      bot,
      humanTeam,
      humanPosition,
      humanActive
    );

    let best: CpuJumpCandidate | null = null;

    const consider = (
      id: string,
      position: Vec3,
      isHuman: boolean
    ): void => {
      const snapped = this.navigation.closestPoint(position);
      const target = new Vec3(snapped.x, snapped.y, snapped.z);
      const targetSafe = this.isJumpTargetSafe(
        bot.team,
        target,
        humanTeam,
        humanPosition,
        humanActive
      );
      const score = this.director.scoreSuperJumpCandidate({
        team: bot.team,
        role: bot.role,
        currentPosition: bot.position,
        targetPosition: target,
        respawnRecovery,
        nearestFriendlyDistanceMeters: nearestFriendlyDistance,
        targetSafe,
        targetIsHuman: isHuman
      });

      if (!Number.isFinite(score)) return;
      if (
        !forced &&
        score < GAME_CONFIG.cpu.superJumpDecisionScore
      ) {
        return;
      }

      if (!best || score > best.score) {
        best = { id, position: target, isHuman, score };
      }
    };

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team !== bot.team ||
        candidate.lifeState !== 'ACTIVE' ||
        candidate.mobilityState !== 'GROUND'
      ) {
        continue;
      }
      consider(candidate.id, candidate.position, false);
    }

    if (humanActive && humanTeam === bot.team) {
      consider('HUMAN', humanPosition, true);
    }

    if (!best) {
      if (!forced) return false;

      // QA fallback: use a tactical node well ahead of the CPU when no safe
      // friendly candidate satisfies normal scoring.
      const enemySpawn = bot.team === Team.A
        ? this.stage.metadata.teamBSpawn
        : this.stage.metadata.teamASpawn;
      const fallback = new Vec3(0, enemySpawn[1], enemySpawn[2] * 0.35);
      const snapped = this.navigation.closestPoint(fallback);
      best = {
        id: 'QA_FRONT',
        position: new Vec3(snapped.x, snapped.y, snapped.z),
        isHuman: false,
        score: 999
      };
    }

    this.startCpuJumpPrep(bot, best);
    return true;
  }

  private nearestFriendlyDistance(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): number {
    let best = Number.POSITIVE_INFINITY;

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team !== bot.team ||
        candidate.lifeState !== 'ACTIVE' ||
        candidate.mobilityState !== 'GROUND'
      ) {
        continue;
      }
      best = Math.min(best, Math.sqrt(horizontalDistanceSq(bot.position, candidate.position)));
    }

    if (humanActive && humanTeam === bot.team) {
      best = Math.min(best, Math.sqrt(horizontalDistanceSq(bot.position, humanPosition)));
    }

    return Number.isFinite(best) ? best : 999;
  }

  private isJumpTargetSafe(
    team: Team.A | Team.B,
    target: Vec3,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): boolean {
    const dangerSq = GAME_CONFIG.cpu.superJumpSafeEnemyRadiusMeters ** 2;

    if (
      humanActive &&
      humanTeam !== team &&
      horizontalDistanceSq(target, humanPosition) < dangerSq
    ) {
      return false;
    }

    for (const enemy of this.bots) {
      if (
        enemy.team === team ||
        enemy.lifeState !== 'ACTIVE' ||
        isCpuJumpAirborne(enemy)
      ) {
        continue;
      }
      if (horizontalDistanceSq(target, enemy.position) < dangerSq) return false;
    }

    return true;
  }

  private startCpuJumpPrep(bot: CpuBot, candidate: CpuJumpCandidate): void {
    if (bot.agent) {
      this.navigation.removeAgent(bot.agent);
      bot.agent = null;
    }

    bot.mobilityState = 'JUMP_PREP';
    bot.jumpTargetId = candidate.id;
    bot.jumpTargetPosition.copy(candidate.position);
    bot.jumpPrepRemaining = GAME_CONFIG.superJump.prepareSeconds;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    this.resetCpuWeaponRuntime(bot);
    bot.jumpMarker.enabled = true;
    bot.jumpMarker.setPosition(
      bot.jumpTargetPosition.x,
      bot.jumpTargetPosition.y + 0.035,
      bot.jumpTargetPosition.z
    );
    this.stats.cpuSuperJumpLast = `${bot.id}->${candidate.id}`;
  }

  private beginCpuJumpTravel(bot: CpuBot): void {
    bot.mobilityState = 'JUMP_TRAVEL';
    bot.jumpStartPosition.copy(bot.position);
    bot.previousPosition.copy(bot.position);
    bot.jumpTravelElapsed = 0;

    const dx = bot.jumpTargetPosition.x - bot.jumpStartPosition.x;
    const dz = bot.jumpTargetPosition.z - bot.jumpStartPosition.z;
    const distance = Math.hypot(dx, dz);
    bot.jumpArcHeight = clamp(
      GAME_CONFIG.superJump.minArcHeightMeters +
        distance * GAME_CONFIG.superJump.arcHeightPerHorizontalMeter,
      GAME_CONFIG.superJump.minArcHeightMeters,
      GAME_CONFIG.superJump.maxArcHeightMeters
    );

    this.stats.cpuSuperJumps += 1;
  }

  private updateCpuJumpAirborne(bot: CpuBot, dt: number): void {
    const total =
      GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;

    if (bot.mobilityState === 'JUMP_TRAVEL') {
      bot.jumpTravelElapsed = Math.min(
        GAME_CONFIG.superJump.travelSeconds,
        bot.jumpTravelElapsed + dt
      );
      const progress = clamp01(bot.jumpTravelElapsed / Math.max(total, 1e-6));
      this.updateCpuJumpPosition(bot, progress);

      if (bot.jumpTravelElapsed >= GAME_CONFIG.superJump.travelSeconds) {
        bot.mobilityState = 'JUMP_LANDING';
        bot.jumpActionRemaining = GAME_CONFIG.superJump.actionSeconds;
      }
      return;
    }

    bot.jumpActionRemaining = Math.max(0, bot.jumpActionRemaining - dt);
    const elapsed =
      GAME_CONFIG.superJump.travelSeconds +
      (GAME_CONFIG.superJump.actionSeconds - bot.jumpActionRemaining);
    const progress = clamp01(elapsed / Math.max(total, 1e-6));
    this.updateCpuJumpPosition(bot, progress);

    if (bot.jumpActionRemaining <= 0) this.finishCpuJump(bot);
  }

  private updateCpuJumpPosition(bot: CpuBot, progress: number): void {
    bot.position.set(
      lerp(bot.jumpStartPosition.x, bot.jumpTargetPosition.x, progress),
      lerp(bot.jumpStartPosition.y, bot.jumpTargetPosition.y, progress) +
        Math.sin(Math.PI * progress) * bot.jumpArcHeight,
      lerp(bot.jumpStartPosition.z, bot.jumpTargetPosition.z, progress)
    );
  }

  private finishCpuJump(bot: CpuBot): void {
    const snapped = this.navigation.closestPoint(bot.jumpTargetPosition);
    const landing = new Vec3(snapped.x, snapped.y, snapped.z);

    bot.position.copy(landing);
    bot.previousPosition.copy(landing);
    bot.agent = this.navigation.addAgent(landing);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpCooldownSeconds = GAME_CONFIG.cpu.superJumpCooldownSeconds;
    bot.jumpRespawnWindowSeconds = 0;
    bot.thinkRemaining = GAME_CONFIG.cpu.tacticalThinkSeconds * 0.35;
    bot.paintRemaining = Math.max(bot.paintRemaining, 0.12);
    bot.fireRemaining = Math.max(bot.fireRemaining, 0.18);
    bot.entity.setLocalEulerAngles(0, 0, 0);
    this.stats.cpuSuperJumpLandings += 1;
  }

  private cancelCpuJump(bot: CpuBot, countCancel: boolean): void {
    if (bot.mobilityState === 'GROUND') return;

    const restore = bot.mobilityState === 'JUMP_TRAVEL' ||
      bot.mobilityState === 'JUMP_LANDING'
      ? bot.jumpStartPosition
      : bot.position;
    const snapped = this.navigation.closestPoint(restore);
    const point = new Vec3(snapped.x, snapped.y, snapped.z);

    if (bot.agent) this.navigation.removeAgent(bot.agent);
    bot.agent = this.navigation.addAgent(point);
    bot.position.copy(point);
    bot.previousPosition.copy(point);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    this.resetCpuWeaponRuntime(bot);
    bot.entity.setLocalEulerAngles(0, 0, 0);

    if (countCancel) this.stats.cpuSuperJumpCancels += 1;
  }

  private resetCpuWeaponRuntime(bot: CpuBot, resetGuard = false): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    bot.weaponBurstCooldown = 0;
    bot.weaponRollPaintCooldown = 0;
    bot.weaponGuarding = false;
    bot.guardEntity.enabled = false;
    if (resetGuard) {
      bot.weaponGuardHp = 100;
      bot.weaponGuardBreakSeconds = 0;
    }
  }

  private renderCpuGuard(
    bot: CpuBot,
    x: number,
    y: number,
    z: number
  ): void {
    const enabled =
      bot.weaponId === 'canopy-guard' &&
      bot.weaponGuarding &&
      bot.weaponGuardBreakSeconds <= 0 &&
      bot.weaponGuardHp > 0 &&
      bot.mobilityState === 'GROUND';

    bot.guardEntity.enabled = enabled;
    if (!enabled) return;

    const forward = bot.weaponFacing;
    bot.guardEntity.setPosition(
      x + forward.x * 0.82,
      y + 0.72,
      z + forward.z * 0.82
    );
    const yaw = Math.atan2(forward.x, forward.z) * 180 / Math.PI;
    bot.guardEntity.setLocalEulerAngles(0, yaw, 0);
  }

  private isCpuGuardBlockingPoint(bot: CpuBot, attackerPoint: Vec3): boolean {
    if (
      bot.weaponId !== 'canopy-guard' ||
      !bot.weaponGuarding ||
      bot.weaponGuardBreakSeconds > 0 ||
      bot.weaponGuardHp <= 0
    ) {
      return false;
    }

    const toAttacker = attackerPoint.clone().sub(bot.position);
    toAttacker.y = 0;
    if (toAttacker.lengthSq() <= 1e-8) return true;
    toAttacker.normalize();
    return bot.weaponFacing.dot(toAttacker) > -0.10;
  }

  private absorbCpuGuardDamage(bot: CpuBot, damage: number): boolean {
    if (
      bot.weaponId !== 'canopy-guard' ||
      !bot.weaponGuarding ||
      bot.weaponGuardBreakSeconds > 0 ||
      bot.weaponGuardHp <= 0
    ) {
      return false;
    }

    bot.weaponGuardHp = Math.max(0, bot.weaponGuardHp - damage);
    this.stats.cpuWeaponGuardBlocks += 1;
    if (bot.weaponGuardHp <= 0) {
      bot.weaponGuardBreakSeconds = 2.5;
      bot.weaponGuarding = false;
      bot.guardEntity.enabled = false;
    }
    return true;
  }

  private resetCpuKitState(bot: CpuBot, clearGauge: boolean): void {
    bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    if (clearGauge) bot.specialPoints = 0;
  }

  private resetCpuJumpState(bot: CpuBot): void {
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpArcHeight = GAME_CONFIG.superJump.minArcHeightMeters;
    bot.entity.setLocalEulerAngles(0, 0, 0);
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
      actorId: bot.id,
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

    if (bot.agent) {
      this.navigation.removeAgent(bot.agent);
      bot.agent = null;
    }
    this.resetCpuWeaponRuntime(bot, true);
    this.resetCpuJumpState(bot);
    bot.specialPoints *= GAME_CONFIG.special.splatRetention;
    bot.subCooldownSeconds = 0;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.splatSpecialDecisionCooldownSeconds;

    bot.lifeState = 'SPLATTED';
    bot.respawnRemainingSeconds = GAME_CONFIG.match.respawnSeconds;
    bot.entity.enabled = false;
    this.stats.cpuSplats += 1;
  }

  private respawnBot(bot: CpuBot): void {
    const start = this.spawnPosition(bot.team, bot.slot);
    if (bot.agent) this.navigation.removeAgent(bot.agent);
    bot.agent = this.navigation.addAgent(start);
    bot.position.copy(start);
    bot.previousPosition.copy(start);
    bot.jumpStartPosition.copy(start);
    bot.jumpTargetPosition.copy(start);
    bot.hp = GAME_CONFIG.combat.playerMaxHp;
    bot.ink = GAME_CONFIG.inkEconomy.capacity;
    bot.inkRecoveryLockSeconds = 0;
    bot.hpRecoveryDelaySeconds = 0;
    bot.thinkRemaining = GAME_CONFIG.cpu.tacticalThinkSeconds * 0.25;
    bot.paintRemaining = GAME_CONFIG.cpu.paintCadenceSeconds * 0.5;
    bot.fireRemaining = weaponProfile(bot.weaponId).fireIntervalSeconds * 0.5;
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    bot.weaponBurstCooldown = 0;
    bot.weaponRollPaintCooldown = 0;
    bot.weaponFacing.set(0, 0, bot.team === Team.A ? -1 : 1);
    bot.weaponGuardHp = 100;
    bot.weaponGuardBreakSeconds = 0;
    bot.weaponGuarding = false;
    bot.guardEntity.enabled = false;
    bot.respawnRemainingSeconds = 0;
    bot.lifeState = 'ACTIVE';
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpCooldownSeconds = 0;
    bot.jumpRespawnWindowSeconds = GAME_CONFIG.cpu.superJumpRespawnWindowSeconds;
    bot.jumpArcHeight = GAME_CONFIG.superJump.minArcHeightMeters;
    bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    bot.entity.enabled = true;
    bot.entity.setLocalEulerAngles(0, 0, 0);
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
    let jumpPrep = 0;
    let jumpAirborne = 0;
    let weaponCharging = 0;
    let weaponBursting = 0;
    let weaponGuarding = 0;
    let specialReady = 0;
    let specialPercentTotal = 0;
    const loadouts: string[] = [];
    const kits: string[] = [];
    let hpTotal = 0;
    let inkTotal = 0;

    for (const bot of this.bots) {
      if (bot.team === Team.A) teamA += 1;
      else teamB += 1;
      if (bot.role === 'PAINTER') painter += 1;
      else if (bot.role === 'SKIRMISHER') skirmisher += 1;
      else anchor += 1;

      if (bot.lifeState === 'ACTIVE') alive += 1;
      if (bot.mobilityState === 'JUMP_PREP') jumpPrep += 1;
      if (isCpuJumpAirborne(bot)) jumpAirborne += 1;
      if (bot.weaponChargeSeconds > 0) weaponCharging += 1;
      if (bot.weaponBurstShotsRemaining > 0) weaponBursting += 1;
      if (bot.weaponGuarding) weaponGuarding += 1;
      loadouts.push(`${bot.id}:${weaponProfile(bot.weaponId).shortName}`);
      const kit = weaponKit(bot.weaponId);
      const sub = subWeaponProfile(kit.sub);
      const special = specialWeaponProfile(kit.special);
      const required = Math.max(special.requiredPoints, 1e-6);
      const specialPercent = Math.min(100, bot.specialPoints / required * 100);
      if (bot.specialPoints + 1e-6 >= required) specialReady += 1;
      specialPercentTotal += specialPercent;
      kits.push(
        `${bot.id}:${sub.shortName}/${special.shortName}:${specialPercent.toFixed(0)}%`
      );
      hpTotal += bot.hp;
      inkTotal += bot.ink;
    }

    this.stats.cpuAgents = this.bots.length;
    this.stats.cpuTeamA = teamA;
    this.stats.cpuTeamB = teamB;
    this.stats.cpuRoles = `P${painter} / S${skirmisher} / A${anchor}`;
    this.stats.cpuAlive = alive;
    this.stats.cpuSuperJumpPrep = jumpPrep;
    this.stats.cpuSuperJumpAirborne = jumpAirborne;
    this.stats.cpuLoadouts = loadouts.join(' · ');
    this.stats.cpuWeaponCharging = weaponCharging;
    this.stats.cpuWeaponBursting = weaponBursting;
    this.stats.cpuWeaponGuarding = weaponGuarding;
    this.stats.cpuKits = kits.join(' · ');
    this.stats.cpuSpecialReady = specialReady;
    this.stats.cpuAverageSpecialPercent =
      this.bots.length > 0 ? specialPercentTotal / this.bots.length : 0;
    this.stats.cpuAverageHp = this.bots.length > 0 ? hpTotal / this.bots.length : 0;
    this.stats.cpuAverageInk = this.bots.length > 0 ? inkTotal / this.bots.length : 0;
  }
}

function cpuSubCooldownSeconds(
  subId: SubWeaponId,
  role: CpuRole
): number {
  const base = subId === 'snap-bomb'
    ? GAME_CONFIG.cpu.kit.snapBombCooldownSeconds
    : subId === 'pulse-bomb'
      ? GAME_CONFIG.cpu.kit.pulseBombCooldownSeconds
      : GAME_CONFIG.cpu.kit.anchorBombCooldownSeconds;
  if (role === 'SKIRMISHER') {
    return base * GAME_CONFIG.cpu.kit.skirmisherSubCooldownMultiplier;
  }
  if (role === 'ANCHOR') {
    return base * GAME_CONFIG.cpu.kit.anchorSubCooldownMultiplier;
  }
  return base;
}

function cpuWeaponInkCost(
  profile: ReturnType<typeof weaponProfile>,
  action: CpuWeaponAction,
  charge: number
): number {
  if (action === 'ROLLER_ROLL') return profile.rollPaintInkCost;

  if (action === 'STRINGER_RELEASE') {
    const firstRing = profile.chargeSeconds > 0
      ? profile.firstChargeSeconds / profile.chargeSeconds
      : 0;
    if (charge >= firstRing && firstRing < 1) {
      const second = clamp01(
        (charge - firstRing) / Math.max(1 - firstRing, 1e-6)
      );
      return lerp(6.0, 8.5, second);
    }
    const first = firstRing > 0 ? clamp01(charge / firstRing) : clamp01(charge);
    return lerp(5.0, 6.0, first);
  }

  return profile.inkCost;
}

function cpuWeaponRangeMeters(
  profile: ReturnType<typeof weaponProfile>
): number {
  switch (profile.weaponClass) {
    case 'CHARGER':
      return 24;
    case 'SPLATLING':
      return 13.5;
    case 'SLOSHER':
      return 10.5;
    case 'BLASTER':
      return 10.0;
    case 'DUALIES':
      return 9.8;
    case 'ROLLER':
      return 4.6;
    case 'BRUSH':
      return 2.45;
    case 'BRELLA':
      return 7.6;
    case 'STRINGER':
      return 15.0;
    case 'SPLATANA':
      return 8.5;
    default:
      return GAME_CONFIG.cpu.combatRangeMeters;
  }
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

function isCpuJumpAirborne(bot: CpuBot): boolean {
  return bot.mobilityState === 'JUMP_TRAVEL' ||
    bot.mobilityState === 'JUMP_LANDING';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
