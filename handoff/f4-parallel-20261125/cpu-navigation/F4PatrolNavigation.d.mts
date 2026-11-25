export type PatrolPoint=Readonly<{x:number;y:number;z:number}>;
export type PatrolInk='OWN'|'NEUTRAL'|'ENEMY'|'UNKNOWN';
export interface PatrolCandidate<P extends PatrolPoint=PatrolPoint>{point:P;ink:PatrolInk;order:number;index:number}
export class F4PatrolNavigation {
 clear(id:string):void;
 noteStalled(id:string,tick:number,foot:PatrolPoint,goal:PatrolPoint):void;
 avoids(id:string,tick:number,foot:PatrolPoint,goal:PatrolPoint):boolean;
 rank<P extends PatrolPoint>(id:string,tick:number,foot:PatrolPoint,candidates:readonly PatrolCandidate<P>[],allies:readonly PatrolPoint[]):PatrolCandidate<P>[];
}
