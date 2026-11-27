interface XZ { readonly x:number; readonly z:number }
export function f4MouseHeldAfterMask(held:boolean,buttons:number,bit:1|2):boolean;
export function f4KeepRollIntent(desired:XZ,armedDirection:XZ):boolean;
export function f4AirborneSquidSpeed(humanSpeed:number,ownSpeed:number,vx:number,vz:number):number;
