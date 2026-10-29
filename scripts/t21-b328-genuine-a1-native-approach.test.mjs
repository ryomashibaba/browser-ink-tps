import test from 'node:test';
import assert from 'node:assert/strict';
import {b328Plan,b328AuditStep} from './t21-b328-genuine-a1-native-approach.mjs';
function sample(){
 const n={tick:1714,matchState:'PLAYING',paused:false,stopReason:null,
  player:{position:[.1,3.895,47.46]},
  cameraSourcePractice:{yawDegrees:0},
  b25SourcePaintRun:{status:'RUNNING',practiceVariant:'ALLY_SYNC'},
  cpu:{physicalFootRelocations:0,cpu:[{id:'A1',physicalFoot:[1.3,3.1,51.6]}]},
  productionAuthorized:false,unrestricted4v4Certified:false,
  sourceScoreablePromotions:0};
 const l={source:'25/17/26/0',actualBodyMeters:[...n.player.position],
  originalRows:Array.from({length:17},()=>({})),
  realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:'UndertowT21D:first-drop-landing-positive-z',
  sourceActorRelocations:0,sourceInkRewritten:false,
  playerPositionRewritten:false};
 return {n,l};
}
test('yaw 0 correctly proposes native KeyS and not source route',()=>{
 const {n,l}=sample(),p=b328Plan(n,l);
 assert.equal(p.eligible,true);assert.equal(p.key,'KeyS');
 assert.equal(p.sourceRouteCertified,false);
});
test('real native body + lower support + reduced A1 gap required',()=>{
 const x=sample(),y=structuredClone(x);y.n.tick+=6;
 y.n.player.position[2]+=.31;y.l.actualBodyMeters=[...y.n.player.position];
 assert.equal(b328AuditStep(x.n,x.l,y.n,y.l,b328Plan(x.n,x.l)).passes,true);
});
test('A1 motion alone or ungrounded human fails',()=>{
 const x=sample(),y=structuredClone(x);y.n.tick+=6;
 y.n.cpu.cpu[0].physicalFoot[2]-=.4;
 assert.equal(b328AuditStep(x.n,x.l,y.n,y.l,b328Plan(x.n,x.l)).passes,false);
 const z=structuredClone(x);z.n.tick+=6;z.n.player.position[2]+=.31;
 z.l.actualBodyMeters=[...z.n.player.position];
 z.l.realHumanOriginalFootSupported=false;
 assert.equal(b328AuditStep(x.n,x.l,z.n,z.l,b328Plan(x.n,x.l)).passes,false);
});
test('CLEAR, wrong source, teleport and overly long input fail closed',()=>{
 const a=sample();a.n.b25SourcePaintRun.status='CLEAR';
 assert.equal(b328Plan(a.n,a.l).eligible,false);
 const b=sample();b.l.sourceActorRelocations=1;
 assert.equal(b328Plan(b.n,b.l).eligible,false);
 const c=sample();c.n.player.position[2]=56;
 assert.equal(b328Plan(c.n,c.l).eligible,false);
 const d=sample(),e=structuredClone(d);e.n.tick+=25;
 assert.throws(()=>b328AuditStep(d.n,d.l,e.n,e.l,b328Plan(d.n,d.l)),
  /MISSING_TRUE_NATIVE/);
});