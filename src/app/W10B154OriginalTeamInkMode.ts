/** B154 explicit source-lab-only coordination mode.
 * Combines independent B64 7CPU ink aim and B150 original A1 ally ink.
 * Never changes normal preview or any production application route. */
export function b154OriginalTeamInkOptIn(params:URLSearchParams):boolean{
 return params.get('t21Play')==='preview'&&
  params.get('t21QaDrive')==='source'&&
  params.get('t21W10B137')==='allyRally'&&
  params.get('t21W10B150')==='allyInk'&&
  params.get('t21W10B154')==='teamCoverage';
}
