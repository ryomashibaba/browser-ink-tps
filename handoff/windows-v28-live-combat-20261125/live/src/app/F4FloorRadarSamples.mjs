// Read-only F4 floor samples and pause/final ownership counts; no official score or geometry authority.
export function f4FloorRadarSamples(surfaces,human,half=32,limit=1200){
 const dots=[];
 if(human.length!==3||!human.every(Number.isFinite)||!Number.isFinite(half)||half<=0||!Number.isInteger(limit)||limit<1)return dots;
 const [hx,hy,hz]=human;
 const visible=surfaces.filter(s=>s.id.startsWith("F4ProvisionalFloor:")&&!s.isScoreable&&
  Math.abs(s.center.x-hx)<=half+Math.hypot(s.widthMeters,s.heightMeters)/2&&
  Math.abs(s.center.z-hz)<=half+Math.hypot(s.widthMeters,s.heightMeters)/2&&
  Math.abs(s.center.y-hy)<=4+Math.hypot(s.widthMeters,s.heightMeters)/2);
 visible.sort((a,b)=>Math.hypot(a.center.x-hx,a.center.y-hy,a.center.z-hz)-Math.hypot(b.center.x-hx,b.center.y-hy,b.center.z-hz));
 // At most one genuine cell per block. No interpolation of ownership.
 const per=Math.max(1,Math.floor(limit/Math.max(1,visible.length)));
 for(const s of visible){
  if(dots.length>=limit)break;
  const stride=Math.max(1,Math.ceil(Math.sqrt(s.widthCells*s.heightCells/per)));
  let n=0;
  for(let y=0;y<s.heightCells&&n<per&&dots.length<limit;y+=stride){
   for(let x=0;x<s.widthCells&&n<per&&dots.length<limit;x+=stride){
    let found=null;
    for(let iy=y;iy<Math.min(y+stride,s.heightCells)&&!found;iy++){
     for(let ix=x;ix<Math.min(x+stride,s.widthCells);ix++){
      const index=iy*s.widthCells+ix,owner=s.ownerGrid[index];
      if((owner!==1&&owner!==-1)||!(s.flagsGrid[index]&1)||!s.isCellActive(ix,iy))continue;
      const w=s.localToWorld(Math.min((ix+.5)*s.cellSize,s.widthMeters-1e-5),Math.min((iy+.5)*s.cellSize,s.heightMeters-1e-5));
      if(![w.x,w.y,w.z].every(Number.isFinite)||Math.abs(w.x-hx)>half||Math.abs(w.z-hz)>half||Math.abs(w.y-hy)>4)continue;
      found={x:w.x,y:w.y,z:w.z,owner};break;
     }
    }
    if(found){dots.push(found);n++;}
   }
  }
 }
 return dots;
}

export function f4FloorPaintEvidence(surfaces){
 const rows=[];
 for(const s of surfaces){
  if(!s.id.startsWith("F4ProvisionalFloor:"))continue;
  let a=0,b=0,candidateCells=0,invalidOwned=0;
  for(let i=0;i<s.ownerGrid.length;i++){
   const owner=s.ownerGrid[i],active=(s.flagsGrid[i]&1)!==0&&s.isCellActive(i%s.widthCells,Math.floor(i/s.widthCells));
   if(active){candidateCells++;if(owner===1)a++;else if(owner===-1)b++;else if(owner!==0)invalidOwned++;}
   else if(owner!==0)invalidOwned++;
  }
  rows.push({id:s.id,center:[s.center.x,s.center.y,s.center.z],candidateCells,a,b,invalidOwned});
 }
 return {registeredTiles:rows.length,ownedTiles:rows.filter(s=>s.a+s.b>0).length,
  teamA:rows.reduce((n,s)=>n+s.a,0),teamB:rows.reduce((n,s)=>n+s.b,0),
  invalidOwned:rows.reduce((n,s)=>n+s.invalidOwned,0),rows,
  candidateCellsAreNotScoreDenominator:true,officialCertification:false};
}
