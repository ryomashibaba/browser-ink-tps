import {describe,it,expect} from 'vitest';
import {b293Eligible,b293QuantifyInkProjections,type B293EvidenceGate} from './B293ActualInkViewport';
const url=new URLSearchParams('t21B293=realInkViewport&t21Play=preview&t21QaDrive=source&t21W10B192=humanCombat&t21W10B203=fullRound&t21B289=nativeInPlayActorArt');
const gate:B293EvidenceGate={url,tick:85,phase:'STAGING',paused:true,
 locked:false,stopped:false,fullRound:true,shots:8,cells:315,travel:3,
 renderer:'webgl2',uvTriangles:57578,textures:19,sourceVisible:true,
 solids:25,paint:17,links:26,scoreable:0,paintMeshes:17,
 samePaintInstances:true,cameraUnchanged:true,actorRelocations:0};
describe('B293 original source read-only ink visibility',()=>{
 it('requires genuine already-painted paused native source',()=>{
  expect(b293Eligible(gate)).toBe(true);
  expect(b293Eligible({...gate,uvTriangles:0,textures:0,
   sourceVisible:false})).toBe(true);
  expect(b293Eligible({...gate,uvTriangles:123,textures:3,
   sourceVisible:true})).toBe(false);
  for(const patch of [{paused:false},{tick:0},{shots:0},{cells:0},
   {travel:0},{paint:18},{solids:26},{links:25},{scoreable:1},
   {paintMeshes:16},{samePaintInstances:false},{actorRelocations:1},
   {phase:'TIME_UP'},{renderer:'webgpu'}])
   expect(b293Eligible({...gate,...patch})).toBe(false);
  expect(b293Eligible({...gate,url:new URLSearchParams()})).toBe(false);
 });
 it('counts real cells in sight without claiming raster proof',()=>{
  const perSurface=Array.from({length:17},(_,i)=>({
   surfaceId:'source-'+i,owned:i===0?5:0,sampled:i===0?3:0,
   inCanvas:i===0?1:0}));
  const x=b293QuantifyInkProjections({source:'25/17/26/0',
   ownedCells:5,sampledCells:3,samplesInsideViewport:1,
   samples:[{surfaceId:'source-0',team:'A',
     screenPx:[800,500,3],inFront:true,insideViewport:true},
    {surfaceId:'source-0',team:'A',
     screenPx:[2100,500,3],inFront:true,insideViewport:false},
    {surfaceId:'source-0',team:'A',
     screenPx:[0,0,-2],inFront:false,insideViewport:false}],
   perSurface},1600,900);
  expect(x).toMatchObject({insideScreen:1,behindCamera:1,
   outsideScreen:1,nearAim:1,framebufferInkVisibilityCertified:false,
   scoreablePromotions:0,artAccepted:false});
  expect(()=>b293QuantifyInkProjections({...{
   source:'25/17/26/0',ownedCells:0,sampledCells:0,
   samplesInsideViewport:0,samples:[],perSurface}},1600,900)).toThrow();
 });
});
