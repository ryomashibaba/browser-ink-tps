import {describe,it,expect} from 'vitest';
import {b294ClassifySourceAtlasBindings,b294ParameterData,type B294SourceAtlasRow} from './B294NativeInkAtlasMaterialProof';
const rows:B294SourceAtlasRow[]=Array.from({length:17},(_,i)=>({
 surfaceId:'true-source-'+i,existingSourceMesh:true,visible:true,
 atlasSameTexture:true,atlasRectMatches:true,
 teamAUniformMatches:true,teamBUniformMatches:true,
 neutralUniformMatches:true}));
describe('B294 existing native source ink shader provenance',()=>{
 it('unpacks only actual PlayCanvas getParameter descriptor .data',()=>{
  const texture={id:123};const rgba=new Float32Array([.1,.2,.3]);
  expect(b294ParameterData({data:texture,scopeId:{}})).toBe(texture);
  expect(b294ParameterData({data:rgba,scopeId:{}})).toBe(rgba);
  expect(b294ParameterData({scopeId:{}})).toBeUndefined();
  expect(b294ParameterData(texture)).toBeUndefined();
  expect(b294ParameterData(null)).toBeUndefined();
 });
 it('requires exactly 17 existing source surfaces and identical atlas bindings',()=>{
  expect(b294ClassifySourceAtlasBindings(rows,17)).toMatchObject({
   registeredOriginalPaintMeshes:17,atlasTextureIdentityMatched:17,
   atlasUvRectsMatched:17,teamAndNeutralColorUniformsMatched:17,
   allBindingsConsistent:true,
   actualGPUAtlasTexelReadbackDone:false,
   actualFramebufferInkVisibilityCertified:false,productionAuthorized:false});
 });
 it('diagnoses a wrong actual source material without art promotion',()=>{
  const changed=[...rows];changed[4]={...changed[4]!,
   atlasSameTexture:false,teamAUniformMatches:false};
  const x=b294ClassifySourceAtlasBindings(changed,17);
  expect(x.allBindingsConsistent).toBe(false);
  expect(x.wrongAtlasIds).toEqual(['true-source-4']);
  expect(x.wrongColorUniformIds).toEqual(['true-source-4']);
  expect(x.artAccepted).toBe(false);
 });
 it('fails on duplicate, missing or extra source meshes',()=>{
  expect(()=>b294ClassifySourceAtlasBindings(rows.slice(1),17)).toThrow();
  expect(()=>b294ClassifySourceAtlasBindings([...rows,rows[0]!],17)).toThrow();
  expect(()=>b294ClassifySourceAtlasBindings(rows,18)).toThrow();
 });
});
