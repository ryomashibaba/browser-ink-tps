export type Point3=[number,number,number];
export function cpuTornadoAim(origin:Point3,target:Point3,
 cast:(a:Point3,b:Point3)=>{point:Point3;normal:Point3}|null,
 lob:(direction:Point3,distance:number,speed:number,gravity:number,lifetime:number)=>Point3|null):Point3|null;
