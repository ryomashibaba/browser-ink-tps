/** W10-B70 — owner-selected local, same-tab CPU-AIM comparison.
 * UI does not intercept native input, simulate match time, or send telemetry.
 */
import {
 B70_STORAGE_KEY,captureB70Round,compareB70Rounds,readB70Session,
 storeB70Round,type B70AimMode,type B70Frame
} from './UndertowF3OwnerAimComparison';
import {b69NextSourcePreviewHref} from './UndertowF3PreviewAimReview';

export function createB70OwnerAimComparisonUI(
 finish:HTMLElement,mode:B70AimMode,getNative:()=>B70Frame,
 reportReady:()=>boolean
){
 const panel=finish.querySelector<HTMLElement>('div');
 if(!panel)throw Error('B70_REAL_END_PANEL_REQUIRED');
 const section=document.createElement('section');
 section.id='t21-f3-b70-owner-local-aim-comparison';
 section.dataset.t21B70OwnerOptIn='REQUIRED';
 section.dataset.t21B70DataUpload='NONE';
 section.dataset.t21B70OfficialScoring='0';
 section.style.cssText='padding:12px;margin-top:14px;'+
  'border:1px solid #547d94;border-radius:12px;'+
  'background:#0d2533;color:#e4f8ff;font:600 11px/1.55 system-ui';
 const headline=document.createElement('div');
 headline.textContent='YOUR 180s SOURCE AIM COMPARISON · THIS TAB ONLY';
 headline.style.cssText='font:850 12px system-ui;color:#9de9ed';
 const details=document.createElement('p');
 details.style.cssText='margin:7px 0 8px;color:#c5deea';
 details.textContent='Only your explicit click saves anonymous numbers. '+
  'No original stage files, actor positions or results are uploaded.';
 const status=document.createElement('div');
 status.id='t21-f3-b70-status';
 status.style.cssText='white-space:pre-line;color:#c9f1f8;margin:5px 0 9px';
 const compare=document.createElement('div');
 compare.id='t21-f3-b70-comparison';
 compare.hidden=true;
 compare.style.cssText='white-space:pre-line;padding:8px 0;border-top:1px solid #558e9b77;';
 const save=document.createElement('button');
 save.id='t21-f3-b70-save-compare';
 save.type='button';
 save.disabled=true;
 save.style.cssText='padding:10px 12px;width:100%;'+
  'font:800 11px system-ui;background:#55cdda;'+
  'border:0;border-radius:8px;color:#082633;cursor:pointer';
 const reset=document.createElement('button');
 reset.type='button';
 reset.id='t21-f3-b70-clear-comparison';
 reset.textContent='CLEAR ONLY THIS TAB’S STORED COMPARISON';
 reset.style.cssText='padding:4px 2px;margin-top:7px;'+
  'background:transparent;border:0;color:#9ccbd4;'+
  'font:600 10px system-ui;cursor:pointer';
 section.append(headline,details,status,compare,save,reset);
 const before=panel.querySelector<HTMLElement>('#t21-f3-b59-restart');
 panel.insertBefore(section,before);
 function render(){
  let raw:string|null=null,storageOkay=true;
  try{raw=sessionStorage.getItem(B70_STORAGE_KEY);}
  catch{storageOkay=false;}
  if(!storageOkay){
   save.disabled=true;
   status.textContent='Browser tab storage is not available. No record saved.';
   section.dataset.t21B70Stage='STORAGE_UNAVAILABLE';
   return;
  }
  const q=readB70Session(raw),both=compareB70Rounds(raw);
  status.textContent='Recorded 180s sessions: FIXED '+
   (q.fixed?'✓':'–')+' · SWEEP '+(q.sweep?'✓':'–')+
   ' · CURRENT '+mode;
  if(both){
   compare.hidden=false;
   compare.textContent=
    'ACTUAL CPU SOURCE PAINT CELLS   FIXED '+
    both.fixed.cpuImpactInkChangedCells.toLocaleString()+
    ' / SWEEP '+both.sweep.cpuImpactInkChangedCells.toLocaleString()+'\n'+
    'ACTUAL CPU SOURCE SHOTS   '+both.fixed.cpuSourceShots+
    ' / '+both.sweep.cpuSourceShots+'\n'+
    'REAL ORIGINAL-FOOT PATROL METERS   '+
    both.fixed.cpuOriginalPatrolMeters+' / '+
    both.sweep.cpuOriginalPatrolMeters+'\n'+
    'YOUR OWN SHOTS   '+both.fixed.humanShots+
    ' / '+both.sweep.humanShots+'\n'+
    'HOST CALLBACK p95ms (not true GPU latency)   '+
    (both.fixed.callbackP95Ms??'unknown')+' / '+
    (both.sweep.callbackP95Ms??'unknown')+'\n'+
    'SOURCE INK CHANGE RATIO (NOT A TURF SCORE): '+
    (both.realCpuInkChangeRatio??'N/A')+'×\n'+
    (both.humanInputWasDifferent?
      'HUMAN INPUT DIFFERED: this is not a controlled game-quality benchmark.\n':
      'HUMAN SHOTS/INK COUNTS MATCHED; other conditions can still differ.\n')+
    'NO WINNER · NO VERIFIED OPPONENT 4v4 · CPU DEFAULT STILL FIXED';
  }else{
   compare.hidden=true;compare.textContent='';
  }
  const complete=reportReady();
  save.disabled=!complete;
  const hasCurrent=mode==='FIXED'?!!q.fixed:!!q.sweep;
  if(!complete)save.textContent='FINISH REAL 180s TO COMPARE';
  else if(!hasCurrent&&!(q.fixed&&q.sweep))
   save.textContent='SAVE THIS FINISHED ROUND'+
    (q.fixed||q.sweep?' & SHOW COMPARISON':
     ' & TRY THE OTHER CPU AIM');
  else save.textContent='SAVE THIS FINISHED ROUND & REFRESH COMPARISON';
  section.dataset.t21B70Stage=complete?
   both?'TWO_REAL_COMPLETED_ROUNDS':'REAL_ROUND_AVAILABLE':
   'NOT_FINISHED';
  section.dataset.t21B70StoredFixed=q.fixed?'YES':'NO';
  section.dataset.t21B70StoredSweep=q.sweep?'YES':'NO';
 }
 save.addEventListener('click',()=>{
  if(!reportReady()||finish.hidden||
     finish.dataset.t21B59State!=='FINISHED')return;
  try{
   const round=captureB70Round(mode,getNative());
   const before=sessionStorage.getItem(B70_STORAGE_KEY);
   const after=storeB70Round(before,round);
   // Only this user click persists minimal anonymous numeric counts.
   sessionStorage.setItem(B70_STORAGE_KEY,after);
   render();
   const compared=compareB70Rounds(after);
   if(!compared){
    const next=mode==='FIXED'?'SWEEP':'FIXED';
    // A new session; no game physics or source actor is altered here.
    window.location.assign(b69NextSourcePreviewHref(
     window.location.pathname,next));
   }
  }catch(err){
   status.textContent='NO RECORD SAVED · '+
    (err instanceof Error?err.message:'B70_UNVERIFIED_SOURCE');
   section.dataset.t21B70Stage='SAFE_STOP';
  }
 });
 reset.addEventListener('click',()=>{
  try{sessionStorage.removeItem(B70_STORAGE_KEY);render();}
  catch{status.textContent='Browser tab storage is unavailable.';}
 });
 render();
 return {section,render};
}
