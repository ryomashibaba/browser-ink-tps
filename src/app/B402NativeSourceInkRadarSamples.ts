/** B402: genuine SOURCE ink RADAR POINT SAMPLES, never a reconstructed
 * stage paint mesh, full-coverage map, navigation path or Turf scoring.
 * Each point comes from an actually owned ACTIVE original PaintSurface cell.
 * Samples deliberately underrepresent coverage; use B400/B401 counters
 * for exact ownership counts. No gameplay writes. */
export type B402Surface=Readonly<{
 id:string;isScoreable:boolean;
 widthCells:number;heightCells:number;cellSize:number;
 widthMeters:number;heightMeters:number;
 ownerGrid:Readonly<Int8Array>;
 isCellActive:(x:number,y:number)=>boolean;
 localToWorld:(u:number,v:number)=>Readonly<{x:number;y:number;z:number}>;
}>;
export type B402SamplePoint=Readonly<{
 x:number;y:number;z:number;owner:1|-1;
}>;
export type B402RadarProof=Readonly<{
 status:'SOURCE_PAINT_SAMPLES'|'HOLD';
 reason:string;
 nativeTick:number;sampledOriginalSurfaces:number;
 dots:readonly B402SamplePoint[];
 realTeamADots:number;realTeamBDots:number;
 fullCoverageInferred:false;original4v4Certified:false;
 sourceScoreable:0;officialWinner:'NONE';
 actorTeleports:0;paintWrites:0;productionAuthorized:false;
}>;
const output=(status:B402RadarProof['status'],reason:string,tick:number,
 surfaces:number,dots:readonly B402SamplePoint[]=[]):B402RadarProof=>({
 status,reason,nativeTick:tick,sampledOriginalSurfaces:surfaces,dots,
 realTeamADots:dots.filter(p=>p.owner===1).length,
 realTeamBDots:dots.filter(p=>p.owner===-1).length,
 fullCoverageInferred:false,original4v4Certified:false,
 sourceScoreable:0,officialWinner:'NONE',actorTeleports:0,
 paintWrites:0,productionAuthorized:false
});
export function b402OriginalSourceInkRadarSamples(
 surfaces:readonly B402Surface[],stage:readonly number[],
 nativeTick:number,human:readonly [number,number,number],
 halfWidthMeters=32
):B402RadarProof{
 if(!Array.isArray(stage)||stage.join('/')!=='25/17/26/0'||
    !Array.isArray(surfaces)||surfaces.length!==17||
    !Number.isSafeInteger(nativeTick)||nativeTick<1||
    !Array.isArray(human)||human.length!==3||
    human.some(v=>!Number.isFinite(v))||
    !Number.isFinite(halfWidthMeters)||halfWidthMeters<=0)
  return output('HOLD','FROZEN_SOURCE_OR_NATIVE_POSITION_INVALID',nativeTick,surfaces.length);
 const used=new Set<string>();
 // Every current grid must be structurally original before ANY display.
 for(const s of surfaces){
  if(!s.id||used.has(s.id)||s.isScoreable||
   !Number.isSafeInteger(s.widthCells)||s.widthCells<1||
   !Number.isSafeInteger(s.heightCells)||s.heightCells<1||
   !Number.isFinite(s.cellSize)||s.cellSize<=0||
   !Number.isFinite(s.widthMeters)||s.widthMeters<=0||
   !Number.isFinite(s.heightMeters)||s.heightMeters<=0||
   s.ownerGrid.length!==s.widthCells*s.heightCells)
   return output('HOLD','UNVERIFIED_OR_SCOREABLE_ORIGINAL_GRID',nativeTick,surfaces.length);
  used.add(s.id);
 }
 const dots:B402SamplePoint[]=[];
 // Bounded 72 source-cell tiles/surface and 1224 visible samples.
 // A dot is one proven cell, NOT the ownership of its surrounding tile.
 for(const s of surfaces){
  const tile=Math.max(1,Math.ceil(Math.sqrt(
   s.widthCells*s.heightCells/72)));
  let perSurface=0;
  for(let y=0;y<s.heightCells&&perSurface<72;y+=tile){
   for(let x=0;x<s.widthCells&&perSurface<72;x+=tile){
    let found:B402SamplePoint|null=null;
    for(let py=y;py<Math.min(s.heightCells,y+tile)&&!found;py++){
     for(let px=x;px<Math.min(s.widthCells,x+tile);px++){
      const owner=s.ownerGrid[py*s.widthCells+px];
      if(owner!==1&&owner!==-1)continue;
      if(!s.isCellActive(px,py))continue;
      const w=s.localToWorld(
       Math.min((px+.5)*s.cellSize,s.widthMeters-1e-5),
       Math.min((py+.5)*s.cellSize,s.heightMeters-1e-5));
      if(![w.x,w.y,w.z].every(Number.isFinite))continue;
      if(Math.abs(w.x-human[0])>halfWidthMeters||
         Math.abs(w.z-human[2])>halfWidthMeters||
         Math.abs(w.y-human[1])>4)continue;
      found={x:w.x,y:w.y,z:w.z,owner};
      break;
     }
    }
    if(found){dots.push(found);perSurface++;}
   }
  }
 }
 return output('SOURCE_PAINT_SAMPLES',
  'ACTUAL_PAINT_OWNER_CELLS_ONLY_NOT_COVERAGE',nativeTick,17,dots);
}
