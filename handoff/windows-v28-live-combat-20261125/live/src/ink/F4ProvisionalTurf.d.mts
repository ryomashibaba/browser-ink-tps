import type {PaintSurface} from './PaintSurface';
export interface F4ProvisionalScore {
 status:'BUILDING'|'LIVE'|'FINAL'|'HOLD';winner:'NONE'|'A'|'B'|'DRAW';progress:number;reason?:string;
 extraFloor?:{registeredTiles:number;backedProjectedM2:number;areaA:number;areaB:number};
 areaA?:number;areaB?:number;neutralArea?:number;totalProjectedM2?:number;percentA?:number;percentB?:number;
}
export class F4ProvisionalTurf {
 constructor(surfaces:readonly PaintSurface[],backed:(s:PaintSurface,x:number,y:number,index:number)=>boolean,requireExtra?:boolean);
 scan(limit:number,keepGoing?:()=>boolean):void;
 beforeChange(surface:PaintSurface,index:number,oldOwner:number,newOwner:number):number;
 read():F4ProvisionalScore;
 finish(tick:number):F4ProvisionalScore;
}
export function f4ProvisionalTurfLabel(s:F4ProvisionalScore|null):string;
