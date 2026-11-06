/** B474: bounded original-source native Crowd reissue reduction.
 * Only the explicitly selected B441 frontline research game (or the
 * same original B441 real-Chromium A1-coop test) may enable this.
 * No new goals, paths, colliders, score, actors, or combat authority. */
export function b474OriginalFrontSteeringRefreshSelected(
 p:Pick<URLSearchParams,'get'>
):boolean{
 const game=p.get('t21W10B192')==='humanCombat'&&
  p.get('t21W10B193')===null;
 const qaWitness=p.get('t21W10B193')==='allyCoop'&&
  p.get('t21W10B192')===null;
 return p.get('t21Play')==='preview'&&
  p.get('t21QaDrive')==='source'&&
  p.get('t21W10B203')==='fullRound'&&
  p.get('t21W10B441')==='sourceFrontline'&&
  (game||qaWitness)&&p.get('t21QaInput')===null&&
  p.get('t21W10B343')===null;
}
