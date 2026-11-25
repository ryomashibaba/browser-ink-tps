type Point = Readonly<{ x: number; y: number; z: number }>;
export type F4InkRelation = 'OWN' | 'NEUTRAL' | 'ENEMY' | 'UNKNOWN';
export function chooseLocalCombatGoal(state: {
  f4: true; alive: true; grounded: true; rejoined: true; localWalkingAllowed: true;
  centerTransferPending: false; respawnPending: false; currentSupport: true;
  foot: Point; hp: number | undefined; ink: number | undefined; weaponClass: string; rangeM: number;
  enemy: { alive: true; visibleNow: true; foot: Point }; inkRelation: F4InkRelation;
}, candidates: ReadonlyArray<{ foot: Point; existingNativePoint: true; localTrafficAllowed: true; inkRelation: F4InkRelation }>,
admit: (foot: Point) => { reached: true; staticSupport: true; trafficAllowed: true; step: Point } | null):
  { mode: 'APPROACH' | 'RETREAT' | 'HOLD_RANGE'; step: Point; checks: number } | null;
