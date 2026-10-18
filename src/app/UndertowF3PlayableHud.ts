/**
 * W10-B17 readable, explicitly NON-SCORING gameplay HUD. All values are
 * read-only projections of the existing F3 native simulation snapshot.
 * No score mask, win/loss inference, opponent positions or CPU authority.
 */
export interface F3PlayableHudState {
 player:{hp:number;ink:number};
 matchState:string;
 timeRemainingSeconds:number;
 cpu:{physicalRejoins:readonly string[];freeCombatEnabled:boolean};
 shotsFired:number;
 cpuSourceTurfShots:number;
 cpuSplats:number;
 humanSplats:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 stopReason:string|null;
 paused:boolean;
}
const clampPercent=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0;
export function formatF3PlayableHud(s:F3PlayableHudState){
 // Never turn this nonproduction lab into an inferred winner or a scored match.
 if(s.sourceScoreablePromotions!==0||s.productionAuthorized!==false)
  throw Error('T21_W10B17_HUD_MUST_NEVER_CERTIFY_TURF_SCORE');
 const seconds=Number.isFinite(s.timeRemainingSeconds)?
  Math.max(0,Math.ceil(s.timeRemainingSeconds)):0;
 const minutes=Math.floor(seconds/60);
 const rest=String(seconds%60).padStart(2,'0');
 const cpuCount=Math.max(0,Math.min(7,s.cpu.physicalRejoins.length));
 return {
  clock:`${minutes}:${rest}`,
  hp:clampPercent(s.player.hp),
  ink:clampPercent(s.player.ink),
  cpuRecovered:cpuCount,
  sourceState:cpuCount===7&&s.cpu.freeCombatEnabled?
   'SOURCE-LOCAL PATROL':'SOURCE DROP / REJOIN',
  sessionState:s.stopReason?'SAFE STOP':s.matchState==='TIME_UP'?
   'TIME COMPLETE — NO WINNER':s.paused?'PAUSED':
   s.matchState==='STAGING'?'SOURCE STAGING':'SOURCE PRACTICE',
  humanShots:Math.max(0,Math.floor(s.shotsFired)),
  cpuTurfShots:Math.max(0,Math.floor(s.cpuSourceTurfShots)),
  cpuSplats:Math.max(0,Math.floor(s.cpuSplats)),
  humanSplats:Math.max(0,Math.floor(s.humanSplats)),
  scoring:'UNSCORED / NO OFFICIAL RESULT' as const,
  originalCrossTeamContactCertified:false as const,
  productionAuthorized:false as const
 };
}
export function createF3PlayableHud(ui:HTMLElement){
 const root=document.createElement('section');
 root.id='t21-f3-practice-hud';
 root.setAttribute('aria-label','Undertow non-scoring practice status');
 root.dataset.sourceScoreable='0';
 root.dataset.productionAuthority='NONE';
 root.style.cssText=
  'position:fixed;top:14px;left:50%;transform:translateX(-50%);'+
  'z-index:37;pointer-events:none;box-sizing:border-box;'+
  'width:min(368px,calc(100vw - 28px));padding:11px 15px 10px;'+
  'color:#f1fcff;background:linear-gradient(130deg,rgba(4,21,35,.94),rgba(13,43,56,.91));'+
  'border:1px solid rgba(73,223,235,.43);border-radius:12px;'+
  'box-shadow:0 12px 42px #001624b5;'+
  'font:600 12px/1.3 system-ui,sans-serif;font-variant-numeric:tabular-nums';
 root.innerHTML=
  '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'+
   '<span id="t21-f3-hud-clock" style="font-size:24px;font-weight:850;letter-spacing:.5px">3:00</span>'+
   '<span id="t21-f3-hud-state" style="font-size:10px;text-align:right;letter-spacing:.7px;color:#90e8f2">SOURCE STAGING</span>'+
  '</div>'+
  '<div style="display:grid;grid-template-columns:24px 1fr 24px 1fr;align-items:center;gap:7px;margin-top:7px">'+
   '<span>HP</span><div style="height:7px;background:#ffffff22;border-radius:6px;overflow:hidden">'+
    '<div id="t21-f3-hud-hp-bar" style="width:100%;height:100%;background:#53e4ea;border-radius:6px"></div></div>'+
   '<span>INK</span><div style="height:7px;background:#ffffff22;border-radius:6px;overflow:hidden">'+
    '<div id="t21-f3-hud-ink-bar" style="width:100%;height:100%;background:#ed4a9c;border-radius:6px"></div></div>'+
  '</div>'+
  '<div style="display:flex;justify-content:space-between;gap:6px;margin-top:7px;color:#c7e6eb;font-size:10px">'+
   '<span id="t21-f3-hud-vitals">HP 100 · INK 100</span>'+
   '<span id="t21-f3-hud-cpu">CPU 0/7</span>'+
  '</div>'+
  '<div id="t21-f3-hud-practice" style="font-size:10px;margin-top:5px;color:#ffc59b">'+
   'UNSCORED / NO OFFICIAL RESULT</div>';
 ui.appendChild(root);
 const select=(id:string):HTMLElement=>{
  const element=root.querySelector<HTMLElement>('#'+id);
  if(!element)throw Error('T21_W10B17_HUD_MARKUP_MISSING_'+id);
  return element;
 };
 const clock=select('t21-f3-hud-clock');
 const state=select('t21-f3-hud-state');
 const hpBar=select('t21-f3-hud-hp-bar');
 const inkBar=select('t21-f3-hud-ink-bar');
 const vitals=select('t21-f3-hud-vitals');
 const cpu=select('t21-f3-hud-cpu');
 const practice=select('t21-f3-hud-practice');
 function render(value:F3PlayableHudState){
  const v=formatF3PlayableHud(value);
  clock.textContent=v.clock;
  state.textContent=v.sessionState;
  state.style.color=value.stopReason?'#ff8790':'#90e8f2';
  hpBar.style.width=v.hp+'%';
  hpBar.style.background=v.hp<=30?'#ff8888':'#53e4ea';
  inkBar.style.width=v.ink+'%';
  vitals.textContent='HP '+v.hp+' · INK '+v.ink;
  cpu.textContent='CPU '+v.cpuRecovered+'/7 · '+v.sourceState;
  practice.textContent=v.scoring;
  root.dataset.matchState=value.matchState;
  root.dataset.cpuRecovered=String(v.cpuRecovered);
  root.dataset.humanShots=String(v.humanShots);
  root.dataset.cpuTurfShots=String(v.cpuTurfShots);
  root.dataset.humanSplats=String(v.humanSplats);
  root.dataset.cpuSplats=String(v.cpuSplats);
  root.dataset.humanHp=String(v.hp);
  root.dataset.humanInk=String(v.ink);
  root.dataset.clock=v.clock;
  root.dataset.cpuSourceOnly='true';
  root.dataset.crossTeamContactCertified='false';
 }
 return {root,render};
}
