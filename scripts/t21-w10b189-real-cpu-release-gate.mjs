/**
 * B189: real seven CPU source-first-drop/rejoin gate for B187 Chrome.
 * Consumes ONLY existing UndertowF3SourceTraffic.snapshot() fields;
 * never invents counters, actors, original route connectivity or time.
 */
export const EXPECTED_ORIGINAL_SOURCE_CPU_IDS=Object.freeze([
 'A1','A2','A3','B1','B2','B3','B4'
]);
export function b189RealSevenCpuSourceRelease(s){
 const t=s?.cpu;
 const ids=EXPECTED_ORIGINAL_SOURCE_CPU_IDS;
 if(s?.matchState!=='PLAYING'||s?.paused===true||s?.stopReason||
    !t||t.freeCombatEnabled!==true||
    t.productionAuthorized!==false||
    t.physicalFootRelocations!==0||
    !Array.isArray(t.cpu)||t.cpu.length!==ids.length||
    !Array.isArray(t.physicalRejoins)||
    t.physicalRejoins.length!==ids.length||
    new Set(t.physicalRejoins).size!==ids.length||
    !ids.every(id=>t.physicalRejoins.includes(id))||
    new Set(t.cpu.map(a=>a?.id)).size!==ids.length||
    !ids.every(id=>t.cpu.some(a=>
      a?.id===id&&a.rejoined===true&&a.released===true&&
      Array.isArray(a.physicalFoot)&&a.physicalFoot.length===3&&
      a.physicalFoot.every(Number.isFinite))))
  return null;
 return Object.freeze({
  nativeMatchState:'PLAYING',
  actualNativeCpuRejoined:ids.length,
  physicallyRejoinedCpuIds:[...t.physicalRejoins],
  sourceCpuInGame:true,
  actorsRelocatedByTest:0,
  sourceNavLinksAdded:0,
  scoreableSourceSurfacesAdded:0,
  notCrossTeamRouteCertificate:true
 });
}
