import {describe,expect,it} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {b250SolidTone} from './B250SourceStageReadability';
describe('B250 material-only existing registered geometry',()=>{
 it('retains 25/17/26 identity while classifying actual solid elevations',()=>{
  const before=[stage.solids,stage.paintSurfaces,stage.navigationLinks];
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  const solids=stage.solids.filter(x=>x.render);
  const ys=solids.map(x=>x.center[1]);
  const tones=solids.map(x=>b250SolidTone(x,Math.min(...ys),Math.max(...ys)));
  expect(tones.length).toBeGreaterThan(0);
  for(const tone of tones)expect(tone.rgb.every(x=>x>=0&&x<=1&&Number.isFinite(x))).toBe(true);
  expect(stage.solids).toBe(before[0]);
  expect(stage.paintSurfaces).toBe(before[1]);
  expect(stage.navigationLinks).toBe(before[2]);
 });
 it('gives actual higher registered elevations a modest visible contrast',()=>{
  const a=b250SolidTone({center:[0,0,0],material:'medium'},0,20);
  const b=b250SolidTone({center:[0,20,0],material:'medium'},0,20);
  expect(a.band).toBe('LOWER');expect(b.band).toBe('UPPER');
  for(let i=0;i<3;i++)expect(b.rgb[i]).toBeGreaterThan(a.rgb[i]!);
 });
 it('fails closed for invalid Y and handles equal source altitude',()=>{
  expect(()=>b250SolidTone({center:[0,NaN,0],material:'dark'},0,10))
   .toThrow('B250_BAD_SOURCE_Y');
  expect(b250SolidTone({center:[0,1,0],material:'light'},1,1).band)
   .toBe('MIDDLE');
 });
});
