// F4 only: read-only compact HUD, no input listener, simulation or score writer.
import {f4CombatCue} from './F4PlayerPresentation.mjs';
const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const pct=v=>number(v,0,100)?Math.round(v):null;
// A living player must not be displayed as having zero HP. Keep the
// numeric bar width and the raw readiness gates independent of this label.
const resourceLabel=(raw,rounded)=>rounded===null?'—':raw>0&&rounded===0?'<1':raw<100&&rounded===100?'>99':String(rounded);
const label=v=>typeof v==='string'&&v.trim()?v.trim():'—';
export function compactF4View(frame,kit,special){
 const hp=pct(frame.hp),ink=pct(frame.ink);
 const clock=number(frame.remainingSeconds,0,180)?Math.ceil(frame.remainingSeconds):null;
 const alive=hp!==null&&frame.hp>0;
 const respawn=!alive&&hp!==null&&number(frame.respawnTicks,0,150)&&Number.isInteger(frame.respawnTicks)?(Math.ceil(frame.respawnTicks/6)/10).toFixed(1):null;
 const valid=(special?.authorityComplete===true||special?.provisional===true)&&number(special.required,1,1000)&&number(special.points,0,special.required);
 const enabled=valid&&special.executorReady===true;
 const specialPercent=valid?Math.floor(100*special.points/special.required):null;
 const probe=kit?.probe===true?special?.probeState:null;
 const probeLabels={AVAILABLE:'G 単独検証',ACTIVE:'単独実行中',LOCKED:'終了動作中',USED:'このライフで実行済み',UNSUPPORTED:'物理実行 HOLD'};
 const full=valid&&special.points>=special.required;
 const specialStatus=probe&&Object.hasOwn(probeLabels,probe)?probeLabels[probe]:
  !valid?'得点未認証':special.active===true?'発動中':
  !enabled?(special?.provisional?'準備中 / 実行未接続':'実行未接続'):
  alive&&special.ready===true&&full?(special?.activationNotice||(special?.provisional?'G 発動入力可':'G 発動可能')):
  special?.provisional&&full?(alive?(special.probeState==='LOCKED'?'終了動作中':'満タン · 現在発動不可'):'復活待ち'):`${specialPercent}%`;
 const sub=label(kit?.sub),cost=number(kit?.subCost,0,100)?kit.subCost:null;
 const subReady=alive&&probe!=='ACTIVE'&&probe!=='LOCKED'&&special?.active!==true&&ink!==null&&cost!==null&&frame.ink>=cost&&kit?.subUsable===true;
 return {clock:clock===null?'—:—':`${Math.floor(clock/60)}:${String(clock%60).padStart(2,'0')}`,hp,ink,hpLabel:resourceLabel(frame.hp,hp),inkLabel:resourceLabel(frame.ink,ink),respawn,alive,weapon:label(kit?.weapon),sub,subReady,subCost:cost,special:label(kit?.special),specialPercent:valid&&!probe?specialPercent:null,specialStatus,scoreLabel:kit?.turfLabel|| (kit?.probe===true?'物理単独検証':valid?(special?.provisional?'暫定得点面':'認証済み得点面'):'研究試合・得点未認証'),danger:alive&&(frame.hp<=35||frame.inkRelation==='ENEMY')?[frame.hp<=35?'HP低下':'',frame.inkRelation==='ENEMY'?'敵インク':''].filter(Boolean).join(' / '):'',controls:alive?(probe==='ACTIVE'||special?.active===true)?label(special?.probeControls):probe==='LOCKED'?'終了動作中 · 通常武器待機':special?.ready&&special?.readyControls?label(special.readyControls):label(kit?.controls):'復活待ち'};
}
const CSS=`[data-f4-compact-active="true"]{box-sizing:border-box!important;width:min(420px,calc(100vw - 24px))!important;padding:9px 12px!important;background:rgba(8,16,29,.89)!important;border:1px solid #ffffff35!important;border-radius:14px!important;box-shadow:0 4px 18px #0005!important;top:10px!important;pointer-events:none!important}[data-f4-compact-active="true"] > [data-f4-legacy-display],[data-f4-compact-active="true"] > #t21-f3-source-practice-ink-balance{display:none!important}.f4-compact-hud{color:#f5f7fc;font:600 12px/1.3 system-ui,sans-serif;font-variant-numeric:tabular-nums}.f4-compact-hud[hidden]{display:none!important}.f4-compact-hud .f4-top,.f4-compact-hud .f4-line{display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0}.f4-compact-hud .f4-clock{font-size:28px;line-height:1;font-weight:850;letter-spacing:.5px}.f4-compact-hud .f4-meta{color:#d1d8e6;font-size:11px;text-align:right}.f4-compact-hud .f4-bars{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}.f4-compact-hud .f4-track{height:7px;background:#ffffff26;border-radius:5px;overflow:hidden;margin-top:3px}.f4-compact-hud .f4-fill{height:100%;width:0%;background:#70e2c3;border-radius:5px}.f4-compact-hud .f4-ink{background:#ff88c7}.f4-compact-hud .f4-sp{background:#ffcf6f}.f4-compact-hud .f4-weapon{font-size:14px;overflow-wrap:anywhere}.f4-compact-hud .f4-muted{color:#c0cad9;font-size:11px;overflow-wrap:anywhere}.f4-compact-hud .f4-notice{color:#ffd9ae;font-size:12px;font-weight:750;margin-top:4px}.f4-compact-hud .f4-sub[data-ready="true"]{color:#a5f5d5}.f4-compact-hud .f4-sub[data-ready="false"]{color:#c0cad9}.f4-compact-hud .f4-special{margin-top:5px}.f4-compact-hud .f4-help{font-size:10px;color:#d1d8e6;margin-top:5px;overflow-wrap:anywhere}@media(max-width:480px){.f4-compact-hud .f4-clock{font-size:23px}.f4-compact-hud .f4-meta{font-size:10px}.f4-compact-hud .f4-help{font-size:10px}}`;
export function installCompactF4Hud(legacy,{visible,readKit,readSpecial}){
 const root=legacy.root,doc=root.ownerDocument,style=doc.createElement('style'),box=doc.createElement('section');
 style.textContent=CSS;doc.head.append(style);box.className='f4-compact-hud';box.hidden=true;box.setAttribute('aria-label','F4 戦闘ステータス');box.setAttribute('aria-live','off');
 box.innerHTML='<div class="f4-top"><span class="f4-clock" data-v="clock"></span><span class="f4-meta" data-v="scoreLabel"></span></div><div class="f4-bars"><div><div class="f4-line"><span>HP</span><span data-v="hp"></span></div><div class="f4-track"><div class="f4-fill" data-bar="hp"></div></div></div><div><div class="f4-line"><span>INK</span><span data-v="ink"></span></div><div class="f4-track"><div class="f4-fill f4-ink" data-bar="ink"></div></div></div></div><div class="f4-line"><strong class="f4-weapon" data-v="weapon"></strong><span class="f4-muted f4-sub" data-v="sub"></span></div><div class="f4-special"><div class="f4-line"><span class="f4-muted" data-v="special"></span><span data-v="specialStatus"></span></div><div class="f4-track" data-track="special"><div class="f4-fill f4-sp" data-bar="specialPercent"></div></div></div><div class="f4-notice" data-v="notice" hidden></div><div class="f4-help" data-v="controls"></div>';
 for(const child of root.children){if(child.id!=="t21-f3-b84-danger")child.setAttribute("data-f4-legacy-display","")}
 root.append(box);const nodes=Object.fromEntries([...box.querySelectorAll('[data-v]')].map(n=>[n.dataset.v,n])),bars=Object.fromEntries([...box.querySelectorAll('[data-bar]')].map(n=>[n.dataset.bar,n])),track=box.querySelector('[data-track="special"]');
 const set=(n,v)=>{if(n.textContent!==v)n.textContent=v};const bar=(n,v)=>{const w=(v??0)+'%';if(n.style.width!==w)n.style.width=w};const show=(n,v)=>{if(n.hidden===v)n.hidden=!v};
 let lastFrame;
 const update=frame=>{
  lastFrame=frame;
  const on=frame.matchState==='PLAYING'&&!frame.paused&&!frame.stopReason&&visible()===true;
  if(root.dataset.f4CompactActive!==String(on))root.dataset.f4CompactActive=String(on);show(box,on);if(!on)return;
  const kit=readKit(),special=readSpecial(),v=compactF4View(frame,kit,special);
  const cue=f4CombatCue({hp:frame.hp,ink:frame.ink,subCost:kit?.subCost,special});
  const setData=(n,k,value)=>{if(n.dataset[k]!==String(value))n.dataset[k]=String(value)};
  setData(box,'f4UiSpecialReady',cue.ready&&kit?.probe!==true);
  setData(box,'f4UiLowHp',cue.lowHp);
  setData(box,'f4UiLowInk',cue.lowInk);
  const inkTrack=bars.ink.parentElement;
  if(inkTrack){inkTrack.classList.add('f4-ink-track');setData(inkTrack,'f4UiThreshold',cue.threshold!==null);
   const mark=cue.threshold===null?'':cue.threshold+'%';
   if(inkTrack.style.getPropertyValue('--f4-ui-sub-threshold')!==mark)inkTrack.style.setProperty('--f4-ui-sub-threshold',mark);}
  for(const key of ['clock','scoreLabel','weapon','special','specialStatus','controls'])set(nodes[key],v[key]);
  set(nodes.hp,v.hpLabel);set(nodes.ink,v.inkLabel);bar(bars.hp,v.hp);bar(bars.ink,v.ink);bar(bars.specialPercent,v.specialPercent);show(track,v.specialPercent!==null);
  set(nodes.sub,v.sub+(v.subCost===null?'':` · ${v.subCost}%`)+(kit?.probe!==true&&special?.provisional&&v.subReady?' · F 使用可':''));if(nodes.sub.dataset.ready!==String(v.subReady))nodes.sub.dataset.ready=String(v.subReady);
  const notice=v.respawn!==null?`復活まで ${v.respawn}秒`:v.danger;set(nodes.notice,notice);show(nodes.notice,notice.length>0);
 };
 return {...legacy,refreshCompactVisibility(){if(lastFrame)update(lastFrame)},renderNativeCombat(frame){legacy.renderNativeCombat(frame);update(frame)},render(state){legacy.render(state);update({hp:state.player.hp,ink:state.player.ink,inkRelation:state.player.inkRelation,remainingSeconds:state.timeRemainingSeconds,respawnTicks:state.humanRespawnTicksRemaining,matchState:state.matchState,paused:state.paused,stopReason:state.stopReason})},disposeCompact(){box.remove();style.remove();delete root.dataset.f4CompactActive}};
}
