/** B402: genuine SOURCE ink RADAR POINT SAMPLES, never a reconstructed
 * stage paint mesh, full-coverage map, navigation path or Turf scoring.
 * Each point comes from an actually owned ACTIVE original PaintSurface cell.
 * Samples deliberately underrepresent coverage; use B400/B401 counters
 * for exact ownership counts. No gameplay writes. */
import {Vec3} from 'playcanvas';
export type B402Surface=Readonly<{
 id:string;isScoreable:boolean;
 widthCells:number;heightCells:number;cellSize:number;
 widthMeters:number;heightMeters:number;
 ownerGrid:Readonly<Int8Array>;
 isCellActive:(x:number,y:number)=>boolean;
 localToWorld:(u:number,v:number,out?:Vec3)=>Readonly<{x:number;y:number;z:number}>;
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
 surfaces:number,dots:readonly B402SamplePoint[]=[],realTeamADots=0,realTeamBDots=0):B402RadarProof=>({
 status,reason,nativeTick:tick,sampledOriginalSurfaces:surfaces,dots,
 realTeamADots,realTeamBDots,
 fullCoverageInferred:false,original4v4Certified:false,
 sourceScoreable:0,officialWinner:'NONE',actorTeleports:0,
 paintWrites:0,productionAuthorized:false
});
export function b402OriginalSourceInkRadarSamples(
 surfaces:readonly B402Surface[],stage:readonly number[],
 nativeTick:number,human:readonly [number,number,number],
 halfWidthMeters=32,affinePaintSurfaceBounds=false
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
 const worldScratch=new Vec3();
 const boundScratch=new Vec3();
 let realTeamADots=0,realTeamBDots=0;
 // Bounded 72 source-cell tiles/surface and 1224 visible samples.
 // A dot is one proven cell, NOT the ownership of its surrounding tile.
 for(const s of surfaces){
  const tile=Math.max(1,Math.ceil(Math.sqrt(
   s.widthCells*s.heightCells/72)));
  let perSurface=0;
  for(let y=0;y<s.heightCells&&perSurface<72;y+=tile){
   const endY=Math.min(s.heightCells,y+tile);
   for(let x=0;x<s.widthCells&&perSurface<72;x+=tile){
    const endX=Math.min(s.widthCells,x+tile);
    // Only the real PaintSurface caller opts in: its localToWorld is an
    // affine plane transform. A rectangle's axis extrema are at corners.
    // The small tolerance avoids rejecting a point exactly on the edge.
    // Generic SOURCE fixtures keep their original exhaustive traversal.
    if(affinePaintSurfaceBounds){
     const u0=Math.min((x+.5)*s.cellSize,s.widthMeters-1e-5);
     const u1=Math.min((endX-.5)*s.cellSize,s.widthMeters-1e-5);
     const v0=Math.min((y+.5)*s.cellSize,s.heightMeters-1e-5);
     const v1=Math.min((endY-.5)*s.cellSize,s.heightMeters-1e-5);
     let minX=Infinity,minY=Infinity,minZ=Infinity;
     let maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity,finite=true;
     for(const u of [u0,u1])for(const v of [v0,v1]){
      const w=s.localToWorld(u,v,boundScratch);
      if(![w.x,w.y,w.z].every(Number.isFinite)){finite=false;continue;}
      minX=Math.min(minX,w.x);maxX=Math.max(maxX,w.x);
      minY=Math.min(minY,w.y);maxY=Math.max(maxY,w.y);
      minZ=Math.min(minZ,w.z);maxZ=Math.max(maxZ,w.z);
     }
     const e=1e-6;
     if(finite&&(maxX<human[0]-halfWidthMeters-e||minX>human[0]+halfWidthMeters+e||
        maxZ<human[2]-halfWidthMeters-e||minZ>human[2]+halfWidthMeters+e||
        maxY<human[1]-4-e||minY>human[1]+4+e))continue;
    }
    let found:B402SamplePoint|null=null;
    for(let py=y;py<endY&&!found;py++){
     const row=py*s.widthCells;
     for(let px=x;px<endX;px++){
      const owner=s.ownerGrid[row+px];
      if(owner!==1&&owner!==-1)continue;
      if(!s.isCellActive(px,py))continue;
      const w=s.localToWorld(
       Math.min((px+.5)*s.cellSize,s.widthMeters-1e-5),
       Math.min((py+.5)*s.cellSize,s.heightMeters-1e-5),worldScratch);
      if(!Number.isFinite(w.x)||!Number.isFinite(w.y)||!Number.isFinite(w.z))continue;
      if(Math.abs(w.x-human[0])>halfWidthMeters||
         Math.abs(w.z-human[2])>halfWidthMeters||
         Math.abs(w.y-human[1])>4)continue;
      found={x:w.x,y:w.y,z:w.z,owner};
      break;
     }
    }
    if(found){dots.push(found);perSurface++;if(found.owner===1)realTeamADots++;else realTeamBDots++;}
   }
  }
 }
 return output('SOURCE_PAINT_SAMPLES',
  'ACTUAL_PAINT_OWNER_CELLS_ONLY_NOT_COVERAGE',nativeTick,17,dots,realTeamADots,realTeamBDots);
}

/** Read-only live ownerGrid proof is usable only in the current native round.
 * A replay/reset can rewind actual ticks; never display previous-round ink.
 * No interpolation, team score or gameplay state is inferred here. */
export function b402NativeRadarProofIsFresh(
 proof:B402RadarProof|null,liveNativeTick:number,
 maxSampleAgeNativeTicks=180
):boolean{
 return proof!==null&&proof.status==='SOURCE_PAINT_SAMPLES'&&
  Number.isSafeInteger(proof.nativeTick)&&proof.nativeTick>=1&&
  Number.isSafeInteger(liveNativeTick)&&liveNativeTick>=proof.nativeTick&&
  Number.isSafeInteger(maxSampleAgeNativeTicks)&&maxSampleAgeNativeTicks>=0&&
  liveNativeTick-proof.nativeTick<=maxSampleAgeNativeTicks;
}
