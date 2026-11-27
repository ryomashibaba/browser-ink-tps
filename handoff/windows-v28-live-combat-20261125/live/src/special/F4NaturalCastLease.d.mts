type Point3=[number,number,number];
export class F4NaturalCastLease {
 admit(id:string,lifeId:string,tick:number):boolean;
 touch(id:string,lifeId:string,tick:number):boolean;
 end(id:string,lifeId:string):boolean;
 clear():void;
 due(tick:number):{id:string;lifeId:string;reason:'natural-cast-timeout'|'natural-input-stalled'}[];
}
export function cpuSpecialLaunchAim(origin:Point3,target:Point3|undefined,speed:number,gravity:number,lifetime:number,
 lob:(direction:Point3,distance:number,speed:number,gravity:number,lifetime:number)=>Point3|null):Point3|null;
