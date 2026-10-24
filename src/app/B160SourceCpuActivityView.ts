/** B160 — UI-only, original F3 seven-CPU *actual paint* contribution.
 * Separate game activity, never a Turf result or a fabricated opponent win.
 * Source is PaintCoordinator's accepted changed-cell attribution (B154).
 */
const actorIds=['A1','A2','A3','B1','B2','B3','B4'] as const;
type ActorId=typeof actorIds[number];
export interface B160OriginalCpuInkSource{
 source:string;sourceOnly:boolean;
 excludesUnexecutedCpuShotRequests:boolean;
 originalScoreablePromotions:number;
 normalPreviewDefaultChanged:boolean;productionAuthorized:boolean;
 teamAChangedCells:number;teamBChangedCells:number;
 byActor:Record<ActorId,{
  stampEvents:number;changedCells:number;impactEvents:number;
  impactChangedCells:number;footChangedCells:number
 }>;
}
export interface B160CpuActivityRecap{
 actors:readonly {id:ActorId;cells:number;impactCells:number}[];
 teamA:number;teamB:number;total:number;paintingActors:number;
 realSource:'ACCEPTED_NATIVE_PAINT_COORDINATOR_CHANGES';
 teamWinner:'NONE';uniqueTurfArea:false;
 officialScoreableCells:0;original4v4Certified:false;
}
export function summarizeB160CpuActivity(s:B160OriginalCpuInkSource):
 B160CpuActivityRecap{
 if(!s||s.source!=='REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'||
    s.sourceOnly!==true||
    s.excludesUnexecutedCpuShotRequests!==true||
    s.originalScoreablePromotions!==0||
    s.normalPreviewDefaultChanged!==false||
    s.productionAuthorized!==false||
    JSON.stringify(Object.keys(s.byActor??{}).sort())!==
     JSON.stringify([...actorIds].sort()))
  throw Error('B160_NATIVE_SOURCE_UNSCORABLE_REQUIRED');
 const nonNegative=(n:number)=>Number.isSafeInteger(n)&&n>=0;
 const actors=actorIds.map(id=>{
  const v=s.byActor[id];
  if(!v||![v.changedCells,v.impactChangedCells,
    v.stampEvents,v.impactEvents,v.footChangedCells].every(nonNegative)||
    v.impactChangedCells>v.changedCells||
    v.footChangedCells>v.changedCells||
    v.impactEvents>v.stampEvents||
    (v.changedCells>0&&v.stampEvents===0))
   throw Error('B160_FAKE_OR_INVALID_ACTOR_RASTER_VALUES');
  return {id,cells:v.changedCells,impactCells:v.impactChangedCells};
 });
 const teamA=actors.filter(a=>a.id.startsWith('A'))
  .reduce((sum,a)=>sum+a.cells,0);
 const teamB=actors.filter(a=>a.id.startsWith('B'))
  .reduce((sum,a)=>sum+a.cells,0);
 if(!nonNegative(teamA)||!nonNegative(teamB)||
   !nonNegative(teamA+teamB)||
   s.teamAChangedCells!==teamA||s.teamBChangedCells!==teamB)
  throw Error('B160_SOURCE_TEAM_TOTALS_INCONSISTENT');
 return {
  actors,teamA,teamB,total:teamA+teamB,
  paintingActors:actors.filter(a=>a.cells>0).length,
  realSource:'ACCEPTED_NATIVE_PAINT_COORDINATOR_CHANGES',
  teamWinner:'NONE',uniqueTurfArea:false,
  officialScoreableCells:0,original4v4Certified:false
 };
}
export function createB160SourceCpuActivityView(
 ui:HTMLElement,finishedScreen:HTMLElement
){
 const live=document.createElement('div');
 live.id='t21-f3-b160-native-ink-live';
 live.style.cssText='margin-top:7px;padding:6px 8px;border-radius:7px;'+
  'background:#071923da;border:1px solid #3b879588;'+
  'color:#a6e1ef;font:700 11px/1.5 system-ui;'+
  'pointer-events:none;white-space:pre-line';
 live.dataset.t21B160OfficialWinner='NONE';
 const finish=document.createElement('section');
 finish.id='t21-f3-b160-native-ink-recap';
 finish.hidden=true;
 finish.style.cssText='margin:13px 0;padding:12px;'+
  'border:1px solid #4e9ca8;border-radius:9px;'+
  'background:#092333;color:#e4f9ff;font:600 11px/1.55 system-ui';
 finish.dataset.t21B160OfficialWinner='NONE';
 finish.dataset.t21B160OriginalScoreable='0';
 // Keep this within the EXISTING source-only session UI, not a second modal.
 const liveContainer=ui.querySelector('#t21-f3-b58-source-session');
 if(!liveContainer)throw Error('B160_NATIVE_SOURCE_BOARD_REQUIRED');
 liveContainer.appendChild(live);
 const stats=finishedScreen.querySelector('#t21-f3-b59-final-stats');
 if(!stats?.parentElement)throw Error('B160_NATIVE_FINISH_STATS_REQUIRED');
 stats.parentElement.insertBefore(finish,stats.nextSibling);
 let lastWritten='';
 const render=(source:B160OriginalCpuInkSource,
  state:'STAGING'|'PLAYING'|'TIME_UP',stopped:boolean)=>{
  const data=summarizeB160CpuActivity(source);
  const liveText='7 CPU REAL INK CHANGES · A '+data.teamA+
   '  /  B '+data.teamB+'\n'+data.paintingActors+
   '/7 active paint contributors · source training only · no winner';
  if(live.textContent!==liveText)live.textContent=liveText;
  const done=state==='TIME_UP'&&!stopped;
  finish.hidden=!done;
  finish.dataset.t21B160SourceContribution=String(data.total);
  finish.dataset.t21B160NativePaintingActors=String(data.paintingActors);
  if(!done){lastWritten='';return data;}
  const signature=data.actors.map(x=>x.cells).join(',');
  if(signature===lastWritten)return data;
  finish.replaceChildren();
  const title=document.createElement('div');
  title.style.cssText='font:900 13px system-ui;color:#8ce4ee';
  title.textContent='REAL SEVEN-CPU PAINT ACTIVITY · 180s';
  const warning=document.createElement('div');
  warning.style.cssText='color:#f6cd95;font-size:10px;margin:4px 0 9px';
  warning.textContent='Raster changed cells, including repaints. Not unique '+
   'Turf area; no official score, ranking, opponent contact or winner.';
  finish.append(title,warning);
  const max=Math.max(1,...data.actors.map(x=>x.cells));
  for(const actor of data.actors){
   const row=document.createElement('div');
   row.style.cssText='display:grid;grid-template-columns:28px 1fr 85px;'+
    'gap:8px;align-items:center;margin:5px 0';
   const id=document.createElement('span');id.textContent=actor.id;
   const rail=document.createElement('div');
   rail.style.cssText='height:8px;border-radius:5px;'+
    'background:#ffffff24;overflow:hidden';
   const bar=document.createElement('div');
   bar.style.cssText='height:100%;background:'+
    (actor.id.startsWith('A')?'#6dd5ea':'#e6a07d')+
    ';width:'+(actor.cells/max*100).toFixed(1)+'%';
   rail.appendChild(bar);
   const cells=document.createElement('span');
   cells.textContent=actor.cells+' cells';cells.style.textAlign='right';
   row.append(id,rail,cells);finish.appendChild(row);
  }
  const total=document.createElement('div');
  total.style.cssText='margin-top:9px;font-weight:900;color:#c8edf7';
  total.textContent='A '+data.teamA+' / B '+data.teamB+
   ' · '+data.paintingActors+'/7 CPUs changed ink · NO WINNER';
  finish.appendChild(total);
  lastWritten=signature;
  return data;
 };
 return {live,finish,render};
}
