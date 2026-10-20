/** Relative height of genuine Rapier actor feet, not source walkability. */
export function sourceRadarHeightBand(playerY:number,actorY:number){
 if(!Number.isFinite(playerY)||!Number.isFinite(actorY))
  throw Error('T21_B52_INVALID_PHYSICAL_FOOT');
 const d=actorY-playerY;
 return d>2?'ABOVE' as const:d< -2?'BELOW' as const:'LEVEL' as const;
}
