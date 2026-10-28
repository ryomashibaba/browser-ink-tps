import {describe,it,expect} from 'vitest';
import {BLEND_NONE,BLEND_NORMAL,SORTMODE_BACK2FRONT} from 'playcanvas';
import {b261SourceGate,classifyB261SourceDrawState,
 type B261DrawState} from './B261SourceRenderOrderAudit';
const url=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit&t21B260=materialAudit&'+
 't21B261=sortAudit');
const ctx={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,solids:25,
 paintable:17,links:26,scoreable:0,triangles:57578,textures:19,cpuCount:7};
const native=():B261DrawState=>({
 world:{id:0,opaqueSortMode:0,transparentSortMode:SORTMODE_BACK2FRONT},
 glass:{name:'Fld_Temple01_Glass01',kind:'GLASS',layers:[0],
  visible:true,blendType:BLEND_NORMAL,depthWrite:false,depthTest:true,
  drawBucket:127},
 paint:Array.from({length:17},(_,i)=>({
  name:'PaintSurface:ORIGINAL_'+i,layers:[0],visible:true,
  blendType:BLEND_NONE,depthWrite:true,depthTest:true,drawBucket:127
 }))
});
describe('B261 real source render-subpass read-only classification',()=>{
 it('requires pause, certified source and unhidden B260 baseline',()=>{
  expect(b261SourceGate(url,ctx,'BASELINE',null)).toBe(true);
  expect(b261SourceGate(url,ctx,'BASELINE','Fld_Temple01_Glass01')).toBe(false);
  expect(b261SourceGate(url,ctx,'HIDE_UV_GLASS',null)).toBe(false);
  for(const k of ['t21B261','t21B260','t21B259','t21FullSource']){
   const p=new URLSearchParams(url);p.delete(k);
   expect(b261SourceGate(p,ctx,'BASELINE',null)).toBe(false);
  }
  for(const bad of [{paused:false},{pointerLocked:true},{scoreable:1},
   {paintable:16},{links:25},{triangles:57577},{cameraBaseline:false}]){
   expect(b261SourceGate(url,{...ctx,...bad},'BASELINE',null)).toBe(false);
  }
 });
 it('rejects ineffective bucket-only solution when opaque paint precedes glass',()=>{
  const e=classifyB261SourceDrawState(native());
  expect(e.glassBucketCannotReorderOpaquePaint).toBe(true);
  expect(e.conclusion).toBe('BUCKET_ONLY_HYPOTHESIS_REJECTED');
  expect(e.changedDrawBuckets).toBe(0);
  expect(e.productionAuthorized).toBe(false);
  const alt=native();alt.glass.drawBucket=255;
  expect(classifyB261SourceDrawState(alt).conclusion)
   .toBe('BUCKET_ONLY_HYPOTHESIS_REJECTED');
 });
 it('fails closed on altered original groups or unsafe material',()=>{
  for(const edit of [
   (x:B261DrawState)=>{x.glass.name='FakeGlass';},
   (x:B261DrawState)=>{x.glass.visible=false;},
   (x:B261DrawState)=>{x.paint=x.paint.slice(1);},
   (x:B261DrawState)=>{x.paint[0]!.visible=false;},
   (x:B261DrawState)=>{x.glass.drawBucket=-1;}
  ]){
   const x=native();edit(x);
   expect(()=>classifyB261SourceDrawState(x)).toThrow('B261_UNVERIFIED');
  }
 });
 it('does not overclaim when real layer or material pass differs',()=>{
  const x=native();x.paint[0]!.blendType=BLEND_NORMAL;
  expect(classifyB261SourceDrawState(x).conclusion).toContain('INCONCLUSIVE');
  const y=native();y.glass.layers=[99];
  expect(classifyB261SourceDrawState(y).conclusion).toContain('INCONCLUSIVE');
 });
});
