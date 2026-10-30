#!/usr/bin/env node
/** B355 independent genuine source ink/HUD read-only witness audit. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const check=(b,s)=>{if(!b)throw Error('B355_NATIVE_INK_'+s);};
const nat=n=>Number.isSafeInteger(n)&&n>=0;
export function auditB355RealInkRecovery(e){
 check(e?.schema==='B355_REAL_SOURCE_NATIVE_INK_RECOVERY'&&
 e.source==='25/17/26/0'&&e.actualNativeCDP===true&&
 e.fakeShots===false&&e.fakeTicks===false&&e.fakeInk===false&&
 e.originalScoreable===0&&e.productionAuthorized===false&&
 e.playerOnlyReadout===true&&e.NintendoExactInkBalanceCertified===false,
 'ORIGINAL_TRUST');
 const a=e.shotRelease,b=e.afterRealRecovery;
 check(a&&b&&nat(a.tick)&&nat(b.tick)&&
 b.tick-a.tick>=60&&b.tick>a.tick&&
 a.ink>=0&&a.ink<=100&&Number.isFinite(a.ink)&&
 Number.isFinite(b.ink)&&b.ink<=100&&
 b.ink>a.ink+.5&&nat(a.humanShots)&&
 b.humanShots===a.humanShots&&nat(a.nativePhysicalLaunches)&&
 a.nativePhysicalLaunches===10&&
 b.nativePhysicalLaunches===a.nativePhysicalLaunches&&
 nat(a.genuineOriginalChangedCells)&&
 b.genuineOriginalChangedCells>=a.genuineOriginalChangedCells&&
 ['LOCKED','HUMAN'].includes(a.resourceState)&&
 ['HUMAN','LOCKED'].includes(b.resourceState),
 'REAL_NO_NEW_SHOTS_REFILL');
 const h=e.truePlayerHud;
 check(h?.exists===true&&h.hidden===false&&
 typeof h.text==='string'&&h.text.includes('SOURCE / NO SCORE')&&
 ['HUMAN_REFILL','READY','RECOVERY_DELAY'].includes(h.mode)&&
 h.authority==='REAL_B76_NATIVE_PLAYER_RESOURCE'&&
 nat(h.nativeTick)&&h.nativeTick>=a.tick&&
 h.nativeTick<=b.tick+27&&
 h.gameplayWrites==='0','REAL_PLAYER_HUD');
 // The native ink may have recovered while the last rendered HUD
 // still reports a lock. This is a user-facing HOLD, never a PASS.
 const hudStale=h.mode==='RECOVERY_DELAY';
 return {schema:'B355_GENUINE_SOURCE_INK_AND_PLAYER_READOUT',
 verdict:hudStale?'HOLD_REAL_REFILL_BUT_PLAYER_HUD_STILL_LOCKED':
  'PASS_NATIVE_CONSUMPTION_STOPPED_SHOOTER_REFILL_AND_HUD',
 realNativeRecoveryTicks:b.tick-a.tick,
 observedInkAfterShot:Number(a.ink.toFixed(4)),
 observedInkAfterRecovery:Number(b.ink.toFixed(4)),
 realHumanShotsUnchanged:b.humanShots,
 actualOriginalInkChangedCells:b.genuineOriginalChangedCells,
 readOnlyPlayerHud:h.mode,source:'25/17/26/0',
 fakeInk:false,scoreable:0,full4v4Certified:false,
 NintendoInkBalanceCertified:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];check(!!dir,'EVIDENCE_DIRECTORY');
 const p=JSON.parse(readFileSync(join(dir,'b355-source-native-ink-recovery.json'),'utf8'));
 const v=auditB355RealInkRecovery(p);
 writeFileSync(join(dir,'b355-independent-ink-readout-verdict.json'),
 JSON.stringify(v,null,2)+'\n');
 console.log('B355_REAL_SOURCE_NATIVE_REFILL_VERDICT',JSON.stringify(v));
}
