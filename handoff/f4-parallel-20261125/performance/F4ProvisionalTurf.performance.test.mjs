import {test} from 'node:test';
import assert from 'node:assert/strict';
import {F4ProvisionalTurf} from '../../../src/ink/F4ProvisionalTurf.mjs';

test('clipped edge cells, denied backing, interleaved real owner writes, final latch',()=>{
 const s={widthCells:3,heightCells:2,widthMeters:2.5,heightMeters:1.5,cellSize:1,
  baseFlags:17,normal:{y:.5},flagsGrid:Uint16Array.from([17,17,17,17,17,17]),
  ownerGrid:Int8Array.from([0,1,-1,0,0,1]),isCellActive:(x,y)=>!(x===1&&y===1)};
 let calls=0;
 const p=new F4ProvisionalTurf([s],(_s,_x,_y,i)=>{calls++;return i!==2});
 const write=(i,team)=>{const w=p.beforeChange(s,i,s.ownerGrid[i],team);s.ownerGrid[i]=team;return w};
 assert.equal(write(0,1),.5);
 assert.equal(write(5,-1),.125);
 assert.equal(p.read().status,'BUILDING');
 p.scan(6);
 assert.equal(calls,5);
 const live=p.read();
 assert.equal(live.status,'LIVE');
 assert.equal(live.totalProjectedM2,1.375);
 assert.equal(live.areaA,1);
 assert.equal(live.areaB,.125);
 assert.equal(live.neutralArea,.25);
 assert.equal(write(2,1),0);
 assert.equal(write(4,-1),0);
 assert.equal(write(0,-1),.5);
 assert.equal(calls,5);
 assert.equal(p.finish(10799).reason,'ROUND_NOT_FINAL');
 const final=p.finish(10800);
 assert.equal(final.winner,'B');
 assert.equal(final.areaA,.5);
 assert.equal(final.areaB,.625);
 assert.equal(p.beforeChange(s,0,-1,1),0);
 assert.deepEqual(p.read(),final);
});
test('incomplete and unsupported masks cannot produce winners',()=>{
 const s={widthCells:1,heightCells:1,widthMeters:1,heightMeters:1,cellSize:1,
  baseFlags:17,normal:{y:1},flagsGrid:Uint16Array.of(17),ownerGrid:Int8Array.of(0),isCellActive:()=>true};
 const incomplete=new F4ProvisionalTurf([s],()=>true);
 assert.equal(incomplete.finish(10800).reason,'MASK_INCOMPLETE');
 const unsupported=new F4ProvisionalTurf([s],()=>false);
 unsupported.scan(1);
 assert.equal(unsupported.finish(10800).reason,'NO_BACKED_FLOOR');
});
