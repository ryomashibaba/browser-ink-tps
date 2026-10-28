/** B293 read-only real 60Hz source paint -> genuine camera geometry.
 * Projection cannot certify a colored pixel, GPU depth, or scoring.
 */
export type B293EvidenceGate={
 url:URLSearchParams;tick:number;phase:string;paused:boolean;locked:boolean;
 stopped:boolean;fullRound:boolean;shots:number;cells:number;travel:number;
 renderer:string;uvTriangles:number;textures:number;sourceVisible:boolean;
 solids:number;paint:number;links:number;scoreable:number;paintMeshes:number;
 samePaintInstances:boolean;cameraUnchanged:boolean;actorRelocations:number
};
export function b293Eligible(x:B293EvidenceGate){
 return x.url.get('t21B293')==='realInkViewport'&&
  x.url.get('t21Play')==='preview'&&
  x.url.get('t21QaDrive')==='source'&&
  x.url.get('t21W10B192')==='humanCombat'&&
  x.url.get('t21W10B203')==='fullRound'&&
  x.url.get('t21B289')==='nativeInPlayActorArt'&&
  x.tick>=42&&['STAGING','PLAYING'].includes(x.phase)&&x.paused&&
  !x.locked&&!x.stopped&&x.fullRound&&x.shots>0&&x.cells>0&&
  Number.isFinite(x.travel)&&x.travel>=.75&&
  x.renderer==='webgl2'&&x.uvTriangles===57578&&x.textures===19&&
  x.sourceVisible&&x.solids===25&&x.paint===17&&x.links===26&&
  x.scoreable===0&&x.paintMeshes===17&&x.samePaintInstances&&
  x.cameraUnchanged&&x.actorRelocations===0;
}
type Sample={surfaceId:string;team:'A'|'B';
 screenPx:[number,number,number];inFront:boolean;insideViewport:boolean};
export function b293QuantifyInkProjections(source:{
 source:string;ownedCells:number;sampledCells:number;
 samplesInsideViewport:number;samples:readonly Sample[];
 perSurface:readonly {surfaceId:string;owned:number;sampled:number;inCanvas:number}[]
},width:number,height:number){
 if(source.source!=='25/17/26/0'||source.perSurface.length!==17||
    new Set(source.perSurface.map(s=>s.surfaceId)).size!==17||
    width<200||height<200||source.ownedCells<1||
    source.sampledCells!==source.samples.length||
    source.samplesInsideViewport!==source.samples.filter(s=>s.insideViewport).length||
    source.perSurface.reduce((n,s)=>n+s.owned,0)!==source.ownedCells||
    source.perSurface.reduce((n,s)=>n+s.sampled,0)!==source.sampledCells)
  throw Error('B293_NATIVE_PROJECTION_INVALID');
 const visible=source.samples.filter(s=>s.inFront&&s.insideViewport);
 if(visible.some(s=>!s.screenPx.every(Number.isFinite)||
    s.screenPx[0]<0||s.screenPx[0]>=width||
    s.screenPx[1]<0||s.screenPx[1]>=height))
  throw Error('B293_INVALID_VIEWPORT_SAMPLE');
 const inFront=source.samples.filter(s=>s.inFront).length;
 const nearAim=visible.filter(s=>Math.hypot(
  (s.screenPx[0]-width*.5)/width,
  (s.screenPx[1]-height*.5)/height)<.14).length;
 return {schema:'B293_REAL_NATIVE_OWNER_CELLS_IN_CAMERA' as const,
  actualOwnerCells:source.ownedCells,paintSampleCount:source.sampledCells,
  insideScreen:visible.length,behindCamera:source.sampledCells-inFront,
  outsideScreen:inFront-visible.length,nearAim,
  lowerScreen:visible.filter(s=>s.screenPx[1]>height*.55).length,
  percentSamplesOnScreen:Math.round(visible.length/
   Math.max(1,source.sampledCells)*1000)/10,
  paintSurfacesWithOwner:source.perSurface.filter(s=>s.owned>0),
  sampledProjectedCells:source.samples,
  framebufferInkVisibilityCertified:false as const,
  opticalOcclusionTested:false as const,inkOwnershipEdited:false as const,
  scoreablePromotions:0 as const,artAccepted:false as const,
  productionAuthorized:false as const};
}
