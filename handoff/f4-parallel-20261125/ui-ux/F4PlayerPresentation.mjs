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
const F4_PLAYER_CSS="\n[data-f4-ui-skin=\"true\"][data-f4-compact-active=\"true\"]{width:min(350px,calc(100vw - 24px))!important;background:linear-gradient(145deg,#111d2aee,#07131fee)!important;border:1px solid #73899b75!important;border-radius:12px!important;box-shadow:0 5px 20px #0006!important;padding:10px 13px!important}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-clock{font-size:34px;letter-spacing:-1px;font-weight:900}\n[data-f4-ui-urgency=\"soon\"] .f4-clock{color:#ffd27b}\n[data-f4-ui-urgency=\"critical\"] .f4-clock{color:#ffab9f}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-track{height:9px;background:#53617088}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-fill{border-radius:3px}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-ink{background:#f2a4e2}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-sp{background:#ffd269}\n[data-f4-ui-skin=\"true\"] .f4-compact-hud .f4-notice{background:#652f34;border-radius:6px;padding:5px 8px}\n[data-f4-ui-live=\"true\"] .f4-meta{display:none}\n.f4-ui-score{box-sizing:border-box;color:#edf5fd;font:650 12px/1.4 system-ui,sans-serif;font-variant-numeric:tabular-nums}\n.f4-ui-score[hidden],.f4-ui-score [hidden],.f4-ui-kit-hint[hidden],.f4-ui-replay-hint[hidden]{display:none!important}\n.f4-ui-live{margin-top:9px;padding:7px 0;border-top:1px solid #9cb1c333;border-bottom:1px solid #9cb1c333}\n.f4-ui-title{display:block;font-weight:850;letter-spacing:.035em}\n.f4-ui-detail,.f4-ui-neutral{color:#c6d3e0;font-size:10px;margin-top:3px}\n.f4-ui-numbers{display:flex;justify-content:space-between;gap:7px;margin:7px 0 4px;flex-wrap:wrap}\n.f4-ui-a{color:#85e6ec}.f4-ui-b{color:#ffc28a}\n.f4-ui-track{height:10px;background:#65717f;display:flex;justify-content:space-between;overflow:hidden;border-radius:4px}\n.f4-ui-fill-a{background:#69d7e1;flex:none}.f4-ui-fill-b{background:#ffad65;flex:none}\n.f4-ui-result{padding:18px 16px;margin-bottom:14px;background:linear-gradient(135deg,#102e40,#142031);border:1px solid #a6c3d45c;border-radius:12px}\n.f4-ui-result .f4-ui-title{font-size:34px;line-height:1.15}\n.f4-ui-result .f4-ui-numbers{font-size:clamp(14px,3vw,22px);margin:20px 0 8px}\n.f4-ui-result .f4-ui-track{height:24px;border-radius:5px}\n.f4-ui-result .f4-ui-neutral,.f4-ui-result .f4-ui-detail{font-size:12px}\n[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div,[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div+div,[data-f4-ui-result=\"true\"] #t21-f3-b59-scroll-stats>.f4-ui-result+div+div+div{display:none}\n.f4-ui-replay-hint{font:650 12px/1.4 system-ui;margin:0 0 6px;color:#d5e7f2}\n.f4-ui-kit-hint{display:block;color:#fff;font-size:14px;margin:5px 0}\n[data-f4-ui-skin=\"true\"] #t21-f3-b378-weapon{font-size:15px!important;min-height:44px;border-radius:8px!important}\n[data-f4-ui-skin=\"true\"] #t21-f3-b378-weapon:focus-visible,[data-f4-ui-result=\"true\"] button:focus-visible{outline:3px solid #ffd269;outline-offset:3px}\n@media(max-width:480px){[data-f4-ui-skin=\"true\"] .f4-clock{font-size:27px!important}.f4-ui-result{padding:13px}.f4-ui-result .f4-ui-title{font-size:27px}}\n";
export function installF4PlayerPresentation(root,finish,ui) {
 const doc=root.ownerDocument,style=doc.createElement('style');
 style.textContent=F4_PLAYER_CSS;
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
 const choose=ui.querySelector('#t21-f3-b378-weapon'),label=ui.querySelector('#t21-f3-b378-native-practice-loadout');
 const hint=make('span','f4-ui-kit-hint');
 hint.textContent='使用ブキを選択 · 試合開始前のみ変更可能';
 hint.hidden=true;
 if(choose&&label)label.insertBefore(hint,choose);
 const replay=make('p','f4-ui-replay-hint');
 replay.textContent='もう一度遊ぶには、下の既存の再戦ボタンまたは R キー。';
 replay.hidden=true;
 const footer=finish.querySelector('#t21-f3-b59-footer-actions');
 if(footer)footer.prepend(replay);
 const str=(n,v)=>{if(n.textContent!==v)n.textContent=v};
 const hidden=(n,v)=>{if(n.hidden!==v)n.hidden=v};
 const data=(n,k,v)=>{if(n.dataset[k]!==v)n.dataset[k]=v};
 const width=(n,v)=>{const w=`${v??0}%`;if(n.style.width!==w)n.style.width=w};
 const paint=(p,v)=>{
  data(p.box,'kind',v.kind);str(p.title,v.title);str(p.detail,v.detail);
  const known=v.a!==null&&v.b!==null;
  hidden(p.numbers,!known);hidden(p.track,!known);hidden(p.neutral,!known||v.neutral===null);
  if(known){str(p.a,`自チーム A ${v.a.toFixed(1)}%`);str(p.b,`敵チーム B ${v.b.toFixed(1)}%`);width(p.fillA,v.a);width(p.fillB,v.b);if(v.neutral!==null)str(p.neutral,`未塗装 ${v.neutral.toFixed(1)}%`)}
 };
 let disposed=false;
 return {
  render({score,matchState,paused,stopped,remainingSeconds,playerView}){
   if(disposed)return;
   const active=playerView===true;
   data(root,'f4UiSkin',String(active));data(ui,'f4UiSkin',String(active));
   data(root,'f4UiUrgency',f4Urgency(remainingSeconds));
   const playing=active&&matchState==='PLAYING'&&!paused&&!stopped&&root.dataset.f4CompactActive==='true';
   const finished=active&&matchState==='TIME_UP'&&!stopped&&!finish.hidden&&finish.dataset.t21B59State==='FINISHED'&&!!stats;
   hidden(live.box,!playing||!compact);hidden(result.box,!finished);hidden(hint,!active);hidden(replay,!finished);
   data(root,'f4UiLive',String(playing&&!!compact));data(finish,'f4UiResult',String(finished));
   if(playing)paint(live,f4TurfPresentation(score,matchState,stopped));
   if(finished)paint(result,f4TurfPresentation(score,matchState,stopped));
  },
  dispose(){if(disposed)return;disposed=true;style.remove();live.box.remove();result.box.remove();hint.remove();replay.remove();delete root.dataset.f4UiSkin;delete root.dataset.f4UiLive;delete root.dataset.f4UiUrgency;delete ui.dataset.f4UiSkin;delete finish.dataset.f4UiResult;}
 };
}
