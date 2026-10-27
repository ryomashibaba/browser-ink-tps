import {describe,it,expect} from 'vitest';
import {B248_SOURCE_VISUAL_AUTHORITY,b248HumanParts} from './B248SourceActorVisuals';
describe('B248 source-only actor visual boundary',()=>{
 it('never creates any game physics or score authority',()=>{
  expect(B248_SOURCE_VISUAL_AUTHORITY).toMatchObject({
   humanParts:14,visualOnly:true,solidsAdded:0,paintAdded:0,
   linksAdded:0,scoreableAdded:0,actorBodiesAdded:0,
   physicalActorsMoved:0,productionAuthorized:false
  });
 });
 it('uses bounded finite primitives and unique part identifiers',()=>{
  const parts=b248HumanParts();
  expect(new Set(parts.map(p=>p.name)).size).toBe(parts.length);
  for(const p of parts){
   expect(['box','sphere','capsule','cylinder']).toContain(p.type);
   expect(p.pos.every(Number.isFinite)).toBe(true);
   expect(p.size.every(x=>Number.isFinite(x)&&x>0&&x<1.2)).toBe(true);
  }
 });
 it('defines visible head, tank, feet and weapon distinct from a capsule',()=>{
  const names=b248HumanParts().map(x=>x.name);
  for(const x of ['helmet','visor','torso','boot-left','boot-right','ink-tank','nozzle'])
   expect(names).toContain(x);
 });
});
