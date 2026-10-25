/** B211: real source CPU life/HP overview for the player. Zero game authority. */
export interface B211Actor {
 id:string;mobilityState:string;rejoined:boolean;
 lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';hp:number|null;
 physicalFoot:readonly number[];
}
export interface B211NativeInput {
 selected:boolean;tick:number;stage:readonly number[];
 matchState:'STAGING'|'PLAYING'|'TIME_UP';paused:boolean;stopReason:string|null;
 humanHp:number;humanDirectHits:number;humanDirectSplats:number;
 cpuSplats:number;cpuRespawns:number;cpu:readonly B211Actor[];
}
const IDS=['A1','A2','A3','B1','B2','B3','B4'] as const;
export function b211RealNativeRoster(v:B211NativeInput){
 if(!v.selected||v.stage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(v.tick)||v.tick<0||
    !Number.isFinite(v.humanHp)||v.humanHp<0||v.humanHp>100||
    ![v.humanDirectHits,v.humanDirectSplats,v.cpuSplats,v.cpuRespawns]
      .every(n=>Number.isSafeInteger(n)&&n>=0)||
    v.humanDirectSplats>v.humanDirectHits||v.cpu.length!==7||
    new Set(v.cpu.map(x=>x.id)).size!==7||
    v.cpu.some(x=>!IDS.includes(x.id as typeof IDS[number])||
      !['ACTIVE','SPLATTED','UNKNOWN'].includes(x.lifeState)||
      x.physicalFoot.length!==3||!x.physicalFoot.every(Number.isFinite)||
      x.hp!==null&&(!Number.isFinite(x.hp)||x.hp<0||x.hp>100)))return null;
 const byId=new Map(v.cpu.map(x=>[x.id,x]));
 const rows=IDS.map(id=>{
  const x=byId.get(id)!;
  const status=x.lifeState==='SPLATTED'?'SPLAT':
   x.lifeState==='UNKNOWN'?'UNKNOWN':x.rejoined?'ACTIVE':'REJOINING';
  return {id,team:id[0]==='A'?'ALLY' as const:'ENEMY' as const,
   hp:x.lifeState==='ACTIVE'?x.hp:null,status};
 });
 const format=(r:typeof rows[number])=>r.id+' '+r.status+
   (r.hp===null?'':' HP '+Math.round(r.hp));
 return {rows,tick:v.tick,phase:v.stopReason?'SAFE STOP':
  v.paused?'PAUSED':v.matchState,
  humanHp:v.humanHp,realHumanHits:v.humanDirectHits,
  realHumanSplats:v.humanDirectSplats,
  cpuSplats:v.cpuSplats,cpuRespawns:v.cpuRespawns,
  text:['REAL 1 + 7 · SOURCE COMBAT',
   'YOU '+(v.humanHp===0?'SPLATTED':'ACTIVE')+' HP '+Math.round(v.humanHp),
   'ALLY · '+rows.slice(0,3).map(format).join(' | '),
   'ENEMY · '+rows.slice(3).map(format).join(' | '),
   'REAL DIRECT HITS '+v.humanDirectHits+
    ' · HUMAN CPU SPLATS '+v.humanDirectSplats,
   'REAL CPU SPLATS '+v.cpuSplats+' · RESPAWNS '+v.cpuRespawns,
   'UNSCORED · CROSS-TEAM ROUTES 0/12 HOLD'].join('\n'),
  sourceScoreable:0 as const,officialWinner:'NONE' as const,
  naturalEnemyEncounterCertified:false as const};
}
export function createB211RealBattleRoster(ui:HTMLElement){
 const el=document.createElement('aside');
 el.id='t21-f3-b211-real-battle-roster';
 el.style.cssText='position:fixed;top:185px;right:14px;z-index:36;'+
  'pointer-events:none;box-sizing:border-box;width:220px;'+
  'max-width:calc(100vw - 28px);border:1px solid #65b5c0;'+
  'border-radius:10px;background:rgba(3,27,38,.91);'+
  'color:#ddf8fb;padding:8px 10px;'+
  'font:700 10px/1.5 system-ui;white-space:pre-line;';
 el.dataset.sourceOnly='true';el.dataset.scoreable='0';
 el.dataset.officialWinner='NONE';el.dataset.certifiedEnemyRoutes='0';
 el.hidden=true;ui.appendChild(el);
 return {el,render:(v:ReturnType<typeof b211RealNativeRoster>,hide:boolean)=>{
  el.hidden=!v||hide;
  if(v){if(el.textContent!==v.text)el.textContent=v.text;
   el.dataset.nativeTick=String(v.tick);
   el.dataset.realCpuCount=String(v.rows.length);
   el.dataset.humanDirectHits=String(v.realHumanHits);
   el.dataset.actualCpuRespawns=String(v.cpuRespawns);
   el.dataset.actualEnemyEncounterCertified='false';
  }
 }};
}
