import { Vec3 } from 'playcanvas';
import type { SurfaceRayHit } from '../ink/PaintSurface';
import { SurfaceFlags } from '../ink/types';

interface SlosherGroup {
  head: boolean;
  count: number;
  offset: number;
  interval: number;
  groundSpeed: number;
  airSpeed: number;
  speedStep: number;
  pitch: number;
  gravity: number;
}

// The delays follow the reference candidate. Speeds, gravity, radii,
// widths and fall thresholds are calibrated independently in T21 units.
const GROUPS: readonly SlosherGroup[] = [
  { head: true, count: 4, offset: 0, interval: 1, groundSpeed: 32, airSpeed: 30.6,
    speedStep: 3.2, pitch: 5, gravity: 34 },
  { head: false, count: 5, offset: 4, interval: 2, groundSpeed: 20.5, airSpeed: 18.7,
    speedStep: 2.8, pitch: -12, gravity: 31 }
];

export const SLOSHER_DROPLETS = GROUPS.flatMap(group =>
  Array.from({ length: group.count }, (_, index) => ({
    ...group, index, releaseFrame: group.offset + index * group.interval
  }))
);
export type SlosherDroplet = (typeof SLOSHER_DROPLETS)[number];
export const SLOSHER_LIFT_FRAMES = 12;

export function slosherVelocity(aim: Vec3, droplet: SlosherDroplet, grounded: boolean): Vec3 {
  const planar = Math.hypot(aim.x, aim.z);
  const yaw = Math.atan2(aim.x, -aim.z)
    + (droplet.index % 2 === 0 ? -1 : 1) * droplet.index * 0.35 * Math.PI / 180;
  const pitch = Math.atan2(aim.y, planar) +
    (droplet.pitch - droplet.index * (droplet.head ? 0.75 : 1.3)) * Math.PI / 180;
  const speed = (grounded ? droplet.groundSpeed : droplet.airSpeed) - droplet.index * droplet.speedStep;
  return new Vec3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch)).mulScalar(speed);
}

/** Local drag keeps shots aimed above cover from turning into long-range
 * artillery. The initial straight segment and gravity are still swept. */
export function stepSlosherFlight(out: Vec3, velocity: Vec3, droplet: SlosherDroplet,
  age: number, dt: number
): Vec3 {
  if (age < 2) return out.copy(velocity).mulScalar(dt);
  const brake = Math.pow(droplet.head ? 0.951 : 0.91, dt * 60);
  const gravityStep = droplet.gravity * dt;
  velocity.x *= brake;
  velocity.z *= brake;
  velocity.y -= gravityStep;
  out.copy(velocity).mulScalar(dt);
  out.y += gravityStep * dt * 0.5;
  return out;
}

export function aimSlosherHead(origin: Vec3, target: Vec3, lifeSeconds: number): Vec3 {
  const delta = new Vec3().sub2(target, origin);
  const horizontal = Math.hypot(delta.x, delta.z);
  const heading = Math.atan2(delta.x, -delta.z);
  const head = SLOSHER_DROPLETS[0]!;
  const direct = Math.atan2(delta.y, horizontal);
  const velocity = new Vec3();
  const step = new Vec3();
  const heightAt = (angle: number): number => {
    velocity.set(head.groundSpeed * Math.cos(angle), head.groundSpeed * Math.sin(angle), 0);
    let traveled = 0;
    let height = 0;
    for (let age = 0; age < Math.round(lifeSeconds * 60); age++) {
      stepSlosherFlight(step, velocity, head, age, 1 / 60);
      if (traveled + step.x >= horizontal) return height + step.y * (horizontal - traveled) / step.x;
      traveled += step.x;
      height += step.y;
    }
    return -Infinity;
  };
  let low = direct;
  let high = direct;
  if (horizontal > 1e-4) {
    let height = heightAt(high);
    for (let i = 0; i < 8 && height < delta.y; i++) {
      high = Math.min(Math.PI / 2 - 0.01, high + Math.PI / 40);
      height = heightAt(high);
    }
    if (height >= delta.y) {
      for (let i = 0; i < 10; i++) {
        const mid = (low + high) * 0.5;
        if (heightAt(mid) < delta.y) low = mid;
        else high = mid;
      }
    } else high = low;
  }
  const pitch = (low + high) * 0.5 - head.pitch * Math.PI / 180;
  return new Vec3(Math.sin(heading) * Math.cos(pitch), Math.sin(pitch), -Math.cos(heading) * Math.cos(pitch));
}

export function slosherCollision(droplet: SlosherDroplet, age: number) {
  const growth = Math.min(1, age / (droplet.head ? 4 : 5));
  const start = droplet.head ? 0.050 : 0.038;
  const end = droplet.head ? 0.235 - 0.027 * droplet.index : 0.145 - 0.018 * droplet.index;
  const stage = start + (end - start) * growth;
  return { stage, actor: stage + (droplet.head ? 0.026 : 0.016) };
}

export function slosherDamage(droplet: SlosherDroplet, verticalDrop: number): number {
  return droplet.head ? 70 - 20 * rangeProgress(verticalDrop, 0.65, 4.35) : 50;
}

export function slosherPaintBrush(
  droplet: SlosherDroplet, hit: SurfaceRayHit, velocity: Vec3, distance: number, verticalDrop: number
) {
  const first = droplet.head && droplet.index === 0;
  const travel = rangeProgress(distance, 1.2, droplet.head ? 7.5 : 3.6);
  const fall = 1 - 0.30 * rangeProgress(verticalDrop, 0.65, 5.25);
  const width = fall * (first ? 0.95 - 0.17 * travel
    : droplet.head ? 0.35 + 0.10 * travel : 0.26 + 0.04 * travel);
  const wall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
  return {
    centerU: hit.u,
    centerV: hit.v,
    radiusU: width * (wall ? 1.55 : first ? 0.95 : droplet.head ? 1.27 : 1.50),
    radiusV: width * (wall ? 0.73 : 1),
    angle: wall ? Math.atan2(hit.surface.vAxis.y, hit.surface.uAxis.y)
      : Math.atan2(velocity.dot(hit.surface.vAxis), velocity.dot(hit.surface.uAxis))
  };
}

function rangeProgress(value: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}
