import {describe,it,expect} from 'vitest';
import {B260_SOURCE_TARGETS,b260Target,b260SourceGate,
 b260DrawVisible,b260NestedDrawGroupVisible,B260_SOURCE_AUTHORITY} from './B260SourceMaterialAttribution';
const url=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit&t21B260=materialAudit');
const ctx={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,solids:25,
 paintable:17,links:26,scoreable:0,triangles:57578,textures:19,cpuCount:7};
describe('B260 original source material pixel sensitivity study',()=>{
 it('never enables without strict prior SOURCE pause and render baseline',()=>{
  expect(b260SourceGate(url,ctx,'BASELINE')).toBe(true);
  expect(b260SourceGate(url,ctx,'HIDE_UV_DETAIL')).toBe(false);
  for(const key of ['t21B260','t21B259','t21B253','t21FullSource']){
   const p=new URLSearchParams(url);p.delete(key);
   expect(b260SourceGate(p,ctx,'BASELINE')).toBe(false);
  }
  for(const bad of [{paused:false},{pointerLocked:true},{fullRound:true},
   {solids:24},{paintable:18},{links:27},{scoreable:1},{triangles:57577},
   {humanoid:false},{cameraBaseline:false},{b256Active:true},
   {verifiedUv:false},{inkSafe:false},{cpuCount:6}]){
   expect(b260SourceGate(url,{...ctx,...bad},'BASELINE')).toBe(false);
  }
  const deterministic=new URLSearchParams(url);
  deterministic.set('t21QaInput','deterministic');
  expect(b260SourceGate(deterministic,ctx,'BASELINE')).toBe(false);
 });
 it('traverses certified footprint child renderers, not only a parent component',()=>{
  const footprint={render:null,children:[
   {render:{meshInstances:[{visible:true}]},children:[]},
   {render:{meshInstances:[{visible:true}]},children:[]}
  ]};
  expect(b260NestedDrawGroupVisible(footprint)).toBe(true);
  expect(b260NestedDrawGroupVisible({...footprint,children:[
   {render:{meshInstances:[{visible:true}]},children:[]},
   {render:{meshInstances:[{visible:false}]},children:[]}
  ]})).toBe(false);
  expect(b260NestedDrawGroupVisible({render:null,children:[]})).toBe(false);
  expect(()=>b260NestedDrawGroupVisible({
   render:null,children:[null]
  })).toThrow('B260_INVALID_DRAW_TREE_NODE');
 });
 it('can hide ONLY one known original material, never all UV/paint',()=>{
  expect(B260_SOURCE_TARGETS.length).toBe(3);
  expect(B260_SOURCE_TARGETS.map(t=>t.kind)).toEqual(['DETAIL','GLASS','METAL']);
  expect(B260_SOURCE_TARGETS.map(t=>t.name)).toEqual([
   'Fld_Temple01_FloorLine02','Fld_Temple01_Glass01',
   'Fld_Temple01_WallMetal00']);
  for(const target of B260_SOURCE_TARGETS){
   expect(b260Target(target.name)).toEqual(target);
   expect(b260DrawVisible(target.name,target.name)).toBe(false);
   expect(b260DrawVisible('Fld_Temple01_Other',target.name)).toBe(true);
   expect(b260DrawVisible(target.name,null)).toBe(true);
  }
  expect(b260Target('unverified')).toBe(null);
  expect(()=>b260DrawVisible('anything','unverified')).toThrow();
  expect(B260_SOURCE_AUTHORITY.renderOnly).toBe(true);
  expect(B260_SOURCE_AUTHORITY.originalTrianglesModified).toBe(0);
  expect(B260_SOURCE_AUTHORITY.paintableSurfacesModified).toBe(0);
  expect(B260_SOURCE_AUTHORITY.artAccepted).toBe(false);
  expect(B260_SOURCE_AUTHORITY.productionAuthorized).toBe(false);
 });
});
