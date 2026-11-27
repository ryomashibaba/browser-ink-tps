import type {F4SpecialId} from './f4/shared-special-score720-20261125/shared-special-score720.mjs';
export function cpuSpecialSightRange(special:F4SpecialId):number;
export function cpuSpecialDecisionDue(id:string,tick:number):boolean;
export function cpuSpecialLob(direction:readonly [number,number,number],distance:number,speed:number,gravity:number,lifetime:number):[number,number,number]|null;
export class F4CpuSpecialTactics {
 reset():void;cancel(id:string):void;accepted(id:string,lifeId:string,special:F4SpecialId,tick:number):void;
 choose(input:{id:string;lifeId:string;special:F4SpecialId;tick:number;active:boolean;ready:boolean;canStart:boolean;grounded:boolean;hp:number;ink:number;recentHit:boolean;distance:number|null;direction:readonly [number,number,number]}):
 {request:boolean;trigger:boolean;cannon:boolean;holdThrow:boolean;releaseThrow:boolean;lob:[number,number,number]|null;reason:string};
}
