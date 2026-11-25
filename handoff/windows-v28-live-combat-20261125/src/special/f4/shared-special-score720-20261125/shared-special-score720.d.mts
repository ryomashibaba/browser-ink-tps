export type F4SpecialId = 'ultraShot' | 'chariot' | 'blower' | 'superHook' | 'greatBarrier' |
  'microLaser' | 'tripleTornado' | 'waveBreaker' | 'ultraStamp';
export const KIT720: Readonly<Record<import('../../../weapons/WeaponCatalog').WeaponId,
  { special: F4SpecialId; required: number }>>;
export class CertifiedTurf720 {
  constructor(options: { roundId: string });
  readonly complete: boolean;
  result(frame: { roundId: string; tick: number; roundEnded: boolean }):
    { status: 'HOLD' | 'READY'; reason: string | null; winner: 'NONE' | 'A' | 'B' };
}
