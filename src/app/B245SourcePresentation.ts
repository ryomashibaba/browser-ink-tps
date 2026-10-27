/** B245: display-only reversible SOURCE round / diagnostic HUD. */
export type B245View='PLAYER'|'QA';
export function b245InitialSourceView(search:string):B245View {
 const q=new URLSearchParams(search);
 return q.get('t21W10B203')!=='fullRound'||
  q.get('t21QaInput')==='deterministic'||
  q.get('t21Presentation')==='qa'?'QA':'PLAYER';
}
export function installB245SourcePresentation(
 ui:HTMLElement,onViewChange:()=>void
):void {
 const q=new URLSearchParams(window.location.search);
 // B75 and other pinned deterministic native QA are unchanged.
 if(q.get('t21W10B203')!=='fullRound'||
    q.get('t21QaInput')==='deterministic')return;
 const style=document.createElement('style');
 style.id='t21-f3-b245-layer-style';
 style.textContent=[
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-play-panel,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-source-survey,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b58-source-session,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b205-real-round,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b211-real-battle-roster,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b75-source-ink-live,',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b76-human-ink-coach',
  '{display:none!important;}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-practice-hud',
  '{width:min(354px,calc(100vw - 28px));padding:12px 16px;',
  'background:linear-gradient(135deg,rgba(4,21,35,.90),rgba(12,44,58,.87));',
  'border-color:rgba(111,242,233,.63);}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-b245-view-toggle',
  '{left:14px;}',
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b245-view-toggle',
  '{left:225px;}',
  '@media(max-width:620px){',
  '#ui-root[data-t21-b245-presentation="QA"] #t21-f3-b245-view-toggle',
  '{left:auto;right:14px;}',
  '#ui-root[data-t21-b245-presentation="PLAYER"] #t21-f3-practice-hud',
  '{top:8px;width:min(320px,calc(100vw - 24px));}',
  '}'
 ].join('');
 ui.appendChild(style);
 const button=document.createElement('button');
 button.id='t21-f3-b245-view-toggle';
 button.type='button';
 button.setAttribute('aria-label','Toggle source QA evidence view (F8)');
 button.style.cssText='position:fixed;bottom:14px;z-index:72;pointer-events:auto;'+
  'padding:9px 12px;border:1px solid #6cdad9;border-radius:10px;'+
  'background:rgba(4,25,39,.92);color:#dffcff;box-shadow:0 7px 26px #0019;'+
  'font:750 11px/1.2 system-ui;cursor:pointer';
 const apply=(view:B245View,manual:boolean)=>{
  ui.dataset.t21B245Presentation=view;
  ui.dataset.t21B245Inspect=String(manual&&view==='QA');
  button.textContent=view==='PLAYER'?'F8 · QA DETAILS':'F8 · PLAYER VIEW';
  button.setAttribute('aria-pressed',String(view==='QA'));
  button.dataset.nativePhysicsWrites='0';
  onViewChange();
 };
 const toggle=()=>apply(ui.dataset.t21B245Presentation==='QA'?'PLAYER':'QA',true);
 button.addEventListener('click',toggle);
 ui.appendChild(button);
 apply(b245InitialSourceView(window.location.search),false);
 window.addEventListener('keydown',ev=>{
  if(ev.code!=='F8'||ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey)return;
  ev.preventDefault();toggle();
 });
}
