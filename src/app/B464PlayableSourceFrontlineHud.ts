/** User-visible F3 opt-in REAL CPU frontline readout.
 * Uses only the existing native SourceTraffic snapshot; no AI, actor,
 * path, clock, collision, scoring or opponent-hit mutations. */
type NativePatrol={
 b441Enabled:boolean;b448A3ResearchEnabled:boolean;
 b441ProposalsChecked:number;b441StrictGoalsAvailable:number;
 b441ActualGoalRequests:number;b441UnsafeOrUnreachableHolds:number;
 b443FirstActualFrontlineArrivals:number;
 b448A3FreshLiveOriginalGoalsAuthorized:number;
 b448A3RealNativeGoalRequests:number;
};
type NativeSnapshot={
 originalSourceSolids:number;originalPaintSurfaces:number;
 originalSourceNavigationLinks:number;sourceScoreablePromotions:number;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';stopReason:string|null;
 cpu:{cpu:{id:string}[];sourcePatrol:NativePatrol};
};
const integer=(v:unknown)=>typeof v==='number'&&
 Number.isSafeInteger(v)&&v>=0;
export interface B464FrontlineView {
 readonly status:'READY'|'LIVE'|'TIME_UP'|'HOLD';
 readonly nativeGoalsRequested:number;
 readonly safeOriginalCandidates:number;
 readonly heldUnreachableOrUnsafe:number;
 readonly actualOriginalArrivals:number;
 readonly actualA3Requests:number;
 readonly nativeProposalChecks:number;
 readonly source:'25/17/26/0';
 readonly cpuCount:7;
 readonly originalOpponentRoutesCertified:0;
 readonly originalOfficialScoreable:0;
 readonly officialWinner:'NONE';
 readonly productionAuthorized:false;
 readonly lines:string;
}
export function b464RealSourceFrontlineView(input:unknown):B464FrontlineView|null{
 const n=input as Partial<NativeSnapshot>|null|undefined;
 const p=n?.cpu?.sourcePatrol;
 if(!n||n.originalSourceSolids!==25||
    n.originalPaintSurfaces!==17||
    n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||
    n.productionAuthorized!==false||
    n.unrestricted4v4Certified!==false||
    !Array.isArray(n.cpu?.cpu)||n.cpu.cpu.length!==7||
    new Set(n.cpu.cpu.map(x=>x?.id)).size!==7||
    !['A1','A2','A3','B1','B2','B3','B4']
      .every(id=>n.cpu!.cpu.some(x=>x?.id===id))||
    !p||p.b441Enabled!==true||p.b448A3ResearchEnabled!==true||
    ![p.b441ProposalsChecked,p.b441StrictGoalsAvailable,
      p.b441ActualGoalRequests,p.b441UnsafeOrUnreachableHolds,
      p.b443FirstActualFrontlineArrivals,
      p.b448A3FreshLiveOriginalGoalsAuthorized,
      p.b448A3RealNativeGoalRequests].every(integer)||
    !['STAGING','PLAYING','TIME_UP'].includes(n.matchState??''))
  return null;
 const status:B464FrontlineView['status']=n.stopReason?
  'HOLD':n.matchState==='TIME_UP'?'TIME_UP':
  n.matchState==='PLAYING'?'LIVE':'READY';
 const count=p.b441ActualGoalRequests;
 return {
  status,nativeGoalsRequested:count,
  safeOriginalCandidates:p.b441StrictGoalsAvailable,
  heldUnreachableOrUnsafe:p.b441UnsafeOrUnreachableHolds,
  actualOriginalArrivals:p.b443FirstActualFrontlineArrivals,
  actualA3Requests:p.b448A3RealNativeGoalRequests,
  nativeProposalChecks:p.b441ProposalsChecked,
  source:'25/17/26/0',cpuCount:7,
  originalOpponentRoutesCertified:0,originalOfficialScoreable:0,
  officialWinner:'NONE',productionAuthorized:false,
  lines:'REAL CPU FRONTLINE · '+status+'\n'+
   'NATIVE GOAL REQUESTS '+count+
   ' · SAFE CANDIDATES '+p.b441StrictGoalsAvailable+'\n'+
   'REAL GOAL ARRIVALS '+p.b443FirstActualFrontlineArrivals+
   ' · A3 REQUESTS '+p.b448A3RealNativeGoalRequests+'\n'+
   'UNSAFE / UNREACHABLE HELD '+p.b441UnsafeOrUnreachableHolds+'\n'+
   'REQUEST ≠ ARRIVAL · CROSS-TEAM ROUTES 0/12 · UNSCORED'
 };
}
/** Opt-in ONLY. Reads the existing world at 1 Hz, never drives it. */
export function mountB464SourceFrontlineHud(
 target:HTMLElement,readNative:()=>unknown
):()=>void{
 const root=document.createElement('section');
 root.id='t21-f3-b464-real-cpu-frontline';
 root.setAttribute('role','group');
 root.setAttribute('aria-label','Live original-source CPU frontline research, not a Turf score');
 root.dataset.t21B464Authority='25/17/26/0';
 root.dataset.t21B464OfficialScoreable='0';
 root.dataset.t21B464CrossTeamRoutes='0';
 root.style.cssText='position:fixed;right:12px;bottom:16px;'+
  'width:min(274px,calc(100vw - 24px));box-sizing:border-box;'+
  'border:1px solid #75cfce99;border-radius:10px;'+
  'padding:10px 12px;background:#092230dd;color:#d6fbf8;'+
  'box-shadow:0 6px 22px #0008;z-index:38;pointer-events:none;'+
  'white-space:pre-line;font:650 10px/1.5 system-ui';
 root.textContent='CPU FRONTLINE · READING TRUE NATIVE SOURCE';
 target.appendChild(root);
 const render=()=>{
  let view:B464FrontlineView|null=null;
  try{view=b464RealSourceFrontlineView(readNative())}
  catch{/* a missing source witness never fabricates CPU progress */}
  if(!view){
   root.textContent='CPU FRONTLINE · SOURCE EVIDENCE HOLD\nNO ROUTE OR HIT CERTIFIED';
   root.dataset.t21B464State='HOLD';
   root.dataset.t21B464NativeGoalRequests='NOT_VERIFIED';
   return;
  }
  root.textContent=view.lines;
  root.dataset.t21B464State=view.status;
  root.dataset.t21B464NativeGoalRequests=String(view.nativeGoalsRequested);
  root.dataset.t21B464OriginalArrivals=String(view.actualOriginalArrivals);
  root.dataset.t21B464Held=String(view.heldUnreachableOrUnsafe);
  root.dataset.t21B464NativeCpu='7';
 };
 render();
 const timer=window.setInterval(render,1000);
 const dispose=()=>{window.clearInterval(timer);root.remove()};
 window.addEventListener('pagehide',dispose,{once:true});
 return dispose;
}
