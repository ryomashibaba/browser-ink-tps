/** B477 user-visible *actual* original seven-CPU first-drop progress.
 * Only the already selected B475 SOURCE original frontline challenge.
 * Never turns a roster label, count, UI cue or 6/7 into a start,
 * collision path, hit, score, player movement or Turf certification. */
export const B477_ORIGINAL_CPU_IDS=['A1','A2','A3','B1','B2','B3','B4'] as const;
export function b477ActualSourceCpuJoinCue(x:{
 selected:boolean;stage:readonly number[];nativeTick:number;
 matchState:string;practiceStatus:string;stopReason:string|null;
 physicallyRejoined:readonly string[];
}):{readonly joined:number;readonly missing:readonly string[];
 readonly label:string;readonly physicalSourceOnly:true;
 readonly simulationWrites:0;readonly officialWinner:'NONE'}|null{
 if(!x.selected||x.stage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    x.matchState!=='STAGING'||x.practiceStatus!=='ARMED'||
    x.stopReason!==null||!Array.isArray(x.physicallyRejoined)||
    x.physicallyRejoined.length>7||
    new Set(x.physicallyRejoined).size!==x.physicallyRejoined.length||
    x.physicallyRejoined.some(id=>
     !(B477_ORIGINAL_CPU_IDS as readonly string[]).includes(id)))
  return null;
 const missing=B477_ORIGINAL_CPU_IDS.filter(id=>
  !x.physicallyRejoined.includes(id));
 const joined=x.physicallyRejoined.length;
 return {
  joined,missing,
  label:'REAL ORIGINAL CPU REJOIN '+joined+'/7 · '+
   'SOURCE PRACTICE ARMED · '+(missing.length?
    'WAIT FOR PHYSICAL START':'WAIT FOR TRUE NATIVE PLAYING')+
   '\nNO EARLY MISSION CLOCK · UNSCORED',
  physicalSourceOnly:true,simulationWrites:0,officialWinner:'NONE'
 };
}
