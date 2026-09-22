import { Entity, Vec3 } from 'playcanvas';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';

export interface InkClick {
  hit: SurfaceRayHit;
  clientX: number;
  clientY: number;
}

export class OrbitInkCamera {
  private yaw = 32;
  private pitch = -31;
  private distance = 23;
  private readonly target = new Vec3(0.4, 1.2, 0.2);
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private dragging = false;

  public onInkClick: ((click: InkClick) => void) | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly cameraEntity: Entity,
    private readonly surfaces: readonly PaintSurface[]
  ) {
    this.bind();
    this.updateTransform();
  }

  public destroy(): void {
    this.canvas.replaceWith(this.canvas.cloneNode(true));
  }

  private bind(): void {
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      this.pointerId = event.pointerId;
      this.startX = this.lastX = event.clientX;
      this.startY = this.lastY = event.clientY;
      this.dragging = false;
      this.canvas.setPointerCapture(event.pointerId);
    });

    this.canvas.addEventListener('pointermove', (event) => {
      if (this.pointerId !== event.pointerId) return;
      const total = Math.hypot(event.clientX - this.startX, event.clientY - this.startY);
      if (total > 4) this.dragging = true;
      if (!this.dragging) return;

      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.yaw -= dx * 0.24;
      this.pitch = Math.max(-78, Math.min(-10, this.pitch - dy * 0.18));
      this.updateTransform();
    });

    this.canvas.addEventListener('pointerup', (event) => {
      if (this.pointerId !== event.pointerId) return;
      if (!this.dragging) this.tryClick(event.clientX, event.clientY);
      this.canvas.releasePointerCapture(event.pointerId);
      this.pointerId = null;
      this.dragging = false;
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.distance = Math.max(9, Math.min(38, this.distance * Math.exp(event.deltaY * 0.001)));
      this.updateTransform();
    }, { passive: false });
  }

  private updateTransform(): void {
    const yaw = this.yaw * Math.PI / 180;
    const pitch = this.pitch * Math.PI / 180;
    const horizontal = Math.cos(pitch) * this.distance;
    const x = this.target.x + Math.sin(yaw) * horizontal;
    const z = this.target.z + Math.cos(yaw) * horizontal;
    const y = this.target.y - Math.sin(pitch) * this.distance;
    this.cameraEntity.setPosition(x, y, z);
    this.cameraEntity.lookAt(this.target);
  }

  private tryClick(clientX: number, clientY: number): void {
    const camera = this.cameraEntity.camera;
    if (!camera) return;
    const rect = this.canvas.getBoundingClientRect();

    // CameraComponent.screenToWorld() expects coordinates in the canvas' CSS
    // coordinate space (0..offsetWidth / 0..offsetHeight), not drawing-buffer
    // pixels. Multiplying by canvas.width / rect.width applies devicePixelRatio
    // a second time and offsets picking rays on high-DPI displays.
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
    if (best) this.onInkClick?.({ hit: best, clientX, clientY });
  }
}
