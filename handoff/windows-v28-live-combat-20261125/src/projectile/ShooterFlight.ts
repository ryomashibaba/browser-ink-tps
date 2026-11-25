import { Vec3 } from 'playcanvas';
import type { SurfaceRayHit } from '../ink/PaintSurface';
import type { ShooterProfile, StagedFlightProfile, WeaponProfile } from '../weapons/WeaponCatalog';

export const SHOOTER_HZ = 60;

export interface ShooterFlight {
  frame: number;
  free: boolean;
}

// Straight, then brake, then free fall. These are the shared defaults of
// the reference shooters. Velocities in ProjectileSystem are meters/sec.
export function advanceShooterVelocity(
  velocity: Vec3, flight: ShooterFlight,
  profile: StagedFlightProfile
): void {
  const frame = flight.frame++;
  if (frame < profile.straightFrames) return;
  if (frame === profile.straightFrames) {
    const speed = velocity.length();
    if (speed > profile.brakeSpeedMetersPerSecond) {
      velocity.mulScalar(profile.brakeSpeedMetersPerSecond / speed);
    }
  }
  if (profile.coast) {
    velocity.mulScalar(profile.coast.retainPerFrame);
    velocity.y -= profile.coast.gravityMetersPerSecond2 / SHOOTER_HZ;
    return;
  }
  if (flight.free) {
    velocity.mulScalar(0.98);
    velocity.y -= 0.016 * SHOOTER_HZ;
  } else {
    velocity.mulScalar(0.64);
    velocity.y -= 0.07 * SHOOTER_HZ;
    flight.free = velocity.y <= -0.15 * SHOOTER_HZ &&
      Math.hypot(velocity.x, velocity.z) <= 0.2355 * SHOOTER_HZ;
  }
}

/** Solve the low trajectory for the same discrete flight used by the sweep. */
export function aimShooter(
  origin: Vec3, target: Vec3, out: Vec3, weapon: WeaponProfile, profile: StagedFlightProfile & { combatRangeMeters: number }
): Vec3 {
  const direct = out.sub2(target, origin);
  const horizontal = Math.hypot(direct.x, direct.z);
  const speed = weapon.speedMetersPerSecond;
  if (horizontal <= 1e-5 ||
      direct.length() * SHOOTER_HZ <= speed * profile.straightFrames ||
      horizontal > profile.combatRangeMeters + 3) {
    return direct.lengthSq() > 1e-8 ? direct.normalize() : direct.set(0, 0, -1);
  }

  const dx = direct.x / horizontal;
  const dz = direct.z / horizontal;
  const height = direct.y;
  const velocity = new Vec3();
  const maxFrames = Math.round(weapon.lifeSeconds * SHOOTER_HZ);
  const heightAtTarget = (pitch: number): number => {
    velocity.set(Math.cos(pitch) * speed, Math.sin(pitch) * speed, 0);
    const flight: ShooterFlight = { frame: 0, free: false };
    let distance = 0;
    let y = 0;
    while (flight.frame < maxFrames && distance < horizontal) {
      advanceShooterVelocity(velocity, flight, profile);
      if (velocity.x <= 1e-8) return -Infinity;
      const step = Math.min(1 / SHOOTER_HZ, (horizontal - distance) / velocity.x);
      distance += velocity.x * step;
      y += velocity.y * step;
    }
    return distance + 1e-6 >= horizontal ? y : -Infinity;
  };

  let low = Math.atan2(height, horizontal);
  let high = low;
  // A steep, long lob is not a substitute for the crosshair's low solution.
  for (let i = 0; i < 8 && heightAtTarget(high) < height; i++) {
    high = Math.min(Math.PI / 2 - 1e-5, high + Math.PI / 48);
  }
  if (heightAtTarget(high) < height) return direct.normalize();
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) * 0.5;
    if (heightAtTarget(mid) < height) low = mid;
    else high = mid;
  }
  const pitch = (low + high) * 0.5;
  return out.set(dx * Math.cos(pitch), Math.sin(pitch), dz * Math.cos(pitch));
}

export function shooterPaintPattern(profile: ShooterProfile, shot: number) {
  const cycle = profile.splashPhaseOrder.length;
  const phase = (shot - 1) % cycle;
  // Keep fractional carry across pattern wraps and pauses. A canceled shot
  // never obtains an ordinal. Phase offset within the spacing is provisional.
  const count = Math.floor(shot * profile.splashesPerShot + 1e-8) -
    Math.floor((shot - 1) * profile.splashesPerShot + 1e-8);
  return {
    foot: (!profile.suppressCycleEndFoot && phase + 1 === cycle) ||
      profile.extraFootShots.includes(phase + 1),
    count,
    firstDistance: profile.splashStart + profile.splashPhaseOrder[phase]! / cycle * profile.splashSpacing
  };
}

export function shooterImpactBrush(
  hit: SurfaceRayHit, velocity: Vec3, distance: number, profile: ShooterProfile
) {
  const [start, end] = distance <= profile.impactMiddle[0]
    ? [profile.impactNear, profile.impactMiddle]
    : [profile.impactMiddle, profile.impactFar];
  const t = Math.max(0, Math.min(1, (distance - start[0]) / (end[0] - start[0])));
  const radius = start[1] + (end[1] - start[1]) * t;
  const speed = velocity.length();
  const direction = velocity.clone().normalize();
  const u = direction.dot(hit.surface.uAxis);
  const v = direction.dot(hit.surface.vAxis);
  const tangency = Math.min(1, Math.hypot(u, v));
  const angle = Math.atan2(v, u);
  // Shallow impacts stretch forward and contract across the shot. Preserve
  // the base area during that redistribution. The speed curve is local.
  const momentum = Math.min(1, speed / profile.brakeSpeedMetersPerSecond);
  const aspect = Math.sqrt(1 + (profile.impactStretch - 1) * tangency ** 2 * momentum);
  const radiusAlong = radius * aspect;
  const advance = (radiusAlong - radius) * 0.5;
  return {
    centerU: hit.u + Math.cos(angle) * advance,
    centerV: hit.v + Math.sin(angle) * advance,
    radiusU: radiusAlong,
    radiusV: radius / aspect,
    angle
  };
}

export function shooterSplashBrush(
  hit: SurfaceRayHit, from: Vec3, forward: Vec3, profile: Pick<ShooterProfile, 'splashRadius'>
) {
  const dropHeight = Math.max(0, from.y - hit.worldPoint.y);
  const u = forward.dot(hit.surface.uAxis);
  const v = forward.dot(hit.surface.vAxis);
  // Map the reference drop-height interval (3–10 m) to a modest near-drop
  // stretch. Vertical wall hits retain the same center and base area.
  const depth = 1 + Math.min(1, Math.hypot(u, v)) * 0.25 *
    Math.max(0, Math.min(1, (10 - dropHeight) / 7));
  return {
    radiusU: profile.splashRadius * depth,
    radiusV: profile.splashRadius / depth,
    angle: Math.atan2(v, u)
  };
}

export function shooterDamageAtFrame(maxDamage: number, frame: number, profile: ShooterProfile): number {
  const [start, end] = profile.damageFalloffFrames;
  const progress = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return maxDamage * (1 - 0.5 * progress);
}

export function shooterYawDegrees(
  spreadDegrees: number, bias: number, actor: string, ordinal: number
): number {
  if (spreadDegrees === 0) return 0;
  let seed = ordinal;
  for (let i = 0; i < actor.length; i++) seed = Math.imul(seed, 31) + actor.charCodeAt(i);
  seed = Math.imul(seed ^ (seed >>> 16), 0x7feb352d);
  seed = Math.imul(seed ^ (seed >>> 15), 0x846ca68b);
  const sample = ((seed ^ (seed >>> 16)) >>> 0) / 0x100000000 * 2 - 1;
  return Math.sign(sample) * spreadDegrees * Math.abs(sample) ** (Math.log(bias) / Math.log(0.5));
}
