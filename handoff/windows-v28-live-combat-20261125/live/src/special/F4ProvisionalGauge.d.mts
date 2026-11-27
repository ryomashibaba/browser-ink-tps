import type {WeaponId} from '../weapons/WeaponCatalog';
import type {Team} from '../ink/types';
export interface F4GaugeActor {actorId:string;lifeId:string;team:Team.A|Team.B;weapon:WeaponId}
export interface F4GaugeState extends F4GaugeActor {alive:boolean;points:number;required:number;ready:boolean;activations:number}
export class F4ProvisionalGauge {
 constructor(kit:Readonly<Record<WeaponId,{required:number}>>,pointsPerM2?:number,retention?:number);
 reset():void;close():void;
 sync(actor:F4GaugeActor,alive:boolean):unknown;
 credit(actor:F4GaugeActor,alive:boolean,area:number,blocked:boolean):number;
 state(id:string):F4GaugeState|null;
 consume(id:string,lifeId:string):boolean;
 snapshot():F4GaugeState[];
}
