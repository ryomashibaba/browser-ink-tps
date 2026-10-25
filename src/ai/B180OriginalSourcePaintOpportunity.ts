/**
 * B180 — true non-scoreable original ownerGrid opportunity around
 * source-verified candidate. Observes real ink cells, not a fake score,
 * synthetic projectile hit, guessed terrain, or navigation path.
 */
import {SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSample} from '../ink/GameplayInkSystem';
export function b180OriginalSourcePatchOpportunity(
 sample:GameplayInkSample,botTeam:Team.A|Team.B
):number{
 const s=sample.surface;
 if(s.isScoreable||(s.baseFlags & SurfaceFlags.Paintable)===0||
    (s.baseFlags & SurfaceFlags.Wall)!==0||
    ![sample.u,sample.v].every(Number.isFinite))return 0;
 const x=Math.min(s.widthCells-1,Math.max(0,Math.floor(sample.u/s.cellSize)));
 const y=Math.min(s.heightCells-1,Math.max(0,Math.floor(sample.v/s.cellSize)));
 // A compact patch inside the truly registered original footprint.
 // Scale offsets in real meters, never select an inactive mesh cell.
 const jump=Math.max(1,Math.round(.32/s.cellSize));
 let score=0;
 for(const dy of [-jump,0,jump]){
  for(const dx of [-jump,0,jump]){
   const px=x+dx,py=y+dy;
   if(!s.isCellActive(px,py))continue;
   const idx=s.index(px,py),flags=s.flagsGrid[idx]??0;
   if((flags & SurfaceFlags.Paintable)===0||
      (flags & (SurfaceFlags.Wall|SurfaceFlags.Scoreable))!==0)continue;
   const owner=s.ownerGrid[idx] as Team;
   if(owner!==botTeam)score+=owner===Team.Neutral?1:1.25;
  }
 }
 return score;
}
