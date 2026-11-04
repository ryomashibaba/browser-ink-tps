/**
 * Player-facing 180s SOURCE practice balance. The 17 ORIGINAL non-scoreable
 * ownership grids are the only input; this is NOT an official Turf score.
 * F1-F5/Fast Track: no Actor, physics, AI, ink, clock or stage writes.
 */
import type {B401LiveState} from './B401NativeLiveSourceInkOwnership';

export interface SourcePracticeInkBalanceSnapshot {
 readonly sourceTick:number;
 readonly teamA:number;
 readonly teamB:number;
 readonly neutral:number;
 readonly total:number;
 readonly aPercent:number;
 readonly bPercent:number;
 readonly neutralPercent:number;
 readonly officialTurfScore:false;
 readonly winner:'NONE';
 readonly gameplayWrites:0;
}

/** Fail closed on incomplete, stale, forged or scoreable SOURCE observations. */
export function sourcePracticeInkBalance(
 s:B401LiveState,stage:readonly number[],phase:string
):SourcePracticeInkBalanceSnapshot|null{
 if(stage.length!==4||stage.join('/')!=='25/17/26/0'||
    (phase!=='STAGING'&&phase!=='PLAYING')||
    s.status!=='LIVE_REGISTERED_SOURCE_ONLY'||
    s.registeredSurfaces!==17||!s.originalSourceOnly||
    s.officialTurfScore!==false||s.winner!=='NONE'||
    s.productionAuthorized!==false||s.gameplayWrites!==0||
    !Number.isSafeInteger(s.sampleNativeTick)||s.sampleNativeTick<1)return null;
 const {totalActiveCells:total,teamA:a,teamB:b,neutral:n}=s;
 if(![total,a,b,n].every(Number.isSafeInteger)||
    total<1||a<0||b<0||n<0||a+b+n!==total)return null;
 return {
  sourceTick:s.sampleNativeTick,teamA:a,teamB:b,neutral:n,total,
  aPercent:100*a/total,bPercent:100*b/total,neutralPercent:100*n/total,
  officialTurfScore:false,winner:'NONE',gameplayWrites:0
 };
}

/** No new game loop, no expensive grid sampling; B401 already owns cadence. */
export function createSourcePracticeInkBalance(parent:HTMLElement){
 const root=document.createElement('section');
 root.id='t21-f3-source-practice-ink-balance';
 root.setAttribute('aria-label','Registered original source paint cells, practice only, not a Turf score');
 root.setAttribute('aria-live','off');
 root.dataset.originalSourceOnly='true';
 root.dataset.sourceScoreable='0';
 root.dataset.officialWinner='NONE';
 root.dataset.gameplayWrites='0';
 root.hidden=true;
 root.style.cssText='margin-top:8px;padding-top:7px;border-top:1px solid #ffffff26;'+
  'font:700 10px/1.4 system-ui;color:#d7f7f4';
 const label=document.createElement('div');
 label.id='t21-f3-source-practice-balance-label';
 label.textContent='REGISTERED SOURCE PAINT · UNSCORED';
 const track=document.createElement('div');
 track.style.cssText='display:flex;width:100%;height:9px;overflow:hidden;'+
  'border:1px solid #ffffff54;border-radius:7px;margin:5px 0 3px;background:#36444b';
 const a=document.createElement('span'),b=document.createElement('span');
 const neutral=document.createElement('span');
 a.id='t21-f3-source-balance-a';b.id='t21-f3-source-balance-b';
 neutral.id='t21-f3-source-balance-neutral';
 a.style.cssText='height:100%;background:#43d5e1;width:0%';
 b.style.cssText='height:100%;background:#ec539d;width:0%';
 neutral.style.cssText='height:100%;background:#526575;width:100%';
 track.append(a,b,neutral);
 const footer=document.createElement('div');
 footer.textContent='NON-SCOREABLE SOURCE CELLS · NO OFFICIAL WINNER';
 footer.style.cssText='font:600 9px/1.35 system-ui;color:#ffce9d';
 root.append(label,track,footer);
 parent.appendChild(root);
 const render=(s:B401LiveState,stage:readonly number[],
  phase:string,stopped=false):void=>{
  const data=stopped?null:sourcePracticeInkBalance(s,stage,phase);
  root.hidden=!data;
  if(!data){
   root.dataset.sourcePaintStatus='HOLD';
   return;
  }
  root.dataset.sourcePaintStatus='LIVE_SOURCE_ONLY';
  root.dataset.sourceSampleTick=String(data.sourceTick);
  root.dataset.teamACells=String(data.teamA);
  root.dataset.teamBCells=String(data.teamB);
  root.dataset.neutralCells=String(data.neutral);
  label.textContent='SOURCE PAINT · A '+data.teamA.toLocaleString('en-US')+
   ' / B '+data.teamB.toLocaleString('en-US')+
   ' / NEUTRAL '+data.neutral.toLocaleString('en-US');
  a.style.width=data.aPercent.toFixed(4)+'%';
  b.style.width=data.bPercent.toFixed(4)+'%';
  neutral.style.width=data.neutralPercent.toFixed(4)+'%';
 };
 return {root,render};
}
