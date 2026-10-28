import {describe,it,expect} from 'vitest';
import {B269_REAR_IDENTITY_PARTS,B269_RENDER_ONLY_AUTHORITY,b269ValidateParts}
 from './B269SourceActorIdentity';
describe('B269 research-only silhouette differentiates teams from native rear view',()=>{
 it('uses bounded real 3D primitives and deliberate angular head',()=>{
  const p=b269ValidateParts(B269_REAR_IDENTITY_PARTS);
  expect(p.parts).toBeGreaterThanOrEqual(30);
  expect(new Set(B269_REAR_IDENTITY_PARTS.map(x=>x.name)).size).toBe(p.parts);
  expect(B269_REAR_IDENTITY_PARTS.some(x=>x.name==='angular-helmet-core'&&
   x.type==='box')).toBe(true);
  expect(B269_REAR_IDENTITY_PARTS.some(x=>x.name==='back-team-chevron-left')).toBe(true);
  expect(B269_REAR_IDENTITY_PARTS.some(x=>x.name==='back-team-chevron-right')).toBe(true);
  expect(B269_REAR_IDENTITY_PARTS.filter(x=>x.type==='sphere').length).toBe(0);
 });
 it('rejects unbounded or non-original actor mesh research',()=>{
  expect(()=>b269ValidateParts(B269_REAR_IDENTITY_PARTS.slice(0,8))).toThrow();
  expect(()=>b269ValidateParts([...B269_REAR_IDENTITY_PARTS,
   B269_REAR_IDENTITY_PARTS[0]!])).toThrow();
  const bad=B269_REAR_IDENTITY_PARTS.map(x=>({...x}));
  bad[0]={...bad[0]!,size:[1,100,1] as const};
  expect(()=>b269ValidateParts(bad)).toThrow();
 });
 it('has zero gameplay, geometry, ink and production authority',()=>{
  expect(B269_RENDER_ONLY_AUTHORITY).toMatchObject({
   physicalSource:'25/17/26/0',existingActors:8,originalUvTriangles:57578,
   actualActorWorldTransformsChanged:0,collidersAdded:0,
   originalStageMeshesAltered:0,realPaintCellsChanged:0,
   scoreablePromotions:0,navLinksChanged:0,
   artAccepted:false,productionAuthorized:false});
 });
});