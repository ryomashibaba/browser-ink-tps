import {describe,it,expect} from 'vitest';
import {B268_COMPACT_HUMAN_PARTS,B268_VISUAL_AUTHORITY,
 b268RenderResearchGate,b268VariantAccepted} from './B268SourceActorComposition';
const url=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B263=paintProjection&'+
 't21B268=actorComposition');
const ctx={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,verifiedUv:true,inkSafe:true,humanoid:true,
 surveyActive:false,cameraBaseline:true,qaFocusOff:true,b256Off:true,
 solidCount:25,paintSurfaceCount:17,navCount:26,scoreableCount:0,
 triangles:57578,textureCount:19,cpuCount:7,
 rasterBaseline:true,metalRestored:true};
describe('B268 genuine-source render-only alternative silhouette',()=>{
 it('requires pinned source and paused, non-scoring research',()=>{
  expect(b268RenderResearchGate(url,ctx)).toBe(true);
  for(const key of ['t21B268','t21B263','t21B255','t21FullSource']){
   const p=new URLSearchParams(url);p.delete(key);
   expect(b268RenderResearchGate(p,ctx)).toBe(false);
  }
  for(const change of [{paused:false},{staging:false},{pointerLocked:true},
   {fullRound:true},{surveyActive:true},{qaFocusOff:false},
   {cameraBaseline:false},{humanoid:false},{metalRestored:false},
   {rasterBaseline:false},{solidCount:24},{paintSurfaceCount:18},
   {navCount:25},{scoreableCount:1},{triangles:57577},{cpuCount:6},
   {textureCount:18},{b256Off:false}]){
   expect(b268RenderResearchGate(url,{...ctx,...change})).toBe(false);
  }
  const p=new URLSearchParams(url);p.set('t21QaInput','deterministic');
  expect(b268RenderResearchGate(p,ctx)).toBe(false);
 });
 it('real 3D kit is compact and color-balanced, with no source changes',()=>{
  const names=B268_COMPACT_HUMAN_PARTS.map(p=>p.name);
  expect(new Set(names).size).toBe(names.length);
  expect(names.length).toBeGreaterThanOrEqual(18);
  for(const part of B268_COMPACT_HUMAN_PARTS){
   expect(['box','sphere','capsule','cylinder']).toContain(part.primitive);
   expect(part.pos.every(Number.isFinite)).toBe(true);
   expect(part.size.every(x=>Number.isFinite(x)&&x>0&&x<=1.1)).toBe(true);
  }
  expect(names).toContain('slit-visor');
  expect(names).toContain('tank-shell');
  expect(names).toContain('carbine-nozzle');
  expect(B268_COMPACT_HUMAN_PARTS.filter(p=>p.surface==='INK').length)
   .toBeLessThan(B268_COMPACT_HUMAN_PARTS.length/3);
  expect(B268_VISUAL_AUTHORITY).toMatchObject({
   originalStage:'25/17/26/0',existingRealActors:8,realCpuActors:7,
   renderOnly:true,solidsAdded:0,paintSurfacesAdded:0,navLinksAdded:0,
   scoreableSurfacesAdded:0,actorPositionsModified:0,
   productionAuthorized:false,artAccepted:false});
 });
 it('only accepts three deliberately limited research styles',()=>{
  expect(b268VariantAccepted('B248_ORIGINAL')).toBe(true);
  expect(b268VariantAccepted('B268_COMPACT')).toBe(true);
  expect(b268VariantAccepted('B269_REAR_IDENTITY')).toBe(true);
  expect(b268VariantAccepted('REPLACE_SOURCE')).toBe(false);
 });
});
