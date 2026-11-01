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
 eye:B399Point,forward:B399Point,actor:B399Point,previouslyHidden=false
):boolean{
 if(![eye.x,eye.y,eye.z,forward.x,forward.y,forward.z,
      actor.x,actor.y,actor.z].every(Number.isFinite))return false;
 const len=Math.hypot(forward.x,forward.y,forward.z);
 if(len<1e-6)return false;
 const x=actor.x-eye.x,y=actor.y-eye.y,z=actor.z-eye.z;
 const along=(x*forward.x+y*forward.y+z*forward.z)/len;
 if(along<.22||along>3.8)return false;
 const radius=previouslyHidden ? .78 : .53;
 return Math.max(0,x*x+y*y+z*z-along*along)<=radius*radius;
}
