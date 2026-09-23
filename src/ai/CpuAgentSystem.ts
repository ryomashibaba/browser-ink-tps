import type { CrowdAgent } from 'recast-navigation';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import { PaintEventType, SurfaceFlags, Team } from '../ink/types';
import { CpuTacticalDirector, type CpuRole } from './CpuTacticalDirector';
import type { RecastStageNavigation } from '../navigation/RecastStageNavigation';

interface CpuBot {
  id: string;
  team: Team.A | Team.B;
  role: CpuRole;
  slot: number;
  agent: CrowdAgent;
  entity: Entity;
  previousPosition: Vec3;
  position: Vec3;
  thinkRemaining: number;
  paintRemaining: number;
}

export class CpuAgentSystem {
  private readonly bots: CpuBot[] = [];
  private readonly director: CpuTacticalDirector;
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly goal = new Vec3();
  private readonly samplePoint = new Vec3();
  private activeLastTick = false;

  public constructor(
    private readonly app: AppBase,
    private readonly navigation: RecastStageNavigation,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly coordinator: PaintCoordinator,
    private readonly stats: PerformanceStats,
    humanTeam: Team.A | Team.B
  ) {
    this.director = new CpuTacticalDirector(gameplayInk);
    this.materialA = makeCpuMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeCpuMaterial(GAME_CONFIG.visual.teamB);
    this.reset(humanTeam);
  }

  public reset(humanTeam: Team.A | Team.B): void {
    for (const bot of this.bots) {
      this.navigation.removeAgent(bot.agent);
      bot.entity.destroy();
    }
    this.bots.length = 0;
    this.stats.cpuTacticalRetargets = 0;
    this.stats.cpuPaintRequests = 0;

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
    humanPosition: Vec3
  ): void {
    if (!matchActive) {
      if (this.activeLastTick) {
        for (const bot of this.bots) bot.agent.resetMoveTarget();
      }
      this.activeLastTick = false;
      this.syncStats();
      return;
    }

    this.activeLastTick = true;

    for (const bot of this.bots) {
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
        bot.agent.requestMoveTarget(this.navigation.closestPoint(this.goal));
        bot.thinkRemaining += GAME_CONFIG.cpu.tacticalThinkSeconds;
        this.stats.cpuTacticalRetargets += 1;
      }
    }

    this.navigation.fixedUpdate(dt);

    for (const bot of this.bots) {
      const p = bot.agent.position();
      bot.position.set(p.x, p.y, p.z);

      bot.paintRemaining -= dt;
      if (bot.paintRemaining <= 0) {
        bot.paintRemaining += GAME_CONFIG.cpu.paintCadenceSeconds;
        this.paintAtBot(bot);
      }
    }

    this.syncStats();
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const bot of this.bots) {
      bot.entity.setPosition(
        bot.previousPosition.x + (bot.position.x - bot.previousPosition.x) * t,
        bot.previousPosition.y + (bot.position.y - bot.previousPosition.y) * t + 0.68,
        bot.previousPosition.z + (bot.position.z - bot.previousPosition.z) * t
      );
    }
  }

  private spawnTeam(team: Team.A | Team.B, count: number): void {
    const spawnZ = team === Team.A ? 5.15 : -5.15;
    const xPositions = [-5.2, -1.8, 1.8, 5.2];

    for (let i = 0; i < count; i += 1) {
      const slot = this.bots.filter((bot) => bot.team === team).length;
      const spawn = new Vec3(xPositions[i] ?? 0, 0.12, spawnZ);
      const snapped = this.navigation.closestPoint(spawn);
      const start = new Vec3(snapped.x, snapped.y, snapped.z);
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
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers)
      });
    }
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

  private syncStats(): void {
    let teamA = 0;
    let teamB = 0;
    let painter = 0;
    let skirmisher = 0;
    let anchor = 0;
    for (const bot of this.bots) {
      if (bot.team === Team.A) teamA += 1;
      else teamB += 1;
      if (bot.role === 'PAINTER') painter += 1;
      else if (bot.role === 'SKIRMISHER') skirmisher += 1;
      else anchor += 1;
    }

    this.stats.cpuAgents = this.bots.length;
    this.stats.cpuTeamA = teamA;
    this.stats.cpuTeamB = teamB;
    this.stats.cpuRoles = `P${painter} / S${skirmisher} / A${anchor}`;
  }
}

function roleForSlot(slot: number): CpuRole {
  const cycle: readonly CpuRole[] = ['PAINTER', 'SKIRMISHER', 'PAINTER', 'ANCHOR'];
  return cycle[slot % cycle.length] ?? 'PAINTER';
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
