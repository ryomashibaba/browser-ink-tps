import { Entity, Vec3 } from 'playcanvas';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';

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
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private readonly target = new Vec3();
  private readonly forward = new Vec3();
  private readonly right = new Vec3();

  public onDebugInkClick: ((click: DebugInkClick) => void) | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly cameraEntity: Entity,
    private readonly surfaces: readonly PaintSurface[]
  ) {
    this.bind();
  }

  public update(playerPosition: Vec3): void {
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
    const cameraPosition = this.target.clone()
      .sub(this.forward.clone().mulScalar(this.distance))
      .add(this.right.clone().mulScalar(this.shoulder));

    this.cameraEntity.setPosition(cameraPosition);
    this.cameraEntity.lookAt(this.target.clone().add(this.forward.clone().mulScalar(12)));
  }

  public getAimDirection(out = new Vec3()): Vec3 {
    return out.copy(this.forward).normalize();
  }

  public getFlatForward(out = new Vec3()): Vec3 {
    out.set(this.forward.x, 0, this.forward.z);
    if (out.lengthSq() < 1e-8) return out.set(0, 0, -1);
    return out.normalize();
  }

  private bind(): void {
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button === 2) {
        this.pointerId = event.pointerId;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
        return;
      }
      if (event.button === 0 && event.altKey) {
        this.tryDebugPick(event.clientX, event.clientY);
        event.preventDefault();
      }
    });

    this.canvas.addEventListener('pointermove', (event) => {
      if (this.pointerId !== event.pointerId) return;
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.yaw += dx * 0.22;
      this.pitch = Math.max(-55, Math.min(28, this.pitch + dy * 0.18));
    });

    const endPointer = (event: PointerEvent) => {
      if (this.pointerId !== event.pointerId) return;
      if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
      this.pointerId = null;
    };
    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.distance = Math.max(3.6, Math.min(9.5, this.distance * Math.exp(event.deltaY * 0.001)));
    }, { passive: false });
  }

  private tryDebugPick(clientX: number, clientY: number): void {
    const camera = this.cameraEntity.camera;
    if (!camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
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
