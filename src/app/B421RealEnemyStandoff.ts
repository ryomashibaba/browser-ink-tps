/** B421 source-only real enemy standoff. Input nativePathPoints
 * and target are TRUE original Recast/CPU feet, never spawned actors.
 * This is a proposal only. Caller MUST re-audit registered Rapier foot,
 * native Recast endpoints and every original-source route segment. */
import {chooseB142OriginalAllyStandoff,type B142Foot}
 from './UndertowF3OriginalAllyStandoff';
export function b421RealEnemyStandoff(
 path:readonly B142Foot[],realEnemyFoot:B142Foot,side:1|-1
):B142Foot|null{
 const accepted=(x:B142Foot)=>[x.x,x.y,x.z].every(Number.isFinite)&&
  x.z*side>=33&&x.y>=2.7&&x.y<=5.25;
 if(![1,-1].includes(side)||!Array.isArray(path)||path.length<2||
    !accepted(realEnemyFoot)||path.some(x=>!accepted(x)))return null;
 const goal=chooseB142OriginalAllyStandoff(path,realEnemyFoot);
 if(!goal||!accepted(goal))return null;
 const d=Math.hypot(goal.x-realEnemyFoot.x,goal.z-realEnemyFoot.z);
 return d>=1.7&&d<=3.5?goal:null;
}
