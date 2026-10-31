/** Human-only SOURCE 180s startup loadout. A genuine pregame select
 * changes ONLY the already implemented physical ProjectileSystem weapon.
 * No claim of Nintendo-original weapon parameter equivalence is implied.
 */
import {WEAPON_ORDER,type WeaponId} from '../weapons/WeaponCatalog';
export interface B378SourcePracticeSelection{
 readonly requestedId:string;
 readonly fullSource180Seconds:boolean;
 readonly firstPointerAlreadyLocked:boolean;
 readonly realPointerLocked:boolean;
 readonly matchState:string;
 readonly stopReason:string|null;
 readonly sourceShooterBenchmark:boolean;
}
export function eligibleB378SourcePracticeWeapon(
 input:B378SourcePracticeSelection
):WeaponId|null{
 if(!input.fullSource180Seconds||input.sourceShooterBenchmark||
    input.firstPointerAlreadyLocked||input.realPointerLocked||
    input.matchState!=='STAGING'||input.stopReason||
    !WEAPON_ORDER.includes(input.requestedId as WeaponId))return null;
 return input.requestedId as WeaponId;
}
