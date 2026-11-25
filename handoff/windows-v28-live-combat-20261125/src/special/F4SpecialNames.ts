import type { WeaponId } from '../weapons/WeaponCatalog';
import { KIT720, type F4SpecialId } from './f4/shared-special-score720-20261125/shared-special-score720.mjs';

const displayNames: Record<F4SpecialId, string> = {
  ultraShot: 'ウルトラショット', chariot: 'カニタンク', blower: 'キューインキ',
  superHook: 'ショクワンダー', greatBarrier: 'グレートバリア', microLaser: 'メガホンレーザー',
  tripleTornado: 'トリプルトルネード', waveBreaker: 'ホップソナー', ultraStamp: 'ウルトラハンコ'
};

export function f4SpecialName(weaponId: WeaponId): string {
  return displayNames[KIT720[weaponId].special];
}
