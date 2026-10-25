/** B214: only the real B207 user-selected 180s source combat may
 * use B64 source aim + B178 native ink economy + B180 unpainted patches.
 * All three systems independently enforce the frozen original source.
 */
export function b214EligibleSourceBattleInk(p:URLSearchParams):boolean{
 return p.get('t21Play')==='preview'&&
  p.get('t21QaDrive')==='source'&&
  p.get('t21W10B183')==='firstDropPlay'&&
  p.get('t21W10B192')==='humanCombat'&&
  p.get('t21W10B112')==='humanGround'&&
  p.get('t21W10B203')==='fullRound'&&
  p.get('t21W10B193')===null;
}
