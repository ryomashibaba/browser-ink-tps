type Point = Readonly<{x:number;y:number;z:number}>;
export type F4InkRelation='OWN'|'NEUTRAL'|'ENEMY'|'UNKNOWN';
type Band={near:number;far:number;ideal:number};
type State={f4:boolean;alive:boolean;grounded:boolean;rejoined:boolean;localWalkingAllowed:boolean;centerTransferPending:boolean;respawnPending:boolean;currentSupport:boolean;foot:Point;hp:number|undefined;ink:number|undefined;weaponClass:string;rangeM:number;enemy:{alive:boolean;visibleNow:boolean;foot:Point;hitPoint?:Point};muzzleHeight?:number;inkRelation:F4InkRelation;recovering?:boolean;recentlyHit?:boolean;committedAction?:boolean;specialActive?:boolean};
export function preferredBand(weaponClass:string,rangeM:number):Band|null;
export function combatSpacing(weaponClass:string,rangeM:number,d:number,visible:boolean,recovering:boolean):{band:Band;advance:-1|0|1}|null;
export function rankCombatCandidate(input:{distance:number;band:Band;covered:boolean;ownInk:boolean;recovering:boolean;lateral:number;recentlyHit:boolean}):number;
export function tacticalIntent(state:State):{mode:'BASELINE'}|{mode:'RETREAT'|'APPROACH'|'HOLD_RANGE';band:Band;distance:number;recovering:boolean};
export function chooseLocalCombatGoal(state:State,candidates:ReadonlyArray<{foot:Point;existingNativePoint:boolean;localTrafficAllowed:boolean;inkRelation:F4InkRelation;coveredFromEnemy?:boolean}>,admit:(foot:Point,mode:'APPROACH'|'RETREAT'|'HOLD_RANGE')=>{reached:boolean;staticSupport:boolean;trafficAllowed:boolean;step:Point;inkRelation?:F4InkRelation;coveredFromEnemy?:boolean}|null,options?:{maxChecks?:number}):{mode:'APPROACH'|'RETREAT'|'HOLD_RANGE';step:Point;checks:number}|null;
