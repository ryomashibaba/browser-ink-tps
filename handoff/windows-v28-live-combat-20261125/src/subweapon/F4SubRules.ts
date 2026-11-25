
import type { SubWeaponId } from '../weapons/WeaponKitCatalog';

// 720 timing and damage. The outer radii remain the local F4 calibration;
// the original near/far ratios partition that radius, independently of paint.
export const F4_SUB_RECOVERY = 60 / 60;
export const F4_SUB_REPEAT = 30 / 60;
export const F4_SUB = {
  'pulse-bomb': { mode: 'GROUND', frames: 60, near: 180, far: 30, ratio: 3.6 / 7, direct: 0, splashes: 15 },
  'snap-bomb': { mode: 'IMPACT', frames: 0, near: 35, far: 25, ratio: 2.8 / 4, direct: 25, splashes: 10 },
  'anchor-bomb': { mode: 'ATTACHED', frames: 120, near: 180, far: 30, ratio: 4.6 / 8, direct: 0, splashes: 15 },
  'curling-bomb': { mode: 'ROLL', frames: 210, near: 180, far: 30, ratio: 4.6 / 8, direct: 20, splashes: 12 },
  sprinkler: { mode: 'DEVICE', frames: 0, near: 0, far: 0, ratio: 0, direct: 0, splashes: 0 },
  'poison-mist': { mode: 'DEVICE', frames: 300, near: 0, far: 0, ratio: 0, direct: 0, splashes: 0 },
  torpedo: { mode: 'DEVICE', frames: 30, near: 60, far: 35, ratio: 2.6/6, direct: 0, splashes: 0 }
} as const satisfies Record<SubWeaponId, {
  mode: 'GROUND' | 'IMPACT' | 'ATTACHED' | 'ROLL' | 'DEVICE'; frames: number;
  near: number; far: number; ratio: number; direct: number; splashes: number;
}>;

export function advanceF4BombFuse(id: SubWeaponId, elapsed: number, supported: boolean, attached: boolean): number {
  const rule = F4_SUB[id];
  return Math.min(rule.frames, elapsed + Number(
    rule.mode === 'GROUND' && supported || rule.mode === 'ATTACHED' && attached));
}


export function curlingPlan(heldFrames: number) {
  const charge = Math.max(0,Math.min(60,Math.floor(heldFrames)));
  const t = charge / 60;
  // 720 raw radius ratios scaled relative to local Anchor's full radius.
  const outer = 2.65 * (5 + 3*t) / 8;
  return {fuse:210 - 2*charge,recovery:Math.round(70 - 40*t)/60,
    outer,inner:2.65*(1.6 + 3*t)/8,paint:2.55*(2.133 + 2.867*t)/5};
}

export function f4SubRecovery(id: SubWeaponId): number {
  if (id === 'poison-mist') return 75/60;
  if (id === 'torpedo') return 88/60;
  return id === 'curling-bomb' ? curlingPlan(0).recovery : F4_SUB_RECOVERY;
}
