export function chooseSlot(slots:readonly {ttl:number;priority?:number;mode?:string}[],priority:number):number;
export function particleBudget(count:number,distanceSq:number):number;
export function droplet(index:number,count:number,phase:number,speed:number,up:number):[number,number,number];
export function pose(x:number,y:number,z:number,vx:number,vy:number,vz:number,t:number,duration:number,size:number):[number,number,number,number];
