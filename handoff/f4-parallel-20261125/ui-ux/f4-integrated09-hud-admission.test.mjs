import {compactF4View as view} from './CompactF4Hud.mjs';
const frame={"hp":100,"ink":70,"remainingSeconds":50,"inkRelation":"OWN"},kit={"weapon":"A","sub":"B","subCost":70,"subUsable":true,"special":"C","controls":"test"},special={"provisional":true,"required":200,"points":200,"executorReady":true,"ready":true,"active":false};
const checks=[
 view(frame,kit,special).specialStatus==='G 発動入力可',
 view(frame,kit,{...special,ready:false}).specialStatus==='満タン · 現在発動不可',
 view(frame,kit,{...special,ready:false,probeState:'LOCKED'}).specialStatus==='終了動作中',
 view({...frame,hp:0,respawnTicks:90},kit,special).specialStatus==='復活待ち',
 view(frame,kit,{...special,active:true}).specialStatus==='発動中',
 view(frame,kit,{...special,points:140}).specialStatus==='70%',
 view(frame,kit,{...special,executorReady:false}).specialStatus==='準備中 / 実行未接続',
 view(frame,kit,special).scoreLabel==='暫定得点面',
 view(frame,{...kit,turfLabel:'actual'},special).scoreLabel==='actual',
 view(frame,kit,{...special,provisional:false,authorityComplete:true}).specialStatus==='G 発動可能',
 view(frame,{...kit,probe:true},{...special,probeState:'AVAILABLE'}).specialStatus==='G 単独検証',
 view(frame,kit,special).subReady&&!view({...frame,ink:69.9},kit,special).subReady
];
if(!checks.every(Boolean))throw Error('HUD gate regression '+checks.indexOf(false));
console.log('PASS',checks.length);
