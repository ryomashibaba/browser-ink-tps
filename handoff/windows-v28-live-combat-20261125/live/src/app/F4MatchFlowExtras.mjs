// Optional F4 UI extension. Reuses existing select and player presentation, no gameplay authority.
import {installF4PlayerPresentation} from './F4PlayerPresentation.mjs';
export function f4PickerOptions(options) {
 const rows=Array.from(options??[]);
 if(rows.length!==12||rows.some(o=>!o)||new Set(rows.map(o=>o.value)).size!==12)return null;
 if(rows.some(o=>!o||typeof o.value!=='string'||!o.value.trim()||typeof o.textContent!=='string'||!o.textContent.trim()||o.disabled))return null;
 return rows.map(o=>{
  const text=o.textContent.trim(),sep=text.indexOf(' · ');
  return {id:o.value,category:sep<0?'':text.slice(0,sep),name:sep<0?text:text.slice(sep+3)};
 });
}
export function f4CanPick(frame,gate){
 return frame?.playerView===true&&frame.matchState==='STAGING'&&frame.paused===true&&frame.stopped===false&&
  gate?.menuState==='READY_TO_START'&&gate.menuVisible===true&&gate.selectEnabled===true&&gate.pointerLocked===false;
}
export function f4MatchStats(summary){
 if(!summary)return [];
 const valid=n=>Number.isSafeInteger(n)&&n>=0;
 const rows=[];
 const {directHits,directSplats,deaths,respawns,changedCells}=summary;
 const combatValid=valid(directHits)&&valid(directSplats)&&directSplats<=directHits;
 if(combatValid){rows.push({label:'直撃による撃破',value:directSplats});rows.push({label:'実HP減少の直撃',value:directHits})}
 if(valid(deaths)&&valid(respawns)&&respawns<=deaths){rows.push({label:'自分の被撃破',value:deaths});rows.push({label:'復活',value:respawns})}
 if(valid(changedCells))rows.push({label:'自分の実塗装変更セル',value:changedCells});
 return rows;
}
const F4_MATCH_FLOW_CSS="\n.f4-flow-picker[hidden],.f4-flow-stats[hidden],.f4-flow-tile[hidden]{display:none!important}\n.f4-flow-picker{pointer-events:auto;margin:8px 0 14px;text-align:left}\n.f4-flow-heading{font:750 11px/1.4 system-ui;color:#d8e6ed;margin:0 0 6px}\n.f4-flow-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}\n.f4-flow-weapon{pointer-events:auto;min-width:0;min-height:48px;box-sizing:border-box;padding:5px 6px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;border:1px solid #7298aa66;border-radius:7px;background:#102c3b;color:#f3f9fc;text-align:left;cursor:pointer;font:650 11px/1.2 system-ui;overflow-wrap:anywhere}\n.f4-flow-class{color:#b6ceda;font-size:9px}\n.f4-flow-weapon[aria-pressed=\"true\"]{border-color:#9df3ff;background:#215468;box-shadow:inset 0 0 0 1px #9df3ff}\n.f4-flow-weapon[aria-pressed=\"true\"] .f4-flow-class{color:#d7ffff}\n.f4-flow-weapon:focus-visible{outline:3px solid #ffd269;outline-offset:1px}\n.f4-flow-weapon:disabled{cursor:default;opacity:.6}\n.f4-flow-stats{margin:14px 0 8px;padding:14px;border:1px solid #79a5b755;border-radius:10px;background:#102635;color:#eaf4f9;font:650 12px/1.4 system-ui}\n.f4-flow-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}\n.f4-flow-tile{display:flex;flex-direction:column;gap:5px;padding:9px;border-radius:6px;background:#071c29}\n.f4-flow-tile strong{font-size:24px;font-weight:850;font-variant-numeric:tabular-nums}\n.f4-flow-tile span,.f4-flow-note{color:#bed0da;font-size:11px}\n.f4-flow-note{margin-top:9px}\n@media(max-width:380px){.f4-flow-choices{grid-template-columns:repeat(2,minmax(0,1fr))}}\n\n.f4-flow-weapon[hidden],.f4-flow-note[hidden],.f4-flow-controls[hidden]{display:none!important}\n.f4-flow-icon{display:block;width:100%;height:28px;color:#a8dbe6;flex:none}\n.f4-flow-weapon[aria-pressed=\"true\"] .f4-flow-icon{color:#e3fbff}\n.f4-flow-controls{margin:8px 0;padding:9px 10px;border:1px solid #779cac55;border-radius:8px;color:#e4f1f6;background:#0b2330;font:600 11px/1.55 system-ui}\n.f4-flow-controls strong{display:block;font-size:12px;margin-bottom:3px}\n.f4-flow-controls span{display:block}\n.f4-flow-export{width:100%;margin:8px 0;align-items:center;text-align:center;min-height:40px}\n";
// Player-controlled export; never advances or certifies a match.
// Compact authored silhouettes: weapon identity only, never range or damage.
const WEAPON_ICON=Object.freeze({
 'pulse-sprayer':'M4 7H30V10H46V16H30V19H17L12 26H7L10 18H4Z',
 'needle-smg':'M5 8H30V11H50V14H30V17H23L20 27H13L15 17H5Z',
 'twin-comets':'M3 3H23V6H33V10H20L16 16H11L13 10H3Z M19 16H39V19H49V23H36L32 29H27L29 23H19Z',
 'rail-charger':'M2 12H15V9H35V12H54V16H26L20 24H15L16 17H2Z M20 5H29V9H20Z',
 'arc-blaster':'M4 6H28L34 9H49V18H34L28 21H19L15 28H9L11 20H4Z',
 'metro-roller':'M6 4H18V25H6Z M18 12H32V9H37V13H52V18H37V22H32V16H18Z',
 'dash-brush':'M3 7H14L21 12V18L14 25H3Z M21 13H52V17H21Z',
 'wave-slosher':'M9 9H36L32 27H13Z M6 5H39V9H6Z M37 10H48V20H36V16H44V14H37Z',
 'rotor-splatling':'M3 9H24V6H34V8H52V12H34V14H52V18H34V20H52V24H24V21H15L10 27H5L7 20H3Z',
 'canopy-guard':'M2 15L15 3H24L34 12V18L24 28H15Z M34 13H48V17H34Z M48 13H53V23H45V20H49Z',
 'chord-stringer':'M10 2H17L31 10V22L17 30H10L24 21V11Z M10 2H13V30H10Z M17 14H52V17H17Z',
 'ink-saber':'M2 12H14V7H18V12H49L55 15L49 19H18V24H14V19H2Z'
});
function weaponIcon(doc,id){
 if(!Object.hasOwn(WEAPON_ICON,id))return null;
 const ns='http://www.w3.org/2000/svg',svg=doc.createElementNS(ns,'svg'),p=doc.createElementNS(ns,'path');
 svg.setAttribute('viewBox','0 0 56 32');svg.setAttribute('class','f4-flow-icon');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 p.setAttribute('d',WEAPON_ICON[id]);p.setAttribute('fill','currentColor');
 svg.append(p);return svg;
}
export function f4EvidenceAllowed(frame){
 return frame?.playerView===true&&(frame.matchState==='TIME_UP'||frame.matchState==='PLAYING'&&frame.paused===true);
}
export function f4EvidenceJson(frame,read){
 if(!f4EvidenceAllowed(frame)||typeof read!=='function')return null;
 const data=read();
 if(!data||!Number.isSafeInteger(data.nativeTick)||data.nativeTick<0||
    !Number.isFinite(data.remainingSeconds)||data.remainingSeconds<0||data.remainingSeconds>180||
    data.matchState!==frame.matchState)return null;
 return JSON.stringify({schema:'F4_PROVISIONAL_MATCH_V1',officialCertification:false,data},null,2);
}
export function installF4MatchFlowExtras(root,finish,ui,readEvidence){
 const prior=installF4PlayerPresentation(root,finish,ui);
 const doc=root.ownerDocument,style=doc.createElement('style');
 style.textContent=F4_MATCH_FLOW_CSS;doc.head.append(style);
 const make=(tag,cls)=>{const n=doc.createElement(tag);n.className=cls;return n};
 const pause=ui.querySelector('#t21-f3-b202-real-pause'),select=pause?.querySelector('#t21-f3-b378-weapon'),label=select?.parentElement;
 const grid=make('section','f4-flow-picker');grid.hidden=true;grid.setAttribute('aria-label','使用ブキの直接選択');
 const heading=make('div','f4-flow-heading');heading.textContent='ブキ一覧 · クリックで選択';
 const buttons=make('div','f4-flow-choices');grid.append(heading,buttons);
 const rows=f4PickerOptions(select?.options);
 const controls=make('section','f4-flow-controls');controls.hidden=true;
 const controlsTitle=make('strong','');controlsTitle.textContent='操作ガイド';
 controls.append(controlsTitle);
 for(const line of ['WASD 移動 ／ マウス 照準','左クリック メイン ／ F サブ ／ G スペシャル','Shift イカ ／ Space ジャンプ ／ Q 肩切替','Esc / P 一時停止 ／ M レーダー']){
  const row=make('span','');row.textContent=line;controls.append(row);
 }
 if(pause)pause.append(controls);
 const stats=make('section','f4-flow-stats');stats.hidden=true;stats.setAttribute('aria-label','自分の実戦績');
 const statTitle=make('strong','');statTitle.textContent='今回の実戦績';
 const statNote=make('div','f4-flow-note');statNote.textContent='直撃と塗装の実測値。サブ・スペシャルを含む総撃破数や個人得点ではありません。';
 const tiles=make('div','f4-flow-tiles');stats.append(statTitle,tiles,statNote);
 const scroll=finish.querySelector('#t21-f3-b59-scroll-stats');
 if(scroll)scroll.insertBefore(stats,scroll.querySelector('#t21-f3-b59-final-stats'));
 let current=null,disposed=false;
 const evidenceButtons=[];
 const addEvidenceButton=(host,phase)=>{
  if(!host||typeof readEvidence!=='function')return;
  const button=make('button','f4-flow-weapon f4-flow-export');button.type='button';button.hidden=true;
  button.textContent='実戦記録を保存（JSON）';
  const status=make('section','f4-flow-note');status.hidden=true;status.setAttribute('role','status');
  host.append(button,status);
  button.addEventListener('click',event=>{
   event.preventDefault();event.stopPropagation();
   if(disposed||!f4EvidenceAllowed(current)||current.matchState!==phase||button.hidden||doc.pointerLockElement)return;
   let url=null,link=null;
   try{
    const json=f4EvidenceJson(current,readEvidence);
    if(!json)throw Error('NO_CURRENT_MATCH_DATA');
    const win=doc.defaultView;
    if(!win||!win.URL?.createObjectURL)throw Error('DOWNLOAD_UNAVAILABLE');
    url=win.URL.createObjectURL(new win.Blob([json],{type:'application/json'}));
    link=doc.createElement('a');link.href=url;
    link.download='f4-provisional-match-'+(phase==='TIME_UP'?'final':'paused')+'.json';
    doc.body.append(link);link.click();
    status.textContent='記録のダウンロードを開始しました。';
   }catch{status.textContent='記録を保存できませんでした。';}
   finally{
    link?.remove();
    if(url){const saved=url;doc.defaultView.setTimeout(()=>doc.defaultView.URL.revokeObjectURL(saved),1000);}
    status.hidden=false;
   }
  });
  evidenceButtons.push({button,status,phase});
 };
 addEvidenceButton(pause,'PLAYING');
 addEvidenceButton(scroll,'TIME_UP');
 const entries=[],statNodes=new Map();
 const set=(n,s)=>{if(n.textContent!==s)n.textContent=s};
 const hide=(n,h)=>{if(n.hidden!==h)n.hidden=h};
 const gate=()=>({menuState:pause?.dataset.t21B202NativeState,
  menuVisible:!!pause&&!pause.hidden&&pause.style.display!=='none'&&!!label&&!label.hidden&&label.style.display!=='none',
  selectEnabled:!!select&&!select.disabled&&!select.hidden,
  pointerLocked:!!doc.pointerLockElement});
 const sync=()=>{
  const can=!!rows&&f4CanPick(current,gate());
  hide(grid,!can);
  hide(controls,!(current?.playerView===true&&current.paused===true&&!current.stopped&&
   (gate().menuState==='READY_TO_START'||gate().menuState==='NATIVE_PAUSED')&&!doc.pointerLockElement));
  for(const {id,button} of entries){
   if(button.disabled===can)button.disabled=!can;
   const pressed=String(select.value===id);
   if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);
  }
 };
 if(rows&&label?.parentElement===pause){
  for(const row of rows){
   const button=make('button','f4-flow-weapon');button.type='button';button.disabled=true;
   button.setAttribute('aria-pressed','false');
   const category=make('span','f4-flow-class');category.textContent=row.category;
   const name=make('strong','');name.textContent=row.name;
   const icon=weaponIcon(doc,row.id);if(icon)button.append(icon);
   button.append(category,name);
   button.addEventListener('click',event=>{
    if(disposed||!f4CanPick(current,gate())||button.disabled||!Array.from(select.options).some(o=>o.value===row.id&&!o.disabled))return;
    event.preventDefault();event.stopPropagation();
    if(select.value!==row.id){
     select.value=row.id;
     // Existing native select listener is the sole authority, may reject/revert.
     select.dispatchEvent(new doc.defaultView.Event('change',{bubbles:true}));
    }
    sync();
   });
   entries.push({id:row.id,button});buttons.append(button);
  }
  pause.insertBefore(grid,label.nextSibling);
  select.addEventListener('change',sync);
 }
 const renderStats=frame=>{
  const visible=frame.playerView===true&&frame.matchState==='TIME_UP'&&!frame.stopped&&!finish.hidden&&
   finish.dataset.t21B59State==='FINISHED'&&!!scroll;
  const data=visible?f4MatchStats(frame.matchSummary):[];
  hide(stats,!data.length);
  if(!data.length)return;
  for(const {label,value} of data){
   let tile=statNodes.get(label);
   if(!tile){const box=make('div','f4-flow-tile'),name=make('span',''),num=make('strong','');
    name.textContent=label;box.append(name,num);tiles.append(box);tile={box,num};statNodes.set(label,tile)}
   hide(tile.box,false);set(tile.num,String(value));
  }
  for(const [key,tile] of statNodes)if(!data.some(x=>x.label===key))hide(tile.box,true);
 };
 // The wrapper owns the validated result tiles; suppress the duplicate.
 return {render(frame){if(disposed)return;current=frame;prior.render({...frame,matchSummary:null});sync();renderStats(frame);
   for(const {button,status,phase} of evidenceButtons){
    const show=f4EvidenceAllowed(frame)&&frame.matchState===phase&&!doc.pointerLockElement;
    hide(button,!show);if(!show)hide(status,true);
   }
  },
  dispose(){if(disposed)return;disposed=true;current=null;select?.removeEventListener('change',sync);
   for(const {button,status} of evidenceButtons){button.remove();status.remove();}
   grid.remove();controls.remove();stats.remove();style.remove();prior.dispose()}};
}
