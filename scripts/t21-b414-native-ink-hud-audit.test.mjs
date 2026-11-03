import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB414} from './t21-b414-native-ink-hud-audit.mjs';
const mk=(label,tick,ink,mode='HUMAN',rec='HUMAN',relation='NEUTRAL')=>({
 label,tick,phase:'PLAYING',paused:false,original:'25/17/26/0',
 winner:'NONE',scoreable:'0',hudWinner:'NONE',cpu:7,relocated:0,
 focused:'true',visible:true,ink,mode,recovery:rec,relation,hudInk:ink,
 hudMode:mode,hudRecovery:rec,renderTick:tick-1,
 width:Number(ink.toFixed(2))+'%',text:'LIVE INK '+Math.round(ink)+'/100 · '+
 (rec==='SQUID_OWN'?'OWN INK · REFILLING':'HUMAN')});
function fixture(){return {schema:'B414_READ_ONLY_REAL_CHROMIUM_DOM',samples:[
 mk('BEFORE_SQUID_BEFORE',6500,100),
 mk('BEFORE_SQUID_AFTER',6580,83.85),
 mk('SQUID_OWN',6590,86,'SQUID','SQUID_OWN','OWN'),
 mk('SQUID_OWN',6600,90,'SQUID','SQUID_OWN','OWN'),
 mk('HUMAN_RETURN',6650,96),
 mk('AFTER_SQUID_BEFORE',6660,96),
 mk('AFTER_SQUID_AFTER',6700,83),
 {...mk('TIME_UP',11857,83),phase:'TIME_UP',focused:'false',visible:false}
 ]};}
const raw={pre:{sourceInkDifference:16},post:{sourceInkDifference:13}};
const p={verdict:'PASS_REAL_ORIGINAL_SOURCE_SHOT_INK_CONSUMPTION_SQUID_OWN_RECOVERY_AND_RESHOT',trueTimeUpTick:11857,genuineObservedSquidOwnInkGain:5};
const ui={verdict:'PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY'};
const round={samples:[{tick:11857,matchState:'TIME_UP'}]};
test('true SOURCE ink HUD follows real spend OWN refill and re-shot',()=>{
 assert.equal(auditB414(fixture(),raw,p,ui,round).ownRefillHudFrames,2)});
test('never grant bogus ink/status/source/timeUP to independent HUD',()=>{
 for(const edit of [
  x=>x.samples[1].hudInk=100,x=>x.samples[1].width='100%',
  x=>{x.samples[2].relation='ENEMY';x.samples[3].relation='ENEMY'},x=>{x.samples[2].hudMode='HUMAN';x.samples[3].hudMode='HUMAN'},
  x=>x.samples[4].hudInk=83,x=>x.samples[6].renderTick=20000,
  x=>x.samples[0].scoreable='1',x=>x.samples[7].visible=true
 ]){const d=fixture();edit(d);assert.throws(()=>auditB414(d,raw,p,ui,round),
 /B414_REAL_PLAYER_INK_HUD_HOLD_/);}
});

test('actual Chromium CSSOM normalized percentages keep true native HUD source checks exact',()=>{
 const d=fixture();
 assert.equal(d.samples[0].width,'100%');
 const row=d.samples[1];
 row.ink=82.9;row.hudInk=82.9;row.width='82.9%';
 row.text='LIVE INK 83/100 · HUMAN';
 assert.equal(auditB414(d,raw,p,ui,round).afterShotInk,82.9);
 // A made-up unnormalized browser width or mismatched actual mode fails.
 row.width='82.90%';
 assert.throws(()=>auditB414(d,raw,p,ui,round),
 /B414_REAL_PLAYER_INK_HUD_HOLD_/);
 row.width='82.9%';row.hudMode='SQUID';
 assert.throws(()=>auditB414(d,raw,p,ui,round),
 /B414_REAL_PLAYER_INK_HUD_HOLD_/);
});
