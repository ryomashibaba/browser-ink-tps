import {describe,expect,it} from 'vitest';
import {b337NativeNearbyActiveSourceCells} from './B337ActualLocalActiveCell';
function surface(){
 const size=40,step=.5;
 return {id:'UndertowT21D:spawn-high-positive-z:paint',
  widthCells:size,heightCells:size,cellSize:step,
  widthMeters:size*step,heightMeters:size*step,
  ownerGrid:new Int8Array(size*size),
  isCellActive:(x:number,y:number)=>x>=0&&y>=0&&x<size&&y<size,
  localToWorld:(u:number,v:number)=>({x:u-10,y:6.5,z:v+60})
 };
}
const args=()=>({surface:surface(),body:[0,8.4,67.9],
 camera:[0,9.7,64],footGrid:[20,16],yaw:0,pitch:-12});
describe('B337 original local ACTUAL active grid, not global B271 probes',()=>{
 it('returns three bounded real nearby native cells for a supported source spawn',()=>{
  const x=b337NativeNearbyActiveSourceCells(args());
  expect(x).toHaveLength(3);
  for(const c of x){
   expect(c.realCellProvenance).toBe('B337_NATIVE_LOCAL_ACTIVE_GRID');
   expect(c.originalOwner).toBe(0);
   expect(c.grid.every(Number.isSafeInteger)).toBe(true);
   expect(args().surface.isCellActive(...c.grid)).toBe(true);
   const planar=Math.hypot(c.world[0],c.world[2]-67.9);
   expect(planar).toBeGreaterThanOrEqual(2.5);
   expect(planar).toBeLessThanOrEqual(8);
  }
 });
 it('rejects nonactive nearest cells rather than fabricate a valid footprint',()=>{
  const a=args();a.surface.isCellActive=()=>false;
  expect(b337NativeNearbyActiveSourceCells(a)).toEqual([]);
 });
 it('rejects non-source cell, invalid owner, invalid grid and nonfinite source pose',()=>{
  const a=args();a.surface.id='fake-arena';
  expect(()=>b337NativeNearbyActiveSourceCells(a)).toThrow();
  const b=args();b.surface.ownerGrid.fill(7);
  expect(()=>b337NativeNearbyActiveSourceCells(b)).toThrow();
  const c=args();c.footGrid=[-1,16];
  expect(()=>b337NativeNearbyActiveSourceCells(c)).toThrow();
  const d=args();d.camera=[Number.NaN,0,0];
  expect(()=>b337NativeNearbyActiveSourceCells(d)).toThrow();
 });
});
