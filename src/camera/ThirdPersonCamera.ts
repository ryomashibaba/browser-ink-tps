import { Entity, Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';

export interface DebugInkClick {
  hit: SurfaceRayHit;
  clientX: number;
  clientY: number;
}

export class ThirdPersonCamera {
  private yaw = 0;
  private pitch = -12;
  private distance = 6.4;
  private shoulder = 0.72;
  private currentCameraDistance = Number.NaN;
  private readonly target = new Vec3();
  private readonly forward = new Vec3();
  private readonly right = new Vec3();
  private readonly desiredCameraPosition = new Vec3();
  private readonly cameraDirection = new Vec3();

  public onDebugInkClick: ((click: DebugInkClick) => void) | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly cameraEntity: Entity,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics
  ) {
    this.bind();
  }

  public update(playerPosition: Vec3, recoveryDtSeconds = 0): void {
    const pitchRadians = this.pitch * Math.PI / 180;
    const yawRadians = this.yaw * Math.PI / 180;
    const cosPitch = Math.cos(pitchRadians);

    this.forward.set(
      Math.sin(yawRadians) * cosPitch,
      Math.sin(pitchRadians),
      -Math.cos(yawRadians) * cosPitch
    ).normalize();

    const flatLength = Math.hypot(this.forward.x, this.forward.z);
    if (flatLength > 1e-6) {
      this.right.set(-this.forward.z / flatLength, 0, this.forward.x / flatLength);
    } else {
      this.right.set(1, 0, 0);
    }

    this.target.set(playerPosition.x, playerPosition.y + 0.55, playerPosition.z);
    this.desiredCameraPosition.copy(this.target)
      .sub(this.forward.clone().mulScalar(this.distance))
      .add(this.right.clone().mulScalar(this.shoulder));

    this.cameraDirection.copy(this.desiredCameraPosition).sub(this.target);
    const desiredDistance = this.cameraDirection.length();
    if (desiredDistance <= 1e-8) {
      this.cameraEntity.setPosition(this.target);
      return;
    }
    this.cameraDirection.mulScalar(1 / desiredDistance);

    const blocker = this.physics.castStageSegment(
      this.target,
      this.desiredCameraPosition,
      'camera'
    );
    const targetDistance = blocker
      ? Math.max(
          GAME_CONFIG.worldInteraction.cameraMinDistanceMeters,
          Math.min(
            desiredDistance,
            blocker.distance - GAME_CONFIG.worldInteraction.cameraCollisionPaddingMeters
          )
        )
      : desiredDistance;

    if (!Number.isFinite(this.currentCameraDistance)) {
      this.currentCameraDistance = targetDistance;
    } else if (targetDistance < this.currentCameraDistance) {
      // Retract immediately so the camera never spends a frame inside geometry.
      this.currentCameraDistance = targetDistance;
    } else if (recoveryDtSeconds > 0 && Number.isFinite(recoveryDtSeconds)) {
      // Expansion is intentionally damped so leaving an obstruction does not snap.
      const dt = Math.min(recoveryDtSeconds, GAME_CONFIG.simulation.maxFrameDeltaSeconds);
      const blend = 1 - Math.exp(
        -GAME_CONFIG.worldInteraction.cameraRecoverySharpness * dt
      );
      this.currentCameraDistance +=
        (targetDistance - this.currentCameraDistance) * blend;
    }

    this.currentCameraDistance = Math.min(this.currentCameraDistance, targetDistance);
    this.cameraEntity.setPosition(
      this.target.x + this.cameraDirection.x * this.currentCameraDistance,
      this.target.y + this.cameraDirection.y * this.currentCameraDistance,
      this.target.z + this.cameraDirection.z * this.currentCameraDistance
    );
    this.cameraEntity.lookAt(this.target.clone().add(this.forward.clone().mulScalar(12)));
  }

  public getAimDirection(out = new Vec3()): Vec3 {
    const camera = this.cameraEntity.camera;
    if (!camera) return out.copy(this.forward).normalize();

    const rect = this.canvas.getBoundingClientRect();
    const from = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.nearClip);
    const to = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.farClip);
    return out.copy(to).sub(from).normalize();
  }

  public getAimTarget(out = new Vec3(), fallbackDistance = 80): Vec3 {
    const camera = this.cameraEntity.camera;
    if (!camera) {
      return out.copy(this.cameraEntity.getPosition()).add(this.forward.clone().mulScalar(fallbackDistance));
    }

    const rect = this.canvas.getBoundingClientRect();
    const from = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.nearClip);
    const to = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.farClip);
    const direction = to.clone().sub(from).normalize();

    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectRay(from, direction);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }

    const blockerEnd = from.clone().add(direction.clone().mulScalar(fallbackDistance));
    const blocker = this.physics.castStageSegment(from, blockerEnd, 'projectile');
    if (
      best &&
      (!blocker ||
        best.distance <=
          blocker.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters)
    ) {
      return out.copy(best.worldPoint);
    }
    if (blocker) return out.copy(blocker.point);
    return out.copy(from).add(direction.mulScalar(fallbackDistance));
  }

  public getFlatForward(out = new Vec3()): Vec3 {
    out.set(this.forward.x, 0, this.forward.z);
    if (out.lengthSq() < 1e-8) return out.set(0, 0, -1);
    return out.normalize();
  }

  private bind(): void {
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // Standard browser-TPS mouse look:
    // click the game view once to acquire pointer lock, then camera rotation follows
    // raw mouse movement without requiring any button to remain held.
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button === 0 && event.altKey) {
        this.tryDebugPick(event.clientX, event.clientY);
        event.preventDefault();
        return;
      }

      if (document.pointerLockElement !== this.canvas) {
        void this.canvas.requestPointerLock().catch(() => {
          // Pointer lock can be denied by browser/user policy; keep normal UI usable.
        });
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== this.canvas) return;
      this.yaw += event.movementX * 0.22;
      this.pitch = Math.max(-55, Math.min(28, this.pitch - event.movementY * 0.18));
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.distance = Math.max(3.6, Math.min(9.5, this.distance * Math.exp(event.deltaY * 0.001)));
    }, { passive: false });
  }

  private tryDebugPick(clientX: number, clientY: number): void {
    const camera = this.cameraEntity.camera;
    if (!camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const locked = document.pointerLockElement === this.canvas;
    const x = locked ? rect.width * 0.5 : Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = locked ? rect.height * 0.5 : Math.max(0, Math.min(rect.height, clientY - rect.top));
    const from = camera.screenToWorld(x, y, camera.nearClip);
    const to = camera.screenToWorld(x, y, camera.farClip);
    const direction = to.clone().sub(from).normalize();

    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectRay(from, direction);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    if (best) this.onDebugInkClick?.({ hit: best, clientX, clientY });
  }
}
