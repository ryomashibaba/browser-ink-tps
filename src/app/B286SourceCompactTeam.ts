/**
 * B286 player-facing condensed REAL source CPU life only.
 * Consumes the already validated B211 native roster; never computes scores,
 * proximity, attack targets, or route/encounter certification.
 */
import {type b211RealNativeRoster} from './B211NativeBattleRoster';

type NativeRoster=NonNullable<ReturnType<typeof b211RealNativeRoster>>;
export function b286CompactNativeRoster(v:NativeRoster|null){
 if(!v||v.sourceScoreable!==0||v.officialWinner!=='NONE'||
  v.naturalEnemyEncounterCertified!==false||v.rows.length!==7||
  !Number.isSafeInteger(v.tick)||v.tick<0)return null;
 const expected=['A1','A2','A3','B1','B2','B3','B4'];
 for(let i=0;i<expected.length;i++){
  const row=v.rows[i];
  if(!row||row.id!==expected[i]||
   row.team!==(i<3?'ALLY':'ENEMY')||
   !['ACTIVE','SPLAT','UNKNOWN','REJOINING'].includes(row.status)||
   (row.status==='ACTIVE'&&
    (row.hp===null||!Number.isFinite(row.hp)||row.hp<=0||row.hp>100)))
   return null;
 }
 const allyActive=v.rows.slice(0,3).filter(x=>x.status==='ACTIVE').length;
 const enemyActive=v.rows.slice(3).filter(x=>x.status==='ACTIVE').length;
 const splatted=v.rows.filter(x=>x.status==='SPLAT').length;
 const notJoined=v.rows.filter(x=>x.status==='REJOINING').length;
 return {
  tick:v.tick,allyActive,enemyActive,splatted,notJoined,
  phase:v.phase,
  headline:'SOURCE-LOCAL TEAM · NO SCORE' as const,
  counts:'ALLIES '+allyActive+'/3  ·  OPPONENTS '+enemyActive+'/4',
  detail:notJoined>0?'CPU REJOINING '+notJoined+'/7':
   splatted>0?'REAL SPLATS '+splatted+' · RESPAWNS '+v.cpuRespawns:
   'REAL CPU STATUS · NOT A CONTACT CLAIM',
  originalCrossTeamEncounterCertified:false as const,
  officialWinner:'NONE' as const,sourceScoreable:0 as const,
  actorsRelocated:0 as const,gameplayWrites:0 as const
 };
}

export function createB286CompactSourceTeam(ui:HTMLElement){
 const root=document.createElement('aside');
 root.id='t21-f3-b286-source-team';
 root.hidden=true;
 root.setAttribute('aria-label','Real source-only allies and opponents, not score');
 root.setAttribute('aria-live','off');
 root.dataset.scoreable='0';
 root.dataset.officialWinner='NONE';
 root.dataset.enemyContactCertified='false';
 root.dataset.gameplayWrites='0';
 root.style.cssText=
  'position:fixed;right:14px;top:14px;z-index:37;pointer-events:none;'+
  'width:min(212px,calc(100vw - 28px));box-sizing:border-box;'+
  'padding:10px 12px;border-radius:11px;border:1px solid #65c8d4;'+
  'color:#edfcff;background:rgba(5,28,42,.88);'+
  'box-shadow:0 9px 25px rgba(0,14,29,.25);'+
  'font:700 11px/1.45 system-ui;'+
  'font-variant-numeric:tabular-nums;';
 const heading=document.createElement('div');
 heading.textContent='SOURCE TEAM · UNSCORED';
 heading.style.cssText='font-size:10px;letter-spacing:.7px;color:#87dfe7;';
 const counts=document.createElement('div');
 counts.id='t21-f3-b286-team-counts';
 counts.style.cssText='font-size:13px;margin-top:4px;color:#f1fcff;';
 const detail=document.createElement('div');
 detail.id='t21-f3-b286-team-detail';
 detail.style.cssText='font-size:9px;margin-top:4px;color:#d7e8ee;';
 root.append(heading,counts,detail);
 ui.appendChild(root);
 return {root,render:(roster:NativeRoster|null,surveyOrGallery:boolean)=>{
  const value=surveyOrGallery?null:b286CompactNativeRoster(roster);
  root.hidden=!value;
  if(!value)return;
  if(counts.textContent!==value.counts)counts.textContent=value.counts;
  if(detail.textContent!==value.detail)detail.textContent=value.detail;
  root.dataset.nativeTick=String(value.tick);
  root.dataset.allyActive=String(value.allyActive);
  root.dataset.enemyActive=String(value.enemyActive);
  root.dataset.rejoining=String(value.notJoined);
  root.dataset.phase=value.phase;
 }};
}
