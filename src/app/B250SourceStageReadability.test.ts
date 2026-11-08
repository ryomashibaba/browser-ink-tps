import {describe,expect,it} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {b250SolidTone,b250GlassSourceVisibilityPartition,
 B250_REGISTERED_SOURCE_NEUTRAL}
 from './B250SourceStageReadability';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
describe('SOURCE registered paint-floor visual contrast without physical promotion',()=>{
 it('brightens only the neutral shader color of existing registered floor renderings',()=>{
  const original=[.24,.27,.31] as const;
  expect(B250_REGISTERED_SOURCE_NEUTRAL).toHaveLength(3);
  for(let i=0;i<3;i++){
   expect(B250_REGISTERED_SOURCE_NEUTRAL[i]).toBeGreaterThan(original[i]!);
   expect(B250_REGISTERED_SOURCE_NEUTRAL[i]).toBeLessThan(.6);
  }
  const source=undertowT21dConnectivityQaStage();
  const approved=source.paintSurfaces.filter(p=>{
   const solid=source.solids.find(s=>s.id===p.backingSolidId);
   return solid&&solid.collisionEnabled!==false;
  });
  expect(approved.length).toBeGreaterThan(0);
  expect(source.solids).toBe(stage.solids);
  expect(source.paintSurfaces).toBe(stage.paintSurfaces);
  expect(source.navigationLinks).toBe(stage.navigationLinks);
 });
});

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

describe('P1 actual native SOURCE Glass01 visible/physical triangle parity',()=>{
 it('keeps 188 registered broad faces and ghosts only 16 excluded faces',()=>{
  const full=undertowT21dConnectivityQaStage();
  const originals=[full.solids,full.paintSurfaces,full.navigationLinks];
  const visuals=full.solids.filter(s=>s.id.endsWith(':visual')&&
   s.id.includes('upper-glass-'));
  expect(visuals).toHaveLength(2);
  let registered=0,excluded=0;
  for(const s of visuals){
   const x=b250GlassSourceVisibilityPartition(full,s);
   expect(x).not.toBeNull();
   const source=s.triangleMesh!;
   expect(x!.registered.vertices).toBe(source.vertices);
   expect(x!.opticalOnly.vertices).toBe(source.vertices);
   expect([...x!.registered.indices,...x!.opticalOnly.indices])
    .toEqual(source.indices);
   registered+=x!.registered.indices.length/3;
   excluded+=x!.opticalOnly.indices.length/3;
  }
  expect([registered,excluded]).toEqual([188,16]);
  expect([full.solids,full.paintSurfaces,full.navigationLinks])
   .toEqual(originals);
 });
 it('fails closed on mismatched immutable collision indices or stage authority',()=>{
  const full=undertowT21dConnectivityQaStage();
  const s=full.solids.find(x=>x.id.endsWith('upper-glass-positive-z:visual'))!;
  const metadata=full.metadata;
  expect(()=>b250GlassSourceVisibilityPartition({
   ...full,metadata:{...metadata,id:'unknown-stage'}
  },s)).toThrow('B250_GLASS_PINNED_SOURCE_STAGE_REQUIRED');
  const modified=full.solids.map(x=>
   x.id.endsWith('upper-glass-positive-z:pass15d-broad-collision-query-runtime')?
   {...x,triangleMesh:{vertices:x.triangleMesh!.vertices,
    indices:[999,...x.triangleMesh!.indices.slice(1)]}}:x);
  expect(()=>b250GlassSourceVisibilityPartition({...full,solids:modified},s))
   .toThrow('B250_GLASS_COLLISION_TRIANGLE_AUTHORITY_MISMATCH');
  expect(b250GlassSourceVisibilityPartition(full,
   full.solids.find(x=>x.id.includes('first-drop-landing-'))!)).toBeNull();
 });
});
