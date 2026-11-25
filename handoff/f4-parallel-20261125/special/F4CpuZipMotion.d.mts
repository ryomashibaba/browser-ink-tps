export type ZipPoint=[number,number,number];
export interface CpuZipCandidate {start:ZipPoint;goal:ZipPoint;normal:ZipPoint;supportId:string;colliderHandle:number;distance:number;targetDistance:number;targetClear:boolean}
export interface CpuZipPhysicalStep {foot:ZipPoint;wallContact:boolean;grounded:boolean;supportId:string|null}
export type CpuZipPhase='OUTBOUND'|'CONTACT'|'ATTACHED'|'RETURN'|'LANDING'|'RETURNED'|'FALL_REQUIRED'|'CANCELLED';
export function selectCpuZipHook(input:{tick:number;ready:boolean;canStart:boolean;grounded:boolean;hp:number;direction:ZipPoint;distance:number|null},probe:(ray:ZipPoint)=>CpuZipCandidate|null):CpuZipCandidate|null;
export class CpuZipMotion {
 constructor(candidate:CpuZipCandidate,tick:number,lifeId:string);
 readonly candidate:CpuZipCandidate;readonly lifeId:string;readonly phase:CpuZipPhase;
 step(input:{tick:number;lifeId:string;foot:ZipPoint;visible:boolean;hp:number},port:{returnClear:(a:ZipPoint,b:ZipPoint,id:string)=>boolean;move:(delta:ZipPoint,hook:CpuZipCandidate)=>CpuZipPhysicalStep|null}):{phase:CpuZipPhase;foot:ZipPoint|null;canFire:boolean};
}
