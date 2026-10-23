/**
 * B137 opt-in native ally rally — dynamic TARGET is the actual grounded
 * human foot, never a fabricated spawn, path, actor or enemy placement.
 * Stage/Recast/Rapier authorizations remain mandatory AFTER this gate.
 */
import {Team} from '../ink/types';
export function eligibleB137OriginalAllyRally(x:{
 enabled:boolean;actorId:string;team:Team.A|Team.B;
 cpuGrounded:boolean;humanGrounded:boolean;humanActive:boolean;
 realCpuFoot:Readonly<{x:number;y:number;z:number}>;
 realHumanFoot:Readonly<{x:number;y:number;z:number}>;
}):boolean{
 if(!x.enabled||x.actorId!=='A1'||x.team!==Team.A||
  !x.cpuGrounded||!x.humanGrounded||!x.humanActive)return false;
 const a=x.realCpuFoot,b=x.realHumanFoot;
 if(![a.x,a.y,a.z,b.x,b.y,b.z].every(Number.isFinite)||
   a.z<33||b.z<33||a.y<2.7||b.y<2.7||
   a.y>5.25||b.y>5.25||Math.abs(a.y-b.y)>.3)return false;
 const separation=Math.hypot(a.x-b.x,a.z-b.z);
 // Avoid crowding the human and long-range corridor speculation.
 return separation>=3&&separation<=18;
}
