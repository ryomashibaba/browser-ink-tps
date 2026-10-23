import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('src/app/UndertowF3PlayablePreviewApp.ts','utf8');
const hud=readFileSync('src/app/UndertowF3PlayableHud.ts','utf8');
test('B135 genuine 60Hz combat pulse runs after Rapier, projectiles & HP update',()=>{
 const fixed=app.slice(app.indexOf('private stepFixed('),app.indexOf('private update(dt:number)'));
 const pulse=fixed.indexOf('this.practiceHud.renderNativeCombat({');
 assert.ok(pulse>fixed.indexOf('this.projectiles.fixedUpdate(seconds,'));
 assert.ok(pulse>fixed.indexOf('if(this.resources.currentHp<=0){'));
 assert.ok(pulse>fixed.indexOf('this.b112GroundLedger.observe({'));
 assert.ok(pulse<fixed.indexOf('// B134: keep the actual player-facing'));
 assert.ok(fixed.includes('tick:frame,hp:this.resources.currentHp,'));
 assert.ok(fixed.includes('hitCount:this.stats.humanCpuDirectHits'));
 assert.ok(fixed.includes('splatCount:this.stats.humanCpuDirectSplats'));
 assert.ok(!fixed.slice(pulse,pulse+950).includes('this.player.teleport('));
});
test('B135 pulse has native HUD, source and display safety guards',()=>{
 assert.ok(hud.includes('function renderNativeCombat(p:F3NativeCombatPulse)'));
 assert.ok(hud.includes('p.originalSolids===25&&p.originalPaint===17&&'));
 assert.ok(hud.includes('p.originalLinks===26&&p.scoreable===0'));
 assert.ok(hud.includes('p.splatCount<=p.hitCount'));
 assert.ok(hud.includes('p.matchState===\'PLAYING\''));
 assert.ok(hud.includes('damageVignette.dataset.t21B135NativeTick'));
 assert.ok(hud.includes('hitMarker.dataset.t21B135NativeTick'));
 assert.ok(hud.includes('splatNotice.dataset.t21B135NativeTick'));
 assert.ok(hud.includes('return {root,render,renderNativeCombat};'));
 assert.ok(hud.includes('const source=activity.observe(value);'));
});
