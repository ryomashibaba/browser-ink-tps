import { Vec3 } from 'playcanvas';
import { sourceRegisteredPaintCellActive, type PaintSurface, type SurfaceRayHit } from '../ink/PaintSurface';
import { SurfaceFlags } from '../ink/types';
import type { RapierStagePhysics, StageRayHit } from '../physics/RapierStagePhysics';
import type { ContactWeaponProfile } from '../weapons/WeaponCatalog';

export interface GroundTravel {
  from: Vec3;
  to: Vec3;
}

export interface ContactMotion extends GroundTravel {
  forward: Vec3;
  lateral: Vec3;
  distance: number;
}

export function brushSwingPhase(ordinal: number): { yaw: number; foot: boolean } {
  return { yaw: ordinal % 2 === 1 ? -10 : 10, foot: ordinal % 6 === 2 };
}

export function contactMoveMultiplier(profile: ContactWeaponProfile, frames: number): number {
  const progress = profile.rollAccelerationFrames === 0
    ? 1 : Math.min(1, frames / profile.rollAccelerationFrames);
  return mix(profile.moveMultiplier, progress);
}

export function contactPaintSettings(profile: ContactWeaponProfile, speed: number) {
  // Normalize measured KCC speed in the local movement scale.
  const progress = Math.min(1, Math.max(0, (speed - 0.35) / 4.8));
  return { halfWidth: mix(profile.rollHalfWidth, progress), ink: mix(profile.rollInk, progress) };
}

function mix(range: readonly [number, number], fraction: number): number {
  return range[0] + (range[1] - range[0]) * fraction;
}

export function contactMotion(travel: GroundTravel): ContactMotion | null {
  const delta = new Vec3().sub2(travel.to, travel.from);
  const distance = Math.hypot(delta.x, delta.z);
  // The 60 Hz step must be continuous ground travel. Reject stationary,
  // discontinuous/teleport steps and large snaps between levels.
  if (!(distance >= 0.004 && distance <= 0.19) || !(Math.abs(delta.y) <= 0.13)) return null;
  const forward = new Vec3(delta.x / distance, 0, delta.z / distance);
  return { ...travel, forward, distance, lateral: new Vec3(-forward.z, 0, forward.x) };
}

export function collectContactPaint(
  motion: ContactMotion, halfWidth: number,
  physics: RapierStagePhysics, surfaces: readonly PaintSurface[]
): SurfaceRayHit[] | null {
  const start = supportAt(physics, motion.from);
  const end = supportAt(physics, motion.to);
  const middle = supportAt(physics, motion.from.clone().lerp(motion.from, motion.to, 0.5));
  if (!start || !end || !middle ||
      !clearStrip(physics, start.point, middle.point) ||
      !clearStrip(physics, middle.point, end.point)) return null;

  const support = [start, middle, end];
  const cells: SurfaceRayHit[] = [];
  const tested = new Set<string>();
  const lateralSteps = Math.ceil(halfWidth / 0.10);
  for (const anchor of support) {
    for (let side = -lateralSteps; side <= lateralSteps; side++) {
      const candidate = anchor.point.clone().add(
        motion.lateral.clone().mulScalar(side * halfWidth / lateralSteps)
      );
      const hit = supportAt(physics, onSupportSlope(anchor, candidate));
      const paint = hit && physics.f4PaintAtStageHit(hit, surfaces);
      if (!paint || (paint.surface.baseFlags & SurfaceFlags.Wall) !== 0) continue;

      const cellSize = paint.surface.cellSize;
      const x = Math.floor(paint.u / cellSize);
      const y = Math.floor(paint.v / cellSize);
      const key = `${paint.surface.id}:${x}:${y}`;
      if (tested.has(key)) continue;
      const u = (x + 0.5) * cellSize;
      const v = (y + 0.5) * cellSize;
      if (!sourceRegisteredPaintCellActive(paint.surface, u, v)) continue;
      const center = paint.surface.localToWorld(u, v);
      const relative = center.clone().sub(motion.from);
      const along = relative.dot(motion.forward);
      if (along < -0.13 || along > motion.distance + 0.13 ||
          Math.abs(relative.dot(motion.lateral)) > halfWidth) continue;
      // Validate the cell's own center against the closest point along the
      // accepted path, so the paint cannot wrap around a wall at a turn.
      const base = support[along < motion.distance * 0.25 ? 0 :
        along > motion.distance * 0.75 ? 2 : 1]!;
      const predicted = onSupportSlope(base, center);
      if (Math.abs(center.y - predicted.y) > 0.11) continue;
      const centerHit = supportAt(physics, predicted);
      if (!centerHit || !clearStrip(physics, base.point, centerHit.point)) continue;
      const centerPaint = physics.f4PaintAtStageHit(centerHit, surfaces);
      if (centerPaint?.surface !== paint.surface ||
          Math.abs(centerHit.point.y - center.y) > 0.065) continue;
      tested.add(key);
      cells.push({ ...centerPaint, u, v });
    }
  }
  return cells;
}

function onSupportSlope(anchor: StageRayHit, point: Vec3): Vec3 {
  const normal = anchor.normal!;
  return new Vec3(point.x, anchor.point.y -
    (normal.x * (point.x - anchor.point.x) + normal.z * (point.z - anchor.point.z)) /
      normal.y, point.z);
}

function supportAt(physics: RapierStagePhysics, foot: Vec3): StageRayHit | null {
  const hit = physics.castStageSegment(
    new Vec3(foot.x, foot.y + 0.18, foot.z),
    new Vec3(foot.x, foot.y - 0.14, foot.z), 'ink-projectile'
  );
  return hit?.normal && hit.normal.y >= 0.65 && Math.abs(hit.point.y - foot.y) <= 0.11
    ? hit : null;
}

function clearStrip(physics: RapierStagePhysics, from: Vec3, to: Vec3): boolean {
  return !physics.castStageSegment(
    new Vec3(from.x, from.y + 0.09, from.z),
    new Vec3(to.x, to.y + 0.09, to.z), 'ink-projectile'
  );
}
