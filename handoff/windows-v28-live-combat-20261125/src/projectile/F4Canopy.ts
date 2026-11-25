import { Entity, Vec3, type AppBase, type StandardMaterial } from 'playcanvas';
import type { Team } from '../ink/types';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import { contactMotion, type ContactMotion } from './F4ContactWeapon';

export const CANOPY_HP = 500;
export const CANOPY_REGEN_FRAMES = 330;
export const CANOPY_OPEN_DELAY = 13;
export const CANOPY_PAID_FRAMES = 107;
export const CANOPY_INK = 30;
export const CANOPY_LIFETIME = 301;
export const CANOPY_HALF = new Vec3(0.86, 0.61, 0.08);

export type CanopyPhase = 'CLOSED' | 'OPEN' | 'BROKEN' | 'PURGED' | 'REGENERATING';

export interface CanopyState {
  owner: string;
  team: Team.A | Team.B;
  entity: Entity;
  phase: CanopyPhase;
  hp: number;
  shotFrame: number | null;
  paidFrames: number;
  paidInk: number;
  regenerateAt: number;
  expiresAt: number;
  center: Vec3;
  forward: Vec3;
  lastContact: Map<string, number>;
}

export interface CanopyHit {
  canopy: CanopyState;
  point: Vec3;
  distance: number;
}

export function canopySolid(canopy: CanopyState): boolean {
  return canopy.hp > 0 && (canopy.phase === 'OPEN' || canopy.phase === 'PURGED');
}

/** Same finite box as the render entity and Rapier stage movement sweep. */
export function canopySegmentDistance(
  from: Vec3, to: Vec3, center: Vec3, forward: Vec3, radius = 0
): number | null {
  const displacement = to.clone().sub(from);
  const length = displacement.length();
  if (length <= 1e-8) return null;
  const start = from.clone().sub(center);
  const right = new Vec3(forward.z, 0, -forward.x);
  const localStart = [start.dot(right), start.y, start.dot(forward)];
  const localDelta = [displacement.dot(right), displacement.y, displacement.dot(forward)];
  const extents = [CANOPY_HALF.x, CANOPY_HALF.y, CANOPY_HALF.z];
  let enter = 0;
  let exit = 1;
  for (let axis = 0; axis < 3; axis++) {
    const extent = extents[axis]! + radius;
    const x = localStart[axis]!;
    const dx = localDelta[axis]!;
    if (Math.abs(dx) < 1e-8) {
      if (Math.abs(x) > extent) return null;
      continue;
    }
    const a = (-extent - x) / dx;
    const b = (extent - x) / dx;
    enter = Math.max(enter, Math.min(a, b));
    exit = Math.min(exit, Math.max(a, b));
    if (enter > exit) return null;
  }
  return enter * length;
}

// Spread angles and sizes are local calibrations. Each ring adds a
// different horizontal and vertical component and distinct paint shape.
export const CANOPY_PELLETS = [
  { group: 0, yaw: 0, pitch: 0, paint: 0.68, mid: true },
  ...Array.from({ length: 6 }, (_, i) => ({
    group: 1, yaw: 6 * Math.cos(i * Math.PI / 3), pitch: 4 * Math.sin(i * Math.PI / 3),
    paint: 0.31, mid: false
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    group: 2, yaw: i % 2 === 0 ? -2 : 2, pitch: i < 2 ? 3 : -3, paint: 0.38, mid: i === 2
  }))
];

export function canopyPelletDirection(aim: Vec3, pellet: (typeof CANOPY_PELLETS)[number]): Vec3 {
  const yaw = Math.atan2(aim.x, -aim.z) + pellet.yaw * Math.PI / 180;
  const pitch = Math.atan2(aim.y, Math.hypot(aim.x, aim.z)) + pellet.pitch * Math.PI / 180;
  return new Vec3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
}

export function canopyPelletDamage(distance: number): number {
  return 16.2 - 5.4 * Math.max(0, Math.min(1, (distance - 2.8) / 6.1));
}

export function cappedCanopyDamage(paid: ReadonlyMap<string, number>, target: string, damage: number): number {
  return Math.min(damage, Math.max(0, 81 - (paid.get(target) ?? 0)));
}

export class F4CanopySystem {
  private readonly owners = new Map<string, CanopyState>();

  public constructor(private readonly app: AppBase, private readonly physics: RapierStagePhysics,
    private readonly material: (team: Team.A | Team.B) => StandardMaterial
  ) {}

  public lookup(owner: string): CanopyState | undefined { return this.owners.get(owner); }

  public equip(owner: string, team: Team.A | Team.B): CanopyState {
    const existing = this.lookup(owner);
    if (existing) return existing;
    const entity = new Entity('Canopy:' + owner);
    entity.addComponent('render', { type: 'box', material: this.material(team),
      castShadows: false, receiveShadows: false });
    entity.enabled = false;
    entity.setLocalScale(CANOPY_HALF.x * 2, CANOPY_HALF.y * 2, CANOPY_HALF.z * 2);
    this.app.root.addChild(entity);
    const state: CanopyState = { owner, team, entity, phase: 'CLOSED', hp: CANOPY_HP,
      shotFrame: null, paidFrames: 0, paidInk: 0, regenerateAt: 0, expiresAt: 0,
      center: new Vec3(), forward: new Vec3(0, 0, -1), lastContact: new Map() };
    this.owners.set(owner, state);
    return state;
  }

  public discard(owner: string): void {
    this.lookup(owner)?.entity.destroy();
    this.owners.delete(owner);
  }

  public reset(): void {
    for (const owner of this.owners.keys()) this.discard(owner);
  }

  public releaseAttached(owner: string): void {
    const canopy = this.lookup(owner);
    if (!canopy) return;
    canopy.shotFrame = null;
    if (canopy.phase === 'OPEN') {
      canopy.phase = 'CLOSED';
      canopy.entity.enabled = false;
    }
  }

  public noteShot(canopy: CanopyState, frame: number): void {
    if (canopy.phase === 'CLOSED') canopy.shotFrame = frame;
  }

  public step(canopy: CanopyState, frame: number, body: Vec3, forward: Vec3, hold: boolean,
    pay: (cost: number, lock: number) => boolean
  ): ContactMotion | null {
    if (canopy.phase === 'BROKEN') canopy.phase = 'REGENERATING';
    if (canopy.phase === 'PURGED' && frame >= canopy.expiresAt) canopy.phase = 'REGENERATING';
    if (canopy.phase === 'REGENERATING' && frame >= canopy.regenerateAt) {
      canopy.phase = 'CLOSED';
      canopy.hp = CANOPY_HP;
      canopy.lastContact.clear();
    }

    let travel: ContactMotion | null = null;
    if (canopy.phase === 'PURGED') {
      travel = this.movePurged(canopy);
    } else if (canopy.phase === 'OPEN' || canopy.phase === 'CLOSED') {
      const open = hold && canopy.shotFrame !== null && frame - canopy.shotFrame >= CANOPY_OPEN_DELAY;
      const placed = open && this.placeAttached(canopy, body, forward, pay, frame);
      if (!placed && (!hold || canopy.phase === 'OPEN')) {
        this.releaseAttached(canopy.owner);
      }
      if (canopy.phase === 'CLOSED') canopy.hp = Math.min(CANOPY_HP, canopy.hp + 2.5);
    }
    this.render(canopy);
    return travel;
  }

  private placeAttached(canopy: CanopyState, body: Vec3, forward: Vec3,
    pay: (cost: number, lock: number) => boolean, frame: number
  ): boolean {
    const from = body.clone().add(new Vec3(0, 0.16, 0));
    const to = from.clone().add(forward.clone().mulScalar(0.88));
    if (this.physics.castStageInkBox(from, to, CANOPY_HALF, forward) !== null) return false;
    if (canopy.phase === 'CLOSED') {
      canopy.paidFrames = 0;
      canopy.paidInk = 0;
    }
    const final = canopy.paidFrames + 1 === CANOPY_PAID_FRAMES;
    const cost = final ? CANOPY_INK - canopy.paidInk : CANOPY_INK / CANOPY_PAID_FRAMES;
    if (!pay(cost, final ? 120 / 60 : 1)) {
      this.releaseAttached(canopy.owner);
      return false;
    }
    canopy.paidFrames++;
    canopy.paidInk += cost;
    canopy.center.copy(to);
    canopy.forward.copy(forward);
    canopy.phase = final ? 'PURGED' : 'OPEN';
    if (final) {
      canopy.shotFrame = null;
      canopy.regenerateAt = frame + CANOPY_REGEN_FRAMES;
      canopy.expiresAt = frame + CANOPY_LIFETIME;
    }
    return true;
  }

  private movePurged(canopy: CanopyState): ContactMotion | null {
    const start = this.support(canopy.center);
    if (!start) return null;
    const next = canopy.center.clone().add(canopy.forward.clone().mulScalar(6.5 / 60));
    const end = this.support(next);
    if (!end || Math.abs(end.y - start.y) > 0.11) return null;
    next.y += end.y - start.y;
    const distance = this.physics.castStageInkBox(canopy.center, next, CANOPY_HALF, canopy.forward);
    if (distance !== null) return null;
    canopy.center.copy(next);
    return contactMotion({ from: start, to: end });
  }

  private support(center: Vec3): Vec3 | null {
    const from = center.clone().add(new Vec3(0, -CANOPY_HALF.y + 0.04, 0));
    const hit = this.physics.castStageSegment(from, from.clone().add(new Vec3(0, -0.95, 0)), 'ink-projectile');
    return hit?.normal && hit.normal.y >= 0.68 ? hit.point : null;
  }

  public coverSnapshot(team: Team.A | Team.B): CanopyState[] {
    return [...this.owners.values()].filter(canopy => canopy.team !== team && canopySolid(canopy));
  }

  public firstHit(from: Vec3, to: Vec3, team: Team.A | Team.B, radius = 0,
    snapshot?: readonly CanopyState[]
  ): CanopyHit | null {
    let closest: CanopyHit | null = null;
    for (const canopy of snapshot ?? this.owners.values()) {
      if (!snapshot && (canopy.team === team || !canopySolid(canopy))) continue;
      const distance = radius > 0
        ? this.physics.castInkSphereAtBox(from,to,radius,canopy.center,CANOPY_HALF,canopy.forward)
        : canopySegmentDistance(from, to, canopy.center, canopy.forward);
      if (distance !== null && (!closest || distance < closest.distance)) {
        const point = from.clone().add(to.clone().sub(from).normalize().mulScalar(distance));
        closest = { canopy, distance, point };
      }
    }
    return closest;
  }

  public hit(canopy: CanopyState, damage: number, frame: number): void {
    if (!canopySolid(canopy)) return;
    canopy.hp = Math.max(0, canopy.hp - damage);
    if (canopy.hp > 0) return;
    if (canopy.phase === 'PURGED') canopy.phase = 'REGENERATING';
    else {
      canopy.phase = 'BROKEN';
      canopy.regenerateAt = frame + CANOPY_REGEN_FRAMES;
    }
    canopy.shotFrame = null;
    this.render(canopy);
  }

  private render(canopy: CanopyState): void {
    canopy.entity.enabled = canopySolid(canopy);
    if (!canopy.entity.enabled) return;
    canopy.entity.setPosition(canopy.center);
    canopy.entity.setLocalEulerAngles(0, Math.atan2(canopy.forward.x, canopy.forward.z) * 180 / Math.PI, 0);
  }
}
