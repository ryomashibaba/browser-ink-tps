import {describe,it,expect} from 'vitest';
import {b487ActualOriginalCrossTeamTopology as audit}
 from './B487TrueOriginalCrossTeamTopology';
const a=['A1','A2','A3'],b=['B1','B2','B3','B4'];
const original=()=>({
 originalStage:[25,17,26,0],nativeTick:1780,
 authenticSevenCpu:true,nativeHumanGrounded:true,
 links:[
  ...Array.from({length:12},(_,i)=>({
   id:'first-drop-'+(i<6?'positive-z':'negative-z')+'-'+i,
   start:[0,7.5,i<6?55:-55],end:[.2,3,i<6?55:-55],
   bidirectional:false
  })),
  ...Array.from({length:14},(_,i)=>({
   id:'right-small-drop-'+(i<7?'positive-z':'negative-z')+'-'+i,
   start:[0,7.5,i<7?54:-54],end:[.2,4.5,i<7?54:-54],
   bidirectional:false
  }))
 ],
 pairs:[
  ...a.flatMap(x=>b.map(y=>({actors:[x,y] as [string,string],
   nativePathReported:false,credibleNativeEndpoints:false,
   nativeStartSnapMeters:Infinity,nativeEndSnapMeters:Infinity,
   nativePointCount:0}))),
  ...b.map(y=>({actors:['HUMAN',y] as [string,string],
   nativePathReported:false,credibleNativeEndpoints:false,
   nativeStartSnapMeters:Infinity,nativeEndSnapMeters:Infinity,
   nativePointCount:0}))
 ],nearestHumanEnemy3dMeters:104.59,nearestAllyEnemy3dMeters:78.61
});
describe('B487 real original cross-team links and native path audit',()=>{
 it('returns precise 26 same-side one-way links and 16 live path queries',()=>{
  const v=audit(original());
  expect(v).toMatchObject({originalOneWayDropLinks:26,
   originalFirstDropLinks:12,originalRightSmallDropLinks:14,
   originalExplicitCrossSideLinks:0,totalOriginalNativePathQueries:16,
   nativeCredibleEndpointPairs:0,naturalCrossTeamPathCertified:false,
   sourceGeometryOrNavMutations:0,officialWinner:'NONE'});
  expect(v?.pairs).toHaveLength(16);
  expect(v?.pairs.every(x=>!x.physicalCapsuleRouteCertified)).toBe(true);
 });
 it('rejects new cross-side links, changed source, fake CPU pairs',()=>{
  const seed=original();
  for(const x of [
   {...seed,originalStage:[25,17,27,0]},
   {...seed,authenticSevenCpu:false},
   {...seed,nativeHumanGrounded:false},
   {...seed,nearestHumanEnemy3dMeters:NaN},
   {...seed,links:seed.links.map((l,i)=>i===0?{...l,end:[0,3,-55]}:l)},
   {...seed,links:seed.links.map((l,i)=>i===1?{...l,bidirectional:true}:l)},
   {...seed,links:seed.links.slice(0,25)},
   {...seed,pairs:seed.pairs.slice(0,15)},
   {...seed,pairs:seed.pairs.map((p,i)=>i===0?{...p,
    actors:['A1','B4'] as [string,string]}:p)}
  ])expect(audit(x)).toBeNull();
 });
 it('a native reached path still never certifies a physical route',()=>{
  const f=original();const p=f.pairs.map((x,i)=>i===0?{
   ...x,nativePathReported:true,credibleNativeEndpoints:true,
   nativePointCount:8,nativeStartSnapMeters:.01,
   nativeEndSnapMeters:.02}:x);
  const v=audit({...f,pairs:p})!;
  expect(v.nativeCredibleEndpointPairs).toBe(1);
  expect(v.naturalCrossTeamPathCertified).toBe(false);
  expect(v.physicalCapsuleRouteCertified).toBe(false);
 });
});
