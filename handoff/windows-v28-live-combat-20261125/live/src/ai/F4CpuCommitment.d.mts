type FireLife={sourceId:string;team:number;weaponId:string;f4SourceLifeSerial?:number;sourceInkTransaction?:unknown};
type ActorLife={id:string;team:number;weaponId:string;f4LifeSerial:number;lifeState:string;hp:number};
export function sameCpuFireLife(request:Pick<FireLife,'f4SourceLifeSerial'>,bot:Pick<ActorLife,'f4LifeSerial'>|null|undefined):boolean;
export function unemittedCpuMainDisposition(request:FireLife,bot:ActorLife|null|undefined):'IGNORE'|'REFUND'|'DROP_COUNT';
export function hasCpuMainWindup(actorId:string,sloshes?:ReadonlyMap<string,unknown>,canopies?:ReadonlyMap<string,unknown>,sabers?:ReadonlyMap<string,unknown>):boolean;
