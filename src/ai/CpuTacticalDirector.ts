import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { SurfaceFlags, Team } from '../ink/types';
import type { StageDefinition } from '../stage/StageDefinition';

export type CpuRole = 'PAINTER' | 'SKIRMISHER' | 'ANCHOR';

export interface TacticalAgentContext {
  team: Team.A | Team.B;
  role: CpuRole;
  slot: number;
  humanTeam: Team.A | Team.B;
  currentPosition: Vec3;
  humanPosition: Vec3;
}

export interface TacticalJumpContext {
  team: Team.A | Team.B;
  role: CpuRole;
  currentPosition: Vec3;
  targetPosition: Vec3;
  respawnRecovery: boolean;
  nearestFriendlyDistanceMeters: number;
  targetSafe: boolean;
  targetIsHuman: boolean;
}



export class CpuTacticalDirector {
  private readonly nodes: readonly Vec3[];
  private readonly zoneCenter = new Vec3();
  private zonesActive = false;
  private zonesControl: Team = Team.Neutral;

  public constructor(
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stage: StageDefinition
  ) {
    this.nodes = stage.metadata.tacticalNodes.map(
      (node) => new Vec3(node[0], node[1], node[2])
    );
    const zone = stage.metadata.splatZones[0];
    const zoneSurface = zone ? gameplayInk.getSurface(zone.surfaceId) : undefined;
    if (zone && zoneSurface) {
      this.zoneCenter.copy(zoneSurface.localToWorld(zone.centerU, zone.centerV));
      this.zoneCenter.y = 0.12;
    }
  }

  public setSplatZonesContext(active: boolean, control: Team): void {
    this.zonesActive = active;
    this.zonesControl = control;
  }

  public chooseGoal(context: TacticalAgentContext, out = new Vec3()): Vec3 {
    if (this.zonesActive) return this.zonesGoal(context, out);
    if (context.role === 'SKIRMISHER') {
      return this.skirmisherGoal(context, out);
    }
    if (context.role === 'ANCHOR') {
      return this.anchorGoal(context, out);
    }
    return this.painterGoal(context, out);
  }

  public scoreSuperJumpCandidate(context: TacticalJumpContext): number {
    if (!context.targetSafe) return Number.NEGATIVE_INFINITY;

    const dx = context.targetPosition.x - context.currentPosition.x;
    const dz = context.targetPosition.z - context.currentPosition.z;
    const distance = Math.hypot(dx, dz);
    if (distance < GAME_CONFIG.cpu.superJumpMinDistanceMeters) {
      return Number.NEGATIVE_INFINITY;
    }

    const forwardAdvance = context.team === Team.A ? -dz : dz;
    if (
      !context.respawnRecovery &&
      context.nearestFriendlyDistanceMeters < GAME_CONFIG.cpu.superJumpRegroupDistanceMeters
    ) {
      return Number.NEGATIVE_INFINITY;
    }

    let score = Math.min(distance, 20) * 0.16 + forwardAdvance * 0.58;
    if (context.respawnRecovery) score += 5.8;
    else score += 1.2;

    if (context.role === 'SKIRMISHER') score += 1.6;
    else if (context.role === 'PAINTER') score += 0.7;
    else score -= 2.4;

    if (context.targetIsHuman) score += 0.35;
    return score;
  }

  private zonesGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    const lane = (context.slot % 3 - 1) * 1.8;
    const forward = context.team === Team.A ? -1 : 1;
    const ownsZone = this.zonesControl === context.team;

    if (context.role === 'ANCHOR') {
      return out.set(
        this.zoneCenter.x + lane * 0.7,
        this.zoneCenter.y,
        this.zoneCenter.z - forward * (ownsZone ? 4.2 : 3.0)
      );
    }

    if (context.role === 'SKIRMISHER') {
      return out.set(
        this.zoneCenter.x + lane,
        this.zoneCenter.y,
        this.zoneCenter.z + forward * (ownsZone ? 2.6 : 1.2)
      );
    }

    return out.set(
      this.zoneCenter.x + lane,
      this.zoneCenter.y,
      this.zoneCenter.z + (ownsZone ? -forward * 1.3 : 0)
    );
  }

  private painterGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    let best = this.nodes[context.slot % this.nodes.length]!;
    let bestScore = -Infinity;

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i]!;
      const sample = this.gameplayInk.sampleWorld(
        node,
        0.45,
        SurfaceFlags.Scoreable,
        SurfaceFlags.Wall
      );
      const ownerScore = !sample || sample.owner === Team.Neutral
        ? 5
        : sample.owner === context.team ? 0.5 : 8;
      const dx = node.x - context.currentPosition.x;
      const dz = node.z - context.currentPosition.z;
      const distancePenalty = Math.hypot(dx, dz) * 0.12;
      const laneBias = ((i + context.slot * 3) % 7) * 0.04;
      const score = ownerScore - distancePenalty + laneBias;
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }

    return out.copy(best);
  }

  private skirmisherGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    if (context.team !== context.humanTeam) {
      const side = context.slot % 2 === 0 ? -1 : 1;
      return out.set(
        context.humanPosition.x + side * 1.8,
        0.12,
        context.humanPosition.z + (context.team === Team.A ? 1.2 : -1.2)
      );
    }

    const enemySpawn = context.team === Team.A
      ? this.stage.metadata.teamBSpawn
      : this.stage.metadata.teamASpawn;
    return out.set(
      (context.slot % 3 - 1) * 5.2,
      0.12,
      enemySpawn[2] * 0.32
    );
  }

  private anchorGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    const homeSpawn = context.team === Team.A
      ? this.stage.metadata.teamASpawn
      : this.stage.metadata.teamBSpawn;
    const patrolX = ((context.slot * 5) % 3 - 1) * 5.0;
    return out.set(patrolX, 0.12, homeSpawn[2] * 0.62);
  }
}
