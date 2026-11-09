/** Relative height of genuine Rapier actor feet, not source walkability. */
export function sourceRadarHeightBand(playerY:number,actorY:number){
 if(!Number.isFinite(playerY)||!Number.isFinite(actorY))
  throw Error('T21_B52_INVALID_PHYSICAL_FOOT');
 const d=actorY-playerY;
 return d>2?'ABOVE' as const:d< -2?'BELOW' as const:'LEVEL' as const;
}

/** A genuine current ally foot outside the centered ±32m SOURCE radar.
 * Visual DIRECT bearing only, never navigation guidance or a new CPU.
 * The output remains inside the existing 300x310 clipping rectangle.
 */
export function sourceRadarOffscreenFootMarker(
 playerX:number,playerZ:number,actorX:number,actorZ:number
):{x:number;y:number;angle:number;directMeters:number;
 actualFootOnly:true;walkableRouteCertified:false}|null{
 if(![playerX,playerZ,actorX,actorZ].every(Number.isFinite))
  throw Error('T21_RADAR_INVALID_NATIVE_FOOT_COORDINATES');
 const w=300,h=310,scale=(h-46)/64,cx=w/2,cy=h/2;
 const dx=(actorX-playerX)*scale,dy=-(actorZ-playerZ)*scale;
 // Same rectangle as canvas rendering: x 10..290, y 9..291.
 if(cx+dx>=10&&cx+dx<=290&&cy+dy>=9&&cy+dy<=291)
  return null;
 const left=18,right=282,top=18,bottom=273;
 const factor=Math.min(
  dx>0?(right-cx)/dx:dx<0?(left-cx)/dx:Infinity,
  dy>0?(bottom-cy)/dy:dy<0?(top-cy)/dy:Infinity
 );
 if(!Number.isFinite(factor)||factor<=0)
  throw Error('T21_RADAR_INVALID_OFFSCREEN_DIRECTION');
 return {
  x:cx+dx*factor,y:cy+dy*factor,
  angle:Math.atan2(dy,dx),
  directMeters:Math.hypot(actorX-playerX,actorZ-playerZ),
  actualFootOnly:true,walkableRouteCertified:false
 };
}
