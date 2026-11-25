type Point=Readonly<{x:number;y:number;z:number}>;
export function chooseRailRelease(state:{heldSeconds:number;dt:number;fullSeconds:number;minSeconds:number;distance:number;ink:number;recentlyHit:boolean},rail:(fraction:number)=>{range:number;inkCost:number}):{heldSeconds:number;releaseFraction:number|null};
export function reachablePreference(origin:Point,candidates:ReadonlyArray<{id:string;body:Point}>,preferred:string|null,range:number):string|null;
