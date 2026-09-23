import { Vec3 } from 'playcanvas';
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



export class CpuTacticalDirector {
  private readonly nodes: readonly Vec3[];

  public constructor(
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stage: StageDefinition
  ) {
    this.nodes = stage.metadata.tacticalNodes.map(
      (node) => new Vec3(node[0], node[1], node[2])
    );
  }

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
