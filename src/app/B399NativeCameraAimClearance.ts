/** F5 SOURCE original live 180s camera readability only.
 * Never changes original hit queries, actor positions or world authority. */
export type B399Point=Readonly<{x:number;y:number;z:number}>;
export const B399_CLEAR_SIGHT_AUTHORITY=Object.freeze({
 renderOnly:true,sourceOnly:true,productionAuthorized:false,
 originalSolids:25 as const,originalPaintSurfaces:17 as const,
 originalNavLinks:26 as const,scoreable:0 as const,
 enemyActorsHidden:0 as const,newActorBodies:0 as const,
 gameplayDamageModified:false as const,artAccepted:false as const
});
/** Actual near-lens PlayCanvas center-line test against a real actor
 * render center. Exit-only hysteresis avoids flicker at the sight edge. */
export function b399ActorIntersectsCameraAim(
 eye:B399Point,forward:B399Point,actor:B399Point,
 previouslyHidden=false,kind:'PLAYER'|'ALLY'='ALLY'
):boolean{
 if(![eye.x,eye.y,eye.z,forward.x,forward.y,forward.z,
      actor.x,actor.y,actor.z].every(Number.isFinite))return false;
 const len=Math.hypot(forward.x,forward.y,forward.z);
 if(len<1e-6)return false;
 const x=actor.x-eye.x,y=actor.y-eye.y,z=actor.z-eye.z;
 const along=(x*forward.x+y*forward.y+z*forward.z)/len;
 // SOURCE TPS camera sits 6.4 m behind the actual player in open space.
 // Never confuse this genuine optical distance with gameplay hit range.
 // A close ally may be suppressed only inside a smaller 4.2 m envelope.
 const maxDistance=kind==='PLAYER'?8.5:4.2;
 if(along<.22||along>maxDistance)return false;
 const radius=kind==='PLAYER'?
  (previouslyHidden?1.04:.84):
  (previouslyHidden?.80:.62);
 return Math.max(0,x*x+y*y+z*z-along*along)<=radius*radius;
}

/** Genuine SOURCE player V, render-only existing B399 toggle; not survey. */
export function b399NativeRealVAllowed(x:Readonly<{
 code:string;mode:string|null;fullRound:boolean;stage:readonly number[];
 phase:string;paused:boolean;stopped:boolean;locked:boolean;hp:number;
 repeat:boolean;modified:boolean;editing:boolean;
}>):boolean{
 return x.code==='KeyV'&&!x.repeat&&!x.modified&&!x.editing&&
  x.fullRound&&x.locked&&x.phase==='PLAYING'&&!x.paused&&
  !x.stopped&&Number.isFinite(x.hp)&&x.hp>0&&
  x.stage.length===4&&x.stage.join('/')==='25/17/26/0'&&
  ['circuit','combat','coop','frontline'].includes(x.mode??'');
}
