import {describe,it,expect} from 'vitest';
import {B257_SCREEN_PROBES,B257_AUDIT_AUTHORITY,
 b257AuditEligible,traceB257SourceOpticalRays}
 from './B257OriginalSourceDepthAudit';
const params=new URLSearchParams('t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit');
const safe={paused:true,staging:true,fullRound:false,pointerLocked:false,
 stopped:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,solids:25,paintable:17,links:26,
 scoreable:0,triangles:57578,textures:19,cpuCount:7};
const point=(x:number,y:number,z:number)=>({x,y,z});
const triangle=(z:number)=>{
 return new Float32Array([-1,-1,z,1,-1,z,0,1,z]);
};
describe('B257 verified optical ray vs certified physical ray audit',()=>{
 it('measures closest original optical triangle and reverses faces',()=>{
  const meshes=[
   {name:'far',kind:'FLOOR',vertices:triangle(9)},
   {name:'near',kind:'STRUCTURE',vertices:triangle(4)}
  ];
  const a=traceB257SourceOpticalRays(meshes,point(0,0,0),point(0,0,12));
  expect(a.scannedTriangles).toBe(2);
  expect(a.nearest).toMatchObject({name:'near',kind:'STRUCTURE',
   distanceMeters:4,point:[0,0,4]});
  expect(a.nearestGroups.map(x=>x.name)).toEqual(['near','far']);
  const b=traceB257SourceOpticalRays(meshes,point(0,0,12),point(0,0,0));
  expect(b.nearest?.name).toBe('far');
  expect(b.nearest?.distanceMeters).toBe(3);
 });
 it('rejects off-ray / behind ray / degenerate triangle',()=>{
  const tri=triangle(4);
  expect(traceB257SourceOpticalRays([{name:'s',kind:'FLOOR',vertices:tri}],
   point(3,0,0),point(3,0,12)).nearest).toBeNull();
  expect(traceB257SourceOpticalRays([{name:'s',kind:'FLOOR',vertices:tri}],
   point(0,0,5),point(0,0,12)).nearest).toBeNull();
  expect(traceB257SourceOpticalRays([{name:'s',kind:'FLOOR',
   vertices:new Float32Array(9)}],point(0,0,0),point(0,0,12)).nearest).toBeNull();
  expect(()=>traceB257SourceOpticalRays([{name:'broken',kind:'FLOOR',
   vertices:new Float32Array(8)}],point(0,0,0),point(0,0,12)))
   .toThrow('B257_NOT_TRIANGLES');
 });
 it('requires genuine frozen scene and rejects false release authority',()=>{
  expect(b257AuditEligible(params,safe)).toBe(true);
  for(const key of ['t21Play','t21FullSource','t21B253','t21B255','t21B257']){
   const p=new URLSearchParams(params);p.delete(key);
   expect(b257AuditEligible(p,safe),key).toBe(false);
  }
  for(const [key,value] of Object.entries({
   paused:false,staging:false,fullRound:true,pointerLocked:true,
   stopped:true,otherStudy:true,verifiedUv:false,inkSafe:false,
   humanoid:false,b256Active:true,solids:26,paintable:18,links:27,
   scoreable:1,triangles:3,textures:0,cpuCount:8
  }))expect(b257AuditEligible(params,{...safe,[key]:value}),key).toBe(false);
  expect(B257_SCREEN_PROBES.length).toBe(9);
  expect(B257_AUDIT_AUTHORITY).toMatchObject({
   noCameraReposition:true,noActorRelocation:true,
   noNewSolid:true,noNewNavLink:true,noNewPaintSurface:true,
   productionAuthorized:false
  });
 });
});
