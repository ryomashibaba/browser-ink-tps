import {
  Color,
  Entity,
  StandardMaterial,
  Vec3,
  type AppBase
} from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import { Team } from '../ink/types';
import type { PlayerController } from '../player/PlayerController';

export type SuperJumpState =
  | 'IDLE'
  | 'WAIT_GROUND'
  | 'PREP'
  | 'TRAVEL'
  | 'LANDING';

export interface SuperJumpTarget {
  kind: 'SPAWN' | 'ALLY';
  id: string;
  label: string;
  position: Vec3;
}

export class SuperJumpSystem {
  private state: SuperJumpState = 'IDLE';
  private target: SuperJumpTarget | null = null;
  private team: Team.A | Team.B | null = null;

  private readonly startPosition = new Vec3();
  private readonly targetPosition = new Vec3();
  private readonly currentPosition = new Vec3();
  private readonly previousPosition = new Vec3();
  private readonly renderPosition = new Vec3();
  private readonly allyPosition = new Vec3();

  private prepRemaining = 0;
  private travelElapsed = 0;
  private landingRemaining = 0;
  private arcHeight: number = GAME_CONFIG.superJump.minArcHeightMeters;

  private readonly travelEntity: Entity;
  private readonly markerEntity: Entity;
  private readonly travelMaterialA: StandardMaterial;
  private readonly travelMaterialB: StandardMaterial;
  private readonly markerMaterialA: StandardMaterial;
  private readonly markerMaterialB: StandardMaterial;

  public constructor(
    app: AppBase,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly player: PlayerController,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats
  ) {
    this.travelMaterialA = makeMaterial(GAME_CONFIG.visual.teamA, 0.82);
    this.travelMaterialB = makeMaterial(GAME_CONFIG.visual.teamB, 0.82);
    this.markerMaterialA = makeMaterial(GAME_CONFIG.visual.teamA, 0.38);
    this.markerMaterialB = makeMaterial(GAME_CONFIG.visual.teamB, 0.38);

    this.travelEntity = new Entity('SuperJumpTraveler');
    this.travelEntity.addComponent('render', {
      type: 'sphere',
      material: this.travelMaterialA,
      castShadows: false,
      receiveShadows: false
    });
    this.travelEntity.setLocalScale(0.70, 0.38, 0.92);
    this.travelEntity.enabled = false;
    app.root.addChild(this.travelEntity);

    this.markerEntity = new Entity('SuperJumpLandingMarker');
    this.markerEntity.addComponent('render', {
      type: 'cylinder',
      material: this.markerMaterialA,
      castShadows: false,
      receiveShadows: false
    });
    this.markerEntity.setLocalScale(1.20, 0.035, 1.20);
    this.markerEntity.enabled = false;
    app.root.addChild(this.markerEntity);

    this.syncStats();
  }

  public get currentState(): SuperJumpState {
    return this.state;
  }

  public get isBusy(): boolean {
    return this.state !== 'IDLE';
  }

  public get blocksPlayerControl(): boolean {
    return this.state === 'PREP' ||
      this.state === 'TRAVEL' ||
      this.state === 'LANDING';
  }

  public get isInvulnerable(): boolean {
    return this.state === 'TRAVEL' || this.state === 'LANDING';
  }

  public get usesExternalPlayerPosition(): boolean {
    return this.state === 'TRAVEL' || this.state === 'LANDING';
  }

  public canRequest(matchCanAct: boolean): boolean {
    return matchCanAct && this.state === 'IDLE';
  }

  public request(
    target: SuperJumpTarget,
    team: Team.A | Team.B
  ): boolean {
    if (this.state !== 'IDLE') return false;

    this.target = {
      kind: target.kind,
      id: target.id,
      label: target.label,
      position: target.position.clone()
    };
    this.team = team;
    this.resolveTargetPosition();

    this.prepRemaining = GAME_CONFIG.superJump.prepareSeconds;
    this.travelElapsed = 0;
    this.landingRemaining = 0;
    this.state = this.canBeginPreparationNow() ? 'PREP' : 'WAIT_GROUND';

    setEntityMaterial(
      this.travelEntity,
      team === Team.A ? this.travelMaterialA : this.travelMaterialB
    );
    setEntityMaterial(
      this.markerEntity,
      team === Team.A ? this.markerMaterialA : this.markerMaterialB
    );
    this.updateMarker();
    this.markerEntity.enabled = true;
    this.syncStats();
    return true;
  }

  public fixedUpdate(dt: number): void {
    if (this.state === 'IDLE' || !this.target || this.team === null) return;

    this.resolveTargetPosition();

    if (this.state === 'WAIT_GROUND') {
      if (this.canBeginPreparationNow()) {
        this.state = 'PREP';
        this.prepRemaining = GAME_CONFIG.superJump.prepareSeconds;
      }
      this.updateMarker();
      this.syncStats();
      return;
    }

    if (this.state === 'PREP') {
      this.prepRemaining = Math.max(0, this.prepRemaining - dt);
      this.updateMarker();
      if (this.prepRemaining <= 0) this.beginTravel();
      this.syncStats();
      return;
    }

    if (this.state === 'TRAVEL') {
      this.previousPosition.copy(this.currentPosition);
      this.travelElapsed = Math.min(
        GAME_CONFIG.superJump.travelSeconds,
        this.travelElapsed + dt
      );

      const totalAirSeconds =
        GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;
      const t = clamp01(
        this.travelElapsed / Math.max(totalAirSeconds, 1e-6)
      );
      this.updateTravelPosition(t);
      this.updateMarker();
      this.writeTravelStats(t);

      if (this.travelElapsed >= GAME_CONFIG.superJump.travelSeconds) {
        this.state = 'LANDING';
        this.landingRemaining = GAME_CONFIG.superJump.actionSeconds;
        this.syncStats(false);
      }
      return;
    }

    if (this.state === 'LANDING') {
      this.previousPosition.copy(this.currentPosition);
      this.landingRemaining = Math.max(0, this.landingRemaining - dt);

      const totalAirSeconds =
        GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;
      const elapsed =
        GAME_CONFIG.superJump.travelSeconds +
        (GAME_CONFIG.superJump.actionSeconds - this.landingRemaining);
      const t = clamp01(elapsed / Math.max(totalAirSeconds, 1e-6));

      this.updateTravelPosition(t);
      this.updateMarker();
      this.writeTravelStats(t);

      if (this.landingRemaining <= 0) this.finishLanding();
    }
  }

  public render(alpha: number): void {
    if (this.state === 'TRAVEL' || this.state === 'LANDING') {
      const t = clamp01(alpha);
      this.renderPosition.set(
        lerp(this.previousPosition.x, this.currentPosition.x, t),
        lerp(this.previousPosition.y, this.currentPosition.y, t),
        lerp(this.previousPosition.z, this.currentPosition.z, t)
      );
      this.travelEntity.setPosition(this.renderPosition);

      const spin = (
        this.travelElapsed /
        Math.max(GAME_CONFIG.superJump.travelSeconds, 1e-6)
      ) * 720;
      this.travelEntity.setLocalEulerAngles(spin, spin * 0.42, 0);
    }

    if (this.markerEntity.enabled) {
      const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.08;
      this.markerEntity.setLocalScale(1.20 * pulse, 0.035, 1.20 * pulse);
    }
  }

  public getFocusPosition(out = new Vec3()): Vec3 {
    if (this.state === 'TRAVEL' || this.state === 'LANDING') {
      return out.copy(this.currentPosition);
    }
    return this.player.getPosition(out);
  }

  public getRenderFocusPosition(out = new Vec3()): Vec3 {
    if (this.state === 'TRAVEL' || this.state === 'LANDING') {
      return out.copy(this.renderPosition);
    }
    return this.player.getPosition(out);
  }

  public cancel(): void {
    if (this.state === 'TRAVEL' || this.state === 'LANDING') {
      this.player.teleport(this.startPosition);
      this.player.setLifecycleActive(true);
    }
    this.clearVisuals();
    this.state = 'IDLE';
    this.target = null;
    this.team = null;
    this.prepRemaining = 0;
    this.travelElapsed = 0;
    this.landingRemaining = 0;
    this.syncStats();
  }

  public reset(): void {
    this.cancel();
    this.stats.playerSuperJumps = 0;
    this.syncStats();
  }

  private canBeginPreparationNow(): boolean {
    return this.stats.playerGrounded ||
      this.stats.playerLocomotionState === 'SWIM_WALL' ||
      this.stats.playerLocomotionState === 'SURGE_CHARGE';
  }

  private beginTravel(): void {
    if (!this.target || this.team === null) return;

    this.player.getPosition(this.startPosition);
    this.currentPosition.copy(this.startPosition);
    this.previousPosition.copy(this.startPosition);
    this.renderPosition.copy(this.startPosition);

    const dx = this.targetPosition.x - this.startPosition.x;
    const dz = this.targetPosition.z - this.startPosition.z;
    const horizontalDistance = Math.hypot(dx, dz);
    this.arcHeight = clamp(
      GAME_CONFIG.superJump.minArcHeightMeters +
        horizontalDistance * GAME_CONFIG.superJump.arcHeightPerHorizontalMeter,
      GAME_CONFIG.superJump.minArcHeightMeters,
      GAME_CONFIG.superJump.maxArcHeightMeters
    );

    this.state = 'TRAVEL';
    this.travelElapsed = 0;
    this.player.setLifecycleActive(false);
    this.travelEntity.enabled = true;
    setEntityMaterial(
      this.travelEntity,
      this.team === Team.A ? this.travelMaterialA : this.travelMaterialB
    );
    setEntityMaterial(
      this.markerEntity,
      this.team === Team.A ? this.markerMaterialA : this.markerMaterialB
    );
    this.stats.playerSuperJumps += 1;
    this.feedback.superJumpLaunch(this.team, this.startPosition);
    this.writeTravelStats(0);
  }

  private finishLanding(): void {
    if (this.team === null) return;

    this.clearVisuals();
    this.player.teleport(this.targetPosition);
    this.player.setLifecycleActive(true);
    this.feedback.superJumpLand(this.team, this.targetPosition);

    this.state = 'IDLE';
    this.target = null;
    this.team = null;
    this.landingRemaining = 0;
    this.syncStats();
  }

  private updateTravelPosition(t: number): void {
    this.currentPosition.set(
      lerp(this.startPosition.x, this.targetPosition.x, t),
      lerp(this.startPosition.y, this.targetPosition.y, t) +
        Math.sin(Math.PI * t) * this.arcHeight,
      lerp(this.startPosition.z, this.targetPosition.z, t)
    );
  }

  private resolveTargetPosition(): void {
    if (!this.target || this.team === null) return;

    if (this.target.kind === 'SPAWN') {
      this.targetPosition.copy(this.target.position);
      return;
    }

    const resolved = this.cpuAgents.resolveSuperJumpTarget(
      this.target.id,
      this.team,
      this.allyPosition
    );
    if (resolved) {
      this.target.position.copy(resolved);
    }

    this.targetPosition.copy(this.target.position);
    this.targetPosition.y += GAME_CONFIG.superJump.allyLandingBodyOffsetMeters;
  }

  private updateMarker(): void {
    if (!this.target) return;

    const markerY = this.target.kind === 'ALLY'
      ? this.targetPosition.y - GAME_CONFIG.superJump.allyLandingBodyOffsetMeters + 0.04
      : this.targetPosition.y - GAME_CONFIG.superJump.allyLandingBodyOffsetMeters + 0.04;

    this.markerEntity.setPosition(
      this.targetPosition.x,
      markerY,
      this.targetPosition.z
    );
  }

  private writeTravelStats(progress: number): void {
    this.stats.playerWorldX = this.currentPosition.x;
    this.stats.playerWorldY = this.currentPosition.y;
    this.stats.playerWorldZ = this.currentPosition.z;
    this.stats.playerSuperJumpProgress = clamp01(progress);
    this.syncStats(false);
  }

  private syncStats(resetProgress = true): void {
    this.stats.playerSuperJumpState = this.state;
    this.stats.playerSuperJumpTarget = this.target?.label ?? '-';

    if (resetProgress && this.state !== 'TRAVEL') {
      if (this.state === 'PREP') {
        this.stats.playerSuperJumpProgress =
          1 - this.prepRemaining / Math.max(GAME_CONFIG.superJump.prepareSeconds, 1e-6);
      } else if (this.state === 'LANDING') {
        const totalAirSeconds =
          GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;
        const elapsed =
          GAME_CONFIG.superJump.travelSeconds +
          (GAME_CONFIG.superJump.actionSeconds - this.landingRemaining);
        this.stats.playerSuperJumpProgress =
          clamp01(elapsed / Math.max(totalAirSeconds, 1e-6));
      } else {
        this.stats.playerSuperJumpProgress = 0;
      }
    }

    if (this.target) {
      this.stats.playerSuperJumpTargetX = this.targetPosition.x;
      this.stats.playerSuperJumpTargetY = this.targetPosition.y;
      this.stats.playerSuperJumpTargetZ = this.targetPosition.z;
    } else {
      this.stats.playerSuperJumpTargetX = Number.NaN;
      this.stats.playerSuperJumpTargetY = Number.NaN;
      this.stats.playerSuperJumpTargetZ = Number.NaN;
    }
  }

  private clearVisuals(): void {
    this.travelEntity.enabled = false;
    this.markerEntity.enabled = false;
  }
}

function makeMaterial(
  rgb: readonly [number, number, number],
  emissiveScale: number
): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(
    rgb[0] * emissiveScale,
    rgb[1] * emissiveScale,
    rgb[2] * emissiveScale
  );
  material.useMetalness = true;
  material.metalness = 0.08;
  material.gloss = 0.88;
  material.update();
  return material;
}

function setEntityMaterial(entity: Entity, material: StandardMaterial): void {
  const mesh = entity.render?.meshInstances[0];
  if (mesh) mesh.material = material;
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
