import { Vec3 } from 'playcanvas';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { SurfaceFlags, Team } from '../ink/types';

export type CpuRole = 'PAINTER' | 'SKIRMISHER' | 'ANCHOR';

export interface TacticalAgentContext {
  team: Team.A | Team.B;
  role: CpuRole;
  slot: number;
  humanTeam: Team.A | Team.B;
  currentPosition: Vec3;
  humanPosition: Vec3;
}

const NODES = [
  new Vec3(-7.0, 0.12, -4.8),
  new Vec3(-3.5, 0.12, -4.4),
  new Vec3( 0.0, 0.12, -4.8),
  new Vec3( 3.5, 0.12, -4.4),
  new Vec3( 7.0, 0.12, -4.8),
  new Vec3(-7.0, 0.12, -1.8),
  new Vec3(-3.8, 0.12, -1.5),
  new Vec3( 3.8, 0.12, -1.5),
  new Vec3( 7.0, 0.12, -1.8),
  new Vec3(-7.0, 0.12,  1.8),
  new Vec3(-3.8, 0.12,  1.5),
  new Vec3( 3.8, 0.12,  1.5),
  new Vec3( 7.0, 0.12,  1.8),
  new Vec3(-7.0, 0.12,  4.8),
  new Vec3(-3.5, 0.12,  4.4),
  new Vec3( 0.0, 0.12,  4.8),
  new Vec3( 3.5, 0.12,  4.4),
  new Vec3( 7.0, 0.12,  4.8)
] as const;

export class CpuTacticalDirector {
  public constructor(private readonly gameplayInk: GameplayInkSystem) {}

  public chooseGoal(context: TacticalAgentContext, out = new Vec3()): Vec3 {
    if (context.role === 'SKIRMISHER') {
      return this.skirmisherGoal(context, out);
    }
    if (context.role === 'ANCHOR') {
      return this.anchorGoal(context, out);
    }
    return this.painterGoal(context, out);
  }

  private painterGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    let best = NODES[context.slot % NODES.length]!;
    let bestScore = -Infinity;

    for (let i = 0; i < NODES.length; i += 1) {
      const node = NODES[i]!;
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

    return out.set(
      (context.slot % 3 - 1) * 3.2,
      0.12,
      context.team === Team.A ? -1.8 : 1.8
    );
  }

  private anchorGoal(context: TacticalAgentContext, out: Vec3): Vec3 {
    const homeZ = context.team === Team.A ? 4.6 : -4.6;
    const patrolX = ((context.slot * 5) % 3 - 1) * 3.3;
    return out.set(patrolX, 0.12, homeZ);
  }
}
