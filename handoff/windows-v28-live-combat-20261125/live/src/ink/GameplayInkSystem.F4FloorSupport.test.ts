import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {GameplayInkSystem} from './GameplayInkSystem';
import {PaintSurface} from './PaintSurface';
import {SurfaceFlags} from './types';

function oneCellSurface(id:string){
 return new PaintSurface(id,new Vec3(0,0,0),new Vec3(1,0,0),new Vec3(0,0,-1),
  .125,.125,.125,SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
}
function scanOneCell(surface:PaintSurface){
 const ink=new GameplayInkSystem();let physicalQueries=0;
 ink.setPhysicalPaintBacking(()=>{physicalQueries++;return true;});
 ink.registerSurface(surface);ink.enableF4ProvisionalTurf();
 ink.scanF4ProvisionalTurf(1,()=>true);
 return {physicalQueries,score:ink.readF4ProvisionalTurf()};
}

describe('F4 provisional floor backing precheck',()=>{
 it('confirms source-mask-covered floor cells with one live backing query',()=>{
  const result=scanOneCell(oneCellSurface('F4ProvisionalFloor:source'));
  expect(result.physicalQueries).toBe(1);
  expect(result.score?.status).toBe('LIVE');
 });
 it('keeps the five-point Rapier gate for non-F4 floor surfaces',()=>{
  const result=scanOneCell(oneCellSurface('original-source-floor'));
  expect(result.physicalQueries).toBe(5);
  expect(result.score?.status).toBe('LIVE');
 });
});
