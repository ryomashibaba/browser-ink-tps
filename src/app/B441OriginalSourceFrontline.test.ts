import {describe,it,expect} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {SurfaceFlags} from '../ink/types';
import {proposeB441OriginalFrontline} from './B441OriginalSourceFrontline';
describe('B441 SOURCE-only frontline proposals / never invented crossing',()=>{
 const make=()=>undertowT21dConnectivityQaStage();
 it('samples both original registered low floors inside all actual holes',()=>{
  const stage=make();
  for(const side of ['A','B'] as const){
   const points=proposeB441OriginalFrontline(stage,side);
   expect(points.length).toBeGreaterThan(0);
   expect(points.length).toBeLessThanOrEqual(32);
   const sign=side==='A'?1:-1;
   const minZ=Math.min(...points.map(x=>Math.abs(x.point[2])));
   expect(minZ).toBeLessThan(49);
   for(const candidate of points){
    expect(candidate.sourceSolidId).toBe(
     'UndertowT21D:right-low-team-'+(side==='A'?'a':'b'));
    expect(candidate.navigationAndCapsuleCertified).toBe(false);
    expect(candidate.sourceFootprintOnly).toBe(true);
    expect(candidate.point[2]*sign).toBeGreaterThanOrEqual(33);
    const solid=stage.solids.find(x=>x.id===candidate.sourceSolidId)!;
    const u=candidate.point[0]-(solid.center[0]-solid.size[0]/2);
    const v=candidate.point[2]-(solid.center[2]-solid.size[2]/2);
    expect(pointInStageFootprint(u,v,solid.footprint!)).toBe(true);
   }
  }
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
 });
 it('refuses invented floor, promoted turf, missing nav/solid authority',()=>{
  const base=make();
  const noSolids={...base,solids:base.solids.slice(1)};
  expect(proposeB441OriginalFrontline(noSolids,'A')).toEqual([]);
  expect(proposeB441OriginalFrontline({...base,navigationLinks:[]},'B')).toEqual([]);
  const changed=base.paintSurfaces.map((v,i)=>
   i===0?{...v,flags:v.flags|SurfaceFlags.Scoreable}:v);
  expect(proposeB441OriginalFrontline({...base,paintSurfaces:changed},'A'))
   .toEqual([]);
  const blocked=base.solids.map(s=>s.id==='UndertowT21D:right-low-team-a'?
   {...s,collisionEnabled:false}:s);
  expect(proposeB441OriginalFrontline({...base,solids:blocked},'A'))
   .toEqual([]);
  const fake={...base,metadata:{...base.metadata,id:'invented-stage'}};
  expect(proposeB441OriginalFrontline(fake,'B')).toEqual([]);
 });
});
