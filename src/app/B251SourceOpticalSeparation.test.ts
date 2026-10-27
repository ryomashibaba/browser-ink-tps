import {describe,expect,it} from 'vitest';
import {originalF3StructuralInventory} from './UndertowF3OriginalSourceContext';
import {auditF3eSourceCoverage} from './UndertowF3EOriginalSourceCoverage';
import {undertowT21dConnectivityQaStage} from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {B251_REFERENCE_TONES,B251_STRUCTURE_TONES,B251_VISUAL_AUTHORITY}
 from './B251SourceOpticalSeparation';
describe('B251 original-source unregistered optical separation',()=>{
 it('never makes unregistered optical walls into physical or scoreable floors',()=>{
  expect(B251_VISUAL_AUTHORITY).toMatchObject({
   originalSourceOpticalEntities:38,materialOnly:true,
   physicalSolidsAdded:0,paintSurfacesAdded:0,navLinksAdded:0,
   scoreableAdded:0,actorRelocations:0,productionAuthorized:false
  });
  const stage=undertowT21dConnectivityQaStage();
  const frozen=[stage.solids,stage.paintSurfaces,stage.navigationLinks];
  expect(frozen.map(s=>s?.length)).toEqual([25,17,26]);
  expect(stage.solids).toBe(frozen[0]);
  expect(stage.paintSurfaces).toBe(frozen[1]);
  expect(stage.navigationLinks).toBe(frozen[2]);
 });
 it('retains all exact 38 registered source reference components without duplicate names',()=>{
  const items=originalF3StructuralInventory();
  expect(items).toHaveLength(38);
  expect(new Set(items.map(m=>m.id)).size).toBe(38);
  const source=auditF3eSourceCoverage(undertowT21dConnectivityQaStage());
  expect(source.manifest.originalTriangles).toBeGreaterThan(200);
  expect(source.manifest.addedPhysicalSolids).toBe(0);
  expect(source.manifest.inferredCorridorConnections).toBe(0);
 });
 it('gives support and high shapes distinct colors and keeps every reference translucent',()=>{
  expect(B251_REFERENCE_TONES.HIGH.rgb).not.toEqual(B251_REFERENCE_TONES.WALL.rgb);
  for(const m of [...Object.values(B251_REFERENCE_TONES),
                  ...Object.values(B251_STRUCTURE_TONES)]){
   expect(m.opacity).toBeGreaterThan(0);
   expect(m.opacity).toBeLessThan(1);
   expect(m.rgb.every(x=>x>=0&&x<=1&&Number.isFinite(x))).toBe(true);
  }
  expect(B251_REFERENCE_TONES.CONCRETE.opacity).toBeLessThan(.30);
  expect(B251_REFERENCE_TONES.GLASS.opacity).toBeLessThan(.20);
 });
});
