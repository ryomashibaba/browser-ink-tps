// Optional F4 UI extension. Reuses existing select and player presentation, no gameplay authority.
import {installF4PlayerPresentation} from './F4PlayerPresentation.mjs';
export function f4PickerOptions(options) {
 const rows=Array.from(options??[]);
 if(rows.length!==12||new Set(rows.map(o=>o.value)).size!==12)return null;
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
const F4_MATCH_FLOW_CSS="\n.f4-flow-picker[hidden],.f4-flow-stats[hidden],.f4-flow-tile[hidden]{display:none!important}\n.f4-flow-picker{pointer-events:auto;margin:8px 0 14px;text-align:left}\n.f4-flow-heading{font:750 11px/1.4 system-ui;color:#d8e6ed;margin:0 0 6px}\n.f4-flow-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}\n.f4-flow-weapon{pointer-events:auto;min-width:0;min-height:48px;box-sizing:border-box;padding:5px 6px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;border:1px solid #7298aa66;border-radius:7px;background:#102c3b;color:#f3f9fc;text-align:left;cursor:pointer;font:650 11px/1.2 system-ui;overflow-wrap:anywhere}\n.f4-flow-class{color:#b6ceda;font-size:9px}\n.f4-flow-weapon[aria-pressed=\"true\"]{border-color:#9df3ff;background:#215468;box-shadow:inset 0 0 0 1px #9df3ff}\n.f4-flow-weapon[aria-pressed=\"true\"] .f4-flow-class{color:#d7ffff}\n.f4-flow-weapon:focus-visible{outline:3px solid #ffd269;outline-offset:1px}\n.f4-flow-weapon:disabled{cursor:default;opacity:.6}\n.f4-flow-stats{margin:14px 0 8px;padding:14px;border:1px solid #79a5b755;border-radius:10px;background:#102635;color:#eaf4f9;font:650 12px/1.4 system-ui}\n.f4-flow-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}\n.f4-flow-tile{display:flex;flex-direction:column;gap:5px;padding:9px;border-radius:6px;background:#071c29}\n.f4-flow-tile strong{font-size:24px;font-weight:850;font-variant-numeric:tabular-nums}\n.f4-flow-tile span,.f4-flow-note{color:#bed0da;font-size:11px}\n.f4-flow-note{margin-top:9px}\n@media(max-width:380px){.f4-flow-choices{grid-template-columns:repeat(2,minmax(0,1fr))}}\n";
export function installF4MatchFlowExtras(root,finish,ui){
 const prior=installF4PlayerPresentation(root,finish,ui);
 const doc=root.ownerDocument,style=doc.createElement('style');
 style.textContent=F4_MATCH_FLOW_CSS;doc.head.append(style);
 const make=(tag,cls)=>{const n=doc.createElement(tag);n.className=cls;return n};
 const pause=ui.querySelector('#t21-f3-b202-real-pause'),select=pause?.querySelector('#t21-f3-b378-weapon'),label=select?.parentElement;
 const grid=make('section','f4-flow-picker');grid.hidden=true;grid.setAttribute('aria-label','使用ブキの直接選択');
 const heading=make('div','f4-flow-heading');heading.textContent='ブキ一覧 · クリックで選択';
 const buttons=make('div','f4-flow-choices');grid.append(heading,buttons);
 const rows=f4PickerOptions(select?.options);
 const stats=make('section','f4-flow-stats');stats.hidden=true;stats.setAttribute('aria-label','自分の実戦績');
 const statTitle=make('strong','');statTitle.textContent='今回の実戦績';
 const statNote=make('div','f4-flow-note');statNote.textContent='直撃と塗装の実測値。サブ・スペシャルを含む総撃破数や個人得点ではありません。';
 const tiles=make('div','f4-flow-tiles');stats.append(statTitle,tiles,statNote);
 const scroll=finish.querySelector('#t21-f3-b59-scroll-stats');
 if(scroll)scroll.append(stats);
 let current=null,disposed=false;
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
 return {render(frame){if(disposed)return;current=frame;prior.render(frame);sync();renderStats(frame)},
  dispose(){if(disposed)return;disposed=true;current=null;select?.removeEventListener('change',sync);grid.remove();stats.remove();style.remove();prior.dispose()}};
}
