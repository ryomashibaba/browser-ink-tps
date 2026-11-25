// V28 F4 player presentation only. Never writes simulation or official score.
export function f4TurfPresentation(score, phase, stopped=false) {
 const unavailable=(title,detail)=>({kind:'HOLD',title,detail,a:null,b:null,neutral:null});
 if(stopped)return unavailable('試合停止','停止した試合の勝敗は表示しません');
 if(!score)return unavailable('暫定得点準備','実塗装面の集計待ち');
 if(score.status==='BUILDING')return {kind:'BUILDING',title:'得点面を準備中',detail:Number.isFinite(score.progress)&&score.progress>=0&&score.progress<=1?`${Math.floor(score.progress*100)}% 完了`:'集計待ち',a:null,b:null,neutral:null};
 if(score.status==='HOLD')return unavailable('得点集計保留','有効な得点面を確認できていません');
 if(!['LIVE','FINAL'].includes(score.status))return unavailable('得点不明','有効な得点情報がありません');
 const {percentA:a,percentB:b,neutralArea,totalProjectedM2}=score;
 if(![a,b].every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100)||a+b>100.000001)
  return unavailable('得点不明','有効な得点情報がありません');
 const neutral=Number.isFinite(neutralArea)&&Number.isFinite(totalProjectedM2)&&totalProjectedM2>0&&neutralArea>=0&&neutralArea<=totalProjectedM2?100*neutralArea/totalProjectedM2:null;
 if(neutral!==null&&Math.abs(a+b+neutral-100)>0.001)return unavailable('得点不明','得点面積の整合性を確認できません');
 if(phase==='TIME_UP'){
  if(score.status!=='FINAL'||!['A','B','DRAW'].includes(score.winner))return unavailable('結果集計保留','確定した勝敗データがありません');
  return {kind:'FINAL',title:({A:'勝利！',B:'敗北',DRAW:'引き分け'})[score.winner],detail:'暫定研究得点による結果 · 正式原作勝敗は未認証',a,b,neutral};
 }
 if(score.status!=='LIVE'||phase!=='PLAYING')return unavailable('暫定得点準備','試合中の集計待ち');
 return {kind:'LIVE',title:'暫定ナワバリ',detail:'実塗装面積 · 未塗装面を含む',a,b,neutral};
}
export function f4Urgency(seconds) {
 return typeof seconds==='number'&&Number.isFinite(seconds)&&seconds>=0&&seconds<=180?(seconds<=10?'critical':seconds<=30?'soon':'normal'):'unknown';
}
export function f4RosterView(roster){
 if(!roster||roster.sourceScoreable!==0||roster.officialWinner!=='NONE'||roster.naturalEnemyEncounterCertified!==false||
  !Number.isFinite(roster.humanHp)||roster.humanHp<0||roster.humanHp>100||!Array.isArray(roster.rows)||roster.rows.length!==7)return null;
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const statuses={ACTIVE:'生存',SPLAT:'撃破',REJOINING:'復帰中',UNKNOWN:'不明'};
 if(roster.rows.some((r,i)=>!r||r.id!==ids[i]||r.team!==(i<3?'ALLY':'ENEMY')||
  !Object.hasOwn(statuses,r.status)||(r.status==='ACTIVE'&&(!Number.isFinite(r.hp)||r.hp<=0||r.hp>100))))return null;
 const rows=[{id:'YOU',team:'ALLY',status:roster.humanHp>0?'ACTIVE':'SPLAT',hp:roster.humanHp},...roster.rows];
 return rows.map(r=>({id:r.id,team:r.team,status:r.status,description:`${r.id==='YOU'?'自分':r.id} · ${statuses[r.status]}`}));
}
export function f4TeamColor(rgb){
 if(!rgb||rgb.length!==3||!Array.from(rgb).every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1))return null;
 return '#'+Array.from(rgb,v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
}
export function f4KitPreview(kit){
 if(!kit||!['weapon','classLabel','sub','special'].every(k=>typeof kit[k]==='string'&&kit[k].trim()))return null;
 const cost=typeof kit.subCost==='number'&&Number.isFinite(kit.subCost)&&kit.subCost>=0&&kit.subCost<=100?kit.subCost:null;
 return {name:kit.weapon,category:kit.classLabel,sub:`サブ · ${kit.sub}${cost===null?'':` / インク ${cost}%`}`,special:`スペシャル · ${kit.special}`};
}
export function f4CombatCue(frame){
 const alive=typeof frame.hp==='number'&&Number.isFinite(frame.hp)&&frame.hp>0&&frame.hp<=100;
 const validInk=typeof frame.ink==='number'&&Number.isFinite(frame.ink)&&frame.ink>=0&&frame.ink<=100;
 const cost=frame.subCost;
 const threshold=typeof cost==='number'&&Number.isFinite(cost)&&cost>=0&&cost<=100?cost:null;
 const special=frame.special;
 const validGauge=!!special&&(special.authorityComplete===true||special.provisional===true)&&
  Number.isFinite(special.required)&&special.required>0&&Number.isFinite(special.points)&&special.points>=0&&special.points<=special.required;
 return {threshold,lowInk:alive&&validInk&&threshold!==null&&frame.ink<threshold,
  ready:alive&&validGauge&&special.executorReady===true&&special.ready===true&&special.active!==true&&special.points>=special.required,
  lowHp:alive&&frame.hp<=35};
}
const F4_PLAYER_CSS="\n[data-f4-ui-skin=\"true\"][data-f4-compact-active=\"true\"]{width:min(350px,calc(100vw - 24px))!important;background:linear-gradient(145deg,#111d2aee,#07131fee)!important;border:1px solid #73899b75!important;border-radius:12px!important;box-shadow:0 5px 20px #0006!important;padding:10px 13px!important}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-clock{font-size:34px;letter-spacing:-1px;font-weight:900}\n[data-f4-ui-urgency=\"soon\"] .f4-clock{color:#ffd27b}\n[data-f4-ui-urgency=\"critical\"] .f4-clock{color:#ffab9f}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-track{height:9px;background:#53617088}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-fill{border-radius:3px}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-ink{background:#f2a4e2}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-sp{background:#ffd269}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-notice{background:#652f34;border-radius:6px;padding:5px 8px}\n[data-f4-ui-live=\"true\"] .f4-meta{display:none}\n.f4-ui-score{box-sizing:border-box;color:#edf5fd;font:650 12px/1.4 system-ui,sans-serif;font-variant-numeric:tabular-nums}\n.f4-ui-score[hidden],.f4-ui-score [hidden],.f4-ui-kit-hint[hidden],.f4-ui-replay-hint[hidden]{display:none!important}\n.f4-ui-live{margin-top:9px;padding:7px 0;border-top:1px solid #9cb1c333;border-bottom:1px solid #9cb1c333}\n.f4-ui-title{display:block;font-weight:850;letter-spacing:.035em}\n.f4-ui-detail,.f4-ui-neutral{color:#c6d3e0;font-size:10px;margin-top:3px}\n.f4-ui-numbers{display:flex;justify-content:space-between;gap:7px;margin:7px 0 4px;flex-wrap:wrap}\n.f4-ui-a{color:#85e6ec}.f4-ui-b{color:#ffc28a}\n.f4-ui-track{height:10px;background:#65717f;display:flex;justify-content:space-between;overflow:hidden;border-radius:4px}\n.f4-ui-fill-a{background:#69d7e1;flex:none}.f4-ui-fill-b{background:#ffad65;flex:none}\n.f4-ui-result{padding:18px 16px;margin-bottom:14px;background:linear-gradient(135deg,#102e40,#142031);border:1px solid #a6c3d45c;border-radius:12px}\n.f4-ui-result .f4-ui-title{font-size:34px;line-height:1.15}\n.f4-ui-result .f4-ui-numbers{font-size:clamp(14px,3vw,22px);margin:20px 0 8px}\n.f4-ui-result .f4-ui-track{height:24px;border-radius:5px}\n.f4-ui-result .f4-ui-neutral,.f4-ui-result .f4-ui-detail{font-size:12px}\n[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div,[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div+div,[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div+div+div{display:none}\n.f4-ui-replay-hint{font:650 12px/1.4 system-ui;margin:0 0 6px;color:#d5e7f2}\n.f4-ui-kit-hint{display:block;color:#fff;font-size:14px;margin:5px 0}\n[data-f4-ui-skin=\"true\"] #t21-f3-b378-weapon{font-size:15px!important;min-height:44px;border-radius:8px!important}\n[data-f4-ui-skin=\"true\"] #t21-f3-b378-weapon:focus-visible,[data-f4-ui-result=\"true\"] button:focus-visible{outline:3px solid #ffd269;outline-offset:3px}\n@media(max-width:480px){[data-f4-ui-skin=\"true\"] .f4-clock{font-size:27px!important}.f4-ui-result{padding:13px}.f4-ui-result .f4-ui-title{font-size:27px}}\n";
export function installF4PlayerPresentation(root,finish,ui) {
 const doc=root.ownerDocument,style=doc.createElement('style');
 style.textContent=F4_PLAYER_CSS+"\n[data-f4-ui-skin=\"true\"] .f4-ui-fill-a{background:var(--f4-ui-team-a,#839ba5)}\n[data-f4-ui-skin=\"true\"] .f4-ui-fill-b{background:var(--f4-ui-team-b,#9a8a93)}\n[data-f4-ui-result=\"true\"] .f4-ui-fill-a{background:var(--f4-ui-team-a,#839ba5)}\n[data-f4-ui-result=\"true\"] .f4-ui-fill-b{background:var(--f4-ui-team-b,#9a8a93)}\n[data-f4-ui-skin=\"true\"] .f4-ui-a,[data-f4-ui-result=\"true\"] .f4-ui-a{color:#e7f5fc}\n[data-f4-ui-skin=\"true\"] .f4-ui-b,[data-f4-ui-result=\"true\"] .f4-ui-b{color:#e7f5fc}\n.f4-ui-numbers span{border-bottom:3px solid var(--f4-ui-team-a,#839ba5);padding-bottom:2px}\n.f4-ui-numbers .f4-ui-b{border-color:var(--f4-ui-team-b,#9a8a93)}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-ink{background:var(--f4-ui-team-a,#8bc4d0)}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-sub[data-ready=\"true\"]{font-weight:800;color:#c0ffdc}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud[data-f4-ui-special-ready=\"true\"] .f4-special{background:#4b3915;border:1px solid #ffd269;border-radius:6px;padding:4px 6px}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud[data-f4-ui-low-hp=\"true\"] [data-bar=\"hp\"]{background:#ff8c82}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud[data-f4-ui-low-ink=\"true\"] [data-v=\"ink\"]{color:#ffd269}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-ink-track{position:relative}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-ink-track[data-f4-ui-threshold=\"true\"]::after{content:\"\";position:absolute;left:var(--f4-ui-sub-threshold);top:0;bottom:0;border-left:2px solid #fff;transform:translateX(-1px);pointer-events:none}\n.f4-ui-roster{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:7px 0 5px}\n.f4-ui-roster[hidden],.f4-ui-kit-preview[hidden]{display:none!important}\n.f4-ui-team{display:flex;align-items:center;gap:4px;justify-content:space-between}\n.f4-ui-team-label{font-size:10px;color:#e3edf7;white-space:nowrap}\n.f4-ui-pip{display:inline-grid;place-items:center;width:20px;height:20px;border:1px solid #c3d0dd7a;border-radius:5px;background:var(--f4-ui-team-a,#839ba5);color:#07101c;font:850 11px/1 system-ui}\n.f4-ui-team.enemy .f4-ui-pip{background:var(--f4-ui-team-b,#9a8a93)}\n.f4-ui-pip[data-status=\"SPLAT\"]{background:#233041!important;color:#ffbbba;border-color:#a96c73}\n.f4-ui-pip[data-status=\"REJOINING\"]{background:#273c48!important;color:#ffe0a0;border-style:dashed}\n.f4-ui-pip[data-status=\"UNKNOWN\"]{background:#303740!important;color:#e1e4e9;border-style:dotted}\n[data-f4-ui-roster=\"true\"] #t21-f3-b286-source-team,[data-f4-ui-roster=\"true\"] #t21-f3-b211-real-battle-roster{display:none!important}\n[data-f4-ui-battle=\"true\"] #t21-f3-b205-real-round{display:none!important}\n.f4-ui-kit-preview{display:grid;gap:3px;margin:8px 0 2px;padding:10px;background:#102c3b;border:1px solid #76bdcf66;border-radius:8px;text-align:left;color:#e8f3f9;font:650 12px/1.5 system-ui}\n.f4-ui-kit-preview strong{font-size:15px;color:#fff}\n[data-f4-ui-skin=\"true\"] #t21-f3-b202-real-pause{width:min(440px,calc(100vw - 24px))!important;max-height:calc(100dvh - 24px);overflow-y:auto;top:50%!important}\n[data-f4-ui-skin=\"true\"] #t21-f3-b202-resume,[data-f4-ui-result=\"true\"] #t21-f3-b59-restart{min-height:48px;font-size:15px!important}\n@media(max-width:480px){.f4-ui-roster{gap:7px}.f4-ui-pip{width:18px;height:18px}.f4-ui-team-label{font-size:9px}}\n";
 doc.head.append(style);
 const make=(tag,cls)=>{const n=doc.createElement(tag);n.className=cls;return n};
 const makeScore=(result)=>{
  const box=make('section',result?'f4-ui-score f4-ui-result':'f4-ui-score f4-ui-live');
  box.hidden=true;box.setAttribute('aria-label',result?'暫定試合結果':'暫定ナワバリ得点');
  const title=make('strong','f4-ui-title'),detail=make('div','f4-ui-detail'),numbers=make('div','f4-ui-numbers'),a=make('span','f4-ui-a'),b=make('span','f4-ui-b'),track=make('div','f4-ui-track'),fillA=make('span','f4-ui-fill-a'),fillB=make('span','f4-ui-fill-b'),neutral=make('div','f4-ui-neutral');
  numbers.append(a,b);track.append(fillA,fillB);track.setAttribute('aria-hidden','true');
  box.append(title,detail,numbers,track,neutral);
  return {box,title,detail,numbers,a,b,track,fillA,fillB,neutral};
 };
 const live=makeScore(false),result=makeScore(true);
 const stats=finish.querySelector('#t21-f3-b59-scroll-stats');
 const compact=root.querySelector('.f4-compact-hud');
 if(compact)compact.insertBefore(live.box,compact.querySelector('.f4-bars'));
 if(stats)stats.prepend(result.box);
 const rosterBox=make('section','f4-ui-roster');rosterBox.hidden=true;
 rosterBox.setAttribute('aria-label','実際の4対4生存状態');
 const pips=[];
 for(const team of ['ALLY','ENEMY']){
  const row=make('div','f4-ui-team'+(team==='ENEMY'?' enemy':''));
  const heading=make('span','f4-ui-team-label');heading.textContent=team==='ALLY'?'味方':'敵';row.append(heading);
  for(let i=0;i<4;i++){const pip=make('span','f4-ui-pip');pips.push(pip);row.append(pip)}
  rosterBox.append(row);
 }
 if(compact)compact.insertBefore(rosterBox,live.box);
 const choose=ui.querySelector('#t21-f3-b378-weapon'),label=ui.querySelector('#t21-f3-b378-native-practice-loadout');
 const hint=make('span','f4-ui-kit-hint');
 hint.textContent='使用ブキを選択 · 試合開始前のみ変更可能';
 hint.hidden=true;
 if(choose&&label)label.insertBefore(hint,choose);
 const kitPreview=make('div','f4-ui-kit-preview');kitPreview.hidden=true;
 const kitName=make('strong',''),kitSub=make('span',''),kitSpecial=make('span','');
 kitPreview.append(kitName,kitSub,kitSpecial);
 if(choose&&label)label.append(kitPreview);
 const pause=ui.querySelector('#t21-f3-b202-real-pause');
 const pauseTitle=pause?.querySelector('#t21-f3-b242-round-focus-title');
 const resume=pause?.querySelector('#t21-f3-b202-resume');
 const replayButton=finish.querySelector('#t21-f3-b59-restart');
 const originalReplay=replayButton?.textContent??'';
 const originalResume=resume?.textContent??'',originalPauseTitle=pauseTitle?.textContent??'';
 let localizedPause=false,localizedReplay=false;
 const replay=make('p','f4-ui-replay-hint');
 replay.textContent='もう一度遊ぶには、下の既存の再戦ボタンまたは R キー。';
 replay.hidden=true;
 const footer=finish.querySelector('#t21-f3-b59-footer-actions');
 if(footer)footer.prepend(replay);
 const str=(n,v)=>{if(n.textContent!==v)n.textContent=v};
 const hidden=(n,v)=>{if(n.hidden!==v)n.hidden=v};
 const data=(n,k,v)=>{if(n.dataset[k]!==v)n.dataset[k]=v};
 const width=(n,v)=>{const w=`${v??0}%`;if(n.style.width!==w)n.style.width=w};
 const color=(node,k,v)=>{if(v){if(node.style.getPropertyValue(k)!==v)node.style.setProperty(k,v)}else if(node.style.getPropertyValue(k))node.style.removeProperty(k)};
 const paint=(p,v)=>{
  data(p.box,'kind',v.kind);str(p.title,v.title);str(p.detail,v.detail);
  const known=v.a!==null&&v.b!==null;
  hidden(p.numbers,!known);hidden(p.track,!known);hidden(p.neutral,!known||v.neutral===null);
  if(known){str(p.a,`自チーム A ${v.a.toFixed(1)}%`);str(p.b,`敵チーム B ${v.b.toFixed(1)}%`);width(p.fillA,v.a);width(p.fillB,v.b);if(v.neutral!==null)str(p.neutral,`未塗装 ${v.neutral.toFixed(1)}%`)}
 };
 let disposed=false;
 return {
  render({score,matchState,paused,stopped,remainingSeconds,playerView,roster=null,teamColors=null,kit=null}){
   if(disposed)return;
   const active=playerView===true;
   data(root,'f4UiSkin',String(active));data(ui,'f4UiSkin',String(active));
   data(root,'f4UiUrgency',f4Urgency(remainingSeconds));
   const playing=active&&matchState==='PLAYING'&&!paused&&!stopped&&root.dataset.f4CompactActive==='true';
   const finished=active&&matchState==='TIME_UP'&&!stopped&&!finish.hidden&&finish.dataset.t21B59State==='FINISHED'&&!!stats;
   hidden(live.box,!playing||!compact);hidden(result.box,!finished);hidden(replay,!finished);
   data(root,'f4UiLive',String(playing&&!!compact));data(finish,'f4UiResult',String(finished));
   data(ui,'f4UiBattle',String(playing&&!!compact));
   const teamRows=playing&&compact?f4RosterView(roster):null;
   hidden(rosterBox,!teamRows);data(ui,'f4UiRoster',String(!!teamRows));
   if(teamRows)teamRows.forEach((r,i)=>{
    const pip=pips[i];data(pip,'status',r.status);
    str(pip,r.status==='SPLAT'?'×':r.status==='REJOINING'?'↻':r.status==='UNKNOWN'?'?':r.id==='YOU'?'自':'●');
    if(pip.title!==r.description)pip.title=r.description;
    if(pip.getAttribute('aria-label')!==r.description)pip.setAttribute('aria-label',r.description);
   });
   for(const node of [root,finish]){color(node,'--f4-ui-team-a',active?f4TeamColor(teamColors?.a):null);color(node,'--f4-ui-team-b',active?f4TeamColor(teamColors?.b):null)}
   const readyMenu=active&&!stopped&&matchState==='STAGING'&&!!choose&&!choose.disabled&&!!label&&!label.hidden&&label.style.display!=='none'&&!!pause&&!pause.hidden;
   const preview=readyMenu?f4KitPreview(kit):null;
   hidden(kitPreview,!preview);hidden(hint,!readyMenu);
   if(preview){str(kitName,preview.category+' · '+preview.name);str(kitSub,preview.sub);str(kitSpecial,preview.special)}
   const pauseState=pause?.dataset.t21B202NativeState;
   const canLocalize=active&&!stopped&&!!pause&&!pause.hidden&&!!pauseTitle&&!!resume&&
    (pauseState==='READY_TO_START'||pauseState==='NATIVE_PAUSED');
   if(canLocalize){
    str(pauseTitle,pauseState==='READY_TO_START'?'ナワバリバトル · 準備完了':'一時停止');
    str(resume,pauseState==='READY_TO_START'?'バトル開始 · 3分間':'バトルに戻る');localizedPause=true;
   }else if(localizedPause){if(pauseTitle&&['ナワバリバトル · 準備完了','一時停止'].includes(pauseTitle.textContent))str(pauseTitle,originalPauseTitle);if(resume&&['バトル開始 · 3分間','バトルに戻る'].includes(resume.textContent))str(resume,originalResume);localizedPause=false}
   if(finished&&replayButton&&!replayButton.disabled&&!replayButton.hidden){str(replayButton,'もう一度遊ぶ  ·  R');localizedReplay=true}
   else if(localizedReplay){if(replayButton&&replayButton.textContent==='もう一度遊ぶ  ·  R')str(replayButton,originalReplay);localizedReplay=false}
   if(playing)paint(live,f4TurfPresentation(score,matchState,stopped));
   if(finished){
    const v=f4TurfPresentation(score,matchState,stopped);paint(result,v);
    data(finish,'f4UiResult',String(v.kind==='FINAL'));
   }
  },
  dispose(){if(disposed)return;disposed=true;style.remove();live.box.remove();result.box.remove();hint.remove();replay.remove();rosterBox.remove();kitPreview.remove();
  if(localizedReplay&&replayButton&&replayButton.textContent==='もう一度遊ぶ  ·  R')str(replayButton,originalReplay);
  if(localizedPause){if(pauseTitle&&['ナワバリバトル · 準備完了','一時停止'].includes(pauseTitle.textContent))str(pauseTitle,originalPauseTitle);if(resume&&['バトル開始 · 3分間','バトルに戻る'].includes(resume.textContent))str(resume,originalResume)}
  for(const node of [root,finish]){color(node,'--f4-ui-team-a',null);color(node,'--f4-ui-team-b',null)}
  delete ui.dataset.f4UiRoster;delete ui.dataset.f4UiBattle;delete root.dataset.f4UiSkin;delete root.dataset.f4UiLive;delete root.dataset.f4UiUrgency;delete ui.dataset.f4UiSkin;delete finish.dataset.f4UiResult;}
 };
}
