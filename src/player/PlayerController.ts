import RAPIER, {
  type Collider,
  type KinematicCharacterController,
  type RigidBody
} from '@dimforge/rapier3d-compat';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem, GameplayInkSample } from '../ink/GameplayInkSystem';
import { SurfaceFlags, Team } from '../ink/types';
import type { PlayerInput } from '../input/PlayerInput';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';

export type PlayerMode = 'HUMAN' | 'SQUID';
export type InkRelation = 'OWN' | 'ENEMY' | 'NEUTRAL' | 'NONE';

export class PlayerController {
  private readonly body: RigidBody;
  private readonly collider: Collider;
  private readonly character: KinematicCharacterController;
  private readonly entity: Entity;
  private readonly material: StandardMaterial;
  private readonly velocity = new Vec3();
  private readonly flatForward = new Vec3();
  private readonly right = new Vec3();
  private readonly desired = new Vec3();
  private readonly footPoint = new Vec3();
  private readonly position = new Vec3();
  private readonly muzzleOffset = new Vec3();
  private mode: PlayerMode = 'HUMAN';
  private inkRelation: InkRelation = 'NONE';
  private grounded = false;
  private verticalVelocity = 0;
  private team: Team.A | Team.B = Team.A;

  private static readonly radius = 0.32;
  private static readonly halfHeight = 0.55;

  public constructor(
    app: AppBase,
    private readonly physics: RapierStagePhysics,
    private readonly input: PlayerInput,
    private readonly camera: ThirdPersonCamera,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stats: PerformanceStats
  ) {
    this.body = physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1.15, 4.6)
    );
    this.collider = physics.world.createCollider(
      RAPIER.ColliderDesc.capsule(PlayerController.halfHeight, PlayerController.radius),
      this.body
    );

    this.character = physics.world.createCharacterController(0.025);
    this.character.enableAutostep(0.34, 0.14, false);
    this.character.enableSnapToGround(0.24);
    this.character.setMaxSlopeClimbAngle(50 * Math.PI / 180);
    this.character.setMinSlopeSlideAngle(55 * Math.PI / 180);

    this.material = new StandardMaterial();
    this.material.useMetalness = true;
    this.material.metalness = 0.16;
    this.material.gloss = 0.72;
    this.updateMaterial();

    this.entity = new Entity('Player');
    this.entity.addComponent('render', {
      type: 'capsule',
      material: this.material,
      castShadows: true,
      receiveShadows: true
    });
    this.entity.setLocalScale(0.72, 0.92, 0.72);
    app.root.addChild(this.entity);
    this.syncAfterPhysics();
  }

  public setTeam(team: Team.A | Team.B): void {
    this.team = team;
    this.updateMaterial();
  }

  public computeFixed(dt: number): void {
    const bodyPosition = this.body.translation();
    this.footPoint.set(
      bodyPosition.x,
      bodyPosition.y - PlayerController.halfHeight - PlayerController.radius + 0.06,
      bodyPosition.z
    );
    const sample = this.gameplayInk.sampleWorld(this.footPoint, 0.40);
    this.inkRelation = this.relationFor(sample);

    const nextMode: PlayerMode = this.input.squidHeld ? 'SQUID' : 'HUMAN';
    if (nextMode !== this.mode) {
      this.mode = nextMode;
      this.entity.setLocalScale(
        nextMode === 'SQUID' ? 0.86 : 0.72,
        nextMode === 'SQUID' ? 0.48 : 0.92,
        nextMode === 'SQUID' ? 1.08 : 0.72
      );
    }

    this.camera.getFlatForward(this.flatForward);
    this.right.set(-this.flatForward.z, 0, this.flatForward.x);

    const inputX = this.input.moveX;
    const inputY = this.input.moveY;
    this.desired.set(
      this.right.x * inputX + this.flatForward.x * inputY,
      0,
      this.right.z * inputX + this.flatForward.z * inputY
    );
    if (this.desired.lengthSq() > 1) this.desired.normalize();

    const tuning = GAME_CONFIG.player;
    let targetSpeed: number = tuning.humanSpeedMetersPerSecond;
    let acceleration: number = tuning.groundAccelerationMetersPerSecond2;

    if (this.mode === 'SQUID') {
      if (this.inkRelation === 'OWN') {
        targetSpeed = tuning.squidOwnInkSpeedMetersPerSecond;
        acceleration = tuning.squidOwnInkAccelerationMetersPerSecond2;
      } else if (this.inkRelation === 'ENEMY') {
        targetSpeed = tuning.squidEnemyInkSpeedMetersPerSecond;
        acceleration = tuning.squidDryAccelerationMetersPerSecond2;
      } else {
        targetSpeed = tuning.squidNeutralSpeedMetersPerSecond;
        acceleration = tuning.squidDryAccelerationMetersPerSecond2;
      }
    }

    const desiredX = this.desired.x * targetSpeed;
    const desiredZ = this.desired.z * targetSpeed;
    const accel = this.desired.lengthSq() > 0
      ? acceleration
      : tuning.decelerationMetersPerSecond2;
    this.velocity.x = moveToward(this.velocity.x, desiredX, accel * dt);
    this.velocity.z = moveToward(this.velocity.z, desiredZ, accel * dt);

    if (this.grounded && this.input.consumeJump()) {
      this.verticalVelocity = tuning.jumpSpeedMetersPerSecond;
      this.grounded = false;
    }
    this.verticalVelocity -= tuning.gravityMetersPerSecond2 * dt;
    this.verticalVelocity = Math.max(this.verticalVelocity, -tuning.maxFallSpeedMetersPerSecond);

    this.character.computeColliderMovement(this.collider, {
      x: this.velocity.x * dt,
      y: this.verticalVelocity * dt,
      z: this.velocity.z * dt
    });
    const corrected = this.character.computedMovement();
    this.grounded = this.character.computedGrounded();

    this.body.setNextKinematicTranslation({
      x: bodyPosition.x + corrected.x,
      y: bodyPosition.y + corrected.y,
      z: bodyPosition.z + corrected.z
    });

    if (this.grounded && this.verticalVelocity < 0) this.verticalVelocity = -0.5;
  }

  public syncAfterPhysics(): void {
    const p = this.body.translation();
    this.position.set(p.x, p.y, p.z);
    this.entity.setPosition(this.position);

    this.stats.playerMode = this.mode;
    this.stats.playerGrounded = this.grounded;
    this.stats.playerSpeedMetersPerSecond = Math.hypot(this.velocity.x, this.velocity.z);
    this.stats.playerInkRelation = this.inkRelation;
  }

  public getPosition(out = new Vec3()): Vec3 {
    return out.copy(this.position);
  }

  public getMuzzlePosition(aimDirection: Vec3, out = new Vec3()): Vec3 {
    out.copy(this.position);
    out.y += this.mode === 'SQUID' ? 0.18 : 0.42;
    this.muzzleOffset.copy(aimDirection).mulScalar(0.58);
    out.add(this.muzzleOffset);
    return out;
  }

  private relationFor(sample: GameplayInkSample | null): InkRelation {
    if (!sample || (sample.flags & SurfaceFlags.Swimmable) === 0) return 'NONE';
    if (sample.owner === this.team) return 'OWN';
    if (sample.owner === Team.Neutral) return 'NEUTRAL';
    return 'ENEMY';
  }

  private updateMaterial(): void {
    const rgb = this.team === Team.A ? GAME_CONFIG.visual.teamA : GAME_CONFIG.visual.teamB;
    this.material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
    this.material.emissive = new Color(rgb[0] * 0.08, rgb[1] * 0.08, rgb[2] * 0.08);
    this.material.update();
  }
}

function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
