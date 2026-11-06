/** B483: actual B441 player frontline may direct genuine A1 via the
 * existing B471 real player C key and original Rapier/Recast gates.
 * A command is never an actor move, verified arrival, enemy contact,
 * shortcut over the original F4 gap, or score. */
import {b475RealFrontlineReadyMode} from './B475RealFrontlineReadyChallenge';
export function b483RealFrontlineTeammateCommandSelected(
 p:Pick<URLSearchParams,'get'>
):boolean{return b475RealFrontlineReadyMode(p);}
export function b483MayRequestTrueFrontlineA1Order(input:{
 selected:boolean;stage:readonly number[];nativeTick:number;
 matchState:string;paused:boolean;stopReason:string|null;
 pointerLocked:boolean;playerHp:number;originalCpuRejoins:number;
 practiceVariant:string;practiceStatus:string;
}):boolean{
 return input.selected&&input.stage.join(',')==='25,17,26,0'&&
  Number.isSafeInteger(input.nativeTick)&&input.nativeTick>0&&
  input.matchState==='PLAYING'&&!input.paused&&
  input.stopReason===null&&input.pointerLocked&&
  Number.isFinite(input.playerHp)&&input.playerHp>0&&
  input.originalCpuRejoins===7&&
  input.practiceVariant==='CLASSIC'&&
  input.practiceStatus==='RUNNING';
}
