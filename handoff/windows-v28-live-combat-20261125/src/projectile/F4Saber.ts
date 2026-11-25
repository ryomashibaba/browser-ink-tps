
import { Vec3 } from 'playcanvas';

export function saberPlan(kind: 'HORIZONTAL' | 'CHARGED' | 'LUNGE') {
  const horizontal = kind === 'HORIZONTAL';
  const lunge = kind === 'LUNGE';
  return {
    slashDamage: horizontal ? 15 : 120,
    projectileDamage: horizontal ? 30 : 60,
    slashStartF: lunge ? 14 : 3,
    slashAliveF: 4,
    projectileStartF: lunge ? 17 : 6,
    collisionOffsetsRaw: horizontal ? [[-.7, 0, -.2], [0, 0, 0], [.7, 0, -.2]]
      : Array.from({ length: 7 }, (_, i) => [0, 1.2 - .4 * i, -.3 + .1 * i]),
    collisionRadiiRaw: horizontal ? [.25, .3, .25] : [.3, .35, .45, .5, .45, .35, .3],
    splashIntervalRaw: horizontal ? 2 : 1.5,
    splashMax: horizontal ? 8 : 14,
    burstPaintRadiusRaw: horizontal ? 2.2 : 3
  };
}

// The ledger is scoped to a single component of a single swing. A 4-frame
// slash and the following independent wave never share exclusions.
export function acceptSaberComponent(ledger: Set<string>, targetLifeId: string, component: 'SLASH' | 'WAVE') {
  const key = JSON.stringify([targetLifeId, component]);
  if (ledger.has(key)) return false;
  ledger.add(key);
  return true;
}

export function saberSweep(plan: ReturnType<typeof saberPlan>, aim: Vec3, horizontalPaintRadius: number, slash: boolean) {
  // Preserve the existing F4 horizontal impact radius and map handoff ratios
  // relative to its existing local paint footprint, rather than raw metres.
  const scale = horizontalPaintRadius / 2.2;
  const right = new Vec3().cross(aim, Vec3.UP);
  if (right.lengthSq() < 1e-8) right.copy(Vec3.RIGHT);
  right.normalize();
  const up = new Vec3().cross(right, aim).normalize();
  if (slash) return [{ offset: new Vec3(), radius: scale * 0.75 }];
  return plan.collisionOffsetsRaw.map(([x, y, z], i) => ({
    offset: right.clone().mulScalar(x! * scale)
      .add(up.clone().mulScalar(y! * scale)).add(aim.clone().mulScalar(z! * scale)),
    radius: plan.collisionRadiiRaw[i]! * scale
  }));
}

