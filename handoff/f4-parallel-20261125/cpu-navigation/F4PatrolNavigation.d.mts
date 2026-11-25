export type PatrolPoint=Readonly<{x:number;y:number;z:number}>;
export type PatrolInk='OWN'|'NEUTRAL'|'ENEMY'|'UNKNOWN';
export interface PatrolCandidate<P extends PatrolPoint=PatrolPoint>{point:P;ink:PatrolInk;order:number;index:number}
export interface PatrolOptions{recovering?:boolean;reservations?:readonly PatrolPoint[]}
export class F4PatrolNavigation{
 beginTick(tick:number):void;
 clear(id:string):void;
 newGoal(id:string):void;
 noteStalled(id:string,tick:number,foot:PatrolPoint,goal:PatrolPoint):void;
 avoids(id:string,tick:number,foot:PatrolPoint,goal:PatrolPoint):boolean;
 noteKccReject(id:string,tick:number,foot:PatrolPoint,goal:PatrolPoint):boolean;
 noteReached(id:string,tick:number,foot:PatrolPoint):void;
 rank<P extends PatrolPoint>(id:string,tick:number,foot:PatrolPoint,candidates:readonly PatrolCandidate<P>[],allies:readonly PatrolPoint[],options?:PatrolOptions):PatrolCandidate<P>[];
}
