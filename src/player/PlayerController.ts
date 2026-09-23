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
export type PlayerLocomotionState =
  | 'HUMAN'
  | 'SQUID_DRY'
  | 'SWIM_GROUND'
  | 'SWIM_WALL'
  | 'SQUID_ROLL'
  | 'SURGE_CHARGE'
  | 'SURGE'
  | 'DUALIE_DODGE';

interface OwnWallSample {
  sample: GameplayInkSample;
  outward: Vec3;
  towardAmount: number;
}

export class PlayerController {
  private readonly body: RigidBody;
  private readonly humanCollider: Collider;
  private readonly squidCollider: Collider;
  private activeCollider: Collider;
  private readonly character: KinematicCharacterController;
  private readonly entity: Entity;
  private readonly material: StandardMaterial;
  private readonly velocity = new Vec3();
  private readonly flatForward = new Vec3();
  private readonly right = new Vec3();
  private readonly desired = new Vec3();
  private readonly footPoint = new Vec3();
  private readonly wallProbePoint = new Vec3();
  private readonly wallOutward = new Vec3();
  private readonly position = new Vec3();
  private readonly previousPosition = new Vec3();
  private readonly renderPosition = new Vec3();
  private readonly muzzleOffset = new Vec3();
  private readonly squidRollDirection = new Vec3();
  private positionInitialized = false;
  private mode: PlayerMode = 'HUMAN';
  private locomotionState: PlayerLocomotionState = 'HUMAN';
  private inkRelation: InkRelation = 'NONE';
  private grounded = false;
  private verticalVelocity = 0;
  private team: Team.A | Team.B = Team.A;
  private wallSurfaceId = '-';
  private squidRollRemainingSeconds = 0;
  private squidRollTurnWindowSeconds = 0;
  private surgeRemainingSeconds = 0;
  private surgeChargeSeconds = 0;
  private weaponDodgeRemainingSeconds = 0;
  private weaponDodgeCooldownSeconds = 0;
  private weaponDodgeRequested = false;
  private weaponMoveMultiplier = 1;
  private snapToGroundEnabled = true;

  private static readonly humanRadius = GAME_CONFIG.player.humanColliderRadiusMeters;
  private static readonly humanHalfHeight = GAME_CONFIG.player.humanColliderHalfHeightMeters;
  private static readonly humanFootOffset =
    PlayerController.humanHalfHeight + PlayerController.humanRadius;
  private static readonly squidRadius = GAME_CONFIG.player.squidColliderRadiusMeters;
  private static readonly squidCenterOffsetY =
    -(PlayerController.humanFootOffset - PlayerController.squidRadius);

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

    this.humanCollider = physics.world.createCollider(
      RAPIER.ColliderDesc.capsule(
        PlayerController.humanHalfHeight,
        PlayerController.humanRadius
      ),
      this.body
    );
    this.squidCollider = physics.world.createCollider(
      RAPIER.ColliderDesc.ball(PlayerController.squidRadius)
        .setTranslation(0, PlayerController.squidCenterOffsetY, 0)
        .setEnabled(false),
      this.body
    );
    this.activeCollider = this.humanCollider;

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

  public get canShoot(): boolean {
    return this.mode === 'HUMAN';
  }

  public get currentMode(): PlayerMode {
    return this.mode;
  }

  public get currentInkRelation(): InkRelation {
    return this.inkRelation;
  }

  public requestWeaponDodge(): void {
    this.weaponDodgeRequested = true;
  }

  public setWeaponMoveMultiplier(multiplier: number): void {
    this.weaponMoveMultiplier = clamp(multiplier, 0.45, 1.25);
  }

  public setTeam(team: Team.A | Team.B): void {
    this.team = team;
    this.updateMaterial();
  }

  public setLifecycleActive(active: boolean): void {
    this.entity.enabled = active;
    if (!active) {
      this.humanCollider.setEnabled(false);
      this.squidCollider.setEnabled(false);
      return;
    }

    this.humanCollider.setEnabled(this.mode === 'HUMAN');
    this.squidCollider.setEnabled(this.mode === 'SQUID');
    this.activeCollider = this.mode === 'HUMAN' ? this.humanCollider : this.squidCollider;
  }

  public teleport(position: Vec3): void {
    this.mode = 'HUMAN';
    this.locomotionState = 'HUMAN';
    this.inkRelation = 'NONE';
    this.velocity.set(0, 0, 0);
    this.desired.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.grounded = false;
    this.wallSurfaceId = '-';
    this.squidRollRemainingSeconds = 0;
    this.squidRollTurnWindowSeconds = 0;
    this.surgeRemainingSeconds = 0;
    this.surgeChargeSeconds = 0;
    this.weaponDodgeRemainingSeconds = 0;
    this.weaponDodgeCooldownSeconds = 0;
    this.weaponDodgeRequested = false;
    this.weaponMoveMultiplier = 1;
    this.setSnapToGround(true);

    this.squidCollider.setEnabled(false);
    this.humanCollider.setEnabled(true);
    this.activeCollider = this.humanCollider;
    this.entity.enabled = true;
    this.entity.setLocalScale(0.72, 0.92, 0.72);

    this.body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
    this.body.setNextKinematicTranslation({ x: position.x, y: position.y, z: position.z });
    this.position.copy(position);
    this.previousPosition.copy(position);
    this.renderPosition.copy(position);
    this.footPoint.set(
      position.x,
      position.y - PlayerController.humanFootOffset + 0.06,
      position.z
    );
    this.applyVisualPosition(position);
  }

  public computeFixed(dt: number): void {
    const bodyPosition = this.body.translation();

    this.footPoint.set(
      bodyPosition.x,
      bodyPosition.y - PlayerController.humanFootOffset + 0.06,
      bodyPosition.z
    );
    const groundSample = this.gameplayInk.sampleWorld(
      this.footPoint,
      0.40,
      SurfaceFlags.Swimmable,
      SurfaceFlags.Wall
    );
    this.inkRelation = this.relationFor(groundSample);

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

    const jumpPressed = this.input.consumeJump();
    this.squidRollTurnWindowSeconds = Math.max(0, this.squidRollTurnWindowSeconds - dt);
    this.weaponDodgeRemainingSeconds = Math.max(0, this.weaponDodgeRemainingSeconds - dt);
    this.weaponDodgeCooldownSeconds = Math.max(0, this.weaponDodgeCooldownSeconds - dt);

    if (this.weaponDodgeRemainingSeconds > 0) {
      this.setMode('HUMAN');
      this.locomotionState = 'DUALIE_DODGE';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollTurnWindowSeconds = 0;
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (this.weaponDodgeRequested && this.mode === 'HUMAN' && this.weaponDodgeCooldownSeconds <= 0) {
      const dodgeDirection = this.desired.lengthSq() > 0.04
        ? this.desired.clone().normalize()
        : this.flatForward.clone().normalize();
      this.velocity.x = dodgeDirection.x * 9.6;
      this.velocity.z = dodgeDirection.z * 9.6;
      if (this.grounded) this.verticalVelocity = 0;
      this.weaponDodgeRemainingSeconds = 0.18;
      this.weaponDodgeCooldownSeconds = 0.52;
      this.locomotionState = 'DUALIE_DODGE';
      this.setMode('HUMAN');
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (this.squidRollRemainingSeconds > 0) {
      this.setMode('SQUID');
      this.locomotionState = 'SQUID_ROLL';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollRemainingSeconds = Math.max(0, this.squidRollRemainingSeconds - dt);
      this.applyGravity(dt);
      this.setSnapToGround(false);
    } else if (this.surgeRemainingSeconds > 0) {
      this.setMode('SQUID');
      this.locomotionState = 'SURGE';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.surgeRemainingSeconds = Math.max(0, this.surgeRemainingSeconds - dt);
      this.verticalVelocity -= GAME_CONFIG.player.surgeGravityMetersPerSecond2 * dt;
      this.setSnapToGround(false);
    } else if (this.input.squidHeld) {
      this.setMode('SQUID');
      const wall = this.findOwnWallSample(bodyPosition);
      if (wall && (this.input.jumpHeld || this.surgeChargeSeconds > 0)) {
        if (this.input.jumpHeld) {
          this.input.consumeJump();
          this.surgeChargeSeconds = Math.min(
            GAME_CONFIG.player.surgeMaxChargeSeconds,
            this.surgeChargeSeconds + dt
          );
          this.locomotionState = 'SURGE_CHARGE';
          this.wallSurfaceId = wall.sample.surface.id;
          this.inkRelation = 'OWN';
          this.velocity.set(
            -wall.outward.x * GAME_CONFIG.player.wallStickSpeedMetersPerSecond,
            0,
            -wall.outward.z * GAME_CONFIG.player.wallStickSpeedMetersPerSecond
          );
          this.verticalVelocity = 0;
          this.setSnapToGround(false);
        } else {
          this.triggerSurge(wall);
        }
      } else if (wall) {
        this.surgeChargeSeconds = 0;
        this.locomotionState = 'SWIM_WALL';
        this.wallSurfaceId = wall.sample.surface.id;
        this.inkRelation = 'OWN';
        this.applyWallSwim(wall);
        this.setSnapToGround(false);
      } else {
        this.surgeChargeSeconds = 0;
        this.wallSurfaceId = '-';
        this.setSnapToGround(true);

        const tuning = GAME_CONFIG.player;
        if (this.inkRelation === 'OWN') {
          this.locomotionState = 'SWIM_GROUND';
          this.captureSquidRollTurnIntent();

          if (jumpPressed && this.grounded && this.squidRollTurnWindowSeconds > 0) {
            this.startSquidRoll();
          } else {
            this.applyHorizontalTarget(
              tuning.squidOwnInkSpeedMetersPerSecond,
              tuning.squidOwnInkAccelerationMetersPerSecond2,
              dt
            );
            this.tryJump(jumpPressed, tuning.squidJumpSpeedMetersPerSecond);
            this.applyGravity(dt);
          }
        } else {
          this.squidRollTurnWindowSeconds = 0;
          this.locomotionState = 'SQUID_DRY';

          if (this.inkRelation === 'ENEMY') {
            this.applyHorizontalTarget(
              tuning.squidEnemyInkSpeedMetersPerSecond,
              tuning.squidDryAccelerationMetersPerSecond2,
              dt
            );
          } else {
            // T9 tuning: Squid form outside any ink keeps Human-equivalent mobility.
            this.applyHorizontalTarget(
              tuning.humanSpeedMetersPerSecond,
              tuning.groundAccelerationMetersPerSecond2,
              dt
            );
          }

          this.tryJump(jumpPressed, tuning.squidJumpSpeedMetersPerSecond);
          this.applyGravity(dt);
        }
      }
    } else {
      this.setMode('HUMAN');
      this.locomotionState = 'HUMAN';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollTurnWindowSeconds = 0;
      this.setSnapToGround(true);

      const tuning = GAME_CONFIG.player;
      this.applyHorizontalTarget(
        tuning.humanSpeedMetersPerSecond * this.weaponMoveMultiplier,
        tuning.groundAccelerationMetersPerSecond2,
        dt
      );
      this.tryJump(jumpPressed, tuning.jumpSpeedMetersPerSecond);
      this.applyGravity(dt);
    }

    this.character.computeColliderMovement(this.activeCollider, {
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
    this.weaponDodgeRequested = false;
  }

  public syncAfterPhysics(dt?: number): void {
    const p = this.body.translation();

    if (!this.positionInitialized) {
      this.position.set(p.x, p.y, p.z);
      this.previousPosition.copy(this.position);
      this.renderPosition.copy(this.position);
      this.positionInitialized = true;
    } else {
      this.previousPosition.copy(this.position);
      this.position.set(p.x, p.y, p.z);
    }

    this.applyVisualPosition(this.position);

    this.stats.playerWorldX = this.position.x;
    this.stats.playerWorldY = this.position.y;
    this.stats.playerWorldZ = this.position.z;
    this.stats.playerMode = this.mode;
    this.stats.playerLocomotionState = this.locomotionState;
    this.stats.playerGrounded = this.grounded;
    this.stats.playerSpeedMetersPerSecond = dt && dt > 0
      ? Math.hypot(
          this.position.x - this.previousPosition.x,
          this.position.z - this.previousPosition.z
        ) / dt
      : 0;
    this.stats.playerInkRelation = this.inkRelation;
    const debugSample = this.gameplayInk.sampleWorld(
      this.footPoint,
      0.40,
      SurfaceFlags.Swimmable,
      SurfaceFlags.Wall
    );
    this.stats.playerSampleSurface = debugSample?.surface.id ?? '-';
    this.stats.playerSampleU = debugSample?.u ?? Number.NaN;
    this.stats.playerSampleV = debugSample?.v ?? Number.NaN;
    this.stats.playerCollider = this.mode === 'SQUID' ? 'BALL' : 'CAPSULE';
    this.stats.playerWallSurface = this.wallSurfaceId;
    this.stats.playerSurgeCharge = GAME_CONFIG.player.surgeMaxChargeSeconds > 0
      ? this.surgeChargeSeconds / GAME_CONFIG.player.surgeMaxChargeSeconds
      : 0;
    this.stats.playerSquidRollReady = this.squidRollTurnWindowSeconds > 0;
  }

  public render(alpha: number, out = new Vec3()): Vec3 {
    const t = Math.max(0, Math.min(1, alpha));
    this.renderPosition.set(
      this.previousPosition.x + (this.position.x - this.previousPosition.x) * t,
      this.previousPosition.y + (this.position.y - this.previousPosition.y) * t,
      this.previousPosition.z + (this.position.z - this.previousPosition.z) * t
    );
    this.applyVisualPosition(this.renderPosition, true);
    return out.copy(this.renderPosition);
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

  private applyHorizontalTarget(targetSpeed: number, acceleration: number, dt: number): void {
    const desiredX = this.desired.x * targetSpeed;
    const desiredZ = this.desired.z * targetSpeed;
    const accel = this.desired.lengthSq() > 0
      ? acceleration
      : GAME_CONFIG.player.decelerationMetersPerSecond2;
    this.velocity.x = moveToward(this.velocity.x, desiredX, accel * dt);
    this.velocity.z = moveToward(this.velocity.z, desiredZ, accel * dt);
  }

  private tryJump(jumpPressed: boolean, jumpSpeed: number): void {
    if (!jumpPressed || !this.grounded) return;
    this.verticalVelocity = jumpSpeed;
    this.grounded = false;
  }

  private applyGravity(dt: number): void {
    this.verticalVelocity -= GAME_CONFIG.player.gravityMetersPerSecond2 * dt;
    this.verticalVelocity = Math.max(
      this.verticalVelocity,
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond
    );
  }

  private captureSquidRollTurnIntent(): void {
    if (!this.grounded) return;

    const tuning = GAME_CONFIG.player;
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed < tuning.squidRollMinSpeedMetersPerSecond) return;
    if (this.desired.lengthSq() < 0.25) return;

    const dot = (
      this.velocity.x * this.desired.x +
      this.velocity.z * this.desired.z
    ) / Math.max(speed, 1e-6);

    if (dot > tuning.squidRollReverseDotThreshold) return;

    this.squidRollDirection.copy(this.desired).normalize();
    this.squidRollTurnWindowSeconds = tuning.squidRollTurnGraceSeconds;
  }

  private startSquidRoll(): void {
    const tuning = GAME_CONFIG.player;
    if (this.squidRollDirection.lengthSq() <= 1e-6) return;

    this.velocity.x = this.squidRollDirection.x * tuning.squidRollSpeedMetersPerSecond;
    this.velocity.z = this.squidRollDirection.z * tuning.squidRollSpeedMetersPerSecond;
    this.verticalVelocity = tuning.squidRollUpSpeedMetersPerSecond;
    this.squidRollRemainingSeconds = tuning.squidRollDurationSeconds;
    this.squidRollTurnWindowSeconds = 0;
    this.locomotionState = 'SQUID_ROLL';
    this.grounded = false;
    this.setSnapToGround(false);
  }

  private applyWallSwim(wall: OwnWallSample): void {
    const tuning = GAME_CONFIG.player;
    const tangent = wall.sample.surface.uAxis;
    const lateralAmount = clamp(
      this.desired.x * tangent.x + this.desired.z * tangent.z,
      -1,
      1
    );
    const climbAmount = clamp(wall.towardAmount, 0, 1);

    this.velocity.x =
      tangent.x * lateralAmount * tuning.squidWallLateralSpeedMetersPerSecond -
      wall.outward.x * tuning.wallStickSpeedMetersPerSecond;
    this.velocity.z =
      tangent.z * lateralAmount * tuning.squidWallLateralSpeedMetersPerSecond -
      wall.outward.z * tuning.wallStickSpeedMetersPerSecond;
    this.verticalVelocity = climbAmount * tuning.squidWallClimbSpeedMetersPerSecond;
    this.grounded = false;
  }

  private triggerSurge(wall: OwnWallSample): void {
    const tuning = GAME_CONFIG.player;
    const chargeFraction = clamp(
      Math.max(this.surgeChargeSeconds, tuning.surgeMinChargeSeconds) /
        tuning.surgeMaxChargeSeconds,
      0,
      1
    );
    const upSpeed =
      tuning.surgeMinUpSpeedMetersPerSecond +
      (tuning.surgeMaxUpSpeedMetersPerSecond - tuning.surgeMinUpSpeedMetersPerSecond) *
        chargeFraction;

    this.velocity.x = wall.outward.x * tuning.surgeAwaySpeedMetersPerSecond;
    this.velocity.z = wall.outward.z * tuning.surgeAwaySpeedMetersPerSecond;
    this.verticalVelocity = upSpeed;
    this.surgeChargeSeconds = 0;
    this.surgeRemainingSeconds = tuning.surgeDurationSeconds;
    this.locomotionState = 'SURGE';
    this.wallSurfaceId = '-';
    this.grounded = false;
    this.setSnapToGround(false);
  }

  private findOwnWallSample(bodyPosition: { x: number; y: number; z: number }): OwnWallSample | null {
    if (this.desired.lengthSq() < 0.04) return null;

    const tuning = GAME_CONFIG.player;
    this.wallProbePoint.set(
      bodyPosition.x + this.desired.x * tuning.wallProbeForwardMeters,
      bodyPosition.y + tuning.wallProbeHeightOffsetMeters,
      bodyPosition.z + this.desired.z * tuning.wallProbeForwardMeters
    );

    const sample = this.gameplayInk.sampleWorld(
      this.wallProbePoint,
      tuning.wallProbePlaneDistanceMeters,
      SurfaceFlags.Swimmable | SurfaceFlags.Wall
    );
    if (!sample || sample.owner !== this.team) return null;

    const relX = bodyPosition.x - sample.surface.center.x;
    const relY = bodyPosition.y - sample.surface.center.y;
    const relZ = bodyPosition.z - sample.surface.center.z;
    const signedSide =
      relX * sample.surface.normal.x +
      relY * sample.surface.normal.y +
      relZ * sample.surface.normal.z;
    const side = signedSide >= 0 ? 1 : -1;
    this.wallOutward.set(
      sample.surface.normal.x * side,
      sample.surface.normal.y * side,
      sample.surface.normal.z * side
    );

    const towardAmount = -(
      this.desired.x * this.wallOutward.x +
      this.desired.z * this.wallOutward.z
    );
    if (towardAmount < tuning.wallAttachInputThreshold) return null;

    return {
      sample,
      outward: this.wallOutward.clone(),
      towardAmount
    };
  }

  private setMode(nextMode: PlayerMode): void {
    if (nextMode === this.mode) return;
    this.mode = nextMode;

    if (nextMode === 'SQUID') {
      this.humanCollider.setEnabled(false);
      this.squidCollider.setEnabled(true);
      this.activeCollider = this.squidCollider;
      this.entity.setLocalScale(0.86, 0.48, 1.08);
    } else {
      this.squidCollider.setEnabled(false);
      this.humanCollider.setEnabled(true);
      this.activeCollider = this.humanCollider;
      this.entity.setLocalScale(0.72, 0.92, 0.72);
    }
  }

  private setSnapToGround(enabled: boolean): void {
    if (enabled === this.snapToGroundEnabled) return;
    this.snapToGroundEnabled = enabled;
    if (enabled) this.character.enableSnapToGround(0.24);
    else this.character.disableSnapToGround();
  }

  private applyVisualPosition(position: Vec3, animated = false): void {
    const time = performance.now() * 0.001;
    const speedRatio = clamp(
      this.stats.playerSpeedMetersPerSecond /
        Math.max(GAME_CONFIG.player.humanSpeedMetersPerSecond, 1e-6),
      0,
      1.4
    );
    const groundedBob = animated && this.grounded && this.mode === 'HUMAN'
      ? Math.sin(time * 13.5) * 0.035 * Math.min(speedRatio, 1)
      : 0;

    this.entity.setPosition(
      position.x,
      position.y +
        (this.mode === 'SQUID' ? GAME_CONFIG.player.squidVisualOffsetYMeters : 0) +
        groundedBob,
      position.z
    );

    if (this.locomotionState === 'SQUID_ROLL') {
      const duration = Math.max(GAME_CONFIG.player.squidRollDurationSeconds, 1e-6);
      const progress = 1 - clamp(this.squidRollRemainingSeconds / duration, 0, 1);
      this.entity.setLocalScale(0.86, 0.48, 1.08);
      this.entity.setLocalEulerAngles(progress * 360, 0, 0);
      return;
    }

    if (this.mode === 'SQUID') {
      const pulse = animated ? Math.sin(time * 7.2) * 0.035 : 0;
      this.entity.setLocalScale(
        0.86 * (1 + pulse),
        0.48 * (1 - pulse * 0.55),
        1.08 * (1 + pulse * 0.35)
      );
      this.entity.setLocalEulerAngles(0, 0, 0);
      return;
    }

    const step = animated && this.grounded
      ? Math.abs(Math.sin(time * 13.5)) * Math.min(speedRatio, 1)
      : 0;
    const sway = animated && this.grounded
      ? Math.sin(time * 6.75) * Math.min(speedRatio, 1) * 2.8
      : 0;
    this.entity.setLocalScale(
      0.72 * (1 + step * 0.018),
      0.92 * (1 - step * 0.026),
      0.72 * (1 + step * 0.018)
    );
    this.entity.setLocalEulerAngles(0, 0, sway);
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
