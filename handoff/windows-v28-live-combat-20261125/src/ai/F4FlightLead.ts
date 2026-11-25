
import { Vec3 } from 'playcanvas';

export function predictF4Lead(muzzle: Vec3, body: Vec3, previousBody: Vec3,
  deltaTicks: number, maxRangeMeters: number,
  solveFlightTicks: (point: Vec3) => number | null,
  isClear: (from: Vec3, to: Vec3) => boolean): Vec3 | null {
  if (!Number.isInteger(deltaTicks) || deltaTicks < 1 || deltaTicks > 3 ||
      ![muzzle,body,previousBody].every(p=>[p.x,p.y,p.z].every(Number.isFinite))) return null;
  const velocity = body.clone().sub(previousBody).mulScalar(1 / deltaTicks);
  const speed = Math.hypot(velocity.x,velocity.z) * 60;
  if (speed < .2 || speed > 12 || Math.abs(velocity.y) > .12) return null;
  velocity.y = 0;
  const inRange = (p: Vec3) => Math.hypot(p.x-muzzle.x,p.z-muzzle.z) <= maxRangeMeters;
  if (!inRange(body) || !isClear(muzzle,body)) return null;
  let aim = body;
  for (let i=0;i<4;i++) {
    const ticks = solveFlightTicks(aim);
    if (ticks === null || !Number.isFinite(ticks) || ticks <= 0 || ticks > 45) return null;
    const move = velocity.clone().mulScalar(ticks);
    if (move.length() > 2.5) return null;
    const next = body.clone().add(move);
    if (!inRange(next)) return null;
    if (next.distance(aim) <= .025) return isClear(muzzle,next) ? next : null;
    aim = next;
  }
  return null;
}

/** Arrival in the vertical window of a living actor, before physical lifetime ends. */
export function f4FlightArrivalTicks(origin: Vec3, target: Vec3, life: number,
  step: (frame: number) => Vec3): number | null {
  const dx = target.x-origin.x, dz = target.z-origin.z;
  const length = Math.hypot(dx,dz);
  if (length < 1e-5) return null;
  const pos = origin.clone();
  let distance = 0;
  for (let frame=0;frame<Math.min(45,Math.ceil(life*60));frame++) {
    const move = step(frame);
    const forward = (move.x*dx+move.z*dz)/length;
    if (forward <= 0) return null;
    if (distance+forward >= length) {
      const fraction = (length-distance)/forward;
      const segmentTime = frame + fraction;
      if (segmentTime > life*60) return null;
      const height = pos.y + move.y*fraction;
      return Math.abs(target.y-height) <= .45 ? segmentTime : null;
    }
    distance += forward;
    pos.add(move);
  }
  return null;
}

