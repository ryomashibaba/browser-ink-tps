import {describe,it,expect} from 'vitest';
import {createF3lUvCollector,parseF3lOriginalMtl}
 from '../../scripts/t21-f3l-textured-source.mjs';
import {auditF3lManifest,f3lSourceReadabilityStyle,F3L_STAGE_READABILITY_MODES,b253VerifiedInkVisualOptIn,type F3lManifest}
 from './UndertowF3LTexturedSourcePreview';
import {T21_F3G_SOURCE_SHA256} from './UndertowF3GWholeSourcePreview';
describe('F3L original static textured scene review',()=>{
 it('uses only explicit source vertex UV references, not world projected UV',()=>{
  const table=parseF3lOriginalMtl('newmtl Fld_Temple01_FloorConcrete00\n'+
   'Kd 1 1 1\nmap_Kd textures/FloorConcrete00_Alb.png\n');
  const collector=createF3lUvCollector(table);
  const lines=['v 0 0 0','v 1 0 0','v 0 0 1',
   'vt 0.1 0.2','vt 0.3 0.4','vt 0.5 0.6',
   'o Fld_Temple01_Static','usemtl Fld_Temple01_FloorConcrete00',
   'f 1/1 2/2 3/3','o FldObj_Temple01_Unplaced','f 1/1 2/2 3/3'];
  lines.forEach(line=>collector.line(line));
  const m=collector.finish();
  expect(m.triangles).toBe(1);
  expect(m.groups[0]?.floats).toEqual([
   0,0,0,.1,.2,1,0,0,.3,.4,0,0,1,.5,.6
  ]);
  expect(m.groups[0]?.texture).toBe('FloorConcrete00_Alb.png');
  expect(m.ignoredFaces).toBe(1);
  expect(m.skippedNoUv).toBe(0);
 });
 it('rejects missing original vt pointer and any inferred playable permission',()=>{
  const table=new Map([['Fld_Temple01_FloorConcrete00',null]]);
  const c=createF3lUvCollector(table);
  ['v 0 0 0','v 1 0 0','v 0 0 1','o Fld_Temple01_A',
   'usemtl Fld_Temple01_FloorConcrete00'].forEach(s=>c.line(s));
  expect(()=>c.line('f 1/1 2/2 3/3')).toThrow('F3L_BAD_SOURCE_OBJ_INDEX');
 });
 it('denies forged texture review matrices and non-original shape totals',()=>{
  const base={
   schema:'T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1',
   sourceSHA256:T21_F3G_SOURCE_SHA256,
   sourceMtlBlobSha:'93b6d30ecac396e960058d6c71db80aadca10fef',
   sourceRepositoryCommit:'0611f51b35c9736ee986fb2218461e2585b7875e',
   verifiedAgainstPinnedSource:true,originalVertexUVOnly:true,
   sourceGeometryRegisteredOnlyToOriginalObj:true,
   stagePlayableAuthority:'NONE',productionAuthorization:false,
   actorMatricesRecovered:false,physicsSolidsAdded:0,
   navigationLinksAdded:0,scoreableSurfacesAdded:0,
   totalTriangles:57578,triangleCountWithoutSourceUV:0,
   textureFiles:[],textures:[],materials:[]
  } as unknown as F3lManifest;
  expect(()=>auditF3lManifest(base)).toThrow('T21_F3L_ORIGINAL_SOURCE_UV_NOT_AUTHORIZED');
  expect(()=>auditF3lManifest({...base,
   physicsSolidsAdded:1 as unknown as 0})).toThrow();
  expect(()=>auditF3lManifest({...base,
   actorMatricesRecovered:true as unknown as false})).toThrow();
 });
});
describe('W10-B30 source original UV cutaway reveals existing physical-ground render only',()=>{
 it('does not alter SOURCE_ORIGINAL_UV default material, including original glass',()=>{
  expect(F3L_STAGE_READABILITY_MODES).toEqual(['ORIGINAL_UV','SOURCE_CUTAWAY','INK_SAFE_REVIEW']);
  for(const k of ['FLOOR','SLOPE','METAL','SUPPORT','STRUCTURE','DETAIL'] as const){
   expect(f3lSourceReadabilityStyle(k,'ORIGINAL_UV')).toEqual({
    opacity:1,depthWrite:true,opaque:true});
  }
  expect(f3lSourceReadabilityStyle('GLASS','ORIGINAL_UV')).toEqual({
   opacity:.24,depthWrite:false,opaque:false});
 });
 it('makes every optical original material translucent for actual source-foot visibility',()=>{
  for(const k of ['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const){
   const x=f3lSourceReadabilityStyle(k,'SOURCE_CUTAWAY');
   expect(x.opaque).toBe(false);
   expect(x.depthWrite).toBe(false);
   expect(x.opacity).toBeGreaterThan(0);
   expect(x.opacity).toBeLessThan(.5);
  }
  expect(f3lSourceReadabilityStyle('FLOOR','SOURCE_CUTAWAY').opacity)
   .toBeLessThan(f3lSourceReadabilityStyle('SUPPORT','SOURCE_CUTAWAY').opacity);
 });
});

describe('B253 authentic source UV supports opt-in real-ink view',()=>{
 it('does not hide certified ink beneath opaque static original floors',()=>{
  expect(f3lSourceReadabilityStyle('FLOOR','INK_SAFE_REVIEW'))
   .toEqual({opacity:.12,depthWrite:false,opaque:false});
  expect(f3lSourceReadabilityStyle('SLOPE','INK_SAFE_REVIEW'))
   .toEqual({opacity:.20,depthWrite:false,opaque:false});
  expect(f3lSourceReadabilityStyle('SUPPORT','INK_SAFE_REVIEW').opacity)
   .toBeGreaterThan(.8);
  for(const k of ['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const){
   const s=f3lSourceReadabilityStyle(k,'INK_SAFE_REVIEW');
   expect(s.depthWrite).toBe(false);
   expect(s.opaque).toBe(false);
   expect(s.opacity).toBeGreaterThan(0);
   expect(s.opacity).toBeLessThan(1);
  }
  expect(f3lSourceReadabilityStyle('FLOOR','ORIGINAL_UV').opaque)
   .toBe(true);
 });
 it('fails closed without explicit review and original verified source UV',()=>{
  const q=new URLSearchParams(
   't21Play=preview&t21FullSource=review&t21B253=liveInk');
  expect(b253VerifiedInkVisualOptIn(q,57578,19)).toBe(true);
  expect(b253VerifiedInkVisualOptIn(q,57577,19)).toBe(false);
  expect(b253VerifiedInkVisualOptIn(q,57578,0)).toBe(false);
  for(const bad of ['t21Play=production&t21FullSource=review&t21B253=liveInk',
   't21Play=preview&t21B253=liveInk',
   't21Play=preview&t21FullSource=review']){
   expect(b253VerifiedInkVisualOptIn(new URLSearchParams(bad),57578,19))
    .toBe(false);
  }
  expect(b253VerifiedInkVisualOptIn(new URLSearchParams(
   q.toString()+'&t21QaInput=deterministic'),57578,19)).toBe(false);
 });
});
