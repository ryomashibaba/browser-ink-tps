/** B473: promote only READ-ONLY genuine human-to-CPU native life feedback
 * to the existing playable B207 original SOURCE 180s combat route.
 * B367 shooter-QA and B384 kit circuit remain their established paths.
 * Never creates damage, NPCs, source geometry, routes or Turf scoring. */
export function b473RealSourceCombatLifeReadoutSelected(
 p:Pick<URLSearchParams,'get'>
):boolean{
 return p.get('t21Play')==='preview'&&
  p.get('t21QaDrive')==='source'&&
  p.get('t21W10B112')==='humanGround'&&
  p.get('t21W10B183')==='firstDropPlay'&&
  p.get('t21W10B192')==='humanCombat'&&
  p.get('t21W10B203')==='fullRound'&&
  // The normal physical player route, not deterministic QA or A1 coop.
  p.get('t21QaInput')===null&&p.get('t21W10B193')===null&&
  // Keep shooter-budget and selectable B384 lifecycle gates unchanged.
  p.get('t21W10B343')===null&&
  p.get('t21W10B367')===null&&p.get('t21W10B384')===null;
}
