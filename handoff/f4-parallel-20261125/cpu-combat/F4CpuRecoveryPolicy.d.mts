export function recoveringInk(previous:boolean,ink:number,capacity:number):boolean;
export function recoveryAction(s:{recovering:boolean;committed:boolean;ink:number;minCost:number;range:number;visible:boolean;distance:number}):'NORMAL'|'FINISH'|'DEFEND'|'RECOVER';
export function shouldThrowCombatSub(s:{subId:string;visible:boolean;mainTargetVisible:boolean;committed:boolean;recovering:boolean;ink:number;cost:number;capacity:number;distance:number;mainRange:number;subMin:number;subMax:number}):boolean;
export function mergedRecovery(previous:number,next:number):number|null;
