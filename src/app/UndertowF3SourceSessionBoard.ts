/**
 * W10-B58: user-facing read-only summary of the genuine F3 180s source lab.
 * This is NOT an original Turf score, team ranking or a source-authorized
 * opposing-team 4v4 contact claim. Zero gameplay writes.
 */
export interface SourceSessionMetrics {
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 timeRemainingSeconds:number;
 tick:number;
 originalSourceSolids:number;
 originalPaintSurfaces:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified:boolean;
 cpu:{physicalRejoins:readonly string[]};
 b23HumanInkFeedback:{
  humanChangedCells:number;humanChangedImpactCount:number;
 };
 shotsFired:number;
 cpuSourceTurfShots:number;
 cpuImpactInkCellsChanged:number;
 cpuSplats:number;
 humanSplats:number;
 humanRespawns:number;
 stopReason:string|null;
}
export function sourceSessionSummary(s:SourceSessionMetrics){
 if(s.originalSourceSolids!==25||s.originalPaintSurfaces!==17||
    s.originalSourceNavigationLinks!==26||
    s.sourceScoreablePromotions!==0||s.productionAuthorized!==false||
    s.unrestricted4v4Certified!==false)
  throw Error('W10_B58_SOURCE_AUTHORITY_GATE');
 const counts=[s.tick,s.shotsFired,s.cpuSourceTurfShots,
   s.cpuImpactInkCellsChanged,s.b23HumanInkFeedback.humanChangedCells,
   s.b23HumanInkFeedback.humanChangedImpactCount,s.cpuSplats,
   s.humanSplats,s.humanRespawns];
 if(counts.some(n=>!Number.isSafeInteger(n)||n<0)||
    !Number.isFinite(s.timeRemainingSeconds)||s.timeRemainingSeconds<0||
    s.timeRemainingSeconds>180.01||
    s.cpu.physicalRejoins.length>7||
    new Set(s.cpu.physicalRejoins).size!==s.cpu.physicalRejoins.length)
  throw Error('W10_B58_INVALID_NATIVE_SESSION_VALUES');
 const done=s.matchState==='TIME_UP'&&!s.stopReason;
 return {
  state:s.stopReason?'SAFE_STOP' as const:
   done?'COMPLETE' as const:s.matchState,
  finished:done,
  headline:s.stopReason?'SOURCE SAFETY STOP':
   done?'SOURCE SESSION FINISHED':s.matchState==='PLAYING'?
    'LIVE SOURCE-LOCAL PLAY':'SOURCE-STAGED ENTRY',
  result:'NO OFFICIAL TURF RESULT' as const,
  timeRemainingSeconds:Number(s.timeRemainingSeconds.toFixed(2)),
  genuineHumanShots:s.shotsFired,
  realHumanImpactInkCells:s.b23HumanInkFeedback.humanChangedCells,
  actualHumanImpactEvents:s.b23HumanInkFeedback.humanChangedImpactCount,
  actualCpuSourceShots:s.cpuSourceTurfShots,
  actualCpuImpactInkCells:s.cpuImpactInkCellsChanged,
  actualCpuSplats:s.cpuSplats,
  actualHumanSplats:s.humanSplats,
  actualHumanRespawns:s.humanRespawns,
  cpuPhysicallyRejoined:s.cpu.physicalRejoins.length,
  sourcePaintableSurfaces:17 as const,
  officialScoreableSurfaces:0 as const,
  officialWinner:'NONE' as const,
  matchVictoryCertified:false as const,
  naturallyConnectedOpposingPathsCertified:0 as const,
  productionAuthorized:false as const,
  source:'NATIVE_RAPIER_GAMEPLAY_INK_AND_SEVEN_CPU' as const
 };
}

export function createF3SourceSessionBoard(
 ui:HTMLElement,onRestart:()=>void
){
 const root=document.createElement('section');
 root.id='t21-f3-b58-source-session';
 root.setAttribute('aria-label','Read-only original-source session activities, no Turf score');
 root.dataset.scoreable='0';
 root.dataset.productionAuthority='NONE';
 root.style.cssText='position:fixed;bottom:72px;left:16px;z-index:38;'+
  'width:min(260px,calc(100vw - 32px));box-sizing:border-box;'+
  'padding:11px 13px;border:1px solid #478d9e;border-radius:12px;'+
  'background:linear-gradient(140deg,rgba(3,24,36,.91),rgba(13,37,48,.93));'+
  'box-shadow:0 8px 28px #0009;color:#e7faff;'+
  'font:600 11px/1.5 system-ui,sans-serif;'+
  'font-variant-numeric:tabular-nums;pointer-events:none';
 root.innerHTML=
  '<div id="t21-f3-b58-title" style="color:#94eff2;letter-spacing:.6px;'+
   'font-weight:850">SOURCE SESSION · STAGING</div>'+
  '<div style="font-size:10px;color:#ffcb94;margin:4px 0">'+
   'NON-SCORING · SINCE PAGE LOAD · NOT A 4V4 RESULT</div>'+
  '<div id="t21-f3-b58-counts" style="white-space:pre-line;margin-top:6px"></div>'+
  '<button id="t21-f3-b58-restart" hidden type="button" style="'+
   'background:#51d9e0;color:#08202c;border:0;border-radius:7px;'+
   'width:100%;margin-top:8px;padding:8px;font:800 11px system-ui;'+
   'cursor:pointer;pointer-events:auto">RESTART SOURCE SESSION (R)</button>';
 const title=root.querySelector<HTMLElement>('#t21-f3-b58-title')!;
 const counts=root.querySelector<HTMLElement>('#t21-f3-b58-counts')!;
 const restart=root.querySelector<HTMLButtonElement>('#t21-f3-b58-restart')!;
 restart.addEventListener('click',onRestart);
 ui.appendChild(root);
 const render=(s:SourceSessionMetrics)=>{
  const v=sourceSessionSummary(s);
  title.textContent=v.headline;
  counts.textContent='HUMAN · '+v.genuineHumanShots+' real shots / '+
   v.realHumanImpactInkCells+' changed impact cells\n'+
   'CPU · '+v.cpuPhysicallyRejoined+'/7 source rejoined / '+
   v.actualCpuSourceShots+' source shots / '+
   v.actualCpuImpactInkCells+' changed impact cells\n'+
   'SPLATS · human '+v.actualHumanSplats+' / CPU '+v.actualCpuSplats+
   ' · human returns '+v.actualHumanRespawns;
  restart.hidden=!v.finished;
  root.style.pointerEvents=v.finished?'auto':'none';
  root.dataset.t21B58State=v.state;
  root.dataset.t21B58HumanShotCount=String(v.genuineHumanShots);
  root.dataset.t21B58HumanChangedInk=String(v.realHumanImpactInkCells);
  root.dataset.t21B58CpuChangedInk=String(v.actualCpuImpactInkCells);
  root.dataset.t21B58CpuRejoined=String(v.cpuPhysicallyRejoined);
  root.dataset.t21B58OfficialWinner=v.officialWinner;
  root.dataset.t21B58OriginalScoreable='0';
  return v;
 };
 return {root,render};
}
