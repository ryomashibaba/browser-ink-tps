#!/usr/bin/env node
/** B414: verify real visible UI separately from true B413 source game.
 * Reads only post-game original CDP and DOM evidence; no gameplay writes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const check=(v,s)=>{if(!v)throw Error('B414_REAL_PLAYER_INK_HUD_HOLD_'+s)};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function visible(x,label){
 check(x?.phase==='PLAYING'&&x.paused===false&&x.original==='25/17/26/0'&&
  x.winner==='NONE'&&x.scoreable==='0'&&x.hudWinner==='NONE'&&
  x.cpu===7&&x.relocated===0&&x.focused==='true'&&x.visible===true&&
  Number.isSafeInteger(x.tick)&&Number.isSafeInteger(x.renderTick)&&
  x.renderTick<=x.tick&&x.tick-x.renderTick<=120&&
  finite(x.ink)&&finite(x.hudInk)&&x.ink>=0&&x.ink<=100.01&&
  x.hudInk>=0&&x.hudInk<=100.01&&Math.abs(x.ink-x.hudInk)<6&&
  x.width===x.hudInk.toFixed(2)+'%'&&
  x.text?.includes('LIVE INK '+Math.round(x.hudInk)+'/100'),
  'ORIGINAL_VISIBLE_'+label);
}
export function auditB414(hud,raw,b413,b411,round){
 check(hud?.schema==='B414_READ_ONLY_REAL_CHROMIUM_DOM'&&
  Array.isArray(hud.samples)&&
  b413?.verdict==='PASS_REAL_ORIGINAL_SOURCE_SHOT_INK_CONSUMPTION_SQUID_OWN_RECOVERY_AND_RESHOT'&&
  b411?.verdict==='PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY'&&
  round?.samples?.at(-1)?.tick===b413.trueTimeUpTick&&
  round.samples.at(-1).matchState==='TIME_UP','ONE_REAL_SOURCE_ROUND');
 const get=k=>hud.samples.find(s=>s.label===k);
 const keys=['BEFORE_SQUID_BEFORE','BEFORE_SQUID_AFTER','HUMAN_RETURN',
  'AFTER_SQUID_BEFORE','AFTER_SQUID_AFTER'];
 const [start,spent,returned,preReshot,reshot]=keys.map(k=>{
  const x=get(k);visible(x,k);return x});
 check(start.tick<=spent.tick&&spent.tick<returned.tick&&
  returned.tick<=preReshot.tick&&preReshot.tick<=reshot.tick&&
  [start,spent,returned,preReshot,reshot].every(x=>x.hudMode==='HUMAN')&&
  start.hudInk-spent.hudInk>4&&
  returned.hudInk-spent.hudInk>.25&&
  preReshot.hudInk-reshot.hudInk>4,'ACTUAL_VISIBLE_INK_SPEND_AND_REFILL');
 const own=hud.samples.filter(s=>s.label==='SQUID_OWN');
 check(own.length>0&&own.length<=8,'REAL_SWIM_HUD_SAMPLES_REQUIRED');
 own.forEach(x=>visible(x,'SQUID_OWN'));
 const seen=own.filter(x=>x.hudMode==='SQUID'&&x.hudRecovery==='SQUID_OWN'&&
  x.mode==='SQUID'&&x.recovery==='SQUID_OWN'&&
  x.relation==='OWN'&&x.text?.includes('OWN INK · REFILLING'));
 check(seen.length>0&&seen.some(x=>x.tick>spent.tick&&x.tick<returned.tick)&&
  raw.pre?.sourceInkDifference>=4&&raw.post?.sourceInkDifference>=4&&
  b413.genuineObservedSquidOwnInkGain>.25,'OWN_RESOURCE_VISIBLE');
 const end=get('TIME_UP');
 check(end?.phase==='TIME_UP'&&end.tick===b413.trueTimeUpTick&&
  end.visible===false&&end.focused==='false'&&
  end.original==='25/17/26/0'&&end.scoreable==='0'&&
  end.winner==='NONE','ACTUAL_TIME_UP_NOT_LIVE');
 return {schema:'B414_INDEPENDENT_ORIGINAL_NATIVE_HUD',
  verdict:'PASS_VISIBLE_REAL_SHOT_OWN_REFILL_RESHOT_IN_ONE_180S',
  beforeInk:start.hudInk,afterShotInk:spent.hudInk,
  ownRefillHudFrames:seen.length,afterReturnInk:returned.hudInk,
  afterReshotInk:reshot.hudInk,timeUpTick:end.tick,
  original:'25/17/26/0',scoreable:0,officialWinner:'NONE',
  full4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];check(!!dir,'NATIVE_CHROME_ARTIFACT_REQUIRED');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const raw=read('b413-real-original-ink-fire-refill-fire.json');
 const verdict=auditB414(raw.hud,raw,
  read('b413-independent-original-ink-economy-verdict.json'),
  read('b411-independent-native-hud-verdict.json'),
  read('b409-one-original-route-180s.json'));
 writeFileSync(join(dir,'b414-independent-native-ink-hud-verdict.json'),
  JSON.stringify(verdict,null,2)+'\n');
 console.log('B414_INDEPENDENT_ACTUAL_PLAYER_INK_HUD',JSON.stringify(verdict));
}
