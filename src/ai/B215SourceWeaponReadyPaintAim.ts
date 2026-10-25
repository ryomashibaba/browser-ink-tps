/**
 * B215: skip expensive native owner-grid/paint-raster target scans while the
 * actual CPU main weapon is still cooling down. Real ammo/fire/CPU feet and
 * active SPLATLING burst are untouched. Non-opted-in behavior is unchanged.
 */
export function b215ShouldQueryNativePaintCandidate(x:{
 selectedSourceBattle:boolean;
 actualWeaponFireRemaining:number;
 completingActualSplatlingBurst:boolean;
}):boolean{
 if(!x.selectedSourceBattle)return true;
 // Bad native timing may NOT be used to grant an unverified candidate.
 if(!Number.isFinite(x.actualWeaponFireRemaining))return false;
 return x.actualWeaponFireRemaining<=0||x.completingActualSplatlingBurst;
}
