import {describe,it,expect} from 'vitest';
import {B292_PARTS,B292_AUTHORITY,b292Validate} from './B292FlowSourceActor';
import {b268VariantAccepted} from './B268SourceActorComposition';
describe('B292 source actor real-render-only hypothesis',()=>{
 it('is structurally distinct, narrow and organic without physical authority',()=>{
  const x=b292Validate();expect(x.count).toBe(27);
  expect(x.halfWidth).toBeLessThan(.72);
  expect(B292_PARTS.filter(x=>x.type==='capsule'||x.type==='sphere').length).toBeGreaterThan(19);
  expect(B292_AUTHORITY).toMatchObject({existingActors:8,collidersAdded:0,
   navLinksAdded:0,scoreablePromotions:0,artAccepted:false,productionAuthorized:false});
  expect(b268VariantAccepted('B292_FLOW_SILHOUETTE')).toBe(true);
 });
 it('fails closed on duplicate, oversized and missing shape',()=>{
  expect(()=>b292Validate([...B292_PARTS,B292_PARTS[0]!])).toThrow();
  expect(()=>b292Validate(B292_PARTS.slice(1))).toThrow();
  expect(()=>b292Validate(B292_PARTS.map((p,i)=>i===0?
   {...p,size:[1,1,1] as const}:p))).toThrow();
 });
});
