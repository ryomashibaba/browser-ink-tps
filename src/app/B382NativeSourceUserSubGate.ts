/** B382: only real SOURCE human 180s combat play gets existing SubWeaponSystem
 * by default. Benchmark SOURCE QAs, deterministic stepping, old T20 and
 * non-source routes preserve their existing explicit opt-in semantics.
 */
export function b382NativeSourceUserSubEnabled(
 p:Pick<URLSearchParams,'get'>
):boolean{
 return p.get('t21Play')==='preview'&&
  p.get('t21QaDrive')==='source'&&
  p.get('t21W10B203')==='fullRound'&&
  p.get('t21W10B192')==='humanCombat'&&
  p.get('t21QaInput')!=='deterministic'&&
  p.get('t21W10B343')===null;
}
