import {describe,expect,it} from 'vitest';
import {B259_RASTER_MASKS,b259RasterEligible,b259UvVisible,
 b259NativeVisible,B259_RASTER_AUTHORITY} from './B259SourceRasterLayers';
const url=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit');
const c={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,solids:25,
 paintable:17,links:26,scoreable:0,triangles:57578,textures:19,cpuCount:7};
describe('B259 strictly paused original-source framebuffer layer isolation',()=>{
 it('requires exact URL, original SHA-verified layers and safe paused camera',()=>{
  expect(b259RasterEligible(url,c)).toBe(true);
  const deterministic=new URLSearchParams(url);
  deterministic.set('t21QaInput','deterministic');
  expect(b259RasterEligible(deterministic,c)).toBe(false);
  for(const k of ['t21B259','t21B258','t21B253','t21FullSource']){
   const u=new URLSearchParams(url);u.delete(k);
   expect(b259RasterEligible(u,c)).toBe(false);
  }
  for(const bad of [{paused:false},{pointerLocked:true},{fullRound:true},
   {scoreable:1},{solids:24},{paintable:18},{links:27},
   {triangles:57577},{cameraBaseline:false},{b256Active:true},
   {cpuCount:6},{otherStudy:true},{verifiedUv:false},{humanoid:false},
   {textures:7},{textures:21},{stopped:true},{inkSafe:false}]){
   expect(b259RasterEligible(url,{...c,...bad})).toBe(false);
  }
 });
 it('selects optical or native DISPLAY layers independently',()=>{
  expect(B259_RASTER_MASKS.length).toBe(6);
  for(const kind of ['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL']){
   expect(b259UvVisible('BASELINE',kind)).toBe(true);
   expect(b259UvVisible('HIDE_ALL_UV',kind)).toBe(false);
   expect(b259UvVisible('HIDE_UV_DETAIL',kind)).toBe(kind!=='DETAIL');
   expect(b259UvVisible('HIDE_UV_GLASS',kind)).toBe(kind!=='GLASS');
  }
  expect(b259NativeVisible('BASELINE','SOLID')).toBe(true);
  expect(b259NativeVisible('BASELINE','PAINT')).toBe(true);
  expect(b259NativeVisible('HIDE_STAGE_SOLIDS','SOLID')).toBe(false);
  expect(b259NativeVisible('HIDE_STAGE_SOLIDS','PAINT')).toBe(true);
  expect(b259NativeVisible('HIDE_PAINT_SURFACES','SOLID')).toBe(true);
  expect(b259NativeVisible('HIDE_PAINT_SURFACES','PAINT')).toBe(false);
  expect(B259_RASTER_AUTHORITY.physicsSolidsAdded).toBe(0);
  expect(B259_RASTER_AUTHORITY.artAccepted).toBe(false);
  expect(B259_RASTER_AUTHORITY.hidesAreOnlyDiagnostic).toBe(true);
  expect(B259_RASTER_AUTHORITY.renderOnly).toBe(true);
  expect(B259_RASTER_AUTHORITY.sourceTrianglesModified).toBe(0);
 });
});
