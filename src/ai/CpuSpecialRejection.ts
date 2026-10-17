/**
 * CPU kit request rejection restores the pre-request resources exactly.
 * Pure gameplay accounting only; it does not grant gauge, paint or shots.
 */
export interface CpuSpecialResourceState {
  specialPoints: number;
  specialDecisionCooldownSeconds: number;
  subCooldownSeconds: number;
}
export function restoreRejectedCpuSpecial(
  current: CpuSpecialResourceState,
  previous: Readonly<CpuSpecialResourceState>
): void {
  if (!Object.values(previous).every(v => Number.isFinite(v) && v >= 0)) {
    throw Error('CPU_SPECIAL_INVALID_REJECTION_SNAPSHOT');
  }
  current.specialPoints = previous.specialPoints;
  current.specialDecisionCooldownSeconds = previous.specialDecisionCooldownSeconds;
  current.subCooldownSeconds = previous.subCooldownSeconds;
}
