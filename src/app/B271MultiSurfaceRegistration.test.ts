import {describe,it,expect} from 'vitest';
import {b271NativeFootprintProbes,b271ClassifyOpticalPhysicalRay,
 B271_MAX_SURFACE_RAYS,B271_REGISTRATION_AUTHORITY} from './B271MultiSurfaceRegistration';
function surface(id:string){
 const ownerGrid=new Int8Array(5*5),valid=new Set([1,6,12,18,23]);
 ownerGrid[12]=1;
 return {id,widthCells:5,heightCells:5,cellSize:.4,widthMeters:2,heightMeters:2,ownerGrid,
  isCellActive:(x:number,y:number)=>valid.has(y*5+x),
  localToWorld:(u:number,v:number)=>({x:u,y:2,z:v})};
}
describe('B271 17 authentic footprint surfaces / optical and physics separated',()=>{
 it('keeps at most three ACTIVE, ACTUAL cells per surface',()=>{
  const all=Array.from({length:17},(_,i)=>surface('native-'+i));
  const samples=all.map(s=>b271NativeFootprintProbes(s));
  expect(samples).toHaveLength(17);
  expect(samples.reduce((n,s)=>n+s.probes.length,0)).toBe(B271_MAX_SURFACE_RAYS);
  expect(samples.every(s=>s.probes.every(p=>
   all.find(a=>a.id===s.surfaceId)!.isCellActive(...p.grid)))).toBe(true);
  expect(samples.reduce((n,s)=>n+s.ownedCells,0)).toBe(17);
  expect(B271_REGISTRATION_AUTHORITY).toMatchObject({
   originalRapierSolids:25,originalPaintSurfaces:17,originalNavLinks:26,
   originalScoreables:0,originalOpticalIsNotCollision:true,
   paintedPixelVisibilityNotCertified:true,artAccepted:false});
 });
 it('rejects sampled owner outside real active source footprint',()=>{
  const s=surface('s');s.ownerGrid[0]=1;
  expect(()=>b271NativeFootprintProbes(s)).toThrow(/INK_OUTSIDE/);
 });
 it('preserves Team B as -1, rejects fabricated owner values and clamps partial edge cells',()=>{
  const s=surface('B-real');s.ownerGrid[1]=-1;
  s.widthMeters=1.94;s.heightMeters=1.94;
  const r=b271NativeFootprintProbes(s);
  expect(r.ownedCells).toBe(2);
  expect(r.probes.some(p=>p.owner===-1)).toBe(true);
  expect(r.probes.every(p=>p.world[0]<=1.94&&p.world[2]<=1.94)).toBe(true);
  s.ownerGrid[1]=2;
  expect(()=>b271NativeFootprintProbes(s)).toThrow(/UNKNOWN_NATIVE_PAINT_OWNER/);
 });
 it('does not infer original reachability from optical or nav endpoint',()=>{
  const result=b271ClassifyOpticalPhysicalRay(20,[
   {name:'glass',kind:'GLASS',distanceMeters:1},
   {name:'metal',kind:'METAL',distanceMeters:2}],null,0.3);
  expect(result.opticalHitsBeforeSourcePaint).toBe(2);
  expect(result.physicalBeforeSourcePaint).toBe(false);
  expect(result.navEndpointProvesReachability).toBe(false);
  expect(result.realPaintedPixelVisibilityCertified).toBe(false);
  expect(b271ClassifyOpticalPhysicalRay(20,[],{solidId:'real',distanceMeters:3},null)
   .physicalBeforeSourcePaint).toBe(true);
 });
 it('rejects invalid physical and optical distances',()=>{
  expect(()=>b271ClassifyOpticalPhysicalRay(10,[
   {name:'wrong',kind:'GLASS',distanceMeters:11}],null,0))
   .toThrow(/INVALID_ORIGINAL_RAY/);
 });
});
